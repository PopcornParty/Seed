import { useEffect, useState } from "react";
import type { SeedResult } from "../engineCopy";
import { listFavourites, toggleFavourite } from "../lib/storage";

export default function ResultsPage() {
  const [selected, setSelected] = useState<SeedResult | null>(null);
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    try { setSelected(JSON.parse(sessionStorage.getItem("seed.selected") || "null")); } catch {}
    setFavs(listFavourites());
  }, []);
  return (
    <div>
      <h2>Result</h2>
      {!selected && <p className="note">Run a search and click a seed first.</p>}
      {selected && (
        <div className="card">
          <h3>SEED: {selected.seed}</h3>
          <p>Score: {selected.score.toFixed(2)}</p>
          {selected.structures.map((s, i) => (
            <p key={i}>{s.name} — {Math.round(s.distance)} blocks ({s.x}, {s.z}) <span className={`badge ${s.accuracy}`}>{s.accuracy}</span></p>
          ))}
          <div className="row">
            <button onClick={() => navigator.clipboard.writeText(selected.seed)}>Copy Seed</button>
            <button className="secondary" onClick={() => navigator.clipboard.writeText(selected.structures.map((s) => `${s.x} ${s.z}`).join(" / "))}>Copy Coordinates</button>
            <a className="btn secondary" href={`/map?seed=${selected.seed}`}>Open Map</a>
            <button className="ghost" onClick={() => setFavs(toggleFavourite(selected.seed))}>Favourite</button>
          </div>
        </div>
      )}
      <div className="card">
        <h3>Favourite seeds</h3>
        {favs.length === 0 && <p className="note">None yet.</p>}
        {favs.map((s) => <div key={s}>{s}</div>)}
      </div>
    </div>
  );
}
