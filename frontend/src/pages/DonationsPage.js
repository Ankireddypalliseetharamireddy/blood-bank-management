import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const DonationsPage = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    blood_group: user?.blood_group || 'A+',
    units_donated: 1.0,
    donation_date: new Date().toISOString().split('T')[0],
    donation_center: '',
    notes: '',
  });

  useEffect(() => { fetchDonations(); }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bloodbank/donations/');
      setDonations(res.data.results || res.data);
    } catch { toast.error('Failed to load donations'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bloodbank/donations/', form);
      toast.success('Donation registered successfully! 🎉 Thank you for saving lives!');
      setShowModal(false);
      fetchDonations();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to register donation');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bloodbank/donations/${id}/`, { status });
      toast.success(`Donation marked as ${status}!`);
      fetchDonations();
    } catch { toast.error('Update failed'); }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">💉 Donations</h2>
          <p className="page-subtitle">Track all blood donation records</p>
        </div>
        {(user?.role === 'donor' || user?.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-donation-btn">
            ➕ Register Donation
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : donations.length > 0 ? (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Donation Date</th>
                  <th>Center</th>
                  <th>Status</th>
                  {user?.role === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {donations.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.donor_name}</td>
                    <td><span className="blood-tag">{d.blood_group}</span></td>
                    <td>{d.units_donated}</td>
                    <td>{d.donation_date}</td>
                    <td>{d.donation_center}</td>
                    <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                    {user?.role === 'admin' && (
                      <td>
                        {d.status === 'pending' && (
                          <div className="flex gap-2">
                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(d.id, 'completed')}>
                              ✓ Complete
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(d.id, 'rejected')}>
                              ✗
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">💉</div>
          <h3>No donations recorded yet</h3>
          <p>Be the first to register a donation!</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">💉 Register Blood Donation</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="alert alert-success mb-4">
              🌟 Thank you for donating blood! You're saving up to 3 lives!
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Blood Group *</label>
                  <select className="form-control" value={form.blood_group}
                    onChange={e => setForm({...form, blood_group: e.target.value})}>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Units Donated *</label>
                  <input type="number" className="form-control" min="0.5" max="5" step="0.5"
                    value={form.units_donated} onChange={e => setForm({...form, units_donated: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Donation Date *</label>
                  <input type="date" className="form-control" required
                    value={form.donation_date} onChange={e => setForm({...form, donation_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Donation Center *</label>
                  <input className="form-control" placeholder="e.g. Red Cross Center, Delhi" required
                    value={form.donation_center} onChange={e => setForm({...form, donation_center: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-control" rows={2} placeholder="Any additional information..."
                  value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary btn-full">🩸 Submit Donation</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsPage;
