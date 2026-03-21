import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your overview' },
  '/inventory': { title: 'Blood Inventory', subtitle: 'Manage blood stock levels' },
  '/donations': { title: 'Donations', subtitle: 'Track blood donation records' },
  '/requests': { title: 'Blood Requests', subtitle: 'Manage blood supply requests' },
  '/donors': { title: 'Donors', subtitle: 'View eligible blood donors' },
  '/compatibility': { title: 'Blood Compatibility', subtitle: 'Check donor-recipient compatibility' },
  '/ml-predictor': { title: '🤖 AI Demand Predictor', subtitle: 'ML-powered blood demand forecasting' },
  '/profile': { title: 'My Profile', subtitle: 'Manage your account information' },
};

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: 'LifeLink', subtitle: '' };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <header className="header">
      <div>
        <h1 className="header-title">{pageInfo.title}</h1>
        {pageInfo.subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{pageInfo.subtitle}</p>
        )}
      </div>
      <div className="header-actions">
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{today}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {user?.blood_group && <span style={{ color: 'var(--accent-red-light)', fontWeight: 700, marginRight: 8 }}>{user.blood_group}</span>}
            {user?.first_name || user?.username}
          </div>
        </div>
        <div className="avatar" style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, #e63946, #c1121f)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: 'white',
          boxShadow: '0 2px 8px rgba(230,57,70,0.4)'
        }}>
          {`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || user?.username?.[0] || ''}`.toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Header;
