import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import './navbar.css';

// مكون Navbar لشريط التنقل
const Navbar = () => {
  const { lang, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // نصوص الـ Navbar بناءً على اللغة
  const navText = {
    ar: {
      brand: 'GIS Chat',
      home: 'الرئيسية',
      mapView: 'عرض الخريطة',
      imgView: 'عرض الصور',
      ai: 'الذكاء الاصطناعي',
      about: 'حول',
      logout: 'تسجيل الخروج',
      language: 'اللغة:',
      theme: 'السمة:',
      switchToEnglish: 'Switch to English',
      switchToArabic: 'التبديل إلى العربية',
      light: 'فاتح',
      dark: 'داكن'
    },
    en: {
      brand: 'GIS Chat',
      home: 'Home',
      mapView: 'Map View',
      imgView: 'Image View',
      ai: 'AI',
      about: 'About',
      logout: 'Logout',
      language: 'Language:',
      theme: 'Theme:',
      switchToEnglish: 'Switch to English',
      switchToArabic: 'Switch to Arabic',
      light: 'Light',
      dark: 'Dark'
    }
  };

  // دالة تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // دالة لمنع التنقل إذا لم يكن هناك توكن
  const handleNavigation = (path) => (e) => {
    if (!token) {
      e.preventDefault();
      navigate('/');
    }
  };

  return (
    <nav className={`navbar ${lang === 'ar' ? 'rtl' : 'ltr'} ${isDark ? 'dark-mode' : 'light-mode'}`}>
      <div className="navbar-brand">
        <Link to={token ? "/home" : "/"} onClick={handleNavigation('/home')}>
          {/* {navText[lang].brand} */}
        </Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/home" onClick={handleNavigation('/home')}>
            {navText[lang].home}
          </Link>
        </li>
        <li>
          <Link to="/mapView" onClick={handleNavigation('/mapView')}>
            {navText[lang].mapView}
          </Link>
        </li>
        <li>
          <Link to="/imgView" onClick={handleNavigation('/imgView')}>
            {navText[lang].imgView}
          </Link>
        </li>
        <li>
          <Link to="/ai" onClick={handleNavigation('/ai')}>
            {navText[lang].ai}
          </Link>
        </li>
        <li>
          <Link to="/about" onClick={handleNavigation('/about')}>
            {navText[lang].about}
          </Link>
        </li>
        {token && (
          <li>
            <button onClick={handleLogout} className="logout-btn">
              {navText[lang].logout}
            </button>
          </li>
        )}
      </ul>
      <div className="navbar-controls">
        <div className="toggle-group">
          <span>{navText[lang].language}</span>
          <button
            className="toggle-button language-toggle"
            onClick={toggleLanguage}
            aria-label={lang === 'ar' ? navText[lang].switchToEnglish : navText[lang].switchToArabic}
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>
        <div className="toggle-group">
          <span>{navText[lang].theme}</span>
          <button
            className={`toggle-button mode-toggle ${isDark ? 'dark' : 'light'}`}
            onClick={toggleTheme}
            aria-label={isDark ? navText[lang].light : navText[lang].dark}
          >
            <span className="toggle-slider"></span>
            <span className="toggle-icon">{isDark ? '🌙' : '☀️'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;