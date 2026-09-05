import { ROVER_CONSTANTS } from './roverConstants';
import { terrainEngine } from '../game/terrain/terrainGenerator';

/**
 * Pragyan Rover Physics Engine
 * 
 * COORDINATE SYSTEM CONVENTION (Three.js):
 * World: +Y = Up, +X = Right, +Z = Backward / -Z = Forward
 * Rover Local Forward (f): (-sin(heading), 0, -cos(heading))
 * Rover Local Right (r):   (cos(heading), 0, -sin(heading))
 * Rover Local Up:          (0, 1, 0)
 * 
 * All rover movement and camera calculations strictly follow this convention.
 */
export function stepRoverPhysics(state, inputs, dt) {
  if (!state || dt <= 0) return state;

  const {
    position = [0, 0, 0],
    velocity = 0,
    heading = Math.PI, // Default facing South (+Z) upon deployment
    wheelAngle = 0,
    battery = 100,
    isImmobilized = false,
  } = state;

  const [x, , z] = position;

  // Ground Clearance Terrain Elevation constraint
  const groundY = terrainEngine.getTerrainHeight(x, z);
  const currentY = groundY + ROVER_CONSTANTS.ROVER_GROUND_CLEARANCE;

  if (isImmobilized || battery <= 0) {
    return {
      ...state,
      position: [x, currentY, z],
      velocity: 0,
      isDriving: false,
      isTurning: false,
    };
  }

  const { forward = false, backward = false, left = false, right = false, brake = false } = inputs;

  // 1. Steering Rotation (heading in radians)
  // A = turn left (+heading), D = turn right (-heading)
  let turnDirection = 0;
  if (left) turnDirection += 1;
  if (right) turnDirection -= 1;

  const isTurning = turnDirection !== 0;
  const newHeading = heading + turnDirection * ROVER_CONSTANTS.MAX_STEERING_RATE * dt;

  // 2. Local Forward Vector Computation
  const fx = -Math.sin(newHeading);
  const fz = -Math.cos(newHeading);

  // 3. Acceleration & Speed Integration
  let targetAccel = 0;
  if (brake) {
    targetAccel = -Math.sign(velocity) * ROVER_CONSTANTS.BRAKE_DECELERATION;
  } else if (forward) {
    targetAccel = ROVER_CONSTANTS.ACCELERATION;
  } else if (backward) {
    targetAccel = -ROVER_CONSTANTS.ACCELERATION;
  } else {
    // Friction coasting slowdown
    targetAccel = -Math.sign(velocity) * ROVER_CONSTANTS.DECELERATION;
  }

  let newVel = velocity + targetAccel * dt;

  // Stop threshold snapping
  if (!forward && !backward && !brake && Math.abs(newVel) < ROVER_CONSTANTS.STOP_THRESHOLD) {
    newVel = 0;
  }

  // Velocity Clamping
  newVel = Math.min(ROVER_CONSTANTS.MAX_SPEED, Math.max(-ROVER_CONSTANTS.REVERSE_MAX_SPEED, newVel));

  // 4. Position Integration along Local Forward Vector
  const newX = x + fx * newVel * dt;
  const newZ = z + fz * newVel * dt;

  // Wheelbase (0.8m) & Track Width (0.8m)
  const L = 0.8;
  const W = 0.8;
  const rxVec = Math.cos(newHeading);
  const rzVec = -Math.sin(newHeading);

  // Sample terrain elevation at 4 wheel contact corners to conform chassis to lunar contours
  const flX = newX + fx * (L / 2) - rxVec * (W / 2);
  const flZ = newZ + fz * (L / 2) - rzVec * (W / 2);
  const y_fl = terrainEngine.getTerrainHeight(flX, flZ);

  const frX = newX + fx * (L / 2) + rxVec * (W / 2);
  const frZ = newZ + fz * (L / 2) + rzVec * (W / 2);
  const y_fr = terrainEngine.getTerrainHeight(frX, frZ);

  const rlX = newX - fx * (L / 2) - rxVec * (W / 2);
  const rlZ = newZ - fz * (L / 2) - rzVec * (W / 2);
  const y_rl = terrainEngine.getTerrainHeight(rlX, rlZ);

  const rrX = newX - fx * (L / 2) + rxVec * (W / 2);
  const rrZ = newZ - fz * (L / 2) + rzVec * (W / 2);
  const y_rr = terrainEngine.getTerrainHeight(rrX, rrZ);

  const y_front = (y_fl + y_fr) / 2;
  const y_rear = (y_rl + y_rr) / 2;
  const y_left = (y_fl + y_rl) / 2;
  const y_right = (y_fr + y_rr) / 2;
  const newGroundY = (y_fl + y_fr + y_rl + y_rr) / 4;

  // Calculate terrain pitch (front-to-back tilt) and roll (left-to-right tilt)
  const targetPitch = Math.atan2(y_front - y_rear, L);
  const targetRoll = Math.atan2(y_right - y_left, W);

  // Smooth lerp pitch and roll to prevent jerky movement on sharp rocks
  const prevPitch = state.pitch || 0;
  const prevRoll = state.roll || 0;
  const pitch = prevPitch + (targetPitch - prevPitch) * Math.min(1.0, dt * 12.0);
  const roll = prevRoll + (targetRoll - prevRoll) * Math.min(1.0, dt * 12.0);

  // Micro suspension bounce while driving on rough regolith
  const totalDist = (state.totalDist || 0) + Math.abs(newVel * dt);
  const suspensionBounce = Math.abs(newVel) > 0.02 ? Math.sin(totalDist * 28.0) * 0.006 * (Math.abs(newVel) / ROVER_CONSTANTS.MAX_SPEED) : 0;
  const newY = newGroundY + ROVER_CONSTANTS.ROVER_GROUND_CLEARANCE + suspensionBounce;

  // 5. Terrain Slope Calculation
  const sampleDist = 2.0;
  const aheadX = newX + fx * sampleDist;
  const aheadZ = newZ + fz * sampleDist;
  const aheadY = terrainEngine.getTerrainHeight(aheadX, aheadZ);
  const heightDiff = aheadY - newGroundY;
  const slopeAngle = Math.atan2(heightDiff, sampleDist) * (180 / Math.PI);
  const isClimbingSlope = slopeAngle > 2.0;

  // 6. Tyre Slip, Steering Angle & Wheel Spin Dynamics
  let steerAngle = 0;
  if (left) steerAngle = 0.42; // ~24 deg turn left
  if (right) steerAngle = -0.42; // ~24 deg turn right

  // Calculate Wheel Slip Ratio (0 to 100%)
  let slipRatio = 0;
  if (forward || backward) {
    // Heavy throttle at low speed causes initial tyre slip on lunar regolith
    const throttleSlip = Math.max(0, 0.35 - Math.abs(newVel) * 0.2);
    // Steep slopes cause wheel slip
    const slopeSlip = Math.max(0, (Math.abs(slopeAngle) - 5) * 0.025);
    slipRatio = Math.min(0.95, throttleSlip + slopeSlip);
  }

  // Visual Wheel Rotation Angle (includes tyre spin slip factor)
  const distTraveled = Math.abs(newVel * dt);
  const slipMultiplier = 1.0 + slipRatio * 2.2; // Wheel spins up to 3.2x faster during slip
  const tyreSpinSpeed = (newVel / ROVER_CONSTANTS.WHEEL_RADIUS) * slipMultiplier;
  const newWheelAngle = (wheelAngle + tyreSpinSpeed * dt) % (Math.PI * 2);

  // 7. Hazard Tipping Check
  const isTippedOver = Math.abs(slopeAngle) > ROVER_CONSTANTS.SLOPE_TIPPING_THRESHOLD;

  return {
    ...state,
    position: [newX, newY, newZ],
    velocity: newVel,
    heading: newHeading,
    pitch,
    roll,
    totalDist,
    forwardVector: [fx, 0, fz],
    wheelAngle: newWheelAngle,
    steerAngle,
    slipRatio,
    tyreSpinSpeed,
    slopeAngle: Math.abs(slopeAngle),
    isClimbingSlope,
    isDriving: Math.abs(newVel) > 0.01 || slipRatio > 0.1,
    isTurning,
    distTraveled,
    collisionStatus: isTippedOver ? 'IMMOBILIZED' : Math.abs(slopeAngle) > 20 ? 'WARNING' : 'SAFE',
    isImmobilized: isTippedOver,
  };
}
