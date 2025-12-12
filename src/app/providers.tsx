"use client"
import { SessionProvider } from "next-auth/react"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    // SessionProvider gerencia o estado de autenticação de forma global
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}