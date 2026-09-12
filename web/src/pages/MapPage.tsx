import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { parseSeed, simulateSeed, STRUCTURES } from "../engineCopy";

const COLORS: Record<string, string> = {
  village: "#f0c14b", ruined_portal: "#c45cff", stronghold: "#ff6b6b",
  ocean_monument: "#4cc9f0", woodland_mansion: "#8d6e63", pillager_outpost: "#b71c1c",
  desert_pyramid: "#ffe082", shipwreck: "#90caf9", buried_treasure: "#ffd54f",
  swamp_hut: "#81c784", jungle_temple: "#66bb6a", igloo: "#e3f2fd",
  ocean_ruin: "#4db6ac", nether_complex: "#ef5350", end_city: "#ce93d8",
  ruined_portal_nether: "#ab47bc"
};

export default function MapPage() {
  const [params] = useSearchParams();
  const [raw, setRaw] = useState(params.get("seed") || "1");
  const [radius, setRadius] = useState(2000);
  const [layers, setLayers] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(Object.values(STRUCTURES).filter((s) => s.implemented).map((s) => [s.id, true]))
  );
  const [hover, setHover] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, z: 0 });
  const canvas = useRef<HTMLCanvasElement>(null);
  const parsed = useMemo(() => parseSeed(raw), [raw]);
  const hits = useMemo(
    () => simulateSeed(parsed.seed, { centerX: 0, centerZ: 0, radius }).filter((h) => layers[h.name] !== false),
    [parsed.seed, radius, layers]
  );

  useEffect(() => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const w = c.width = c.clientWidth * devicePixelRatio;
    const hgt = c.height = c.clientHeight * devicePixelRatio;
    ctx.fillStyle = "#07131e"; ctx.fillRect(0, 0, w, hgt);
    const scale = (Math.min(w, hgt) * 0.42 * zoom) / Math.max(radius, 1);
    const ox = w / 2 + pan.x; const oz = hgt / 2 + pan.z;
    const to = (x: number, z: number) => [ox + x * scale, oz + z * scale] as const;
    ctx.strokeStyle = "#1b3348";
    for (const ring of [500, 1000, 1500, radius]) {
      ctx.beginPath();
      const [x, y] = to(0, 0);
      ctx.arc(x, y, ring * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#3ee0c3";
    const [sx, sz] = to(0, 0);
    ctx.beginPath(); ctx.arc(sx, sz, 5 * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#8ea3bb"; ctx.font = `${11 * devicePixelRatio}px sans-serif`;
    ctx.fillText("origin / search centre", sx + 8, sz - 8);
    for (const hit of hits) {
      const [x, y] = to(hit.x, hit.z);
      ctx.fillStyle = COLORS[hit.name] || "#fff";
      ctx.beginPath(); ctx.arc(x, y, 4 * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
    }
  }, [hits, radius, zoom, pan]);

  return (
    <div>
      <h2>Map</h2>
      <p className="lead">Only the visible search radius is generated. This is a candidate overlay, not a biome world.</p>
      <div className="card row">
        <label className="field">Seed<input value={raw} onChange={(e) => setRaw(e.target.value)} /></label>
        <label className="field">Radius<input type="number" value={radius} onChange={(e) => setRadius(Number(e.target.value))} /></label>
        <button className="secondary" onClick={() => setZoom((z) => z * 1.2)}>Zoom in</button>
        <button className="secondary" onClick={() => setZoom((z) => z / 1.2)}>Zoom out</button>
        <button className="ghost" onClick={() => { setZoom(1); setPan({ x: 0, z: 0 }); }}>Reset</button>
      </div>
      <div className="legend">
        {Object.values(STRUCTURES).filter((s) => s.implemented).map((s) => (
          <label key={s.id}>
            <input type="checkbox" checked={layers[s.id] !== false} onChange={(e) => setLayers((l) => ({ ...l, [s.id]: e.target.checked }))} />
            <span className="dot" style={{ background: COLORS[s.id] || "#fff" }} />
            {s.id}
          </label>
        ))}
      </div>
      <div className="mapwrap">
        <canvas className="map" ref={canvas} onMouseMove={(e) => {
          const r = (e.target as HTMLCanvasElement).getBoundingClientRect();
          setHover(`${Math.round(e.clientX - r.left)}, ${Math.round(e.clientY - r.top)} px`);
        }} />
      </div>
      <p className="note">{hits.length} candidates · seed parse {parsed.accuracy} · {hover}</p>
    </div>
  );
}
