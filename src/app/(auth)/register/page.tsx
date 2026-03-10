"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, User, Mail, Lock } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      await signIn("credentials", { email: form.email, password: form.password, callbackUrl: "/dashboard" });
    } catch { setError("Something went wrong"); setLoading(false); }
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
      <p className="text-slate-400 text-sm mb-6">Start managing projects with your team</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}
        {[
          { field: "name", label: "Full Name", type: "text", icon: User, placeholder: "John Doe" },
          { field: "email", label: "Email", type: "email", icon: Mail, placeholder: "you@company.com" },
          { field: "password", label: "Password", type: "password", icon: Lock, placeholder: "Min 8 characters" },
        ].map(({ field, label, type, icon: Icon, placeholder }) => (
          <div key={field} className="space-y-1">
            <label className="text-sm font-medium text-slate-300">{label}</label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={type} value={(form as any)[field]} onChange={(e) => setForm(prev => ({ ...prev, [field]: e.target.value }))} required
                placeholder={placeholder} minLength={field === "password" ? 8 : undefined}
                className="w-full bg-slate-800/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              />
            </div>
          </div>
        ))}
        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-60">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</> : "Create Account"}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
      </p>
    </div>
  );
}
