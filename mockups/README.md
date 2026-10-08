# Design-direction mockups (Phase 0)

Static homepage samples for four directions (a–d). They use photos from `img/` (resized from `archive/media`).

Render to PNG (Playwright doesn't support Ubuntu 20.04, so it runs in Docker):

    docker run --rm -u $(id -u):$(id -g) -e HOME=/tmp -v "$PWD":/work -w /work \
      mcr.microsoft.com/playwright:v1.56.0-noble bash -c \
      "npm i -s --no-save --prefix /tmp/pw playwright@1.56.0 >/dev/null 2>&1 && ln -sf /tmp/pw/node_modules /work/node_modules && node render.mjs [prefix]; rm -f /work/node_modules"

Comparison page (private Artifact): https://claude.ai/artifact/3Frp2Ym3NJ2cBV612y7uuh

## Round 2 (type + palette exploration)
`r2-template.html` is the D-hybrid layout with every font/color as a CSS token. `themes.json` holds four overrides (Trail, Workshop, Literary, Night shift). `render2.mjs` renders each one (same docker command, `node render2.mjs [prefix]`).
