import { GoogleGenAI, Modality } from "@google/genai";

export type TranscriptionResult = {
  text: string;
};

export type GeminiTranscriber = {
  start(): Promise<void>;
  pushAudio(data: Buffer): void;
  stop(): void;

  onResult(callback: (result: TranscriptionResult) => void): void;
};

export function createGeminiTranscriber(): GeminiTranscriber {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  let session: Awaited<ReturnType<typeof ai.live.connect>> | null = null;

  let resultCallback: ((result: TranscriptionResult) => void) | undefined;

  return {
    async start() {
      if (session) {
        return;
      }

      session = await ai.live.connect({
        model: "gemini-3.5-transcribe-live",

        config: {
          responseModalities: [Modality.TEXT],

          inputAudioTranscription: {
            languageCodes: [],
          },
        },

        callbacks: {
          onopen() {
            console.log("[STT] Gemini connected");
          },

          onmessage(message) {
            const transcription = message.serverContent?.inputTranscription;

            if (!transcription) {
              return;
            }

            const text = transcription.text;

            if (!text) {
              return;
            }

            resultCallback?.({
              text,
            });
          },

          onerror(error) {
            console.error("[STT] Gemini error:", error);
          },

          onclose(event) {
            console.log("[STT] Gemini closed:", event.reason);
          },
        },
      });
    },

    pushAudio(data) {
      if (!session) {
        return;
      }

      session.sendRealtimeInput({
        audio: {
          data: data.toString("base64"),
          mimeType: "audio/pcm;rate=16000",
        },
      });
    },

    stop() {
      if (!session) {
        return;
      }

      session.sendRealtimeInput({
        audioStreamEnd: true,
      });

      session.close();
      session = null;
    },

    onResult(callback) {
      resultCallback = callback;
    },
  };
}
