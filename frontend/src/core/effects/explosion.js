import * as THREE from 'three';

// Funzione per generare esplosione
export function createExplosion(scene, position, color = 0x616161, particleCount = 500) {
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const geometry = new THREE.SphereGeometry(0.02, 6, 6);
    const material = new THREE.MeshBasicMaterial({ color });
    const particle = new THREE.Mesh(geometry, material);

    particle.position.copy(position);

    // velocità casuale
    particle.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );

    scene.add(particle);
    particles.push(particle);
  }

  // ritorna le particelle così puoi aggiornare nel loop
  return particles;
}

// Funzione di update da chiamare dentro il render loop
export function updateExplosion(particles, dt) {
  particles.forEach((p, i) => {
    p.position.add(p.userData.velocity.clone().multiplyScalar(dt));
    // opzionale: riduci scala lentamente
    p.scale.multiplyScalar(0.95);
    if (p.scale.x < 0.01) {
      p.parent.remove(p);
      particles.splice(i, 1);
    }
  });
}
