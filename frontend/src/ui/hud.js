import { getImpact } from "../services/api";

function round3(value) {
  return typeof value === 'number' ? Number(value.toFixed(3)) : value;
}


export async function updateHUD(message, consequences = {}, showReset = true, diameter = 200) {
  const data = await getImpact(diameter);

  consequences = {
    craterRadius: round3(data.crater_radius),
    asteroidSpeed: round3(data.velocity),
    victims: round3(data.victims),
    economicDamage: '$2B',
    shockWaveRadius: round3(data.shock_wave_radius),
    earthquakeRadius: round3(data.earth_quake_radius),
    earthquakeMagnitude: round3(data.earth_quake_magnitude),
    tsunamiHeight: round3(data.tsunami_height)
  };

  // Struttura delle "consequences" con icone come immagini
  const rows = [
    { icon: 'icons/crater.png', label: 'Crater Radius', key: 'craterRadius' },
    { icon: 'icons/crater.png', label: 'Asteroid Speed', key: 'asteroidSpeed' },
    { icon: 'icons/crater.png', label: 'Victims', key: 'victims' },
    { icon: 'icons/crater.png', label: 'ShockWave Radius', key: 'shockWaveRadius' },
    { icon: 'icons/crater.png', label: 'Economic Damage', key: 'economicDamage' },
    { icon: 'icons/crater.png', label: 'Earthquake Radius', key: 'earthquakeRadius' },
    { icon: 'icons/crater.png', label: 'Earthquake Magnitude', key: 'earthquakeMagnitude' },
    { icon: 'icons/crater.png', label: 'Tsunami Height', key: 'tsunamiHeight' }
  ];

  let consequencesHTML = '<div class="consequences-list">';
  rows.forEach(row => {
    if (consequences[row.key] !== undefined) {
      consequencesHTML += `
        <div class="consequence-item">
          <img class="consequence-icon" src="${row.icon}" alt="${row.label}" />
          <span class="consequence-text">${row.label}: <strong>${consequences[row.key]}</strong></span>
        </div>
      `;
    }
  });
  consequencesHTML += '</div>';

  hud.innerHTML = `
    <h2>${message}</h2>
    ${consequencesHTML}
    ${showReset ? `<button id="resetView" class="hud-btn">Back to List</button>` : ''}
  `;

  if (showReset) {
    document.getElementById('resetView').addEventListener('click', () => {
      location.reload();
    });
  }
}
