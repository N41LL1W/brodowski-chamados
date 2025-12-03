"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (p: string) =>
    pathname === p ? "text-blue-600 font-semibold" : "opacity-80 hover:opacity-100";

  return (
    <header className="h-7 w-full fixed top-0 left-0 
        bg-var(--surface) border-b border-var(--card-border)
        text-var(--text) z-50">
      
      <div className="container flex items-center justify-between py-3">
        <h1 className="text-lg font-bold">Chamados - TI Brodowski</h1>

        <nav className="flex items-center gap-4">
          <Link href="/" className={isActive("/")}>Home</Link>
          <Link href="/tickets" className={isActive("/tickets")}>Chamados</Link>
          <ThemeToggle />
        </nav>
      </div>

    </header>
  );
}
