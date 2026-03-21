import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const RequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({
    patient_name: '', blood_group: 'A+', units_requested: 1,
    urgency: 'medium', hospital_name: '', reason: '',
    required_by: '',
  });

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await api.get('/bloodbank/requests/', { params });
      setRequests(res.data.results || res.data);
    } catch { toast.error('Failed to load requests'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bloodbank/requests/', form);
      toast.success('Blood request submitted successfully!');
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bloodbank/requests/${id}/`, { status });
      toast.success(`Request ${status} successfully!`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...requests].sort((a, b) => (urgencyOrder[a.urgency] || 3) - (urgencyOrder[b.urgency] || 3));

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">📋 Blood Requests</h2>
          <p className="page-subtitle">{requests.length} total requests</p>
        </div>
        <div className="flex gap-3">
          <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="new-request-btn">
            ➕ New Request
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : sorted.length > 0 ? (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Blood</th>
                  <th>Units</th>
                  <th>Hospital</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Required By</th>
                  {user?.role === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {sorted.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.patient_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>by {req.requester_name}</div>
                    </td>
                    <td><span className="blood-tag">{req.blood_group}</span></td>
                    <td>{req.units_requested}</td>
                    <td>{req.hospital_name}</td>
                    <td><span className={`badge badge-${req.urgency}`}>{req.urgency}</span></td>
                    <td><span className={`badge badge-${req.status}`}>{req.status}</span></td>
                    <td>{req.required_by}</td>
                    {user?.role === 'admin' && (
                      <td>
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(req.id, 'approved')}>
                              ✓ Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(req.id, 'rejected')}>
                              ✗
                            </button>
                          </div>
                        )}
                        {req.status === 'approved' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(req.id, 'fulfilled')}>
                            ✓ Fulfill
                          </button>
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
          <div className="empty-icon">📋</div>
          <h3>No requests found</h3>
          <p>Submit a new blood request by clicking "New Request".</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">🩸 Submit Blood Request</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Patient Name *</label>
                <input name="patient_name" className="form-control" placeholder="Full name of patient" required
                  value={form.patient_name} onChange={e => setForm({...form, patient_name: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Blood Group *</label>
                  <select className="form-control" value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})}>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Units Required *</label>
                  <input type="number" className="form-control" min="0.5" step="0.5" required
                    value={form.units_requested} onChange={e => setForm({...form, units_requested: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Urgency *</label>
                  <select className="form-control" value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Required By *</label>
                  <input type="date" className="form-control" required
                    value={form.required_by} onChange={e => setForm({...form, required_by: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Hospital Name *</label>
                <input className="form-control" placeholder="e.g. AIIMS Delhi" required
                  value={form.hospital_name} onChange={e => setForm({...form, hospital_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Reason / Notes *</label>
                <textarea className="form-control" rows={3} placeholder="Reason for blood requirement..."
                  value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary btn-full">🚀 Submit Request</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
