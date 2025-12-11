"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (p: string) =>
    pathname === p ? "text-blue-600 font-semibold" : "opacity-80 hover:opacity-100";

  return (
    // Removendo alturas fixas para deixar o padding definir, mas adicionando z-50 e shadow.
    <header className="max-w-7xl mx-auto px-6 flex items-center justify-between py-3
        bg-var(--surface) border-b border-var(--card-border)
        text-var(--text) z-50 shadow-md">
      
      {/* py-5 (20px em cima e 20px embaixo) define a altura da barra. */}
      <div className="container flex items-center justify-between py-5">
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