import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function updateCompareUrl(barcodes: string[]): string {
  const params = new URLSearchParams();
  if (barcodes.length > 0) params.set("products", barcodes.join(","));
  const query = params.toString();
  return query ? "/compare?" + query : "/compare";
}
