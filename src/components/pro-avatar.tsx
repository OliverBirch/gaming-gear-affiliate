import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProAvatarProps {
  navn: string;
  billede?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-lg",
  lg: "h-16 w-16 text-2xl",
};

const imageSizes = {
  sm: 40,
  md: 48,
  lg: 64,
};

export function ProAvatar({ navn, billede, className, size = "sm" }: ProAvatarProps) {
  if (billede) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full shrink-0",
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={billede}
          alt={navn}
          fill
          className="object-cover"
          sizes={`${imageSizes[size]}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold shrink-0",
        "bg-gradient-to-br from-primary/20 to-cyan-500/10 text-primary",
        sizeClasses[size],
        className
      )}
    >
      {navn.charAt(0).toUpperCase()}
    </div>
  );
}
