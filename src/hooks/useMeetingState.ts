import { useEffect, useState } from "react";

import type { MeetingState, ServerMessage } from "../shared/protocol";

const initialState: MeetingState = {
  status: "idle",
  transcript: "",
  currentAnswer: null,
};

export function useMeetingState() {
  const [state, setState] = useState<MeetingState>(initialState);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";

    const socket = new WebSocket(`${protocol}//${location.host}/ws`);

    let disposed = false;

    const handleOpen = () => {
      if (disposed) {
        return;
      }

      setConnected(true);
    };

    const handleClose = () => {
      if (disposed) {
        return;
      }

      setConnected(false);
    };

    const handleError = () => {
      if (disposed) {
        return;
      }

      setConnected(false);
    };

    const handleMessage = (event: MessageEvent) => {
      if (disposed) {
        return;
      }

      const message = JSON.parse(event.data) as ServerMessage;

      if (message.type === "state") {
        setState(message.state);
      }
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("error", handleError);
    socket.addEventListener("message", handleMessage);

    return () => {
      disposed = true;

      socket.removeEventListener("open", handleOpen);

      socket.removeEventListener("close", handleClose);

      socket.removeEventListener("error", handleError);

      socket.removeEventListener("message", handleMessage);

      // Don't close a socket that hasn't
      // successfully established yet.
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CLOSING
      ) {
        socket.close();
      }
    };
  }, []);

  return {
    state,
    connected,
  };
}
