import {
  LANDING_ZONE_RADIUS,
  HARD_LANDING_MAX_DIST,
  LANDING_THRESHOLDS,
} from './constants';

/**
 * Evaluates Vikram lander state at touchdown.
 * Determines outcome (SAFE LANDING, HARD LANDING, CRASH), crash reason, and score breakdown.
 *
 * @param {Object} telemetry - Final touchdown telemetry snapshot
 * @returns {Object} Complete landing evaluation result
 */
export function evaluateLanding(telemetry) {
  const {
    targetDistance,
    verticalVelocity,
    horizontalVelocity,
    tilt,
    slope = 0,
    fuelPercentage,
    terrainCollision,
  } = telemetry;

  const absVVel = Math.abs(verticalVelocity);
  const absHVel = Math.abs(horizontalVelocity);

  let outcome = 'SAFE'; // 'SAFE' | 'HARD' | 'CRASH'
  let crashReason = null;

  // 1. EVALUATE CRASH CONDITIONS
  if (terrainCollision) {
    outcome = 'CRASH';
    crashReason = `Terrain Collision (${terrainCollision.hazardName})`;
  } else if (slope > 20.0) {
    outcome = 'CRASH';
    crashReason = `Unstable touchdown on steep terrain incline (${slope.toFixed(1)}°)`;
  } else if (absVVel > Math.abs(LANDING_THRESHOLDS.HARD_V_VEL)) {
    outcome = 'CRASH';
    crashReason = `Excessive touchdown vertical velocity (${absVVel.toFixed(1)} m/s)`;
  } else if (absHVel > LANDING_THRESHOLDS.HARD_H_VEL) {
    outcome = 'CRASH';
    crashReason = `Excessive horizontal drift velocity (${absHVel.toFixed(1)} m/s)`;
  } else if (tilt > LANDING_THRESHOLDS.WARNING_TILT) {
    outcome = 'CRASH';
    crashReason = `Excessive lander tilt angle (${tilt}°)`;
  } else if (targetDistance > HARD_LANDING_MAX_DIST) {
    outcome = 'CRASH';
    crashReason = `Landed too far outside designated landing zone (${targetDistance.toFixed(1)} m)`;
  }
  // 2. EVALUATE HARD LANDING CONDITIONS
  else if (
    absVVel > Math.abs(LANDING_THRESHOLDS.SAFE_V_VEL) ||
    absHVel > LANDING_THRESHOLDS.SAFE_H_VEL ||
    tilt > LANDING_THRESHOLDS.SAFE_TILT ||
    slope > 5.0 ||
    targetDistance > LANDING_ZONE_RADIUS
  ) {
    outcome = 'HARD';
  }

  // 3. CALCULATE DETAILED LANDING SCORES (0 - 100)
  if (outcome === 'CRASH') {
    return {
      outcome: 'CRASH',
      title: '🔴 MISSION FAILED',
      subtitle: 'VIKRAM CRASHED',
      crashReason,
      quality: 'CRASHED',
      scores: {
        accuracy: 0,
        touchdown: 0,
        attitude: 0,
        fuelBonus: 0,
        total: 0,
      },
    };
  }

  // Distance Accuracy Score (100 inside 0m, 0 at 25m)
  const accuracyScore = Math.max(0, Math.round(100 - targetDistance * 3.8));

  // Touchdown Control Score (100 at 0 m/s, 0 at 8 m/s)
  const touchdownScore = Math.max(0, Math.round(100 - absVVel * 12.0));

  // Attitude Control Score (100 at 0 deg, 0 at 20 deg)
  const attitudeScore = Math.max(0, Math.round(100 - tilt * 4.5));

  // Fuel Efficiency Bonus (0 to 20 pts)
  const fuelBonus = Math.round(fuelPercentage * 0.15);

  // Total Weighted Score (40% Accuracy, 35% Touchdown, 25% Attitude + Fuel Bonus)
  const weightedTotal = Math.min(
    100,
    Math.round(
      accuracyScore * 0.40 +
      touchdownScore * 0.35 +
      attitudeScore * 0.25 +
      fuelBonus
    )
  );

  let quality = 'ACCEPTABLE';
  if (outcome === 'SAFE') {
    if (weightedTotal >= 90) quality = 'EXCELLENT';
    else if (weightedTotal >= 75) quality = 'GOOD';
    else quality = 'ACCEPTABLE';
  } else {
    quality = 'ROUGH';
  }

  const isSafe = outcome === 'SAFE';

  return {
    outcome,
    title: isSafe ? '🟢 SAFE LANDING' : '🟡 HARD LANDING',
    subtitle: isSafe
      ? 'VIKRAM HAS LANDED SAFELY ON THE MOON!'
      : 'VIKRAM SURVIVED A ROUGH TOUCHDOWN',
    crashReason: null,
    quality,
    scores: {
      accuracy: accuracyScore,
      touchdown: touchdownScore,
      attitude: attitudeScore,
      fuelBonus,
      total: weightedTotal,
    },
  };
}
