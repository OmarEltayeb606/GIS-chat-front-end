import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './navbar.css';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('en'); // Default language
  const location = useLocation();

  // Check scroll position to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Update document direction for RTL
  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  // Multi-language navigation items
  const navItems = {
    en: [
      { path: '/', label: 'Home' },
      { path: '/mapView', label: 'Map View' },
      { path: '/imgView', label: 'Image View' },
      { path: '/ai', label: 'AI' },
      { path: '/about', label: 'About' }
    ],
    ar: [
      { path: '/', label: 'الرئيسية' },
      { path: '/mapView', label: 'عرض الخريطة' },
      { path: '/imgView', label: 'عرض الصور' },
      { path: '/ai', label: 'الذكاء الاصطناعي' },
      { path: '/about', label: 'حول' }
    ]
  };

  return (
    <motion.nav 
      className={`navbar ${isScrolled ? 'scrolled' : ''} ${language === 'ar' ? 'rtl' : ''}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <motion.div 
          className="navbar-logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/">
            <span className="logo-text">GeoVision</span>
            <span className="logo-icon">🌍</span>
          </Link>
        </motion.div>
        
        <div className="navbar-right">
          <ul className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {navItems[language].map((item, index) => (
              <motion.li 
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <Link 
                  to={item.path} 
                  className={location.pathname === item.path ? 'active' : ''}
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.label}
                  {location.pathname === item.path && (
                    <motion.div 
                      className="active-indicator" 
                      layoutId="activeIndicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.li>
            ))}
          </ul>
          
          <motion.button 
            className="language-toggle"
            onClick={toggleLanguage}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
          >
            {language === 'en' ? 'عربي' : 'EN'}
          </motion.button>
          
          <motion.button 
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
          >
            <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;