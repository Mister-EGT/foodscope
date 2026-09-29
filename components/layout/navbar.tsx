"use client";

import {
  Clock3,
  GitCompareArrows,
  Heart,
  Leaf,
  Menu,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Suchen", href: "/", icon: Search, active: (path: string) => path === "/" || path.startsWith("/search") || path.startsWith("/product") },
  { label: "Vergleichen", href: "/compare", icon: GitCompareArrows, active: (path: string) => path.startsWith("/compare") },
  { label: "Favoriten", href: "/favorites", icon: Heart, active: (path: string) => path.startsWith("/favorites") },
  { label: "Verlauf", href: "/history", icon: Clock3, active: (path: string) => path.startsWith("/history") },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <div className="page-container flex h-[70px] items-center justify-between gap-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 text-[21px] font-semibold tracking-[-0.04em]"
          aria-label="Foodscope Startseite"
          onClick={() => setMobileOpen(false)}
        >
          <Leaf className="h-7 w-7 text-forest" strokeWidth={2.1} aria-hidden="true" />
          <span>Foodscope</span>
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden h-full items-stretch gap-1 md:flex">
          {navItems.map(({ label, href, icon: Icon, active }) => {
            const selected = active(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2.5 px-4 text-[14px] font-medium text-muted transition-colors hover:text-ink",
                  selected && "text-forest",
                )}
              >
                <Icon className="h-[19px] w-[19px]" strokeWidth={1.8} aria-hidden="true" />
                {label}
                {selected && <span className="absolute inset-x-4 bottom-0 h-[2px] bg-forest" />}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile Navigation"
          className="border-t border-line bg-canvas px-4 py-2 md:hidden"
        >
          {navItems.map(({ label, href, icon: Icon, active }) => {
            const selected = active(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={selected ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted hover:bg-surface-muted hover:text-ink",
                  selected && "bg-forest-soft text-forest",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
