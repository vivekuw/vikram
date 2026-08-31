import React, { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { terrainEngine } from '../game/terrain/terrainGenerator';

export function Rocks() {
  const smallMeshRef = useRef();
  const largeMeshRef = useRef();

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();

    // 1. Populate Small Decor Rocks InstancedMesh
    if (smallMeshRef.current && terrainEngine.smallRocks) {
      terrainEngine.smallRocks.forEach((rock, i) => {
        dummy.position.set(...rock.position);
        dummy.scale.set(...rock.scale);
        dummy.rotation.set(...rock.rotation);
        dummy.updateMatrix();
        smallMeshRef.current.setMatrixAt(i, dummy.matrix);
      });
      smallMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Populate Large Boulder Hazards InstancedMesh
    if (largeMeshRef.current && terrainEngine.largeRocks) {
      terrainEngine.largeRocks.forEach((rock, i) => {
        dummy.position.set(...rock.position);
        dummy.scale.set(...rock.scale);
        dummy.rotation.set(...rock.rotation);
        dummy.updateMatrix();
        largeMeshRef.current.setMatrixAt(i, dummy.matrix);
      });
      largeMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  const smallCount = terrainEngine.smallRocks.length;
  const largeCount = terrainEngine.largeRocks.length;

  return (
    <group>
      {/* Small Decor Rocks */}
      <instancedMesh
        ref={smallMeshRef}
        args={[null, null, smallCount]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color="#4a505c" roughness={0.88} metalness={0.12} />
      </instancedMesh>

      {/* Large Boulder Hazard Boulders */}
      <instancedMesh
        ref={largeMeshRef}
        args={[null, null, largeCount]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial color="#313642" roughness={0.92} metalness={0.08} />
      </instancedMesh>
    </group>
  );
}
