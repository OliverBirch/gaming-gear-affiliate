import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Danish price rendering. Single source for the "N kr." suffix. */
export function formatPriceDkk(value: number): string {
  return `${value} kr.`
}
