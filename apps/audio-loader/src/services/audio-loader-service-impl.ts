import type { ServiceImpl } from '@connectrpc/connect';
import { AudioLoaderService, type DownloadAudioRequest } from '@bibim/protos/v1/audio_loader_pb';

export class AudioLoaderServiceImpl
  implements ServiceImpl<typeof AudioLoaderService> {
  async* downloadAudio(req: DownloadAudioRequest) {
    console.log(req);
    yield {
      audio: new Uint8Array(),
    };
  }
}
