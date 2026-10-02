/**
 * Простой in-memory кэш для Binance API запросов.
 * Бережёт rate limit (Binance бане IP при превышении weight).
 *
 * По умолчанию кэширует на 30 секунд. Для баланса — на 15 секунд,
 * для цен — на 5 секунд.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Получить значение из кэша или выполнить fn() и сохранить результат.
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data;
  }
  const data = await fn();
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  return data;
}

/**
 * Очистить кэш (например, после ручного обновления настроек).
 */
export function clearCache(prefix?: string): void {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}
