import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Scan from "./pages/Scan";
export default function App() {
  return <Routes><Route path="/" element={<Home />} /><Route path="/scan" element={<Scan />} /></Routes>;
}
