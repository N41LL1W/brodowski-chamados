"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import AuthButton from "./AuthButton";
import { 
  LayoutDashboard, PlusCircle, History, 
  Settings, ShieldCheck, Briefcase, 
  Terminal 
} from "lucide-react";

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
    <header className="sticky top-0 w-full z-50 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tighter bg-linear-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                TI BRODOWSKI
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest">
            <Link href="/" className={isActive("/")}>Início</Link>
            
            {isLogged && (
              <>
                <Link href="/chamados/novo" className={isActive("/chamados/novo")}>Abrir Chamado</Link>
                <Link href="/meus-chamados" className={isActive("/meus-chamados")}>Meus Chamados</Link>
              </>
            )}

            {isLogged && ["TECNICO", "ADMIN", "MASTER"].includes(role) && (
              <Link href="/tecnico" className={isActive("/tecnico")}>Painel Técnico</Link>
            )}

            {isLogged && ["CONTROLADOR", "ADMIN", "MASTER"].includes(role) && (
              <Link href="/controlador" className={isActive("/controlador")}>Gestão</Link>
            )}

            {/* LINK MASTER - VISÍVEL APENAS PARA MASTER */}
            {isLogged && role === "MASTER" && (
              <Link 
                href="/admin" 
                className={`${isActive("/admin")} flex items-center gap-1.5 text-red-600 dark:text-red-500`}
              >
                <ShieldCheck size={14} />
                ADMIN MASTER
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <AuthButton />
          </div>
        </div>
      </div>
      
      {/* Navegação Mobile Inferior */}
      <nav className="md:hidden flex items-center justify-around border-t dark:border-slate-800 py-3 bg-white dark:bg-slate-900">
          <MobileNavLink href="/" icon={<History size={20}/>} active={pathname === "/"} />
          <MobileNavLink href="/chamados/novo" icon={<PlusCircle size={20}/>} active={pathname === "/chamados/novo"} />
          
          {isLogged && ["TECNICO", "ADMIN", "MASTER"].includes(role) && (
            <MobileNavLink href="/tecnico" icon={<LayoutDashboard size={20}/>} active={pathname === "/tecnico"} />
          )}

          {/* Mobile: Link Master usa ícone de Terminal ou Settings */}
          {isLogged && role === "MASTER" && (
            <MobileNavLink href="/admin" icon={<Terminal size={20} className="text-red-500" />} active={pathname.startsWith("/admin")} />
          )}
      </nav>
    </header>
  );
}

function MobileNavLink({ href, icon, active }: any) {
    return (
        <Link href={href} className={`${active ? 'text-blue-600' : 'text-slate-400'}`}>
            {icon}
        </Link>
    );
}