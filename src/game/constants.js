// Physical Constants & Gameplay Config for Chandrayaan-3 Vikram Lander

// Lunar Surface Gravity (m/s²)
export const G_MOON = 1.62;

// Spacecraft Mass Parameters (SI Units: kg)
export const DRY_MASS = 600.0;            // Dry mass of spacecraft frame (kg)
export const MAX_FUEL_MASS = 400.0;        // Maximum usable fuel capacity (kg)
export const INITIAL_FUEL_MASS = 400.0;    // Starting fuel mass (kg)

// Main Engine Parameters (SI Units: N)
export const ENGINE_MAX_THRUST = 3200.0;   // Maximum total engine force (3.2 kN)
export const FUEL_CONSUMPTION_RATE = 8.5;  // Fuel burn rate at 100% throttle (8.5 kg/s)

// Throttle Configuration
export const MIN_THROTTLE = 0.0;           // 0%
export const MAX_THROTTLE = 1.0;           // 100%
export const INITIAL_THROTTLE = 0.506;     // ~50.6% hover thrust at start (1000kg * 1.62m/s² / 3200N)
export const THROTTLE_CHANGE_RATE = 0.55;  // Throttle change rate per second (55%/s)

// Rotational & Lateral Control Configuration
export const MAX_TILT_ANGLE = Math.PI / 4; // Max 45 degrees
export const ROTATION_SPEED = 2.4;          // Angular acceleration multiplier
export const ROTATION_DAMPING = 3.5;        // Spring damping back to center
export const LATERAL_THRUST_ACCEL = 4.5;    // Lateral RCS acceleration (m/s²)

// Initial Simulation Spawn State
export const INITIAL_POSITION = [0, 250.0, 0]; // Initial altitude 250 meters
export const INITIAL_VELOCITY = [0, -2.0, 0];  // Initial slight descent speed -2.0 m/s
export const INITIAL_ROTATION = [0, 0, 0];

// Telemetry & Warning Thresholds
export const HIGH_DESCENT_WARNING_THRESHOLD = -8.0;   // m/s descent warning
export const CRITICAL_DESCENT_WARNING_THRESHOLD = -15.0; // m/s critical warning

export const FUEL_STATUS_THRESHOLDS = {
  CAUTION: 50.0,   // 50%
  LOW: 20.0,       // 20%
  CRITICAL: 10.0,  // 10%
  EMPTY: 0.0,      // 0%
};

// Target Landing Zone Configuration
export const TARGET_LANDING_ZONE = { x: 35, y: 0.1, z: 0 };
export const LANDING_ZONE_RADIUS = 12.0;    // Target zone radius (meters)
export const HARD_LANDING_MAX_DIST = 25.0;  // Maximum distance for hard landing survival (meters)
export const LANDER_GROUND_CLEARANCE = 3.5; // Feet clearance height offset

// Landing Evaluation Thresholds
export const LANDING_THRESHOLDS = {
  SAFE_V_VEL: -4.0,     // m/s (Descent slower than 4.0 m/s is safe)
  HARD_V_VEL: -8.0,     // m/s (Descent between 4.0 and 8.0 m/s is hard landing, >8.0 is crash)
  SAFE_H_VEL: 3.0,      // m/s (Horizontal drift slower than 3.0 m/s is safe)
  HARD_H_VEL: 6.0,      // m/s (Horizontal drift >6.0 m/s causes crash)
  SAFE_TILT: 10.0,      // degrees (Tilt <= 10 deg is safe)
  WARNING_TILT: 20.0,   // degrees (Tilt 10-20 deg is hard landing)
  CRITICAL_TILT: 30.0,  // degrees (Tilt > 20-30 deg causes crash)
};
