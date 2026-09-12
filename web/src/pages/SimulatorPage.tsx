import { useMemo, useState } from "react";
import { parseSeed, simulateSeed, STRUCTURES, ENGINE_VERSION } from "../engineCopy";

export default function SimulatorPage() {
  const [raw, setRaw] = useState("1");
  const [radius, setRadius] = useState(1500);
  const parsed = useMemo(() => parseSeed(raw), [raw]);
  const hits = useMemo(
    () => simulateSeed(parsed.seed, { centerX: 0, centerZ: 0, radius }),
    [parsed.seed, radius]
  );
  return (
    <div>
      <h2>Simulator</h2>
      <p className="lead">Drop in one Bedrock seed and list structure candidates around origin. Not a world renderer.</p>
      <div className="card row">
        <label className="field">Seed<input value={raw} onChange={(e) => setRaw(e.target.value)} /></label>
        <label className="field">Radius<input type="number" value={radius} onChange={(e) => setRadius(Number(e.target.value))} /></label>
        <button onClick={() => navigator.clipboard.writeText(parsed.seed.toString())}>Copy numeric seed</button>
      </div>
      <p className="note">Parse accuracy: <span className={`badge ${parsed.accuracy}`}>{parsed.accuracy}</span> — {parsed.note}. Engine {ENGINE_VERSION}.</p>
      <div className="card">
        <table>
          <thead><tr><th>Structure</th><th>X</th><th>Z</th><th>Distance</th><th>Accuracy</th></tr></thead>
          <tbody>
            {hits.map((h, i) => (
              <tr key={i}>
                <td>{h.name}</td><td>{h.x}</td><td>{h.z}</td>
                <td>{Math.round(h.distance)}</td>
                <td><span className={`badge ${h.accuracy}`}>{h.accuracy}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {hits.length === 0 && <p className="note">No candidates in this radius.</p>}
      </div>
      <div className="card">
        <h3>Not simulated</h3>
        {Object.values(STRUCTURES).filter((s) => !s.implemented).map((s) => (
          <p className="note" key={s.id}>{s.id} — <span className="badge UNSUPPORTED">UNSUPPORTED</span></p>
        ))}
      </div>
    </div>
  );
}
