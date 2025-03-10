import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-node';
import { AudioLoaderService } from '@bibim/protos/v1/audio_loader_pb';
import fs from 'node:fs';

const transport = createConnectTransport({
  baseUrl: 'http://localhost:8080',
  httpVersion: '1.1',
});

async function main() {
  const client = createClient(AudioLoaderService, transport);

  const res = client.downloadAudio({
    url: 'https://www.youtube.com/watch?v=ZlRYeom9Szc',
  });

  const fileStream = fs.createWriteStream('test.ogg');

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
}

void main();
