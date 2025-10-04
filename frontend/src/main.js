import { createScene } from './core/scene.js';
import { createEarth } from './core/objects/earth.js';
import { createSpace } from './core/objects/space.js';
import { createSatellite } from './core/objects/satellite.js';
import { startRenderLoop } from './core/renderer.js';
import * as THREE from 'three';
import { createAsteroid } from './core/objects/asteroid.js';
import { createSun } from './core/objects/sun.js';
import { createAsteroidLabel } from './core/objects/asteroid.js'

const { scene, camera, renderer } = createScene();

createSatellite().then((satellite) => {
  scene.add(satellite);
}).catch((err) => {
  console.error(err);
});

const earthMesh = createEarth();
scene.add(earthMesh);

const spaceMesh = createSpace();
scene.add(spaceMesh);

const asteroidMesh = createAsteroid();
scene.add(asteroidMesh);

const sunMesh = createSun();
scene.add(sunMesh);

const asteroidLabel = createAsteroidLabel('Asteroid');
scene.add(asteroidLabel);

// centro del cratere (versore)
const centerDir = new THREE.Vector3(0, 0, 1);

// raggio e profondità del cratere
const craterRadius = 0.8;
const craterDepth = 0.3;

addCraterVertexColor(earthMesh, centerDir, craterRadius, craterDepth);

startRenderLoop(scene, camera, renderer, earthMesh, asteroidLabel, asteroidMesh, sunMesh)
