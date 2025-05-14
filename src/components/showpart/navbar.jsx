import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState('ar'); // افتراضي باللغة العربية

  useEffect(() => {
    // تحقق من التفضيلات المحفوظة
    const savedMode = localStorage.getItem('darkMode');
    const savedLang = localStorage.getItem('language');

    if (savedMode) {
      setDarkMode(savedMode === 'true');
    } else {
      // التحقق من تفضيل النظام
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }

    if (savedLang) {
      setLang(savedLang);
    }

    // تطبيق الوضع واللغة على العنصر الأساسي
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    document.body.classList.toggle('rtl', lang === 'ar');
    document.body.classList.toggle('ltr', lang !== 'ar');
  }, [darkMode, lang]);

  // تبديل الوضع المظلم/الفاتح
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
  };

  // تبديل اللغة
  const toggleLanguage = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

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
        <button
          className="toggle-button language-toggle"
          onClick={toggleLanguage}
          aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
          {lang === 'ar' ? 'EN' : 'عربي'}
        </button>
        <button
          className={`toggle-button mode-toggle ${darkMode ? 'dark' : 'light'}`}
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          <span className="toggle-slider"></span>
          <span className="toggle-icon">{darkMode ? '🌙' : '☀️'}</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;