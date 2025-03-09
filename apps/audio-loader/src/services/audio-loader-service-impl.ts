import type { HandlerContext, ServiceImpl } from '@connectrpc/connect';
import {
  AudioLoaderService,
  type DownloadAudioRequest,
  DownloadAudioResponseSchema,
} from '@bibim/protos/v1/audio_loader_pb';
import ffmpeg from 'fluent-ffmpeg';
import { Duplex, PassThrough } from 'node:stream';
import type { MessageInitShape } from '@bufbuild/protobuf';
import { pipeline } from 'stream';
import { spawn } from 'child_process';

export class AudioLoaderServiceImpl
  implements ServiceImpl<typeof AudioLoaderService>
{
  async *downloadAudio(
    { url }: DownloadAudioRequest,
    {}: HandlerContext,
  ): AsyncIterable<MessageInitShape<typeof DownloadAudioResponseSchema>> {
    try {
      const ytDlpProcess = spawn('yt-dlp', ['-f', 'bestaudio', '-o', '-', url]);

      // Optional: Handle errors or process lifecycle events
      ytDlpProcess.on('error', (error) => {
        console.error('yt-dlp:', 'yt-dlp Error:', error);
      });

      ytDlpProcess.on('exit', (code) => {
        console.log('yt-dlp:', 'yt-dlp Process exited with code:', code);
      });
      const transform = getFfmpegTransform();

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

// Returns a Duplex stream whose input and output are connected (basically a Transform)
//
function getFfmpegTransform() {
  const input = new PassThrough();
  const output = new PassThrough();

  ffmpeg({
    logger: console,
  })
    .on('stderr', function (stderrLine) {
      console.log('FFmpeg Stderr output: ' + stderrLine);
    })
    .input(input)
    .toFormat('opus')
    .withAudioCodec('libopus')
    .outputOption('-af', 'loudnorm=I=-16:TP=-1.5:LRA=11')
    .outputOption('-ar', '48000')
    .outputOption('-ac', '2')
    .audioBitrate('384k')
    .output(output)
    .run();

  return Duplex.from({
    // previous stream writes to input
    writable: input,
    // the next stream reads from output
    readable: output,
  });
}
