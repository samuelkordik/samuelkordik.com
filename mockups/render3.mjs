// Render r2-template.html per theme in themes3.json: a desktop crop of the top 1500px, plus full desktop + mobile for names passed as args.
import { chromium } from 'playwright';
import fs from 'node:fs';
const themes = JSON.parse(fs.readFileSync('themes3.json', 'utf8'));
const full = new Set(process.argv.slice(2));
const browser = await chromium.launch();
for (const [name, css] of Object.entries(themes)) {
  const views = [['crop', 1440, 1]].concat(full.has(name) ? [['desktop', 1440, 1], ['mobile', 390, 2]] : []);
  for (const [label, width, scale] of views) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: scale });
    await page.goto(`file://${process.cwd()}/r2-template.html`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: css });
    await page.evaluate(() => document.fonts.ready);
    const fam = await page.evaluate(() => getComputedStyle(document.querySelector('h1')).fontFamily);
    const ok = await page.evaluate((f) => document.fonts.check(`600 40px ${f.split(',')[0]}`), fam);
    const h = await page.evaluate(() => document.body.scrollHeight);
    const out = `png/r3-${name}-${label}.png`;
    const opts = label === 'desktop' ? { fullPage: true } : { fullPage: true, clip: { x: 0, y: 0, width, height: Math.min(label === 'crop' ? 1500 : 2400, h) } };
    await page.screenshot({ path: out, ...opts });
    console.log(out, fam.split(',')[0], ok ? 'font ok' : 'FONT MISSING');
    await page.close();
  }
}
await browser.close();
