import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import './Header.css';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img src="/logo.png" alt="GIS Chat Logo" />
          </div>
        </div>
      </header>
      <div className="notification-bar">
        <div className="notification-controls">
          <div className="language-switch" onClick={toggleLanguage}>
            <i className="fas fa-globe"></i>
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </div>
          <div className="theme-switch" onClick={toggleTheme}>
            <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header; 