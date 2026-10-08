// Verify every old WordPress URL still resolves on a running site.
// Usage: node scripts/check-redirects.mjs [baseUrl]   (default http://127.0.0.1:4321)
import fs from 'node:fs';

const base = process.argv[2] ?? 'http://127.0.0.1:4321';
const dump = (f) => JSON.parse(fs.readFileSync(new URL(`../archive/wp-json/${f}`, import.meta.url), 'utf8'));
const old = new Set(Object.keys(JSON.parse(fs.readFileSync(new URL('../src/redirects.json', import.meta.url), 'utf8'))));
for (const f of ['pages.json', 'posts.json']) for (const p of dump(f)) old.add(new URL(p.link).pathname);
// Files that must keep their exact path (email signature, external links).
for (const p of ['/two_logos_small.png', '/blood-check-character-calculator.html', '/headsooth/', '/wp-content/uploads/2024/12/2024-12-Samuel-Kordik-EMS-Resume.pdf', '/wp-content/uploads/2023/03/Samuel-Kordik-Data-Resume-Generic.pdf', '/wp-content/uploads/2024/08/2023-DFR-EMS-ANNUAL-REPORT-final.pdf']) old.add(p);

let bad = 0;
for (const path of [...old].sort()) {
  const res = await fetch(base + path, { redirect: 'follow' });
  let target = res.url.replace(base, '');
  // Astro's static redirects are meta-refresh pages; follow them.
  const html = res.headers.get('content-type')?.includes('html') ? await res.text() : '';
  const meta = html.match(/http-equiv="refresh" content="0;url=([^"]+)"/i);
  let status = res.status;
  if (meta) {
    const r2 = await fetch(new URL(meta[1], base + path));
    status = r2.status;
    target = new URL(meta[1], base + path).pathname;
  }
  const ok = status === 200;
  if (!ok) bad++;
  console.log(`${ok ? 'ok ' : 'BAD'} ${status} ${path}${target !== path ? ` → ${target}` : ''}`);
}
console.log(bad ? `\n${bad} URL(s) failed` : '\nAll old URLs resolve.');
process.exit(bad ? 1 : 0);
