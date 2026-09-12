import { Link } from "react-router-dom";
import { ENGINE_VERSION, TARGET_BEDROCK_VERSION, LIMITATIONS } from "../engineCopy";
export default function Home() {
  return (
    <div>
      <h2>Search millions of Minecraft Bedrock seeds for exactly what you want.</h2>
      <p className="note">Bedrock only. Candidate structures from published salts / MT RNG. Nothing is faked.</p>
      <p><Link to="/search">Start searching</Link></p>
      <div className="card">Target Bedrock {TARGET_BEDROCK_VERSION} · engine {ENGINE_VERSION}</div>
      <div className="card"><ul>{LIMITATIONS.map((n) => <li key={n}>{n}</li>)}</ul></div>
    </div>
  );
}
