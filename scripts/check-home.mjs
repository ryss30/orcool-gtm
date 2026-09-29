import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/home-20260929.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'assets/home-20260929.js'), 'utf8');
const attrs = (name) => [...html.matchAll(new RegExp(name + '="([^"]*)"', 'g'))].map(m => m[1]);
const ids = attrs('id');
assert.equal(ids.length, new Set(ids).size, 'Duplicate IDs');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Exactly one H1');
assert.equal((html.match(/cloud\.umami\.is\/script\.js/g) || []).length, 1, 'One analytics provider');
assert(!html.includes('plausible.io'), 'No legacy analytics');
assert(html.includes('data-domains="get.orcool.com"'), 'Do not track localhost');
assert(html.includes('rel="canonical" href="https://get.orcool.com/"'), 'Canonical root');
assert(!html.includes('<form'), 'Do not add or reroute auth/lead forms');
for (const href of attrs('href')) {
  if (href.startsWith('#')) assert(ids.includes(href.slice(1)), 'Missing anchor ' + href);
  else if (href.startsWith('/')) {
    const [route, anchor] = href.split('#');
    const local = path.join(root, route.endsWith('/') ? route + 'index.html' : route);
    assert(fs.existsSync(local), 'Missing route ' + href);
    if (anchor) assert(fs.readFileSync(local, 'utf8').includes('id="' + anchor + '"'), 'Missing destination ' + href);
  }
}
for (const src of attrs('src').filter(v => v.startsWith('/'))) assert(fs.existsSync(path.join(root, src)), 'Missing asset ' + src);
for (const version of [25, 26, 27, 28]) assert(fs.statSync(path.join(root, 'assets/cases/yesim-lineage/c01-thailand-v' + version + '-web.mp4')).size > 500000, 'Missing video ' + version);
assert(html.includes('href="https://yesim.app"'), 'Preserve exact Yesim attribution URL');
assert(html.includes('No performance result is claimed'), 'Separate finished production from results');
assert(html.includes('Concept UI') && html.includes('AI-generated portrait'), 'Illustrative demo disclosed');
assert(css.includes('prefers-reduced-motion') && js.includes('prefers-reduced-motion'), 'Reduced motion support');
assert(js.includes('ArrowRight') && js.includes('ArrowLeft'), 'Keyboard tab navigation');
assert(!js.includes('fetch('), 'No new submissions or remote mutations');
assert(!/\$20|25 Evidence Runs|100 videos|guaranteed winner/.test(html), 'No inherited unverified commercial claims');
console.log('PASS: homepage assets, links/anchors, metadata, analytics, evidence boundaries, no form mutations, keyboard and motion hooks.');
