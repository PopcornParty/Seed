import { useState } from "react";
import { runSearchRange, ENGINE_VERSION } from "../engineCopy";

interface Row { threads: number; seedsPerSec: number; ms: number; tested: number; }

export default function BenchmarkPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const count = 12000;

  async function bench() {
    setRunning(true); setRows([]);
    const threadCounts = [1, 2, Math.min(4, navigator.hardwareConcurrency || 4)];
    const collected: Row[] = [];
    for (const t of threadCounts) {
      const slice = Math.ceil(count / t);
      const t0 = performance.now();
      const parts = await Promise.all(Array.from({ length: t }, (_, i) => new Promise<number>((resolve) => {
        const out = runSearchRange({
          seedStart: BigInt(i * slice), seedCount: slice, seedStep: 1n,
          area: { centerX: 0, centerZ: 0, radius: 1500 },
          groups: [{ op: "AND", conditions: [{ name: "village", minCount: 1, maxCount: 99, maxDistance: 1500, minDistance: 0, weight: 10 }] }],
          ranking: false, topN: 5, bedrockVersion: "1.21", engineVersion: ENGINE_VERSION
        });
        resolve(out.stats.tested);
      })));
      const ms = performance.now() - t0;
      const tested = parts.reduce((a, b) => a + b, 0);
      collected.push({ threads: t, tested, ms, seedsPerSec: tested * 1000 / ms });
      setRows([...collected]);
      await new Promise((r) => setTimeout(r, 30));
    }
    setRunning(false);
  }

  return (
    <div>
      <h2>Benchmark</h2>
      <p className="lead">Live measurement of this browser. Structure-candidate filter only. Biome/noise stages are unsupported so they are not timed as if they existed.</p>
      <button disabled={running} onClick={bench}>{running ? "Measuring…" : "Run structure-only benchmark"}</button>
      <div className="card">
        <table>
          <thead><tr><th>Workers</th><th>Tested</th><th>ms</th><th>seeds/sec</th><th>ms / million</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.threads}>
                <td>{r.threads}</td>
                <td>{r.tested}</td>
                <td>{r.ms.toFixed(0)}</td>
                <td>{Math.round(r.seedsPerSec).toLocaleString()}</td>
                <td>{((r.ms / r.tested) * 1e6).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="note">No numbers until you run the benchmark.</p>}
      </div>
    </div>
  );
}
