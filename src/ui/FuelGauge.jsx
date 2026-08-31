import React from 'react';
import { Fuel, AlertTriangle } from 'lucide-react';

/**
 * Fuel Gauge component (Stage 7F)
 * Upgraded fuel display showing percentage, segmented bar, fuel mass, and warning state badges.
 */
export function FuelGauge({ telemetry }) {
  const {
    fuelPercent = 100,
    fuelMass = 0,
    fuelState = 'NORMAL',
  } = telemetry;

  // Status color map
  const stateColors = {
    NORMAL: '#00e676',
    CAUTION: '#ffd700',
    LOW: '#ff9100',
    CRITICAL: '#ff1744',
    EMPTY: '#d50000',
  };

  const badgeColor = stateColors[fuelState] || '#00e676';

  // Segment blocks generation (10 segments for tactical military look)
  const segments = Array.from({ length: 10 }, (_, i) => {
    const minPercent = i * 10;
    return fuelPercent > minPercent;
  });

  return (
    <div className="hud-panel fuel-panel">
      <div className="hud-panel-header">
        <div className="hud-panel-title">
          <Fuel size={14} color={badgeColor} />
          <span>PROPELLANT FUEL</span>
        </div>
        <span
          className="fuel-status-badge"
          style={{
            color: badgeColor,
            backgroundColor: `${badgeColor}18`,
            borderColor: `${badgeColor}50`,
          }}
        >
          {fuelState}
        </span>
      </div>

      {/* Main Percentage Readout */}
      <div className="fuel-primary-readout">
        <span className="fuel-num" style={{ color: badgeColor }}>
          {fuelPercent.toFixed(1)}
        </span>
        <span className="hud-unit">%</span>
      </div>

      {/* Segmented Fuel Bar */}
      <div className="fuel-segmented-bar">
        {segments.map((active, index) => (
          <div
            key={index}
            className={`fuel-segment ${active ? 'active' : 'inactive'}`}
            style={{
              backgroundColor: active ? badgeColor : 'rgba(255, 255, 255, 0.08)',
              boxShadow: active ? `0 0 6px ${badgeColor}` : 'none',
            }}
          />
        ))}
      </div>

      {/* Fuel Mass Readout */}
      <div className="fuel-mass-row">
        <span className="fuel-mass-label">PROPELLANT MASS:</span>
        <span className="fuel-mass-value">
          {Math.round(fuelMass).toLocaleString()} <span className="hud-unit">kg</span>
        </span>
      </div>

      {/* Low / Empty Warning Banner */}
      {(fuelState === 'CRITICAL' || fuelState === 'EMPTY') && (
        <div className="fuel-warning-box">
          <AlertTriangle size={14} color="#ff1744" />
          <span>{fuelState === 'EMPTY' ? 'PROPELLANT DEPLETED' : 'CRITICAL LOW FUEL'}</span>
        </div>
      )}
    </div>
  );
}
