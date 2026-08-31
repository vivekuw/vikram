import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function LandingZone({ position = [35, 0.1, 0] }) {
  const ringRef = useRef();
  const beaconRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.4;
    }
    if (beaconRef.current) {
      beaconRef.current.material.opacity = 0.3 + Math.sin(t * 3) * 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Target Base Solid Pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial color="#0b1e36" roughness={0.5} opacity={0.8} transparent />
      </mesh>

      {/* Outer Concentric Glowing Rings */}
      <group ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[11.5, 12, 64]} />
          <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[7.8, 8.2, 64]} />
          <meshBasicMaterial color="#ffd700" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[3.8, 4.2, 64]} />
          <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Target Center Crosshair Marker */}
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.03]}>
        {/* Center Glowing Dot */}
        <mesh>
          <circleGeometry args={[1.2, 16]} />
          <meshBasicMaterial color="#00e676" />
        </mesh>
        {/* Crosshair Lines */}
        {[-Math.PI / 2, 0, Math.PI / 2, Math.PI].map((angle, i) => (
          <mesh key={`cross-${i}`} rotation={[0, 0, angle]} position={[0, 0, 0]}>
            <planeGeometry args={[0.3, 10]} />
            <meshBasicMaterial color="#00e5ff" />
          </mesh>
        ))}
      </group>

      {/* Vertical Target Beacon Light Beam */}
      <mesh ref={beaconRef} position={[0, 25, 0]}>
        <cylinderGeometry args={[0.2, 3.5, 50, 16, 1, true]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
