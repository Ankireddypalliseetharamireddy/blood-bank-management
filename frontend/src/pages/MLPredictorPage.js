import React, { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const MLPredictorPage = () => {
  const [form, setForm] = useState({
    blood_group: 'O+',
    season: 'summer',
    location_type: 'urban',
    current_stock: 20,
    requests_last_week: 15,
    donations_last_week: 8,
    days_since_last_camp: 45,
  });
  const [result, setResult] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('single');

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ml/predict/', form);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Prediction failed. Make sure the model is trained.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPredict = async () => {
    setBulkLoading(true);
    try {
      const res = await api.post('/ml/predict/bulk/', {
        season: form.season,
        location_type: form.location_type,
        requests_last_week: form.requests_last_week,
        donations_last_week: form.donations_last_week,
        days_since_last_camp: form.days_since_last_camp,
      });
      setBulkResult(res.data);
    } catch (err) {
      toast.error('Bulk prediction failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const demandColors = {
    low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#e63946'
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <h2 className="page-title">🤖 AI Blood Demand Predictor</h2>
        <p className="page-subtitle">
          Machine Learning model (Random Forest) predicts blood demand level based on stock and historical patterns
        </p>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(230,57,70,0.1), rgba(99,102,241,0.1))',
        border: '1px solid rgba(230,57,70,0.2)',
        borderRadius: 16, padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 36 }}>🧠</div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>How it works</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            This model was trained on <strong style={{ color: 'var(--text-secondary)' }}>1,000 synthetic blood demand records</strong>{' '}
            using a <strong style={{ color: 'var(--text-secondary)' }}>Random Forest Classifier</strong> (scikit-learn).
            It predicts demand as: <em>Low → Medium → High → Critical</em> based on blood group popularity,
            season, location, current stock, and recent donation/request trends.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button className={`btn ${activeTab === 'single' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('single')}>🔍 Single Prediction</button>
        <button className={`btn ${activeTab === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('bulk')}>📊 Bulk All Groups</button>
      </div>

      {activeTab === 'single' && (
        <div className="grid-2">
          <div className="card">
            <h3 className="section-title mb-4">Input Parameters</h3>
            <form onSubmit={handlePredict}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-control" value={form.blood_group}
                    onChange={e => setForm({...form, blood_group: e.target.value})}>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Season</label>
                  <select className="form-control" value={form.season}
                    onChange={e => setForm({...form, season: e.target.value})}>
                    <option value="winter">Winter</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="monsoon">Monsoon</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location Type</label>
                <select className="form-control" value={form.location_type}
                  onChange={e => setForm({...form, location_type: e.target.value})}>
                  <option value="urban">Urban</option>
                  <option value="semi-urban">Semi-Urban</option>
                  <option value="rural">Rural</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Current Stock (units): <strong style={{ color: 'var(--accent-red-light)' }}>{form.current_stock}</strong></label>
                <input type="range" className="w-full" min="0" max="100" value={form.current_stock}
                  onChange={e => setForm({...form, current_stock: parseInt(e.target.value)})}
                  style={{ accentColor: 'var(--accent-red)' }} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Requests Last Week</label>
                  <input type="number" className="form-control" min="0" max="100"
                    value={form.requests_last_week}
                    onChange={e => setForm({...form, requests_last_week: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Donations Last Week</label>
                  <input type="number" className="form-control" min="0" max="100"
                    value={form.donations_last_week}
                    onChange={e => setForm({...form, donations_last_week: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Days Since Last Camp: <strong style={{ color: 'var(--accent-red-light)' }}>{form.days_since_last_camp}</strong></label>
                <input type="range" className="w-full" min="1" max="90" value={form.days_since_last_camp}
                  onChange={e => setForm({...form, days_since_last_camp: parseInt(e.target.value)})}
                  style={{ accentColor: 'var(--accent-red)' }} />
              </div>
              <button type="submit" id="predict-btn" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? '⏳ Predicting...' : '🤖 Predict Demand'}
              </button>
            </form>
          </div>

          <div>
            {result ? (
              <div>
                <div className="prediction-result" style={{
                  background: `${result.color}10`,
                  borderColor: `${result.color}40`,
                }}>
                  <div className="prediction-label">Predicted Demand for <strong style={{ color: 'var(--text-primary)' }}>{result.blood_group}</strong></div>
                  <div className="prediction-value" style={{ color: result.color }}>{result.prediction}</div>
                  <div className="prediction-confidence">Confidence: {result.confidence}%</div>
                  <hr className="divider" />
                  <div className="prediction-desc">{result.description}</div>
                  <div className="prediction-rec">{result.recommendation}</div>
                </div>

                <div className="card mt-4">
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Probability Breakdown</h4>
                  {Object.entries(result.probabilities || {}).map(([level, prob]) => (
                    <div key={level} style={{ marginBottom: 10 }}>
                      <div className="flex-between" style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: 13, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{level}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: demandColors[level] || 'var(--text-primary)' }}>{prob}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3 }}>
                        <div style={{
                          height: '100%',
                          width: `${prob}%`,
                          background: demandColors[level] || 'var(--accent-red)',
                          borderRadius: 3,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ paddingTop: 80 }}>
                <div className="empty-icon">🤖</div>
                <h3>Ready to Predict</h3>
                <p>Fill in the parameters on the left and click "Predict Demand"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div>
          <div className="card mb-4">
            <div className="flex-between mb-4">
              <h3 className="section-title">All Blood Groups — Demand Overview</h3>
              <button className="btn btn-primary" onClick={handleBulkPredict} disabled={bulkLoading} id="bulk-predict-btn">
                {bulkLoading ? '⏳ Analyzing...' : '📊 Run Bulk Analysis'}
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Uses current inventory levels from the database + current season ({form.season}) and location ({form.location_type}) settings.
            </p>
          </div>

          {bulkResult && (
            <div className="grid-4">
              {bulkResult.results.map(item => (
                <div key={item.blood_group} className="card" style={{
                  borderColor: `${demandColors[item.prediction] || '#64748b'}40`,
                  background: `${demandColors[item.prediction] || '#64748b'}08`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span className="blood-tag" style={{ fontSize: 12 }}>{item.blood_group}</span>
                    <span className={`badge badge-${item.prediction}`}>{item.prediction}</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{item.current_stock}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>current units</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>Confidence: {item.confidence}%</div>
                </div>
              ))}
            </div>
          )}

          {!bulkResult && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No analysis yet</h3>
              <p>Click "Run Bulk Analysis" to get predictions for all blood groups.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MLPredictorPage;
