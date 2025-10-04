import * as THREE from 'three';

export function createSun() {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('/textures/sun.jpg');

  const geometry = new THREE.SphereGeometry(0.23, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    emissive: new THREE.Color(0xffffaa),
    emissiveIntensity: 1.5,
    metalness: 0,
    roughness: 1
  });

  const mesh = new THREE.Mesh(geometry, material);

  // Posizione del Sole nella scena
  mesh.position.set(-50, 0, 0);

  // Luce direzionale (simula il Sole)
  const sunLight = new THREE.DirectionalLight(0xffffff, 3);
  sunLight.position.copy(mesh.position); // parte dal Sole
  sunLight.target.position.set(0, 0, 0); // punta verso Terra
  mesh.add(sunLight);
  mesh.add(sunLight.target);



  return mesh;
}
