import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { addCraterVertexColor } from './objects/crater.js';
import { createExplosion, updateExplosion } from './effects/explosion.js';

export function startRenderLoop(scene, camera, renderer, earthMesh, asteroidMesh) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2.5;
  controls.maxDistance = 20;

  const earthRadius = earthMesh.geometry.parameters.radius;
  const asteroidRadius = asteroidMesh.geometry.parameters.radius;

  const vanishDist = (earthRadius + asteroidRadius) - (asteroidRadius / 2);

  const clock = new THREE.Clock();

  let asteroidRemoved = false;

  let explosionParticles = null;

  function animate() {
    const dt = clock.getDelta();
    asteroidMesh.position.x += 0.5 * dt; // movimento verso la Terra

    const distance = earthMesh.position.distanceTo(asteroidMesh.position);

    if (!asteroidRemoved && distance <= vanishDist) {
      console.log('🌀 L’asteroide è per 1/3 dentro la Terra → creo cratere e rimuovo');

      const centerDir = new THREE.Vector3()
        .subVectors(asteroidMesh.position, earthMesh.position)
        .normalize();

      const craterRadius = asteroidRadius * 1.2; 
      const craterDepth = asteroidRadius * 0.4;  

      addCraterVertexColor(earthMesh, centerDir, craterRadius, craterDepth);

      explosionParticles = createExplosion(scene, asteroidMesh.position.clone());
      scene.remove(asteroidMesh);
      asteroidRemoved = true;
    }

    if (explosionParticles) updateExplosion(explosionParticles, dt);

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}
