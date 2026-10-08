// Convert the archived WordPress REST dump (archive/wp-json) into Markdown
// staging files under migration/content/<type>/<slug>/index.md, copying each
// referenced upload alongside so the folders drop straight into Astro collections.
//
// Usage: node scripts/wp-export.mjs   (run from repo root or scripts/)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dump = path.join(root, 'archive/wp-json');
const mediaDir = path.join(root, 'archive/media');
const outDir = path.join(root, 'migration/content');
const UPLOADS = /https?:\/\/samuelkordik\.com\/wp-content\/uploads\/([^"'\s)?#]+)/g;

const load = (f) => JSON.parse(fs.readFileSync(path.join(dump, f), 'utf8'));
const byId = (list) => Object.fromEntries(list.map((t) => [t.id, t.name]));
const cats = byId(load('categories.json'));
const tags = byId(load('tags.json'));

const decode = (s) => cheerio.load(`<p>${s}</p>`)('p').text().trim();

// Pages built with Elementor/Spectra layouts get rewritten by hand in Phase 2;
// they are still exported so the copy is easy to mine.
const SKIP_PAGES = new Set(['sample-page', 'blog']);

function cleanHtml(html) {
  const $ = cheerio.load(html, null, false);

  // code-block-pro: raw source is in the copy-button textarea, language in the header span.
  $('.wp-block-kevinbatdorf-code-block-pro').each((_, el) => {
    const $el = $(el);
    const code = $el.find('textarea').first().text();
    const lang = ($el.children('span').first().text() || '').trim().toLowerCase().replace(/\s+/g, '');
    $el.replaceWith($('<pre>').append($('<code>').addClass(`language-${lang || 'text'}`).text(code)));
  });

  // WP footnotes block → Markdown footnote definitions.
  $('ol.wp-block-footnotes').each((_, ol) => {
    const defs = $(ol).children('li').map((i, li) => {
      $(li).find('a[href$="-link"]').remove();
      return `<p>[^${i + 1}]: ${$(li).html().trim()}</p>`;
    }).get();
    $(ol).replaceWith(defs.join(''));
  });

  $('style, script, noscript, svg, form, .screen-reader-text').remove();
  // Footnote superscripts → plain [^n] markers are handled by turndown below.
  return $.html();
}

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
td.use(gfm);
td.addRule('fencedWithLang', {
  filter: (n) => n.nodeName === 'PRE' && n.firstChild?.nodeName === 'CODE',
  replacement: (_, n) => {
    const lang = (n.firstChild.getAttribute('class') || '').replace(/^language-/, '');
    return `\n\n\`\`\`${lang}\n${n.firstChild.textContent.replace(/\n$/, '')}\n\`\`\`\n\n`;
  },
});
td.addRule('footnoteRef', {
  filter: (n) => n.nodeName === 'SUP' && n.getAttribute('class') === 'fn',
  replacement: (_, n) => `[^${n.textContent.trim()}]`,
});
td.addRule('figure', {
  filter: 'figure',
  replacement: (content) => `\n\n${content.trim()}\n\n`,
});

function localizeMedia(md, destDir) {
  const used = new Set();
  const out = md.replace(UPLOADS, (_, rel) => {
    // WP often links resized variants (-1024x682); fall back to the full-size file we archived.
    let src = path.join(mediaDir, rel);
    if (!fs.existsSync(src)) src = path.join(mediaDir, rel.replace(/-\d+x\d+(\.\w+)$/, '$1'));
    if (!fs.existsSync(src)) src = path.join(mediaDir, rel.replace(/-\d+x\d+(\.\w+)$/, '-scaled$1'));
    if (!fs.existsSync(src)) return `https://samuelkordik.com/wp-content/uploads/${rel}`; // left for manual review
    const name = path.basename(src);
    used.add(src);
    fs.copyFileSync(src, path.join(destDir, name));
    return `./${name}`;
  });
  return { md: out, count: used.size };
}

const yaml = (obj) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && !(Array.isArray(v) && !v.length))
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? `[${v.map((x) => JSON.stringify(x)).join(', ')}]` : JSON.stringify(v)}`)
    .join('\n');

function write(type, item, extra = {}) {
  const dir = path.join(outDir, type, item.slug);
  fs.mkdirSync(dir, { recursive: true });
  const md0 = td.turndown(cleanHtml(item.content.rendered)).replace(/\n{3,}/g, '\n\n').replace(/^\\\[\^(\d+)\\\]:/gm, '[^$1]:').trim();
  const { md, count } = localizeMedia(md0, dir);
  const fm = yaml({
    title: decode(item.title.rendered),
    description: item.excerpt ? decode(item.excerpt.rendered).replace(/\s*\[…\]$/, '').slice(0, 200) : undefined,
    pubDate: item.date?.slice(0, 10),
    updatedDate: item.modified?.slice(0, 10),
    wpUrl: item.link,
    ...extra,
  });
  fs.writeFileSync(path.join(dir, 'index.md'), `---\n${fm}\n---\n\n${md}\n`);
  const leftover = (md.match(UPLOADS) || []).length;
  console.log(`${type}/${item.slug}  images:${count}${leftover ? `  UNRESOLVED:${leftover}` : ''}`);
}

fs.rmSync(outDir, { recursive: true, force: true });

for (const p of load('posts.json')) {
  write('writing', p, {
    tags: [...(p.categories || []).map((c) => cats[c]), ...(p.tags || []).map((t) => tags[t])].filter(
      (t, i, a) => t && t !== 'Uncategorized' && a.findIndex((x) => x.toLowerCase() === t.toLowerCase()) === i,
    ),
  });
}
for (const p of load('pages.json')) {
  if (!SKIP_PAGES.has(p.slug)) write('pages', p);
}
