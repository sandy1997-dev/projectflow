"use client";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return <SonnerToaster position="bottom-right" toastOptions={{ style: { background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9" } }} />;
}
