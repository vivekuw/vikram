import React from 'react';
import { Compass, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * Spacecraft Attitude Indicator component (Stage 7H)
 * Displays tilt angle relative to lunar surface with a visual attitude horizon graphic.
 */
export function AttitudeIndicator({ telemetry }) {
  const { tilt = 0 } = telemetry;

  // Determine state based on existing configuration thresholds:
  // SAFE: < 5 deg, WARNING: 5 - 15 deg, CRITICAL: > 15 deg
  let status = 'SAFE';
  let statusColor = '#00e676';
  if (tilt >= 15) {
    status = 'CRITICAL';
    statusColor = '#ff1744';
  } else if (tilt >= 5) {
    status = 'WARNING';
    statusColor = '#ff9100';
  }

  // Calculate horizon line tilt angle for CSS transform
  const rotationAngle = Math.min(45, Math.max(-45, tilt));

  return (
    <div className="hud-panel attitude-panel">
      <div className="attitude-body">
        {/* Visual Spacecraft Attitude Horizon Graphic */}
        <div className="attitude-graphic-container">
          <div className="horizon-ring">
            {/* Pitch ladder line */}
            <div
              className="horizon-line"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                borderColor: statusColor,
              }}
            />
            {/* Center Vikram Lander silhouette symbol */}
            <div className="lander-symbol">🛸</div>
          </div>
          <div className="graphic-side-labels">
            <span>LEFT</span>
            <span>RIGHT</span>
          </div>
        </div>

        {/* Numerical Tilt Readout */}
        <div className="attitude-readout">
          <div className="tilt-degree-num" style={{ color: statusColor }}>
            {tilt.toFixed(1)}°
          </div>
          <div className="tilt-sublabel">TILT ANGLE</div>
        </div>
      </div>
    </div>
  );
}
