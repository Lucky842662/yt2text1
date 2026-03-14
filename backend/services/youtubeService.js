import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';
import ytdl from '@distube/ytdl-core';
import OpenAI from 'openai';

const createAudioClient = () => {
  const baseURL = process.env.OPENAI_AUDIO_BASE_URL || process.env.OPENAI_BASE_URL || undefined;
  const isOpenRouter = !!baseURL && baseURL.includes('openrouter.ai');
  const apiKey = process.env.OPENAI_AUDIO_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  if (isOpenRouter && !process.env.OPENAI_AUDIO_API_KEY) {
    throw new Error(
      'Whisper requires OpenAI audio access. Set OPENAI_AUDIO_API_KEY and OPENAI_AUDIO_BASE_URL=https://api.openai.com/v1.'
    );
  }

  return new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders: isOpenRouter
      ? {
          ...(process.env.OPENROUTER_API_KEY
            ? { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }
            : {}),
          ...(process.env.OPENROUTER_REFERER ? { 'HTTP-Referer': process.env.OPENROUTER_REFERER } : {}),
          ...(process.env.OPENROUTER_TITLE ? { 'X-Title': process.env.OPENROUTER_TITLE } : {}),
        }
      : undefined,
  });
};

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, etc.
 */
export const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  throw new Error('Invalid YouTube URL. Please provide a valid YouTube video link.');
};

/**
 * Get video metadata from YouTube oEmbed API (no API key needed)
 */
export const getVideoMetadata = async (videoId) => {
  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await axios.get(oEmbedUrl, { timeout: 10000 });

    return {
      title: response.data.title || 'Untitled Video',
      channelName: response.data.author_name || '',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch (error) {
    // Fallback metadata
    return {
      title: 'Untitled Video',
      channelName: '',
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
};

/**
 * Fetch transcript from YouTube using youtube-transcript library
 */
export const fetchTranscript = async (videoId, lang = 'en') => {
  try {
    // Attempt to fetch in preferred language
    let transcriptItems;
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, { lang });
    } catch {
      // Fallback: fetch without language preference
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    }

    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error('No transcript available for this video.');
    }

    // Combine all transcript segments into clean text
    const fullText = transcriptItems
      .map((item) => item.text)
      .join(' ')
      .replace(/\[.*?\]/g, '') // Remove [Music], [Applause], etc.
      .replace(/\s+/g, ' ')
      .trim();

    return {
      text: fullText,
      source: 'youtube',
      segments: transcriptItems,
    };
  } catch (error) {
    const message = error?.message || 'Failed to fetch transcript';
    const shouldFallback =
      message.includes('Could not get transcripts') ||
      message.includes('Transcript is disabled') ||
      message.includes('No transcript available');

    if (shouldFallback) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error(
          'This video does not have captions available and Whisper is not configured. ' +
          'Set OPENAI_API_KEY to enable fallback.'
        );
      }

      const audioPath = await downloadAudioForWhisper(videoId);
      try {
        const text = await transcribeWithWhisper(audioPath);
        return { text, source: 'whisper', segments: [] };
      } finally {
        fs.promises.unlink(audioPath).catch(() => {});
      }
    }

    throw error;
  }
};

export const downloadAudioForWhisper = async (videoId) => {
  const outputPath = path.join(os.tmpdir(), `yt2text-${videoId}-${Date.now()}.webm`);

  return new Promise(async (resolve, reject) => {
    try {
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      // Fetch video info first to manually choose the best available format
      const info = await ytdl.getInfo(url);
      
      // 1. Try audio-only, prioritizing lowest quality to save bandwidth and fit OpenAI's 25MB limit
      let format = ytdl.chooseFormat(info.formats, { quality: 'lowestaudio', filter: 'audioonly' });
      
      // 2. If 'lowestaudio' fails, try any audio-only format
      if (!format) {
        format = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });
      }
      
      // 3. If no audio-only format exists, fallback to any format with audio and video
      if (!format) {
        format = ytdl.chooseFormat(info.formats, { filter: 'audioandvideo' });
      }
      
      if (!format) {
        throw new Error('cant find a playable format for this video');
      }

      const stream = ytdl.downloadFromInfo(info, { format, highWaterMark: 1 << 25 });
      const file = fs.createWriteStream(outputPath);

      stream.on('error', reject);
      file.on('error', reject);
      file.on('finish', () => resolve(outputPath));

      stream.pipe(file);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * PLACEHOLDER: Transcribe audio with Whisper
 */
export const transcribeWithWhisper = async (audioPath) => {
  const openai = createAudioClient();
  const audioStream = fs.createReadStream(audioPath);

  const response = await openai.audio.transcriptions.create({
    file: audioStream,
    model: 'whisper-1',
  });

  return response.text;
};
