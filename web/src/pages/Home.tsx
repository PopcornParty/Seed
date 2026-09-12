import { Link } from "react-router-dom";
import { ENGINE_VERSION, TARGET_BEDROCK_VERSION, LIMITATIONS, STRUCTURES } from "../engineCopy";

export default function Home() {
  const implemented = Object.values(STRUCTURES).filter((s) => s.implemented).length;
  const unsupported = Object.values(STRUCTURES).filter((s) => !s.implemented).length;
  return (
    <div>
      <div className="hero">
        <div>
          <h2>Search millions of Minecraft Bedrock seeds for exactly what you want.</h2>
          <p className="lead">
            Real Bedrock structure-candidate math (region, salt, truncated MT19937).
            No Java Edition. No fake terrain. Every result is labelled Exact, Validated, Approximate, or Unsupported.
          </p>
          <div className="row" style={{ marginTop: 18 }}>
            <Link className="btn" to="/search">Start Searching</Link>
            <Link className="btn secondary" to="/docs">Read accuracy notes</Link>
          </div>
        </div>
        <div className="card">
          <div className="statgrid">
            <div className="stat">Engine<b>{ENGINE_VERSION}</b></div>
            <div className="stat">Target<b>BE {TARGET_BEDROCK_VERSION}</b></div>
            <div className="stat">Implemented<b>{implemented}</b></div>
            <div className="stat">Unsupported<b>{unsupported}</b></div>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Honest limitations</h3>
        {LIMITATIONS.map((n) => <p className="note" key={n}>• {n}</p>)}
      </div>
    </div>
  );
}
