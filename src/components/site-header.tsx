import Link from "next/link";
import { esports } from "@/data/esports";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          ProSetups.dk
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
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
      </div>
    </header>
  );
}
