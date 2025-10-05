import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function createSatelliteLabel(text) {
  const canvas = document.createElement('canvas');
  const size = 512; // alta risoluzione per nitidezza
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  context.clearRect(0, 0, size, size);

  // Testo bianco centrato e più sottile
  context.fillStyle = 'white';
  context.font = '48px "Roboto Mono", monospace'; // rimuovo il bold per renderlo sottile
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter; // evita sfocatura
  texture.magFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);

  sprite.scale.set(2, 1, 1); // scala finale in scena
  return sprite;
}

export function createSatellite() {
  // corpo centrale (cilindro)
  const bodyGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.8,
    roughness: 0.3,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

  // pannelli solari
  const panelGeometry = new THREE.BoxGeometry(0.05, 0.25, 1.0);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x0033ff,
    emissive: 0x001155,
    roughness: 0.5,
    metalness: 0.2,
  });

  const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
  leftPanel.position.set(-0.3, 0, 0);

  const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
  rightPanel.position.set(0.3, 0, 0);

  // antenna (piccolo cilindro davanti)
  const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.25, 8);
  const antennaMaterial = new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    metalness: 0.9,
    roughness: 0.2,
  });
  const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
  antenna.rotation.x = Math.PI / 2;
  antenna.position.set(0, 0, 0.3);

  // gruppo satellite
  const satellite = new THREE.Group();
  satellite.add(body);
  satellite.add(leftPanel);
  satellite.add(rightPanel);
  satellite.add(antenna);

  // posizione iniziale (opzionale)
  satellite.position.set(10, 0, 0);

  // leggera rotazione estetica
  satellite.rotation.z = Math.PI / 4;

  return satellite;
}
