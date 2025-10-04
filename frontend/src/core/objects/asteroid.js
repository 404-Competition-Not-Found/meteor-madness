import * as THREE from 'three';

export function createAsteroid() {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('/textures/asteroid.jpg');

  const geometry = new THREE.SphereGeometry(0.5, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    normalMap: texture,
    metalness: 0.0,
    roughness: 1.0,
  });

  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(-5, 0, 0); 
  return mesh;
}