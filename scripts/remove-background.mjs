// Strips a white/near-white studio background from a product photo,
// leaving genuine alpha transparency. Border-seeded flood fill: only pixels
// reachable from the image edge through near-white pixels are treated as
// background, so white/light regions enclosed by the product (e.g. inside a
// keyboard's keycap gaps) are left alone. Two thresholds create a smooth
// alpha fade at the product's edge instead of a hard cutout, which avoids a
// visible halo from anti-aliased/drop-shadow pixels.
//
// Usage: node scripts/remove-background.mjs <input> <output> [--full=245] [--edge=200]
//
// NOT safe for white/translucent products shot on a white background — flood
// fill can't tell product from backdrop in that case. See bad-product-image
// tickets in src/data/freshness-tasks.ts for products deliberately excluded.

import sharp from "sharp";

const [, , input, output, ...rest] = process.argv;
if (!input || !output) {
  console.error("Usage: node scripts/remove-background.mjs <input> <output> [--full=245] [--edge=200]");
  process.exit(1);
}

const flag = (name, fallback) => {
  const arg = rest.find((a) => a.startsWith(`--${name}=`));
  return arg ? Number(arg.split("=")[1]) : fallback;
};
const FULL = flag("full", 245); // whiteness >= this → fully transparent
const EDGE = flag("edge", 200); // whiteness below this → never touched

async function main() {
  const image = sharp(input).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const whiteness = (idx) => Math.min(data[idx], data[idx + 1], data[idx + 2]);
  const isBg = new Uint8Array(width * height); // 1 = reachable from border through near-white

  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (isBg[p]) return;
    const idx = p * channels;
    if (whiteness(idx) < EDGE) return;
    isBg[p] = 1;
    queue.push(p);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length) {
    const p = queue.pop();
    const x = p % width;
    const y = (p - x) / width;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  for (let p = 0; p < width * height; p++) {
    if (!isBg[p]) continue;
    const idx = p * channels;
    const w = whiteness(idx);
    const alpha = w >= FULL ? 0 : Math.round(255 * ((FULL - w) / (FULL - EDGE)));
    data[idx + 3] = Math.min(data[idx + 3], alpha);
  }

  await sharp(data, { raw: { width, height, channels } })
    .png({ compressionLevel: 9 })
    .toFile(output);

  const transparent = [...isBg].filter((v) => v).length;
  console.log(
    `${output}: ${transparent}/${width * height} px flood-filled (${((transparent / (width * height)) * 100).toFixed(1)}%)`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
