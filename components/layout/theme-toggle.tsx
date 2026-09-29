"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark" | "system";
const themes: Theme[] = ["light", "dark", "system"];
const labels: Record<Theme, string> = {
  light: "Hell",
  dark: "Dunkel",
  system: "System",
};

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("foodscope:theme");
      if (saved === "light" || saved === "dark" || saved === "system") {
        setTheme(saved);
        applyTheme(saved);
      }
    } catch {
      // Theme selection remains available when browser storage is restricted.
    }
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => applyTheme("system");
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [theme]);

  const cycleTheme = () => {
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
    try {
      window.localStorage.setItem("foodscope:theme", next);
    } catch {
      // Applying the selected theme does not depend on persistence.
    }
    applyTheme(next);
  };

  const Icon = theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 rounded-lg px-3 text-xs"
      onClick={cycleTheme}
      aria-label={"Darstellung wechseln. Aktuell: " + labels[theme]}
      title="Darstellung wechseln: Hell, Dunkel, System"
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      <span className="hidden sm:inline">{labels[theme]}</span>
    </Button>
  );
}
