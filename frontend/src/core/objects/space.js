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

export function createButtonSprite(text, options = {}) {
  const {
    width = 256,
    height = 64,
    bgColor = '#007bff',
    textColor = '#ffffff',
    font = 'bold 28px Arial',
    borderRadius = 20,
    padding = 10,
  } = options;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Draw rounded rectangle background
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  const r = borderRadius;
  ctx.moveTo(r, 0);
  ctx.lineTo(width - r, 0);
  ctx.quadraticCurveTo(width, 0, width, r);
  ctx.lineTo(width, height - r);
  ctx.quadraticCurveTo(width, height, width - r, height);
  ctx.lineTo(r, height);
  ctx.quadraticCurveTo(0, height, 0, height - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // Draw text
  ctx.fillStyle = textColor;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  // Create texture and sprite
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);

  // Scale the sprite (world size)
  const scaleX = 2.5;
  const scaleY = (scaleX * height) / width;
  sprite.scale.set(scaleX, scaleY, 1);

  // Custom metadata (for click detection later)
  sprite.userData.isButton = true;
  sprite.userData.text = text;

  return sprite;
}

