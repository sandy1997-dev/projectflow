"use client";
import { useQuery } from "@apollo/client";
import { GET_WORKSPACES } from "@/graphql/queries";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, LayoutDashboard, Users, Clock, CheckCircle2, TrendingUp, Folder } from "lucide-react";
import { CreateBoardModal } from "@/components/board/CreateBoardModal";
import { CreateWorkspaceModal } from "@/components/board/CreateWorkspaceModal";
import { useState } from "react";
import { formatRelativeDate } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, loading, refetch } = useQuery(GET_WORKSPACES);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);

  const workspaces = data?.workspaces ?? [];
  const allBoards = workspaces.flatMap((w: any) => w.boards ?? []);
  const totalCards = allBoards.reduce((acc: number, b: any) => acc + (b.cardCount ?? 0), 0);
  const completedCards = allBoards.reduce((acc: number, b: any) => acc + (b.completedCardCount ?? 0), 0);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Good {getGreeting()}, {session?.user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Here&apos;s what&apos;s happening across your projects</p>
        </div>
        <button onClick={() => setShowCreateWs(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
          <Plus className="w-4 h-4" /> New Workspace
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Boards", value: allBoards.length, icon: LayoutDashboard, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Total Cards", value: totalCards, icon: Folder, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Completed", value: completedCards, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Team Members", value: workspaces.reduce((acc: number, w: any) => acc + (w.members?.length ?? 0), 0), icon: Users, color: "text-orange-400", bg: "bg-orange-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-slate-900 border border-white/5 rounded-2xl p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-slate-400 text-sm mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Workspaces + Boards */}
      {workspaces.length === 0 ? (
        <EmptyState onCreateWs={() => setShowCreateWs(true)} />
      ) : (
        workspaces.map((ws: any) => (
          <div key={ws.id} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {ws.name.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="font-semibold text-white">{ws.name}</h2>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{ws.plan}</span>
                <span className="text-xs text-slate-500">{ws.members?.length} members</span>
              </div>
              <button onClick={() => { setSelectedWsId(ws.id); setShowCreateBoard(true); }}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition">
                <Plus className="w-3.5 h-3.5" /> New Board
              </button>
            </div>
            {ws.boards?.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center">
                <p className="text-slate-500 text-sm">No boards yet</p>
                <button onClick={() => { setSelectedWsId(ws.id); setShowCreateBoard(true); }}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm">Create your first board →</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ws.boards.map((board: any) => (
                  <Link key={board.id} href={`/board/${board.id}`}>
                    <div className="group bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5">
                      <div className="h-24 relative" style={{ background: board.background || "linear-gradient(135deg, #1e3a5f, #1e3a8a)" }}>
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="font-semibold text-white text-sm truncate drop-shadow">{board.name}</h3>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Folder className="w-3 h-3" />{board.cardCount ?? 0} cards</span>
                            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" />{board.completedCardCount ?? 0}</span>
                          </div>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeDate(board.updatedAt)}</span>
                        </div>
                        {(board.cardCount ?? 0) > 0 && (
                          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                              style={{ width: `${Math.round(((board.completedCardCount ?? 0) / (board.cardCount ?? 1)) * 100)}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {showCreateBoard && selectedWsId && (
        <CreateBoardModal workspaceId={selectedWsId} onClose={() => setShowCreateBoard(false)} onCreated={() => { setShowCreateBoard(false); refetch(); }} />
      )}
      {showCreateWs && (
        <CreateWorkspaceModal onClose={() => setShowCreateWs(false)} onCreated={() => { setShowCreateWs(false); refetch(); }} />
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function EmptyState({ onCreateWs }: { onCreateWs: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
        <LayoutDashboard className="w-10 h-10 text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No workspaces yet</h3>
      <p className="text-slate-400 mb-6 max-w-sm mx-auto">Create a workspace to start organizing your team's projects</p>
      <button onClick={onCreateWs} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition">
        Create Your First Workspace
      </button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-64 bg-slate-800 rounded-lg mb-8" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-800 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-36 bg-slate-800 rounded-2xl" />)}
      </div>
    </div>
  );
}
