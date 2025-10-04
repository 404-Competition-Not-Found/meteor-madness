import axios from "axios";

export async function fetchOrbitData2() {
  console.log("Sto usando la fetch orbit");
  // Simula una chiamata API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        a: 31,       // semiasse maggiore (distanza media Sole→asteroide)
        e: 0.6,      // eccentricità: periapside vicino alla Terra
        i: 45,        // inclinazione in gradi
        raan: 0,
        argPeriapsis: 180, // periapside dalla parte opposta rispetto al Sole
        period: 20   // periodo orbitale in secondi
      });
    }, 500);
  });
}

export async function fetchOrbitDataByAsteroidId(id) {
  const response = await axios.get(`http://localhost:8000/asteroids/${id}`);
  console.log(response.data)
  return response.data.orbital_data;
}

