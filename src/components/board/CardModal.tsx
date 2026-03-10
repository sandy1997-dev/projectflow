"use client";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CARD, UPDATE_CARD, DELETE_CARD, CREATE_COMMENT, DELETE_COMMENT, CREATE_CHECKLIST, ADD_CHECKLIST_ITEM, TOGGLE_CHECKLIST_ITEM, ADD_LABEL, REMOVE_LABEL } from "@/graphql/queries";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useBoardStore } from "@/store/boardStore";
import { X, Calendar, User, Tag, CheckSquare, Paperclip, MessageSquare, Trash2, Plus, Flag, Loader2, AlignLeft, Clock } from "lucide-react";
import { formatDate, formatRelativeDate, isOverdue, cn, PRIORITY_COLORS, STATUS_COLORS } from "@/lib/utils";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export function CardModal({ cardId, boardMembers, labels: boardLabels, onClose }: any) {
  const { data: session } = useSession();
  const { data, loading, refetch } = useQuery(GET_CARD, { variables: { id: cardId } });
  const [updateCard] = useMutation(UPDATE_CARD);
  const [deleteCard] = useMutation(DELETE_CARD);
  const [createComment] = useMutation(CREATE_COMMENT);
  const [deleteComment] = useMutation(DELETE_COMMENT);
  const [createChecklist] = useMutation(CREATE_CHECKLIST);
  const [addChecklistItem] = useMutation(ADD_CHECKLIST_ITEM);
  const [toggleItem] = useMutation(TOGGLE_CHECKLIST_ITEM);
  const [addLabel] = useMutation(ADD_LABEL);
  const [removeLabel] = useMutation(REMOVE_LABEL);
  const [comment, setComment] = useState("");
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [editDesc, setEditDesc] = useState(false);
  const [desc, setDesc] = useState("");
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [newItemContent, setNewItemContent] = useState<Record<string, string>>({});

  const card = data?.card;

  async function handleUpdate(field: string, value: any) {
    await updateCard({ variables: { id: cardId, input: { [field]: value } } });
    refetch();
  }

  async function handleDelete() {
    if (!confirm("Delete this card?")) return;
    await deleteCard({ variables: { id: cardId } });
    onClose();
  }

  async function handleComment() {
    if (!comment.trim()) return;
    await createComment({ variables: { input: { content: comment.trim(), cardId } } });
    setComment(""); refetch();
  }

  async function handleCreateChecklist() {
    if (!newChecklistTitle.trim()) return;
    await createChecklist({ variables: { cardId, title: newChecklistTitle.trim() } });
    setNewChecklistTitle(""); setAddingChecklist(false); refetch();
  }

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    </div>
  );

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Cover */}
        {card.coverColor && <div className="h-8 w-full rounded-t-2xl" style={{ background: card.coverColor }} />}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-6">
            <div className="flex-1">
              {editTitle ? (
                <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => { handleUpdate("title", title); setEditTitle(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { handleUpdate("title", title); setEditTitle(false); } }}
                  className="w-full bg-slate-800 border border-blue-500/50 rounded-xl px-3 py-2 text-white font-semibold text-lg focus:outline-none"
                />
              ) : (
                <h2 onClick={() => { setTitle(card.title); setEditTitle(true); }}
                  className="text-white font-bold text-xl cursor-pointer hover:text-blue-300 transition">{card.title}</h2>
              )}
              <p className="text-slate-500 text-sm mt-1">in <span className="text-slate-400">{card.list?.name}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDelete} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Main content */}
            <div className="col-span-2 space-y-5">
              {/* Description */}
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
                  <AlignLeft className="w-4 h-4" /> Description
                </div>
                {editDesc ? (
                  <div>
                    <textarea autoFocus value={desc} onChange={(e) => setDesc(e.target.value)}
                      className="w-full bg-slate-800 border border-blue-500/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none resize-none min-h-24" rows={4} />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => { handleUpdate("description", desc); setEditDesc(false); }}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg transition">Save</button>
                      <button onClick={() => setEditDesc(false)} className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/5 transition">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => { setDesc(card.description || ""); setEditDesc(true); }}
                    className="text-sm text-slate-400 hover:text-slate-300 cursor-pointer p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition min-h-12">
                    {card.description || <span className="italic text-slate-600">Click to add description...</span>}
                  </div>
                )}
              </div>

              {/* Checklists */}
              {card.checklists?.map((cl: any) => (
                <div key={cl.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                      <CheckSquare className="w-4 h-4" /> {cl.title}
                      <span className="text-xs text-slate-500">{cl.progress}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full mb-3">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${cl.progress}%` }} />
                  </div>
                  <div className="space-y-1.5">
                    {cl.items.map((item: any) => (
                      <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                        <input type="checkbox" checked={item.isCompleted}
                          onChange={() => { toggleItem({ variables: { id: item.id } }); refetch(); }}
                          className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50" />
                        <span className={cn("text-sm flex-1", item.isCompleted ? "line-through text-slate-500" : "text-slate-200")}>{item.content}</span>
                      </label>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input value={newItemContent[cl.id] || ""} onChange={(e) => setNewItemContent(prev => ({ ...prev, [cl.id]: e.target.value }))}
                        placeholder="Add item..." onKeyDown={async (e) => {
                          if (e.key === "Enter" && newItemContent[cl.id]?.trim()) {
                            await addChecklistItem({ variables: { checklistId: cl.id, content: newItemContent[cl.id] } });
                            setNewItemContent(prev => ({ ...prev, [cl.id]: "" })); refetch();
                          }
                        }}
                        className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                    </div>
                  </div>
                </div>
              ))}

              {addingChecklist && (
                <div className="space-y-2">
                  <input autoFocus value={newChecklistTitle} onChange={(e) => setNewChecklistTitle(e.target.value)}
                    placeholder="Checklist title..."
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                  <div className="flex gap-2">
                    <button onClick={handleCreateChecklist} className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg transition">Add</button>
                    <button onClick={() => setAddingChecklist(false)} className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/5 transition">Cancel</button>
                  </div>
                </div>
              )}

              {/* Comments */}
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-3">
                  <MessageSquare className="w-4 h-4" /> Comments ({card.comments?.length ?? 0})
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {session?.user?.name?.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" rows={2} />
                    {comment && (
                      <button onClick={handleComment} className="mt-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded-lg transition">Post</button>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {card.comments?.map((c: any) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.author.name?.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{c.author.name}</span>
                          <span className="text-xs text-slate-500">{formatRelativeDate(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-300 mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Assignee */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Assignee</p>
                <select value={card.assignee?.id || ""} onChange={(e) => handleUpdate("assigneeId", e.target.value || null)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option value="">Unassigned</option>
                  {boardMembers.map((m: any) => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                </select>
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Priority</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRIORITIES.map((p) => (
                    <button key={p} onClick={() => handleUpdate("priority", p)}
                      className={cn("text-xs py-1.5 rounded-lg font-medium transition border",
                        card.priority === p ? "border-blue-500/50 bg-blue-500/15 text-blue-400" : "border-white/5 bg-slate-800/60 text-slate-400 hover:border-white/10 hover:text-slate-300")}>
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Status</p>
                <select value={card.status} onChange={(e) => handleUpdate("status", e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Due Date</p>
                <input type="date" value={card.dueDate ? card.dueDate.split("T")[0] : ""}
                  onChange={(e) => handleUpdate("dueDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                {card.dueDate && (
                  <p className={cn("text-xs mt-1", isOverdue(card.dueDate) ? "text-red-400" : "text-slate-500")}>
                    {isOverdue(card.dueDate) ? "⚠ Overdue · " : ""}{formatDate(card.dueDate)}
                  </p>
                )}
              </div>

              {/* Labels */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Labels</p>
                <div className="space-y-1.5">
                  {boardLabels.map((label: any) => {
                    const isActive = card.labels?.some((l: any) => l.id === label.id);
                    return (
                      <button key={label.id} onClick={() => isActive ? removeLabel({ variables: { cardId, labelId: label.id } }).then(() => refetch()) : addLabel({ variables: { cardId, labelId: label.id } }).then(() => refetch())}
                        className={cn("w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition border",
                          isActive ? "border-white/20 bg-white/5" : "border-white/5 hover:border-white/10")}>
                        <span className="w-4 h-4 rounded-full shrink-0" style={{ background: label.color }} />
                        <span className="text-slate-300 flex-1 text-left">{label.name}</span>
                        {isActive && <span className="text-blue-400">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add checklist button */}
              <button onClick={() => setAddingChecklist(true)}
                className="w-full flex items-center gap-2 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-white/5 hover:border-white/10 px-3 py-2 rounded-xl transition">
                <CheckSquare className="w-3.5 h-3.5" /> Add Checklist
              </button>

              {/* Cover color */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Cover</p>
                <div className="flex gap-1.5 flex-wrap">
                  {["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"].map((color) => (
                    <button key={color} onClick={() => handleUpdate("coverColor", card.coverColor === color ? null : color)}
                      className={cn("w-7 h-7 rounded-lg border-2 transition", card.coverColor === color ? "border-white" : "border-transparent")}
                      style={{ background: color }} />
                  ))}
                </div>
              </div>

              {/* Created */}
              <div className="text-xs text-slate-600 space-y-1">
                <p>Created {formatRelativeDate(card.createdAt)}</p>
                <p>by {card.creator?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
