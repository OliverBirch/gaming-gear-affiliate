import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          ProMus.dk
        </Link>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/cs2" className="hover:text-primary transition-colors duration-200">
            CS2
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
