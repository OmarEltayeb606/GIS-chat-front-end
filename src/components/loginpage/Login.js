import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!formData.email || !formData.password) {
      setMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور');
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
        throw new Error(data.detail || 'حدث خطأ أثناء تسجيل الدخول');
      }

      if (!data.access_token) {
        throw new Error('لم يتم إرجاع توكن من الخادم، تحقق من الـ backend');
      }

      console.log('Login response:', data); // للتحقق من الاستجابة
      setMessage(data.message);
      setIsError(false);
      localStorage.setItem('token', data.access_token); // تخزين التوكن
      console.log('Token stored in localStorage:', localStorage.getItem('token')); // للتحقق
      navigate('/home'); // إعادة التوجيه إلى الصفحة الرئيسية
    } catch (err) {
      setMessage(err.message || 'حدث خطأ أثناء تسجيل الدخول');
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
      setMessage('يرجى تعبئة جميع الحقول');
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
        throw new Error(data.detail || 'حدث خطأ أثناء إنشاء الحساب');
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
      setMessage(err.message || 'حدث خطأ أثناء إنشاء الحساب');
      setIsError(true);
      console.error('Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="gis-background"></div>
      <div className="login-box">
        <h2>تسجيل الدخول إلى الخريطة</h2>
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
                placeholder="الاسم الأول"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="input-group">
              <span className="icon"><i className="fas fa-user"></i></span>
              <input
                type="text"
                name="lastName"
                placeholder="الاسم الأخير"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="input-group">
            <span className="icon"><i className="fas fa-envelope"></i></span>
            <input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني"
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
              placeholder="كلمة المرور"
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
            {isLoading ? '' : 'تسجيل الدخول'}
          </button>
          <button
            type="button"
            className={`create-account-btn ${isLoading ? 'loading' : ''}`}
            onClick={handleCreateAccount}
            disabled={isLoading}
          >
            {isLoading ? '' : 'إنشاء حساب'}
          </button>
          <a href="#" className="forgot-password">نسيت كلمة المرور؟</a>
        </form>
      </div>
    </div>
  );
};

export default Login;