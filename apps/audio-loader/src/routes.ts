import { AudioLoaderService } from '@bibim/protos/v1/audio_loader_pb';
import type { ConnectRouter } from '@connectrpc/connect';
import { AudioLoaderServiceImpl } from './services/audio-loader-service-impl';

export default function(router: ConnectRouter) {
  router.service(AudioLoaderService, new AudioLoaderServiceImpl());
}
