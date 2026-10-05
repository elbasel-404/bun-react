const INPUT_RATE = 48_000;
const OUTPUT_RATE = 16_000;

const INPUT_CHANNELS = 2;
const BYTES_PER_SAMPLE = 2;

const RATIO = INPUT_RATE / OUTPUT_RATE; // 3
const INPUT_SAMPLE_RATE = 48_000;
const OUTPUT_SAMPLE_RATE = 16_000;
const CHANNELS = 2;

export function stereo48kToMono16k(input: Buffer): Buffer {
  const inputFrameSize = CHANNELS * BYTES_PER_SAMPLE;

  const inputFrames = Math.floor(input.length / inputFrameSize);

  const outputFrames = Math.floor(
    (inputFrames * OUTPUT_SAMPLE_RATE) / INPUT_SAMPLE_RATE,
  );

  const output = Buffer.alloc(outputFrames * BYTES_PER_SAMPLE);

  for (let i = 0; i < outputFrames; i++) {
    const inputFrame = Math.floor((i * INPUT_SAMPLE_RATE) / OUTPUT_SAMPLE_RATE);

    const offset = inputFrame * inputFrameSize;

    const left = input.readInt16LE(offset);

    const right = input.readInt16LE(offset + 2);

    const mono = Math.round((left + right) / 2);

    output.writeInt16LE(mono, i * BYTES_PER_SAMPLE);
  }

  return output;
}

export class Stereo48kToMono16k {
  private pending = Buffer.alloc(0);

  push(input: Buffer): Buffer[] {
    // Keep only complete stereo frames.
    const completeLength =
      input.length - (input.length % (INPUT_CHANNELS * BYTES_PER_SAMPLE));

    if (completeLength === 0) {
      return [];
    }

    const data = Buffer.concat([
      this.pending,
      input.subarray(0, completeLength),
    ]);

    const frameCount = data.length / (INPUT_CHANNELS * BYTES_PER_SAMPLE);

    const outputFrameCount = Math.floor(frameCount / RATIO);

    if (outputFrameCount === 0) {
      this.pending = data;
      return [];
    }

    const output = Buffer.alloc(outputFrameCount * BYTES_PER_SAMPLE);

    for (let outputIndex = 0; outputIndex < outputFrameCount; outputIndex++) {
      const inputFrame = outputIndex * RATIO;

      const offset = inputFrame * INPUT_CHANNELS * BYTES_PER_SAMPLE;

      const left = data.readInt16LE(offset);

      const right = data.readInt16LE(offset + 2);

      const mono = Math.round((left + right) / 2);

      output.writeInt16LE(mono, outputIndex * BYTES_PER_SAMPLE);
    }

    const consumedFrames = outputFrameCount * RATIO;

    const consumedBytes = consumedFrames * INPUT_CHANNELS * BYTES_PER_SAMPLE;

    this.pending = data.subarray(consumedBytes);

    return [output];
  }

  flush(): Buffer[] {
    this.pending = Buffer.alloc(0);
    return [];
  }
}
