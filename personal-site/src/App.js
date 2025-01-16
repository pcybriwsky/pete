import { useState } from "react"
import React, { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import './App.css';
import WorkPage from './Pages/WorkPage';
import ArtPiecePage from './Pages/ArtPiecePage';

const Home = lazy(() => import("./Pages/Home"))
const Footer = lazy(() => import("./Pages/Navs/Footer"))
const Nav = lazy(() => import("./Pages/Navs/Nav"))
const SketchPage = lazy(() => import("./Pages/SketchPage"))
const CaseStudyPage = lazy(() => import("./Pages/CaseStudyPage"))
const RePetePage = lazy(() => import("./Pages/RePetePage"))
const ArtPage = lazy(() => import("./Pages/ArtPage"))
const ConnectPage = lazy(() => import("./Pages/ConnectPage"))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sketches/:sketchName" element={<SketchPage />} />
        <Route path="/work/:projectId" element={<CaseStudyPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/art" element={<ArtPage />} />
        <Route path="/about" element={<RePetePage />} />
        <Route path="/connect" element={<ConnectPage />} />
        <Route path="/art/:pieceId" element={<ArtPiecePage />} />
      </Routes>
      <Footer />
    </Suspense>
  );
}

export default App;
