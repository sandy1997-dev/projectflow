"use client";
import { useState, useCallback } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay, closestCorners } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useMutation } from "@apollo/client";
import { MOVE_CARD, CREATE_LIST } from "@/graphql/queries";
import { ListColumn } from "./ListColumn";
import { CardItem } from "./CardItem";
import { Plus, Loader2 } from "lucide-react";
import { Board, Card } from "@/types";

interface KanbanBoardProps { board: Board; onRefetch: () => void; }

export function KanbanBoard({ board, onRefetch }: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [createList, { loading: creatingList }] = useMutation(CREATE_LIST);
  const [moveCard] = useMutation(MOVE_CARD);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const allCards = board.lists.flatMap((l) => l.cards);
    const card = allCards.find((c) => c.id === active.id);
    if (card) setActiveCard(card);
  }, [board.lists]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const cardId = active.id as string;
    let targetListId: string | null = null;
    let targetPosition = 1;

    // Check if dropped on a list or card
    for (const list of board.lists) {
      if (list.id === over.id) {
        targetListId = list.id;
        targetPosition = (list.cards.length + 1) * 1000;
        break;
      }
      const cardIdx = list.cards.findIndex((c) => c.id === over.id);
      if (cardIdx !== -1) {
        targetListId = list.id;
        const prevPos = cardIdx > 0 ? list.cards[cardIdx - 1].position : 0;
        const nextPos = cardIdx < list.cards.length - 1 ? list.cards[cardIdx + 1].position : list.cards[cardIdx].position + 1000;
        targetPosition = (prevPos + nextPos) / 2;
        break;
      }
    }

    if (!targetListId) return;
    try {
      await moveCard({ variables: { input: { cardId, listId: targetListId, position: targetPosition } } });
      onRefetch();
    } catch (e) { console.error(e); }
  }, [board.lists, moveCard, onRefetch]);

  async function handleAddList() {
    if (!newListName.trim()) return;
    try {
      await createList({ variables: { input: { name: newListName.trim(), boardId: board.id } } });
      setNewListName(""); setAddingList(false); onRefetch();
    } catch (e) { console.error(e); }
  }

  const listIds = board.lists.map((l) => l.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="board-scroll flex gap-4 p-6 items-start">
        <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
          {board.lists.map((list) => (
            <ListColumn key={list.id} list={list} board={board} onRefetch={onRefetch} />
          ))}
        </SortableContext>

        {/* Add List */}
        {addingList ? (
          <div className="w-72 shrink-0 bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
            <input autoFocus value={newListName} onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddList(); if (e.key === "Escape") setAddingList(false); }}
              placeholder="List name..."
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-2"
            />
            <div className="flex gap-2">
              <button onClick={handleAddList} disabled={creatingList || !newListName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5">
                {creatingList ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Add List
              </button>
              <button onClick={() => { setAddingList(false); setNewListName(""); }}
                className="px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingList(true)}
            className="w-72 shrink-0 h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-2xl text-slate-400 hover:text-white transition text-sm font-medium">
            <Plus className="w-4 h-4" /> Add List
          </button>
        )}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="rotate-3 opacity-90 w-72">
            <CardItem card={activeCard} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
