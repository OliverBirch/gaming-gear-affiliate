import Link from "next/link";
import type { ReactNode } from "react";

export type SpecRow = [label: string, value: ReactNode, linkHref?: string];

interface SpecTableProps {
  title: string;
  rows: SpecRow[];
}

/** Titled spec-table card shared by every product detail page. */
export function SpecTable({ title, rows }: SpecTableProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-7">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([label, value, linkHref]) => (
            <tr key={label} className="border-b border-border/50 last:border-0">
              <td className="py-2.5 text-muted-foreground pr-4 whitespace-nowrap">{label}</td>
              <td className="py-2.5 font-medium">
                {linkHref ? (
                  <Link href={linkHref} className="hover:text-primary transition-colors">
                    {value}
                  </Link>
                ) : (
                  value
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
