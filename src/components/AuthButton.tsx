// src/components/AuthButton.tsx

"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button"; // Reutilizando seu componente Button

export default function AuthButton() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-10 w-24"></div>
        );
    }

    if (session) {
        return (
            <div className="flex items-center space-x-4">
                {/* Opcional: Mostrar nome ou email do usuário logado */}
                <span className="text-sm font-medium hidden md:inline">
                    {session.user?.name || session.user?.email}
                </span>
                
                <Button 
                    onClick={() => signOut({ callbackUrl: "/login" })} // Redireciona para /login após logout
                    variant="ghost" // Estilo de botão mais discreto (adapte conforme seu Button)
                >
                    Sair
                </Button>
            </div>
        );
    }

    // Se não estiver logado
    return (
        <Button onClick={() => signIn()}>
            Login
        </Button>
    );
}