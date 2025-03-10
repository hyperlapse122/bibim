// Returns a Duplex stream whose input and output are connected (basically a Transform)
import { Duplex, PassThrough } from 'node:stream';
import ffmpeg from 'fluent-ffmpeg';

export default function ffmpegTransform() {
  const input = new PassThrough();
  const output = new PassThrough();

  return Duplex.from({
    // previous stream writes to input
    writable: input,
    // the next stream reads from output
    readable: ffmpeg({
      logger: console,
    })
      .on('stderr', function (stderrLine) {
        if (stderrLine.length < 1) return;
        console.log('FFmpeg Stderr output: ' + stderrLine);
      })
      .input(input)
      .toFormat('opus')
      .withAudioCodec('libopus')
      .outputOption('-af', 'loudnorm=I=-16:TP=-1.5:LRA=11')
      .outputOption('-ar', '48000')
      .outputOption('-ac', '2')
      .audioBitrate('384k')
      .pipe(output),
  });
}
