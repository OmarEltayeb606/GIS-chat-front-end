import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleNavigation = (path) => (e) => {
    if (!token) {
      e.preventDefault();
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={token ? "/home" : "/"} onClick={handleNavigation('/home')}>
          GIS Chat
        </Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/home" onClick={handleNavigation('/home')}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/mapView" onClick={handleNavigation('/mapView')}>
            Map View
          </Link>
        </li>
        <li>
          <Link to="/imgView" onClick={handleNavigation('/imgView')}>
            Image View
          </Link>
        </li>
        <li>
          <Link to="/ai" onClick={handleNavigation('/ai')}>
            AI
          </Link>
        </li>
        <li>
          <Link to="/about" onClick={handleNavigation('/about')}>
            About
          </Link>
        </li>
        {token && (
          <li>
            <button onClick={handleLogout} className="logout-btn">
              تسجيل الخروج
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;