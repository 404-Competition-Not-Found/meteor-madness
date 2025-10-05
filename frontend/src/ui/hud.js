import { getImpact } from "../services/api";

export function round3(value) {
  // Converte il valore in numero, se possibile
  const num = parseFloat(value);
  // Verifica se il valore è un numero valido
  return isNaN(num) ? value : Number(num.toFixed(3));
}

export async function updateHUD(message, consequences = {}, showReset = true) {
  const data = await getImpact();

  console.log(data);

  consequences = {
    craterRadius: round3(data.crater_radius) + " m",
    asteroidSpeed: round3(data.velocity) + " m/s",
    victims: round3(data.victims),
    economicDamage: '$2B',
    shockWaveRadius: round3(data.shock_wave_radius),
    earthquakeRadius: round3(data.earth_quake_radius),
    earthquakeMagnitude: round3(data.earth_quake_magnitude),
    tsunamiHeight: round3(data.tsunami_height) + " m"
  };

  // Struttura delle "consequences" con icone come immagini
  const rows = [
    { icon: 'icons/crater.png', label: 'Crater Radius', key: 'craterRadius' },
    { icon: 'icons/asteroid.png', label: 'Asteroid Speed', key: 'asteroidSpeed' },
    { icon: 'icons/people.png', label: 'Victims', key: 'victims' },
    { icon: 'icons/shockwave.png', label: 'ShockWave Radius', key: 'shockWaveRadius' },
    { icon: 'icons/cost.png', label: 'Economic Damage', key: 'economicDamage' },
    { icon: 'icons/earthquake.png', label: 'Earthquake Magnitude', key: 'earthquakeMagnitude' },
    { icon: 'icons/tsunami.png', label: 'Tsunami Height', key: 'tsunamiHeight' }
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
    ${showReset ? `<button id="resetView" class="hud-btn" style="margin-top: 20px;">Back to List</button>` : ''}
  `;

  if (showReset) {
    document.getElementById('resetView').addEventListener('click', () => {
      location.reload();
    });
  }
}
