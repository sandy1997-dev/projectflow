"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Legend } from "recharts";
import { TrendingUp, CheckCircle2, AlertCircle, Clock, Target, Users } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  TODO: "#64748b", IN_PROGRESS: "#3b82f6", IN_REVIEW: "#a855f7", DONE: "#22c55e"
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#60a5fa", MEDIUM: "#fbbf24", HIGH: "#f97316", URGENT: "#ef4444"
};

export function AnalyticsDashboard({ analytics }: { analytics: any }) {
  const {
    totalCards, completedCards, overdueCards, completionRate,
    cardsByStatus, cardsByPriority, activityByDay, teamProductivity
  } = analytics;

  const stats = [
    { label: "Total Cards", value: totalCards, icon: Target, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Completed", value: completedCards, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Overdue", value: overdueCards, icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Completion Rate", value: `${Math.round(completionRate)}%`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-slate-900 border border-white/5 rounded-2xl p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-slate-400 text-sm mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity chart */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4">Activity (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityByDay} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f1f5f9" }} />
              <Area type="monotone" dataKey="created" stroke="#3b82f6" fill="url(#createdGrad)" name="Created" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="url(#completedGrad)" name="Completed" strokeWidth={2} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4">Cards by Status</h3>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={cardsByStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="count" nameKey="status">
                  {cardsByStatus.map((entry: any) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#64748b"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1 ml-4">
              {cardsByStatus.map((entry: any) => (
                <div key={entry.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: STATUS_COLORS[entry.status] }} />
                    <span className="text-sm text-slate-400">{entry.status.replace(/_/g, " ")}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{entry.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority chart */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4">Cards by Priority</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cardsByPriority} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="priority" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f1f5f9" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {cardsByPriority.map((entry: any) => (
                  <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] || "#64748b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team productivity */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4">Team Productivity</h3>
          {teamProductivity.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">Assign cards to team members to see stats</div>
          ) : (
            <div className="space-y-3">
              {teamProductivity.slice(0, 6).map((member: any) => {
                const rate = member.assigned > 0 ? Math.round((member.completed / member.assigned) * 100) : 0;
                return (
                  <div key={member.user.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {member.user.name?.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">{member.user.name}</span>
                        <span className="text-xs text-slate-400">{member.completed}/{member.assigned}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full" style={{ width: `${rate}%` }} />
                      </div>
                    </div>
                    {member.overdue > 0 && (
                      <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">{member.overdue} late</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
