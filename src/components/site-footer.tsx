import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t mt-12">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} ProMus.dk — dansk esport-mus guide</p>
          <nav className="flex gap-4">
            <Link href="/om" className="hover:text-foreground transition-colors">
              Om
            </Link>
            <Link href="/transparens" className="hover:text-foreground transition-colors">
              Transparens
            </Link>
            <Link href="/privatliv" className="hover:text-foreground transition-colors">
              Privatliv
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
