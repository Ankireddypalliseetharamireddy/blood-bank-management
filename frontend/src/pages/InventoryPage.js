import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const InventoryPage = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [editVal, setEditVal] = useState('');

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/bloodbank/inventory/');
      setInventory(res.data);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (id) => {
    try {
      await api.patch(`/bloodbank/inventory/${id}/`, { units_available: parseInt(editVal) });
      toast.success('Inventory updated successfully!');
      setEditItem(null);
      fetchInventory();
    } catch { toast.error('Update failed'); }
  };

  const getBarColor = (units, threshold) => {
    const ratio = units / (threshold * 5);
    if (ratio > 0.6) return '#22c55e';
    if (ratio > 0.3) return '#f59e0b';
    return '#e63946';
  };

  const totalUnits = inventory.reduce((sum, i) => sum + i.units_available, 0);
  const lowStock = inventory.filter(i => i.is_low);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">🩸 Blood Inventory</h2>
          <p className="page-subtitle">Total stock: <strong style={{ color: 'var(--accent-red-light)' }}>{totalUnits} units</strong> across all blood groups</p>
        </div>
        <div className="flex gap-3">
          {lowStock.length > 0 && (
            <div className="badge badge-rejected" style={{ padding: '8px 14px', fontSize: 13 }}>
              ⚠️ {lowStock.length} Low Stock
            </div>
          )}
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="alert alert-danger mb-6">
          ⚠️ <strong>Low Stock Alert!</strong> {lowStock.map(i => i.blood_group).join(', ')} are critically low.
        </div>
      )}

      <div className="inventory-grid mb-6">
        {inventory.map((item) => (
          <div key={item.id} className={`inventory-card${item.is_low ? ' low' : ''}`}>
            <div className="inv-blood-group">{item.blood_group}</div>
            <div className="inv-units">{item.units_available}</div>
            <div className="inv-label">units available</div>
            <div className="inv-bar">
              <div
                className="inv-bar-fill"
                style={{
                  width: `${Math.min((item.units_available / (item.minimum_threshold * 5)) * 100, 100)}%`,
                  background: getBarColor(item.units_available, item.minimum_threshold),
                }}
              />
            </div>
            {item.is_low && (
              <div className="badge badge-rejected mt-4" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
                CRITICAL LOW
              </div>
            )}
            {user?.role === 'admin' && (
              <div style={{ marginTop: 10 }}>
                {editItem === item.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="number"
                      className="form-control"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      min="0"
                    />
                    <button className="btn btn-success btn-sm" onClick={() => handleUpdate(item.id)}>✓</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditItem(null)}>✗</button>
                  </div>
                ) : (
                  <button className="btn btn-secondary btn-sm w-full"
                    onClick={() => { setEditItem(item.id); setEditVal(item.units_available); }}>
                    Edit Units
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <div className="card">
        <h3 className="section-title mb-4">Detailed Inventory Report</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Blood Group</th>
                <th>Units Available</th>
                <th>Minimum Threshold</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td><span className="blood-tag">{item.blood_group}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.units_available} units</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.minimum_threshold} units</td>
                  <td>
                    {item.is_low
                      ? <span className="badge badge-rejected">⚠️ Low Stock</span>
                      : <span className="badge badge-approved">✅ Adequate</span>}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {new Date(item.last_updated).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
