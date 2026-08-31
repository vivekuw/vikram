/**
 * Performance Scoring & Star Rating System for Chandrayaan-3 Vikram Simulator
 */

/**
 * Calculates 5-category performance scores, total score, and star rating.
 *
 * @param {Object} telemetry - Final touchdown telemetry object
 * @param {Object} mission - Active mission configuration
 * @param {boolean} isSafeLanding - True if touchdown was evaluated as SAFE
 * @returns {Object} Calculated score breakdown, star count, and analytics
 */
export function calculateMissionScore(telemetry, mission, isSafeLanding = false) {
  if (!telemetry || !mission) {
    return {
      totalScore: 0,
      stars: 0,
      categories: { accuracy: 0, touchdown: 0, fuel: 0, attitude: 0, hazard: 0 },
    };
  }

  const {
    targetDistance = 0,
    verticalVelocity = 0,
    horizontalVelocity = 0,
    fuelPercent = 0,
    tilt = 0,
    terrainSlope = 0,
    isLanded = false,
  } = telemetry;

  const targetRadius = mission.landingZoneRadius || 12;

  // 1. LANDING ACCURACY (20 Points Max)
  // Target distance inside radius yields high points
  let accuracyScore = 0;
  if (targetDistance <= targetRadius) {
    const accuracyRatio = 1 - targetDistance / targetRadius;
    accuracyScore = Math.round(12 + accuracyRatio * 8); // 12 to 20 pts
  } else {
    const penalty = Math.min(10, (targetDistance - targetRadius) * 0.5);
    accuracyScore = Math.max(0, Math.round(10 - penalty));
  }

  // 2. TOUCHDOWN CONTROL (25 Points Max)
  // Vertical velocity <= 4.0 m/s and horizontal <= 3.0 m/s
  let touchdownScore = 0;
  const absVVel = Math.abs(verticalVelocity);
  if (isSafeLanding && absVVel <= 4.0) {
    const vFactor = (4.0 - absVVel) / 4.0; // 0 to 1
    const hFactor = Math.max(0, (3.0 - horizontalVelocity) / 3.0);
    touchdownScore = Math.round(15 + vFactor * 7 + hFactor * 3); // 15 to 25 pts
  } else if (absVVel <= 8.0) {
    touchdownScore = Math.max(0, Math.round(10 - (absVVel - 4.0) * 2));
  }

  // 3. FUEL EFFICIENCY (25 Points Max)
  // Higher remaining fuel percentage = higher score
  let fuelScore = Math.min(25, Math.round((fuelPercent / 100.0) * 25));

  // 4. ATTITUDE CONTROL (15 Points Max)
  // Lower tilt angle = higher score (0° tilt = 15 pts, 10° tilt = 5 pts)
  let attitudeScore = 0;
  if (tilt <= 10) {
    attitudeScore = Math.round(15 - (tilt / 10.0) * 8); // 7 to 15 pts
  } else {
    attitudeScore = Math.max(0, Math.round(5 - (tilt - 10) * 0.5));
  }

  // 5. HAZARD AVOIDANCE (15 Points Max)
  // Low slope and collision clearance
  let hazardScore = 0;
  if (terrainSlope <= 5.0) {
    hazardScore = Math.round(15 - (terrainSlope / 5.0) * 5); // 10 to 15 pts
  } else {
    hazardScore = Math.max(0, Math.round(10 - (terrainSlope - 5.0) * 1.5));
  }

  // Sum total score
  let totalScore = accuracyScore + touchdownScore + fuelScore + attitudeScore + hazardScore;
  totalScore = Math.min(100, Math.max(0, totalScore));

  // STAGE 8H: Star Rating Assignment
  // MANDATORY RULE: Safe landing is required for ANY stars. Crash = 0 stars.
  let stars = 0;
  if (isSafeLanding && isLanded) {
    if (totalScore >= 90) {
      stars = 3;
    } else if (totalScore >= 75) {
      stars = 2;
    } else if (totalScore >= 50) {
      stars = 1;
    } else {
      stars = 1; // Minimum 1 star for safe touchdown
    }
  } else {
    stars = 0; // Crash or failed landing = 0 stars
  }

  return {
    totalScore,
    stars,
    categories: {
      accuracy: accuracyScore,
      touchdown: touchdownScore,
      fuel: fuelScore,
      attitude: attitudeScore,
      hazard: hazardScore,
    },
  };
}

/**
 * Generates an end-of-mission analytics summary report.
 */
export function generateAnalyticsReport(telemetry, scoreResult, mission) {
  if (!telemetry) return null;

  const {
    missionTime = 'T+ 00:00:00',
    elapsedSeconds = 0,
    verticalVelocity = 0,
    horizontalVelocity = 0,
    tilt = 0,
    fuelPercent = 100,
    targetDistance = 0,
    terrainSlope = 0,
    landingStatus = 'TOUCHDOWN',
  } = telemetry;

  const startingFuel = mission?.startingFuelPercent ?? 100;
  const fuelUsed = Math.max(0, startingFuel - fuelPercent);

  return {
    descentDuration: missionTime,
    elapsedSeconds: elapsedSeconds.toFixed(1),
    touchdownVerticalSpeed: `${Math.abs(verticalVelocity).toFixed(1)} m/s`,
    touchdownHorizontalSpeed: `${horizontalVelocity.toFixed(1)} m/s`,
    finalTiltAngle: `${tilt}°`,
    fuelUsedPercent: `${fuelUsed.toFixed(1)}%`,
    fuelRemainingPercent: `${fuelPercent.toFixed(1)}%`,
    landingAccuracyDistance: `${targetDistance} m`,
    terrainSlopeAngle: `${terrainSlope.toFixed(1)}°`,
    landingStatus,
    totalScore: scoreResult?.totalScore ?? 0,
    stars: scoreResult?.stars ?? 0,
  };
}
