import * as THREE from 'three';

export function createEarth() {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('/textures/earth-day.jpg');

  const geometry = new THREE.SphereGeometry(1.5, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    normalMap: texture,
    metalness: 0.0,
    roughness: 1.0,
    vertexColors: true,
  });
  
  const colors = [];
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    colors.push(1, 1, 1); // bianco → non altera la texture
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}
