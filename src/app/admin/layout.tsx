import Link from "next/link";
import { LayoutDashboard, ListChecks, ShoppingCart } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex gap-10">
        <nav className="w-48 shrink-0">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
            Admin
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/todo"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ListChecks className="h-4 w-4" />
              Opgaver
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-border/30">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Site:{" "}
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                prosetups.dk
              </Link>
            </p>
          </div>
        </nav>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
