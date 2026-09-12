import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SearchPage from "./pages/SearchPage";
import SimulatorPage from "./pages/SimulatorPage";
import ResultsPage from "./pages/ResultsPage";
import MapPage from "./pages/MapPage";
import StatisticsPage from "./pages/StatisticsPage";
import BenchmarkPage from "./pages/BenchmarkPage";
import SavedPage from "./pages/SavedPage";
import DocsPage from "./pages/DocsPage";
import AdvancedPage from "./pages/AdvancedPage";

export default function App() {
  return (
    <div className="layout">
      <nav className="side">
        <h1>SEED</h1>
        <div className="sub">Bedrock Edition only</div>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/simulator">Simulator</NavLink>
        <NavLink to="/results">Results</NavLink>
        <NavLink to="/map">Map</NavLink>
        <NavLink to="/statistics">Statistics</NavLink>
        <NavLink to="/benchmark">Benchmark</NavLink>
        <NavLink to="/saved">Saved searches</NavLink>
        <NavLink to="/advanced">Advanced</NavLink>
        <NavLink to="/docs">Documentation</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/benchmark" element={<BenchmarkPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/advanced" element={<AdvancedPage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Routes>
      </main>
    </div>
  );
}
