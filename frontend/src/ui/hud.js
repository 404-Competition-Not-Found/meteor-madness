export function updateHUD(message, consequences = {}, showReset = true) {
  // Struttura delle "consequences" con icone come immagini
  const rows = [
    { icon: 'icons/crater.png', label: 'Crater Diameter', key: 'craterDiameter' },
    { icon: 'icons/crater.png', label: 'Asteroid Speed', key: 'asteroidSpeed' },
    { icon: 'icons/crater.png', label: 'Casualties', key: 'casualties' },
    { icon: 'icons/crater.png', label: 'Economic Damage', key: 'economicDamage' },
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
