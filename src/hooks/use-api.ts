"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseApiOptions<T> {
  /** Интервал polling в мс. 0 = без polling */
  intervalMs?: number;
  /** Зависимости для повторного fetch */
  deps?: any[];
  /** Принудительный stop */
  enabled?: boolean;
}

/**
 * Хук для polling API endpoints. Возвращает data, loading, error и refetch.
 */
export function useApi<T>(url: string, options: UseApiOptions<T> = {}) {
  const { intervalMs = 0, deps = [], enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      if (mountedRef.current) {
        setData(json);
        setError(null);
      }
    } catch (e: any) {
      if (mountedRef.current) setError(e.message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    if (intervalMs > 0) {
      timerRef.current = setInterval(fetchData, intervalMs);
    }

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchData, intervalMs, ...deps]);

  return { data, loading, error, refetch: fetchData };
}
