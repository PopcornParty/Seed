import { ENGINE_VERSION, TARGET_BEDROCK_VERSION, LIMITATIONS, STRUCTURES, FEATURE_STATUS } from "../engineCopy";

export default function DocsPage() {
  return (
    <div>
      <h2>Documentation</h2>
      <p className="lead">Bedrock {TARGET_BEDROCK_VERSION} · engine {ENGINE_VERSION}. Structure candidates from published MCBEStructureFinder constants.</p>
      <div className="card">
        <h3>Accuracy</h3>
        <p>EXACT — specified and tested. VALIDATED — matches published reverse-engineering. APPROXIMATE — missing a later filter. UNSUPPORTED — refused.</p>
        {Object.entries(FEATURE_STATUS).map(([k, v]) => (
          <p key={k}>{k} <span className={`badge ${v}`}>{v}</span></p>
        ))}
      </div>
      <div className="card">
        <h3>Structures</h3>
        <table>
          <thead><tr><th>Id</th><th>Spacing</th><th>Range</th><th>Salt</th><th>Candidate</th><th>Biome</th></tr></thead>
          <tbody>
            {Object.values(STRUCTURES).map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td><td>{s.spacing || "—"}</td><td>{s.spawnRange || "—"}</td><td>{s.salt || "—"}</td>
                <td><span className={`badge ${s.candidateAccuracy}`}>{s.candidateAccuracy}</span></td>
                <td><span className={`badge ${s.biomeAccuracy}`}>{s.biomeAccuracy}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3>API</h3>
        <pre className="note">{`POST /api/search
GET  /api/search/:id
GET  /api/search/:id/results
DELETE /api/search/:id`}</pre>
      </div>
      <div className="card">
        <h3>Limits</h3>
        {LIMITATIONS.map((l) => <p className="note" key={l}>• {l}</p>)}
      </div>
    </div>
  );
}
