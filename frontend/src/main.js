import { createScene } from './core/scene.js';
import { createEarth } from './core/objects/earth.js';
import { createSpace } from './core/objects/space.js';
import { createSatellite } from './core/objects/satellite.js';
import { startRenderLoop } from './core/renderer.js';
import { createAsteroid } from './core/objects/asteroid.js';
import { getAsteroids } from '../src/services/api.js';
import * as THREE from 'three';
import { createSun } from './core/objects/sun.js';
import { createAsteroidLabel } from './core/objects/asteroid.js';

const { scene, camera, renderer } = createScene();

// --- HUD ---
const hud = document.createElement('div');
hud.id = 'hud';
document.body.appendChild(hud);

const title = document.createElement('h2');
title.textContent = 'Asteroid Catalog';
hud.appendChild(title);

const filters = document.createElement('div');
filters.className = 'asteroid-filters';
filters.innerHTML = `
  <label>
    <span>Start date</span>
    <input type="date" id="startDate" />
  </label>
  <label>
    <span>End date</span>
    <input type="date" id="endDate" />
  </label>
  <button id="loadAsteroidsBtn" class="hud-btn">Load Asteroids</button>
`;
hud.appendChild(filters);

// 🔹 Imposta default date a oggi
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
document.getElementById('startDate').value = today;
document.getElementById('endDate').value = today;

// --- Header tabella ---
// --- Header tabella (semplificato) ---
const header = document.createElement('div');
header.className = 'asteroid-header';
header.innerHTML = `
  <span>Name <span class="sort-btn" data-sort="name">⇅</span></span>
  <span>Diameter <span class="sort-btn" data-sort="diameter">⇅</span></span>
  <span>Date <span class="sort-btn" data-sort="date">⇅</span></span>
`;
hud.appendChild(header);

const asteroidListEl = document.createElement('div');
asteroidListEl.id = 'asteroidList';
asteroidListEl.className = 'asteroid-list';
hud.appendChild(asteroidListEl);

// Toggle HUD
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

// --- Stato asteroidi ---
let asteroids = [];

// 🔹 Funzione per caricare asteroidi da API
async function loadAsteroids(startDate, endDate) {
  try {
    asteroidListEl.innerHTML = '<p>Loading...</p>';
    asteroids = await getAsteroids(startDate, endDate);
    renderAsteroids(asteroids);
  } catch (error) {
    console.error('Errore durante il caricamento degli asteroidi:', error);
    asteroidListEl.innerHTML = `<p class="error">Error loading asteroids.</p>`;
  }
}

// --- Rendering lista ---
function renderAsteroids(list) {
  asteroidListEl.innerHTML = '';
  list.forEach(a => {
    const item = document.createElement('div');
    item.className = 'asteroid-item';
    item.innerHTML = `
      <span>${a.name}</span>
      <span>${a.estimated_diameter.toFixed(3)} km</span>
      <span>${a.date || '—'}</span>
    `;
    item.addEventListener('click', () => showAsteroidDetails(a));
    asteroidListEl.appendChild(item);
  });
}

// --- Dettagli asteroide ---
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

      <label class="hud-checkbox">
        <input type="checkbox" id="deflectCheckbox" />
        Deflect Asteroid
      </label>

      <button id="startSimBtn" class="hud-btn">Start Simulation</button>
    </div>
  `;

  document.getElementById('backToList').addEventListener('click', () => {
    hud.innerHTML = '';
    hud.appendChild(title);
    hud.appendChild(filters);
    hud.appendChild(header);
    hud.appendChild(asteroidListEl);
  });

  document.getElementById('startSimBtn').addEventListener('click', async () => {
    const deflect = document.getElementById('deflectCheckbox').checked;
    console.log(`Starting simulation for ${asteroid.name}, deflect: ${deflect}`);

    // --- Aggiungi satellite solo se la checkbox è selezionata ---
    let satelliteMesh = null;
    if (deflect) {
      satelliteMesh = await createSatellite();
      scene.add(satelliteMesh);

      createSatellite().then((satelliteMesh) => {
        scene.add(satelliteMesh);
        startRenderLoop(scene, camera, renderer, earthMesh, asteroidLabel, asteroidMesh, sunMesh, spaceMesh, false)      
      }).catch((err) => {
        console.error(err);
      });
    }else{
      startRenderLoop(scene, camera, renderer, earthMesh, asteroidLabel, asteroidMesh, sunMesh, spaceMesh, false)    
    }
  });
}

// --- Sorting pulsanti ---
hud.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.sort;
    asteroids.sort((a,b) =>
      typeof a[key] === 'string'
        ? a[key].localeCompare(b[key])
        : a[key] - b[key]
    );
    renderAsteroids(asteroids);
  });
});

// 🔹 Event listener per il pulsante “Load Asteroids”
document.getElementById('loadAsteroidsBtn').addEventListener('click', () => {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;

  if (!start || !end) {
    alert('Please select both start and end dates.');
    return;
  }

  loadAsteroids(start, end);
});

// --- Setup scena 3D ---
const earthMesh = createEarth();
const spaceMesh = createSpace();
const asteroidMesh = createAsteroid();
const sunMesh = createSun();
const asteroidLabel = createAsteroidLabel('Asteroid');

scene.add(earthMesh);
scene.add(sunMesh);
scene.add(asteroidLabel);
scene.add(spaceMesh);

startRenderLoop(scene, camera, renderer, earthMesh, asteroidLabel, asteroidMesh, sunMesh, spaceMesh, true)