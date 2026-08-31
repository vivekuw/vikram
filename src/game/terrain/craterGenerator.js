import { TERRAIN_CONFIG } from './terrainConfig';

/**
 * Fast, deterministic Mulberry32 Pseudo-Random Number Generator (PRNG).
 * Ensures identical terrain layout across game restarts when using TERRAIN_CONFIG.RANDOM_SEED.
 *
 * @param {number} seed
 * @returns {Function} Function returning random float between 0.0 and 1.0
 */
export function createPRNG(seed) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministically generates procedural craters across the lunar terrain.
 * Guarantees that huge deep craters are NOT placed directly underneath Vikram spawn (0,0).
 *
 * @param {Object} config - Terrain config override (optional)
 * @returns {Array} List of generated crater objects
 */
export function generateCraters(config = TERRAIN_CONFIG) {
  const rng = createPRNG(config.RANDOM_SEED);
  const craters = [];

  // Designated landing target crater rim frame
  craters.push({
    id: 'crater-target-frame',
    x: config.TARGET_PAD_POSITION.x,
    z: config.TARGET_PAD_POSITION.z,
    radius: 20.0,
    depth: 1.8,
    rimHeight: 0.7,
    rimRadius: 24.0,
  });

  const halfSize = config.TERRAIN_SIZE * 0.45;

  for (let i = 0; i < config.CRATER_COUNT; i++) {
    // Generate random positions using PRNG
    const angle = rng() * Math.PI * 2;
    const dist = 25.0 + rng() * (halfSize - 25.0); // Keep initial spawn (0,0) safe
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    const radius = config.MIN_CRATER_RADIUS + rng() * (config.MAX_CRATER_RADIUS - config.MIN_CRATER_RADIUS);
    const depth = config.MIN_CRATER_DEPTH + rng() * (config.MAX_CRATER_DEPTH - config.MIN_CRATER_DEPTH);
    const rimHeight = depth * 0.28;
    const rimRadius = radius * 1.22;

    craters.push({
      id: `crater-${i}`,
      x,
      z,
      radius,
      depth,
      rimHeight,
      rimRadius,
    });
  }

  return craters;
}

/**
 * Calculates height displacement (in meters) produced by all nearby craters at (x, z).
 *
 * @param {number} x - Horizontal X coordinate
 * @param {number} z - Horizontal Z coordinate
 * @param {Array} craters - List of generated craters
 * @returns {number} Combined height displacement (y offset in meters)
 */
export function getCraterHeightDeformation(x, z, craters) {
  let deltaY = 0;

  for (let i = 0; i < craters.length; i++) {
    const c = craters[i];
    const dx = x - c.x;
    const dz = z - c.z;
    const distSq = dx * dx + dz * dz;
    const rSq = c.radius * c.radius;

    if (distSq < c.rimRadius * c.rimRadius) {
      const dist = Math.sqrt(distSq);

      if (dist < c.radius) {
        // Inner crater basin (parabolic depression)
        const normDist = dist / c.radius;
        const bowlFactor = 1.0 - normDist * normDist;
        deltaY -= c.depth * bowlFactor;
      } else {
        // Outer crater rim (elevated ring)
        const normRimDist = (dist - c.radius) / (c.rimRadius - c.radius);
        const rimFactor = Math.sin(normRimDist * Math.PI);
        deltaY += c.rimHeight * rimFactor;
      }
    }
  }

  return deltaY;
}
