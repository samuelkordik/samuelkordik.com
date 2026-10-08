// Render each mockup HTML to desktop (1440) and mobile (390) full-page PNGs.
// Run inside mcr.microsoft.com/playwright (see README in this folder).
import { chromium } from 'playwright';
import fs from 'node:fs';
const only = process.argv[2];
const pages = fs.readdirSync('.').filter((f) => /^[a-d]-.*\.html$/.test(f) && (!only || f.startsWith(only)));
const browser = await chromium.launch();
for (const f of pages) {
  for (const [label, width, scale] of [['desktop', 1440, 1], ['mobile', 390, 2]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: scale });
    await page.goto(`file://${process.cwd()}/${f}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const out = `png/${f.replace('.html', '')}-${label}.png`;
    await page.screenshot(label === 'mobile' ? { path: out, fullPage: true, clip: { x: 0, y: 0, width, height: Math.min(2400, await page.evaluate(() => document.body.scrollHeight)) } } : { path: out, fullPage: true });
    console.log(out);
    await page.close();
  }
}
await browser.close();
