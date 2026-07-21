import { cn } from "@/lib/utils";

interface ProAvatarProps {
  navn: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-lg",
  lg: "h-16 w-16 text-2xl",
};

export function ProAvatar({ navn, className, size = "sm" }: ProAvatarProps) {
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
