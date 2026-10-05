export type MeetingStatus = "idle" | "listening" | "processing";

export type MeetingState = {
  status: MeetingStatus;
  transcript: string;
  currentAnswer: string | null;
};

export type ServerMessage =
  | {
      type: "connected";
    }
  | {
      type: "state";
      state: MeetingState;
    };

export type ClientMessage = {
  type: "ping";
};
