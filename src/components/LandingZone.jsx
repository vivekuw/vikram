import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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
      beaconRef.current.material.opacity = 0.4 + Math.sin(t * 3.5) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Target Base Solid Pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial color="#0b1e36" roughness={0.5} opacity={0.85} transparent />
      </mesh>

      {/* Outer Concentric Glowing Rings */}
      <group ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[11.5, 12.2, 64]} />
          <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[7.8, 8.4, 64]} />
          <meshBasicMaterial color="#ffd700" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[3.8, 4.3, 64]} />
          <meshBasicMaterial color="#00e676" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Target Center Crosshair Marker */}
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.03]}>
        {/* Center Glowing Dot */}
        <mesh>
          <circleGeometry args={[1.5, 16]} />
          <meshBasicMaterial color="#00e676" />
        </mesh>
        {/* Crosshair Lines */}
        {[-Math.PI / 2, 0, Math.PI / 2, Math.PI].map((angle, i) => (
          <mesh key={`cross-${i}`} rotation={[0, 0, angle]} position={[0, 0, 0]}>
            <planeGeometry args={[0.4, 12]} />
            <meshBasicMaterial color="#00e5ff" />
          </mesh>
        ))}
      </group>

      {/* Vertical High-Visibility Laser Beacon Light Column (120m High) */}
      <mesh ref={beaconRef} position={[0, 60, 0]}>
        <cylinderGeometry args={[0.3, 4.5, 120, 24, 1, true]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Inner White Laser Core */}
      <mesh position={[0, 60, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 120, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
      </mesh>

      {/* FLOATING 3D SKY TAG MARKER */}
      <Html position={[0, 28, 0]} center style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(4, 12, 28, 0.95)',
            border: '2px solid #00e5ff',
            color: '#00e5ff',
            padding: '7px 15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontWeight: 900,
            fontSize: '13px',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 25px rgba(0, 229, 255, 0.7), inset 0 0 10px rgba(0, 229, 255, 0.3)',
            letterSpacing: '0.8px',
          }}
        >
          🎯 TARGET LANDING SPOT (35m, 0m)
        </div>
      </Html>
    </group>
  );
}
