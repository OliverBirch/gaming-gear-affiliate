"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

const paddingClasses = {
  xs: "p-2",
  sm: "p-3",
  md: "p-4",
} as const;

const fallbackTextClasses = {
  xs: "text-2xl",
  sm: "text-3xl",
  md: "text-5xl",
} as const;

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** `next/image` sizes attribute — differs per hero layout. */
  sizes?: string;
  /** Marks the image as LCP-critical; use on above-the-fold hero images. */
  priority?: boolean;
  /** Inner breathing room around the product — xs/sm for compact/inline thumbnails, md (default) for cards and hero images. */
  padding?: keyof typeof paddingClasses;
}

export function ProductImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 300px",
  priority,
  padding = "md",
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/5 to-primary/10",
          className
        )}
      >
        <div className={cn("font-bold text-primary/10", fallbackTextClasses[padding])}>
          {alt.charAt(0).toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          "object-contain transition-transform duration-300 group-hover:scale-105",
          paddingClasses[padding]
        )}
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
