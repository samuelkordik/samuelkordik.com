// Render r2-template.html once per theme in themes.json (desktop full page + mobile top 2400px).
import { chromium } from 'playwright';
import fs from 'node:fs';
const themes = JSON.parse(fs.readFileSync('themes.json', 'utf8'));
const only = process.argv[2];
const browser = await chromium.launch();
for (const [name, css] of Object.entries(themes)) {
  if (only && !name.startsWith(only)) continue;
  for (const [label, width, scale] of [['desktop', 1440, 1], ['mobile', 390, 2]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: scale });
    await page.goto(`file://${process.cwd()}/r2-template.html`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: css });
    await page.evaluate(() => document.fonts.ready);
    const out = `png/r2-${name}-${label}.png`;
    const h = await page.evaluate(() => document.body.scrollHeight);
    await page.screenshot(label === 'mobile' ? { path: out, fullPage: true, clip: { x: 0, y: 0, width, height: Math.min(2400, h) } } : { path: out, fullPage: true });
    console.log(out);
    await page.close();
  }
}
await browser.close();
