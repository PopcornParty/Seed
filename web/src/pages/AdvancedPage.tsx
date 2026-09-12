import { useState } from "react";
import { ENGINE_VERSION, TARGET_BEDROCK_VERSION } from "../engineCopy";

const SAMPLE = {
  seedStart: "0",
  seedCount: 10000,
  seedStep: "1",
  area: { centerX: 0, centerZ: 0, radius: 1500, shape: "circle" },
  groups: [{ op: "AND", conditions: [{ name: "village", minCount: 1, maxCount: 99, maxDistance: 500, minDistance: 0, weight: 20 }] }],
  ranking: true,
  topN: 25
};

export default function AdvancedPage() {
  const [text, setText] = useState(JSON.stringify(SAMPLE, null, 2));
  const [msg, setMsg] = useState("");
  function validate() {
    try {
      const j = JSON.parse(text);
      if (!Array.isArray(j.groups)) throw new Error("groups array required");
      setMsg("JSON accepted. Paste it into a local worker payload or POST /api/search. Engine " + ENGINE_VERSION + " / BE " + TARGET_BEDROCK_VERSION);
    } catch (e) {
      setMsg(String(e));
    }
  }
  return (
    <div>
      <h2>Advanced</h2>
      <p className="lead">Raw JSON criteria. Criteria cannot execute code. Dangerous fields are ignored by the API allow-list.</p>
      <textarea style={{ width: "100%", minHeight: 280 }} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="row" style={{ marginTop: 10 }}>
        <button onClick={validate}>Validate JSON</button>
        <button className="secondary" onClick={() => navigator.clipboard.writeText(text)}>Copy</button>
      </div>
      <p className="note">{msg}</p>
    </div>
  );
}
