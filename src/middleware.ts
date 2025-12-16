// src/middleware.ts

import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Middleware principal que gerencia Autenticação e Autorização (Role Check)
export default withAuth(
    // 1. Função principal que decide se o usuário tem permissão
    function middleware(request: NextRequestWithAuth) {
        
        const pathname = request.nextUrl.pathname
        const role = request.nextauth.token?.role 
        const isAuthenticated = !!role 

        // ===============================================
        // A. REGRAS DE AUTORIZAÇÃO POR NÍVEL DE ACESSO (ROLE)
        // ===============================================

        // 1. Proteger Rotas de Técnico (/tecnico)
        // Permite acesso para "TECNICO" e "CONTROLADOR"
        if (pathname.startsWith('/tecnico') && role !== "TECNICO" && role !== "CONTROLADOR") {
            return NextResponse.rewrite(
                new URL("/unauthorized", request.url) 
            )
        }

        // 2. Proteger Rotas de Controlador (/controlador)
        // Permite acesso apenas para "CONTROLADOR"
        if (pathname.startsWith('/controlador') && role !== "CONTROLADOR") {
            return NextResponse.rewrite(
                new URL("/unauthorized", request.url)
            )
        }

        // ===============================================
        // B. REDIRECIONAMENTO PARA LOGADOS (Evitar acesso a /login e /registro)
        // ===============================================
        
        // Se o usuário estiver logado e tentar acessar /login ou /registro, manda para a home.
        if (isAuthenticated && (pathname.startsWith('/login') || pathname.startsWith('/registro'))) {
            return NextResponse.redirect(new URL("/", request.url))
        }

        // Se passar por todas as verificações, permite o acesso.
        return NextResponse.next()
    },
    
    // 2. Configuração do withAuth (Regras de Redirecionamento de Não-Autenticados)
    {
        callbacks: {
            // Se esta função retornar true, a requisição continua para a próxima etapa do middleware/página.
            authorized: ({ token }) => !!token, 
        },
        // Configura o ponto de entrada de login do NextAuth.
        pages: {
            signIn: '/login',
        }
    }
)

// 3. matcher: Define quais rotas o middleware DEVE inspecionar
export const config = {
    matcher: [
        /*
         * Corresponde a TUDO exceto:
         * - /api/auth (NextAuth API)
         * - /api/register (Nossa API de registro, para criar usuários)
         * - /registro (Nossa página de registro, para ser acessada sem login) <-- CORREÇÃO
         * - Arquivos estáticos e internos (_next, favicon, etc.)
         */
        "/((?!api/auth|api/register|_next/static|_next/image|favicon.ico|.*\\.png|registro$).*)",
    ],
}