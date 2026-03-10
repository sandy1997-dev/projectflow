"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: form.email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      const r = await signIn("credentials", { email: form.email.toLowerCase().trim(), password: form.password, redirect: false });
      if (r?.error) { setError("Account created! Please sign in."); setLoading(false); return; }
      router.push("/dashboard"); router.refresh();
    } catch { setError("Something went wrong."); setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #080d1a 0%, #0d1b3e 50%, #080d1a 100%)" }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg">ProjectFlow</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-1">Create account</h1>
        <p className="text-slate-400 mb-8">Free forever. No credit card required.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          {[
            { key: "name", label: "Full Name", type: "text", icon: User, ph: "John Doe" },
            { key: "email", label: "Email address", type: "email", icon: Mail, ph: "you@company.com" },
          ].map(({ key, label, type, icon: Icon, ph }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required
                  placeholder={ph}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition" />
              </div>
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type={showPass ? "text" : "password"} value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required
                placeholder="Min. 8 characters"
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-10 pr-11 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ background: i <= strength ? strengthColor : "rgba(255,255,255,0.08)" }} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strengthColor }}>{strengthLabel} password</p>
              </div>
            )}
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</> : "Create Account →"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-4">By creating an account you agree to our Terms of Service.</p>
        <p className="text-center text-sm text-slate-500 mt-3">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
