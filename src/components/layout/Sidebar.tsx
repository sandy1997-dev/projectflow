"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_WORKSPACES } from "@/graphql/queries";
import { LayoutDashboard, BarChart3, Settings, ChevronRight, LogOut, Users, Plus } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data, loading } = useQuery(GET_WORKSPACES);
  const [expanded, setExpanded] = useState<string[]>([]);
  const workspaces = data?.workspaces ?? [];

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/members", label: "Members & Roles", icon: Users },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  const toggle = (id: string) =>
    setExpanded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const initials = (name?: string | null) =>
    (name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="w-60 h-full flex flex-col shrink-0" style={{ background: "#0c1220", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
        </div>
        <span className="font-bold text-white text-base tracking-tight">ProjectFlow</span>
      </div>

      {/* Nav */}
      <div className="p-3">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all ${
              isActive(href, exact)
                ? "bg-blue-600/20 text-blue-300 border border-blue-500/20"
                : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            }`}>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </div>

      {/* Workspaces */}
      <div className="flex-1 overflow-y-auto p-3 pt-0">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2 mt-2">Workspaces</p>

        {loading && (
          <div className="space-y-1 px-1">
            {[1,2].map(i => <div key={i} className="h-8 skeleton rounded-lg" />)}
          </div>
        )}

        {workspaces.map((ws: any) => (
          <div key={ws.id} className="mb-0.5">
            <button onClick={() => toggle(ws.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition group">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {ws.name[0].toUpperCase()}
              </div>
              <span className="flex-1 text-left truncate">{ws.name}</span>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-600 transition-transform ${expanded.includes(ws.id) ? "rotate-90" : ""}`} />
            </button>

            {expanded.includes(ws.id) && (
              <div className="ml-4 pl-3 my-1 space-y-0.5" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                {(ws.boards ?? []).length === 0 ? (
                  <p className="text-xs text-slate-600 px-2 py-1">No boards yet</p>
                ) : (
                  (ws.boards ?? []).map((b: any) => (
                    <Link key={b.id} href={`/dashboard/board/${b.id}`}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition ${
                        pathname === `/dashboard/board/${b.id}` ? "text-blue-300 bg-blue-500/10" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}>
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{
                        background: b.background?.startsWith("linear") ? "#4f46e5" : b.background || "#1e3a8a"
                      }} />
                      <span className="truncate">{b.name}</span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User footer */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition cursor-pointer mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials(session?.user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-100 truncate leading-tight">{session?.user?.name || "User"}</p>
            <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </div>
  );
}
