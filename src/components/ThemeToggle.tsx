"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [mounted, setMounted] = useState(false);

  // Inicialização
  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("theme") as "light" | "dark" | "system") || "system";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  function applyTheme(t: "light" | "dark" | "system") {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Determina se deve aplicar .dark
    const isDark = t === "system" ? systemDark : t === "dark";
    
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }

  function toggle() {
    const modes: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const currentIndex = modes.indexOf(theme);
    const next = modes[(currentIndex + 1) % modes.length];
    
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  // Evita Hydration Mismatch
  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button 
      onClick={toggle} 
      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all border border-slate-200 dark:border-slate-700"
      aria-label="Trocar Tema"
    >
      {theme === "light" && <Sun size={18} />}
      {theme === "dark" && <Moon size={18} />}
      {theme === "system" && <Monitor size={18} />}
    </button>
  );
}