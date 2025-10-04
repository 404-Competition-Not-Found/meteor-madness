import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { addCraterVertexColor } from './objects/crater.js';
import { createExplosion, updateExplosion } from './effects/explosion.js';

function checkAsteroidSatelliteCollision(asteroidMesh, asteroidRadius, satelliteMesh) {
  // bounding box del satellite
  const satelliteBox = new THREE.Box3().setFromObject(satelliteMesh);

  // centro della sfera = posizione dell'asteroide
  const center = asteroidMesh.position;

  // troviamo il punto più vicino della box al centro della sfera
  const closestPoint = new THREE.Vector3();
  satelliteBox.clampPoint(center, closestPoint);

  // distanza tra centro sfera e punto più vicino della box
  const distance = center.distanceTo(closestPoint);

  // collisione se distanza < raggio
  return distance < asteroidRadius;
}

export function startRenderLoop(scene, camera, renderer, earthMesh, asteroidMesh, satelliteMesh) {
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

    const earthAsteroidDistance = earthMesh.position.distanceTo(asteroidMesh.position);
    const satelliteAsteroidDistance = satelliteMesh.position.distanceTo(asteroidMesh.position);

    if (checkAsteroidSatelliteCollision(asteroidMesh, asteroidRadius, satelliteMesh)) {
      console.log('Collisione asteroide / satellite rilevata!');
      // qui puoi aggiungere effetti, rimuovere oggetti, ecc.
    }

    if (!asteroidRemoved && earthAsteroidDistance <= vanishDist) {
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
