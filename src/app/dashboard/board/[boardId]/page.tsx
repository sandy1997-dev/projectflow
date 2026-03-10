"use client";
import { useQuery } from "@apollo/client";
import { GET_BOARD } from "@/graphql/queries";
import { useBoardRealtime } from "@/hooks/useRealtime";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { BoardHeader } from "@/components/board/BoardHeader";
import { CardModal } from "@/components/board/CardModal";
import { useBoardStore } from "@/store/boardStore";
import { Loader2 } from "lucide-react";

export default function BoardPage({ params }: { params: { boardId: string } }) {
  const { boardId } = params;
  const { isCardModalOpen, activeCardId, closeCardModal } = useBoardStore();
  const { data, loading, error, refetch } = useQuery(GET_BOARD, { variables: { id: boardId }, skip: !boardId });
  useBoardRealtime(boardId);

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-slate-950">
      <div className="flex items-center gap-3 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
        <span>Loading board...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full bg-slate-950">
      <div className="text-center">
        <p className="text-red-400 font-medium mb-2">Failed to load board</p>
        <p className="text-slate-500 text-sm mb-4">{error.message}</p>
        <button onClick={() => refetch()} className="text-blue-400 hover:text-blue-300 text-sm bg-blue-500/10 px-4 py-2 rounded-xl">Try again</button>
      </div>
    </div>
  );

  const board = data?.board;
  if (!board) return null;

  return (
    <div className="flex flex-col h-full relative" style={{ background: board.background?.startsWith("linear") ? board.background : board.background || "#0f172a" }}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full">
        <BoardHeader board={board} onRefetch={refetch} />
        <KanbanBoard board={board} onRefetch={refetch} />
      </div>
      {isCardModalOpen && activeCardId && (
        <CardModal cardId={activeCardId} boardMembers={board.workspace?.members ?? []} labels={board.labels ?? []} onClose={closeCardModal} />
      )}
    </div>
  );
}
