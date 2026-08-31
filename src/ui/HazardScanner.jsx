import React, { useMemo } from 'react';
import { Radar, AlertTriangle, ShieldCheck, ShieldAlert, Crosshair, X } from 'lucide-react';
import { getHazardScanData } from '../game/terrain/terrainGenerator';

export function HazardScanner({ telemetry, isScannerActive, toggleScannerMode }) {
  if (!isScannerActive) return null;

  const [px, , pz] = telemetry.position || [0, 250, 0];

  const scanData = useMemo(() => {
    return getHazardScanData(px, pz, 40.0);
  }, [px, pz]);

  const { rocksInScan, cratersInScan, slope, safety, targetDist } = scanData;

  let landingBadge = { text: '🟢 POSSIBLE', color: 'var(--accent-emerald)' };
  if (safety === 'RISKY') {
    landingBadge = { text: '🟡 RISKY', color: 'var(--accent-gold)' };
  } else if (safety === 'HAZARD') {
    landingBadge = { text: '🔴 HAZARD', color: '#ff1744' };
  }

  let slopeBadgeColor = 'var(--accent-emerald)';
  if (slope > 12.0) slopeBadgeColor = '#ff1744';
  else if (slope > 5.0) slopeBadgeColor = 'var(--accent-gold)';

  return (
    <div className="hazard-scanner-hud interactive">
      <div className="scanner-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Radar size={16} color="var(--accent-cyan)" className="radar-spin" />
          <span>HAZARD SCANNER</span>
        </div>
        <button className="close-btn" onClick={toggleScannerMode} title="Close Scanner (H)">
          <X size={14} />
        </button>
      </div>

      <div className="scanner-divider" />

      <div className="scanner-grid">
        <div className="scanner-row">
          <span className="scanner-label">LARGE ROCKS:</span>
          <span className="scanner-value" style={{ color: rocksInScan > 0 ? 'var(--accent-orange)' : '#ffffff' }}>
            {rocksInScan}
          </span>
        </div>

        <div className="scanner-row">
          <span className="scanner-label">CRATERS:</span>
          <span className="scanner-value">{cratersInScan}</span>
        </div>

        <div className="scanner-row">
          <span className="scanner-label">SLOPE:</span>
          <span className="scanner-value" style={{ color: slopeBadgeColor }}>
            {slope}°
          </span>
        </div>

        <div className="scanner-row">
          <span className="scanner-label">TARGET DIST:</span>
          <span className="scanner-value">{targetDist} m</span>
        </div>

        <div className="scanner-row" style={{ marginTop: '4px' }}>
          <span className="scanner-label">LANDING:</span>
          <span
            className="scanner-badge"
            style={{
              color: landingBadge.color,
              background: `${landingBadge.color}15`,
              borderColor: `${landingBadge.color}40`,
            }}
          >
            {landingBadge.text}
          </span>
        </div>
      </div>
    </div>
  );
}
