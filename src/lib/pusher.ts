import Pusher from "pusher";
import PusherJS from "pusher-js";

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance (singleton)
let pusherClient: PusherJS | null = null;

export function getPusherClient(): PusherJS {
  if (!pusherClient) {
    pusherClient = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return pusherClient;
}

// Channel naming helpers
export const CHANNELS = {
  board: (boardId: string) => `board-${boardId}`,
  workspace: (workspaceId: string) => `workspace-${workspaceId}`,
  user: (userId: string) => `user-${userId}`,
};

export const EVENTS = {
  CARD_CREATED: "card:created",
  CARD_UPDATED: "card:updated",
  CARD_DELETED: "card:deleted",
  CARD_MOVED: "card:moved",
  LIST_CREATED: "list:created",
  LIST_UPDATED: "list:updated",
  LIST_DELETED: "list:deleted",
  COMMENT_ADDED: "comment:added",
  BOARD_UPDATED: "board:updated",
  MEMBER_JOINED: "member:joined",
  NOTIFICATION: "notification",
};
