import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/showpart/navbar';
import MapView from './components/showpart/mapview';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/mapView" element={<MapView />} />
          <Route path="/" element={<div>الرئيسية</div>} />
          <Route path="/imgView" element={<div>عرض الصور</div>} />
          <Route path="/ai" element={<div>الذكاء الاصطناعي</div>} />
          <Route path="/about" element={<div>حول</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;