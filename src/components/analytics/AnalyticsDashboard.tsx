"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";
import { TrendingUp, CheckCircle2, AlertCircle, Target, Users, Clock } from "lucide-react";

const STATUS_C = { TODO:"#64748b", IN_PROGRESS:"#3b82f6", IN_REVIEW:"#a855f7", DONE:"#22c55e" };
const PRIO_C   = { LOW:"#60a5fa", MEDIUM:"#fbbf24", HIGH:"#f97316", URGENT:"#ef4444" };

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="rounded-2xl p-5" style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "18" }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {sub && <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">{sub}</span>}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-slate-400 text-sm mt-0.5">{label}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-sm shadow-xl" style={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.1)" }}>
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export function AnalyticsDashboard({ analytics }: { analytics: any }) {
  const { totalCards, completedCards, overdueCards, completionRate, cardsByStatus, cardsByPriority, activityByDay, teamProductivity } = analytics;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Cards" value={totalCards} icon={Target} color="#3b82f6" />
        <StatCard label="Completed" value={completedCards} icon={CheckCircle2} color="#22c55e" sub={`${Math.round(completionRate)}%`} />
        <StatCard label="Overdue" value={overdueCards} icon={AlertCircle} color="#ef4444" />
        <StatCard label="Completion Rate" value={`${Math.round(completionRate)}%`} icon={TrendingUp} color="#a855f7" />
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl p-5" style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-white">Project Progress</span>
          <span className="text-blue-300 font-bold">{Math.round(completionRate)}%</span>
        </div>
        <div className="h-3 rounded-full" style={{ background:"rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width:`${completionRate}%`, background:"linear-gradient(90deg,#3b82f6,#6366f1,#8b5cf6)" }} />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>{completedCards} done</span><span>{totalCards - completedCards} remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Activity chart */}
        <div className="rounded-2xl p-5" style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-bold text-white mb-4">Activity (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityByDay} margin={{ top:0, right:0, bottom:0, left:-20 }}>
              <defs>
                <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gDone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize:11, fill:"#64748b" }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize:11, fill:"#64748b" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="created" name="Created" stroke="#3b82f6" fill="url(#gCreated)" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#22c55e" fill="url(#gDone)" strokeWidth={2} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12, color:"#94a3b8" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div className="rounded-2xl p-5" style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-bold text-white mb-4">Cards by Status</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={cardsByStatus} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="count" nameKey="status" paddingAngle={2}>
                  {cardsByStatus.map((entry: any) => (
                    <Cell key={entry.status} fill={(STATUS_C as any)[entry.status] || "#64748b"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {cardsByStatus.map((entry: any) => (
                <div key={entry.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: (STATUS_C as any)[entry.status] }} />
                    <span className="text-sm text-slate-300">{entry.status.replace(/_/g, " ")}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{entry.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Priority bar */}
        <div className="rounded-2xl p-5" style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-bold text-white mb-4">Cards by Priority</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cardsByPriority} margin={{ top:0, right:0, bottom:0, left:-20 }}>
              <XAxis dataKey="priority" tick={{ fontSize:11, fill:"#64748b" }} />
              <YAxis tick={{ fontSize:11, fill:"#64748b" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Cards" radius={[6,6,0,0]}>
                {cardsByPriority.map((entry: any) => (
                  <Cell key={entry.priority} fill={(PRIO_C as any)[entry.priority] || "#64748b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team productivity */}
        <div className="rounded-2xl p-5" style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" /> Team Productivity
          </h3>
          {teamProductivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-2">
              <Users className="w-8 h-8 text-slate-700" />
              <p className="text-sm">Assign cards to see member stats</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamProductivity.slice(0, 5).map((m: any) => {
                const rate = m.assigned > 0 ? Math.round((m.completed / m.assigned) * 100) : 0;
                return (
                  <div key={m.user.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(m.user.name || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-200 truncate">{m.user.name}</span>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {m.overdue > 0 && (
                            <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full">
                              {m.overdue} late
                            </span>
                          )}
                          <span className="text-xs text-slate-400">{m.completed}/{m.assigned}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background:"rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width:`${rate}%`, background:`linear-gradient(90deg, #3b82f6, #22c55e)` }} />
                      </div>
                    </div>
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
