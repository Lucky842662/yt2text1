import Video from '../models/Video.js';
import User from '../models/User.js';
import { extractVideoId, getVideoMetadata, fetchTranscript } from '../services/youtubeService.js';
import { generateSummary } from '../services/aiService.js';

/**
 * @route   POST /api/videos/process
 * @desc    Process a YouTube URL: fetch transcript + generate summary
 * @access  Private
 */
export const processVideo = async (req, res, next) => {
  try {
    const { url, generateAiSummary = true } = req.body;
    const userId = req.user.id;

    // Extract video ID
    let videoId;
    try {
      videoId = extractVideoId(url);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    // Check if user already processed this video
    const existing = await Video.findOne({ userId, videoId });
    if (existing) {
      return res.status(200).json({
        message: 'Video already processed.',
        video: existing,
        alreadyExists: true,
      });
    }

    // Get video metadata
    const metadata = await getVideoMetadata(videoId);

    // Create video record with pending status
    const video = await Video.create({
      userId,
      youtubeUrl: url,
      videoId,
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      channelName: metadata.channelName,
      status: 'processing',
    });

    // Fetch transcript
    let transcriptData;
    try {
      transcriptData = await fetchTranscript(videoId);
      video.transcript = transcriptData.text;
      video.transcriptSource = transcriptData.source;
    } catch (err) {
      video.status = 'failed';
      video.errorMessage = err.message;
      await video.save();
      return res.status(422).json({ error: err.message, video });
    }

    // Generate AI summary (optional)
    if (generateAiSummary && transcriptData.text) {
      try {
        const { summary, keyPoints } = await generateSummary(transcriptData.text, metadata.title);
        video.summary = summary;
        video.keyPoints = keyPoints;
      } catch (err) {
        // Summary failure is non-fatal - save transcript without summary
        console.warn('Summary generation failed:', err.message);
        video.summary = '';
      }
    }

    video.status = 'completed';
    await video.save();

    // Increment user's processed count
    await User.findByIdAndUpdate(userId, { $inc: { videosProcessed: 1 } });

    res.status(201).json({ message: 'Video processed successfully!', video });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/videos
 * @desc    Get all videos for current user
 * @access  Private
 */
export const getUserVideos = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search = '', status } = req.query;
    const userId = req.user.id;

    const query = { userId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { channelName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const total = await Video.countDocuments(query);
    const videos = await Video.find(query)
      .select('-transcript -summary') // Exclude heavy fields from list
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      videos,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/videos/:id
 * @desc    Get a single video with full transcript
 * @access  Private
 */
export const getVideoById = async (req, res, next) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, userId: req.user.id });
    if (!video) {
      return res.status(404).json({ error: 'Video not found.' });
    }
    res.json({ video });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/videos/:id
 * @desc    Delete a video
 * @access  Private
 */
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!video) {
      return res.status(404).json({ error: 'Video not found.' });
    }
    res.json({ message: 'Video deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/videos/:id
 * @desc    Update video (tags, favorite, etc.)
 * @access  Private
 */
export const updateVideo = async (req, res, next) => {
  try {
    const { tags, isFavorite } = req.body;
    const update = {};
    if (tags !== undefined) update.tags = tags;
    if (isFavorite !== undefined) update.isFavorite = isFavorite;

    const video = await Video.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true, runValidators: true }
    );

    if (!video) return res.status(404).json({ error: 'Video not found.' });
    res.json({ message: 'Video updated.', video });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/videos/:id/regenerate-summary
 * @desc    Re-generate AI summary for a video
 * @access  Private
 */
export const regenerateSummary = async (req, res, next) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, userId: req.user.id });
    if (!video) return res.status(404).json({ error: 'Video not found.' });
    if (!video.transcript) return res.status(400).json({ error: 'No transcript available.' });

    const { summary, keyPoints } = await generateSummary(video.transcript, video.title);
    video.summary = summary;
    video.keyPoints = keyPoints;
    await video.save();

    res.json({ message: 'Summary regenerated.', video });
  } catch (error) {
    next(error);
  }
};
