"use client";
import { useQuery, useMutation } from "@apollo/client";
import { GET_NOTIFICATIONS, MARK_ALL_READ } from "@/graphql/queries";
import { signOut } from "next-auth/react";
import { Bell, LogOut, Search, X } from "lucide-react";
import { useState } from "react";
import { formatRelativeDate } from "@/lib/utils";

export default function Topbar() {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data, refetch } = useQuery(GET_NOTIFICATIONS, { pollInterval: 30000 });
  const [markAllRead] = useMutation(MARK_ALL_READ, { onCompleted: () => refetch() });

  const unread = data?.unreadNotificationCount ?? 0;

  return (
    <div className="h-14 bg-slate-950/80 backdrop-blur-sm border-b border-white/5 flex items-center gap-4 px-6 shrink-0">
      <div className="flex-1" />

      {/* Notifications */}
      <div className="relative">
        <button onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>
        {showNotifs && (
          <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span className="font-semibold text-white text-sm">Notifications</span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={() => markAllRead()} className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>
                )}
                <button onClick={() => setShowNotifs(false)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {(data?.notifications ?? []).length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">No notifications</div>
              ) : (
                (data?.notifications ?? []).map((n: any) => (
                  <div key={n.id} className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition ${!n.isRead ? "bg-blue-500/5" : ""}`}>
                    <p className="text-sm text-slate-200">{n.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatRelativeDate(n.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sign out */}
      <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition">
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </div>
  );
}
