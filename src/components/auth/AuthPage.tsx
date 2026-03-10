'use client'
// src/components/auth/AuthPage.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Layers, Github, Chrome, ArrowRight, Check } from 'lucide-react'

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUp(name, email, password)
      } else {
        await signIn(email, password)
      }
      router.replace('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    'Drag-and-drop Kanban boards',
    'Real-time team collaboration',
    'Advanced analytics dashboard',
    'Unlimited workspaces & boards',
    'Priority & due date tracking',
    'Checklist & comment threads',
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-blue-950 via-slate-900 to-background p-12 border-r border-border relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ProjectFlow</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage projects<br />
            <span className="text-blue-400">the smart way</span>
          </h1>
          <p className="text-slate-400 text-lg mb-10">
            Real-time collaboration, visual boards, and powerful analytics — all in one place.
          </p>

          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-slate-300">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-blue-400" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: 'Active Teams', value: '10K+' },
            { label: 'Tasks Managed', value: '2M+' },
            { label: 'Uptime', value: '99.9%' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ProjectFlow</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {mode === 'signin' ? 'Sign in to continue to ProjectFlow' : 'Start managing projects better today'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-background px-2">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm font-medium hover:bg-accent transition-all">
              <Github className="w-4 h-4" />
              GitHub
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm font-medium hover:bg-accent transition-all">
              <Chrome className="w-4 h-4" />
              Google
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-primary hover:underline font-medium"
            >
              {mode === 'signin' ? 'Sign up for free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
