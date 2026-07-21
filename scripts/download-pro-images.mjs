import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROS_TS = join(__dirname, "..", "src", "data", "pros.ts");
const IMG_DIR = join(__dirname, "..", "public", "images", "pros");

if (!existsSync(IMG_DIR)) mkdirSync(IMG_DIR, { recursive: true });

const content = readFileSync(PROS_TS, "utf-8");
const slugMatches = [...content.matchAll(/slug: "([^"]+)"/g)];
const navnMatches = [...content.matchAll(/navn: "([^"]+)"/g)];
const esportMatches = [...content.matchAll(/esport: "([^"]+)"/g)];

const allPros = [];
for (let i = 0; i < slugMatches.length; i++) {
  allPros.push({
    slug: slugMatches[i][1],
    navn: navnMatches[i][1],
    esport: esportMatches[i][1],
  });
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function getImageUrl(slug) {
  // Try direct PNG
  let url = `https://prosettings.net/wp-content/uploads/${slug}.png`;
  let resp = await fetch(url, { method: "HEAD" });
  if (resp.ok) return { url, ext: "png" };

  // Try direct WEBP
  url = `https://prosettings.net/wp-content/uploads/${slug}.webp`;
  resp = await fetch(url, { method: "HEAD" });
  if (resp.ok) return { url, ext: "webp" };

  // Fallback: fetch player page and parse og:image
  const pageUrl = `https://prosettings.net/players/${slug}/`;
  try {
    const pageResp = await fetch(pageUrl, { headers: { "User-Agent": UA } });
    if (pageResp.ok) {
      const html = await pageResp.text();
      const ogMatch = html.match(/og:image[^>]*content=["']([^"']+)["']/);
      if (ogMatch) {
        const imgUrl = ogMatch[1];
        const ext = imgUrl.split(".").pop()?.split("?")[0] || "png";
        return { url: imgUrl, ext };
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
}

const results = [];
for (const pro of allPros) {
  const existing = join(IMG_DIR, `${pro.slug}.png`);
  if (existsSync(existing)) {
    console.log(`✓ ${pro.slug.padEnd(20)} already exists`);
    results.push({ slug: pro.slug, status: "exists" });
    continue;
  }

  const info = await getImageUrl(pro.slug);
  if (!info) {
    console.log(`✗ ${pro.slug.padEnd(20)} no image found`);
    results.push({ slug: pro.slug, status: "not_found" });
    continue;
  }

  try {
    const imgResp = await fetch(info.url, {
      headers: { "User-Agent": UA, Referer: "https://prosettings.net/" },
    });
    if (!imgResp.ok) {
      console.log(`✗ ${pro.slug.padEnd(20)} download failed (${imgResp.status})`);
      results.push({ slug: pro.slug, status: "download_failed" });
      continue;
    }

    const buffer = Buffer.from(await imgResp.arrayBuffer());
    const filename = `${pro.slug}.${info.ext}`;
    writeFileSync(join(IMG_DIR, filename), buffer);
    console.log(`✓ ${pro.slug.padEnd(20)} → ${filename} (${buffer.length} bytes)`);
    results.push({ slug: pro.slug, status: "ok", file: filename, size: buffer.length });
  } catch (err) {
    console.log(`! ${pro.slug.padEnd(20)} error: ${err.message}`);
    results.push({ slug: pro.slug, status: "error" });
  }

  // Small delay to avoid rate limiting
  await new Promise((r) => setTimeout(r, 500));
}

// Summary
console.log("\n--- Summary ---");
const ok = results.filter((r) => r.status === "ok").length;
const exists = results.filter((r) => r.status === "exists").length;
const failed = results.filter((r) => r.status !== "ok" && r.status !== "exists").length;
console.log(`Downloaded: ${ok}, Already existed: ${exists}, Failed: ${failed}`);
const failedList = results.filter((r) => r.status !== "ok" && r.status !== "exists");
for (const f of failedList) {
  console.log(`  FAILED: ${f.slug} (${f.status})`);
}

writeFileSync(join(__dirname, "..", "pro-images-result.json"), JSON.stringify(results, null, 2));
console.log("\nResults saved to pro-images-result.json");
