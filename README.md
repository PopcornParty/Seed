# Seed — Minecraft Bedrock seed hunter

**Use it in the browser:** https://popcornparty.github.io/Seed/

Search runs on your computer inside the page. No server is required for Search, Simulator, Map, Statistics, or Benchmark.

If that link 404s for a minute, GitHub is still building the site. After the first build, turn on Pages if needed:

1. Repo **Settings → Pages**
2. Source: **GitHub Actions**  (or branch `gh-pages` / root)

This is **Bedrock only**. Java Edition is not implemented.

Correctness is first. Features that are not implemented are labelled `UNSUPPORTED` instead of being faked.

Repository: https://github.com/PopcornParty/Seed

## What works now (v0.2.0)

Structure *candidates* from published Bedrock region / salt / truncated MT19937 rules. Confirm in-game with `/locate`.

| Feature | Accuracy |
|---|---|
| Numeric 64-bit seed parse | EXACT |
| Structure candidate positions | VALIDATED candidate |
| Stronghold spiral | APPROXIMATE |
| Biomes / terrain / loot / Ancient City | UNSUPPORTED |

## Run locally

```bash
npm test
cd web && npm install && npm run dev
```

GitHub Pages URL after deploy: https://popcornparty.github.io/Seed/
