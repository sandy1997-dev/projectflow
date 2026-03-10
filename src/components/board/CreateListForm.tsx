'use client'
// src/components/board/CreateListForm.tsx
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_LIST } from '@/graphql/operations'
import { Plus, X } from 'lucide-react'

export function CreateListForm({ boardId, onCreated }: { boardId: string; onCreated: (list: any) => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [createList] = useMutation(CREATE_LIST)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const { data } = await createList({ variables: { input: { boardId, title: title.trim() } } })
    onCreated(data.createList)
    setTitle('')
    setOpen(false)
  }

  if (!open) {
    return (
      <div className="list-container">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-xl transition-all text-sm font-medium backdrop-blur-sm border border-white/10"
        >
          <Plus className="w-4 h-4" /> Add another list
        </button>
      </div>
    )
  }

  return (
    <div className="list-container">
      <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="List title..."
            autoFocus
            required
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex items-center gap-2">
            <button type="submit"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Add List
            </button>
            <button type="button" onClick={() => setOpen(false)}
              className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
