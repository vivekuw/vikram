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

  // Sample terrain elevation at new position
  const newGroundY = terrainEngine.getTerrainHeight(newX, newZ);
  const newY = newGroundY + ROVER_CONSTANTS.ROVER_GROUND_CLEARANCE;

  // 5. Terrain Slope Calculation (sampled over 2.0m wheelbase)
  const sampleDist = 2.0;
  const aheadX = newX + fx * sampleDist;
  const aheadZ = newZ + fz * sampleDist;
  const aheadY = terrainEngine.getTerrainHeight(aheadX, aheadZ);
  const heightDiff = aheadY - newGroundY;
  const slopeAngle = Math.atan2(heightDiff, sampleDist) * (180 / Math.PI);
  const isClimbingSlope = slopeAngle > 2.0;

  // 6. Visual Wheel Rotation Angle (proportional to velocity * dt)
  const distTraveled = Math.abs(newVel * dt);
  const newWheelAngle = (wheelAngle + (newVel * dt) / ROVER_CONSTANTS.WHEEL_RADIUS) % (Math.PI * 2);

  // 7. Hazard Tipping Check
  const isTippedOver = Math.abs(slopeAngle) > ROVER_CONSTANTS.SLOPE_TIPPING_THRESHOLD;

  return {
    ...state,
    position: [newX, newY, newZ],
    velocity: newVel,
    heading: newHeading,
    forwardVector: [fx, 0, fz],
    wheelAngle: newWheelAngle,
    slopeAngle: Math.abs(slopeAngle),
    isClimbingSlope,
    isDriving: Math.abs(newVel) > 0.01,
    isTurning,
    distTraveled,
    collisionStatus: isTippedOver ? 'IMMOBILIZED' : Math.abs(slopeAngle) > 20 ? 'WARNING' : 'SAFE',
    isImmobilized: isTippedOver,
  };
}
