"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState("system");
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "system";
    setTheme(saved);

    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const finalTheme = saved === "system" ? (systemDark ? "dark" : "light") : saved;

    root.classList.toggle("dark", finalTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const next =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

    setTheme(next);
    localStorage.setItem("theme", next);

    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const finalTheme = next === "system" ? (systemDark ? "dark" : "light") : next;

    root.classList.toggle("dark", finalTheme === "dark");
  };

  const isActive = (path: string) =>
    pathname === path ? "text-blue-500 font-bold" : "opacity-70 hover:opacity-100";

  return (
    <header className="w-full bg-var(--surface) text-var(--text) border-b border-var(--muted) fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <h1 className="text-xl font-bold">Chamados</h1>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="sm:hidden text-2xl"
        >
          ☰
        </button>

        <nav
          className={`${
            isMenuOpen ? "block" : "hidden"
          } sm:flex gap-6 items-center`}
        >
          <Link href="/" className={isActive("/")}>
            Home
          </Link>

          <Link href="/tickets" className={isActive("/tickets")}>
            Chamados
          </Link>

          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded bg-var(--muted) hover:opacity-80"
          >
            {theme === "light"
              ? "🌞 Claro"
              : theme === "dark"
              ? "🌙 Escuro"
              : "💻 Sistema"}
          </button>
        </nav>
      </div>
    </header>
  );
}
