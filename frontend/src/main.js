import { createScene } from './core/scene.js';
import { createEarth } from './core/objects/earth.js';
import { createSpace } from './core/objects/space.js';
import { addCraterVertexColor } from './core/objects/crater.js';
import { startRenderLoop } from './core/renderer.js';
import { createAsteroid } from './core/objects/asteroid.js';
import { getAsteroids } from '../src/services/api.js';
import * as THREE from 'three';

const { scene, camera, renderer } = createScene();

const earthMesh = createEarth();
scene.add(earthMesh);

const spaceMesh = createSpace();
scene.add(spaceMesh);

const asteroidMesh = createAsteroid();
scene.add(asteroidMesh);

const centerDir = new THREE.Vector3(0, 0, 1);
const craterRadius = 0.8;
const craterDepth = 0.3;
addCraterVertexColor(earthMesh, centerDir, craterRadius, craterDepth);

// --- HUD ---
const hud = document.createElement('div');
hud.id = 'hud';
document.body.appendChild(hud);

const title = document.createElement('h2');
title.textContent = 'Asteroid Catalog';
hud.appendChild(title);

const header = document.createElement('div');
header.className = 'asteroid-header';
header.innerHTML = `
  <span>Name <span class="sort-btn" data-sort="name">⇅</span></span>
  <span>Diameter <span class="sort-btn" data-sort="diameter">⇅</span></span>
  <span>Velocity <span class="sort-btn" data-sort="velocity">⇅</span></span>
  <span>e <span class="sort-btn" data-sort="eccentricity">⇅</span></span>
  <span>a <span class="sort-btn" data-sort="semiMajor">⇅</span></span>
`;
hud.appendChild(header);

const asteroidListEl = document.createElement('div');
asteroidListEl.id = 'asteroidList';
asteroidListEl.className = 'asteroid-list';
hud.appendChild(asteroidListEl);

// Toggle button
const hudToggle = document.createElement('div');
hudToggle.id = 'hudToggle';
hudToggle.textContent = '≡';
document.body.appendChild(hudToggle);

let hudOpen = true;
hudToggle.addEventListener('click', () => {
  hudOpen = !hudOpen; 
  hud.classList.toggle('closed', !hudOpen); 
  hudToggle.style.right = hudOpen ? '350px' : '0px';
});

// --- Popola lista con mock API ---
let asteroids = [];
async function loadAsteroids() {
  asteroids = await getAsteroids();
  renderAsteroids(asteroids);
}

function renderAsteroids(list) {
  asteroidListEl.innerHTML = '';
  list.forEach(a => {
    const item = document.createElement('div');
    item.className = 'asteroid-item';
    item.innerHTML = `
      <span>${a.name}</span>
      <span>${a.diameter} m</span>
      <span>${a.velocity} km/s</span>
      <span>${a.eccentricity}</span>
      <span>${a.semiMajor} AU</span>
    `;
    item.addEventListener('click', () => showAsteroidDetails(a));
    asteroidListEl.appendChild(item);
  });
}

// --- Vista dettagliata di un singolo asteroide ---
function showAsteroidDetails(asteroid) {
  hud.innerHTML = `
    <div class="asteroid-detail">
      <button id="backToList" class="hud-btn small">← Back to List</button>
      <h2>${asteroid.name}</h2>
      <div class="asteroid-data">
        <p><strong>Diameter:</strong> ${asteroid.diameter} m</p>
        <p><strong>Velocity:</strong> ${asteroid.velocity} km/s</p>
        <p><strong>Eccentricity:</strong> ${asteroid.eccentricity}</p>
        <p><strong>Semi-Major Axis:</strong> ${asteroid.semiMajor} AU</p>
        <p><strong>Inclination:</strong> ${asteroid.inclination ?? 'N/A'}</p>
      </div>
      <button id="startSimBtn" class="hud-btn">Start Simulation</button>
    </div>
  `;

  document.getElementById('backToList').addEventListener('click', () => {
    hud.innerHTML = ''; // ricostruisci la lista
    hud.appendChild(title);
    hud.appendChild(header);
    hud.appendChild(asteroidListEl);
  });

  document.getElementById('startSimBtn').addEventListener('click', () => {
    console.log(`Starting simulation for ${asteroid.name}...`);
    // qui puoi inserire la tua funzione di simulazione
  });
}

// --- Sorting pulsanti ---
hud.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.sort;
    asteroids.sort((a,b) => typeof a[key] === 'string' ? a[key].localeCompare(b[key]) : a[key]-b[key]);
    renderAsteroids(asteroids);
  });
});

loadAsteroids();

// --- Animazione ---
startRenderLoop(scene, camera, renderer, earthMesh);
