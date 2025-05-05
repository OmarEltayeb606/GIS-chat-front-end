import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">الرئيسية</Link></li>
        <li><Link to="/mapView">عرض الخريطة</Link></li>
        <li><Link to="/imgView">عرض الصور</Link></li>
        <li><Link to="/ai">الذكاء الاصطناعي</Link></li>
        <li><Link to="/about">حول</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
