"use client";

import Image from "next/image";
import Link from "next/link";
import { esports } from "@/data/esports";
import { useState } from "react";

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function DropdownItem({ href, children, close }: { href: string; children: React.ReactNode; close?: () => void }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/[0.04] transition-colors duration-150"
      onClick={close}
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logos/PROSETUPS transparent.png"
            alt="ProSetups.dk"
            width={907}
            height={131}
            className="h-4 w-auto"
            priority
          />
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/pros" className="font-medium text-foreground hover:text-primary transition-colors duration-200">
            Pros
          </Link>

          {esports.filter((e) => e.aktiv).map((e) => (
            <Link
              key={e.slug}
              href={`/${e.slug}`}
              className="hover:text-primary transition-colors duration-200"
            >
              {e.navn}
            </Link>
          ))}

          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1 hover:text-primary transition-colors duration-200 cursor-default"
            >
              Udstyr <ChevronDown />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
              <div className="w-44 rounded-xl border border-border/50 bg-card p-1.5 shadow-lg">
                <DropdownItem href="/mus">Mus</DropdownItem>
                <DropdownItem href="/tastaturer">Tastaturer</DropdownItem>
                <DropdownItem href="/musemaatter">Musemåtter</DropdownItem>
                <DropdownItem href="/headset">Headsets</DropdownItem>
              </div>
            </div>
          </div>

          <div className="relative group">
            <Link
              href="/guides"
              className="flex items-center gap-1 hover:text-primary transition-colors duration-200"
            >
              Guides <ChevronDown />
            </Link>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
              <div className="w-44 rounded-xl border border-border/50 bg-card p-1.5 shadow-lg">
                <DropdownItem href="/find-mus">Find mus</DropdownItem>
                <DropdownItem href="/guides">Købsguides</DropdownItem>
              </div>
            </div>
          </div>
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
            <Link
              href="/pros"
              className="py-3 font-medium text-foreground hover:text-primary transition-colors duration-200"
              onClick={() => setOpen(false)}
            >
              Pros
            </Link>
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
            <details className="group">
              <summary className="py-3 list-none [&::-webkit-details-marker]:hidden flex items-center justify-between cursor-pointer hover:text-primary transition-colors duration-200">
                Udstyr
                <ChevronDown />
              </summary>
              <div className="flex flex-col pl-4 border-l border-border/50 ml-1 mb-2">
                <DropdownItem href="/mus" close={() => setOpen(false)}>Mus</DropdownItem>
                <DropdownItem href="/tastaturer" close={() => setOpen(false)}>Tastaturer</DropdownItem>
                <DropdownItem href="/musemaatter" close={() => setOpen(false)}>Musemåtter</DropdownItem>
                <DropdownItem href="/headset" close={() => setOpen(false)}>Headsets</DropdownItem>
              </div>
            </details>
            <details className="group">
              <summary className="py-3 list-none [&::-webkit-details-marker]:hidden flex items-center justify-between cursor-pointer hover:text-primary transition-colors duration-200">
                Guides
                <ChevronDown />
              </summary>
              <div className="flex flex-col pl-4 border-l border-border/50 ml-1 mb-2">
                <DropdownItem href="/find-mus" close={() => setOpen(false)}>Find mus</DropdownItem>
                <DropdownItem href="/guides" close={() => setOpen(false)}>Købsguides</DropdownItem>
              </div>
            </details>
          </nav>
        </div>
      )}
    </header>
  );
}
