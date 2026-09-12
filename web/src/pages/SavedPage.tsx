import { useState } from "react";
import { deleteSaved, listSaved } from "../lib/storage";

export default function SavedPage() {
  const [items, setItems] = useState(() => listSaved());
  return (
    <div>
      <h2>Saved searches</h2>
      <p className="lead">Stored in this browser only. No account required.</p>
      {items.length === 0 && <p className="note">Nothing saved yet.</p>}
      {items.map((it) => (
        <div className="card" key={it.id}>
          <strong>{it.name}</strong>
          <div className="note">{new Date(it.createdAt).toLocaleString()}</div>
          <pre className="note">{JSON.stringify(it.config, null, 2).slice(0, 600)}</pre>
          <button className="secondary" onClick={() => { deleteSaved(it.id); setItems(listSaved()); }}>Delete</button>
        </div>
      ))}
    </div>
  );
}
