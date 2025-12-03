// src/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("theme") as "light" | "dark" | "system") || "system";
    setTheme(saved);
    applyTheme(saved);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => saved === "system" && applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function applyTheme(t: "light" | "dark" | "system") {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const final = t === "system" ? (systemDark ? "dark" : "light") : t;
    root.classList.toggle("dark", final === "dark");
  }

  function toggle() {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  if (!mounted) return null;

  return (
    <button onClick={toggle} className="p-2 rounded hover:opacity-90" aria-label="Toggle theme">
      {theme === "light" ? "🌞" : theme === "dark" ? "🌙" : "🖥️"}
    </button>
  );
}
