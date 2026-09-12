import { useMemo, useRef, useState } from "react";
import { STRUCTURES, ENGINE_VERSION, TARGET_BEDROCK_VERSION, type ConditionGroup, type SearchStats, type SeedResult, type StructureCondition } from "../engineCopy";
import { PRESETS } from "../lib/presets";
import { saveSearch, toggleFavourite } from "../lib/storage";

const IMPL = Object.values(STRUCTURES).filter((s) => s.implemented);
const blank = (): StructureCondition => ({ name: "village", minCount: 1, maxCount: 99, maxDistance: 500, minDistance: 0, weight: 20 });

export default function SearchPage() {
  const [groups, setGroups] = useState<ConditionGroup[]>([{ op: "AND", conditions: [blank()] }]);
  const [seedCount, setSeedCount] = useState(20000);
  const [seedStart, setSeedStart] = useState("0");
  const [cx, setCx] = useState(0);
  const [cz, setCz] = useState(0);
  const [radius, setRadius] = useState(2000);
  const [ranking, setRanking] = useState(true);
  const [topN, setTopN] = useState(40);
  const [workers, setWorkers] = useState(Math.min(4, navigator.hardwareConcurrency || 2));
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [results, setResults] = useState<SeedResult[]>([]);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<SeedResult | null>(null);
  const wref = useRef<Worker[]>([]);
  const job = useMemo(() => ({
    seedStart, seedCount, seedStep: "1",
    area: { centerX: cx, centerZ: cz, radius },
    groups, ranking, topN,
    bedrockVersion: TARGET_BEDROCK_VERSION, engineVersion: ENGINE_VERSION
  }), [seedStart, seedCount, cx, cz, radius, groups, ranking, topN]);

  function stop() {
    wref.current.forEach((w) => w.terminate());
    wref.current = [];
    setRunning(false);
    setStatus("cancelled");
  }
  function applyPreset(id: string) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setGroups(JSON.parse(JSON.stringify(p.groups)));
    setSeedCount(p.seedCount);
    setRadius(p.radius);
    setRanking(p.ranking);
  }
  function runLocal() {
    stop();
    setRunning(true); setResults([]); setSelected(null); setStatus("running");
    const n = Math.max(1, Math.min(16, workers));
    const per = Math.ceil(seedCount / n);
    const acc: SeedResult[] = [];
    let tested = 0, matched = 0, rejected = 0, done = 0;
    const t0 = performance.now();
    for (let i = 0; i < n; i++) {
      const start = BigInt(seedStart || "0") + BigInt(i * per);
      const count = Math.max(0, Math.min(per, seedCount - i * per));
      if (count <= 0) { done++; continue; }
      const w = new Worker(new URL("../searchWorker.ts", import.meta.url), { type: "module" });
      wref.current.push(w);
      w.onmessage = (ev) => {
        const msg = ev.data;
        if (msg.type !== "done") return;
        acc.push(...(msg.results || []));
        tested += msg.stats.tested; matched += msg.stats.matched; rejected += msg.stats.rejected; done++;
        const elapsed = performance.now() - t0;
        const merged = ranking ? acc.sort((a, b) => b.score - a.score).slice(0, topN) : acc.slice(0, topN);
        setResults(merged);
        setStats({
          tested, rejected, matched,
          seedsPerSec: elapsed > 0 ? (tested * 1000) / elapsed : 0,
          elapsedMs: elapsed,
          stages: { initial: seedCount, structurePass: matched, biomePass: 0, terrainPass: 0, finalMatches: matched },
          bedrockVersion: TARGET_BEDROCK_VERSION, engineVersion: ENGINE_VERSION
        });
        if (done >= n) { setRunning(false); setStatus("done"); stop(); setStatus("done"); }
      };
      w.postMessage({ ...job, seedStart: start.toString(), seedCount: count, seedStep: "1" });
    }
  }
  function exportText(kind: "json" | "csv" | "txt") {
    const text = kind === "json" ? JSON.stringify({ job, stats, results }, null, 2)
      : kind === "csv" ? "seed,score\n" + results.map((r) => `${r.seed},${r.score.toFixed(2)}`).join("\n")
      : results.map((r) => r.seed + " " + r.score.toFixed(1)).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = "bedrock-seeds." + kind;
    a.click();
  }
  const eta = stats && stats.seedsPerSec > 0 ? Math.max(0, (seedCount - stats.tested) / stats.seedsPerSec) : 0;
  return (
    <div>
      <h2>Search</h2>
      <p className="lead">AND / OR groups. Local Web Workers. Candidates only — confirm in Bedrock.</p>
      <div className="card row">{PRESETS.map((p) => <button key={p.id} className="secondary" onClick={() => applyPreset(p.id)}>{p.name}</button>)}</div>
      {groups.map((g, gi) => (
        <div className="card" key={gi}>
          <div className="row">
            <strong>Group {gi + 1}</strong>
            <select value={g.op} onChange={(e) => setGroups((gs) => gs.map((x, i) => i === gi ? { ...x, op: e.target.value as "AND" | "OR" } : x))}>
              <option>AND</option><option>OR</option>
            </select>
          </div>
          {g.conditions.map((c, ci) => (
            <div className="cond condrow" key={ci}>
              <select value={c.name} onChange={(e) => setGroups((gs) => gs.map((x, i) => i !== gi ? x : { ...x, conditions: x.conditions.map((cc, j) => j === ci ? { ...cc, name: e.target.value } : cc) }))}>
                {IMPL.map((s) => <option key={s.id}>{s.id}</option>)}
              </select>
              <input type="number" value={c.minCount} onChange={(e) => setGroups((gs) => gs.map((x, i) => i !== gi ? x : { ...x, conditions: x.conditions.map((cc, j) => j === ci ? { ...cc, minCount: Number(e.target.value) } : cc) }))} />
              <input type="number" value={c.maxDistance} onChange={(e) => setGroups((gs) => gs.map((x, i) => i !== gi ? x : { ...x, conditions: x.conditions.map((cc, j) => j === ci ? { ...cc, maxDistance: Number(e.target.value) } : cc) }))} />
              <span className={`badge ${STRUCTURES[c.name]?.candidateAccuracy}`}>{STRUCTURES[c.name]?.candidateAccuracy}</span>
            </div>
          ))}
          <button className="secondary" onClick={() => setGroups((gs) => gs.map((x, i) => i === gi ? { ...x, conditions: [...x.conditions, blank()] } : x))}>+ condition</button>
        </div>
      ))}
      <button className="secondary" onClick={() => setGroups((gs) => [...gs, { op: "AND", conditions: [blank()] }])}>+ group</button>
      <div className="card row">
        <label className="field">Seeds<input type="number" value={seedCount} onChange={(e) => setSeedCount(Number(e.target.value))} /></label>
        <label className="field">Start<input value={seedStart} onChange={(e) => setSeedStart(e.target.value)} /></label>
        <label className="field">X<input type="number" value={cx} onChange={(e) => setCx(Number(e.target.value))} /></label>
        <label className="field">Z<input type="number" value={cz} onChange={(e) => setCz(Number(e.target.value))} /></label>
        <label className="field">Radius<input type="number" value={radius} onChange={(e) => setRadius(Number(e.target.value))} /></label>
        <label className="field">Workers<input type="number" value={workers} onChange={(e) => setWorkers(Number(e.target.value))} /></label>
        <label><input type="checkbox" checked={ranking} onChange={(e) => setRanking(e.target.checked)} /> rank</label>
        {!running ? <button onClick={runLocal}>Run search</button> : <button className="secondary" onClick={stop}>Cancel</button>}
        <button className="ghost" onClick={() => saveSearch({ name: "Search " + new Date().toLocaleString(), config: job, results })}>Save</button>
      </div>
      {stats && <div className="statgrid">
        <div className="stat">Status<b>{running ? "SEARCH RUNNING" : status}</b></div>
        <div className="stat">Seeds<b>{stats.tested.toLocaleString()}</b></div>
        <div className="stat">Speed<b>{Math.round(stats.seedsPerSec).toLocaleString()}/s</b></div>
        <div className="stat">Matches<b>{stats.matched.toLocaleString()}</b></div>
        <div className="stat">Rejected<b>{stats.rejected.toLocaleString()}</b></div>
        <div className="stat">ETA<b>{eta.toFixed(1)}s</b></div>
      </div>}
      <div className="grid2">
        <div className="card">
          <div className="row">
            <h3>Results</h3>
            <button className="ghost" onClick={() => exportText("json")}>JSON</button>
            <button className="ghost" onClick={() => exportText("csv")}>CSV</button>
            <button className="ghost" onClick={() => exportText("txt")}>TXT</button>
          </div>
          <table>
            <thead><tr><th>#</th><th>Seed</th><th>Score</th></tr></thead>
            <tbody>{results.map((r, i) => (
              <tr key={r.seed + i} onClick={() => { setSelected(r); sessionStorage.setItem("seed.selected", JSON.stringify(r)); }}>
                <td>{i + 1}</td><td>{r.seed}</td><td>{r.score.toFixed(1)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="card">
          {selected ? (
            <div>
              <h3>SEED {selected.seed}</h3>
              {selected.structures.map((s, i) => <p key={i}>{s.name} {Math.round(s.distance)}m ({s.x},{s.z}) <span className={`badge ${s.accuracy}`}>{s.accuracy}</span></p>)}
              <button onClick={() => navigator.clipboard.writeText(selected.seed)}>Copy seed</button>
              <button className="secondary" onClick={() => toggleFavourite(selected.seed)}>Favourite</button>
              <a className="btn secondary" href={`/map?seed=${selected.seed}`}>Open map</a>
            </div>
          ) : <p className="note">Click a result.</p>}
        </div>
      </div>
    </div>
  );
}
