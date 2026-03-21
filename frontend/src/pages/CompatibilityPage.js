import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const CompatibilityPage = () => {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState('O+');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bloodbank/compatibility/')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const current = data.find(d => d.blood_group === selected);

  const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <h2 className="page-title">🔬 Blood Compatibility Chart</h2>
        <p className="page-subtitle">Find donor-recipient compatibility for each blood group</p>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <>
          <div className="card mb-6">
            <h3 className="section-title mb-4">Select Blood Group to Check Compatibility</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {bloodGroups.map(bg => (
                <button key={bg}
                  onClick={() => setSelected(bg)}
                  className={`btn ${selected === bg ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minWidth: 64 }}>
                  {bg}
                </button>
              ))}
            </div>

            {current && (
              <div className="grid-2 mt-6">
                <div style={{ background: 'var(--bg-primary)', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ color: 'var(--accent-gold)', marginBottom: 12, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                    ❤️ {selected} Can Donate To
                  </h4>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {current.can_donate_to.map(bg => (
                      <div key={bg} style={{
                        background: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        borderRadius: 8, padding: '8px 16px',
                        color: '#22c55e', fontWeight: 700, fontSize: 16,
                      }}>{bg}</div>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ color: '#63b3ed', marginBottom: 12, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                    💙 {selected} Can Receive From
                  </h4>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {current.can_receive_from.map(bg => (
                      <div key={bg} style={{
                        background: 'rgba(99,179,237,0.1)',
                        border: '1px solid rgba(99,179,237,0.3)',
                        borderRadius: 8, padding: '8px 16px',
                        color: '#63b3ed', fontWeight: 700, fontSize: 16,
                      }}>{bg}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full Compatibility Table */}
          <div className="card">
            <h3 className="section-title mb-4">Full Compatibility Reference Table</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Blood Group</th>
                    <th>Can Donate To</th>
                    <th>Can Receive From</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.id}>
                      <td><span className="blood-tag">{item.blood_group}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {item.can_donate_to.map(bg => (
                            <span key={bg} className="badge badge-approved" style={{ fontSize: 11 }}>{bg}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {item.can_receive_from.map(bg => (
                            <span key={bg} className="badge badge-donor" style={{ fontSize: 11 }}>{bg}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔬</div>
                <p>Compatibility data not found. Ask admin to initialize it from the Django admin panel.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CompatibilityPage;
