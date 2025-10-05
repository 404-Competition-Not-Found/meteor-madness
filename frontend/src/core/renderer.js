import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { fetchOrbitDataByAsteroidId } from '../services/asteroidApi.js';
import { fetchOrbitData2 } from '../services/asteroidApi.js';
import { addCraterVertexColor } from './objects/crater.js';
import { createExplosion, updateExplosion } from './effects/explosion.js';
import { updateHUD } from '../ui/hud.js';

let first_loop = false;

function keplerSolve(e, M) {
  let E = M;
  let dE = 1;
  while (Math.abs(dE) > 1e-6) {
    dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
  }
  return E;
}

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

function propagateOrbit(t, elements) {
  let { semi_major_axis: a, eccentricity: e, inclination: i, ascending_node_longitude: raan, perihelion_argument: argPeriapsis, orbital_period: period } = elements;
  a *= 50
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

export function createOrbitLine(elements, sunPosition, segments = 200) {
  let { semi_major_axis: a, eccentricity: e, inclination: i, ascending_node_longitude: raan, perihelion_argument: argPeriapsis } = elements;
  a *= 50
  console.log("Ricreo la linea dell'orbita")
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

export function renderStaticScene(scene, camera, renderer){
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2;
  controls.maxDistance = 100;
  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

export function startRenderLoop(scene, camera, renderer, earthMesh, asteroidLabel, asteroidMesh, sunMesh, satelliteMesh, currentOrbitData) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2;
  controls.maxDistance = 100;

  // Abilita ombre per la Terra
  earthMesh.castShadow = true;
  earthMesh.receiveShadow = true;

  const earthRadius = earthMesh.geometry.parameters.radius;
  const asteroidRadius = asteroidMesh.geometry.parameters.radius;
  const vanishDist = (earthRadius + asteroidRadius) - (asteroidRadius / 2);

  const clock = new THREE.Clock();
  let asteroidRemoved = false;
  let impactEffects = null;
  let impactTime = null;

  scene.add(asteroidMesh);

  function createImpactEffects(position) {
    // Lampo di luce
    const impactLight = new THREE.PointLight(0xffaa33, 3, 15, 2); // Colore arancione per impatto
    impactLight.position.copy(position);
    scene.add(impactLight);

    // Onda d'urto
    const shockwaveGeometry = new THREE.RingGeometry(0.1, 0.5, 32);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa33,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    shockwave.position.copy(position);
    shockwave.lookAt(earthMesh.position);
    scene.add(shockwave);

    return { impactLight, shockwave };
  }

  function updateImpactEffects(dt, effects) {
    const { impactLight, shockwave } = effects;
    const timeSinceImpact = clock.getElapsedTime() - impactTime;

    if (impactLight) {
      impactLight.intensity = Math.max(0, 3 * (1 - timeSinceImpact / 0.5));
      if (timeSinceImpact > 0.5) {
        scene.remove(impactLight);
        effects.impactLight = null;
      }
    }

    if (shockwave) {
      shockwave.scale.multiplyScalar(1 + dt * 5);
      shockwave.material.opacity = Math.max(0, 0.5 * (1 - timeSinceImpact / 0.7));
      if (timeSinceImpact > 0.7) {
        scene.remove(shockwave);
        effects.shockwave = null;
      }
    }
  }

  function animate() {
    const elapsed = clock.getElapsedTime();
    const dt = clock.getDelta();
    asteroidMesh.position.x += 0.5 * dt;

    const earthAsteroidDistance = earthMesh.position.distanceTo(asteroidMesh.position);

    if (satelliteMesh !== null && checkAsteroidSatelliteCollision(asteroidMesh, asteroidRadius, satelliteMesh)) {
      // Gestione collisione con satellite
    }

    if (!asteroidRemoved && earthAsteroidDistance <= vanishDist) {
      console.log('🌀 L’asteroide è per 1/3 dentro la Terra → creo cratere e rimuovo');
      updateHUD('Impact Analysis');

      const centerDir = new THREE.Vector3()
        .subVectors(asteroidMesh.position, earthMesh.position)
        .normalize();

      const craterRadius = asteroidRadius * 1.2;
      const craterDepth = asteroidRadius * 0.5; // Aumenta leggermente per visibilità

      addCraterVertexColor(earthMesh, centerDir, craterRadius, craterDepth);

      impactEffects = createImpactEffects(asteroidMesh.position.clone());
      impactTime = elapsed;

      scene.remove(asteroidMesh);
      scene.remove(asteroidLabel);
      asteroidRemoved = true;
    }

    if (impactEffects) updateImpactEffects(dt, impactEffects);

    const pos = propagateOrbit(elapsed, currentOrbitData);
    pos.add(sunMesh.position);
    asteroidMesh.position.copy(pos);

    asteroidLabel.position.copy(asteroidMesh.position);
    asteroidLabel.position.y += 1.5;

    updateLabelScale(asteroidLabel, camera);
    controls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  return {
    updateOrbit(modifyFn) {
      console.log("Prima orbital data" + JSON.stringify(currentOrbitData));
      modifyFn(currentOrbitData);
      console.log(" orbital " + JSON.stringify(currentOrbitData));
    }
  };
}