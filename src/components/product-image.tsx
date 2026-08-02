"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Overrides the default object-fit/padding on the loaded <Image>. */
  imageClassName?: string;
  /** `next/image` sizes attribute — differs per hero layout. */
  sizes?: string;
  /** Marks the image as LCP-critical; use on above-the-fold hero images. */
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  className,
  imageClassName = "object-contain p-4",
  sizes = "(max-width: 768px) 100vw, 300px",
  priority,
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
        <div className="text-5xl font-bold text-primary/10">
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
        className={cn("transition-transform duration-300 group-hover:scale-110", imageClassName)}
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
