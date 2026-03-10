"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { User, Bell, Shield, Palette, Save } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      <div className="flex gap-6">
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === id ? "bg-blue-500/15 text-blue-400" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex-1 bg-slate-900 border border-white/5 rounded-2xl p-6">
          {activeTab === "profile" && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Profile Settings</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                  {session?.user?.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{session?.user?.name}</p>
                  <p className="text-slate-400 text-sm">{session?.user?.email}</p>
                  <button className="text-blue-400 hover:text-blue-300 text-xs mt-1">Change avatar</button>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Full Name", value: session?.user?.name || "", placeholder: "Your full name" },
                  { label: "Email", value: session?.user?.email || "", placeholder: "your@email.com" },
                ].map(({ label, value, placeholder }) => (
                  <div key={label}>
                    <label className="text-sm text-slate-400 block mb-1.5">{label}</label>
                    <input defaultValue={value} placeholder={placeholder}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                ))}
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition mt-2">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}
          {activeTab !== "profile" && (
            <div className="text-center py-12 text-slate-500">
              <p>This section is coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
