import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // هنا يمكنك إضافة منطق تسجيل الدخول (مثل API call)
    if (!email || !password) {
      setError('يرجى تعبئة جميع الحقول');
    } else {
      setError('');
      alert('تم تسجيل الدخول بنجاح!'); // استبدل هذا بمنطقك الفعلي
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* <img src="https://via.placeholder.com/50" alt="Logo" className="logo" /> */}
        <h2>تسجيل الدخول إلى الخريطة</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="icon"><i className="fas fa-user"></i></span>
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <span className="icon"><i className="fas fa-lock"></i></span>
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">تسجيل الدخول</button>
          <a href="#" className="forgot-password">نسيت كلمة المرور؟</a>
        </form>
      </div>
    </div>
  );
};

export default Login;