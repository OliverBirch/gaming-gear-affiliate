import { cn } from "@/lib/utils";

interface ProsConsListProps {
  title: string;
  items: string[];
  variant: "pro" | "con";
}

/** Fordele/ulemper card shared by every product detail page. Hides itself when empty. */
export function ProsConsList({ title, items, variant }: ProsConsListProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-card p-7">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className={cn("mt-0.5 shrink-0", variant === "pro" ? "text-primary" : "text-destructive")}>
              {variant === "pro" ? "+" : "−"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
