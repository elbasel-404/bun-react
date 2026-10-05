export type TranscriptionResult = {
  text: string;
  isFinal: boolean;
};

export interface Transcriber {
  start(): Promise<void>;

  pushAudio(data: Buffer): Promise<void>;

  stop(): Promise<void>;

  onResult(callback: (result: TranscriptionResult) => void): void;
}
