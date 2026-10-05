import type { ServerWebSocket } from "bun";

import type { ClientMessage, ServerMessage } from "../shared/protocol";

import { getMeetingState } from "../state/meetingState";

type ClientData = {
  id: string;
};

const clients = new Map<string, ServerWebSocket<ClientData>>();

function send(socket: ServerWebSocket<ClientData>, message: ServerMessage) {
  socket.send(JSON.stringify(message));
}

export function broadcastState() {
  const message: ServerMessage = {
    type: "state",
    state: getMeetingState(),
  };

  const serialized = JSON.stringify(message);

  for (const socket of clients.values()) {
    socket.send(serialized);
  }
}

export function getConnectedClientCount() {
  return clients.size;
}

export const websocket = {
  open(socket: ServerWebSocket<ClientData>) {
    clients.set(socket.data.id, socket);

    console.log(`[WS] connected ${socket.data.id}`);

    console.log(`[WS] clients: ${clients.size}`);

    // Tell the browser that the connection succeeded.
    send(socket, {
      type: "connected",
    });

    // Most important part:
    // synchronize the newly connected browser
    // with the current PC state.
    send(socket, {
      type: "state",
      state: getMeetingState(),
    });
  },

  message(socket: ServerWebSocket<ClientData>, rawMessage: string | Buffer) {
    try {
      const message = JSON.parse(String(rawMessage)) as ClientMessage;

      switch (message.type) {
        case "ping":
          send(socket, {
            type: "state",
            state: getMeetingState(),
          });
          break;
      }
    } catch {
      console.error("[WS] invalid message");
    }
  },

  close(socket: ServerWebSocket<ClientData>) {
    clients.delete(socket.data.id);

    console.log(`[WS] disconnected ${socket.data.id}`);

    console.log(`[WS] clients: ${clients.size}`);
  },
};
