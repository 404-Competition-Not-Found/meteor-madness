export async function fetchOrbitData() {
  // Simula chiamata API che restituisce il file JSON mock
  const response = await fetch('./orbit-data.json');
  if (!response.ok) throw new Error('Errore nel caricamento dei dati orbitali');
  const data = await response.json();
  return data;
}

export async function fetchOrbitData2() {
  console.log("Sto usando la fetch orbit");
  // Simula una chiamata API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        a: 30,       // semiasse maggiore (distanza media Sole→asteroide)
        e: 0.6,      // eccentricità: periapside vicino alla Terra
        i: 45,        // inclinazione in gradi
        raan: 0,
        argPeriapsis: 180, // periapside dalla parte opposta rispetto al Sole
        period: 5   // periodo orbitale in secondi
      });
    }, 500);
  });
}
