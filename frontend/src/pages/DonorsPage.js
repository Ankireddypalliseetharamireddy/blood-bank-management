import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const DonorsPage = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodFilter, setBloodFilter] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchDonors(); }, [bloodFilter]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = bloodFilter ? { blood_group: bloodFilter } : {};
      const res = await api.get('/auth/donors/', { params });
      setDonors(res.data);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">👥 Blood Donors</h2>
          <p className="page-subtitle">Eligible donors ready to help</p>
        </div>
        <select className="form-control" style={{ width: 160 }} value={bloodFilter}
          onChange={e => setBloodFilter(e.target.value)}>
          <option value="">All Blood Groups</option>
          {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : donors.length > 0 ? (
        <div className="grid-3">
          {donors.map(donor => (
            <div key={donor.id} className="card" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48,
                  background: 'linear-gradient(135deg, #e63946, #c1121f)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 16, color: 'white',
                  boxShadow: '0 2px 8px rgba(230,57,70,0.4)',
                  flexShrink: 0,
                }}>
                  {`${donor.first_name?.[0] || ''}${donor.last_name?.[0] || donor.username?.[0]}`.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {donor.first_name} {donor.last_name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>@{donor.username}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="blood-tag">{donor.blood_group || 'N/A'}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>DONATIONS</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-red-light)' }}>
                    {donor.total_donations}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>LAST DONATED</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {donor.last_donation_date || 'Never'}
                  </div>
                </div>
              </div>
              {donor.phone && (
                <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                  📞 {donor.phone}
                </div>
              )}
              <div className="mt-4">
                <span className={`badge badge-${donor.is_eligible_to_donate ? 'approved' : 'rejected'}`}>
                  {donor.is_eligible_to_donate ? '✅ Eligible to Donate' : '❌ Not Eligible'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No donors found</h3>
          <p>No eligible donors match your filter.</p>
        </div>
      )}
    </div>
  );
};

export default DonorsPage;
