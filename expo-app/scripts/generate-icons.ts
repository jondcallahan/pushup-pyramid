#!/usr/bin/env bun
/**
 * Convert SVG icons to PNG for app icons
 * Usage: bun scripts/generate-icons.ts
 */

import sharp from "sharp";
import { join } from "path";

const ASSETS_DIR = join(import.meta.dir, "../assets");

async function main() {
  // Convert production icon (green)
  await sharp(join(ASSETS_DIR, "icon.svg"))
    .resize(1024, 1024)
    .png()
    .toFile(join(ASSETS_DIR, "icon-1024.png"));
  console.log("✓ Generated icon-1024.png (production/green)");

  // Convert dev icon (blue)
  await sharp(join(ASSETS_DIR, "icon-dev.svg"))
    .resize(1024, 1024)
    .png()
    .toFile(join(ASSETS_DIR, "icon-dev-1024.png"));
  console.log("✓ Generated icon-dev-1024.png (dev/blue)");

  console.log("\nDone! Icons generated in assets/");
}

main().catch(console.error);
