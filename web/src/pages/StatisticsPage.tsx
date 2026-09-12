import { useMemo, useState } from "react";
import { runSearchRange, summarizeResults, ENGINE_VERSION } from "../engineCopy";

export default function StatisticsPage() {
  const [n, setN] = useState(8000);
  const [out, setOut] = useState<ReturnType<typeof summarizeResults> | null>(null);
  function run() {
    const raw = runSearchRange({
      seedStart: 0n, seedCount: n, seedStep: 1n,
      area: { centerX: 0, centerZ: 0, radius: 1200 },
      groups: [{ op: "AND", conditions: [{ name: "village", minCount: 1, maxCount: 99, maxDistance: 800, minDistance: 0, weight: 10 }] }],
      ranking: true, topN: 50, bedrockVersion: "1.21", engineVersion: ENGINE_VERSION
    });
    setOut(summarizeResults(raw.results, raw.stats));
  }
  const view = useMemo(() => out, [out]);
  return (
    <div>
      <h2>Statistics</h2>
      <p className="lead">Numbers come from an actual engine run on this device. Nothing is hardcoded.</p>
      <div className="card row">
        <label className="field">Sample size<input type="number" value={n} onChange={(e) => setN(Number(e.target.value))} /></label>
        <button onClick={run}>Measure village &lt; 800</button>
      </div>
      {view && (
        <div className="statgrid">
          <div className="stat">Tested<b>{view.tested.toLocaleString()}</b></div>
          <div className="stat">Matches<b>{view.matched.toLocaleString()}</b></div>
          <div className="stat">Match %<b>{view.matchPercent.toFixed(4)}</b></div>
          <div className="stat">~1 in<b>{view.rarityOneIn ?? "—"}</b></div>
          <div className="stat">Seeds/sec<b>{Math.round(view.seedsPerSec).toLocaleString()}</b></div>
          <div className="stat">Avg dist<b>{view.averageDistance.toFixed(1)}</b></div>
          <div className="stat">Median<b>{view.medianDistance.toFixed(1)}</b></div>
          <div className="stat">Closest<b>{view.minDistance?.toFixed(1) ?? "—"}</b></div>
        </div>
      )}
    </div>
  );
}
