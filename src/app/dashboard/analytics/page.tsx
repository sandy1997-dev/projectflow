"use client";
import { useQuery } from "@apollo/client";
import { GET_WORKSPACES, GET_ANALYTICS } from "@/graphql/queries";
import { useState } from "react";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { BarChart3 } from "lucide-react";

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="skeleton h-16 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_,i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: wsData } = useQuery(GET_WORKSPACES);
  const boards = wsData?.workspaces?.flatMap((w: any) => w.boards ?? []) ?? [];
  const [boardId, setBoardId] = useState<string | null>(null);
  const activeId = boardId ?? boards[0]?.id;
  const { data, loading } = useQuery(GET_ANALYTICS, { variables: { boardId: activeId }, skip: !activeId });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Track your team's performance and productivity</p>
        </div>
        {boards.length > 0 && (
          <select value={activeId || ""}
            onChange={e => setBoardId(e.target.value)}
            className="h-10 text-sm rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
            style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.1)" }}>
            {boards.map((b: any) => (
              <option key={b.id} value={b.id} style={{ background:"#1e293b" }}>{b.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? <Skeleton />
        : data?.analytics ? <AnalyticsDashboard analytics={data.analytics} />
        : (
          <div className="rounded-2xl p-20 text-center" style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)" }}>
            <BarChart3 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No boards found</p>
            <p className="text-slate-600 text-sm mt-1">Create a board and add cards to see analytics</p>
          </div>
        )}
    </div>
  );
}
