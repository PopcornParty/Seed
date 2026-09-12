# Seed — Minecraft Bedrock seed hunter

Search Bedrock Edition world seeds for structure *candidates* using published
Bedrock region / salt / truncated Mersenne-Twister placement rules.

This is **Bedrock only**. Java Edition is not implemented.

Correctness is first. Features that are not implemented are labelled
`UNSUPPORTED` instead of being faked.

Repository: https://github.com/PopcornParty/Seed

## What works now (v0.2.0)

| Feature | Accuracy |
|---|---|
| Numeric 64-bit seed parse | EXACT |
| Structure candidate positions (village, temples, monument, mansion, outpost, treasure, shipwreck, ocean ruin, ruined portal, nether complex, end city) | VALIDATED candidate |
| Stronghold spiral (no biome window) | APPROXIMATE |
| Low-32-bit structure seed (MCPE-154939) | EXACT observation |
| Local worker search + live seeds/sec | real measurement |
| HTTP search API with job polling | real |
| Result export JSON / CSV / TXT | real |
| LocalStorage saved searches | real |
| Native C++ engine + parity tests vs TypeScript | real |
| Condition builder AND / OR, presets, ranking | real |
| Candidate map overlay | real (candidates only) |
| Benchmark page | real device measurement |
| Biome generation | UNSUPPORTED |
| Terrain / noise / height | UNSUPPORTED |
| Exact world spawn | UNSUPPORTED |
| Ancient City / Trail Ruins / Trial Chambers | UNSUPPORTED |
| Loot | UNSUPPORTED |
| Text seed hash | APPROXIMATE stand-in |

A candidate is the chunk Bedrock *tries* first. Without biome and terrain
checks the structure may not actually generate there.

## Repository layout

```
engine/core/          shared TypeScript engine
native/cpp/           same algorithms in C++
server/api/           HTTP API + worker thread
web/                  React + TypeScript UI
tests/parity/         TS tests + C++ gold vectors
docs/                 research and accuracy notes
.github/workflows/    CI
```

## Run locally

Needs Node 22+ (type stripping) and a C++17 compiler.

```bash
# TypeScript engine tests
npm test

# Native tests + optional CLI
npm run native:test
npm run native:build
./native/cpp/bedrock-seed-engine --start 0 --count 20000 --need village:500 --need ruined_portal:800

# API
npm run api
# http://127.0.0.1:8787/api/health

# Website
cd web && npm install && npm run dev
# http://127.0.0.1:5173
```

## Production build

```bash
cd web && npm install && npm run build
npm run api          # serves web/dist when present, plus /api
```

## Deploy

- Static UI: any host that can serve `web/dist`
- API: Node 22+ process (`server/api/index.mjs`), set `PORT`, `MAX_SEEDS_PER_JOB`, `MAX_ACTIVE_JOBS`
- Put a reverse proxy in front. Rate-limit at the proxy for public deploys.
- Do not expose an unbounded seed count.

## Bedrock version

Target recorded on every search: **Bedrock 1.21** structure-set constants as
published by community research (MCBEStructureFinder 1.18+ branch salts /
spacing). Later game versions can differ. Do not mix versions.

Engine version: **0.2.0**

## Next

1. Verified biome source for Bedrock 1.18+ (reviewed cubiomes-bedrock port)
2. Ancient City / Trial Chambers / Trail Ruins salts from primary dumps
3. Stronghold biome window
4. World-spawn search
5. SIMD / multi-thread C++ workers and optional WASM of the same C++ file
6. Native/WASM parity job in CI once WASM toolchain is pinned
