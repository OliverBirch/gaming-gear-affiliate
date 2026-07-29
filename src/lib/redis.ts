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
