# samuelkordik.com: personal site

Migration and redesign of **samuelkordik.com** from WordPress (Nixihost) to a static **Astro** site on **GitHub Pages**. The master plan with phases and decisions lives at `~/.claude/plans/the-purpose-of-this-functional-sunrise.md`; keep it current when decisions change.

## What the site is
Samuel Kordik's personal hub: EMS leader, data analyst, educator, and a **creative** (photography, design, video/audio production, writing). Sections: **Work** (mixed-media portfolio: data / design / photo / video) · **Writing** (blog) · **Teaching** (course pages + downloads; guides such as First Aid Kits) · **About** (incl. a personal/life section) · Resume. The tone is a thoughtful maker, not a corporate résumé.

## Status
- [x] Phase 0: repo init, WP archive, conversion script, design rounds 1–3
- [x] Phase 1: positioning + IA (Night shift palette, Barlow Semi Condensed + Barlow, hero line C1)
- [~] Phase 2: build. Site builds and all old URLs resolve. Waiting on Samuel's photos (3D prints, pets, travel, blurred family) and a review of new copy
- [~] Phase 3: repo https://github.com/samuelkordik/samuelkordik.com is live and Pages deploys on every push to `main`. The preview domain `new.samuelkordik.com` is set in Pages and waits on Samuel's Cloudflare CNAME (`new` → `samuelkordik.github.io`, DNS only). Then: enforce HTTPS, verify the domain in GitHub, and later cut the apex over and retire Nixihost.

## Stack & conventions
- **Astro** + MDX content collections (`src/content/{writing,work,teaching,guides}`), zod schemas in `src/content.config.ts`. Resume data lives in `src/data/resume.yaml`.
- Deployment: GitHub Actions (`withastro/action`) → GitHub Pages, repo `samuelkordik/samuelkordik.com` (public). The custom domain is set in repo Settings → Pages (a CNAME file is ignored by Actions deploys). Currently `new.samuelkordik.com` (preview); switch to `samuelkordik.com` at cutover.
- **Node 22 is required** (Astro 7). trantor's system Node is 20, so use the local install: `export PATH=$HOME/.local/opt/node22/bin:$PATH`. Never touch the system Node.
- Commands: `npm run dev -- --host 127.0.0.1`, `npm run build`, `npm run check`, `npx astro preview --host 127.0.0.1`. To view from another machine: `ssh -L 4321:127.0.0.1:4321 trantor`, then open http://localhost:4321.
- After changing URLs: run `node scripts/check-redirects.mjs` against a running preview. Every old WordPress URL must resolve.
- Screenshots: Playwright can't install on Ubuntu 20.04, so use the `mcr.microsoft.com/playwright:v1.56.0-noble` Docker image with `--network host` (see `mockups/README.md`).
- Images go in `src/assets/` (optimized by `astro:assets`). Downloadable files go in `public/files/` or `public/teaching/<course>/`.
- **Never commit video** or files >~25 MB (GH Pages: 100 MB/file hard limit, ~1 GB per site). Embed video from YouTube/Vimeo. Put big files on Cloudflare R2 if that ever comes up.
- **Old URLs must not break.** Every WordPress URL gets an entry in `astro.config.mjs` `redirects`. Legacy `/wp-content/uploads/...` PDFs that have been linked externally are copied to the same path under `public/`.
- **Privacy:** no photos of the kids (foster/adoptive family). Family can be mentioned in text only.
- Contact is an obfuscated mailto plus social links (no form backend).

## Domain / DNS (critical)
- DNS is on **Cloudflare** (nameservers gloria/sam.ns.cloudflare.com).
- **Email is Zoho.** MX `mx/mx2/mx3.zoho.com`, SPF `include:zoho.com`, and a `zoho-verification` TXT record. **Never touch MX/TXT records** during the cutover.
- Cutover plan: apex A/AAAA → GitHub Pages IPs, www CNAME → `samuelkordik.github.io`, DNS-only (grey cloud), verify the domain in GitHub settings, enforce HTTPS.
- Nixihost (old WP host) stays up as a fallback until the new site is verified and a full cPanel backup exists in `archive/`.

## Adding content
- **Post:** `src/content/writing/<slug>/index.md` (frontmatter: title, description, pubDate, tags; images sit beside it as `./img.jpg`). URL: `/writing/<slug>/`.
- **Guide:** `src/content/guides/<slug>/index.md`, same shape. Listed under Teaching.
- **Work item:** `src/content/work/<slug>/index.md`: title, summary, year, media (data/design/photo/video/audio/research/code/workshop), tools, cover, coverFit, featured, order, links, and optionally `href` to point the card at a post instead of a case-study page.
- **Course:** `src/content/courses/<slug>/index.md` (title, summary, updatedDate, files: [{label, file, size}]), with the files in `public/teaching/<slug>/`.
- **Ad-hoc shared file:** `public/files/<name>`, served at `/files/<name>`.
- **Resume and career chart:** edit `src/data/resume.yaml`. Both /about/ and /resume/ redraw from it. Site-wide facts (mission, email, social links, nav) live in `src/data/site.ts`.
- Animated GIFs go in `public/images/` (Astro's image pipeline would flatten them).

## Layout
- `archive/` (**gitignored**): WP REST JSON dump (`wp-json/`), downloaded media (`media/`, mirrors `wp-content/uploads/`), rendered HTML of key pages, and the cPanel backup once taken. It may contain secrets (wp-config). Never commit it.
- `scripts/`: one-off migration tooling (`wp-export.mjs`: WP JSON → Markdown).
- `mockups/`: design-direction mockups from Phase 0 (HTML; PNGs are gitignored and rendered via Docker, see `mockups/README.md`). Comparison page: https://claude.ai/artifact/3Frp2Ym3NJ2cBV612y7uuh
- `migration/content/` (**gitignored**): raw WP → Markdown output from `node scripts/wp-export.mjs`. The cleaned-up content now lives in `src/content/`.

## Working environment
Developed on `trantor` (headless Ubuntu 20.04 server, SSH-only; see `~/CLAUDE.md`). No local display: preview with `npm run dev -- --host 127.0.0.1` over an SSH tunnel, or render screenshots with headless Chromium (Playwright). Don't repoint system python3.

## Must preserve from the old server (found in archive/backup.zip)
- `/blood-check-character-calculator.html`: standalone tool. Copy it verbatim to `public/` at the same path. Never linked, excluded from the sitemap.
- `/headsooth/` (index.html + images): keep at the same path, never linked from the site, excluded from the sitemap.
- `/two_logos_small.png`: keep at the same path. **Samuel's email signature loads it.**
- `gnome.samuelkordik.com` (YOURLS shortener): retired. Delete its DNS record at cutover.
