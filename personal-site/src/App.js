import { useState } from "react"
import React, { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import logo from './logo.svg';
import './App.css';

const Home = lazy(() => import("./Pages/Home"))
const Footer = lazy(() => import("./Pages/Navs/Footer"))
const Nav = lazy(() => import("./Pages/Navs/Nav"))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </Suspense>
  );
}

export default App;
