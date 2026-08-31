import React from 'react';
import { Gauge, Navigation, Compass, Flame, ShieldAlert, Target, Weight, AlertTriangle, Mountain } from 'lucide-react';
import { FuelWarning } from './FuelWarning';

export function Telemetry({ telemetry, landingEvaluation }) {
  const {
    altitude,
    verticalVelocity,
    horizontalVelocity,
    requestedThrottle,
    actualThrust,
    fuelPercentage,
    fuelMass,
    totalMass,
    fuelState,
    tilt,
    targetDistance,
    isHighDescentWarning,
    isCriticalDescentWarning,
    isLanded,
  } = telemetry;

  // Color logic for descent velocity status
  let vVelColor = 'var(--accent-emerald)';
  if (verticalVelocity < 0) {
    vVelColor = isHighDescentWarning ? 'var(--accent-orange)' : '#ffffff';
  }
  if (isCriticalDescentWarning) {
    vVelColor = '#ff3d00';
  }

  // Color logic for Fuel status badge
  let fuelBadgeColor = 'var(--accent-emerald)';
  if (fuelState === 'CAUTION') fuelBadgeColor = 'var(--accent-gold)';
  if (fuelState === 'LOW') fuelBadgeColor = 'var(--accent-orange)';
  if (fuelState === 'CRITICAL' || fuelState === 'EMPTY') fuelBadgeColor = '#ff1744';

  const actualThrustkN = (actualThrust / 1000).toFixed(2);

  // Dynamic Mission Status Text
  let statusBadge = {
    text: '⚠ DESCENT',
    color: 'var(--accent-gold)',
  };

  if (isLanded && landingEvaluation) {
    if (landingEvaluation.outcome === 'SAFE') {
      statusBadge = { text: '🟢 SAFE LANDING', color: 'var(--accent-emerald)' };
    } else if (landingEvaluation.outcome === 'HARD') {
      statusBadge = { text: '🟡 HARD LANDING', color: 'var(--accent-gold)' };
    } else {
      statusBadge = { text: '🔴 CRASHED', color: '#ff1744' };
    }
  } else if (tilt > 10) {
    statusBadge = { text: '⚠ ATTITUDE WARNING', color: 'var(--accent-orange)' };
  } else if (targetDistance <= 20) {
    statusBadge = { text: '🟢 LANDING APPROACH', color: 'var(--accent-emerald)' };
  }

  return (
    <div className="telemetry-panel interactive">
      <div className="telemetry-header">
        <span>MISSION TELEMETRY</span>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: statusBadge.color,
            background: `${statusBadge.color}15`,
            border: `1px solid ${statusBadge.color}40`,
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          {statusBadge.text}
        </span>
      </div>

      {/* FUEL WARNING BANNERS */}
      <FuelWarning fuelState={fuelState} />

      {/* HIGH DESCENT RATE WARNING BANNER */}
      {isHighDescentWarning && !isLanded && (
        <div
          style={{
            background: isCriticalDescentWarning ? 'rgba(255, 61, 0, 0.25)' : 'rgba(255, 145, 0, 0.2)',
            border: `1px solid ${isCriticalDescentWarning ? '#ff3d00' : 'var(--accent-orange)'}`,
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: isCriticalDescentWarning ? '#ff5252' : 'var(--accent-orange)',
            fontSize: '11px',
            fontWeight: 700,
            animation: 'pulse 1s infinite',
          }}
        >
          <AlertTriangle size={16} />
          <span>{isCriticalDescentWarning ? 'CRITICAL DESCENT RATE' : 'HIGH DESCENT SPEED'}</span>
        </div>
      )}

      {/* ALTITUDE */}
      <div className="telemetry-row">
        <div className="telemetry-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Gauge size={14} color="var(--accent-cyan)" />
          <span>Altitude</span>
        </div>
        <div className="telemetry-value">
          {altitude.toFixed(1)} <span className="unit">m</span>
        </div>
      </div>

      {/* VERTICAL VELOCITY */}
      <div className="telemetry-row">
        <div className="telemetry-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Navigation
            size={14}
            color={vVelColor}
            style={{ transform: verticalVelocity < 0 ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
          <span>Vert Velocity</span>
        </div>
        <div className="telemetry-value" style={{ color: vVelColor }}>
          {verticalVelocity > 0 ? `+${verticalVelocity.toFixed(1)}` : verticalVelocity.toFixed(1)} <span className="unit">m/s</span>
        </div>
      </div>

      {/* HORIZONTAL VELOCITY */}
      <div className="telemetry-row">
        <div className="telemetry-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Compass size={14} color="var(--accent-cyan)" />
          <span>Horiz Velocity</span>
        </div>
        <div className="telemetry-value">
          {horizontalVelocity.toFixed(1)} <span className="unit">m/s</span>
        </div>
      </div>

      {/* TARGET DISTANCE */}
      <div className="telemetry-row">
        <div className="telemetry-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Target size={14} color="var(--accent-emerald)" />
          <span>Target Dist</span>
        </div>
        <div className="telemetry-value" style={{ color: targetDistance < 20 ? 'var(--accent-emerald)' : '#ffffff' }}>
          {targetDistance} <span className="unit">m</span>
        </div>
      </div>

      {/* SPACECRAFT MASS */}
      <div className="telemetry-row">
        <div className="telemetry-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Weight size={14} color="var(--accent-cyan)" />
          <span>Total Mass</span>
        </div>
        <div className="telemetry-value">
          {Math.round(totalMass)} <span className="unit">kg</span>
        </div>
      </div>

      {/* TILT ANGLE */}
      <div className="telemetry-row">
        <div className="telemetry-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={14} color={tilt > 10 ? 'var(--accent-orange)' : 'var(--text-muted)'} />
          <span>Tilt Angle</span>
        </div>
        <div className="telemetry-value" style={{ color: tilt > 10 ? 'var(--accent-orange)' : '#ffffff' }}>
          {tilt}°
        </div>
      </div>

      {/* TERRAIN SLOPE */}
      <div className="telemetry-row">
        <div className="telemetry-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mountain size={14} color={(telemetry.slope || 0) > 12 ? '#ff1744' : (telemetry.slope || 0) > 5 ? 'var(--accent-orange)' : 'var(--accent-emerald)'} />
          <span>Terrain Slope</span>
        </div>
        <div
          className="telemetry-value"
          style={{
            color: (telemetry.slope || 0) > 12 ? '#ff1744' : (telemetry.slope || 0) > 5 ? 'var(--accent-orange)' : 'var(--accent-emerald)',
          }}
        >
          {(telemetry.slope || 0).toFixed(1)}°
        </div>
      </div>

      {/* THROTTLE METER (REQUESTED VS ACTUAL THRUST) */}
      <div className="meter-container">
        <div className="telemetry-row">
          <div className="telemetry-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={14} color="var(--accent-gold)" />
            <span>Requested Throttle</span>
          </div>
          <div className="telemetry-value" style={{ fontSize: '14px', color: 'var(--accent-gold)' }}>
            {requestedThrottle}%
          </div>
        </div>
        <div className="telemetry-row" style={{ fontSize: '11px', marginTop: '-2px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Actual Thrust:</span>
          <span style={{ color: actualThrust > 0 ? 'var(--accent-gold)' : '#ff1744', fontWeight: 600 }}>
            {actualThrustkN} kN
          </span>
        </div>
        <div className="meter-track">
          <div
            className="meter-fill fill-gold"
            style={{ width: `${actualThrust > 0 ? requestedThrottle : 0}%` }}
          />
        </div>
      </div>

      {/* FUEL METER & STATUS */}
      <div className="meter-container">
        <div className="telemetry-row">
          <div className="telemetry-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Fuel Level</span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: '3px',
                background: `${fuelBadgeColor}22`,
                border: `1px solid ${fuelBadgeColor}`,
                color: fuelBadgeColor,
              }}
            >
              {fuelState}
            </span>
          </div>
          <div className="telemetry-value" style={{ fontSize: '14px', color: fuelBadgeColor }}>
            {fuelPercentage.toFixed(1)}%
          </div>
        </div>
        <div className="telemetry-row" style={{ fontSize: '11px', marginTop: '-2px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Fuel Mass:</span>
          <span style={{ color: '#ffffff' }}>{Math.round(fuelMass)} kg</span>
        </div>
        <div className="meter-track">
          <div
            className="meter-fill fill-cyan"
            style={{
              width: `${fuelPercentage}%`,
              background: fuelPercentage < 20 ? 'linear-gradient(90deg, #ff1744, var(--accent-orange))' : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
