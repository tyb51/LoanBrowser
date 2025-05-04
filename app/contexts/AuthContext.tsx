"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "next-auth";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: Session["user"] | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (provider?: string, options?: any) => Promise<any>;
  signOut: () => Promise<any>;
  requireAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: "loading",
  signIn,
  signOut: () => Promise.resolve(),
  requireAuth: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const requireAuth = () => {
    if (status === "loading") return;
    
    if (!session?.user) {
      router.push("/auth/signin");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        status,
        signIn,
        signOut: () => signOut({ callbackUrl: '/' }),
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
