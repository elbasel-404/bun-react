import { spawn } from "bun";

import type { AudioChunk } from "./types";

const AUDIO_TARGET = "alsa_output.pci-0000_00_1f.3.analog-stereo.monitor";

const SAMPLE_RATE = 48_000;
const CHANNELS = 2;

export type AudioCapture = {
  start(): void;
  stop(): void;
  onChunk(callback: (chunk: AudioChunk) => void): void;
};

export function createAudioCapture(): AudioCapture {
  let process: ReturnType<typeof spawn> | null = null;

  let chunkCallback: ((chunk: AudioChunk) => void) | undefined;

  return {
    start() {
      if (process) {
        return;
      }

      const child = spawn(
        [
          "pw-record",
          "--target",
          AUDIO_TARGET,
          "--raw",
          "--rate",
          String(SAMPLE_RATE),
          "--channels",
          String(CHANNELS),
          "--format",
          "s16",
          "-",
        ],
        {
          stdout: "pipe",
          stderr: "pipe",
          stdin: "ignore",
        },
      );

      process = child;

      console.log("[Audio] capture started");

      const stdout = child.stdout;

      if (typeof stdout === "number") {
        throw new Error("[Audio] stdout was not configured as a stream");
      }

      void consumeAudio(stdout);
    },

    stop() {
      if (!process) {
        return;
      }

      process.kill();
      process = null;

      console.log("[Audio] capture stopped");
    },

    onChunk(callback) {
      chunkCallback = callback;
    },
  };

  async function consumeAudio(stream: ReadableStream<Uint8Array>) {
    const reader = stream.getReader();

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        if (!value || value.byteLength === 0) {
          continue;
        }

        chunkCallback?.({
          data: Buffer.from(value),
          sampleRate: SAMPLE_RATE,
          channels: CHANNELS,
          format: "s16",
        });
      }
    } catch (error) {
      console.error("[Audio] stream error:", error);
    } finally {
      reader.releaseLock();
    }
  }
}
