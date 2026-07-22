"use client";

import Link from "next/link";
import { esports } from "@/data/esports";
import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          ProSetups.dk
        </Link>
        <nav className="hidden sm:flex items-center gap-5 text-sm text-muted-foreground">
          {esports.filter((e) => e.aktiv).map((e) => (
            <Link
              key={e.slug}
              href={`/${e.slug}`}
              className="hover:text-primary transition-colors duration-200"
            >
              {e.navn}
            </Link>
          ))}
          <Link href="/pros" className="hover:text-primary transition-colors duration-200">
            Alle pros
          </Link>
          <Link href="/mus" className="hover:text-primary transition-colors duration-200">
            Alle mus
          </Link>
          <Link href="/find-mus" className="hover:text-primary transition-colors duration-200">
            Find mus
          </Link>
          <Link href="/guides/greb" className="hover:text-primary transition-colors duration-200">
            Greb-guide
          </Link>
        </nav>
        <button
          type="button"
          className="sm:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Luk menu" : "Åben menu"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>
      {open && (
        <div className="sm:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
          <nav className="flex flex-col px-4 py-2 text-sm text-muted-foreground">
            {esports.filter((e) => e.aktiv).map((e) => (
              <Link
                key={e.slug}
                href={`/${e.slug}`}
                className="py-3 hover:text-primary transition-colors duration-200"
                onClick={() => setOpen(false)}
              >
                {e.navn}
              </Link>
            ))}
            <Link
              href="/pros"
              className="py-3 hover:text-primary transition-colors duration-200"
              onClick={() => setOpen(false)}
            >
              Alle pros
            </Link>
            <Link
              href="/mus"
              className="py-3 hover:text-primary transition-colors duration-200"
              onClick={() => setOpen(false)}
            >
              Alle mus
            </Link>
            <Link
              href="/find-mus"
              className="py-3 hover:text-primary transition-colors duration-200"
              onClick={() => setOpen(false)}
            >
              Find mus
            </Link>
            <Link
              href="/guides/greb"
              className="py-3 hover:text-primary transition-colors duration-200"
              onClick={() => setOpen(false)}
            >
              Greb-guide
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
