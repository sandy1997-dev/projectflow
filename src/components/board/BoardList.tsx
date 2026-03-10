'use client'
// src/components/board/BoardList.tsx
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { DELETE_LIST, UPDATE_LIST, CREATE_CARD } from '@/graphql/operations'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableCard } from './SortableCard'
import { MoreHorizontal, Plus, Trash2, Edit2, X, Check, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  list: any
  boardId: string
  boardLabels: any[]
  boardMembers: any[]
  onCardClick: (cardId: string) => void
  onListUpdated: () => void
}

export function BoardList({ list, boardId, boardLabels, boardMembers, onCardClick, onListUpdated }: Props) {
  const [addingCard, setAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(list.title)

  const { setNodeRef, isOver } = useDroppable({ id: list.id })
  const [deleteList] = useMutation(DELETE_LIST)
  const [updateList] = useMutation(UPDATE_LIST)
  const [createCard] = useMutation(CREATE_CARD)

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return
    await createCard({ variables: { input: { listId: list.id, title: newCardTitle.trim() } } })
    setNewCardTitle('')
    setAddingCard(false)
  }

  const handleUpdateTitle = async () => {
    if (title.trim() && title !== list.title) {
      await updateList({ variables: { id: list.id, input: { title } } })
    }
    setEditingTitle(false)
  }

  const handleDeleteList = async () => {
    if (confirm(`Delete "${list.title}" and all its cards?`)) {
      await deleteList({ variables: { id: list.id } })
      onListUpdated()
    }
  }

  const cardIds = (list.cards || []).map((c: any) => c.id)

  return (
    <div className="list-container">
      <div className={cn(
        'rounded-xl border transition-all flex flex-col',
        'bg-slate-900/80 border-slate-700/60 backdrop-blur-sm',
        isOver && 'border-primary/50 bg-slate-800/90',
      )}>
        {/* List header */}
        <div className="flex items-center justify-between px-3 py-2.5">
          {editingTitle ? (
            <div className="flex items-center gap-1.5 flex-1">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
                autoFocus
                className="flex-1 bg-secondary/80 border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={handleUpdateTitle} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
              <button onClick={() => { setTitle(list.title); setEditingTitle(false) }} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onDoubleClick={() => setEditingTitle(true)} className="flex items-center gap-2 flex-1 text-left group">
              <span className="font-semibold text-sm text-foreground">{list.title}</span>
              <span className="text-xs bg-secondary text-muted-foreground rounded-full px-1.5 py-0.5 ml-auto">{list.cards?.length || 0}</span>
            </button>
          )}

          <div className="relative ml-2">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-lg shadow-xl z-50">
                <button onClick={() => { setEditingTitle(true); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary transition-colors">
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" /> Rename List
                </button>
                <button onClick={() => { handleDeleteList(); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete List
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cards */}
        <div ref={setNodeRef} className="px-2 flex-1 min-h-[4px]">
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 pb-2">
              {(list.cards || []).map((card: any) => (
                <SortableCard key={card.id} card={card} onClick={() => onCardClick(card.id)} />
              ))}
            </div>
          </SortableContext>
        </div>

        {/* Add card */}
        <div className="px-2 pb-2">
          {addingCard ? (
            <div className="space-y-2">
              <textarea
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard() }
                  if (e.key === 'Escape') setAddingCard(false)
                }}
                placeholder="Card title..."
                autoFocus
                rows={2}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <div className="flex items-center gap-2">
                <button onClick={handleAddCard}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  Add Card
                </button>
                <button onClick={() => setAddingCard(false)} className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingCard(true)}
              className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add a card
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
