import Redis from "ioredis";

const url = process.env.REDIS_URL;
if (!url && process.env.NODE_ENV !== "test") {
  console.warn("[redis] REDIS_URL not set — using in-memory fallback");
}

const fallback = new Map<string, string>();
/** In-memory TTL bookkeeping when REDIS_URL is unset. */
const fallbackExpiry = new Map<string, number>();

function createClient(): Redis | typeof fallback {
  if (!url) return fallback;

  const client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 0,
    retryStrategy() {
      return null;
    },
  });

  client.on("error", () => {});
  return client;
}

const client = createClient();

export async function redisGet<T>(key: string): Promise<T | null> {
  if (client instanceof Map) {
    const exp = fallbackExpiry.get(key);
    if (exp != null && Date.now() > exp) {
      client.delete(key);
      fallbackExpiry.delete(key);
      return null;
    }
    const raw = client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }
  try {
    const raw = await client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Batched read for a set of keys in one round trip. Building pages calls
 * getOfferOverride() per (product, offer) — easily 1000+ calls per build —
 * so prices.ts preloads every known key through this instead of one
 * redisGet() per pair once a real REDIS_URL is connected.
 */
export async function redisMget<T>(keys: string[]): Promise<(T | null)[]> {
  if (keys.length === 0) return [];
  if (client instanceof Map) {
    return keys.map((key) => {
      const exp = fallbackExpiry.get(key);
      if (exp != null && Date.now() > exp) {
        client.delete(key);
        fallbackExpiry.delete(key);
        return null;
      }
      const raw = client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    });
  }
  try {
    const raw = await client.mget(...keys);
    return raw.map((r) => (r ? (JSON.parse(r) as T) : null));
  } catch {
    return keys.map(() => null);
  }
}

/**
 * Lists every key starting with `prefix`. Used where the key set isn't
 * known ahead of time (e.g. `feedcandidate:{retailer}:{slug}` — the slugs
 * are only known once a sync run has found them), unlike price: or ticket:
 * keys where the caller always knows the exact key. Uses SCAN rather than
 * KEYS against a real Redis so an admin-page read never blocks the server
 * on a large keyspace.
 */
export async function redisKeys(prefix: string): Promise<string[]> {
  if (client instanceof Map) {
    return [...client.keys()].filter((k) => k.startsWith(prefix));
  }
  try {
    const found: string[] = [];
    let cursor = "0";
    do {
      const [next, batch] = await client.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 200);
      found.push(...batch);
      cursor = next;
    } while (cursor !== "0");
    return found;
  } catch {
    return [];
  }
}

export async function redisDel(key: string): Promise<void> {
  if (client instanceof Map) {
    client.delete(key);
    fallbackExpiry.delete(key);
    return;
  }
  try {
    await client.del(key);
  } catch {
    // silently fall back
  }
}

export async function redisSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  const json = JSON.stringify(value);
  if (client instanceof Map) {
    client.set(key, json);
    if (ttlSeconds != null && ttlSeconds > 0) {
      fallbackExpiry.set(key, Date.now() + ttlSeconds * 1000);
    } else {
      fallbackExpiry.delete(key);
    }
    return;
  }
  try {
    if (ttlSeconds != null && ttlSeconds > 0) {
      await client.set(key, json, "EX", ttlSeconds);
    } else {
      await client.set(key, json);
    }
  } catch {
    // silently fall back
  }
}
