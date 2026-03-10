"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_WORKSPACES } from "@/graphql/queries";
import { LayoutDashboard, BarChart3, Settings, ChevronRight, Layout, Plus } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data } = useQuery(GET_WORKSPACES);
  const [expandedWs, setExpandedWs] = useState<string[]>([]);

  const workspaces = data?.workspaces ?? [];

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 h-full bg-slate-950 border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layout className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">ProjectFlow</span>
        </div>
      </div>

      {/* Nav */}
      <div className="p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === href || pathname.startsWith(href + "/") ? "bg-blue-500/15 text-blue-400" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            <Icon className="w-4 h-4" /> {label}
          </Link>
        ))}
      </div>

      {/* Workspaces */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Workspaces</div>
        {workspaces.map((ws: any) => (
          <div key={ws.id}>
            <button onClick={() => setExpandedWs(prev => prev.includes(ws.id) ? prev.filter(id => id !== ws.id) : [...prev, ws.id])}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition group">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500/80 to-indigo-600/80 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {ws.name.slice(0, 1).toUpperCase()}
              </div>
              <span className="flex-1 text-left truncate">{ws.name}</span>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform ${expandedWs.includes(ws.id) ? "rotate-90" : ""}`} />
            </button>
            {expandedWs.includes(ws.id) && (
              <div className="ml-3 pl-3 border-l border-white/5 space-y-0.5 mt-0.5">
                {ws.boards?.map((board: any) => (
                  <Link key={board.id} href={`/board/${board.id}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition ${pathname === `/board/${board.id}` ? "text-blue-400 bg-blue-500/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: board.background || "#1e3a8a" }} />
                    <span className="truncate">{board.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {session?.user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
