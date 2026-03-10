"use client";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { User, Bell, Shield, LogOut, Save, Loader2, Eye, EyeOff, Key } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [notifs, setNotifs] = useState({ cardAssigned:true, cardDue:true, comments:true, boardUpdates:false });

  const tabs = [
    { id:"profile", label:"Profile", icon:User },
    { id:"notifications", label:"Notifications", icon:Bell },
    { id:"security", label:"Security", icon:Shield },
  ];

  async function saveProfile() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/update", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:name.trim() }) });
      if (res.ok) { await update({ name:name.trim() }); toast.success("Profile updated"); }
      else toast.error("Update failed");
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  }

  async function changePassword() {
    if (newPass !== confPass) { toast.error("Passwords don't match"); return; }
    if (newPass.length < 8) { toast.error("Min 8 characters"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/user/password", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ currentPassword:curPass, newPassword:newPass }) });
      if (res.ok) { toast.success("Password changed"); setCurPass(""); setNewPass(""); setConfPass(""); }
      else { const d = await res.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences</p>
      </div>

      <div className="flex gap-5">
        {/* Tabs */}
        <nav className="w-48 shrink-0 space-y-0.5">
          {tabs.map(({ id, label, icon:Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${tab===id ? "bg-blue-600/20 text-blue-300 border border-blue-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
          <div className="pt-3">
            <button onClick={() => signOut({ callbackUrl:"/auth/login" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 rounded-2xl p-6" style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.07)" }}>

          {tab === "profile" && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-white">Profile</h2>
              {/* Avatar */}
              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {(name || session?.user?.name || "U").slice(0,2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white">{session?.user?.name}</p>
                  <p className="text-slate-400 text-sm">{session?.user?.email}</p>
                  <p className="text-xs text-slate-600 mt-0.5 capitalize">{(session?.user as any)?.role?.toLowerCase() || "member"}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Display Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                  className="w-full h-11 text-sm rounded-xl px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Email</label>
                <input value={session?.user?.email || ""} disabled
                  className="w-full h-11 text-sm rounded-xl px-4 cursor-not-allowed"
                  style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", color:"#475569" }} />
                <p className="text-xs text-slate-600 mt-1">Email address cannot be changed</p>
              </div>
              <button onClick={saveProfile} disabled={saving || !name.trim()}
                className="flex items-center gap-2 h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </button>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-white">Notifications</h2>
              {[
                { k:"cardAssigned", label:"Card assigned to me", desc:"When a card is assigned to you" },
                { k:"cardDue", label:"Due date reminders", desc:"24h before a card is due" },
                { k:"comments", label:"New comments", desc:"On cards you're assigned to or created" },
                { k:"boardUpdates", label:"Board updates", desc:"When boards you're on are changed" },
              ].map(({ k, label, desc }) => (
                <div key={k} className="flex items-center justify-between p-4 rounded-xl" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <button onClick={() => setNotifs(p => ({ ...p, [k]: !p[k as keyof typeof p] }))}
                    className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${notifs[k as keyof typeof notifs] ? "bg-blue-600" : "bg-white/10"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${notifs[k as keyof typeof notifs] ? "left-6" : "left-1"}`} />
                  </button>
                </div>
              ))}
              <button onClick={() => toast.success("Preferences saved")}
                className="flex items-center gap-2 h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition">
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-white">Security</h2>
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.2)" }}>
                <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Auto sign-out after 10 min idle</p>
                  <p className="text-xs text-slate-400 mt-0.5">You're automatically signed out when inactive to protect your account</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-slate-400" /> Change Password</h3>
                <div className="space-y-3">
                  {[
                    { val:curPass, set:setCurPass, label:"Current Password", ph:"Enter current password" },
                    { val:newPass, set:setNewPass, label:"New Password", ph:"Min 8 characters" },
                    { val:confPass, set:setConfPass, label:"Confirm Password", ph:"Repeat new password" },
                  ].map(({ val, set, label, ph }) => (
                    <div key={label}>
                      <label className="block text-sm font-semibold text-slate-200 mb-1.5">{label}</label>
                      <div className="relative">
                        <input type={showPass ? "text" : "password"} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                          className="w-full h-11 text-sm rounded-xl px-4 pr-11 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                          style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }} />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={changePassword} disabled={saving || !curPass || !newPass || !confPass}
                    className="flex items-center gap-2 h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} Change Password
                  </button>
                </div>
              </div>

              <div className="pt-4" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <h3 className="text-sm font-bold text-red-400 mb-3">Danger Zone</h3>
                <button onClick={() => signOut({ callbackUrl:"/auth/login" })}
                  className="flex items-center gap-2 h-10 px-5 text-sm font-semibold text-red-400 rounded-xl transition"
                  style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)" }}>
                  <LogOut className="w-4 h-4" /> Sign Out of All Devices
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
