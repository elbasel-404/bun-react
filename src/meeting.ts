import { createAudioCapture } from "./audio/capture";

import { broadcastState } from "./server/websocket";
import { updateMeetingState } from "./state/meetingState";
import { createGeminiTranscriber } from "./stt/geminiTranscriber";

const capture = createAudioCapture();

const transcriber = createGeminiTranscriber();

transcriber.onResult(({ text }) => {
  console.log("[Transcript]", text);

  updateMeetingState({
    status: "listening",
    transcript: text,
  });

  broadcastState();
});

export async function startMeeting() {
  await transcriber.start();

  capture.onChunk((chunk) => {
    const pcm16k = stereo48kToMono16k(chunk.data);

    transcriber.pushAudio(pcm16k);
  });

  capture.start();

  updateMeetingState({
    status: "listening",
  });

  broadcastState();
}

export function stopMeeting() {
  capture.stop();
  transcriber.stop();

  updateMeetingState({
    status: "idle",
  });

  broadcastState();
}
