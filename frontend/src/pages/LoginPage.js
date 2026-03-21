import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.username, form.password);
      toast.success(`Welcome back, ${user.first_name || user.username}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (username, password) => {
    setForm({ username, password });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-circle">🩸</div>
          <h1>LifeLink Blood Bank</h1>
          <p>B.Tech Project — Blood Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger mb-4">
              ⚠️ {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        {/* Quick Login Buttons for demo */}
        <div style={{ marginTop: 24 }}>
          <p className="text-muted text-center mb-4" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Quick Demo Login</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm flex-center gap-2" style={{ flex: 1 }}
              onClick={() => quickLogin('admin', 'Admin@1234')}>
              🔑 Admin
            </button>
            <button className="btn btn-secondary btn-sm flex-center gap-2" style={{ flex: 1 }}
              onClick={() => quickLogin('donor1', 'Donor@1234')}>
              💉 Donor
            </button>
            <button className="btn btn-secondary btn-sm flex-center gap-2" style={{ flex: 1 }}
              onClick={() => quickLogin('aiims_hospital', 'Hospital@1234')}>
              🏥 Hospital
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one →</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
