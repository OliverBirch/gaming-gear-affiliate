interface Props {
  className?: string;
}

function makePoints(seed: number) {
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };

  // Wide-field grid (viewBox 200×100) — denser so edges feel like a network, not tiles
  const cols = 10;
  const rows = 6;
  const jitter = 8;
  const width = 200;
  const height = 100;

  const points: { x: number; y: number }[] = [];
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const cx = (col / cols) * width;
      const cy = (row / rows) * height;
      const jx = (rng() - 0.5) * jitter;
      const jy = (rng() - 0.5) * jitter;
      points.push({
        x: Math.min(width, Math.max(0, cx + jx)),
        y: Math.min(height, Math.max(0, cy + jy)),
      });
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
  while (glowNodes.size < 6) glowNodes.add(Math.floor(rng() * points.length));

  return { points, triangles, glowNodes };
}

const { points, triangles, glowNodes } = makePoints(42);

export function HeroLowPoly({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 100"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Soft vignette inside the SVG (CSS on the page also fades edges) */}
        <radialGradient id="lp-radial-mask" cx="50%" cy="48%" r="62%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="40%" stopColor="white" stopOpacity="0.9" />
          <stop offset="72%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lp-vertical-mask" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="45%" stopColor="white" stopOpacity="0" />
          <stop offset="55%" stopColor="white" stopOpacity="1" />
          <stop offset="80%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        {/* Multiply-like: paint vertical first, then radial as white-on-black via mask */}
        <mask id="lp-edge-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="100">
          <rect width="200" height="100" fill="url(#lp-vertical-mask)" />
        </mask>
        <mask id="lp-radial-only" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="100">
          <rect width="200" height="100" fill="url(#lp-radial-mask)" />
        </mask>
      </defs>

      <g mask="url(#lp-edge-mask)">
        <g mask="url(#lp-radial-only)">
          {triangles.map(([a, b, c], i) => (
            <polygon
              key={i}
              points={`${points[a].x},${points[a].y} ${points[b].x},${points[b].y} ${points[c].x},${points[c].y}`}
              fill="oklch(0.717 0.176 22.6 / 0.045)"
              stroke="oklch(0.717 0.176 22.6 / 0.14)"
              strokeWidth="0.12"
              strokeLinejoin="round"
            />
          ))}

          {points.map((p, i) => (
            <g key={i}>
              {glowNodes.has(i) && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="1.8"
                  fill="oklch(0.717 0.176 22.6 / 0.1)"
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={glowNodes.has(i) ? "0.45" : "0.22"}
                fill="oklch(0.717 0.176 22.6 / 0.28)"
              />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
