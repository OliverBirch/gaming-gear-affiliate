import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight">
          ProMus.dk
        </Link>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/cs2" className="hover:text-foreground transition-colors">
            CS2
          </Link>
          <Link href="/find-mus" className="hover:text-foreground transition-colors">
            Find mus
          </Link>
          <Link href="/guides/greb" className="hover:text-foreground transition-colors">
            Greb-guide
          </Link>
        </nav>
      </div>
    </header>
  );
}
