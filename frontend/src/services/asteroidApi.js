export async function fetchOrbitData() {
  // Simula chiamata API che restituisce il file JSON mock
  const response = await fetch('./orbit-data.json');
  if (!response.ok) throw new Error('Errore nel caricamento dei dati orbitali');
  const data = await response.json();
  return data;
}

export async function fetchOrbitData2() {
  console.log("Sto usando la fetch orbit")
  // Simula una chiamata API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        a: 4.0,         // semiasse maggiore
        e: 0.5,         // eccentricità
        i: 15,          // inclinazione (°)
        raan: 60,       // longitudine nodo ascendente (°)
        argPeriapsis: 40, // argomento del perielio (°)
        period: 10      // periodo orbitale in secondi
      });
    }, 500);
  });
}