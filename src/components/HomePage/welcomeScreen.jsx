import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './welcomeScreen.css';

function WelcomeScreen() {
  const [scrollY, setScrollY] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('darkMode') === 'true';
    } catch {
      return false;
    }
  });
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('language') || 'en';
    } catch {
      return 'en';
    }
  });
  const parallaxRef = useRef(null);
  const floatingElements = useRef([]);

  // Content in multiple languages
  const content = {
    en: {
      title: "Welcome to GeoVision",
      subtitle: "Advanced Geospatial Data Processing Platform",
      description: "Process, visualize, and analyze your geospatial data with our cutting-edge tools. Upload vector and raster data to gain valuable insights.",
      features: [
        {
          title: "Vector Processing",
          description: "Analyze shapefile data with powerful client-side tools",
          icon: "📍"
        },
        {
          title: "Raster Analysis",
          description: "Process and visualize raster data directly in your browser",
          icon: "🖼️"
        },
        {
          title: "Interactive Mapping",
          description: "Explore your geographic data with intuitive controls",
          icon: "🗺️"
        }
      ],
      cta: "Get Started",
      scrollForMore: "Scroll to explore"
    },
    ar: {
      title: "مرحبًا بك في جيوفيجن",
      subtitle: "منصة متقدمة لمعالجة البيانات الجغرافية المكانية",
      description: "قم بمعالجة وتصور وتحليل بياناتك الجغرافية المكانية باستخدام أدواتنا المتطورة. قم بتحميل بيانات المتجهات والبيانات النقطية للحصول على رؤى قيمة.",
      features: [
        {
          title: "معالجة المتجهات",
          description: "تحليل بيانات ملفات الأشكال باستخدام أدوات قوية على جانب العميل",
          icon: "📍"
        },
        {
          title: "تحليل البيانات النقطية",
          description: "معالجة وتصور البيانات النقطية مباشرة في متصفحك",
          icon: "🖼️"
        },
        {
          title: "رسم خرائط تفاعلي",
          description: "استكشف بياناتك الجغرافية بأدوات تحكم بديهية",
          icon: "🗺️"
        }
      ],
      cta: "ابدأ الآن",
      scrollForMore: "مرر لاستكشاف المزيد"
    }
  };

  // Handle scrolling effects with RAF
  useEffect(() => {
    let rafId;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Create floating elements animation effect
  useEffect(() => {
    const createFloatingElements = () => {
      if (!parallaxRef.current) return;

      // Clear previous elements
      floatingElements.current.forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      floatingElements.current = [];

      // Number of elements to create
      const count = 15;

      for (let i = 0; i < count; i++) {
        const element = document.createElement('div');
        element.className = 'floating-element';

        // Random properties
        const size = Math.random() * 60 + 20;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const animationDuration = Math.random() * 20 + 10;
        const animationDelay = Math.random() * 5;
        const opacity = Math.random() * 0.3 + 0.1;

        // Apply styles
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        element.style.left = `${posX}%`;
        element.style.top = `${posY}%`;
        element.style.animationDuration = `${animationDuration}s`;
        element.style.animationDelay = `${animationDelay}s`;
        element.style.opacity = opacity;

        // Randomize the shape
        const shapeClass = Math.random() > 0.5 ? 'circle' : 'square';
        element.classList.add(shapeClass);

        parallaxRef.current.appendChild(element);
        floatingElements.current.push(element);
      }
    };

    createFloatingElements();
    window.addEventListener('resize', createFloatingElements);

    return () => {
      window.removeEventListener('resize', createFloatingElements);
      floatingElements.current.forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      floatingElements.current = [];
    };
  }, []);

  // Sync dark mode and language direction
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const currentContent = content[language];

  return (
    <div className={`welcome-screen ${language === 'ar' ? 'rtl' : ''}`}>
      <div 
        ref={parallaxRef}
        className="parallax-background"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      ></div>
      
      <motion.div 
        className="welcome-content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="welcome-header">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {currentContent.title}
          </motion.h1>
          
          <motion.p
            className="subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {currentContent.subtitle}
          </motion.p>
          
          <motion.p
            className="description"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {currentContent.description}
          </motion.p>
          
          <motion.div
            className="welcome-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <motion.button 
              className="cta-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => console.log('CTA clicked')}
              role="button"
              tabIndex={0}
              aria-label="Get started with GeoVision"
            >
              {currentContent.cta}
            </motion.button>
            
            <motion.div
              className="preference-toggles"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <button 
                className={`mode-toggle ${darkMode ? 'dark' : 'light'}`}
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="toggle-icon">
                  {darkMode ? '🌙' : '☀️'}
                </span>
              </button>
              
              <button 
                className="language-toggle"
                onClick={toggleLanguage}
                aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
              >
                {language === 'en' ? 'عربي' : 'EN'}
              </button>
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          className="features-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {currentContent.features.map((feature, index) => (
            <motion.div 
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + (index * 0.2), duration: 0.6 }}
              whileHover={{ 
                y: -10,
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="scroll-indicator"
          animate={{
            y: [0, 10, 0],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            delay: 2,
          }}
        >
          <p>{currentContent.scrollForMore}</p>
          <div className="scroll-arrow">⌄</div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default WelcomeScreen;