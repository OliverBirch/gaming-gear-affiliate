import { readFileSync } from "node:fs";
import Redis from "ioredis";

const envFile = process.argv[2] ?? ".env.development.local";
const raw = readFileSync(envFile, "utf8");
const m = raw.match(/^REDIS_URL=(.*)$/m);
if (!m) {
  console.error(`No REDIS_URL in ${envFile}`);
  process.exit(1);
}
let url = m[1].trim();
if (/^(".*"|'.*')$/s.test(url)) url = url.slice(1, -1);
if (!url) {
  console.error("REDIS_URL is empty");
  process.exit(1);
}

const safeHost = url.replace(/^(\w+:\/\/)[^@]*@/, "$1***@");
console.log(`connecting to ${safeHost}`);

const client = new Redis(url, {
  connectTimeout: 10000,
  maxRetriesPerRequest: 1,
  lazyConnect: true,
});

let failed = false;
try {
  await client.connect();

  const pong = await client.ping();
  console.log(`PING -> ${pong}`);
  if (pong !== "PONG") throw new Error(`unexpected PING reply: ${pong}`);

  const stamp = new Date().toISOString();
  await client.set("keepalive:lastTouch", stamp);
  const readBack = await client.get("keepalive:lastTouch");
  console.log(`SET/GET keepalive:lastTouch -> ${readBack}`);
  if (readBack !== stamp) throw new Error(`read-back mismatch: ${readBack}`);

  console.log(`DBSIZE -> ${await client.dbsize()} keys`);
  console.log("OK — database is live and has been touched");
} catch (err) {
  failed = true;
  console.error(`FAILED: ${err?.message ?? err}`);
} finally {
  await client.quit().catch(() => client.disconnect());
}
process.exit(failed ? 1 : 0);
