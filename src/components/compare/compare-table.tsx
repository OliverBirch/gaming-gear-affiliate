import type { Mouse } from "@/lib/types";
import { mouseSpecRows } from "@/lib/compare/mice";
import { highlightWinner } from "@/lib/compare/highlight";
import { cn } from "@/lib/utils";
import {
  CompareEmptyHeader,
  CompareProductHeader,
} from "./compare-product-header";

const GROUP_LABELS: Record<string, string> = {
  overview: "Overblik",
  size: "Størrelse",
  sensor: "Sensor",
  features: "Funktioner",
  social: "Pro-brug",
  price: "Pris",
};

function ValueCell({
  children,
  win,
  emphasize,
  edge,
}: {
  children: React.ReactNode;
  win: boolean;
  emphasize?: boolean;
  edge?: boolean;
}) {
  return (
    <td
      className={cn(
        "py-2.5 px-3 text-sm text-center align-middle",
        edge && "border-l border-border/40",
        win && "text-primary font-semibold",
        emphasize && !win && "font-medium"
      )}
    >
      {children}
      {win && <span className="sr-only"> (bedre)</span>}
    </td>
  );
}

export function CompareTable({
  mouseA,
  mouseB,
}: {
  mouseA: Mouse | null;
  mouseB: Mouse | null;
}) {
  const both = mouseA != null && mouseB != null;
  const body: React.ReactNode[] = [];
  let lastGroup = "";

  for (const row of mouseSpecRows) {
    if (row.group !== lastGroup) {
      lastGroup = row.group;
      body.push(
        <tr key={`g-${row.group}`} className="bg-muted/30">
          <td
            colSpan={3}
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {GROUP_LABELS[row.group] ?? row.group}
          </td>
        </tr>
      );
    }

    const valA = mouseA ? row.getValue(mouseA) : null;
    const valB = mouseB ? row.getValue(mouseB) : null;
    const side =
      both && mouseA && mouseB ? highlightWinner(row, valA, valB) : null;
    const winA = side === "a" || side === "both";
    const winB = side === "b" || side === "both";

    body.push(
      <tr key={row.id} className="border-b border-border/40 last:border-0">
        <th
          scope="row"
          className={cn(
            "sticky left-0 z-10 bg-card py-2.5 pl-3 pr-2 text-left text-sm text-muted-foreground font-normal whitespace-nowrap",
            row.emphasize && "font-medium text-foreground/80"
          )}
        >
          {row.label}
        </th>
        <ValueCell win={winA} emphasize={row.emphasize}>
          {mouseA ? row.format(valA) : "–"}
        </ValueCell>
        <ValueCell win={winB} emphasize={row.emphasize} edge>
          {mouseB ? row.format(valB) : "–"}
        </ValueCell>
      </tr>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse">
          <thead>
            <tr className="border-b border-border/50">
              <th className="sticky left-0 z-10 bg-card w-28 sm:w-36 p-2 text-left text-xs font-medium text-muted-foreground" />
              <th className="w-[40%] min-w-[140px] p-0 font-normal align-bottom">
                {mouseA ? (
                  <CompareProductHeader mouse={mouseA} />
                ) : (
                  <CompareEmptyHeader label="Vælg første mus" />
                )}
              </th>
              <th className="w-[40%] min-w-[140px] p-0 font-normal align-bottom border-l border-border/40">
                {mouseB ? (
                  <CompareProductHeader mouse={mouseB} />
                ) : (
                  <CompareEmptyHeader label="Vælg anden mus" />
                )}
              </th>
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
    </div>
  );
}
