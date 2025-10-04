import { createScene } from './core/scene.js';
import { createEarth } from './core/objects/earth.js';
import { createSpace } from './core/objects/space.js';
import { addCraterVertexColor } from './core/objects/crater.js';
import { startRenderLoop } from './core/renderer.js';
import * as THREE from 'three';
import { createAsteroid } from './core/objects/asteroid.js';

const { scene, camera, renderer } = createScene();

const earthMesh = createEarth();
scene.add(earthMesh);

const spaceMesh = createSpace();
scene.add(spaceMesh);

const asteroidMesh = createAsteroid();
scene.add(asteroidMesh);

// centro del cratere (versore)
const centerDir = new THREE.Vector3(0, 0, 1);

// raggio e profondità del cratere
const craterRadius = 0.8;
const craterDepth = 0.3;

addCraterVertexColor(earthMesh, centerDir, craterRadius, craterDepth);

startRenderLoop(scene, camera, renderer, earthMesh, asteroidMesh)
