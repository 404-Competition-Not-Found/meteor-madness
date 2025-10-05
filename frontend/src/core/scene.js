import * as THREE from 'three';

export function createScene() {
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 15, 100);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.style.margin = '0';
  document.body.appendChild(renderer.domElement);

  // 🔹 AmbientLight minimale (solo leggero fill)
  const ambient = new THREE.AmbientLight(0xffffff, 0.05);
  scene.add(ambient);

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer };
}
