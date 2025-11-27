"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState("system");
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);

    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (savedTheme === "system" && prefersDark)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);

    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (nextTheme === "dark" || (nextTheme === "system" && prefersDark)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const isActive = (path: string) =>
    pathname === path
      ? "text-blue-600 dark:text-blue-400 font-semibold"
      : "hover:text-blue-500 transition-colors";

  return (
    <header className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <h1 className="text-xl font-bold tracking-wide">MyReactComponents</h1>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="sm:hidden text-2xl focus:outline-none"
        >
          ☰
        </button>

        <nav
          className={`${isMenuOpen ? "block" : "hidden"} sm:flex sm:items-center gap-6`}
        >
          <Link href="/" className={isActive("/")}>
            Home
          </Link>

          <button
            onClick={toggleTheme}
            className="ml-4 px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-800 text-sm hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            {theme === "light"
              ? "🌞 Claro"
              : theme === "dark"
              ? "🌙 Escuro"
              : "🖥️ Sistema"}
          </button>
        </nav>
      </div>
    </header>
  );
}
