import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine des classes CSS conditionnellement avec clsx, puis merge avec tailwind-merge.
 * Très utile pour composer des className avec Tailwind proprement.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}
