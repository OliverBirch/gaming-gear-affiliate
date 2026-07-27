import Redis from "ioredis";

const url = process.env.REDIS_URL;
if (!url && process.env.NODE_ENV !== "test") {
  console.warn("[redis] REDIS_URL not set — using in-memory fallback");
}

const fallback = new Map<string, string>();

function createClient(): Pick<Redis, "get" | "set"> | typeof fallback {
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

export async function redisSet(key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  if (client instanceof Map) {
    client.set(key, json);
  } else {
    try {
      await client.set(key, json);
    } catch {
      // silently fall back
    }
  }
}
