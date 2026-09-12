import assert from "node:assert/strict";
import { test } from "node:test";
import { mtNGet, candidateInRegion, structureSeed, STRUCTURES, runSearchRange, parseSeed, evaluateSeed } from "../../engine/core/bedrockEngine.ts";

test("mtNGet matches C++ gold vector for seed 1 n=4", () => {
  const mt = mtNGet(1, 4);
  assert.equal(mt[0], 1791095845);
  assert.equal(mt[1], 4282876139);
  assert.equal(mt[2], 3093770124);
  assert.equal(mt[3], 4005303368);
});
test("village candidate matches C++ gold vectors", () => {
  const v = STRUCTURES.village;
  const a = candidateInRegion(1, v, 0, 0);
  assert.equal(a.x, 7); assert.equal(a.z, 10);
  const b = candidateInRegion(1, v, 2, -1);
  assert.equal(b.x, 64); assert.equal(b.z, -13);
});
test("structure seed uses low 32 bits", () => {
  assert.equal(structureSeed(1), 1);
  assert.equal(structureSeed(4294967296n + 7n), 7);
});
test("numeric seed parse is exact", () => {
  const p = parseSeed("-1234567890123");
  assert.equal(p.accuracy, "EXACT");
  assert.equal(p.seed, -1234567890123n);
});
test("text seed parse is approximate", () => {
  assert.equal(parseSeed("Glacier").accuracy, "APPROXIMATE");
});
test("unsupported ancient city cannot match", () => {
  const res = evaluateSeed(1n, {
    seedStart: 1n, seedCount: 1, seedStep: 1n,
    area: { centerX: 0, centerZ: 0, radius: 2000 },
    groups: [{ op: "AND", conditions: [{ name: "ancient_city", minCount: 1, maxCount: 1, maxDistance: 2000, minDistance: 0, weight: 10 }] }],
    ranking: false, topN: 1, bedrockVersion: "1.21", engineVersion: "0.1.0"
  });
  assert.equal(res, null);
});
test("search stats are consistent", () => {
  const out = runSearchRange({
    seedStart: 0n, seedCount: 500, seedStep: 1n,
    area: { centerX: 0, centerZ: 0, radius: 800 },
    groups: [{ op: "AND", conditions: [{ name: "village", minCount: 1, maxCount: 100, maxDistance: 800, minDistance: 0, weight: 10 }] }],
    ranking: true, topN: 5, bedrockVersion: "1.21", engineVersion: "0.1.0"
  });
  assert.equal(out.stats.tested, 500);
  assert.equal(out.stats.matched + out.stats.rejected, 500);
  assert.equal(out.stats.stages.biomePass, 0);
  assert.ok(out.stats.seedsPerSec > 0);
});
