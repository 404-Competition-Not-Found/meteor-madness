import * as THREE from 'three';

export function createAsteroid() {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('/textures/asteroid.jpg');

  const geometry = new THREE.IcosahedronGeometry(0.5, 20); // più suddivisioni
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  // funzione di rumore semplice basata su sin/cos per avere continuità
  function noise(x, y, z) {
    return Math.sin(x * 10) * 0.03 + Math.cos(y * 12) * 0.03 + Math.sin(z * 7) * 0.03;
  }

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);

    const offset = noise(vertex.x, vertex.y, vertex.z);
    vertex.addScaledVector(vertex.clone().normalize(), offset);

    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  geometry.computeVertexNormals();

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