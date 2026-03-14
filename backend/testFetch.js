import fs from 'fs';

async function testFetchTranscript() {
  const videoId = 'dQw4w9WgXcQ';
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const html = await response.text();
    
    // Look for captionTracks
    const regex = /"captionTracks":(\[.*?\])/;
    const match = regex.exec(html);
    
    if (match && match[1]) {
      const tracks = JSON.parse(match[1]);
      const englishTrack = tracks.find(t => t.vssId === '.en') || tracks.find(t => t.vssId.includes('en')) || tracks[0];
      
      const xmlResponse = await fetch(englishTrack.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      const xmlText = await xmlResponse.text();
      fs.writeFileSync('test_xml.log', xmlText);
      fs.writeFileSync('test_fetch.log', 'Saved XML to test_xml.log, length: ' + xmlText.length + '\nURL: ' + englishTrack.baseUrl);
    } else {
      fs.writeFileSync('test_fetch.log', 'Error: captionTracks not found in HTML.');
      // Also write parts of the HTML to see what's there
      fs.writeFileSync('test_fetch_html.log', html);
    }
  } catch (err) {
    fs.writeFileSync('test_fetch.log', 'Exception: ' + err.toString());
  }
}

testFetchTranscript();
