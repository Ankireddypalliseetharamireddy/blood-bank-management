import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: '',
    first_name: '', last_name: '', role: 'donor',
    phone: '', blood_group: '', date_of_birth: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await register(form);
      toast.success(`Welcome, ${user.first_name || user.username}! Registration successful 🎉`);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msg = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(' | ');
        setError(msg);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="auth-logo">
          <div className="logo-circle">🩸</div>
          <h1>Create Account</h1>
          <p>Join the LifeLink Blood Bank community</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger mb-4">⚠️ {error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input name="first_name" type="text" className="form-control" placeholder="Ravi" value={form.first_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input name="last_name" type="text" className="form-control" placeholder="Kumar" value={form.last_name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input name="username" type="text" className="form-control" placeholder="ravikumar" value={form.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input name="email" type="email" className="form-control" placeholder="ravi@example.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select name="role" className="form-control" value={form.role} onChange={handleChange}>
                <option value="donor">Donor</option>
                <option value="hospital">Hospital</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select name="blood_group" className="form-control" value={form.blood_group} onChange={handleChange}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input name="phone" type="tel" className="form-control" placeholder="9876543210" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input name="date_of_birth" type="date" className="form-control" value={form.date_of_birth} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-control" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input name="password2" type="password" className="form-control" placeholder="Repeat password" value={form.password2} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" id="register-btn" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? '⏳ Creating account...' : '🚀 Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in →</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
