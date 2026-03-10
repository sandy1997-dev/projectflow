"use client";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_BOARD } from "@/graphql/queries";
import { X, Loader2 } from "lucide-react";

const BACKGROUNDS = [
  "linear-gradient(135deg, #1e3a5f, #1e40af)",
  "linear-gradient(135deg, #3b0764, #6d28d9)",
  "linear-gradient(135deg, #1a1a2e, #16213e)",
  "linear-gradient(135deg, #064e3b, #065f46)",
  "linear-gradient(135deg, #7c2d12, #c2410c)",
  "linear-gradient(135deg, #831843, #9d174d)",
  "#0f172a", "#1e293b", "#0c0a09",
];

export function CreateBoardModal({ workspaceId, onClose, onCreated }: any) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [createBoard, { loading }] = useMutation(CREATE_BOARD);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createBoard({ variables: { input: { name: name.trim(), description: desc.trim() || undefined, background, workspaceId } } });
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-semibold text-white">Create Board</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Preview */}
          <div className="h-28 rounded-xl overflow-hidden relative" style={{ background }}>
            <div className="absolute inset-0 bg-black/30 flex items-end p-3">
              <span className="text-white font-semibold text-sm">{name || "Board name"}</span>
            </div>
          </div>
          {/* Backgrounds */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Background</p>
            <div className="flex gap-2 flex-wrap">
              {BACKGROUNDS.map((bg) => (
                <button key={bg} type="button" onClick={() => setBackground(bg)}
                  className={`w-10 h-7 rounded-lg border-2 transition ${background === bg ? "border-blue-400" : "border-transparent"}`}
                  style={{ background: bg }} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Board Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Product Roadmap"
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional description..."
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-slate-300 hover:text-white py-2.5 rounded-xl text-sm transition hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={loading || !name.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
