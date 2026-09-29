"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function readItems(key: string, limit: number): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value
      .filter((item): item is string => typeof item === "string" && item.length > 0)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export function useLocalStrings(key: string, limit: number) {
  const [items, setItems] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const itemsRef = useRef<string[]>([]);

  useEffect(() => {
    const stored = readItems(key, limit);
    itemsRef.current = stored;
    setItems(stored);
    setReady(true);
  }, [key, limit]);

  useEffect(() => {
    const sync = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.key !== key) return;
      const stored = readItems(key, limit);
      itemsRef.current = stored;
      setItems(stored);
    };
    window.addEventListener("storage", sync);
    window.addEventListener("foodscope:storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("foodscope:storage", sync);
    };
  }, [key, limit]);

  const save = useCallback(
    (next: string[]) => {
      const unique = Array.from(new Set(next)).slice(0, limit);
      itemsRef.current = unique;
      setItems(unique);
      try {
        window.localStorage.setItem(key, JSON.stringify(unique));
        window.dispatchEvent(new CustomEvent("foodscope:storage", { detail: { key } }));
      } catch {
        // Local preferences remain optional when storage is unavailable.
      }
    },
    [key, limit],
  );

  const add = useCallback(
    (value: string) => {
      const next = [value, ...itemsRef.current.filter((item) => item !== value)];
      save(next);
    },
    [save],
  );

  const remove = useCallback(
    (value: string) => save(itemsRef.current.filter((item) => item !== value)),
    [save],
  );

  const toggle = useCallback(
    (value: string) => {
      const current = itemsRef.current;
      save(current.includes(value) ? current.filter((item) => item !== value) : [value, ...current]);
    },
    [save],
  );

  const clear = useCallback(() => save([]), [save]);
  const has = useCallback((value: string) => itemsRef.current.includes(value), []);

  return { items, ready, add, remove, toggle, clear, has };
}
