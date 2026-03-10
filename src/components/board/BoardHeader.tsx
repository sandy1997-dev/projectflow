"use client";
import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { UPDATE_BOARD, DELETE_BOARD } from "@/graphql/queries";
import { ChevronLeft, Star, Users, BarChart2, MoreHorizontal, Trash2, Edit2, Globe, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export function BoardHeader({ board, onRefetch }: any) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [updateBoard] = useMutation(UPDATE_BOARD);
  const [deleteBoard] = useMutation(DELETE_BOARD);

  async function handleDelete() {
    if (!confirm(`Delete board "${board.name}"?`)) return;
    await deleteBoard({ variables: { id: board.id } });
    router.push("/dashboard");
  }

  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <Link href="/dashboard" className="flex items-center gap-1.5 text-white/60 hover:text-white transition text-sm">
        <ChevronLeft className="w-4 h-4" /> Boards
      </Link>
      <div className="h-4 w-px bg-white/20" />
      <h1 className="font-bold text-white text-lg">{board.name}</h1>
      {board.isPublic ? (
        <span className="flex items-center gap-1 text-xs text-white/50 bg-white/10 px-2 py-1 rounded-lg"><Globe className="w-3 h-3" />Public</span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-white/50 bg-white/10 px-2 py-1 rounded-lg"><Lock className="w-3 h-3" />Private</span>
      )}

      <div className="flex-1" />

      {/* Members */}
      <div className="flex items-center -space-x-2">
        {(board.workspace?.members ?? []).slice(0, 5).map((m: any) => (
          <div key={m.id} title={m.user.name} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold">
            {m.user.name?.slice(0, 1).toUpperCase()}
          </div>
        ))}
      </div>

      <Link href="/analytics" className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl transition">
        <BarChart2 className="w-4 h-4" /> Analytics
      </Link>

      <div className="relative">
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition">
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-10 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-20 py-1 w-44">
            <button onClick={handleDelete} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition">
              <Trash2 className="w-3.5 h-3.5" /> Delete Board
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
