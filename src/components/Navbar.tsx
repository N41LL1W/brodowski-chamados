"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  // Função auxiliar para destacar o link ativo na navegação
  const isActive = (p: string) =>
    pathname === p ? "text-blue-600 font-semibold" : "opacity-80 hover:opacity-100";

  return (
    // Removido h-7: a altura será definida pelo padding interno (py-3)
    <header className="w-full fixed top-0 left-0
        bg-var(--surface) border-b border-var(--card-border)
        text-var(--text) z-50 shadow-md">
      
      {/* O py-3 define o espaço vertical da barra */}
      <div className="container flex items-center justify-between py-3">
        <h1 className="text-lg font-bold">Chamados - TI Brodowski</h1>

        <nav className="flex items-center gap-4">
          <Link href="/" className={isActive("/")}>Home</Link>
          <Link href="/novo-chamado" className={isActive("/novo-chamado")}>Abrir Chamado</Link>
          <Link href="/meus-chamados" className={isActive("/meus-chamados")}>Meus Chamados</Link>
          <Link href="/tecnico" className={isActive("/tecnico")}>Técnico</Link>
          <Link href="/controlador" className={isActive("/controlador")}>Controlador</Link>
          <ThemeToggle />
        </nav>
      </div>

    </header>
  );
}