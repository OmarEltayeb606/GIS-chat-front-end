import React, { useState } from 'react';
import './ResetPassword.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch('YOUR_API_ENDPOINT/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور');
      }

      setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      setEmail('');
      
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="gis-background"></div>
      <div className="reset-password-box">
        <h2>إعادة تعيين كلمة المرور</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="icon"><i className="fas fa-envelope"></i></span>
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className={isLoading ? 'loading' : ''}
            disabled={isLoading}
          >
            {isLoading ? '' : 'إرسال رابط إعادة التعيين'}
          </button>
          <div className="auth-links">
            <a href="/login" className="back-to-login">العودة إلى تسجيل الدخول</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 