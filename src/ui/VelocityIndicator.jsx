import React from 'react';
import { ArrowDown, ArrowUp, MoveRight, Activity, AlertTriangle } from 'lucide-react';

/**
 * Velocity Indicator component (Stage 7E)
 * Displays vertical, horizontal, total velocity vectors and directional cues.
 */
export function VelocityIndicator({ telemetry }) {
  const {
    verticalVelocity = 0,
    horizontalVelocity = 0,
    totalVelocity = 0,
    isHighDescentWarning = false,
    isCriticalDescentWarning = false,
  } = telemetry;

  // Warning colors
  let vertColor = 'var(--text-main)';
  if (verticalVelocity < 0) {
    if (isCriticalDescentWarning) vertColor = '#ff1744';
    else if (isHighDescentWarning) vertColor = 'var(--accent-orange)';
    else vertColor = 'var(--accent-emerald)';
  } else if (verticalVelocity > 0) {
    vertColor = 'var(--accent-cyan)';
  }

  const isDescending = verticalVelocity < -0.1;
  const isAscending = verticalVelocity > 0.1;

  return (
    <div className="hud-panel vel-panel">
      <div className="hud-panel-title">VELOCITY VECTORS</div>

      {/* Warning State Banner */}
      {(isHighDescentWarning || isCriticalDescentWarning) && (
        <div
          className={`vel-warning-banner ${isCriticalDescentWarning ? 'critical' : 'warning'}`}
        >
          <AlertTriangle size={14} />
          <span>{isCriticalDescentWarning ? 'EXCESSIVE DESCENT' : 'HIGH DESCENT RATE'}</span>
        </div>
      )}

      <div className="vel-grid">
        {/* VERTICAL VELOCITY */}
        <div className="vel-card">
          <div className="vel-card-label">
            <span className="vel-dir-tag">
              {isDescending && <ArrowDown size={13} color={vertColor} />}
              {isAscending && <ArrowUp size={13} color={vertColor} />}
              VERTICAL
            </span>
            <span className="vel-dir-status" style={{ color: vertColor }}>
              {isDescending ? 'DESCENDING' : isAscending ? 'ASCENDING' : 'STATIONARY'}
            </span>
          </div>
          <div className="vel-card-value" style={{ color: vertColor }}>
            {verticalVelocity > 0 ? `+${verticalVelocity.toFixed(1)}` : verticalVelocity.toFixed(1)}{' '}
            <span className="hud-unit">m/s</span>
          </div>
        </div>

        {/* HORIZONTAL VELOCITY */}
        <div className="vel-card">
          <div className="vel-card-label">
            <span className="vel-dir-tag">
              <MoveRight size={13} color="var(--accent-cyan)" />
              HORIZONTAL
            </span>
          </div>
          <div className="vel-card-value">
            {horizontalVelocity.toFixed(1)} <span className="hud-unit">m/s</span>
          </div>
        </div>

        {/* TOTAL VELOCITY */}
        <div className="vel-card">
          <div className="vel-card-label">
            <span className="vel-dir-tag">
              <Activity size={13} color="var(--accent-gold)" />
              TOTAL SPEED
            </span>
          </div>
          <div className="vel-card-value" style={{ color: 'var(--accent-gold)' }}>
            {totalVelocity.toFixed(1)} <span className="hud-unit">m/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
