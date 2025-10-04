import * as THREE from 'three';

export function createSpace() {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('/textures/stars.jpg');

  const geometry = new THREE.SphereGeometry(90, 64, 64);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
  });

  return new THREE.Mesh(geometry, material);
}
