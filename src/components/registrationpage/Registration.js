import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registration.css';

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 8) {
      setError('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch('YOUR_API_ENDPOINT/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ أثناء التسجيل');
      }

      // Redirect to main page after successful registration
      navigate('/main');
      
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="gis-background"></div>
      <div className="registration-box">
        <h2>إنشاء حساب جديد</h2>
        {error && <p className="error-message">{error}</p>}
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
          <div className="input-group">
            <span className="icon"><i className="fas fa-lock"></i></span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="تأكيد كلمة المرور"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className={isLoading ? 'loading' : ''}
            disabled={isLoading}
          >
            {isLoading ? '' : 'إنشاء حساب'}
          </button>
          <div className="auth-links">
            <a href="/login" className="login-link">لديك حساب بالفعل؟ تسجيل الدخول</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration; 