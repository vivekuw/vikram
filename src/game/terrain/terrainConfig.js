// Stage 5 Configuration for Procedural Lunar Terrain & Hazards

export const TERRAIN_CONFIG = {
  // Terrain Mesh & Boundary Parameters
  TERRAIN_SIZE: 600.0,       // Playable terrain size (600m x 600m)
  TERRAIN_SEGMENTS: 128,     // Grid resolution for 3D terrain mesh
  HEIGHT_SCALE: 16.0,        // Global noise height scaling (meters)
  RANDOM_SEED: 2026,         // Deterministic seed for reproducible terrain

  // Crater Generation Limits
  CRATER_COUNT: 28,          // Total procedural craters
  MIN_CRATER_RADIUS: 7.0,    // Minimum crater radius (meters)
  MAX_CRATER_RADIUS: 38.0,   // Maximum crater radius (meters)
  MIN_CRATER_DEPTH: 1.2,     // Minimum depression depth (meters)
  MAX_CRATER_DEPTH: 5.5,     // Maximum depression depth (meters)

  // Rock Hazard Density
  SMALL_ROCK_COUNT: 280,     // Visual decor small rocks
  LARGE_ROCK_COUNT: 50,      // Registered collision hazard boulders

  // Slope Evaluation Thresholds (Degrees)
  SAFE_SLOPE: 5.0,           // <= 5° is Safe Landing Zone
  WARNING_SLOPE: 12.0,       // 5° - 12° is Risky Landing Zone
  CRITICAL_SLOPE: 20.0,      // > 20° is Hazard / Crash Risk

  // Safe Landing Zone Target Area
  TARGET_PAD_POSITION: { x: 35.0, z: 0.0 },
  TARGET_PAD_RADIUS: 14.0,
};
