// src/middleware.ts

import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(request: NextRequestWithAuth) {
        const pathname = request.nextUrl.pathname;
        const role = request.nextauth.token?.role; 
        const isAuthenticated = !!role;

        // ===============================================
        // A. ACESSO MASTER (BYPASS TOTAL)
        // ===============================================
        // Se for MASTER, ele ignora todas as regras de bloqueio abaixo e acessa qualquer página.
        if (role === "MASTER") return NextResponse.next();

        // ===============================================
        // B. REGRAS DE AUTORIZAÇÃO POR NÍVEL DE ACESSO
        // ===============================================

        // 1. Proteger Rotas de Técnico (/tecnico)
        // Permite acesso para "TECNICO" e "CONTROLADOR" (MASTER já passou acima)
        if (pathname.startsWith('/tecnico') && role !== "TECNICO" && role !== "CONTROLADOR") {
            return NextResponse.rewrite(new URL("/unauthorized", request.url));
        }

        // 2. Proteger Rotas de Controlador (/controlador)
        // Permite acesso apenas para "CONTROLADOR" (MASTER já passou acima)
        if (pathname.startsWith('/controlador') && role !== "CONTROLADOR") {
            return NextResponse.rewrite(new URL("/unauthorized", request.url));
        }

        // ===============================================
        // C. REDIRECIONAMENTO PARA LOGADOS
        // ===============================================
        if (isAuthenticated && (pathname.startsWith('/login') || pathname.startsWith('/registro'))) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, 
        },
        pages: {
            signIn: '/login',
        }
    }
);

export const config = {
    matcher: [
        "/((?!api/auth|api/register|_next/static|_next/image|favicon.ico|.*\\.png|registro$).*)",
    ],
};