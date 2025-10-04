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

// avvia animazione
startRenderLoop(scene, camera, renderer, earthMesh, asteroidMesh);
