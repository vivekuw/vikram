import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Polyfill document/window/FileReader for GLTFExporter in Node.js environment
if (typeof document === 'undefined') {
  global.document = {
    createElement: () => ({ getContext: () => null }),
  };
}
if (typeof FileReader === 'undefined') {
  global.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onload) this.onload();
      });
    }
  };
}

function buildVikram3DScene() {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'VikramLanderRoot';

  // 1. Central Main Spacecraft Bus (Golden Foil Envelope)
  const bodyGeo = new THREE.BoxGeometry(2.2, 1.4, 2.2);
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xe0ac00,
    metalness: 0.85,
    roughness: 0.25,
    name: 'GoldFoilMaterial',
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, goldMat);
  bodyMesh.position.set(0, 1.2, 0);
  bodyMesh.name = 'LanderBus';
  rootGroup.add(bodyMesh);

  // 2. Solar Panels (Deep Blue Metallic)
  const solarMat = new THREE.MeshStandardMaterial({
    color: 0x001845,
    metalness: 0.9,
    roughness: 0.1,
    name: 'SolarPanelMaterial',
  });

  [-1.12, 1.12].forEach((x, i) => {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.2, 1.8), solarMat);
    sp.position.set(x, 1.2, 0);
    sp.name = `SolarPanelX_${i}`;
    rootGroup.add(sp);
  });

  [-1.12, 1.12].forEach((z, i) => {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.04), solarMat);
    sp.position.set(0, 1.2, z);
    sp.name = `SolarPanelZ_${i}`;
    rootGroup.add(sp);
  });

  // 3. Top Deck Equipment Platform
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.6, roughness: 0.4 });
  const deckMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.1, 8), deckMat);
  deckMesh.position.set(0, 1.95, 0);
  deckMesh.name = 'TopDeckPlatform';
  rootGroup.add(deckMesh);

  // 4. Dish Antenna Structure
  const dishGroup = new THREE.Group();
  dishGroup.position.set(0.5, 2.15, 0.5);

  const mastMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e0, metalness: 0.9 });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), mastMat);
  mast.position.set(0, 0.15, 0);
  dishGroup.add(mast);

  const dishMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, side: THREE.DoubleSide, metalness: 0.8 });
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.4), dishMat);
  dish.position.set(0, 0.3, 0);
  dish.rotation.x = 0.4;
  dishGroup.add(dish);
  dishGroup.name = 'DishAntenna';
  rootGroup.add(dishGroup);

  // 5. Instrument Bays & Cameras
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.7 });
  const instBox = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.4), boxMat);
  instBox.position.set(-0.5, 2.1, -0.4);
  instBox.name = 'PayloadBay';
  rootGroup.add(instBox);

  // 6. Main Engine Thruster Nozzles (Four Nozzles)
  const engineMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, metalness: 0.95, roughness: 0.1, side: THREE.DoubleSide });
  [-0.5, 0.5].forEach((x) => {
    [-0.5, 0.5].forEach((z) => {
      const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 16, 1, true), engineMat);
      nozzle.position.set(x, 0.35, z);
      nozzle.name = `MainNozzle_${x}_${z}`;
      rootGroup.add(nozzle);
    });
  });

  // 7. Four Landing Legs & Foot Pads
  const legMat = new THREE.MeshStandardMaterial({ color: 0x718096, metalness: 0.8 });
  const footMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.7, roughness: 0.3 });

  const legs = [
    { angle: Math.PI * 0.25, id: 'leg-ne' },
    { angle: Math.PI * 0.75, id: 'leg-nw' },
    { angle: Math.PI * 1.25, id: 'leg-sw' },
    { angle: Math.PI * 1.75, id: 'leg-se' },
  ];

  legs.forEach((leg) => {
    const distance = 1.35;
    const footDistance = 2.1;
    const startX = Math.cos(leg.angle) * distance;
    const startZ = Math.sin(leg.angle) * distance;
    const footX = Math.cos(leg.angle) * footDistance;
    const footZ = Math.sin(leg.angle) * footDistance;

    const legGroup = new THREE.Group();
    legGroup.name = leg.id;

    // Strut
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8), legMat);
    strut.position.set((startX + footX) / 2, 0.1, (startZ + footZ) / 2);
    strut.rotation.set(0, -leg.angle + Math.PI / 2, Math.atan2(footDistance - distance, 1.4));
    legGroup.add(strut);

    // Foot Pad
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.08, 16), footMat);
    foot.position.set(footX, -0.65, footZ);
    foot.name = `${leg.id}-footpad`;
    legGroup.add(foot);

    rootGroup.add(legGroup);
  });

  return rootGroup;
}

function exportGLB() {
  const scene = buildVikram3DScene();
  const exporter = new GLTFExporter();

  const outputDir = path.resolve('public', 'models', 'vikram');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'vikram-lander.gltf');

  exporter.parse(
    scene,
    (gltf) => {
      const output = JSON.stringify(gltf, null, 2);
      fs.writeFileSync(outputPath, output);
      console.log(`Successfully exported Vikram GLTF model to ${outputPath} (${output.length} bytes)`);
    },
    (error) => {
      console.error('Error exporting GLTF:', error);
    },
    { binary: false }
  );
}

exportGLB();
