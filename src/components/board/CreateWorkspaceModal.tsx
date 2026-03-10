"use client";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_WORKSPACE } from "@/graphql/queries";
import { X, Loader2 } from "lucide-react";

export function CreateWorkspaceModal({ onClose, onCreated }: any) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [createWorkspace, { loading }] = useMutation(CREATE_WORKSPACE);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createWorkspace({ variables: { input: { name: name.trim(), description: desc.trim() || undefined } } });
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-semibold text-white">Create Workspace</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Workspace Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Acme Inc"
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What does this workspace manage?"
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" rows={3} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-slate-300 hover:text-white py-2.5 rounded-xl text-sm transition hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={loading || !name.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
