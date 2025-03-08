import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-node';
import { AudioLoaderService } from '@bibim/protos/v1/audio_loader_pb';

const transport = createConnectTransport({
  baseUrl: 'http://localhost:8080',
  httpVersion: '1.1',
});

async function main() {
  /**
   @type {import('@connectrpc/connect').Client<typeof AudioLoaderService>}
   */
  const client = createClient(AudioLoaderService, transport);

  /**
   *
   * @type {AsyncIterable<import('@connectrpc/connect').MessageShape<import('@bibim/protos/v1/audio_loader_pb').DownloadAudioResponse>>}
   */
  const res = (await client.downloadAudio({ url: 'https://www.youtube.com/watch?v=zi7-jk4LdX0' }));

  for await (const message of res) {
    console.log(message);
  }
}

void main();
