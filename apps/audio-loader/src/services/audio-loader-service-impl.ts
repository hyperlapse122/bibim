import {
  Code,
  ConnectError,
  type HandlerContext,
  type ServiceImpl,
} from '@connectrpc/connect';
import {
  AudioFormat,
  AudioLoaderService,
  type DownloadAudioRequest,
  DownloadAudioResponseSchema,
} from '@bibim/protos/v1/audio_loader_pb';
import { PassThrough } from 'node:stream';
import type { MessageInitShape } from '@bufbuild/protobuf';
import { pipeline } from 'stream';
import { spawn } from 'child_process';
import ffmpegTransform from '../utils/ffmpeg-transform';

export class AudioLoaderServiceImpl
  implements ServiceImpl<typeof AudioLoaderService>
{
  async *downloadAudio(
    { url, format }: DownloadAudioRequest,
    {}: HandlerContext,
  ): AsyncIterable<MessageInitShape<typeof DownloadAudioResponseSchema>> {
    if (format === AudioFormat.UNSPECIFIED)
      throw new ConnectError(
        'Audio format is not specified',
        Code.InvalidArgument,
      );

    try {
      const ytDlpProcess = spawn('yt-dlp', ['-f', 'bestaudio', '-o', '-', url]);

      // Optional: Handle errors or process lifecycle events
      ytDlpProcess.on('error', (error) => {
        console.error('yt-dlp:', 'yt-dlp Error:', error);
      });

      ytDlpProcess.on('exit', (code) => {
        console.log('yt-dlp:', 'yt-dlp Process exited with code:', code);
      });
      const transform = ffmpegTransform();

      const destination = pipeline(
        ytDlpProcess.stdout,
        new PassThrough(),
        transform,
        console.error,
      );

      let chunkId = 0;
      for await (const chunk of destination) {
        yield {
          audio: new Uint8Array(chunk),
          chunkId: BigInt(chunkId++),
        };
      }
    } catch (e) {
      console.error(e);
    }
  }
}
