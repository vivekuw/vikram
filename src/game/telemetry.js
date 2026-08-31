import {
  HIGH_DESCENT_WARNING_THRESHOLD,
  CRITICAL_DESCENT_WARNING_THRESHOLD,
  TARGET_LANDING_ZONE,
} from './constants';

/**
 * Centralized telemetry data layer for Chandrayaan-3 Vikram Lander Simulator.
 * Computes read-only formatted telemetry data for UI consumption directly from physics state.
 *
 * @param {Object} physicsState - Current state of the lander from landerRef
 * @param {number} elapsedSeconds - Total mission elapsed time in seconds
 * @returns {Object} Read-only telemetry object for UI/HUD components
 */
export function calculateTelemetry(physicsState, elapsedSeconds = 0) {
  if (!physicsState) return {};

  const {
    position = [0, 0, 0],
    velocity = [0, 0, 0],
    rotation = [0, 0, 0],
    requestedThrottle = 0,
    actualThrust = 0,
    fuelMass = 0,
    totalMass = 0,
    fuelPercentage = 100,
    fuelState = 'NORMAL',
    groundY = 0,
    slope = 0,
    isLanded = false,
    landingEvaluation = null,
  } = physicsState;

  // 1. Altitude above terrain immediately below Vikram
  const altitude = Math.max(0, position[1] - groundY - 3.5);

  // 2. Velocity components
  const verticalVelocity = velocity[1];
  const horizontalVelocity = Math.sqrt(velocity[0] ** 2 + velocity[2] ** 2);
  const totalVelocity = Math.sqrt(velocity[0] ** 2 + velocity[1] ** 2 + velocity[2] ** 2);

  // 3. Throttle & Thrust
  const throttle = Math.round(requestedThrottle * 100);
  const actualThrustkN = actualThrust / 1000.0;

  // 4. Attitude / Tilt Angle in degrees relative to vertical
  const tilt = Math.round(
    Math.sqrt(rotation[0] ** 2 + rotation[2] ** 2) * (180 / Math.PI)
  );

  // 5. Target relative spatial metrics
  const dx = position[0] - TARGET_LANDING_ZONE.x;
  const dz = position[2] - TARGET_LANDING_ZONE.z;
  const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
  const targetDistance = Math.sqrt(dx * dx + (position[1] - groundY) ** 2 + dz * dz);

  // Target direction angle relative to lander heading (-180° to 180°)
  // Vector pointing towards target from lander position
  const angleToTargetRad = Math.atan2(-dx, -dz);
  const targetDirectionAngle = Math.round(angleToTargetRad * (180 / Math.PI));

  // 6. Mission Timer formatting (T+ HH:MM:SS)
  const totalSecs = Math.floor(elapsedSeconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  const formattedHrs = String(hrs).padStart(2, '0');
  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');
  const missionTime = `T+ ${formattedHrs}:${formattedMins}:${formattedSecs}`;

  // 7. Mission Phase & Landing Status
  let landingStatus = 'DESCENT';
  if (isLanded) {
    if (landingEvaluation?.outcome === 'SAFE') {
      landingStatus = 'SAFE LANDING';
    } else if (landingEvaluation?.outcome === 'HARD') {
      landingStatus = 'TOUCHDOWN (HARD)';
    } else if (landingEvaluation?.outcome === 'CRASH') {
      landingStatus = 'CRASHED';
    } else {
      landingStatus = 'TOUCHDOWN';
    }
  } else if (altitude > 500) {
    landingStatus = 'PREPARING';
  } else if (altitude > 150) {
    landingStatus = 'DESCENT';
  } else if (altitude > 40) {
    landingStatus = 'APPROACH';
  } else {
    landingStatus = 'FINAL DESCENT';
  }

  // 8. Warning Priority System
  // Categories: 1. CRITICAL, 2. DANGER, 3. WARNING, 4. CAUTION, 5. INFORMATION
  const warnings = [];

  if (isLanded && landingEvaluation?.outcome === 'CRASH') {
    warnings.push({ id: 'CRASH', level: 'CRITICAL', priority: 1, message: 'CRASH LANDING DETECTED' });
  }
  if (!isLanded && fuelState === 'EMPTY') {
    warnings.push({ id: 'NO_FUEL', level: 'CRITICAL', priority: 1, message: 'ENGINE FAILURE - NO FUEL' });
  }
  if (!isLanded && altitude < 40 && (slope > 12 || physicsState.terrainCollision)) {
    warnings.push({ id: 'TERRAIN_HAZARD', level: 'CRITICAL', priority: 1, message: 'TERRAIN COLLISION HAZARD' });
  }
  if (!isLanded && verticalVelocity <= CRITICAL_DESCENT_WARNING_THRESHOLD) {
    warnings.push({ id: 'EXTREME_DESCENT', level: 'DANGER', priority: 2, message: 'EXTREME DESCENT RATE' });
  }
  if (!isLanded && tilt > 15) {
    warnings.push({ id: 'EXCESSIVE_TILT', level: 'DANGER', priority: 2, message: 'EXCESSIVE ATTITUDE TILT' });
  }
  if (!isLanded && verticalVelocity <= HIGH_DESCENT_WARNING_THRESHOLD && verticalVelocity > CRITICAL_DESCENT_WARNING_THRESHOLD) {
    warnings.push({ id: 'HIGH_DESCENT', level: 'WARNING', priority: 3, message: 'HIGH DESCENT SPEED' });
  }
  if (!isLanded && (fuelState === 'CRITICAL' || fuelState === 'LOW')) {
    warnings.push({ id: 'LOW_FUEL', level: 'WARNING', priority: 3, message: 'LOW PROPELLANT LEVEL' });
  }
  if (!isLanded && slope > 5) {
    warnings.push({ id: 'HIGH_SLOPE', level: 'WARNING', priority: 3, message: `SLOPED TERRAIN (${slope.toFixed(1)}°)` });
  }
  if (!isLanded && fuelState === 'CAUTION') {
    warnings.push({ id: 'FUEL_CAUTION', level: 'CAUTION', priority: 4, message: 'FUEL RESERVES CAUTION' });
  }
  if (!isLanded && targetDistance <= 60) {
    warnings.push({ id: 'APPROACH_ZONE', level: 'INFORMATION', priority: 5, message: 'LANDING ZONE APPROACH' });
  }

  // Sort warnings by priority ascending (1 highest)
  warnings.sort((a, b) => a.priority - b.priority);

  const highestPriorityWarning = warnings.length > 0 ? warnings[0] : null;
  const warningStatus = highestPriorityWarning ? highestPriorityWarning.level : 'NOMINAL';

  return {
    altitude: parseFloat(altitude.toFixed(1)),
    verticalVelocity: parseFloat(verticalVelocity.toFixed(1)),
    horizontalVelocity: parseFloat(horizontalVelocity.toFixed(1)),
    totalVelocity: parseFloat(totalVelocity.toFixed(1)),
    throttle,
    actualThrust: parseFloat(actualThrustkN.toFixed(2)),
    fuelPercent: parseFloat(fuelPercentage.toFixed(1)),
    fuelMass: parseFloat(fuelMass.toFixed(1)),
    totalMass: parseFloat(totalMass.toFixed(1)),
    fuelState,
    tilt,
    terrainSlope: parseFloat(slope.toFixed(1)),
    targetDistance: Math.round(targetDistance),
    horizontalDistance: Math.round(horizontalDistance),
    targetDirectionAngle,
    missionTime,
    elapsedSeconds: parseFloat(elapsedSeconds.toFixed(1)),
    landingStatus,
    warningStatus,
    warnings,
    highestPriorityWarning,
    isHighDescentWarning: verticalVelocity <= HIGH_DESCENT_WARNING_THRESHOLD,
    isCriticalDescentWarning: verticalVelocity <= CRITICAL_DESCENT_WARNING_THRESHOLD,
    isLanded,
  };
}
