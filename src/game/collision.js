import { terrainEngine, getTerrainHeight } from './terrain/terrainGenerator';

/**
 * Checks if lander position collides with any registered large boulder hazard.
 *
 * @param {Array} position - Lander 3D position [x, y, z]
 * @param {number} landerRadius - Bounding radius of lander feet
 * @returns {Object|null} Collision object if hit, else null
 */
export function checkTerrainCollision(position, landerRadius = 2.1) {
  const [px, py, pz] = position;
  const groundY = getTerrainHeight(px, pz);

  // Collision only evaluated when close to local terrain height
  if (py > groundY + 8.0) return null;

  const rocks = terrainEngine.largeRocks || [];
  for (let i = 0; i < rocks.length; i++) {
    const rock = rocks[i];
    const dx = px - rock.x;
    const dz = pz - rock.z;
    const dist2D = Math.sqrt(dx * dx + dz * dz);

    if (dist2D < rock.radius + landerRadius && Math.abs(py - rock.y) < rock.scale[1] + 2.0) {
      return {
        type: 'ROCK_COLLISION',
        hazardName: 'Lunar Boulder Collision',
        distance: dist2D,
      };
    }
  }

  return null;
}
