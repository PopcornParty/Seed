import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SearchPage from "./pages/SearchPage";
import DocsPage from "./pages/DocsPage";
export default function App() {
  return (
    <div className="layout">
      <nav className="side">
        <h1>SEED</h1>
        <p>Bedrock Edition only</p>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/docs">Documentation</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Routes>
      </main>
    </div>
  );
}
