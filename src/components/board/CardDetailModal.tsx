'use client'
// src/components/board/CardDetailModal.tsx
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import {
  GET_CARD, UPDATE_CARD, DELETE_CARD, ASSIGN_CARD, UNASSIGN_CARD,
  ADD_COMMENT, UPDATE_COMMENT, DELETE_COMMENT, CREATE_CHECKLIST,
  ADD_CHECKLIST_ITEM, TOGGLE_CHECKLIST_ITEM, DELETE_CHECKLIST_ITEM,
  ADD_LABEL, REMOVE_LABEL, CREATE_LABEL
} from '@/graphql/operations'
import { format } from 'date-fns'
import {
  X, Trash2, User, Tag, CheckSquare, MessageSquare,
  Clock, Flag, Edit2, Check, Plus, MoreHorizontal,
  Loader2, AlertCircle, ChevronDown, Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PRIORITIES = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'] as const
const PRIORITY_COLORS: Record<string, string> = {
  NONE: 'text-muted-foreground', LOW: 'text-blue-400', MEDIUM: 'text-yellow-400',
  HIGH: 'text-orange-400', URGENT: 'text-red-400'
}
const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done', BLOCKED: 'Blocked'
}
const LABEL_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899']

interface Props {
  cardId: string
  onClose: () => void
  onUpdated: () => void
  boardMembers: any[]
  boardLabels: any[]
}

