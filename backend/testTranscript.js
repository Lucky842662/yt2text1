import { fetchTranscript, extractVideoId } from './services/youtubeService.js';
import fs from 'fs';

async function test() {
  try {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const videoId = extractVideoId(url);
    
    const transcript = await fetchTranscript(videoId);
    fs.writeFileSync('test1234.log', 'Success: ' + transcript.text.length);
  } catch (err) {
    fs.writeFileSync('test1234.log', 'Error: ' + err.toString() + '\n' + err.stack);
  }
}

test();
