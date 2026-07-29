import { readFileSync, mkdirSync, existsSync, createWriteStream } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const MATCHES = JSON.parse(readFileSync(join(__dirname, "ultrashop-ean-matches.json"), "utf-8"));

const CATEGORY_DIRS = {
  mus: "mice",
  tastaturer: "keyboards",
  headset: "headsets",
  musemaatter: "mousepads",
  skaerme: "monitors",
};

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, { headers: { "User-Agent": "ProSetups/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        console.log(`  Skipped [${res.statusCode}]: ${url}`);
        return resolve(false);
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(true); });
    }).on("error", (e) => { file.close(); console.log(`  Failed: ${url} — ${e.message}`); resolve(false); });
  });
}

async function main() {
  const imagesDir = join(ROOT, "public", "images");

  for (const m of MATCHES) {
    if (!m.imageUrl) continue;
    const dirName = CATEGORY_DIRS[m.category] || m.category;
    const catDir = join(imagesDir, dirName);
    if (!existsSync(catDir)) mkdirSync(catDir, { recursive: true });

    const ext = extname(new URL(m.imageUrl).pathname) || ".jpg";
    const filename = `${m.slug}${ext}`;
    const dest = join(catDir, filename);

    if (existsSync(dest)) {
      console.log(`  Exists: ${dirName}/${filename}`);
      continue;
    }

    console.log(`  Downloading: ${dirName}/${filename} ← ${m.imageUrl}`);
    const ok = await download(m.imageUrl, dest);
    if (ok) {
      console.log(`    → /images/${dirName}/${filename}`);
    }
  }

  console.log("\nDone. Next: manually verify images, then update billede in data files.");
}

main().catch(console.error);
