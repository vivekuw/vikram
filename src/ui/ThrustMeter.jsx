import React from 'react';
import { Flame, Power } from 'lucide-react';

/**
 * Thrust Meter component (Stage 7G)
 * Distinguishes requested throttle vs actual engine thrust output.
 * Accurately displays ENGINE: OFF when propellant fuel is empty.
 */
export function ThrustMeter({ telemetry }) {
  const {
    throttle = 0,
    actualThrust = 0,
    fuelState = 'NORMAL',
  } = telemetry;

  const isEngineOff = fuelState === 'EMPTY' || actualThrust <= 0;
  const maxThrustkN = 3.2; // Maximum engine thrust 3.2 kN (3200 N)
  const actualThrustPercent = Math.min(100, Math.max(0, (actualThrust / maxThrustkN) * 100));

  return (
    <div className="hud-panel thrust-panel">
      <div className="hud-panel-header">
        <div className="hud-panel-title">
          <Flame size={14} color={isEngineOff ? '#ff1744' : 'var(--accent-gold)'} />
          <span>THRUST & THROTTLE</span>
        </div>
        <span
          className={`engine-status-tag ${isEngineOff ? 'off' : 'on'}`}
        >
          <Power size={11} />
          {isEngineOff ? 'ENGINE: OFF' : 'ENGINE: ACTIVE'}
        </span>
      </div>

      <div className="thrust-readouts-grid">
        {/* REQUESTED THROTTLE */}
        <div className="thrust-readout-card">
          <div className="thrust-card-label">REQUESTED THROTTLE</div>
          <div className="thrust-card-value" style={{ color: 'var(--accent-gold)' }}>
            {throttle}<span className="hud-unit">%</span>
          </div>
        </div>

        {/* ACTUAL THRUST OUTPUT */}
        <div className="thrust-readout-card">
          <div className="thrust-card-label">ACTUAL THRUST</div>
          <div className="thrust-card-value" style={{ color: isEngineOff ? '#ff1744' : 'var(--accent-emerald)' }}>
            {isEngineOff ? '0.00' : actualThrust.toFixed(2)}{' '}
            <span className="hud-unit">kN</span>
          </div>
        </div>
      </div>

      {/* Visual Throttle vs Actual Thrust Comparative Gauge */}
      <div className="thrust-bar-container">
        <div className="thrust-bar-row">
          <span className="bar-label">THROTTLE (REQ):</span>
          <div className="bar-track">
            <div className="bar-fill requested" style={{ width: `${throttle}%` }} />
          </div>
          <span className="bar-val">{throttle}%</span>
        </div>

        <div className="thrust-bar-row">
          <span className="bar-label">THRUST (ACTUAL):</span>
          <div className="bar-track">
            <div
              className={`bar-fill actual ${isEngineOff ? 'depleted' : ''}`}
              style={{ width: `${isEngineOff ? 0 : actualThrustPercent}%` }}
            />
          </div>
          <span className="bar-val">{isEngineOff ? 0 : Math.round(actualThrustPercent)}%</span>
        </div>
      </div>
    </div>
  );
}
