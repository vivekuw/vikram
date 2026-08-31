import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TERRAIN_CONFIG } from '../game/terrain/terrainConfig';
import { terrainEngine } from '../game/terrain/terrainGenerator';

export function Terrain() {
  const { geometry, material } = useMemo(() => {
    const { TERRAIN_SIZE, TERRAIN_SEGMENTS } = TERRAIN_CONFIG;

    // Create 2D plane geometry facing UP (+Y)
    const geo = new THREE.PlaneGeometry(
      TERRAIN_SIZE,
      TERRAIN_SIZE,
      TERRAIN_SEGMENTS,
      TERRAIN_SEGMENTS
    );

    // Rotate plane geometry to lie flat horizontally on XZ plane
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const colorBase = new THREE.Color('#383e48');      // Standard lunar regolith grey
    const colorRim = new THREE.Color('#5c6475');       // Lighter crater rim highlight
    const colorCraterFloor = new THREE.Color('#1f232b'); // Dark crater floor shadow

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Deform Y elevation using terrain generator
      const y = terrainEngine.getTerrainHeight(x, z);
      pos.setY(i, y);

      // Determine vertex color based on crater depth vs rim height
      const cDeform = y;
      let vertexColor = colorBase.clone();

      if (cDeform < -1.0) {
        // Deeper crater floor -> Darker regolith
        const t = Math.min(1.0, Math.abs(cDeform) / 5.0);
        vertexColor.lerp(colorCraterFloor, t);
      } else if (cDeform > 0.4) {
        // Elevated crater rim -> Lighter regolith
        const t = Math.min(1.0, cDeform / 3.0);
        vertexColor.lerp(colorRim, t);
      }

      colors[i * 3] = vertexColor.r;
      colors[i * 3 + 1] = vertexColor.g;
      colors[i * 3 + 2] = vertexColor.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Recompute vertex normals for crisp, accurate lunar sun shadows
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.94,
      metalness: 0.06,
      flatShading: false,
    });

    return { geometry: geo, material: mat };
  }, []);

  return <mesh geometry={geometry} material={material} receiveShadow castShadow />;
}