export function CardDetailModal({ cardId, onClose, onUpdated, boardMembers, boardLabels }: Props) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [titleVal, setTitleVal] = useState('')
  const [descVal, setDescVal] = useState('')
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [newChecklistTitle, setNewChecklistTitle] = useState('')
  const [addingChecklist, setAddingChecklist] = useState(false)
  const [newItemText, setNewItemText] = useState<Record<string, string>>({})
  const [addingLabelName, setAddingLabelName] = useState('')
  const [addingLabelColor, setAddingLabelColor] = useState(LABEL_COLORS[0])
  const [showLabelCreate, setShowLabelCreate] = useState(false)
  const [activeTab, setActiveTab] = useState<'activity' | 'checklist'>('activity')

  const { data, loading, refetch } = useQuery(GET_CARD, {
    variables: { id: cardId },
    onCompleted: (d) => {
      setTitleVal(d.card?.title || '')
      setDescVal(d.card?.description || '')
    }
  })

  const [updateCard] = useMutation(UPDATE_CARD, { onCompleted: () => { refetch(); onUpdated() } })
  const [deleteCard] = useMutation(DELETE_CARD, { onCompleted: () => { onClose(); onUpdated() } })
  const [assignCard] = useMutation(ASSIGN_CARD, { onCompleted: refetch })
  const [unassignCard] = useMutation(UNASSIGN_CARD, { onCompleted: refetch })
  const [addComment] = useMutation(ADD_COMMENT, { onCompleted: refetch })
  const [updateComment] = useMutation(UPDATE_COMMENT, { onCompleted: refetch })
  const [deleteComment] = useMutation(DELETE_COMMENT, { onCompleted: refetch })
  const [createChecklist] = useMutation(CREATE_CHECKLIST, { onCompleted: refetch })
  const [addChecklistItem] = useMutation(ADD_CHECKLIST_ITEM, { onCompleted: refetch })
  const [toggleChecklistItem] = useMutation(TOGGLE_CHECKLIST_ITEM, { onCompleted: refetch })
  const [deleteChecklistItem] = useMutation(DELETE_CHECKLIST_ITEM, { onCompleted: refetch })
  const [addLabel] = useMutation(ADD_LABEL, { onCompleted: refetch })
  const [removeLabel] = useMutation(REMOVE_LABEL, { onCompleted: refetch })
  const [createLabel] = useMutation(CREATE_LABEL, { onCompleted: (d) => { refetch(); addLabel({ variables: { cardId, labelId: d.createLabel.id } }) } })

  const card = data?.card

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!card) return null

  const handleDelete = async () => {
    if (confirm('Delete this card?')) {
      await deleteCard({ variables: { id: cardId } })
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    await addComment({ variables: { input: { cardId, text: commentText } } })
    setCommentText('')
  }

  const cardLabelIds = new Set(card.labels?.map((l: any) => l.id))

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-fade-in">
        {/* Cover */}
        {card.coverColor && (
          <div className="h-14 rounded-t-2xl" style={{ backgroundColor: card.coverColor }} />
        )}

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3 gap-4">
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <input
                value={titleVal}
                onChange={(e) => setTitleVal(e.target.value)}
                onBlur={async () => {
                  await updateCard({ variables: { id: cardId, input: { title: titleVal } } })
                  setEditingTitle(false)
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                autoFocus
                className="w-full text-xl font-bold bg-secondary border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            ) : (
              <h2 className="text-xl font-bold cursor-pointer hover:text-primary/80 transition-colors" onDoubleClick={() => setEditingTitle(true)}>
                {card.title}
              </h2>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              in <span className="text-foreground">{card.list?.title}</span> · {card.list?.board?.title}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={handleDelete} className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Labels row */}
        {card.labels?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-6 pb-3">
            {card.labels.map((label: any) => (
              <span key={label.id} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full text-white font-medium"
                style={{ backgroundColor: label.color }}>
                {label.name}
                <button onClick={() => removeLabel({ variables: { cardId, labelId: label.id } })} className="hover:opacity-80">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="px-6 pb-6 grid grid-cols-3 gap-6">
          {/* Main content */}
          <div className="col-span-2 space-y-5">
            {/* Description */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Edit2 className="w-3.5 h-3.5" /> Description
              </div>
              {editingDesc ? (
                <div className="space-y-2">
                  <textarea
                    value={descVal}
                    onChange={(e) => setDescVal(e.target.value)}
                    rows={4}
                    autoFocus
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="Add a more detailed description..."
                  />
                  <div className="flex gap-2">
                    <button onClick={async () => { await updateCard({ variables: { id: cardId, input: { description: descVal } } }); setEditingDesc(false) }}
                      className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors">
                      Save
                    </button>
                    <button onClick={() => setEditingDesc(false)} className="px-3 py-1.5 bg-secondary text-sm rounded-lg hover:bg-accent transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[60px] px-3 py-2.5 bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border rounded-lg text-sm cursor-pointer transition-all"
                  onClick={() => setEditingDesc(true)}>
                  {card.description || <span className="text-muted-foreground">Add a description...</span>}
                </div>
              )}
            </div>

            {/* Checklists */}
            {card.checklists?.map((checklist: any) => (
              <div key={checklist.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckSquare className="w-3.5 h-3.5 text-muted-foreground" />
                    {checklist.title}
                  </div>
                  <span className="text-xs text-muted-foreground">{checklist.progress.completed}/{checklist.progress.total}</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-secondary rounded-full mb-3">
                  <div className="h-1.5 bg-primary rounded-full transition-all"
                    style={{ width: `${checklist.progress.percentage}%` }} />
                </div>
                <div className="space-y-1">
                  {checklist.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-2.5 group py-0.5">
                      <button onClick={() => toggleChecklistItem({ variables: { id: item.id } })}
                        className={cn('w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all',
                          item.completed ? 'bg-primary border-primary' : 'border-border hover:border-primary/50')}>
                        {item.completed && <Check className="w-2.5 h-2.5 text-white" />}
                      </button>
                      <span className={cn('text-sm flex-1', item.completed && 'line-through text-muted-foreground')}>{item.text}</span>
                      <button onClick={() => deleteChecklistItem({ variables: { id: item.id } })}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-muted-foreground transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      value={newItemText[checklist.id] || ''}
                      onChange={(e) => setNewItemText(p => ({ ...p, [checklist.id]: e.target.value }))}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && (newItemText[checklist.id] || '').trim()) {
                          await addChecklistItem({ variables: { input: { checklistId: checklist.id, text: newItemText[checklist.id] } } })
                          setNewItemText(p => ({ ...p, [checklist.id]: '' }))
                        }
                      }}
                      placeholder="Add an item... (Enter to save)"
                      className="flex-1 px-2 py-1 bg-secondary border border-border rounded text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add checklist */}
            {addingChecklist ? (
              <div className="space-y-2">
                <input
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  placeholder="Checklist title..."
                  autoFocus
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && newChecklistTitle.trim()) {
                      await createChecklist({ variables: { input: { cardId, title: newChecklistTitle } } })
                      setNewChecklistTitle('')
                      setAddingChecklist(false)
                    }
                  }}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <button onClick={async () => {
                    if (newChecklistTitle.trim()) {
                      await createChecklist({ variables: { input: { cardId, title: newChecklistTitle } } })
                      setNewChecklistTitle('')
                      setAddingChecklist(false)
                    }
                  }} className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg">Add</button>
                  <button onClick={() => setAddingChecklist(false)} className="px-3 py-1.5 bg-secondary text-sm rounded-lg">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingChecklist(true)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Plus className="w-4 h-4" /> Add checklist
              </button>
            )}

            {/* Comments */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <MessageSquare className="w-3.5 h-3.5" /> Comments ({card.comments?.length || 0})
              </div>
              <div className="space-y-3">
                {card.comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-2.5 group">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {comment.author.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                        {comment.edited && <span className="text-xs text-muted-foreground">(edited)</span>}
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            rows={2}
                            autoFocus
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <div className="flex gap-2">
                            <button onClick={async () => { await updateComment({ variables: { id: comment.id, text: editingCommentText } }); setEditingCommentId(null) }}
                              className="px-2.5 py-1 bg-primary text-primary-foreground text-xs rounded-lg">Save</button>
                            <button onClick={() => setEditingCommentId(null)} className="px-2.5 py-1 bg-secondary text-xs rounded-lg">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm bg-secondary/60 rounded-lg px-3 py-2">{comment.text}</p>
                      )}
                      <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.text) }}
                          className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
                        <button onClick={() => deleteComment({ variables: { id: comment.id } })}
                          className="text-xs text-muted-foreground hover:text-red-400">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex-shrink-0" />
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      rows={2}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                    {commentText && (
                      <button onClick={handleAddComment} className="mt-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors">
                        Save
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Status</label>
              <select
                value={card.status}
                onChange={(e) => updateCard({ variables: { id: cardId, input: { status: e.target.value } } })}
                className="w-full px-2.5 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Priority</label>
              <select
                value={card.priority}
                onChange={(e) => updateCard({ variables: { id: cardId, input: { priority: e.target.value } } })}
                className="w-full px-2.5 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Due date */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Due Date</label>
              <input
                type="date"
                value={card.dueDate ? format(new Date(card.dueDate), 'yyyy-MM-dd') : ''}
                onChange={(e) => updateCard({ variables: { id: cardId, input: { dueDate: e.target.value || null } } })}
                className="w-full px-2.5 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Story points */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Story Points</label>
              <input
                type="number"
                value={card.storyPoints || ''}
                onChange={(e) => updateCard({ variables: { id: cardId, input: { storyPoints: parseInt(e.target.value) || null } } })}
                placeholder="0"
                min="0"
                className="w-full px-2.5 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Assignees */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Assignees</label>
              <div className="space-y-1">
                {boardMembers.map((member: any) => {
                  const isAssigned = card.assignees?.some((a: any) => a.id === member.id)
                  return (
                    <button
                      key={member.id}
                      onClick={() => isAssigned
                        ? unassignCard({ variables: { cardId, userId: member.id } })
                        : assignCard({ variables: { cardId, userId: member.id } })
                      }
                      className={cn(
                        'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                        isAssigned ? 'bg-primary/15 text-primary' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                        {member.name[0]}
                      </div>
                      <span className="truncate">{member.name}</span>
                      {isAssigned && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Labels</label>
              <div className="space-y-1">
                {boardLabels.map((label: any) => {
                  const isApplied = cardLabelIds.has(label.id)
                  return (
                    <button
                      key={label.id}
                      onClick={() => isApplied
                        ? removeLabel({ variables: { cardId, labelId: label.id } })
                        : addLabel({ variables: { cardId, labelId: label.id } })
                      }
                      className={cn('flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                        isApplied ? 'ring-1 ring-white/20' : 'hover:bg-secondary')}
                      style={isApplied ? { backgroundColor: label.color + '30' } : {}}
                    >
                      <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                      <span>{label.name}</span>
                      {isApplied && <Check className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                  )
                })}
              </div>
              {showLabelCreate ? (
                <div className="mt-2 space-y-2">
                  <input value={addingLabelName} onChange={(e) => setAddingLabelName(e.target.value)}
                    placeholder="Label name" className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                  <div className="flex flex-wrap gap-1">
                    {LABEL_COLORS.map(c => (
                      <button key={c} onClick={() => setAddingLabelColor(c)}
                        className={cn('w-5 h-5 rounded-full transition-transform', addingLabelColor === c && 'ring-2 ring-white ring-offset-1 ring-offset-background scale-110')}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={async () => {
                      if (addingLabelName.trim()) {
                        await createLabel({ variables: { boardId: card.list.board.id, name: addingLabelName, color: addingLabelColor } })
                        setAddingLabelName('')
                        setShowLabelCreate(false)
                      }
                    }} className="flex-1 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg">Create</button>
                    <button onClick={() => setShowLabelCreate(false)} className="flex-1 py-1.5 bg-secondary text-xs rounded-lg">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowLabelCreate(true)}
                  className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Create label
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
