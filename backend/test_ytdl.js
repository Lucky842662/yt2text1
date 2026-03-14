import ytdl from '@distube/ytdl-core';
import fs from 'fs';

async function test() {
  const videoId = 'dQw4w9WgXcQ';
  try {
    const stream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
      filter: 'audioonly',
      quality: 'highestaudio',
    });
    const file = fs.createWriteStream('test_audio.webm');
    stream.pipe(file);
    stream.on('error', (err) => {
        console.error('Stream Error:', err);
    });
    file.on('finish', () => console.log('Finished'));
  } catch (err) {
    console.error('Catch Error:', err);
  }
}

test();
