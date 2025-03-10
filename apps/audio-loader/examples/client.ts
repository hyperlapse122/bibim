import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-node';
import { AudioLoaderService } from '@bibim/protos/v1/audio_loader_pb';
import fs from 'node:fs';

const baseUrl = process.env.API_URL || 'http://localhost:8080';
const transport = createConnectTransport({
  baseUrl,
  httpVersion: '1.1',
});

async function main() {
  const client = createClient(AudioLoaderService, transport);

  const res = client.downloadAudio({
    url: 'https://www.youtube.com/watch?v=ZlRYeom9Szc',
  });

  const outputFile = process.argv[3] || 'test.ogg';
  const fileStream = fs.createWriteStream(outputFile);
  
  try {
    for await (const message of res) {
      await new Promise<void>((resolve, reject) =>
        fileStream.write(message.audio, 'binary', (e) => {
          if (e) {
            reject(e);
            return;
          }
          resolve();
        }),
      );
    }
    // Close the file stream after writing is complete
    fileStream.end();
    console.log(`Download complete! File saved as ${outputFile}`);
  } catch (error) {
    console.error('Error downloading audio:', error);
    fileStream.end();
  }
}

void main();
