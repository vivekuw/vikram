import React from 'react';

/**
 * Center Targeting Reticle component (Stage 7L)
 * Subtle targeting crosshair in the center of the viewport.
 */
export function CenterReticle({ telemetry }) {
  const { tilt = 0, isLanded = false } = telemetry;
  const isTilted = tilt > 10;

  if (isLanded) return null;

  return (
    <div className="center-reticle-overlay">
      <div className={`reticle-ring ${isTilted ? 'tilted' : ''}`}>
        <div className="reticle-dot" />
        <div className="reticle-line top" />
        <div className="reticle-line bottom" />
        <div className="reticle-line left" />
        <div className="reticle-line right" />
      </div>
    </div>
  );
}
