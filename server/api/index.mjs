import http from "node:http";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
const PORT = Number(process.env.PORT || 8787);
const MAX_SEEDS_PER_JOB = Number(process.env.MAX_SEEDS_PER_JOB || 5000000);
const MAX_ACTIVE_JOBS = Number(process.env.MAX_ACTIVE_JOBS || 2);
const jobs = new Map(); let active = 0;
const ALLOWED = new Set(["village","desert_pyramid","jungle_temple","swamp_hut","igloo","ocean_monument","woodland_mansion","pillager_outpost","buried_treasure","shipwreck","ocean_ruin","ruined_portal","ruined_portal_nether","nether_complex","end_city","stronghold"]);
function json(res, code, obj) {
  res.writeHead(code, {"content-type":"application/json; charset=utf-8","access-control-allow-origin":"*","access-control-allow-headers":"content-type","access-control-allow-methods":"GET,POST,DELETE,OPTIONS"});
  res.end(JSON.stringify(obj));
}
function validateJob(body) {
  const seedCount = Number(body.seedCount ?? 10000);
  if (!Number.isFinite(seedCount) || seedCount < 1 || seedCount > MAX_SEEDS_PER_JOB) throw new Error("seedCount out of range");
  const groups = body.groups;
  if (!Array.isArray(groups) || !groups.length) throw new Error("groups required");
  for (const g of groups) for (const c of g.conditions || []) if (!ALLOWED.has(c.name)) throw new Error("blocked structure " + c.name);
  return {
    seedStart: String(body.seedStart ?? "0"), seedCount, seedStep: String(body.seedStep ?? "1"),
    area: { centerX: Number(body.area?.centerX ?? 0)|0, centerZ: Number(body.area?.centerZ ?? 0)|0, radius: Number(body.area?.radius ?? 2000) },
    groups, ranking: Boolean(body.ranking), topN: Math.min(200, Math.max(1, Number(body.topN ?? 50))),
    bedrockVersion: "1.21", engineVersion: "0.1.0"
  };
}
function startWorker(id, job) {
  active++;
  const w = new Worker(fileURLToPath(new URL("./searchWorker.mjs", import.meta.url)), { workerData: job });
  jobs.get(id).worker = w;
  w.on("message", (msg) => {
    const rec = jobs.get(id); if (!rec) return;
    if (msg.type === "progress") { rec.stats = msg.stats; rec.results = msg.results; }
    if (msg.type === "done") { rec.stats = msg.stats; rec.results = msg.results; rec.status = "done"; active--; }
    if (msg.type === "error") { rec.status = "error"; rec.error = msg.error; active--; }
  });
  w.on("error", (err) => { const rec = jobs.get(id); if (rec) { rec.status = "error"; rec.error = String(err); } active--; });
}
const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, {"access-control-allow-origin":"*","access-control-allow-headers":"content-type","access-control-allow-methods":"GET,POST,DELETE,OPTIONS"}); res.end(); return; }
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  if (req.method === "GET" && url.pathname === "/api/health") return json(res, 200, { ok: true, engine: "0.1.0", edition: "bedrock", activeJobs: active });
  if (req.method === "POST" && url.pathname === "/api/search") {
    let raw = ""; req.on("data", (c) => { raw += c; if (raw.length > 200000) req.destroy(); });
    req.on("end", () => {
      try {
        if (active >= MAX_ACTIVE_JOBS) return json(res, 429, { error: "too many active jobs" });
        const job = validateJob(raw ? JSON.parse(raw) : {});
        const id = randomUUID();
        jobs.set(id, { id, status: "running", createdAt: Date.now(), job, stats: null, results: [] });
        startWorker(id, job); json(res, 202, { jobId: id });
      } catch (e) { json(res, 400, { error: String(e.message || e) }); }
    }); return;
  }
  const m = url.pathname.match(/^\/api\/search\/([a-f0-9-]+)$/);
  const r = url.pathname.match(/^\/api\/search\/([a-f0-9-]+)\/results$/);
  if (req.method === "GET" && m) { const rec = jobs.get(m[1]); return rec ? json(res, 200, { id: rec.id, status: rec.status, stats: rec.stats, resultCount: rec.results.length, error: rec.error || null }) : json(res, 404, { error: "not found" }); }
  if (req.method === "GET" && r) { const rec = jobs.get(r[1]); return rec ? json(res, 200, { id: rec.id, status: rec.status, stats: rec.stats, results: rec.results }) : json(res, 404, { error: "not found" }); }
  if (req.method === "DELETE" && m) { const rec = jobs.get(m[1]); if (!rec) return json(res, 404, { error: "not found" }); try { rec.worker?.terminate(); } catch {} rec.status = "cancelled"; return json(res, 200, { id: rec.id, status: rec.status }); }
  json(res, 404, { error: "not found" });
});
server.listen(PORT, () => console.log("seed api listening on http://127.0.0.1:" + PORT));
