import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#e63946', '#f4a261', '#48c78e', '#63b3ed', '#a78bfa', '#fb923c', '#f472b6', '#22d3ee'];

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, invRes, reqRes] = await Promise.all([
        api.get('/auth/dashboard/stats/'),
        api.get('/bloodbank/inventory/'),
        api.get('/bloodbank/requests/'),
      ]);
      setStats(statsRes.data);
      setInventory(invRes.data);
      setRequests(reqRes.data.results || reqRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inventoryChartData = inventory.map(item => ({
    name: item.blood_group,
    units: item.units_available,
    threshold: item.minimum_threshold,
  }));

  const requestStatusData = stats ? [
    { name: 'Pending', value: stats.pending_requests, color: '#f59e0b' },
    { name: 'Approved', value: stats.approved_requests, color: '#22c55e' },
  ].filter(d => d.value > 0) : [];

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <h2 className="page-title">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
          <span style={{ color: 'var(--accent-red-light)' }}>{user?.first_name || user?.username}</span> 👋
        </h2>
        <p className="page-subtitle">Here's your blood bank overview for today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon red">🩸</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.total_blood_units || 0}</div>
            <div className="stat-label">Total Blood Units</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.total_donors || 0}</div>
            <div className="stat-label">Registered Donors</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">📋</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.pending_requests || 0}</div>
            <div className="stat-label">Pending Requests</div>
            {stats?.pending_requests > 0 && <span className="stat-badge down">Needs Attention</span>}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">💉</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.total_donations || 0}</div>
            <div className="stat-label">Total Donations</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2 mb-6">
        <div className="chart-card">
          <h3 className="chart-title">🩸 Blood Inventory by Group</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={inventoryChartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 8, color: '#f0f4ff' }}
              />
              <Bar dataKey="units" name="Units Available" radius={[4, 4, 0, 0]}>
                {inventoryChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">📊 Request Status Overview</h3>
          {requestStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={requestStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#64748b' }}>
                  {requestStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 8, color: '#f0f4ff' }} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><div className="empty-icon">📋</div><p>No request data yet</p></div>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {inventory.some(i => i.is_low) && (
        <div className="alert alert-danger mb-6">
          ⚠️ <strong>Low Stock Alert:</strong> Blood groups{' '}
          {inventory.filter(i => i.is_low).map(i => i.blood_group).join(', ')}{' '}
          are below the minimum threshold. Immediate action required!
        </div>
      )}

      {/* Recent Requests */}
      <div className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Recent Blood Requests</h3>
            <p className="section-subtitle">Latest incoming requests</p>
          </div>
        </div>
        {requests.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Required By</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 5).map(req => (
                  <tr key={req.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{req.patient_name}</td>
                    <td><span className="blood-tag">{req.blood_group}</span></td>
                    <td>{req.units_requested} units</td>
                    <td><span className={`badge badge-${req.urgency}`}>{req.urgency}</span></td>
                    <td><span className={`badge badge-${req.status}`}>{req.status}</span></td>
                    <td>{req.required_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No requests yet</h3>
            <p>Blood requests will appear here once submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
