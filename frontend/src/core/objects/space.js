import * as THREE from 'three';

export function createSpace() {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('/textures/stars.jpg');

  // Ripetizione della texture
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4); // numero di ripetizioni orizzontale e verticale

  const geometry = new THREE.SphereGeometry(300, 64, 64);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
  });

  return new THREE.Mesh(geometry, material);
}
