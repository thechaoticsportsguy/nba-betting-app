type Entry<T> = { expires: number; value: T };

const globalCache = globalThis as typeof globalThis & { __nbaCache?: Map<string, Entry<unknown>> };

if (!globalCache.__nbaCache) {
  globalCache.__nbaCache = new Map();
}

export async function withCache<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const existing = globalCache.__nbaCache?.get(key) as Entry<T> | undefined;

  if (existing && existing.expires > now) return existing.value;

  const value = await fn();
  globalCache.__nbaCache?.set(key, { value, expires: now + ttlSeconds * 1000 });
  return value;
}
