async function fetchOrbitData() {
  // Simula chiamata API che restituisce il file JSON mock
  const response = await fetch('./orbit-data.json');
  if (!response.ok) throw new Error('Errore nel caricamento dei dati orbitali');
  const data = await response.json();
  return data;
}

(async () => {
  const orbit = await fetchOrbitData("ceres");

  // Esempio: converto gradi → radianti
  const e = orbit.e;
  const a = orbit.a;
  const T = orbit.period;
  const i = THREE.MathUtils.degToRad(orbit.i);
  const raan = THREE.MathUtils.degToRad(orbit.raan);
  const argPeri = THREE.MathUtils.degToRad(orbit.argPeriapsis);

  console.log("Orbita caricata:", { a, e, T, i, raan, argPeri });
})();
