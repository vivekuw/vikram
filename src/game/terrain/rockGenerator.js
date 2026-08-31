import { TERRAIN_CONFIG } from './terrainConfig';
import { createPRNG } from './craterGenerator';

/**
 * Deterministically generates small decor rocks and large boulder hazards across lunar surface.
 * Large rocks register as physical terrain hazards.
 *
 * @param {Function} getTerrainHeight - Function to resolve terrain Y elevation at (x, z)
 * @param {Object} config - Terrain config object
 * @returns {Object} Object containing smallRocks and largeRocks arrays
 */
export function generateRocks(getTerrainHeight, config = TERRAIN_CONFIG) {
  const rng = createPRNG(config.RANDOM_SEED + 777);
  const smallRocks = [];
  const largeRocks = [];

  const halfSize = config.TERRAIN_SIZE * 0.48;

  // 1. Generate Small Decorative Rocks
  for (let i = 0; i < config.SMALL_ROCK_COUNT; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = 12.0 + rng() * (halfSize - 12.0);
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const y = getTerrainHeight(x, z);

    const scaleXZ = 0.4 + rng() * 0.9;
    const scaleY = 0.3 + rng() * 0.7;

    smallRocks.push({
      id: `rock-sm-${i}`,
      type: 'SMALL_ROCK',
      position: [x, y + scaleY * 0.4, z],
      scale: [scaleXZ, scaleY, scaleXZ],
      rotation: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
    });
  }

  // 2. Generate Large Boulder Hazards
  for (let i = 0; i < config.LARGE_ROCK_COUNT; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = 20.0 + rng() * (halfSize - 20.0);
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    // Keep target landing zone center clear of large boulders
    const dxTarget = x - config.TARGET_PAD_POSITION.x;
    const dzTarget = z - config.TARGET_PAD_POSITION.z;
    if (Math.sqrt(dxTarget * dxTarget + dzTarget * dzTarget) < config.TARGET_PAD_RADIUS + 4.0) {
      continue;
    }

    const y = getTerrainHeight(x, z);
    const scaleXZ = 1.6 + rng() * 2.2;
    const scaleY = 1.2 + rng() * 1.8;
    const hazardRadius = Math.max(scaleXZ, scaleY) * 0.95;

    largeRocks.push({
      id: `rock-lg-${i}`,
      type: 'LARGE_ROCK',
      x,
      y,
      z,
      position: [x, y + scaleY * 0.4, z],
      scale: [scaleXZ, scaleY, scaleXZ],
      rotation: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
      radius: hazardRadius,
    });
  }

  return { smallRocks, largeRocks };
}
