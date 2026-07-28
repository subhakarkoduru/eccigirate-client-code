"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
};

type SiteHeaderProps = {
  links: NavLink[];
};

export function SiteHeader({ links }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-white">
          <ShieldCheck className="h-6 w-6 text-blue-400" aria-hidden />
          <span className="text-lg font-bold tracking-tight">Vape Detection App</span>
        </Link>
        <nav>
          <ul className="flex items-center gap-6">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
