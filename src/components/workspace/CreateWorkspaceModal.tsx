'use client'
// src/components/workspace/CreateWorkspaceModal.tsx
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_WORKSPACE } from '@/graphql/operations'
import { useRouter } from 'next/navigation'
import { X, Layers } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

export function CreateWorkspaceModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const [createWorkspace, { loading }] = useMutation(CREATE_WORKSPACE)

  const handleNameChange = (v: string) => {
    setName(v)
    setSlug(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await createWorkspace({ variables: { input: { name, slug, description } } })
      onCreated?.()
      onClose()
      router.push(`/dashboard/workspace/${data.createWorkspace.id}`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="font-semibold">Create Workspace</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Workspace Name</label>
            <input value={name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Team Workspace"
              required
              className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">URL Slug</label>
            <div className="flex items-center gap-0">
              <span className="px-3 py-2.5 bg-muted border border-r-0 border-border rounded-l-lg text-sm text-muted-foreground">projectflow.app/</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="my-team"
                required
                className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-r-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your team work on?"
              rows={2}
              className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-secondary hover:bg-accent border border-border rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
