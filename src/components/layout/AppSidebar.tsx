'use client'
// src/components/layout/AppSidebar.tsx
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@apollo/client'
import { GET_MY_WORKSPACES } from '@/graphql/operations'
import { useAuth } from '@/lib/auth-context'
import {
  Layers, LayoutDashboard, BarChart2, Settings, Users,
  ChevronDown, ChevronRight, Plus, Star, Trello, Bell,
  FolderOpen, PanelLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [workspacesOpen, setWorkspacesOpen] = useState(true)

  const { data } = useQuery(GET_MY_WORKSPACES)
  const workspaces = data?.myWorkspaces || []

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/starred', label: 'Starred Boards', icon: Star },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  if (collapsed) {
    return (
      <div className="w-14 border-r border-border flex flex-col items-center py-4 gap-4 bg-card">
        <button onClick={() => setCollapsed(false)} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <PanelLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div className="w-full h-px bg-border mx-2" />
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} title={label}
            className={cn('p-2 rounded-lg transition-colors', pathname === href ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}>
            <Icon className="w-5 h-5" />
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="w-60 border-r border-border flex flex-col bg-card flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground">ProjectFlow</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors">
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href
                ? 'bg-primary/15 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}

        {/* Workspaces */}
        <div className="pt-4">
          <button
            onClick={() => setWorkspacesOpen(!workspacesOpen)}
            className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            <span>Workspaces</span>
            <div className="flex items-center gap-1">
              <Link href="/dashboard/workspace/new" onClick={(e) => e.stopPropagation()}
                className="p-0.5 hover:bg-secondary rounded transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </Link>
              {workspacesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </div>
          </button>

          {workspacesOpen && (
            <div className="mt-1 space-y-1">
              {workspaces.map((ws: any) => (
                <WorkspaceItem key={ws.id} workspace={ws} pathname={pathname} />
              ))}
              {workspaces.length === 0 && (
                <Link href="/dashboard/workspace/new"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  Create workspace
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-border">
        <Link href="/dashboard/settings/profile" className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-secondary transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        </Link>
      </div>
    </div>
  )
}

function WorkspaceItem({ workspace, pathname }: { workspace: any; pathname: string }) {
  const [open, setOpen] = useState(pathname.includes(workspace.id))
  const isActive = pathname.includes(workspace.id)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left',
          isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        )}
      >
        <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {workspace.name[0]}
        </div>
        <span className="truncate flex-1">{workspace.name}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
      </button>

      {open && (
        <div className="ml-3 mt-0.5 pl-5 border-l border-border space-y-0.5">
          <Link href={`/dashboard/workspace/${workspace.id}`}
            className={cn('flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors',
              pathname === `/dashboard/workspace/${workspace.id}` ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
            <LayoutDashboard className="w-3.5 h-3.5" /> Overview
          </Link>
          <Link href={`/dashboard/workspace/${workspace.id}/boards`}
            className={cn('flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors',
              pathname.includes('boards') ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
            <Trello className="w-3.5 h-3.5" /> Boards
          </Link>
          <Link href={`/dashboard/workspace/${workspace.id}/members`}
            className={cn('flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors',
              pathname.includes('members') ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
            <Users className="w-3.5 h-3.5" /> Members
          </Link>
          <Link href={`/dashboard/workspace/${workspace.id}/analytics`}
            className={cn('flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors',
              pathname.includes('analytics') ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
            <BarChart2 className="w-3.5 h-3.5" /> Analytics
          </Link>
        </div>
      )}
    </div>
  )
}
