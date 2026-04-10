//src\components\ThemeToggle.tsx

"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  function applyTheme(t: Theme) {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = t === "system" ? systemDark : t === "dark";
    
    root.classList.toggle("dark", isDark);
    localStorage.setItem("theme", t);
  }

  function toggle() {
    const modes: Theme[] = ["light", "dark", "system"];
    const next = modes[(modes.indexOf(theme) + 1) % modes.length];
    setTheme(next);
    applyTheme(next);
  }

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button 
      onClick={toggle} 
      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all border border-border dark:border-slate-700"
      aria-label="Trocar Tema"
    >
      {theme === "light" && <Sun size={18} />}
      {theme === "dark" && <Moon size={18} />}
      {theme === "system" && <Monitor size={18} />}
    </button>
  );
}