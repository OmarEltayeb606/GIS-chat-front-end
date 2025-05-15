import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { lang, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">الرئيسية</Link></li>
        <li><Link to="/mapView">عرض الخريطة</Link></li>
        <li><Link to="/imgView">عرض الصور</Link></li>
        <li><Link to="/ai">الذكاء الاصطناعي</Link></li>
        <li><Link to="/about">حول</Link></li>
      </ul>
      <div className="navbar-controls">
        <div className="toggle-group">
          <span>{lang === 'ar' ? 'اللغة:' : 'Language:'}</span>
          <button
            className="toggle-button language-toggle"
            onClick={toggleLanguage}
            aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>
        <div className="toggle-group">
          <span>{lang === 'ar' ? 'السمة:' : 'Theme:'}</span>
          <button
            className={`toggle-button mode-toggle ${isDark ? 'dark' : 'light'}`}
            onClick={toggleTheme}
            aria-label={isDark ? (lang === 'ar' ? 'فاتح' : 'Light') : (lang === 'ar' ? 'داكن' : 'Dark')}
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