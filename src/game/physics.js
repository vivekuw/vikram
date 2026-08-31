import {
  G_MOON,
  DRY_MASS,
  MIN_THROTTLE,
  MAX_THROTTLE,
  THROTTLE_CHANGE_RATE,
  MAX_TILT_ANGLE,
  ROTATION_SPEED,
  ROTATION_DAMPING,
  LATERAL_THRUST_ACCEL,
  LANDER_GROUND_CLEARANCE,
} from './constants';
import { calculateFuelStep } from './fuel';
import { checkTerrainCollision } from './collision';
import { getTerrainHeight, getTerrainSlope } from './terrain/terrainGenerator';

/**
 * Pure, frame-rate independent physics step function for Vikram Lander (Stage 5).
 * Handles touchdown detection at dynamic terrain ground height + LANDER_GROUND_CLEARANCE (3.5m),
 * terrain rock collisions, sloped touchdown evaluation, fuel consumption, and mass integration.
 *
 * @param {Object} state - Current lander physics state
 * @param {Object} inputs - Key input flags { w, s, a, d, q, e }
 * @param {number} deltaTime - Frame time delta in seconds
 * @returns {Object} Updated lander physics state, touchdown status, and collision data
 */
export function stepPhysics(state, inputs, deltaTime) {
  // If simulation is already landed or crashed, freeze physics loop completely
  if (state.isLanded) {
    return {
      ...state,
      velocity: [0, 0, 0],
      angularVelocity: 0,
      actualThrust: 0,
      acceleration: [0, 0, 0],
      engineAccel: 0,
    };
  }

  let requestedThrottle = state.requestedThrottle ?? state.throttle;
  let fuelMass = state.fuelMass;
  let [px, py, pz] = state.position;
  let [vx, vy, vz] = state.velocity;
  let [rx, ry, rz] = state.rotation;
  let angularVelocity = state.angularVelocity || 0;

  // 1. REQUESTED THROTTLE INPUT DYNAMICS (W / S)
  if (inputs.w) {
    requestedThrottle = Math.min(MAX_THROTTLE, requestedThrottle + THROTTLE_CHANGE_RATE * deltaTime);
  }
  if (inputs.s) {
    requestedThrottle = Math.max(MIN_THROTTLE, requestedThrottle - THROTTLE_CHANGE_RATE * deltaTime);
  }

  // 2. FUEL CONSUMPTION & ACTUAL ENGINE THRUST (ENGINE CUTOFF RULE)
  const fuelResult = calculateFuelStep(fuelMass, requestedThrottle, deltaTime);
  const remainingFuelMass = fuelResult.remainingFuelMass;
  const actualThrust = fuelResult.actualThrust;
  const isFuelActive = !fuelResult.isFuelEmpty;

  // 3. DYNAMIC TOTAL SPACECRAFT MASS & ENGINE ACCELERATION
  const totalMass = DRY_MASS + remainingFuelMass;
  const engineAccel = actualThrust / totalMass; // a = F / m (m/s²)

  // 4. ATTITUDE & ROTATIONAL DYNAMICS (TILT LEFT / RIGHT & FORWARD / BACKWARD)
  let targetRz = 0; // Roll tilt for left/right (Z-rotation)
  let targetRx = 0; // Pitch tilt for forward/backward (X-rotation)
  let lateralForceX = 0;
  let lateralForceZ = 0;

  if (inputs.a && isFuelActive) {
    targetRz = 0.35; // Tilt left (~20 degrees)
    lateralForceX -= LATERAL_THRUST_ACCEL;
  } else if (inputs.d && isFuelActive) {
    targetRz = -0.35; // Tilt right (~20 degrees)
    lateralForceX += LATERAL_THRUST_ACCEL;
  }

  if (inputs.q && isFuelActive) {
    targetRx = -0.35; // Tilt forward
    lateralForceZ -= LATERAL_THRUST_ACCEL;
  } else if (inputs.e && isFuelActive) {
    targetRx = 0.35; // Tilt backward
    lateralForceZ += LATERAL_THRUST_ACCEL;
  }

  // Smooth attitude tilt interpolation
  rz += (targetRz - rz) * Math.min(1.0, 7.0 * deltaTime);
  rx += (targetRx - rx) * Math.min(1.0, 7.0 * deltaTime);

  // Clamp tilt angles within safe maximum
  rz = Math.max(-MAX_TILT_ANGLE, Math.min(MAX_TILT_ANGLE, rz));
  rx = Math.max(-MAX_TILT_ANGLE, Math.min(MAX_TILT_ANGLE, rx));

  // 5. THRUST VECTOR & ACCELERATION DECOMPOSITION
  const accelY = engineAccel * Math.cos(rz) * Math.cos(rx) - G_MOON;
  const accelX = -engineAccel * Math.sin(rz) + lateralForceX;
  const accelZ = engineAccel * Math.sin(rx) + lateralForceZ;

  // 6. EULER NUMERICAL INTEGRATION FOR VELOCITY & POSITION
  vy += accelY * deltaTime;
  vx += accelX * deltaTime;
  vz += accelZ * deltaTime;

  // Gentle RCS attitude control dampening on horizontal drift when no steering keys pressed
  if (!inputs.a && !inputs.d) {
    vx *= Math.max(0, 1.0 - 0.25 * deltaTime);
  }
  if (!inputs.q && !inputs.e) {
    vz *= Math.max(0, 1.0 - 0.25 * deltaTime);
  }

  py += vy * deltaTime;
  px += vx * deltaTime;
  pz += vz * deltaTime;

  // 7. DYNAMIC TERRAIN HEIGHT & SLOPE CALCULATION BELOW VIKRAM
  const groundY = getTerrainHeight(px, pz);
  const slope = getTerrainSlope(px, pz);

  // 8. TERRAIN OBSTACLE COLLISION CHECK
  const terrainCollision = checkTerrainCollision([px, py, pz]);

  // 9. TOUCHDOWN DETECTION AT DYNAMIC TERRAIN GROUND HEIGHT (groundY + 3.5m)
  let isLanded = false;
  let isTouchdownEvent = false;
  const minLandingAltitude = groundY + LANDER_GROUND_CLEARANCE;

  if (py <= minLandingAltitude || terrainCollision) {
    py = minLandingAltitude;
    isLanded = true;
    isTouchdownEvent = true; // Trigger single-frame touchdown evaluation event
  }

  return {
    position: [px, py, pz],
    velocity: isLanded ? [0, 0, 0] : [vx, vy, vz],
    rotation: [rx, ry, rz],
    requestedThrottle,
    actualThrust: isLanded ? 0 : actualThrust,
    fuelMass: remainingFuelMass,
    fuelPercentage: fuelResult.fuelPercentage,
    fuelState: fuelResult.fuelState,
    isFuelEmpty: fuelResult.isFuelEmpty,
    totalMass,
    angularVelocity: isLanded ? 0 : angularVelocity,
    acceleration: isLanded ? [0, 0, 0] : [accelX, accelY, accelZ],
    engineAccel: isLanded ? 0 : engineAccel,
    groundY,
    slope,
    isLanded,
    isTouchdownEvent,
    terrainCollision,
    touchdownSnapshot: isLanded
      ? {
          position: [px, py, pz],
          verticalVelocity: vy,
          horizontalVelocity: Math.sqrt(vx * vx + vz * vz),
          tilt: Math.round(Math.sqrt(rx * rx + rz * rz) * (180 / Math.PI)),
          slope,
          fuelPercentage: fuelResult.fuelPercentage,
          terrainCollision,
        }
      : null,
  };
}
