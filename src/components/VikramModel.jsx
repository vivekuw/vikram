import React, { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { EngineEffect } from './EngineEffect';

export const LANDER_SCALE = 1.0;

// GLTF Lander 3D Model Renderer Component
function GLTFModel({ actualThrustRatio, ...props }) {
  const { scene } = useGLTF('/models/vikram/vikram-lander.gltf');

  // Clone scene instance to prevent sharing state across instances
  const clonedScene = React.useMemo(() => scene.clone(true), [scene]);

  React.useLayoutEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  return (
    <group scale={[LANDER_SCALE, LANDER_SCALE, LANDER_SCALE]} {...props}>
      <primitive object={clonedScene} />
      {/* Thruster Flame Engine Effect */}
      <EngineEffect actualThrustRatio={actualThrustRatio} />
    </group>
  );
}

// Procedural High-Detail Lander Fallback Component (Stage 1/Placeholder Fallback)
export function ProceduralLanderFallback({ actualThrustRatio = 0 }) {
  return (
    <group scale={[LANDER_SCALE, LANDER_SCALE, LANDER_SCALE]}>
      {/* Central Gold Foil Spacecraft Body */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.4, 2.2]} />
        <meshStandardMaterial color="#e0ac00" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Side Solar Panels */}
      {[-1.12, 1.12].map((x, i) => (
        <mesh key={`sp-x-${i}`} position={[x, 1.2, 0]} castShadow>
          <boxGeometry args={[0.04, 1.2, 1.8]} />
          <meshStandardMaterial color="#001845" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {[-1.12, 1.12].map((z, i) => (
        <mesh key={`sp-z-${i}`} position={[0, 1.2, z]} castShadow>
          <boxGeometry args={[1.8, 1.2, 0.04]} />
          <meshStandardMaterial color="#001845" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* Top Deck Equipment & Dish Antenna */}
      <mesh position={[0, 1.95, 0]} castShadow>
        <cylinderGeometry args={[1.1, 1.2, 0.1, 8]} />
        <meshStandardMaterial color="#2d3748" metalness={0.6} roughness={0.4} />
      </mesh>
      <group position={[0.5, 2.15, 0.5]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshStandardMaterial color="#cbd5e0" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[0.4, 0, 0]}>
          <sphereGeometry args={[0.25, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial color="#e2e8f0" side={THREE.DoubleSide} metalness={0.8} />
        </mesh>
      </group>

      {/* Four Main Thruster Nozzles */}
      {[-0.5, 0.5].map((x) =>
        [-0.5, 0.5].map((z) => (
          <group key={`engine-${x}-${z}`} position={[x, 0.35, z]}>
            <mesh castShadow>
              <coneGeometry args={[0.2, 0.45, 16, 1, true]} />
              <meshStandardMaterial color="#1a202c" metalness={0.95} roughness={0.1} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))
      )}

      {/* 4-Directional RCS Thrusters */}
      {[-1.15, 1.15].map((x, i) => (
        <group key={`rcs-x-${i}`} position={[x, 1.6, 0]}>
          <mesh rotation={[0, 0, x > 0 ? -Math.PI / 2 : Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.08, 0.2, 8]} />
            <meshStandardMaterial color="#4a5568" metalness={0.9} />
          </mesh>
        </group>
      ))}
      {[-1.15, 1.15].map((z, i) => (
        <group key={`rcs-z-${i}`} position={[0, 1.6, z]}>
          <mesh rotation={[z > 0 ? Math.PI / 2 : -Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.08, 0.2, 8]} />
            <meshStandardMaterial color="#4a5568" metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Landing Legs */}
      {[
        { angle: Math.PI * 0.25, id: 'leg-ne' },
        { angle: Math.PI * 0.75, id: 'leg-nw' },
        { angle: Math.PI * 1.25, id: 'leg-sw' },
        { angle: Math.PI * 1.75, id: 'leg-se' },
      ].map((leg) => {
        const distance = 1.35;
        const footDistance = 2.1;
        const startX = Math.cos(leg.angle) * distance;
        const startZ = Math.sin(leg.angle) * distance;
        const footX = Math.cos(leg.angle) * footDistance;
        const footZ = Math.sin(leg.angle) * footDistance;

        return (
          <group key={leg.id}>
            <mesh
              position={[(startX + footX) / 2, 0.1, (startZ + footZ) / 2]}
              rotation={[0, -leg.angle + Math.PI / 2, Math.atan2(footDistance - distance, 1.4)]}
              castShadow
            >
              <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
              <meshStandardMaterial color="#718096" metalness={0.8} />
            </mesh>
            <mesh position={[footX, -0.65, footZ]} castShadow receiveShadow>
              <cylinderGeometry args={[0.35, 0.4, 0.08, 16]} />
              <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Engine Exhaust Flame Effect */}
      <EngineEffect actualThrustRatio={actualThrustRatio} />
    </group>
  );
}

// React Error Boundary Wrapper for Graceful Asset Fallback
class GLTFErrBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('GLTF Vikram model fallback active:', err);
  }
  render() {
    if (this.state.hasError) {
      return <ProceduralLanderFallback actualThrustRatio={this.props.actualThrustRatio} />;
    }
    return this.props.children;
  }
}

// Exported Primary Vikram Model Component with Fallback
export function VikramModel({ actualThrustRatio = 0, ...props }) {
  return (
    <GLTFErrBoundary actualThrustRatio={actualThrustRatio}>
      <Suspense fallback={<ProceduralLanderFallback actualThrustRatio={actualThrustRatio} />}>
        <GLTFModel actualThrustRatio={actualThrustRatio} {...props} />
      </Suspense>
    </GLTFErrBoundary>
  );
}

// Preload GLTF asset for fast initial load
useGLTF.preload('/models/vikram/vikram-lander.gltf');
