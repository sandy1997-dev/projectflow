import { useEffect } from "react";
import { useApolloClient } from "@apollo/client";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import { GET_BOARD } from "@/graphql/queries";

export function useBoardRealtime(boardId: string) {
  const client = useApolloClient();

  useEffect(() => {
    if (!boardId) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(CHANNELS.board(boardId));

    const refetchBoard = () => {
      client.refetchQueries({ include: [GET_BOARD] });
    };

    channel.bind(EVENTS.CARD_CREATED, refetchBoard);
    channel.bind(EVENTS.CARD_UPDATED, refetchBoard);
    channel.bind(EVENTS.CARD_DELETED, refetchBoard);
    channel.bind(EVENTS.CARD_MOVED, refetchBoard);
    channel.bind(EVENTS.LIST_CREATED, refetchBoard);
    channel.bind(EVENTS.LIST_UPDATED, refetchBoard);
    channel.bind(EVENTS.LIST_DELETED, refetchBoard);
    channel.bind(EVENTS.COMMENT_ADDED, refetchBoard);
    channel.bind(EVENTS.BOARD_UPDATED, refetchBoard);

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNELS.board(boardId));
    };
  }, [boardId, client]);
}
