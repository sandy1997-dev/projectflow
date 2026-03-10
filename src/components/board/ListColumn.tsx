"use client";
import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMutation } from "@apollo/client";
import { CREATE_CARD, DELETE_LIST, UPDATE_LIST } from "@/graphql/queries";
import { CardItem } from "./CardItem";
import { MoreHorizontal, Plus, Loader2, Trash2, Edit2 } from "lucide-react";
import { useSession } from "next-auth/react";

export function ListColumn({ list, board, onRefetch }: any) {
  const { data: session } = useSession();
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [listName, setListName] = useState(list.name);
  const [createCard, { loading }] = useMutation(CREATE_CARD);
  const [deleteList] = useMutation(DELETE_LIST);
  const [updateList] = useMutation(UPDATE_LIST);

  const { setNodeRef, isOver } = useDroppable({ id: list.id });
  const cardIds = list.cards.map((c: any) => c.id);

  async function handleAddCard() {
    if (!cardTitle.trim() || !session?.user?.id) return;
    try {
      await createCard({ variables: { input: { title: cardTitle.trim(), listId: list.id } } });
      setCardTitle(""); setAddingCard(false); onRefetch();
    } catch (e) { console.error(e); }
  }

  async function handleDeleteList() {
    if (!confirm(`Delete list "${list.name}" and all its cards?`)) return;
    await deleteList({ variables: { id: list.id } });
    onRefetch();
  }

  async function handleRenameList() {
    if (!listName.trim() || listName === list.name) { setEditingName(false); return; }
    await updateList({ variables: { id: list.id, input: { name: listName.trim() } } });
    setEditingName(false); onRefetch();
  }

  return (
    <div className="w-72 shrink-0 flex flex-col max-h-full">
      <div className="bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-2xl flex flex-col max-h-full">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          {editingName ? (
            <input autoFocus value={listName} onChange={(e) => setListName(e.target.value)}
              onBlur={handleRenameList} onKeyDown={(e) => { if (e.key === "Enter") handleRenameList(); if (e.key === "Escape") setEditingName(false); }}
              className="flex-1 bg-slate-800 border border-blue-500/50 rounded-lg px-2 py-1 text-white text-sm focus:outline-none" />
          ) : (
            <h3 className="flex-1 font-semibold text-slate-100 text-sm">{list.name}</h3>
          )}
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{list.cards.length}</span>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/5 transition">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-20 py-1 w-40">
                <button onClick={() => { setEditingName(true); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition">
                  <Edit2 className="w-3.5 h-3.5" /> Rename
                </button>
                <button onClick={handleDeleteList}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cards */}
        <div ref={setNodeRef} className={`flex-1 overflow-y-auto p-2 space-y-2 min-h-12 transition-colors ${isOver ? "bg-blue-500/5" : ""}`}>
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {list.cards.map((card: any) => <CardItem key={card.id} card={card} />)}
          </SortableContext>
        </div>

        {/* Add card */}
        <div className="p-2 border-t border-white/5">
          {addingCard ? (
            <div>
              <textarea autoFocus value={cardTitle} onChange={(e) => setCardTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddCard(); } if (e.key === "Escape") setAddingCard(false); }}
                placeholder="Card title..."
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none mb-2"
                rows={2}
              />
              <div className="flex gap-2">
                <button onClick={handleAddCard} disabled={loading || !cardTitle.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-1.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Add Card
                </button>
                <button onClick={() => { setAddingCard(false); setCardTitle(""); }} className="px-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition text-sm">✕</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingCard(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition text-sm">
              <Plus className="w-3.5 h-3.5" /> Add card
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
