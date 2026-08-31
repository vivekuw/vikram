import React from 'react';
import { Target, Mountain, Navigation, AlertOctagon, CheckCircle2 } from 'lucide-react';

/**
 * Landing Target Indicator & Guidance component (Stage 7I & Stage 7M)
 * Displays spatial targeting, terrain slope, direction angle pointer, and landing feasibility assessment.
 */
export function LandingGuidance({ telemetry }) {
  const {
    targetDistance = 0,
    targetDirectionAngle = 0,
    terrainSlope = 0,
    altitude = 0,
    verticalVelocity = 0,
    tilt = 0,
    fuelState = 'NORMAL',
    isLanded = false,
  } = telemetry;

  // Calculate target direction formatting (e.g., ← 12° LEFT or → 15° RIGHT)
  let dirText = 'CENTERED';
  let arrowSymbol = '↑';
  if (targetDirectionAngle < -3) {
    dirText = `${Math.abs(targetDirectionAngle)}° LEFT`;
    arrowSymbol = '←';
  } else if (targetDirectionAngle > 3) {
    dirText = `${targetDirectionAngle}° RIGHT`;
    arrowSymbol = '→';
  }

  // Assess Landing Safety Feasibility
  let isLandingPossible = true;
  let unsafeReason = '';

  if (verticalVelocity < -2.5) {
    isLandingPossible = false;
    unsafeReason = 'High vertical descent speed';
  } else if (tilt > 10) {
    isLandingPossible = false;
    unsafeReason = 'Excessive attitude tilt';
  } else if (terrainSlope > 10) {
    isLandingPossible = false;
    unsafeReason = 'High terrain slope';
  } else if (fuelState === 'EMPTY' && altitude > 10) {
    isLandingPossible = false;
    unsafeReason = 'Propellant empty';
  }

  const slopeColor = terrainSlope > 10 ? '#ff1744' : terrainSlope > 5 ? 'var(--accent-gold)' : '#00e676';
  const showApproachCard = altitude <= 150 && !isLanded;

  return (
    <div className="hud-panel guidance-panel">
      <div className="hud-panel-header">
        <div className="hud-panel-title">
          <Target size={14} color="var(--accent-emerald)" />
          <span>LANDING TARGET GUIDANCE</span>
        </div>
        <span className="guidance-target-id">TARGET ZONE ALPHA</span>
      </div>

      <div className="guidance-grid">
        {/* TARGET DISTANCE */}
        <div className="guidance-card">
          <div className="guidance-card-label">TARGET DISTANCE</div>
          <div className="guidance-card-value" style={{ color: targetDistance < 30 ? '#00e676' : 'var(--accent-cyan)' }}>
            {targetDistance} <span className="hud-unit">m</span>
          </div>
        </div>

        {/* TARGET DIRECTION */}
        <div className="guidance-card">
          <div className="guidance-card-label">TARGET DIRECTION</div>
          <div className="guidance-card-value" style={{ color: 'var(--accent-gold)' }}>
            <span className="direction-arrow">{arrowSymbol}</span> {dirText}
          </div>
        </div>

        {/* TARGET SLOPE */}
        <div className="guidance-card">
          <div className="guidance-card-label">TERRAIN SLOPE</div>
          <div className="guidance-card-value" style={{ color: slopeColor }}>
            {terrainSlope.toFixed(1)}°
          </div>
        </div>
      </div>

      {/* STAGE 7M: LANDING APPROACH CARD */}
      {showApproachCard && (
        <div className={`approach-card ${isLandingPossible ? 'possible' : 'unsafe'}`}>
          <div className="approach-card-header">
            {isLandingPossible ? (
              <>
                <CheckCircle2 size={15} color="#00e676" />
                <span className="possible-text">🟢 LANDING POSSIBLE</span>
              </>
            ) : (
              <>
                <AlertOctagon size={15} color="#ff1744" />
                <span className="unsafe-text">🔴 LANDING UNSAFE</span>
              </>
            )}
          </div>
          {!isLandingPossible && (
            <div className="approach-unsafe-reason">
              Reason: <strong>{unsafeReason}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
