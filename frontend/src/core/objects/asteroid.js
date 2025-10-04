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

  const geometry = new THREE.SphereGeometry(0.15, 64, 64);
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

