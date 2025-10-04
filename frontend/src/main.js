import { createScene } from './core/scene.js';
import { createEarth } from './core/objects/earth.js';
import { createSpace } from './core/objects/space.js';
import { createSatellite } from './core/objects/satellite.js';
import { startRenderLoop } from './core/renderer.js';
import * as THREE from 'three';
import { createAsteroid } from './core/objects/asteroid.js';

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

// avvia animazione
startRenderLoop(scene, camera, renderer, earthMesh, asteroidMesh);
