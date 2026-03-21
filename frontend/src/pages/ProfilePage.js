import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    fetchProfile();
    if (authUser?.role === 'donor') fetchEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile/');
      setProfile(res.data);
      setForm(res.data);
    } catch {} finally { setLoading(false); }
  };

  const fetchEligibility = async () => {
    try {
      const res = await api.get('/ml/eligibility/');
      setEligibility(res.data);
    } catch {}
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/auth/profile/', {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        address: form.address,
        blood_group: form.blood_group,
        date_of_birth: form.date_of_birth,
      });
      setProfile(res.data);
      updateUser(res.data);
      toast.success('Profile updated successfully!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  const initials = `${form.first_name?.[0] || ''}${form.last_name?.[0] || form.username?.[0] || ''}`.toUpperCase();

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <h2 className="page-title">👤 My Profile</h2>
        <p className="page-subtitle">Manage your personal information</p>
      </div>

      <div className="grid-2">
        <div>
          {/* Profile Card */}
          <div className="card mb-6">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 80, height: 80,
                background: 'linear-gradient(135deg, #e63946, #c1121f)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 800, color: 'white',
                margin: '0 auto 16px',
                boxShadow: '0 4px 20px rgba(230,57,70,0.4)',
              }}>{initials}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>
                {profile?.first_name} {profile?.last_name}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>@{profile?.username}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
                <span className={`badge badge-${profile?.role}`}>{profile?.role}</span>
                {profile?.blood_group && <span className="blood-tag">{profile?.blood_group}</span>}
              </div>
            </div>
            {profile?.role === 'donor' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-red-light)' }}>{profile?.total_donations}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Donations</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{profile?.last_donation_date || 'Never'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last Donation</div>
                </div>
              </div>
            )}
          </div>

          {/* Eligibility Card */}
          {eligibility && (
            <div className="card" style={{
              borderColor: eligibility.eligible ? 'rgba(34,197,94,0.4)' : 'rgba(230,57,70,0.4)',
              background: eligibility.eligible ? 'rgba(34,197,94,0.05)' : 'rgba(230,57,70,0.05)',
            }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                {eligibility.eligible ? '✅' : '❌'} Donation Eligibility
              </h4>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 10 }}>{eligibility.recommendation}</p>
              {eligibility.issues.length > 0 && (
                <ul style={{ paddingLeft: 16 }}>
                  {eligibility.issues.map((issue, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>• {issue}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="card">
          <h3 className="section-title mb-4">Edit Information</h3>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-control" value={form.first_name || ''}
                  onChange={e => setForm({...form, first_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-control" value={form.last_name || ''}
                  onChange={e => setForm({...form, last_name: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" value={form.email || ''} disabled style={{ opacity: 0.5 }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-control" value={form.blood_group || ''} onChange={e => setForm({...form, blood_group: e.target.value})}>
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" value={form.date_of_birth || ''}
                  onChange={e => setForm({...form, date_of_birth: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" type="tel" value={form.phone || ''}
                onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={3} value={form.address || ''}
                onChange={e => setForm({...form, address: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
