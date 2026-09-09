#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Adapted from the existing blog OG template; render a new Global asset only.
const brandRoot = process.argv[2];
if (!brandRoot) throw new Error("Pass the canonical Brand Kit directory.");
const tokens = JSON.parse(readFileSync(resolve(brandRoot, "tokens.json"), "utf8"));
const color = Object.fromEntries(Object.entries(tokens.web.color).map(([k, v]) => [k, v.value]));
const logo = readFileSync(resolve(brandRoot, tokens.web.logo.value)).toString("base64");
const font = [tokens.web.font.sans.value, ...tokens.web.font.sans.fallback].join(", ");
const mono = [tokens.web.font.mono.value, ...tokens.web.font.mono.fallback].join(", ");
const slug = "global-creative-tests-20260908";
const title = "Local signals in. A clearer test next.";
const eyebrow = "ORCOOL GLOBAL";
const subtitle = "Market evidence and local judgment. KPI + durability decide the result.";

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrap(value, max = 28, maxLines = 3) {
  const words = value.trim().split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines - 1);
    kept.push(lines.slice(maxLines - 1).join(" "));
    return kept;
  }
  return lines;
}

const lines = ["Local signals in.", "A clearer test next."];
const titleSize = lines.length === 1 ? 76 : lines.length === 2 ? 70 : 62;
const titleLines = lines.map((line, index) =>
  `<text x="72" y="${220 + index * 78}" fill="${color.ink}" font-family="${font}" font-size="${titleSize}" font-weight="700" letter-spacing="-2.4">${escapeXml(line)}</text>`
).join("\n  ");

const outputDir = resolve("assets", "og");
mkdirSync(outputDir, { recursive: true });
const svgPath = resolve(outputDir, slug + ".svg");
const pngPath = resolve(outputDir, slug + ".png");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <filter id="blur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="72"/></filter>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color.red}"/>
      <stop offset="0.36" stop-color="${color.yellow}"/>
      <stop offset="0.7" stop-color="${color.green}"/>
      <stop offset="1" stop-color="${color.blue}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="${color.bg}"/>
  <rect x="0" y="0" width="14" height="630" fill="${color.red}"/>
  <circle cx="1060" cy="620" r="330" fill="url(#glow)" opacity="0.48" filter="url(#blur)"/>
  <image x="72" y="48" width="220" height="36.1" preserveAspectRatio="xMinYMin meet" xlink:href="data:image/png;base64,${logo}"/>
  <text x="1128" y="82" text-anchor="end" fill="${color.grey}" font-family="${mono}" font-size="15">get.orcool.com/global</text>
  <text x="72" y="158" fill="${color.red}" font-family="${mono}" font-size="16" font-weight="700" letter-spacing="2.6">${escapeXml(eyebrow.toUpperCase())}</text>
  ${titleLines}
  <line x1="72" y1="520" x2="1128" y2="520" stroke="${color.ink}" stroke-opacity="0.18"/>
  <text x="72" y="570" fill="${color.ink}" font-family="${font}" font-size="22">${escapeXml(subtitle)}</text>
</svg>\n`;

writeFileSync(svgPath, svg, "utf8");
execFileSync("/usr/bin/sips", ["-s", "format", "png", svgPath, "--out", pngPath], { stdio: "ignore" });
console.log(`${slug}: ${pngPath}`);
