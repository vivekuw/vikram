import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

/**
 * Vertical Altitude Indicator component (Stage 7D)
 * Displays current altitude, vertical speed, scale bands, and lander marker position.
 */
export function AltitudeIndicator({ telemetry }) {
  const {
    altitude = 0,
    verticalVelocity = 0,
    isHighDescentWarning = false,
    isCriticalDescentWarning = false,
  } = telemetry;

  // Altitude bands for ladder visualization
  const bands = [1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 0];

  // Map altitude (0 - 1000m) to percentage marker offset from bottom (0% to 100%)
  const maxScaleAlt = 1000;
  const markerPercent = Math.min(100, Math.max(0, (altitude / maxScaleAlt) * 100));

  // Velocity badge color logic
  let vVelColor = '#00e676'; // Emerald nominal
  if (verticalVelocity < 0) {
    vVelColor = isCriticalDescentWarning
      ? '#ff1744'
      : isHighDescentWarning
      ? '#ff9100'
      : '#ffffff';
  } else if (verticalVelocity > 0) {
    vVelColor = '#00e5ff';
  }

  return (
    <div className="hud-panel alt-panel">
      <div className="hud-panel-title">ALTITUDE</div>

      <div className="alt-primary-readout">
        <span className="alt-num">{altitude.toFixed(1)}</span>
        <span className="hud-unit">m</span>
      </div>

      {/* Vertical Altitude Band Scale Graphic */}
      <div className="alt-scale-container">
        <div className="alt-scale-track">
          {bands.map((band) => (
            <div key={band} className="alt-scale-mark">
              <span className="alt-mark-label">{band}</span>
              <span className="alt-mark-tick">┤</span>
            </div>
          ))}

          {/* Dynamic Vikram Position Pointer */}
          <div
            className="alt-vikram-pointer"
            style={{ bottom: `${markerPercent}%` }}
          >
            <span className="pointer-arrow">←</span>
            <span className="pointer-tag">VIKRAM</span>
          </div>
        </div>
      </div>

      {/* Vertical Velocity Sub-Readout */}
      <div className="alt-vvel-box" style={{ borderColor: `${vVelColor}50` }}>
        <div className="vvel-label">
          {verticalVelocity < 0 ? (
            <ArrowDown size={14} color={vVelColor} />
          ) : verticalVelocity > 0 ? (
            <ArrowUp size={14} color={vVelColor} />
          ) : null}
          <span>VERT VELOCITY</span>
        </div>
        <div className="vvel-value" style={{ color: vVelColor }}>
          {verticalVelocity > 0 ? `+${verticalVelocity.toFixed(1)}` : verticalVelocity.toFixed(1)}{' '}
          <span className="hud-unit">m/s</span>
        </div>
      </div>
    </div>
  );
}
