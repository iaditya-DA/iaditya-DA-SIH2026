
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import './App.css'
import Home from "./Pages/Home.jsx";


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <BrowserRouter>
       <Routes>
          <Route path="/" element={<Home/>} />
       </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
