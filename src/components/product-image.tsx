"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/5 to-primary/10",
          className
        )}
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-primary/30">
            {alt.charAt(0).toUpperCase()}
          </div>
          <div className="text-[10px] text-muted-foreground/40 mt-1">{alt}</div>
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
        className="object-contain p-2 transition-transform duration-300 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, 300px"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
