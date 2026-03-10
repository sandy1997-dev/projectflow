'use client'
// src/components/layout/AppHeader.tsx
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { GET_NOTIFICATIONS, MARK_ALL_NOTIFICATIONS_READ } from '@/graphql/operations'
import { useAuth } from '@/lib/auth-context'
import { Bell, Search, LogOut, User, Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function AppHeader() {
  const { user, signOut } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()

  const { data: notifData, refetch } = useQuery(GET_NOTIFICATIONS, { variables: { unreadOnly: false } })
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ, { onCompleted: () => refetch() })

  const notifications = notifData?.myNotifications || []
  const unreadCount = notifData?.unreadNotificationCount || 0

  const handleSignOut = () => {
    signOut()
    router.replace('/')
  }

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search boards, cards..."
            className="w-full pl-9 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
            className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-xl shadow-xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-sm">Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={() => markAllRead()} className="text-xs text-primary hover:underline">
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications</div>
                ) : (
                  notifications.slice(0, 10).map((n: any) => (
                    <div key={n.id} className={cn('px-4 py-3 hover:bg-secondary/50 border-b border-border/50 last:border-0 transition-colors', !n.read && 'bg-primary/5')}>
                      <div className="flex gap-2">
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                        <div className={!n.read ? '' : 'ml-3.5'}>
                          <p className="text-sm">{n.data?.message || n.type}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-xl shadow-xl z-50">
              <div className="px-4 py-3 border-b border-border">
                <div className="font-medium text-sm truncate">{user?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
              <div className="py-1">
                <Link href="/dashboard/settings/profile" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                  <User className="w-4 h-4 text-muted-foreground" /> Profile
                </Link>
                <Link href="/dashboard/settings" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                  <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                </Link>
              </div>
              <div className="py-1 border-t border-border">
                <button onClick={handleSignOut}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
