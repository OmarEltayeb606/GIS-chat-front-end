import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Navbar from './components/showpart/navbar';
import MapView from './components/showpart/mapview';
import Home from './components/HomePage/home';
import ImgView from './components/showpart/imgView/imgview.jsx';
import AI from './components/AI/ai.jsx';
import About from './components/about/about.jsx';
import Login from './components/loginpage/Login.js';
import './App.css';

// مكون ProtectedRoute للحماية
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log('Checking token in ProtectedRoute:', token); // للتحقق من التوكن
    if (!token) {
      console.log('No token found, redirecting to /');
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  return token ? children : null; // بنرجع null لو مفيش توكن
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mapView"
            element={
              <ProtectedRoute>
                <MapView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/imgView"
            element={
              <ProtectedRoute>
                <ImgView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <AI />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div><h2>404 - الصفحة غير موجودة</h2></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;