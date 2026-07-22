import type { CSSProperties, ReactNode } from "react";
import styles from "./GrainGradient.module.css";

/** Any of these overrides the matching CSS custom property on the root. */
type GrainVars = Partial<{
  base: string;
  red1: string;
  red2: string;
  red3: string;
  red4: string;
  shadow: string;
  blur: string;
  grainOpacity: number | string;
  grainSize: string;
}>;

interface GrainGradientProps {
  /** Rendered above the background in a positioned content layer. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Slow ambient drift. Auto-disabled under prefers-reduced-motion. Default: true. */
  animate?: boolean;
  /** Fixed full-viewport background instead of filling the nearest positioned parent. */
  fixed?: boolean;
  /** Override any of the palette / feel variables. */
  vars?: GrainVars;
}

const VAR_MAP: Record<keyof GrainVars, string> = {
  base: "--bg",
  red1: "--red-1",
  red2: "--red-2",
  red3: "--red-3",
  red4: "--red-4",
  shadow: "--shadow",
  blur: "--blur",
  grainOpacity: "--grain-opacity",
  grainSize: "--grain-size",
};

/**
 * Grainy deep-red-on-black gradient background.
 * Server-component safe (no client hooks) - the drift is pure CSS.
 *
 * Usage as a full-page background:
 *   <GrainGradient fixed />
 *
 * Note: with `fixed`, the stage is positioned at z-index 0, so any in-flow
 * sibling content must be given its own stacking position (e.g. `relative z-10`)
 * or it will paint behind the background.
 *
 * Usage as a section background with content on top:
 *   <section style={{ position: "relative", minHeight: "100vh" }}>
 *     <GrainGradient>
 *       <div className="hero">...</div>
 *     </GrainGradient>
 *   </section>
 */
export function GrainGradient({
  children,
  className,
  style,
  animate = true,
  fixed = false,
  vars,
}: GrainGradientProps) {
  const cssVars: Record<string, string> = {};
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      if (value != null) cssVars[VAR_MAP[key as keyof GrainVars]] = String(value);
    }
  }

  const stageClass = [styles.stage, fixed ? styles.fixed : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      // Purely decorative when it carries no content, so hide it from AT.
      aria-hidden={children == null ? true : undefined}
      className={stageClass}
      style={{ ...cssVars, ...style } as CSSProperties}
    >
      <div className={`${styles.blobs} ${animate ? styles.animate : ""}`} />
      <div className={styles.grain} />
      {children != null && <div className={styles.content}>{children}</div>}
    </div>
  );
}

export default GrainGradient;
