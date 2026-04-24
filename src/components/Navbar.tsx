"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import AuthButton from "./AuthButton";
import NotificacaoBadge from "./NotificacaoBadge";
import { 
    LayoutDashboard, PlusCircle, History,
    ShieldCheck, Terminal, CalendarClock,
    UserCircle2, ListChecks, Home
} from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    const role = (session?.user as any)?.role;
    const isLogged = status === "authenticated";

    const isActive = (p: string) =>
        pathname === p || pathname.startsWith(p + '/')
            ? "text-primary font-bold border-b-2 border-primary pb-1"
            : "opacity-70 hover:opacity-100 hover:text-primary transition-all";

    const isTecnico     = role === 'TECNICO';
    const isControlador = role === 'CONTROLADOR';
    const isMaster      = role === 'MASTER';

    return (
        <header className="sticky top-0 w-full z-50 backdrop-blur-md border-b border-border bg-card/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* LOGO */}
                    <div className="shrink-0">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-xl font-black tracking-tighter text-primary">
                                TI BRODOWSKI
                            </span>
                        </Link>
                    </div>

                    {/* NAV DESKTOP */}
                    <nav className="hidden md:flex items-center gap-6 text-[11px] font-black uppercase tracking-widest">
                        <Link href="/" className={isActive("/")}>Início</Link>

                        {isLogged && (
                            <Link href="/chamados/novo" className={isActive("/chamados/novo")}>
                                Abrir Chamado
                            </Link>
                        )}

                        {isLogged && (
                            <Link href="/meus-chamados" className={isActive("/meus-chamados")}>
                                Meus Chamados
                            </Link>
                        )}

                        {isLogged && isTecnico && (
                            <div className="relative">
                                <Link href="/tecnico" className={isActive("/tecnico")}>
                                    Painel Técnico
                                </Link>
                                <NotificacaoBadge />
                            </div>
                        )}

                        {isLogged && isTecnico && (
                            <Link href="/tecnico/agenda" className={isActive("/tecnico/agenda")}>
                                Agenda
                            </Link>
                        )}

                        {isLogged && isControlador && (
                            <Link href="/controlador" className={isActive("/controlador")}>
                                Gestão
                            </Link>
                        )}

                        {isLogged && isMaster && (
                            <Link
                                href="/admin"
                                className={`${isActive("/admin")} flex items-center gap-1.5 text-red-600 dark:text-red-400`}
                            >
                                <ShieldCheck size={13}/>
                                Admin
                            </Link>
                        )}

                        {isLogged && (
                            <Link href="/conta" className={isActive("/conta")}>
                                Minha Conta
                            </Link>
                        )}
                    </nav>

                    {/* AÇÕES DIREITA */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle/>
                        <div className="hidden sm:block h-6 w-px bg-border"/>
                        <AuthButton/>
                    </div>
                </div>
            </div>

            {/* NAV MOBILE INFERIOR */}
            <nav className="md:hidden flex items-center justify-around border-t border-border py-2 bg-card">
                <MobileNavLink href="/" icon={<Home size={20}/>} active={pathname === "/"} />

                {isLogged && (
                    <MobileNavLink href="/chamados/novo" icon={<PlusCircle size={20}/>} active={pathname === "/chamados/novo"} />
                )}

                {isLogged && (
                    <MobileNavLink href="/meus-chamados" icon={<ListChecks size={20}/>} active={pathname.startsWith("/meus-chamados")} />
                )}

                {isLogged && isTecnico && (
                    <div className="relative">
                        <MobileNavLink href="/tecnico" icon={<LayoutDashboard size={20}/>} active={pathname.startsWith("/tecnico") && !pathname.startsWith("/tecnico/agenda")} />
                        <NotificacaoBadge />
                    </div>
                )}

                {isLogged && isTecnico && (
                    <MobileNavLink href="/tecnico/agenda" icon={<CalendarClock size={20}/>} active={pathname.startsWith("/tecnico/agenda")} />
                )}

                {isLogged && isControlador && (
                    <MobileNavLink href="/controlador" icon={<History size={20}/>} active={pathname.startsWith("/controlador")} />
                )}

                {isLogged && isMaster && (
                    <MobileNavLink href="/admin" icon={<Terminal size={20} className="text-red-500"/>} active={pathname.startsWith("/admin")} />
                )}

                {isLogged && (
                    <MobileNavLink href="/conta" icon={<UserCircle2 size={20}/>} active={pathname === "/conta"} />
                )}
            </nav>
        </header>
    );
}

function MobileNavLink({ href, icon, active }: { href: string; icon: React.ReactNode; active: boolean }) {
    return (
        <Link href={href} className={`p-2 rounded-xl transition-colors ${active ? 'text-primary' : 'text-muted hover:text-foreground'}`}>
            {icon}
        </Link>
    );
}