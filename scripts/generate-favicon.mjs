import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "scripts", "favicon.svg");
const svg = readFileSync(svgPath);

const sizes = [16, 32, 48];
const pngBuffers = await Promise.all(
  sizes.map((size) =>
    sharp(svg).resize(size, size).png({ compressionLevel: 9 }).toBuffer(),
  ),
);

const ico = await pngToIco(pngBuffers);
writeFileSync(join(root, "src", "app", "favicon.ico"), ico);

const appleIcon = await sharp(svg).resize(180, 180).png().toBuffer();
writeFileSync(join(root, "src", "app", "apple-icon.png"), appleIcon);

const icon32 = await sharp(svg).resize(32, 32).png().toBuffer();
writeFileSync(join(root, "src", "app", "icon.png"), icon32);

console.log("Generated src/app/favicon.ico, icon.png, apple-icon.png");
