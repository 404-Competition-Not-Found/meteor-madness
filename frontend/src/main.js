import { createScene } from './core/scene.js';
import { createEarth } from './core/objects/earth.js';
import { createSpace } from './core/objects/space.js';
import { createButtonSprite } from './core/objects/space.js';
import { createSatellite } from './core/objects/satellite.js';
import { startRenderLoop } from './core/renderer.js';
import { createAsteroid } from './core/objects/asteroid.js';
import { getAsteroids } from '../src/services/api.js';
import * as THREE from 'three';
import { createSun } from './core/objects/sun.js';
import { createAsteroidLabel } from './core/objects/asteroid.js';

const { scene, camera, renderer } = createScene();


let orbitControllerPromise 
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
      <span>${a.diameter} m</span>
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

  document.getElementById('startSimBtn').addEventListener('click', () => {
    console.log(`Starting simulation for ${asteroid.name}...`);
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
// Crea il bottone
const button = document.createElement('button');
button.innerText = 'Align trajectory';
button.id = 'floating-button';

// Applica gli stili
Object.assign(button.style, {
  position: 'fixed',
  bottom: '20px',
  left: '50%',           // centro orizzontalmente
  transform: 'translateX(-50%)', // corregge il centro
  background: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '30px', // arrotondato
  padding: '10px 20px', // larghezza dinamica in base al testo
  fontSize: '20px',
  cursor: 'pointer',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  transition: 'transform 0.2s ease',
  zIndex: '9999', // sopra al canvas
  whiteSpace: 'nowrap', // evita a capo
  userSelect: 'none',
});

// Animazioni hover
button.onmouseenter = () => (button.style.transform = 'translateX(-50%) scale(1.1)');
button.onmouseleave = () => (button.style.transform = 'translateX(-50%) scale(1)');

// Azione al click
button.onclick = async () => {
  const orbitController = await orbitControllerPromise;  // aspetta che fetch e loop siano pronti
  orbitController.updateOrbit((orbit) => {
    orbit.semi_major_axis = 0.86;
    orbit.ascending_node_longitude = 0;
  });
};

// Aggiungi al body
document.body.appendChild(button);

// --- Setup scena 3D ---
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

createSatellite().then((satelliteMesh) => {
  scene.add(satelliteMesh);
  orbitControllerPromise = startRenderLoop(scene, camera, renderer, earthMesh, asteroidLabel, asteroidMesh, sunMesh, satelliteMesh);
}).catch((err) => {
  console.error(err);
});
