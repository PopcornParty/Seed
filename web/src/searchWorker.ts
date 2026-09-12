import { runSearchRange, type SearchJob } from "../../engine/core/bedrockEngine";
self.onmessage = (ev: MessageEvent) => {
  const job = ev.data as SearchJob;
  job.seedStart = BigInt(job.seedStart as unknown as string);
  job.seedStep = BigInt(job.seedStep as unknown as string);
  const out = runSearchRange(job, (stats, results) => {
    (self as DedicatedWorkerGlobalScope).postMessage({ type: "progress", stats, results });
    return true;
  });
  (self as DedicatedWorkerGlobalScope).postMessage({ type: "done", stats: out.stats, results: out.results });
};
