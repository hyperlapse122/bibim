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
    _context: HandlerContext,
  ): AsyncIterable<MessageInitShape<typeof DownloadAudioResponseSchema>> {
    if (format === AudioFormat.UNSPECIFIED)
      throw new ConnectError(
        'Audio format is not specified',
        Code.InvalidArgument,
      );

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      throw new ConnectError('Invalid URL format', Code.InvalidArgument);
    }

    const ytDlpProcess = spawn('yt-dlp', ['-f', 'bestaudio', '-o', '-', url]);

    // Optional: Handle errors or process lifecycle events
    ytDlpProcess.on('error', (error) => {
      console.error('yt-dlp:', 'yt-dlp Error:', error);
      throw new ConnectError(
        `Failed to spawn yt-dlp process: ${error.message}`,
        Code.Internal,
      );
    });

    ytDlpProcess.stderr.on('data', (data) => {
      console.error('yt-dlp stderr:', data.toString());
    });

    ytDlpProcess.on('exit', (code) => {
      console.log('yt-dlp:', 'yt-dlp Process exited with code:', code);
      if (code !== 0) {
        throw new ConnectError(
          `yt-dlp process exited with non-zero code: ${code}`,
          Code.Internal,
        );
      }
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
  }
}
