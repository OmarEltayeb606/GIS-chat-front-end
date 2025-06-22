import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import './navbar.css';

// مكون Navbar لشريط التنقل
const Navbar = () => {
  const { lang, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  // نصوص الـ Navbar بناءً على اللغة
  const navText = {
    ar: {
      brand: 'GIS Chat',
      home: 'الرئيسية',
      mapView: 'عرض الخريطة',
      imgView: 'عرض الصور',
      ai: 'الذكاء الاصطناعي',
      about: 'حول',
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
      language: 'Language:',
      theme: 'Theme:',
      switchToEnglish: 'Switch to English',
      switchToArabic: 'Switch to Arabic',
      light: 'Light',
      dark: 'Dark'
    }
  };

  return (
    <nav className={`navbar ${lang === 'ar' ? 'rtl' : 'ltr'} ${isDark ? 'dark-mode' : 'light-mode'}`}>
      <div className="navbar-brand">
        <Link to="/home">
          {/* {navText[lang].brand} */}
        </Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/home">
            {navText[lang].home}
          </Link>
        </li>
        <li>
          <Link to="/mapView">
            {navText[lang].mapView}
          </Link>
        </li>
        <li>
          <Link to="/imgView">
            {navText[lang].imgView}
          </Link>
        </li>
        <li>
          <Link to="/ai">
            {navText[lang].ai}
          </Link>
        </li>
        <li>
          <Link to="/about">
            {navText[lang].about}
          </Link>
        </li>
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