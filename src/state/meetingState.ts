import type { MeetingState } from "../shared/protocol";

let state: MeetingState = {
  status: "idle",
  transcript: "",
  currentAnswer: null,
};

export function getMeetingState(): MeetingState {
  return { ...state };
}

export function updateMeetingState(update: Partial<MeetingState>) {
  state = {
    ...state,
    ...update,
  };

  return getMeetingState();
}

export function resetMeetingState() {
  state = {
    status: "idle",
    transcript: "",
    currentAnswer: null,
  };

  return getMeetingState();
}
