import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/showpart/navbar';
import MapView from './components/showpart/mapview';
import Home from './components/HomePage/home'
import ImgView from './components/showpart/imgView/imgview.jsx'
import AI from './components/AI/ai.jsx'
import About from './components/about/about.jsx'
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/mapView" element={<MapView />} />
          <Route path="/" element={<Home/>} />
          <Route path="/imgView" element={<ImgView/>} />
          <Route path="/ai" element={<AI/>} />
          <Route path="/about" element={<About/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;