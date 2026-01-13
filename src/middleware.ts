import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(request: NextRequestWithAuth) {
        const pathname = request.nextUrl.pathname;
        const token = request.nextauth.token; // Captura o token corretamente
        const role = token?.role; 
        const isAuthenticated = !!token;

        // 1. BYPASS para MASTER e ADMIN (Acesso total)
        if (role === "MASTER" || role === "ADMIN") {
            // Se já está logado e tenta ir para login/registro, manda para a home
            if (pathname === "/login" || pathname === "/registro") {
                return NextResponse.redirect(new URL("/", request.url));
            }
            return NextResponse.next();
        }

        // 2. Proteção de Rotas Técnicas
        if (pathname.startsWith('/tecnico') && role !== "TECNICO" && role !== "CONTROLADOR") {
            return NextResponse.rewrite(new URL("/unauthorized", request.url));
        }

        // 3. Proteção de Rotas de Controle
        if (pathname.startsWith('/controlador') && role !== "CONTROLADOR") {
            return NextResponse.rewrite(new URL("/unauthorized", request.url));
        }

        // 4. Redirecionar logados que tentam acessar login/registro (Roles comuns)
        if (isAuthenticated && (pathname === "/login" || pathname === "/registro")) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // Só executa a lógica acima se houver um token (usuário logado)
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: '/login',
        }
    }
);

export const config = {
    // Matcher para proteger tudo, exceto arquivos públicos e a rota de registro/api
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|registro$).*)",
    ],
};