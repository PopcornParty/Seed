import { parentPort, workerData } from "node:worker_threads";
import { pathToFileURL } from "node:url";
async function main() {
  const mod = await import(pathToFileURL(new URL("../../engine/core/bedrockEngine.ts", import.meta.url)).href);
  const job = {
    seedStart: BigInt(workerData.seedStart),
    seedCount: workerData.seedCount,
    seedStep: BigInt(workerData.seedStep),
    area: workerData.area,
    groups: workerData.groups,
    ranking: workerData.ranking,
    topN: workerData.topN,
    bedrockVersion: workerData.bedrockVersion,
    engineVersion: workerData.engineVersion
  };
  const out = mod.runSearchRange(job, (stats, results) => { parentPort.postMessage({ type: "progress", stats, results }); return true; });
  parentPort.postMessage({ type: "done", stats: out.stats, results: out.results });
}
main().catch((e) => parentPort.postMessage({ type: "error", error: String(e) }));
