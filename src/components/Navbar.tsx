"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import AuthButton from "./AuthButton";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  const role = (session?.user as any)?.role;
  const isLogged = status === "authenticated";

  const isActive = (p: string) =>
    pathname === p 
      ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1" 
      : "opacity-70 hover:opacity-100 hover:text-blue-500 transition-all";

  return (
    <header className="sticky top-0 w-full z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo - Ajustado: flex-shrink-0 -> shrink-0 */}
          <div className="shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                TI BRODOWSKI
              </span>
            </Link>
          </div>

          {/* Links de Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className={isActive("/")}>Início</Link>
            
            {isLogged && (
              <>
                <Link href="/novo-chamado" className={isActive("/novo-chamado")}>Abrir Chamado</Link>
                <Link href="/meus-chamados" className={isActive("/meus-chamados")}>Meus Chamados</Link>
              </>
            )}

            {isLogged && ["TECNICO", "ADMIN", "MASTER", "CONTROLADOR"].includes(role) && (
              <Link href="/tecnico" className={isActive("/tecnico")}>Painel Técnico</Link>
            )}

            {isLogged && ["CONTROLADOR", "ADMIN", "MASTER"].includes(role) && (
              <Link href="/controlador" className={isActive("/controlador")}>Gestão</Link>
            )}
          </nav>

          {/* Ações Direitas */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1" />
            <AuthButton />
          </div>
        </div>
      </div>
      
      {/* Navegação Mobile */}
      <nav className="md:hidden flex items-center justify-start gap-4 px-4 pb-3 overflow-x-auto text-[10px] font-bold uppercase tracking-widest no-scrollbar">
          <Link href="/" className={isActive("/")}>Início</Link>
          {isLogged && (
            <>
              <Link href="/novo-chamado" className={isActive("/novo-chamado")}>Novo</Link>
              <Link href="/meus-chamados" className={isActive("/meus-chamados")}>Chamados</Link>
            </>
          )}
          {isLogged && ["TECNICO", "ADMIN", "MASTER"].includes(role) && (
            <Link href="/tecnico" className={isActive("/tecnico")}>TI</Link>
          )}
      </nav>
    </header>
  );
}