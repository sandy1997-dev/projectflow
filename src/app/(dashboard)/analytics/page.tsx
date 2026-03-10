"use client";
import { useQuery } from "@apollo/client";
import { GET_WORKSPACES, GET_ANALYTICS } from "@/graphql/queries";
import { useState } from "react";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export default function AnalyticsPage() {
  const { data: wsData } = useQuery(GET_WORKSPACES);
  const allBoards = wsData?.workspaces?.flatMap((w: any) => w.boards ?? []) ?? [];
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const boardId = selectedBoardId ?? allBoards[0]?.id;
  const { data, loading } = useQuery(GET_ANALYTICS, { variables: { boardId }, skip: !boardId });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Track your team&apos;s performance and productivity</p>
        </div>
        {allBoards.length > 0 && (
          <select value={boardId || ""} onChange={(e) => setSelectedBoardId(e.target.value)}
            className="bg-slate-900 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            {allBoards.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>
      {boardId && data?.analytics ? (
        <AnalyticsDashboard analytics={data.analytics} />
      ) : loading ? (
        <div className="grid grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-slate-900 rounded-2xl" />)}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">No boards found. Create a board to see analytics.</div>
      )}
    </div>
  );
}
