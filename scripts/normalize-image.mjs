// Trims an already-alpha-transparent product PNG to its content bounding box,
// then pads it onto a square canvas so the product's longest edge always
// fills the same fraction of the frame. Fixes inconsistent apparent size
// caused by source images having wildly different amounts of baked-in
// margin — object-contain in a fixed box can't fix that on its own.
//
// Run AFTER scripts/remove-background.mjs (or directly, if the source is
// already alpha-transparent). NOT a background remover itself — an image
// with no transparent border (fully opaque edge-to-edge) has nothing to
// trim and is left untouched.
//
// Usage: node scripts/normalize-image.mjs <input> <output> [--fill=0.92] [--threshold=10] [--max=1400]
//
// Deliberately has no minimum canvas size: object-fit: contain scales by
// aspect ratio, not pixel count, so a small canvas displays at the same
// size as a large one in the same CSS box — a forced minimum only means
// forced upscaling, which bakes blur into the file permanently. Downstream
// display softness for a genuinely low-res source is a source-quality
// problem, not something this script should paper over.

import sharp from "sharp";

const [, , input, output, ...rest] = process.argv;
if (!input || !output) {
  console.error(
    "Usage: node scripts/normalize-image.mjs <input> <output> [--fill=0.92] [--threshold=10] [--max=1400]"
  );
  process.exit(1);
}

const flag = (name, fallback) => {
  const arg = rest.find((a) => a.startsWith(`--${name}=`));
  return arg ? Number(arg.split("=")[1]) : fallback;
};
const FILL = flag("fill", 0.92); // fraction of the square canvas the content's longest edge should fill
const THRESHOLD = flag("threshold", 10); // sharp trim() tolerance
const MAX = flag("max", 1400); // maximum canvas size in px — downscales oversized sources only

const clamp = (n, hi) => Math.min(n, hi);

async function main() {
  let trimmed;
  try {
    trimmed = await sharp(input).trim({ threshold: THRESHOLD }).raw().toBuffer({ resolveWithObject: true });
  } catch (e) {
    console.warn(`${input}: nothing to trim (${e.message}) — leaving untouched`);
    process.exit(0);
  }

  const { data, info } = trimmed;
  const { width, height } = info;
  const canvasSize = clamp(Math.round(Math.max(width, height) / FILL), MAX);

  await sharp(data, { raw: { width, height, channels: info.channels } })
    .resize({
      width: canvasSize,
      height: canvasSize,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(output);

  console.log(`${output}: ${width}x${height} content -> ${canvasSize}x${canvasSize} canvas (fill=${FILL})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
