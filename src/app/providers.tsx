"use client";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { ApolloProvider } from "@apollo/client";
import { getApolloClient } from "@/lib/apollo-client";
import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

const IDLE_MS = 10 * 60 * 1000; // 10 min

function IdleTimeout() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const timer = useRef<NodeJS.Timeout>();
  const isAuth = pathname?.startsWith("/auth");

  const reset = useCallback(() => {
    if (!session || isAuth) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => signOut({ callbackUrl: "/auth/login?reason=idle" }), IDLE_MS);
  }, [session, isAuth]);

  useEffect(() => {
    if (!session || isAuth) return;
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(timer.current);
    };
  }, [session, isAuth, reset]);

  return null;
}

function InnerProviders({ children }: { children: React.ReactNode }) {
  const client = getApolloClient();
  return (
    <ApolloProvider client={client}>
      <IdleTimeout />
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f1f5f9",
            fontSize: "14px",
          },
        }}
      />
    </ApolloProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={4 * 60} refetchOnWindowFocus>
      <InnerProviders>{children}</InnerProviders>
    </SessionProvider>
  );
}
