import { useRef, useState } from "react";
import { STRUCTURES, ENGINE_VERSION, TARGET_BEDROCK_VERSION, type SearchStats, type SeedResult } from "../engineCopy";
export default function SearchPage() {
  const implemented = Object.values(STRUCTURES).filter((s) => s.implemented);
  const [name, setName] = useState("village");
  const [maxDistance, setMaxDistance] = useState(500);
  const [seedCount, setSeedCount] = useState(20000);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [results, setResults] = useState<SeedResult[]>([]);
  const wref = useRef<Worker | null>(null);
  function run() {
    setRunning(true); setResults([]);
    const w = new Worker(new URL("../searchWorker.ts", import.meta.url), { type: "module" });
    wref.current = w;
    w.onmessage = (ev) => {
      setStats(ev.data.stats); setResults(ev.data.results || []);
      if (ev.data.type === "done") { setRunning(false); w.terminate(); }
    };
    w.postMessage({
      seedStart: "0", seedCount, seedStep: "1",
      area: { centerX: 0, centerZ: 0, radius: Math.max(maxDistance, 16) },
      groups: [{ op: "AND", conditions: [{ name, minCount: 1, maxCount: 99, maxDistance, minDistance: 0, weight: 10 }] }],
      ranking: true, topN: 30, bedrockVersion: TARGET_BEDROCK_VERSION, engineVersion: ENGINE_VERSION
    });
  }
  return (
    <div>
      <h2>Search</h2>
      <div className="card">
        <select value={name} onChange={(e) => setName(e.target.value)}>
          {implemented.map((s) => <option key={s.id} value={s.id}>{s.id} [{s.candidateAccuracy}]</option>)}
        </select>
        <input type="number" value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} />
        <input type="number" value={seedCount} onChange={(e) => setSeedCount(Number(e.target.value))} />
        <button disabled={running} onClick={run}>{running ? "Searching…" : "Run local search"}</button>
      </div>
      {stats && <div className="statgrid">
        <div className="stat">tested <b>{stats.tested}</b></div>
        <div className="stat">seeds/sec <b>{Math.round(stats.seedsPerSec)}</b></div>
        <div className="stat">matches <b>{stats.matched}</b></div>
      </div>}
      <div className="card">{results.slice(0, 20).map((r) => <div key={r.seed}>{r.seed} score {r.score.toFixed(1)}</div>)}</div>
    </div>
  );
}
