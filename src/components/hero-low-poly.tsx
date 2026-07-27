interface Props {
  className?: string;
}

function makePoints(seed: number) {
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };

  const cols = 5;
  const rows = 4;
  const jitter = 12;

  const points: { x: number; y: number }[] = [];
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const cx = (col / cols) * 100;
      const cy = (row / rows) * 100;
      const jx = (rng() - 0.5) * jitter;
      const jy = (rng() - 0.5) * jitter;
      points.push({ x: Math.min(100, Math.max(0, cx + jx)), y: Math.min(100, Math.max(0, cy + jy)) });
    }
  }

  const triangles: [number, number, number][] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tl = row * (cols + 1) + col;
      const tr = tl + 1;
      const bl = (row + 1) * (cols + 1) + col;
      const br = bl + 1;
      triangles.push([tl, tr, br]);
      triangles.push([tl, br, bl]);
    }
  }

  const glowNodes = new Set<number>();
  while (glowNodes.size < 4) glowNodes.add(Math.floor(rng() * points.length));

  return { points, triangles, glowNodes };
}

const { points, triangles, glowNodes } = makePoints(42);

export function HeroLowPoly({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lp-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.717 0.176 22.6 / 0.12)" />
          <stop offset="60%" stopColor="oklch(0.717 0.176 22.6 / 0.08)" />
          <stop offset="100%" stopColor="oklch(0.717 0.176 22.6 / 0)" />
        </linearGradient>
      </defs>

      <g>
        {triangles.map(([a, b, c], i) => (
          <polygon
            key={i}
            points={`${points[a].x},${points[a].y} ${points[b].x},${points[b].y} ${points[c].x},${points[c].y}`}
            fill="oklch(0.717 0.176 22.6 / 0.04)"
            stroke="oklch(0.717 0.176 22.6 / 0.06)"
            strokeWidth="0.15"
          />
        ))}
      </g>

      <g>
        {points.map((p, i) => (
          <g key={i}>
            {glowNodes.has(i) && (
              <circle cx={p.x} cy={p.y} r="1.2" fill="oklch(0.717 0.176 22.6 / 0.08)" />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={glowNodes.has(i) ? "0.35" : "0.2"}
              fill="oklch(0.717 0.176 22.6 / 0.2)"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
