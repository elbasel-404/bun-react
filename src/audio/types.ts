export type AudioChunk = {
  data: Buffer;
  sampleRate: number;
  channels: number;
  format: "s16";
};
