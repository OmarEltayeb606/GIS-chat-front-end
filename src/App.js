import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/showpart/navbar';
import MapView from './components/showpart/mapview';
import Home from './components/HomePage/home';
import ImgView from './components/showpart/imgView/imgview.jsx';
import AI from './components/AI/ai.jsx';
import About from './components/about/about.jsx';
import './App.css';

// مكون لإدارة عرض Navbar بشكل مشروط
const AppContent = () => {
  const location = useLocation();

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/mapView" element={<MapView />} />
        <Route path="/imgView" element={<ImgView />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<div><h2>404 - الصفحة غير موجودة</h2></div>} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppContent />
    </Router>
  );
}

export default App;