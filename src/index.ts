import { serve } from "bun";
import index from "./index.html";
import { updateMeetingState } from "./state/meetingState";
import { broadcastState } from "./server/websocket";
import { startMeeting } from "./meeting";

import { getConnectedClientCount, websocket } from "./server/websocket";

import { getMeetingState } from "./state/meetingState";

const server = serve({
  port: 8787,
  hostname: "0.0.0.0",

  routes: {
    "/": index,

    "/api/health": {
      GET() {
        return Response.json({
          status: "ok",
          clients: getConnectedClientCount(),
          state: getMeetingState(),
        });
      },
    },
  },

  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(req, {
        data: {
          id: crypto.randomUUID(),
        },
      });

      if (upgraded) {
        return;
      }

      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    return new Response("Not found", {
      status: 404,
    });
  },

  websocket,

  development:
    process.env.NODE_ENV !== "production"
      ? {
          hmr: true,
          console: true,
        }
      : undefined,
});

let counter = 0;

setInterval(() => {
  counter++;

  updateMeetingState({
    status: "listening",
    transcript: `This is transcript update ${counter}`,
    currentAnswer: `This is AI answer ${counter}`,
  });

  broadcastState();
}, 2000);
startMeeting().catch((error) => {
  console.error("Failed to start meeting:", error);
});

console.log(`🚀 Meeting Assistant: ${server.url}`);
