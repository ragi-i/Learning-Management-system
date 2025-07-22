import React, { useState, useContext } from 'react';
import { AuthContext } from '../authContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import '../Style/LoginSignup.css';

const LoginSignup = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      role: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = isRegister ? '/auth/register' : '/auth/login';

    try {
      const payload = isRegister
        ? formData
        : { email: formData.email, password: formData.password };

      const res = await API.post(endpoint, payload);

      setLoading(false);
      if (isRegister) {
        setSuccess('Signup successful! You can now log in.');
      } else {
        setSuccess('Signin successful! Redirecting...');
      }

      login(res.data.token, res.data.user);

      if (!isRegister) {
        setTimeout(() => {
          if (res.data.user.role === 'admin') {
            navigate('/admin/home');
          } else {
            navigate('/home');
          }
        }, 1200);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card" role="main" aria-label={isRegister ? "Register" : "Login"}>
        <div className="login-toggle" role="tablist">
          <button
            className={!isRegister ? 'active' : ''}
            onClick={() => {
              setIsRegister(false);
              setFormData({ name: '', email: '', password: '', role: 'user' });
              setError('');
              setSuccess('');
              setLoading(false);
            }}
            aria-selected={!isRegister}
            aria-label="Login Tab"
            type="button"
          >
            Login
          </button>
          <button
            className={isRegister ? 'active' : ''}
            onClick={() => {
              setIsRegister(true);
              setFormData({ name: '', email: '', password: '', role: 'user' });
              setError('');
              setSuccess('');
              setLoading(false);
            }}
            aria-selected={isRegister}
            aria-label="Register Tab"
            type="button"
          >
            Register
          </button>
        </div>
        <h2 className="login-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          {isRegister && (
            <div className="input-group">
              <span className="input-icon">
                <i className="fa fa-user" aria-hidden="true"></i>
              </span>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="off"
                aria-label="Name"
              />
            </div>
          )}
          <div className="input-group">
            <span className="input-icon">
              <i className="fa fa-envelope" aria-hidden="true"></i>
            </span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="off"
              aria-label="Email"
            />
          </div>
          <div className="input-group">
            <span className="input-icon">
              <i className="fa fa-lock" aria-hidden="true"></i>
            </span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="off"
              aria-label="Password"
            />
          </div>
          {isRegister && (
            <div className="role-radio-group-modern" role="radiogroup" aria-label="Select Role">
              <label className={formData.role === 'user' ? 'selected' : ''}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={handleRoleChange}
                  aria-checked={formData.role === 'user'}
                />
                <span>User</span>
              </label>
              <label className={formData.role === 'admin' ? 'selected' : ''}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleRoleChange}
                  aria-checked={formData.role === 'admin'}
                />
                <span>Admin</span>
              </label>
            </div>
          )}
          {loading && (
            <div className="login-message info">
              {isRegister ? 'Signing up, please wait...' : 'Signing in, please wait...'}
            </div>
          )}
          {success && (
            <div className="login-message success">
              {success}
            </div>
          )}
          <button type="submit" className="login-btn" disabled={loading}>
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        {error && <p className="login-error" role="alert">{error}</p>}
        <div className="login-switch">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            className="switch-btn"
            onClick={() => {
              setIsRegister(!isRegister);
              setFormData({ name: '', email: '', password: '', role: 'user' });
              setError('');
              setSuccess('');
              setLoading(false);
            }}
            type="button"
            disabled={loading}
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </div>
      </div>
      {/* FontAwesome CDN for icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </div>
  );
};

export default LoginSignup;