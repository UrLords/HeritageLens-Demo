import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Scan from "./pages/Scan";

const Workshop = lazy(() => import("./pages/Workshop"));

export default function App() {
  const workshop = <Suspense fallback={<p>Loading the workshop…</p>}><Workshop /></Suspense>;
  return (
    <Routes>
      <Route path="/workshop" element={workshop} />
      <Route path="/" element={<Home />} />
      {import.meta.env.MODE !== "workshop" && <Route path="/scan" element={<Scan />} />}
    </Routes>
  );
}
