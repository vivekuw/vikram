/**
 * Pragyan Rover Configuration & Gameplay Constants
 * Coordinate System Convention (Three.js):
 *   World: +Y = Up, +X = Right, +Z = Backward / -Z = Forward
 *   Rover Local Forward: (0, 0, -1)
 *   Rover Local Right: (1, 0, 0)
 *   Rover Local Up: (0, 1, 0)
 */
export const ROVER_CONSTANTS = {
  // Mobility & Speed
  MAX_SPEED: 1.5,           // m/s (forward drive max)
  REVERSE_MAX_SPEED: 0.8,   // m/s (reverse drive max)
  ACCELERATION: 1.2,        // m/s^2 (forward acceleration rate)
  DECELERATION: 1.8,        // m/s^2 (coasting friction rate)
  BRAKE_DECELERATION: 3.5,  // m/s^2 (brake rate)
  STOP_THRESHOLD: 0.01,     // m/s (speed below which velocity snaps to 0)

  // Steering
  MAX_STEERING_RATE: 1.2,   // rad/s (heading turn rate)

  // Physics & Terrain
  WHEEL_RADIUS: 0.25,       // m
  ROVER_GROUND_CLEARANCE: 0.35, // m above terrain
  SLOPE_TIPPING_THRESHOLD: 42.0, // degrees (max slope before tipping)

  // Battery Level Thresholds (%)
  BATTERY_NORMAL: 50,
  BATTERY_CAUTION: 20,
  BATTERY_LOW: 10,

  // Battery Management
  STARTING_BATTERY: 100,    // %
  DRIVE_CONSUMPTION: 0.12,  // % per meter driven
  TURN_CONSUMPTION: 0.08,   // % per second turning
  SLOPE_MULTIPLIER: 1.8,    // multiplier when climbing slope
  LIBS_ENERGY_COST: 4.0,    // % per LIBS laser pulse
  APXS_ENERGY_COST: 5.0,    // % per APXS spectrometer scan

  // Communication & Range
  MAX_COMM_RANGE: 150.0,    // m from Vikram lander
  WEAK_COMM_RANGE: 100.0,   // m

  // Target Locations relative to Vikram (0,0)
  TARGET_A_POSITION: { x: 18, z: -22, radius: 5.0, label: 'Navigation Point A' },
  TARGET_B_POSITION: { x: 38, z: -45, radius: 4.0, label: 'Science Sample B' },
  TARGET_C_POSITION: { x: 22, z: -78, radius: 6.0, label: 'Exploration Ridge C' },
  VIKRAM_RETURN_RADIUS: 6.0, // m from Vikram (0,0) to complete return objective

  // Camera Parameters
  CAMERA: {
    CHASE_DISTANCE: 4.0,
    CHASE_HEIGHT: 2.0,
    CHASE_LOOK_AHEAD: 1.5,
    TOP_HEIGHT: 15.0,
    FRONT_DISTANCE: 0.6,
    FRONT_HEIGHT: 0.4,
    FRONT_LOOK_AHEAD: 10.0,
    MIN_GROUND_OFFSET: 0.8, // m above terrain to prevent clipping
    SMOOTHING_FACTOR: 6.0,   // lerp damp factor per second
  },

  // Visual Model Alignment Offset
  MODEL_ROTATION_OFFSET: 0, // radians offset between visual mesh & physics body
};
