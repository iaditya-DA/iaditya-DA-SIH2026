
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import './App.css'
import Home from "./Pages/Home.jsx";
import FluidWebsite from "./Pages/FluidWebsite.jsx";
import SIHFluidWebsite from "./Pages/SIHFluidWebsite.jsx";
import TeamRegistration from "./Pages/TeamRegistration";


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SIHFluidWebsite />} />
          <Route path="/original" element={<Home />} />
          <Route path="/demo" element={<FluidWebsite />} />

          {/* NEW */}
          <Route path="/team-registration" element={<TeamRegistration />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
