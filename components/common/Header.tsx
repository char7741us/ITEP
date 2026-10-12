"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProfileControl } from "@/components/profile/ProfileControl";

const NAV_ITEMS = [
  { href: "/", label: "Mi espacio" },
  { href: "/exam/new", label: "Nuevo simulacro" },
  { href: "/practica-diaria", label: "Práctica diaria" },
  { href: "/laboratorio-c1", label: "Laboratorio C1" },
  { href: "/dashboard", label: "Progreso" },
  { href: "/cuaderno-errores", label: "Cuaderno de Errores" },
];

export function Header() {
  const pathname = usePathname();
  if (pathname.startsWith("/exam/run/")) return null;

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex min-h-14 w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-semibold tracking-tight">iTEP Simulator</span>
          <span className="font-signature text-base italic text-primary/70">
            by Michh <span aria-hidden="true">💕</span>
          </span>
        </Link>
        <div className="ml-auto">
          <Link href="/mis-datos" className="mr-2 inline-block rounded-full px-2 py-2 text-xs text-muted-foreground hover:bg-muted">Mis datos</Link>
          <ProfileControl />
        </div>
        <nav
          aria-label="Navegación principal"
          className="order-last flex w-full items-center gap-1 overflow-x-auto pb-1 sm:pb-0 lg:order-none lg:w-auto"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`)) ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted",
                pathname === item.href
                  ? "bg-secondary/40 text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
