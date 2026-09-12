import {
  STRUCTURES, collectCandidates, structureSeed, runSearchRange,
  type Accuracy, type FoundStructure, type SearchArea, type SearchStats, type SeedResult, type StructureCondition
} from "./bedrockEngine";

export const FEATURE_STATUS = {
  structureCandidates: "VALIDATED" as Accuracy,
  biomeGeneration: "UNSUPPORTED" as Accuracy,
  terrainNoise: "UNSUPPORTED" as Accuracy,
  worldSpawn: "UNSUPPORTED" as Accuracy,
  loot: "UNSUPPORTED" as Accuracy,
  textSeedHash: "APPROXIMATE" as Accuracy
};

export function structureScanCost(id: string): number {
  const cfg = STRUCTURES[id];
  if (!cfg || !cfg.implemented) return 1e9;
  if (cfg.id === "stronghold") return 8;
  return Math.max(1, Math.floor(400 / Math.max(cfg.spacing, 1)));
}

export function orderConditions(conds: StructureCondition[]): StructureCondition[] {
  return [...conds].sort((a, b) => structureScanCost(a.name) - structureScanCost(b.name));
}

export function simulateSeed(seed: bigint | number, area: SearchArea, names?: string[]): FoundStructure[] {
  const low = structureSeed(seed);
  const ids = names ?? Object.keys(STRUCTURES).filter((k) => STRUCTURES[k].implemented);
  const out: FoundStructure[] = [];
  for (const id of ids) out.push(...collectCandidates(low, STRUCTURES[id], area));
  out.sort((a, b) => a.distance - b.distance);
  return out;
}

export function summarizeResults(results: SeedResult[], stats: SearchStats) {
  const distances: number[] = [];
  const byName: Record<string, number[]> = {};
  for (const r of results) {
    for (const s of r.structures) {
      distances.push(s.distance);
      (byName[s.name] ??= []).push(s.distance);
    }
  }
  distances.sort((a, b) => a - b);
  const avg = distances.length ? distances.reduce((a, b) => a + b, 0) / distances.length : 0;
  const mid = distances.length ? distances[Math.floor(distances.length / 2)] : 0;
  const matchRate = stats.tested ? stats.matched / stats.tested : 0;
  return {
    tested: stats.tested,
    matched: stats.matched,
    rejected: stats.rejected,
    matchPercent: matchRate * 100,
    rarityOneIn: matchRate > 0 ? Math.round(1 / matchRate) : null,
    seedsPerSec: stats.seedsPerSec,
    elapsedMs: stats.elapsedMs,
    averageDistance: avg,
    medianDistance: mid,
    minDistance: distances[0] ?? null,
    maxDistance: distances.length ? distances[distances.length - 1] : null,
    byStructure: Object.fromEntries(Object.entries(byName).map(([k, v]) => [k, {
      count: v.length,
      min: Math.min(...v),
      avg: v.reduce((a, b) => a + b, 0) / v.length
    }])),
    stages: stats.stages,
    bedrockVersion: stats.bedrockVersion,
    engineVersion: stats.engineVersion
  };
}

export function measureVillageSample(n: number) {
  return runSearchRange({
    seedStart: 0n, seedCount: n, seedStep: 1n,
    area: { centerX: 0, centerZ: 0, radius: 1200 },
    groups: [{ op: "AND", conditions: [{ name: "village", minCount: 1, maxCount: 99, maxDistance: 800, minDistance: 0, weight: 10 }] }],
    ranking: true, topN: 50, bedrockVersion: "1.21", engineVersion: "0.2.0"
  });
}
