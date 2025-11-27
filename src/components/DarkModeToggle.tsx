// src/components/DarkModeToggle.tsx
"use client";

import { useEffect, useState } from "react";

type ThemeType = "light" | "dark" | "system";

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<ThemeType>(() => (localStorage.getItem("theme") as ThemeType) || "system");

  useEffect(() => {
    const root = document.documentElement;
    const apply = (t: ThemeType) => {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const final = t === "system" ? (isSystemDark ? "dark" : "light") : t;
      if (final === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    };

    apply(theme);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handle = () => theme === "system" && apply("system");
    mq.addEventListener("change", handle);
    localStorage.setItem("theme", theme);
    return () => mq.removeEventListener("change", handle);
  }, [theme]);

  return (
    <div className="flex gap-2 items-center">
      <button onClick={() => setTheme("light")} className={theme === "light" ? "bg-blue-600 text-white px-3 py-1 rounded" : "px-3 py-1 rounded"}>
        Claro
      </button>
      <button onClick={() => setTheme("dark")} className={theme === "dark" ? "bg-blue-600 text-white px-3 py-1 rounded" : "px-3 py-1 rounded"}>
        Escuro
      </button>
      <button onClick={() => setTheme("system")} className={theme === "system" ? "bg-blue-600 text-white px-3 py-1 rounded" : "px-3 py-1 rounded"}>
        Sistema
      </button>
    </div>
  );
}
