import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import './Login.css';

const Login = () => {
  const { lang } = useLanguage();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // إدارة إحداثيات المؤشر
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // نقاط جغرافية مع إحداثيات أساسية
  const initialPoints = [
    { id: 1, x: 25, y: 30, baseX: 25, baseY: 30 },
    { id: 2, x: 60, y: 45, baseX: 60, baseY: 45 },
    { id: 3, x: 40, y: 70, baseX: 40, baseY: 70 },
    { id: 4, x: 80, y: 20, baseX: 80, baseY: 20 },
    { id: 5, x: 15, y: 55, baseX: 15, baseY: 55 },
  ];
  const [points, setPoints] = useState(initialPoints);

  // تتبع حركة المؤشر
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });

        // تحديث النقاط بناءً على قرب المؤشر
        setPoints((prevPoints) =>
          prevPoints.map((point) => {
            const dx = x - point.baseX;
            const dy = y - point.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 30; // نطاق التأثير
            if (distance < maxDistance) {
              const force = (1 - distance / maxDistance) * 2; // قوة الانجذاب
              return {
                ...point,
                x: point.baseX + (dx * force) / 5,
                y: point.baseY + (dy * force) / 5,
              };
            }
            return {
              ...point,
              x: point.baseX,
              y: point.baseY,
            };
          })
        );
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // نصوص مترجمة بناءً على اللغة
  const text = {
    ar: {
      title: 'تسجيل الدخول إلى الخريطة',
      firstName: 'الاسم الأول',
      lastName: 'الاسم الأخير',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      login: 'تسجيل الدخول',
      createAccount: 'إنشاء حساب',
      forgotPassword: 'نسيت كلمة المرور؟',
      missingFields: 'يرجى تعبئة جميع الحقول',
      loginError: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
      invalidCredentials: 'كلمة المرور غير صحيحة',
    },
    en: {
      title: 'Login to Map',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      password: 'Password',
      login: 'Login',
      createAccount: 'Create Account',
      forgotPassword: 'Forgot Password?',
      missingFields: 'Please fill in all fields',
      loginError: 'Please enter email and password',
      invalidCredentials: 'Incorrect password',
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!formData.email || !formData.password) {
      setMessage(text[lang].loginError);
      setIsError(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // تنظيف رسالة الخطأ من رمز الحالة (مثل "400: ")
        const cleanedMessage = data.detail.replace(/^\d+:\s*/, '');
        throw new Error(cleanedMessage || text[lang].invalidCredentials);
      }

      if (!data.access_token) {
        throw new Error('No token returned from server, check backend');
      }

      console.log('Login response:', data);
      setMessage(data.message);
      setIsError(false);
      localStorage.setItem('token', data.access_token);
      console.log('Token stored in localStorage:', localStorage.getItem('token'));
      navigate('/home');
    } catch (err) {
      setMessage(err.message || text[lang].invalidCredentials);
      setIsError(true);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setMessage('');
    setIsError(false);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setMessage(text[lang].missingFields);
      setIsError(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // تنظيف رسالة الخطأ من رمز الحالة
        const cleanedMessage = data.detail.replace(/^\d+:\s*/, '');
        throw new Error(cleanedMessage || text[lang].missingFields);
      }

      setMessage(data.message);
      setIsError(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      });
    } catch (err) {
      setMessage(err.message || text[lang].missingFields);
      setIsError(true);
      console.error('Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`login-container ${isDark ? 'dark-mode' : ''} ${lang === 'ar' ? 'rtl' : 'ltr'}`}
      ref={containerRef}
    >
      <div className="gis-background">
        <svg className="gis-grid" viewBox="0 0 100 100" preserveAspectRatio="none">
          <g className="grid-lines">
            {/* خطوط الطول */}
            <path d="M10 0 V100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M20 0 V100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M30 0 V100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M40 0 V100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M50 0 V100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M60 0 V100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M70 0 V100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M80 0 V100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M90 0 V100" stroke="currentColor" strokeWidth="0.2" />
            {/* خطوط العرض */}
            <path d="M0 10 H100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M0 20 H100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M0 30 H100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M0 40 H100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M0 50 H100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M0 60 H100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M0 70 H100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M0 80 H100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M0 90 H100" stroke="currentColor" strokeWidth="0.2" />
          </g>
          <g className="geo-points">
            {/* النقاط التفاعلية */}
            {points.map((point) => (
              <circle
                key={point.id}
                cx={point.x}
                cy={point.y}
                r="0.5"
                fill="currentColor"
                className="geo-point"
              />
            ))}
          </g>
          {/* دائرة توهج عند موقع المؤشر */}
          <circle
            cx={mousePos.x}
            cy={mousePos.y}
            r="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.3"
            className="mouse-glow"
          />
        </svg>
      </div>
      <div className="login-box">
        <h2>{text[lang].title}</h2>
        {message && (
          <p className={isError ? 'error-message' : 'success-message'}>{message}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="name-group">
            <div className="input-group">
              <span className="icon"><i className="fas fa-user"></i></span>
              <input
                type="text"
                name="firstName"
                placeholder={text[lang].firstName}
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="input-group">
              <span className="icon"><i className="fas fa-user"></i></span>
              <input
                type="text"
                name="lastName"
                placeholder={text[lang].lastName}
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="input-group">
            <span className="icon"><i className="fas fa-envelope"></i></span>
            <input
              type="email"
              name="email"
              placeholder={text[lang].email}
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="input-group">
            <span className="icon"><i className="fas fa-lock"></i></span>
            <input
              type="password"
              name="password"
              placeholder={text[lang].password}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? '' : text[lang].login}
          </button>
          <button
            type="button"
            className={`create-account-btn ${isLoading ? 'loading' : ''}`}
            onClick={handleCreateAccount}
            disabled={isLoading}
          >
            {isLoading ? '' : text[lang].createAccount}
          </button>
          <a href="#" className="forgot-password">
            {text[lang].forgotPassword}
          </a>
        </form>
      </div>
    </div>
  );
};

export default Login;