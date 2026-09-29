"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import type { Product, SearchResults } from "@/lib/openfoodfacts/types";

export class ClientApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ClientApiError";
    this.status = status;
  }
}

const searchRequestTimes: number[] = [];

function enforceLocalSearchPacing() {
  const now = Date.now();
  while (searchRequestTimes.length > 0 && now - searchRequestTimes[0] > 60_000) {
    searchRequestTimes.shift();
  }
  if (searchRequestTimes.length >= 9) {
    throw new ClientApiError(
      "Du hast in kurzer Zeit viele Suchanfragen gestellt. Bitte warte einen Moment.",
      429,
    );
  }
  searchRequestTimes.push(now);
}

async function readJson<T>(response: Response): Promise<T> {
  const json: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof json === "object" &&
      json !== null &&
      "error" in json &&
      typeof json.error === "string"
        ? json.error
        : "Die Anfrage konnte nicht abgeschlossen werden.";
    throw new ClientApiError(message, response.status);
  }
  return json as T;
}

export function useProduct(barcode: string, enabled = true) {
  return useQuery({
    queryKey: ["product", barcode],
    queryFn: async () => {
      const response = await fetch("/api/product/" + encodeURIComponent(barcode), {
        cache: "no-store",
      });
      return readJson<Product>(response);
    },
    enabled: enabled && barcode.length > 0,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: (failureCount, error) =>
      error instanceof ClientApiError
        ? error.status >= 500 && failureCount < 1
        : failureCount < 1,
  });
}

export function useProducts(barcodes: string[]) {
  return useQueries({
    queries: barcodes.map((barcode) => ({
      queryKey: ["product", barcode],
      queryFn: async () => {
        const response = await fetch("/api/product/" + encodeURIComponent(barcode), {
          cache: "no-store",
        });
        return readJson<Product>(response);
      },
      staleTime: 60 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: (failureCount: number, error: unknown) =>
        error instanceof ClientApiError
          ? error.status >= 500 && failureCount < 1
          : failureCount < 1,
    })),
  });
}

export function useProductSearch(query: string, page: number, enabled = true) {
  return useQuery({
    queryKey: ["search", query, page],
    queryFn: async () => {
      enforceLocalSearchPacing();
      const params = new URLSearchParams({ q: query, page: String(page) });
      const response = await fetch("/api/search?" + params.toString(), { cache: "no-store" });
      return readJson<SearchResults>(response);
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) =>
      error instanceof ClientApiError
        ? error.status >= 500 && failureCount < 1
        : failureCount < 1,
  });
}
