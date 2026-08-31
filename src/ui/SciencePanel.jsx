import React, { useState } from 'react';
import { Zap, Activity, CheckCircle2, X } from 'lucide-react';

export function SciencePanel({ activeResult, onRunInstrument, onClose }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSelect = (type) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      onRunInstrument(type);
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="pause-overlay-banner interactive">
      <div className="pause-modal-card" style={{ maxWidth: '500px', width: '90vw', border: '2px solid var(--accent-cyan)' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 800 }}>
            <Zap size={16} /> SCIENCE PAYLOAD OPERATION
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {!activeResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', marginTop: '10px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Pragyan is positioned at Lunar Regolith Sample Site B. Select an onboard scientific instrument:
            </p>

            {isAnalyzing ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)' }}>
                <Activity size={24} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ marginTop: '8px', fontSize: '12px' }}>FIRING LASER / SCANNING SAMPLE...</div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="resume-action-btn"
                  style={{ flex: 1, background: 'linear-gradient(135deg, #00e5ff 0%, #00b0ff 100%)' }}
                  onClick={() => handleSelect('LIBS')}
                >
                  <Zap size={14} /> LIBS (LASER SPECTRO)
                </button>
                <button
                  className="resume-action-btn"
                  style={{ flex: 1, background: 'linear-gradient(135deg, #ffd700 0%, #ff9100 100%)' }}
                  onClick={() => handleSelect('APXS')}
                >
                  <Activity size={14} /> APXS (X-RAY SPECTRO)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', textAlign: 'left', marginTop: '10px' }}>
            <div style={{ color: '#00e676', fontWeight: 800, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={15} /> {activeResult.instrument} — COMPLETE
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Technique: {activeResult.technique}
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.2)' }}>
              <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '6px' }}>
                SIMULATED ELEMENTAL ANALYSIS:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                {(activeResult.simulatedElements || activeResult.simulatedComposition || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#ccc' }}>{item.element || item.oxide}:</span>
                    <span style={{ color: '#00e5ff', fontWeight: 700 }}>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(255,215,0,0.1)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,215,0,0.2)' }}>
              {activeResult.disclaimer}
            </div>

            <button className="resume-action-btn" onClick={onClose} style={{ marginTop: '6px' }}>
              CONTINUE EXPLORATION
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
