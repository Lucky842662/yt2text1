import { YoutubeTranscript } from 'youtube-transcript';
import fs from 'fs';

async function test() {
  try {
    const videoId = 'dQw4w9WgXcQ'; // Never Gonna Give You Up
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    fs.writeFileSync('test_yt.log', 'Success: ' + transcriptItems.length);
  } catch (err) {
    fs.writeFileSync('test_yt.log', 'Error: ' + err.toString() + '\n' + err.stack);
  }
}

test();
