const axios = require("axios");

const API_KEY = "fKyX4fM95arg6CqjyY9Rha9MhZ1equu2nflkiJxb"
const START_DATE = "2025-10-04"
const END_DATE = "2025-10-11"
const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${START_DATE}&end_date=${END_DATE}&detailed=false&api_key=${API_KEY}`;

async function fetchHazardousAsteroids() {
  try {
    const response = await axios.get(url);
    const data = response.data;
    const neoData = data.near_earth_objects;

    let hazardousAsteroids = [];

    for (const date in neoData) {
      const dailyAsteroids = neoData[date];
      const hazardousForDay = dailyAsteroids.filter(asteroid => asteroid.is_potentially_hazardous_asteroid);
      hazardousAsteroids = hazardousAsteroids.concat(hazardousForDay);
    }

    console.log(JSON.stringify(hazardousAsteroids));
    return hazardousAsteroids;

  } catch (error) {
    console.error('Error fetching data from NASA API:', error.message);
  }
}

fetchHazardousAsteroids();