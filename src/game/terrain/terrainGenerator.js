import { TERRAIN_CONFIG } from './terrainConfig';
import { generateCraters, getCraterHeightDeformation, createPRNG } from './craterGenerator';
import { generateRocks } from './rockGenerator';

// Singleton instantiated terrain state for fast, deterministic lookups
class LunarTerrainEngine {
  constructor(config = TERRAIN_CONFIG) {
    this.config = config;
    this.rng = createPRNG(config.RANDOM_SEED);
    this.craters = generateCraters(config);
    this.perm = this.initNoisePermutation();

    // Pure terrain height function binder
    const heightFn = (x, z) => this.getTerrainHeight(x, z);
    const { smallRocks, largeRocks } = generateRocks(heightFn, config);

    this.smallRocks = smallRocks;
    this.largeRocks = largeRocks;
  }

  initNoisePermutation() {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    return perm;
  }

  // Smooth 2D Value Noise
  noise2D(x, z) {
    const X = Math.floor(x) & 255;
    const Z = Math.floor(z) & 255;
    const xf = x - Math.floor(x);
    const zf = z - Math.floor(z);

    const u = xf * xf * (3 - 2 * xf);
    const v = zf * zf * (3 - 2 * zf);

    const p = this.perm;
    const aa = p[p[X] + Z];
    const ab = p[p[X] + Z + 1];
    const ba = p[p[X + 1] + Z];
    const bb = p[p[X + 1] + Z + 1];

    const res =
      (1 - v) * ((1 - u) * (aa / 255) + u * (ba / 255)) +
      v * ((1 - u) * (ab / 255) + u * (bb / 255));
    return res * 2.0 - 1.0;
  }

  /**
   * Returns exact lunar terrain Y elevation at (x, z).
   */
  getTerrainHeight(x, z) {
    // 1. Low-frequency broad undulating hill noise
    const baseNoise =
      this.noise2D(x * 0.005, z * 0.005) * 12.0 +
      this.noise2D(x * 0.015, z * 0.015) * 4.5 +
      this.noise2D(x * 0.04, z * 0.04) * 1.5;

    // 2. Crater deformations (basin depressions & rim heights)
    const craterDeform = getCraterHeightDeformation(x, z, this.craters);

    // 3. Smooth landing zone flattening at target pad
    const dxTarget = x - this.config.TARGET_PAD_POSITION.x;
    const dzTarget = z - this.config.TARGET_PAD_POSITION.z;
    const targetDist = Math.sqrt(dxTarget * dxTarget + dzTarget * dzTarget);
    let targetFlatteningFactor = 1.0;
    if (targetDist < this.config.TARGET_PAD_RADIUS + 8.0) {
      const norm = Math.min(1.0, Math.max(0.0, (targetDist - 4.0) / (this.config.TARGET_PAD_RADIUS + 4.0)));
      targetFlatteningFactor = norm * norm;
    }

    const rawY = baseNoise + craterDeform;
    return rawY * targetFlatteningFactor;
  }

  /**
   * Calculates terrain normal vector [nx, ny, nz] at (x, z) using finite difference gradients.
   */
  getTerrainNormal(x, z) {
    const eps = 0.5;
    const hL = this.getTerrainHeight(x - eps, z);
    const hR = this.getTerrainHeight(x + eps, z);
    const hD = this.getTerrainHeight(x, z - eps);
    const hU = this.getTerrainHeight(x, z + eps);

    const nx = hL - hR;
    const ny = 2.0 * eps;
    const nz = hD - hU;

    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    return [nx / len, ny / len, nz / len];
  }

  /**
   * Calculates terrain slope angle (in degrees) at (x, z).
   */
  getTerrainSlope(x, z) {
    const [, ny] = this.getTerrainNormal(x, z);
    // Angle with vertical plane: acos(ny) converted to degrees
    const clampedNy = Math.max(-1.0, Math.min(1.0, ny));
    const rad = Math.acos(clampedNy);
    return parseFloat((rad * (180.0 / Math.PI)).toFixed(1));
  }

  /**
   * Evaluates landing safety status at (x, z): 'SAFE' | 'RISKY' | 'HAZARD'.
   */
  evaluateLandingSafety(x, z) {
    const slope = this.getTerrainSlope(x, z);

    // Check large rock hazard proximity
    for (let i = 0; i < this.largeRocks.length; i++) {
      const rock = this.largeRocks[i];
      const dx = x - rock.x;
      const dz = z - rock.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < rock.radius + 3.0) {
        return 'HAZARD';
      }
    }

    if (slope > this.config.CRITICAL_SLOPE) return 'HAZARD';
    if (slope > this.config.SAFE_SLOPE) return 'RISKY';

    return 'SAFE';
  }

  /**
   * Performs real-time hazard scan around (x, z) for Hazard Scanner HUD (H key).
   */
  getHazardScanData(x, z, scanRadius = 35.0) {
    let rocksInScan = 0;
    let cratersInScan = 0;

    for (let i = 0; i < this.largeRocks.length; i++) {
      const rock = this.largeRocks[i];
      const dx = x - rock.x;
      const dz = z - rock.z;
      if (Math.sqrt(dx * dx + dz * dz) <= scanRadius) {
        rocksInScan++;
      }
    }

    for (let i = 0; i < this.craters.length; i++) {
      const c = this.craters[i];
      const dx = x - c.x;
      const dz = z - c.z;
      if (Math.sqrt(dx * dx + dz * dz) <= scanRadius + c.radius) {
        cratersInScan++;
      }
    }

    const slope = this.getTerrainSlope(x, z);
    const safety = this.evaluateLandingSafety(x, z);

    return {
      rocksInScan,
      cratersInScan,
      slope,
      safety,
      targetDist: Math.round(
        Math.sqrt(
          (x - this.config.TARGET_PAD_POSITION.x) ** 2 +
            (z - this.config.TARGET_PAD_POSITION.z) ** 2
        )
      ),
    };
  }
}

// Global Singleton Terrain Instance
export const terrainEngine = new LunarTerrainEngine();

export function getTerrainHeight(x, z) {
  return terrainEngine.getTerrainHeight(x, z);
}

export function getTerrainNormal(x, z) {
  return terrainEngine.getTerrainNormal(x, z);
}

export function getTerrainSlope(x, z) {
  return terrainEngine.getTerrainSlope(x, z);
}

export function evaluateLandingSafety(x, z) {
  return terrainEngine.evaluateLandingSafety(x, z);
}

export function getHazardScanData(x, z, radius) {
  return terrainEngine.getHazardScanData(x, z, radius);
}
