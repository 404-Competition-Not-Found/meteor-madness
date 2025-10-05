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
  renderer.shadowMap.enabled = true; // Abilita le ombre
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Ombre morbide per realismo
  document.body.style.margin = '0';
  document.body.appendChild(renderer.domElement);

  // 🔹 AmbientLight: riduci l'intensità per maggiore contrasto
  const ambient = new THREE.AmbientLight(0xffffff, 0.2); // Intensità ridotta
  scene.add(ambient);

  // 🔹 DirectionalLight: ottimizzata per il Sole
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(20, 10, 15); // Posizione per illuminare la Terra frontalmente
  directionalLight.castShadow = true; // Abilita ombre
  directionalLight.shadow.mapSize.width = 1024; // Risoluzione ombre
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;
  scene.add(directionalLight);

  // 🔹 Aggiungi una luce di supporto (opzionale)
  const secondaryLight = new THREE.PointLight(0xffffff, 0.3, 50);
  secondaryLight.position.set(0, 10, 10); // Posizione per illuminare il cratere da un angolo diverso
  scene.add(secondaryLight);

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer };
}