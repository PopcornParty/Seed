import { STRUCTURES, TARGET_BEDROCK_VERSION, ENGINE_VERSION } from "../engineCopy";
export default function DocsPage() {
  return (
    <div>
      <h2>Documentation</h2>
      <p>Engine {ENGINE_VERSION} · Bedrock {TARGET_BEDROCK_VERSION} · Java is not implemented.</p>
      <table>{Object.values(STRUCTURES).map((s) => (
        <tr key={s.id}><td>{s.id}</td><td>{s.candidateAccuracy}</td><td>{s.implemented ? "yes" : "no"}</td></tr>
      ))}</table>
    </div>
  );
}
