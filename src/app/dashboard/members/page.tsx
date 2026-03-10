"use client";
import { useQuery, useMutation } from "@apollo/client";
import { GET_WORKSPACES } from "@/graphql/queries";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Shield, UserPlus, Trash2, ChevronDown, Loader2, Users, Crown, Eye } from "lucide-react";
import { toast } from "sonner";

const ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const;
type Role = typeof ROLES[number];

const ROLE_META: Record<Role, { label: string; color: string; bg: string; border: string; desc: string; icon: any }> = {
  OWNER: { label: "Owner", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", desc: "Full access. Can manage billing, delete workspace.", icon: Crown },
  ADMIN: { label: "Admin", color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.25)", desc: "Can create/delete boards, invite members.", icon: Shield },
  MEMBER: { label: "Member", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", desc: "Can create and manage cards and boards.", icon: Users },
  VIEWER: { label: "Viewer", color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.25)", desc: "Read-only access. Cannot make changes.", icon: Eye },
};

const PERMISSIONS: Record<Role, string[]> = {
  OWNER:  ["View boards", "Create boards", "Delete boards", "Invite members", "Remove members", "Change roles", "Delete workspace", "Billing access"],
  ADMIN:  ["View boards", "Create boards", "Delete boards", "Invite members", "Remove members"],
  MEMBER: ["View boards", "Create boards", "Create & edit cards"],
  VIEWER: ["View boards"],
};

export default function MembersPage() {
  const { data: session } = useSession();
  const { data, loading, refetch } = useQuery(GET_WORKSPACES);
  const [selWs, setSelWs] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const workspaces = data?.workspaces ?? [];
  const workspace = workspaces.find((w: any) => w.id === (selWs ?? workspaces[0]?.id)) ?? workspaces[0];
  const myMembership = workspace?.members?.find((m: any) => m.user?.email === session?.user?.email);
  const myRole: Role = myMembership?.role ?? "VIEWER";
  const canManage = myRole === "OWNER" || myRole === "ADMIN";

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !workspace) return;
    setInviting(true);
    try {
      const res = await fetch("/api/workspace/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspace.id, email: inviteEmail.trim(), role: inviteRole }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Failed to invite"); }
      else { toast.success(`${inviteEmail} invited as ${inviteRole}`); setInviteEmail(""); refetch(); }
    } catch { toast.error("Something went wrong"); }
    setInviting(false);
  }

  async function handleRoleChange(memberId: string, newRole: Role) {
    setUpdatingId(memberId);
    try {
      const res = await fetch("/api/workspace/member", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      });
      if (res.ok) { toast.success("Role updated"); refetch(); }
      else { const d = await res.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Something went wrong"); }
    setUpdatingId(null);
  }

  async function handleRemove(memberId: string, name: string) {
    if (!confirm(`Remove ${name} from workspace?`)) return;
    try {
      const res = await fetch("/api/workspace/member", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (res.ok) { toast.success(`${name} removed`); refetch(); }
      else { const d = await res.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Something went wrong"); }
  }

  if (loading) return (
    <div className="p-6 max-w-5xl mx-auto space-y-4 animate-pulse">
      <div className="skeleton h-8 w-48 rounded-lg" />
      <div className="skeleton h-32 rounded-2xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Members & Roles</h1>
        <p className="text-slate-400 text-sm mt-1">Manage team access with role-based permissions</p>
      </div>

      {/* Workspace selector */}
      {workspaces.length > 1 && (
        <div className="flex gap-2">
          {workspaces.map((ws: any) => (
            <button key={ws.id} onClick={() => setSelWs(ws.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${(selWs ?? workspaces[0]?.id) === ws.id ? "bg-blue-600/20 text-blue-300 border border-blue-500/30" : "text-slate-400 hover:text-slate-200 bg-white/5 border border-white/8"}`}>
              {ws.name}
            </button>
          ))}
        </div>
      )}

      {/* Roles reference */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.entries(ROLE_META) as [Role, typeof ROLE_META[Role]][]).map(([role, meta]) => {
          const Icon = meta.icon;
          return (
            <div key={role} className="rounded-xl p-4" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: meta.color }} />
                <span className="text-sm font-bold" style={{ color: meta.color }}>{meta.label}</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{meta.desc}</p>
              <div className="space-y-1">
                {PERMISSIONS[role].slice(0, 3).map(p => (
                  <div key={p} className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 shrink-0" style={{ color: meta.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-slate-300">{p}</span>
                  </div>
                ))}
                {PERMISSIONS[role].length > 3 && (
                  <p className="text-xs text-slate-500">+{PERMISSIONS[role].length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite form */}
      {canManage && (
        <div className="rounded-2xl p-5" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-400" /> Invite Member
          </h2>
          <form onSubmit={handleInvite} className="flex gap-3 flex-wrap">
            <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              type="email" required placeholder="colleague@company.com"
              className="flex-1 min-w-[220px] h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition" />
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value as Role)}
              className="h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              {(["ADMIN", "MEMBER", "VIEWER"] as Role[]).map(r => (
                <option key={r} value={r} style={{ background: "#1e293b" }}>{ROLE_META[r].label}</option>
              ))}
            </select>
            <button type="submit" disabled={inviting}
              className="h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2 disabled:opacity-60">
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Invite
            </button>
          </form>
        </div>
      )}

      {/* Members list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="font-bold text-white">{workspace?.name} Members</h2>
          <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">{workspace?.members?.length ?? 0} total</span>
        </div>

        <div className="divide-y divide-white/5">
          {(workspace?.members ?? []).map((member: any) => {
            const meta = ROLE_META[member.role as Role] ?? ROLE_META.MEMBER;
            const isSelf = member.user?.email === session?.user?.email;
            const isOwner = member.role === "OWNER";
            const canChangeThis = canManage && !isOwner && !isSelf;

            return (
              <div key={member.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {(member.user?.name || member.user?.email || "U").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{member.user?.name || "Unknown"}</p>
                    {isSelf && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full font-medium">You</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{member.user?.email}</p>
                </div>

                {/* Role badge / selector */}
                {canChangeThis ? (
                  <div className="relative">
                    <select
                      value={member.role}
                      onChange={e => handleRoleChange(member.id, e.target.value as Role)}
                      disabled={!!updatingId}
                      className="appearance-none pr-6 pl-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                      style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}>
                      {(["ADMIN", "MEMBER", "VIEWER"] as Role[]).map(r => (
                        <option key={r} value={r} style={{ background: "#1e293b", color: "#fff" }}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: meta.color }} />
                  </div>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                    style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}>
                    {meta.label}
                  </span>
                )}

                {canChangeThis && (
                  <button onClick={() => handleRemove(member.id, member.user?.name || member.user?.email)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* My permissions */}
      {myMembership && (
        <div className="rounded-2xl p-5" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" /> Your Permissions
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full ml-1"
              style={{ background: ROLE_META[myRole].bg, border: `1px solid ${ROLE_META[myRole].border}`, color: ROLE_META[myRole].color }}>
              {ROLE_META[myRole].label}
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PERMISSIONS[myRole].map(p => (
              <div key={p} className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
