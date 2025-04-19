import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/HomePage/home';
import MapView from './components/showpart/mapview';
import ImgView from './components/showpart/imgView/imgview';
import About from './components/about/about';
import AI from './components/AI/ai';
import Navbar from './components/showpart/navbar';
import ExploreWithUsRaster from './components/HomePage/exploreWithUsRaster';
import ExploreWithUsVector from './components/HomePage/exploreWithUsVector';
import WelcomeScreen from './components/HomePage/welcomeScreen';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/mapView" element={<MapView />} />
          <Route path="/imgView" element={<ImgView />} />
          <Route path="/about" element={<About />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/explore-raster" element={<ExploreWithUsRaster />} />
          <Route path="/explore-vector" element={<ExploreWithUsVector />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;