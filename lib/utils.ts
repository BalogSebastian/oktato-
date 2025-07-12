// FÁJL 7: lib/utils.ts (ÚJ FÁJL - hiányzott)

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}