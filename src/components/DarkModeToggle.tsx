"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const saved = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(saved);

    applyTheme(saved);
  }, []);

  const applyTheme = (mode: Theme) => {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const final = mode === "system" ? (systemDark ? "dark" : "light") : mode;

    root.classList.toggle("dark", final === "dark");
    localStorage.setItem("theme", mode);
  };

  const toggle = () => {
    const next: Theme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

    setTheme(next);
    applyTheme(next);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700"
    >
      Tema: {theme}
    </button>
  );
}
