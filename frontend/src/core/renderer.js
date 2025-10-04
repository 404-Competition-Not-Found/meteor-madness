import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { fetchOrbitData2 } from '../services/asteroidApi.js';
import { addCraterVertexColor } from './objects/crater.js';
import { createExplosion, updateExplosion } from './effects/explosion.js';

function keplerSolve(e, M) {
  let E = M;
  let dE = 1;
  while (Math.abs(dE) > 1e-6) {
    dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
  }
  return E;
}

function propagateOrbit(t, elements) {
    const { a, e, i, raan, argPeriapsis, period } = elements;
    const n = (2 * Math.PI) / period;
    const M = n * t;
    const E = keplerSolve(e, M);

    const x_orb = a * (Math.cos(E) - e);
    const y_orb = a * Math.sqrt(1 - e * e) * Math.sin(E);

    const pos = new THREE.Vector3(x_orb, y_orb, 0);
    pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(argPeriapsis)); // argomento del periapside
    pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(raan));         // nodo ascendente
    pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(i));  

    return pos;
}

function createOrbitLine(elements, sunPosition, segments = 200) {
  const { a, e, i, raan, argPeriapsis } = elements;
  const points = [];

  for (let j = 0; j <= segments; j++) {
    const M = (2 * Math.PI * j) / segments;
    const E = keplerSolve(e, M);
    const x_orb = a * (Math.cos(E) - e);
    const y_orb = a * Math.sqrt(1 - e * e) * Math.sin(E);

    const pos = new THREE.Vector3(x_orb, y_orb, 0);
    
    // Ruota per inclinazione e orientamento
    pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(argPeriapsis)); // argomento del periapside
    pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(raan));         // nodo ascendente
    pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(i));  

    // Trasla in base alla posizione del Sole
    pos.add(sunPosition);

    points.push(pos);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x47e7ff });
  const line = new THREE.LineLoop(geometry, material); // chiude la linea
  return line;
}

function updateLabelScale(sprite, camera) {
  const distance = sprite.position.distanceTo(camera.position);
  const scaleFactor = distance * 0.2; // regola 0.2 per dimensione desiderata
  sprite.scale.set(scaleFactor, scaleFactor * 0.5, 1);
}

export function startRenderLoop(scene, camera, renderer, earthMesh, asteroidLabel, asteroidMesh, sunMesh) {
  fetchOrbitData2().then((orbitData) =>{
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2;
    controls.maxDistance = 100;

    const earthRadius = earthMesh.geometry.parameters.radius;
    const asteroidRadius = asteroidMesh.geometry.parameters.radius;

    const vanishDist = (earthRadius + asteroidRadius) - (asteroidRadius / 2);

    const clock = new THREE.Clock();

    let asteroidRemoved = false;

    let explosionParticles = null;

    const orbitLine = createOrbitLine(orbitData, sunMesh.position);
    scene.add(orbitLine);

    function animate() {
      const elapsed = clock.getElapsedTime();
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
      const pos = propagateOrbit(elapsed, orbitData);
      pos.add(sunMesh.position); // trasla l'orbita attorno al Sole
      asteroidMesh.position.copy(pos);

      asteroidLabel.position.copy(asteroidMesh.position);
      asteroidLabel.position.y += 1.5; // solleva sopra l'asteroide

      updateLabelScale(asteroidLabel, camera);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  });
}