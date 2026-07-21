import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 mt-12">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} ProSetups.dk — dansk esport-mus guide</p>
          <nav className="flex gap-4">
            <Link href="/om" className="hover:text-primary transition-colors duration-200">
              Om
            </Link>
            <Link href="/transparens" className="hover:text-primary transition-colors duration-200">
              Transparens
            </Link>
            <Link href="/privatliv" className="hover:text-primary transition-colors duration-200">
              Privatliv
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
