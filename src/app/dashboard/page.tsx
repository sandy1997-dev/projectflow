"use client";
import { useQuery } from "@apollo/client";
import { GET_WORKSPACES } from "@/graphql/queries";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, LayoutDashboard, Users, CheckCircle2, Folder, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { CreateBoardModal } from "@/components/board/CreateBoardModal";
import { CreateWorkspaceModal } from "@/components/board/CreateWorkspaceModal";
import { useState } from "react";
import { formatRelativeDate } from "@/lib/utils";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Skeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-pulse space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="skeleton h-7 w-64 rounded-lg" />
          <div className="skeleton h-4 w-48 rounded-lg" />
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, loading, refetch } = useQuery(GET_WORKSPACES);
  const [showBoard, setShowBoard] = useState(false);
  const [showWs, setShowWs] = useState(false);
  const [selWsId, setSelWsId] = useState<string | null>(null);

  if (loading) return <Skeleton />;

  const workspaces = data?.workspaces ?? [];
  const allBoards = workspaces.flatMap((w: any) => w.boards ?? []);
  const totalCards = allBoards.reduce((a: number, b: any) => a + (b.cardCount ?? 0), 0);
  const doneCards = allBoards.reduce((a: number, b: any) => a + (b.completedCardCount ?? 0), 0);
  
  // 👈 FIX IS HERE: Changed from [...new Set()].length to new Set().size
  const members = new Set(workspaces.flatMap((w: any) => (w.members ?? []).map((m: any) => m.userId))).size;
  
  const completion = totalCards > 0 ? Math.round((doneCards / totalCards) * 100) : 0;

  const stats = [
    { label: "Boards", value: allBoards.length, icon: LayoutDashboard, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { label: "Total Cards", value: totalCards, icon: Folder, color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
    { label: "Completed", value: doneCards, icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    { label: "Team Members", value: members, icon: Users, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{getGreeting()}, {session?.user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Here's your project overview</p>
        </div>
        <button onClick={() => setShowWs(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4" /> New Workspace
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Completion banner */}
      {totalCards > 0 && (
        <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.12))", border: "1px solid rgba(99,102,241,0.2)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-white">Overall Completion</span>
            </div>
            <span className="text-2xl font-bold text-blue-300">{completion}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${completion}%`, background: "linear-gradient(90deg, #3b82f6, #6366f1)" }} />
          </div>
          <p className="text-slate-400 text-xs mt-2">{doneCards} of {totalCards} cards completed</p>
        </div>
      )}

      {/* Workspaces & Boards */}
      {workspaces.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)" }}>
            <LayoutDashboard className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No workspaces yet</h3>
          <p className="text-slate-400 mb-6">Create a workspace to start managing your team's projects</p>
          <button onClick={() => setShowWs(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition">
            <Plus className="w-4 h-4" /> Create Workspace
          </button>
        </div>
      ) : (
        workspaces.map((ws: any) => (
          <div key={ws.id}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {ws.name[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-white text-base">{ws.name}</h2>
                  <p className="text-xs text-slate-500">{ws.members?.length} members · {ws.boards?.length ?? 0} boards</p>
                </div>
              </div>
              <button onClick={() => { setSelWsId(ws.id); setShowBoard(true); }}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 px-3 py-1.5 rounded-lg transition">
                <Plus className="w-3.5 h-3.5" /> New Board
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {(ws.boards ?? []).map((board: any) => (
                <Link key={board.id} href={`/dashboard/board/${board.id}`}>
                  <div className="rounded-xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30"
                    style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="h-20 relative" style={{ background: board.background || "linear-gradient(135deg,#1e3a5f,#1e3a8a)" }}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
                      <div className="absolute bottom-2.5 left-3 right-3">
                        <h3 className="font-bold text-white text-sm truncate drop-shadow">{board.name}</h3>
                      </div>
                    </div>
                    <div className="px-3 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Folder className="w-3 h-3" />
                        <span>{board.cardCount ?? 0} cards</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeDate(board.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Add board placeholder */}
              <button onClick={() => { setSelWsId(ws.id); setShowBoard(true); }}
                className="rounded-xl h-[108px] flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-slate-400 transition group"
                style={{ border: "2px dashed rgba(255,255,255,0.08)" }}>
                <Plus className="w-5 h-5 group-hover:scale-110 transition" />
                <span className="text-xs font-medium">Add board</span>
              </button>
            </div>
          </div>
        ))
      )}

      {showBoard && selWsId && (
        <CreateBoardModal workspaceId={selWsId} onClose={() => setShowBoard(false)} onCreated={() => { setShowBoard(false); refetch(); }} />
      )}
      {showWs && (
        <CreateWorkspaceModal onClose={() => setShowWs(false)} onCreated={() => { setShowWs(false); refetch(); }} />
      )}
    </div>
  );
}