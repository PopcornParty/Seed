export type Accuracy = "EXACT" | "VALIDATED" | "APPROXIMATE" | "UNSUPPORTED";
export interface StructureConfig {
  id: string; spacing: number; spawnRange: number; salt: number; num: number;
  candidateAccuracy: Accuracy; biomeAccuracy: Accuracy; implemented: boolean;
}
export const STRUCTURES: Record<string, StructureConfig> = {
  village: { id: "village", spacing: 27, spawnRange: 17, salt: 10387312, num: 4, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  desert_pyramid: { id: "desert_pyramid", spacing: 32, spawnRange: 24, salt: 14357617, num: 2, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  jungle_temple: { id: "jungle_temple", spacing: 32, spawnRange: 24, salt: 14357617, num: 2, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  swamp_hut: { id: "swamp_hut", spacing: 32, spawnRange: 24, salt: 14357617, num: 2, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  igloo: { id: "igloo", spacing: 32, spawnRange: 24, salt: 14357617, num: 2, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  ocean_monument: { id: "ocean_monument", spacing: 32, spawnRange: 27, salt: 10387313, num: 4, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  woodland_mansion: { id: "woodland_mansion", spacing: 80, spawnRange: 60, salt: 10387319, num: 4, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  pillager_outpost: { id: "pillager_outpost", spacing: 80, spawnRange: 56, salt: 165745296, num: 4, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  buried_treasure: { id: "buried_treasure", spacing: 4, spawnRange: 2, salt: 16842397, num: 4, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  shipwreck: { id: "shipwreck", spacing: 10, spawnRange: 5, salt: 1, num: 4, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  ocean_ruin: { id: "ocean_ruin", spacing: 12, spawnRange: 5, salt: 14357621, num: 4, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  ruined_portal: { id: "ruined_portal", spacing: 40, spawnRange: 25, salt: 40552231, num: 4, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  ruined_portal_nether: { id: "ruined_portal_nether", spacing: 25, spawnRange: 15, salt: 40552231, num: 4, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  nether_complex: { id: "nether_complex", spacing: 30, spawnRange: 26, salt: 430084232, num: 4, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  end_city: { id: "end_city", spacing: 20, spawnRange: 9, salt: 10387313, num: 4, candidateAccuracy: "VALIDATED", biomeAccuracy: "UNSUPPORTED", implemented: true },
  stronghold: { id: "stronghold", spacing: 0, spawnRange: 0, salt: 0, num: 0, candidateAccuracy: "APPROXIMATE", biomeAccuracy: "UNSUPPORTED", implemented: true },
  ancient_city: { id: "ancient_city", spacing: 0, spawnRange: 0, salt: 0, num: 0, candidateAccuracy: "UNSUPPORTED", biomeAccuracy: "UNSUPPORTED", implemented: false },
  trail_ruins: { id: "trail_ruins", spacing: 0, spawnRange: 0, salt: 0, num: 0, candidateAccuracy: "UNSUPPORTED", biomeAccuracy: "UNSUPPORTED", implemented: false },
  trial_chambers: { id: "trial_chambers", spacing: 0, spawnRange: 0, salt: 0, num: 0, candidateAccuracy: "UNSUPPORTED", biomeAccuracy: "UNSUPPORTED", implemented: false }
};
export const ENGINE_VERSION = "0.1.0";
export const TARGET_BEDROCK_VERSION = "1.21";
export function u32(n: number): number { return n >>> 0; }
export function structureSeed(worldSeed: bigint | number): number {
  const v = typeof worldSeed === "bigint" ? worldSeed : BigInt(worldSeed);
  return Number(v & 0xffffffffn) >>> 0;
}
export function parseSeed(input: string): { seed: bigint; accuracy: Accuracy; note: string } {
  const trimmed = input.trim();
  if (trimmed === "") return { seed: 0n, accuracy: "EXACT", note: "empty treated as 0" };
  if (/^[+-]?\d+$/.test(trimmed)) {
    try { return { seed: BigInt(trimmed), accuracy: "EXACT", note: "numeric world seed" }; }
    catch { return { seed: 0n, accuracy: "UNSUPPORTED", note: "integer out of range" }; }
  }
  let h = 0;
  for (let i = 0; i < trimmed.length; i++) h = Math.imul(h, 31) + trimmed.charCodeAt(i);
  return { seed: BigInt(h | 0), accuracy: "APPROXIMATE", note: "text seed hashed with Java String.hashCode stand-in; Bedrock text hash not verified in this engine" };
}
function mtInitStep(prev: number, offset: number): number {
  return u32(Math.imul(0x6c078965, u32(prev) ^ (u32(prev) >>> 30)) + offset);
}
export function mtNGet(seed: number, n: number): number[] {
  const head = new Uint32Array(n + 1);
  const last = new Uint32Array(n + 1);
  head[0] = u32(seed);
  for (let i = 1; i < n + 1; i++) head[i] = mtInitStep(head[i - 1], i);
  let temp = head[n];
  for (let i = n; i < 397; i++) temp = mtInitStep(temp, i + 1);
  last[0] = temp;
  for (let i = 1; i < n + 1; i++) last[i] = mtInitStep(last[i - 1], i + 397);
  for (let i = 0; i < n; i++) {
    temp = (head[i] & 0x80000000) + (head[i + 1] & 0x7fffffff);
    head[i] = (temp >>> 1) ^ last[i];
    if (temp % 2 !== 0) head[i] = head[i] ^ 0x9908b0df;
  }
  const result: number[] = [];
  for (let i = 0; i < n; i++) {
    let y = head[i];
    y = y ^ (y >>> 11);
    y = y ^ ((y << 7) & 2636928640);
    y = y ^ ((y << 15) & 4022730752);
    y = y ^ (y >>> 18);
    result.push(u32(y));
  }
  return result;
}
export function int2Float(x: number): number { return u32(x) * 2.328306436538696e-10; }
export function floorDiv(a: number, b: number): number { return Math.floor(a / b); }
export function candidateAreaSeed(rx: number, rz: number, salt: number): number {
  return u32(salt - Math.imul(245998635, rz) - Math.imul(1724254968, rx));
}
export function getCongWithModule(start: number, mod: number, target: number): number {
  let r = start % mod; if (r < 0) r += mod;
  let d = target - r; if (d < 0) d += mod;
  return start + d;
}
export interface ChunkPos { x: number; z: number; }
export function candidateInRegion(worldLow32: number, cfg: StructureConfig, rx: number, rz: number): ChunkPos {
  const area = u32(candidateAreaSeed(rx, rz, cfg.salt) + worldLow32);
  const mt = mtNGet(area, cfg.num);
  let avgX: number; let avgZ: number;
  if (cfg.num === 2) { avgX = mt[0] % cfg.spawnRange; avgZ = mt[1] % cfg.spawnRange; }
  else {
    const r1 = mt[0] % cfg.spawnRange, r2 = mt[1] % cfg.spawnRange, r3 = mt[2] % cfg.spawnRange, r4 = mt[3] % cfg.spawnRange;
    avgX = Math.floor((r1 + r2) / 2); avgZ = Math.floor((r3 + r4) / 2);
  }
  return { x: getCongWithModule(rx * cfg.spacing, cfg.spacing, avgX), z: getCongWithModule(rz * cfg.spacing, cfg.spacing, avgZ) };
}
export function chunkToBlockCenter(c: ChunkPos): { x: number; z: number } { return { x: c.x * 16 + 8, z: c.z * 16 + 8 }; }
export function blockDist(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx, dz = az - bz; return Math.sqrt(dx * dx + dz * dz);
}
export function strongholdCandidates(low32: number): { x: number; z: number }[] {
  const mt = mtNGet(low32, 2);
  let angle = 6.2831855 * int2Float(mt[0]);
  let chunkDist = (mt[1] % 16) + 40;
  const out: { x: number; z: number }[] = [];
  for (let count = 0; count < 3; count++) {
    const cx = Math.floor(Math.cos(angle) * chunkDist);
    const cz = Math.floor(Math.sin(angle) * chunkDist);
    out.push({ x: cx * 16, z: cz * 16 });
    angle += 1.8849558; chunkDist += 8;
  }
  return out;
}
export interface SearchArea { centerX: number; centerZ: number; radius: number; }
export interface StructureCondition { name: string; minCount: number; maxCount: number; maxDistance: number; minDistance: number; weight: number; }
export type LogicOp = "AND" | "OR";
export interface ConditionGroup { op: LogicOp; conditions: StructureCondition[]; }
export interface FoundStructure { name: string; x: number; z: number; distance: number; accuracy: Accuracy; }
export interface SeedResult { seed: string; score: number; structures: FoundStructure[]; }
export interface SearchJob {
  seedStart: bigint; seedCount: number; seedStep: bigint; area: SearchArea; groups: ConditionGroup[];
  ranking: boolean; topN: number; bedrockVersion: string; engineVersion: string;
}
export interface SearchStats {
  tested: number; rejected: number; matched: number; seedsPerSec: number; elapsedMs: number;
  stages: { initial: number; structurePass: number; biomePass: number; terrainPass: number; finalMatches: number; };
  bedrockVersion: string; engineVersion: string;
}
export const LIMITATIONS = [
  "Structure positions are CANDIDATES from Bedrock region / salt / MT RNG.",
  "Biome validation is NOT implemented — a candidate may not generate in-game.",
  "Terrain, noise, loot, and exact world-spawn search are UNSUPPORTED.",
  "Ancient City, Trail Ruins, and Trial Chambers salts are not in this engine yet.",
  "Structure placement uses only the low 32 bits of the world seed (MCPE-154939).",
  "Stronghold positions use the published spiral without biome window scanning (APPROXIMATE)."
];
export function collectCandidates(low32: number, cfg: StructureConfig, area: SearchArea): FoundStructure[] {
  const found: FoundStructure[] = [];
  if (!cfg.implemented) return found;
  if (cfg.id === "stronghold") {
    for (const p of strongholdCandidates(low32)) {
      const d = blockDist(p.x, p.z, area.centerX, area.centerZ);
      if (d <= area.radius + 1) found.push({ name: cfg.id, x: p.x, z: p.z, distance: d, accuracy: cfg.candidateAccuracy });
    }
    return found;
  }
  const minX = area.centerX - area.radius, maxX = area.centerX + area.radius;
  const minZ = area.centerZ - area.radius, maxZ = area.centerZ + area.radius;
  const rx0 = floorDiv(floorDiv(minX, 16), cfg.spacing) - 1;
  const rx1 = floorDiv(floorDiv(maxX, 16), cfg.spacing) + 1;
  const rz0 = floorDiv(floorDiv(minZ, 16), cfg.spacing) - 1;
  const rz1 = floorDiv(floorDiv(maxZ, 16), cfg.spacing) + 1;
  for (let rx = rx0; rx <= rx1; rx++) {
    for (let rz = rz0; rz <= rz1; rz++) {
      const ch = candidateInRegion(low32, cfg, rx, rz);
      const bp = chunkToBlockCenter(ch);
      const d = blockDist(bp.x, bp.z, area.centerX, area.centerZ);
      if (d <= area.radius) found.push({ name: cfg.id, x: bp.x, z: bp.z, distance: d, accuracy: cfg.candidateAccuracy });
    }
  }
  return found;
}
export function evaluateCondition(low32: number, cond: StructureCondition, area: SearchArea) {
  const cfg = STRUCTURES[cond.name];
  if (!cfg || !cfg.implemented) return { ok: false, hits: [] as FoundStructure[], nearest: Infinity };
  const cands = collectCandidates(low32, cfg, area);
  const hits = cands.filter((f) => f.distance >= cond.minDistance && f.distance <= cond.maxDistance);
  hits.sort((a, b) => a.distance - b.distance);
  const ok = hits.length >= cond.minCount && hits.length <= cond.maxCount;
  return { ok, hits: hits.slice(0, 8), nearest: hits[0]?.distance ?? Infinity };
}
export function evaluateSeed(seed: bigint, job: SearchJob): SeedResult | null {
  const low = structureSeed(seed);
  const structures: FoundStructure[] = [];
  let score = 0;
  for (const group of job.groups) {
    let groupOk = group.op === "AND";
    const groupHits: FoundStructure[] = [];
    let groupScore = 0;
    for (const cond of group.conditions) {
      const r = evaluateCondition(low, cond, job.area);
      if (group.op === "AND") { if (!r.ok) { groupOk = false; break; } }
      else if (r.ok) groupOk = true;
      if (r.ok) {
        const closeness = 1 - r.nearest / Math.max(cond.maxDistance, 1);
        groupScore += cond.weight * (0.5 + 0.5 * Math.max(0, closeness));
        groupHits.push(...r.hits);
      }
    }
    if (!groupOk) return null;
    score += groupScore;
    structures.push(...groupHits);
  }
  return { seed: seed.toString(), score, structures };
}
export function runSearchRange(job: SearchJob, onProgress?: (stats: SearchStats, latest: SeedResult[]) => boolean) {
  const stats: SearchStats = {
    tested: 0, rejected: 0, matched: 0, seedsPerSec: 0, elapsedMs: 0,
    stages: { initial: job.seedCount, structurePass: 0, biomePass: 0, terrainPass: 0, finalMatches: 0 },
    bedrockVersion: job.bedrockVersion, engineVersion: job.engineVersion
  };
  const results: SeedResult[] = [];
  const t0 = performance.now();
  for (let i = 0; i < job.seedCount; i++) {
    const seed = job.seedStart + BigInt(i) * job.seedStep;
    stats.tested++;
    const res = evaluateSeed(seed, job);
    if (res) {
      stats.matched++; stats.stages.structurePass++; stats.stages.finalMatches++;
      results.push(res);
      if (job.ranking) { results.sort((a, b) => b.score - a.score); if (results.length > job.topN) results.pop(); }
      else if (results.length > job.topN) results.pop();
    } else stats.rejected++;
    if (onProgress && (i & 1023) === 0) {
      stats.elapsedMs = performance.now() - t0;
      stats.seedsPerSec = stats.elapsedMs > 0 ? (stats.tested * 1000) / stats.elapsedMs : 0;
      if (!onProgress(stats, results)) break;
    }
  }
  stats.elapsedMs = performance.now() - t0;
  stats.seedsPerSec = stats.elapsedMs > 0 ? (stats.tested * 1000) / stats.elapsedMs : 0;
  return { stats, results };
}
