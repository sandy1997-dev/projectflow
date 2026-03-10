"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

// 1. Renamed from LoginPage to LoginForm (removed export default)
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const idleReason = params?.get("reason") === "idle";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email: email.toLowerCase().trim(), password, redirect: false });
    if (res?.error) {
      setError("Invalid email or password. Try: demo@projectflow.dev / password123");
      setLoading(false);
    } else {
      router.push("/dashboard"); router.refresh();
    }
  }

  async function handleOAuth(provider: string) {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #080d1a 0%, #0d1b3e 50%, #080d1a 100%)" }}>
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-[480px] shrink-0 border-r border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">ProjectFlow</span>
        </div>
        <div>
          <blockquote className="text-2xl font-semibold text-white leading-relaxed mb-4">
            "The best way to manage your team's work in one place."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">SP</div>
            <div>
              <p className="text-white font-medium text-sm">Sandeep Pati</p>
              <p className="text-slate-400 text-sm">Product Manager</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {["Real-time collaboration with your team", "Role-based access control (RBAC)", "Advanced analytics & reporting", "Idle session security timeout"].map(f => (
            <div key={f} className="flex items-center gap-3 text-slate-300 text-sm">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg">ProjectFlow</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-1">Sign in</h1>
          <p className="text-slate-400 mb-8">Welcome back! Please enter your details.</p>

          {idleReason && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
              <span className="text-amber-400">⏱</span>
              <p className="text-amber-300 text-sm">You were signed out after 10 minutes of inactivity.</p>
            </div>
          )}

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => handleOAuth("google")} disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2.5 h-11 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl transition text-sm disabled:opacity-50 shadow-sm">
              {oauthLoading === "google" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Google
            </button>
            <button onClick={() => handleOAuth("github")} disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2.5 h-11 bg-[#24292e] hover:bg-[#2f363d] text-white font-semibold rounded-xl transition text-sm disabled:opacity-50 border border-white/10">
              {oauthLoading === "github" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              )}
              GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/8" /></div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-slate-500" style={{ background: "#080d1a" }}>or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="demo@projectflow.dev"
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/50 transition" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-200">Password</label>
                <span className="text-xs text-slate-500">Demo: password123</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-10 pr-11 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/50 transition" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            No account?{" "}
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-semibold transition">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// 2. Added Suspense Boundary wrapper for the default export
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080d1a" }}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}