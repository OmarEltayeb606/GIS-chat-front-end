import React, { useEffect, useState } from 'react';
import laptopMap from './../../imgs/8.42106016883417.png';
import './welcomeScreen.css';

function WelcomeScreen() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    // تحميل وضع المود المحفوظ
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(savedMode === 'true');
      document.body.classList.toggle('light-mode', savedMode === 'false');
    }

    // تفعيل الأنيميشن للعناصر العائمة
    createFloatingElements();

    // إضافة تأثير التمرير للشريط العلوي
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // تبديل المود (داكن/فاتح)
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.body.classList.toggle('light-mode', !newMode);
  };

  // التعامل مع التمرير
  const handleScroll = () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  // إنشاء العناصر العائمة في الخلفية
  const createFloatingElements = () => {
    const floatingElements = document.querySelector('.floating-elements');
    if (!floatingElements) return;

    // إزالة العناصر الموجودة
    while (floatingElements.firstChild) {
      floatingElements.removeChild(floatingElements.firstChild);
    }

    // إنشاء عناصر جديدة
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.classList.add('floating-item');

      // حجم عشوائي
      const size = Math.random() * 100 + 50;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // موقع عشوائي
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.left = `${Math.random() * 100}%`;

      // سرعة أنيميشن عشوائية
      const duration = Math.random() * 15 + 10;
      particle.style.animationDuration = `${duration}s`;

      // تأخير عشوائي
      const delay = Math.random() * 5;
      particle.style.animationDelay = `${delay}s`;

      // إضافة العنصر للصفحة
      floatingElements.appendChild(particle);
    }
  };

  // معالج النقر على الزر
  const handleTryNowClick = () => {
    console.log('Try Now button clicked');
    // يمكنك إضافة أي وظيفة أخرى تريدها هنا
  };

  return (
    <div>
      <nav className="navbar">
        <a href="#" className="logo">GIS Chat</a>
        <div className="nav-links">
          <a href="#features" className="nav-link">الميزات</a>
          <a href="#vector" className="nav-link">تحليل البيانات</a>
          <a href="#raster" className="nav-link">معالجة البيانات</a>
          <a href="#contact" className="nav-link">اتصل بنا</a>
        </div>
        <button 
          className="mode-toggle" 
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
        >
          <i className={darkMode ? 'fas fa-sun' : 'fas fa-moon'} id="mode-icon"></i>
        </button>
      </nav>
      
      <div className="screen1">
        <div className="background-grid"></div>
        <div className="floating-elements"></div>
        
        <div className="supTitle1">
          <h1 className="title1">
            <span>مرحباً بك في</span>
            GIS chat
          </h1>
          <p className="subtitle">
            منصة متقدمة لتحليل ومعالجة بيانات نظم المعلومات الجغرافية بطريقة تفاعلية وبسيطة
          </p>
          <button onClick={handleTryNowClick} className="mainButton">
            جرب الآن
          </button>
        </div>
        
        <div className="laptop-map-container">
          <img 
            className="laptop-map" 
            src={laptopMap} 
            alt="GIS Chat Screenshot" 
          />
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
