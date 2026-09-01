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

import { Html } from '@react-three/drei';

// Procedural High-Detail Vikram Spacecraft Satellite Model
export function ProceduralLanderFallback({ actualThrustRatio = 0 }) {
  return (
    <group scale={[LANDER_SCALE, LANDER_SCALE, LANDER_SCALE]}>
      {/* Floating 3D Satellite Label in Sky */}
      <Html position={[0, 3.2, 0]} center style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(5, 15, 35, 0.92)',
            border: '2px solid #ffd700',
            color: '#ffd700',
            padding: '4px 10px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontWeight: 900,
            fontSize: '11px',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.6)',
            letterSpacing: '0.5px',
          }}
        >
          🛸 VIKRAM SATELLITE (LANDER)
        </div>
      </Html>

      {/* Ground Projection Spotlight pointing down from Satellite */}
      <spotLight
        position={[0, 0.2, 0]}
        target-position={[0, -50, 0]}
        color="#00e5ff"
        intensity={6.0}
        angle={0.5}
        penumbra={0.4}
        distance={150}
      />

      {/* Central Gold-Foil Octagonal Spacecraft Body */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.5, 2.4]} />
        <meshStandardMaterial color="#ffd700" metalness={0.92} roughness={0.18} />
      </mesh>

      {/* Gold Foil Seam Lines Grid Overlay */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[2.42, 1.48, 2.42]} />
        <meshStandardMaterial color="#ffb300" metalness={0.8} roughness={0.3} wireframe={true} />
      </mesh>

      {/* Deployed Side Solar Panels (4 Wings) */}
      {[-1.25, 1.25].map((x, i) => (
        <group key={`sp-x-${i}`} position={[x, 1.25, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 1.4, 2.0]} />
            <meshStandardMaterial color="#0d47a1" metalness={0.95} roughness={0.05} />
          </mesh>
          {/* Solar Cells Grid */}
          <mesh position={[x > 0 ? 0.04 : -0.04, 0, 0]}>
            <boxGeometry args={[0.01, 1.35, 1.95]} />
            <meshStandardMaterial color="#1565c0" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}
      {[-1.25, 1.25].map((z, i) => (
        <group key={`sp-z-${i}`} position={[0, 1.25, z]}>
          <mesh castShadow>
            <boxGeometry args={[2.0, 1.4, 0.06]} />
            <meshStandardMaterial color="#0d47a1" metalness={0.95} roughness={0.05} />
          </mesh>
          {/* Solar Cells Grid */}
          <mesh position={[0, 0, z > 0 ? 0.04 : -0.04]}>
            <boxGeometry args={[1.95, 1.35, 0.01]} />
            <meshStandardMaterial color="#1565c0" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Top Equipment Deck */}
      <mesh position={[0, 2.02, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.3, 0.14, 12]} />
        <meshStandardMaterial color="#37474f" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* High-Gain Dish Antenna & Sensors */}
      <group position={[0.6, 2.22, 0.6]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
          <meshStandardMaterial color="#cfd8dc" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.4, 0]} rotation={[0.4, 0.2, 0]}>
          <sphereGeometry args={[0.3, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          <meshStandardMaterial color="#eceff1" side={THREE.DoubleSide} metalness={0.85} roughness={0.15} />
        </mesh>
      </group>

      {/* Omni Telemetry Antenna Mast */}
      <mesh position={[-0.7, 2.3, -0.7]}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.7, 2.6, -0.7]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>

      {/* Four Main Rocket Engines (Bottom Nozzles) */}
      {[-0.6, 0.6].map((x) =>
        [-0.6, 0.6].map((z) => (
          <group key={`engine-${x}-${z}`} position={[x, 0.35, z]}>
            <mesh castShadow>
              <coneGeometry args={[0.22, 0.5, 16, 1, true]} />
              <meshStandardMaterial color="#212121" metalness={0.95} roughness={0.1} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))
      )}

      {/* 4 Corner RCS Control Thrusters */}
      {[-1.2, 1.2].map((x, i) => (
        <group key={`rcs-x-${i}`} position={[x, 1.7, 0]}>
          <mesh rotation={[0, 0, x > 0 ? -Math.PI / 2 : Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.09, 0.22, 8]} />
            <meshStandardMaterial color="#455a64" metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* High-Detail 4-Legged Landing Gear Assembly */}
      {[
        { angle: Math.PI * 0.25, id: 'leg-ne' },
        { angle: Math.PI * 0.75, id: 'leg-nw' },
        { angle: Math.PI * 1.25, id: 'leg-sw' },
        { angle: Math.PI * 1.75, id: 'leg-se' },
      ].map((leg) => {
        const distance = 1.35;
        const footDistance = 2.3;
        const startX = Math.cos(leg.angle) * distance;
        const startZ = Math.sin(leg.angle) * distance;
        const footX = Math.cos(leg.angle) * footDistance;
        const footZ = Math.sin(leg.angle) * footDistance;

        return (
          <group key={leg.id}>
            {/* Primary Telescopic Shock Strut */}
            <mesh
              position={[(startX + footX) / 2, 0.1, (startZ + footZ) / 2]}
              rotation={[0, -leg.angle + Math.PI / 2, Math.atan2(footDistance - distance, 1.4)]}
              castShadow
            >
              <cylinderGeometry args={[0.05, 0.05, 1.9, 8]} />
              <meshStandardMaterial color="#78909c" metalness={0.85} roughness={0.2} />
            </mesh>
            {/* Wide Metallic Footpad */}
            <mesh position={[footX, -0.65, footZ]} castShadow receiveShadow>
              <cylinderGeometry args={[0.42, 0.48, 0.09, 16]} />
              <meshStandardMaterial color="#37474f" metalness={0.8} roughness={0.25} />
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
