import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard', roles: ['admin', 'donor', 'hospital'] },
  { to: '/inventory', icon: '🩸', label: 'Blood Inventory', roles: ['admin', 'donor', 'hospital'] },
  { to: '/requests', icon: '📋', label: 'Blood Requests', roles: ['admin', 'donor', 'hospital'] },
  { to: '/donations', icon: '💉', label: 'Donations', roles: ['admin', 'donor'] },
  { to: '/donors', icon: '👥', label: 'Donors', roles: ['admin', 'hospital'] },
  { to: '/compatibility', icon: '🔬', label: 'Compatibility', roles: ['admin', 'donor', 'hospital'] },
  { to: '/ml-predictor', icon: '🤖', label: 'AI Predictor', roles: ['admin'] },
  { to: '/profile', icon: '👤', label: 'My Profile', roles: ['admin', 'donor', 'hospital'] },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  const getInitials = () => {
    if (!user) return '?';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || user.username?.[0] || ''}`.toUpperCase();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🩸</div>
        <div className="logo-text">
          <h2>LifeLink</h2>
          <span>Blood Bank System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Navigation</span>
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <span className="nav-section-label" style={{ marginTop: 12 }}>Account</span>
        <button className="nav-item" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">{getInitials()}</div>
          <div className="user-info">
            <div className="user-name">{user?.first_name || user?.username}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
