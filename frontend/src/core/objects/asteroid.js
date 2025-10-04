import * as THREE from 'three';

export function createAsteroidLabel(text) {
  // Canvas per disegnare il testo
  const canvas = document.createElement('canvas');
  const size = 128;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  // Sfondo trasparente
  context.clearRect(0, 0, size, size);

  // Testo bianco centrato
  context.fillStyle = 'white';
  context.font = '24px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);

  sprite.scale.set(2, 1, 1); // scala della label
  return sprite;
}


export function createAsteroid() {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('/textures/asteroid.jpg');

  const geometry = new THREE.IcosahedronGeometry(0.15, 20); // più suddivisioni
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
  mesh.position.set(-10, 0, 0);

  return mesh;
}

