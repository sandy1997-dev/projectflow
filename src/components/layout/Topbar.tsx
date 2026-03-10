"use client";
import { useQuery, useMutation } from "@apollo/client";
import { GET_NOTIFICATIONS, MARK_ALL_READ, MARK_NOTIFICATION_READ } from "@/graphql/queries";
import { signOut, useSession } from "next-auth/react";
import { Bell, LogOut, X, CheckCheck, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";

const NOTIF_ICONS: Record<string, string> = {
  CARD_ASSIGNED: "👤", CARD_DUE: "⏰", COMMENT_ADDED: "💬",
  BOARD_INVITE: "📋", MENTION: "@", CARD_MOVED: "↗️",
};

export default function Topbar() {
  const { data: session } = useSession();
  const [showNotifs, setShowNotifs] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data, refetch } = useQuery(GET_NOTIFICATIONS, { pollInterval: 30000 });
  const [markAll] = useMutation(MARK_ALL_READ, { onCompleted: () => refetch() });
  const [markOne] = useMutation(MARK_NOTIFICATION_READ, { onCompleted: () => refetch() });
  const unread = data?.unreadNotificationCount ?? 0;
  const notifs = data?.notifications ?? [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = (name?: string | null) =>
    (name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="h-14 flex items-center gap-3 px-5 shrink-0" style={{ background: "#0c1220", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex-1" />

      {/* Notification bell */}
      <div className="relative" ref={ref}>
        <button onClick={() => setShowNotifs(!showNotifs)}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/6 transition">
          <Bell className="w-4.5 h-4.5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#0c1220]" />
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-11 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-up"
            style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">Notifications</span>
                {unread > 0 && <span className="text-[11px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-medium">{unread}</span>}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={() => markAll()} title="Mark all read"
                    className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-lg transition">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => setShowNotifs(false)}
                  className="p-1.5 text-slate-600 hover:text-slate-300 hover:bg-white/5 rounded-lg transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-7 h-7 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">All caught up!</p>
                </div>
              ) : notifs.map((n: any) => (
                <button key={n.id} onClick={() => !n.isRead && markOne({ variables: { id: n.id } })}
                  className={`w-full text-left px-4 py-3 transition hover:bg-white/4 ${!n.isRead ? "bg-blue-500/5" : ""}`}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex items-start gap-3">
                    <span className="text-base shrink-0 mt-0.5">{NOTIF_ICONS[n.type] || "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 leading-snug">{n.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatRelativeDate(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings link */}
      <Link href="/dashboard/settings"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/6 transition">
        <Settings className="w-4 h-4" />
      </Link>

      {/* User */}
      <div className="flex items-center gap-2.5 pl-3" style={{ borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="hidden sm:block text-right">
          <p className="text-xs font-semibold text-slate-200 leading-tight">{session?.user?.name}</p>
          <p className="text-[11px] text-slate-500">{session?.user?.email}</p>
        </div>
        <Link href="/dashboard/settings">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-80 transition shadow-md">
            {initials(session?.user?.name)}
          </div>
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
          title="Sign out"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition">
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
