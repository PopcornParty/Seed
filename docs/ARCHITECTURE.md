# Architecture

```
Seed
  → parse / low-32 structure seed
  → cheap structure candidate tests (early reject)
  → biome filters          [UNSUPPORTED]
  → noise / terrain        [UNSUPPORTED]
  → score + statistics
  → results
```

Two runtimes share one algorithm:

1. TypeScript `engine/core/bedrockEngine.ts` — browser workers + Node API
2. C++ `native/cpp` — CLI hunter and gold-vector source

Parity tests require `mt_n_get(1,4)` and village candidates at known regions
to match on both sides.

The HTTP API never evaluates user-supplied code. Conditions are a JSON
schema of structure names and numeric bounds. Job size is capped.
