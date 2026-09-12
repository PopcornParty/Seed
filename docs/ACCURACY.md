# Accuracy contract

Every public result carries one of:

- **EXACT** — deterministic, specified behaviour that we implement and test.
- **VALIDATED** — matches a substantial published reverse-engineering set
  (MCBEStructureFinder structure.h / be_random.cpp / be_finder.cpp).
- **APPROXIMATE** — useful but missing a required in-game filter.
- **UNSUPPORTED** — not implemented; the engine must refuse rather than guess.

## What is validated

Bedrock divides the world into `spacing × spacing` chunk regions. For each
region the area seed is:

```
area = salt - 245998635 * regionZ - 1724254968 * regionX + worldSeedLow32
```

A truncated MT19937 (`mt_n_get`) produces `num` tempered uint32 values.
Offsets are `mt[i] % spawnRange`. When `num == 4` the pairs are averaged
(integer division). The candidate chunk is `region * spacing + offset`.

Published constants used here (spacing, spawnRange, salt, num):

- village 27 / 17 / 10387312 / 4
- desert / jungle / swamp hut / igloo 32 / 24 / 14357617 / 2
- ocean monument 32 / 27 / 10387313 / 4
- woodland mansion 80 / 60 / 10387319 / 4
- pillager outpost 80 / 56 / 165745296 / 4
- buried treasure 4 / 2 / 16842397 / 4
- shipwreck 10 / 5 / 1 / 4
- ocean ruin 12 / 5 / 14357621 / 4
- ruined portal overworld 40 / 25 / 40552231 / 4
- ruined portal nether 25 / 15 / 40552231 / 4
- nether complex 30 / 26 / 430084232 / 4
- end city 20 / 9 / 10387313 / 4

## Low 32 bits

Mojira MCPE-154939: structure and decorator *locations* use the low 32 bits
of the 64-bit world seed. This engine therefore treats
`seed` and `seed + k * 2^32` as identical for candidate structure positions.

Biome and terrain (unsupported here) use the full 64-bit seed.

## Strongholds

The published spiral (initial angle from MT, distance 40–55 chunks, +108° / +8
chunks per success) is implemented. The 16-chunk biome scan inside that window
is **not**. Label: APPROXIMATE.

## Biomes and terrain

Not implemented. Do not display fake biome maps or height values.
