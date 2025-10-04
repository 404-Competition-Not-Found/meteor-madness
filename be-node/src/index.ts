import express from 'express';
import http from 'http';
import multer from "multer";
import cors from 'cors';
import axios from "axios";

const PORT = 8000;
const app = express();
const server = http.createServer(app);

app.use(express.static('public'));
app.use(cors());
app.use(express.json());

/* ==== NASA APIs =========================================================== */
const API_KEY = "fKyX4fM95arg6CqjyY9Rha9MhZ1equu2nflkiJxb"
const baseUrl = "https://api.nasa.gov";


/* ==== REST ================================================================ */
/** Test API. */
app.get('/', (_req: any, res: any) => {
    res.send('Hello, Express with TypeScript!');
});

/** Retrieve all asteroids approaching the Earth in a date range. */
app.get("/asteroids", async (req: any, res: any) => {
    const startDate = req.query["start_date"] || "2025-10-04";
    const endDate = req.query["end_date"] || "2025-10-11";
    if(!startDate || !endDate) return res.status(400).send();

    const response = await axios.get(`${baseUrl}/neo/rest/v1/feed`,{ params: {
        start_date: startDate, end_date: endDate,
        detailed: false, api_key: API_KEY
    }});

    res.send(removeLinks(response.data));

    /*
    const neoData = data.near_earth_objects;

    let hazardousAsteroids: any[] = [];

    for (const date in neoData) {
        const dailyAsteroids = neoData[date];
        const hazardousForDay = dailyAsteroids.filter((asteroid: any) => asteroid.is_potentially_hazardous_asteroid);
        hazardousAsteroids = hazardousAsteroids.concat(hazardousForDay);
    }

    console.log(JSON.stringify(hazardousAsteroids));
    return hazardousAsteroids;
    */
})

/** Retrieve asteroid details by id. */
app.post("/simulate", async (req: any, res: any) => {
    const { eccentricity, theta, point } = req.body || {};

    if (
        typeof eccentricity !== 'number' || typeof theta !== 'number' ||
        !point || typeof point.x !== 'number' || typeof point.y !== 'number'
    ) return res.status(400).send()

    // TODO: calculate new orbital period

    res.send({ orbital_period: reverse(eccentricity, theta, point.x, point.y) });
})

function reverse(e: number, theta: number, x: number, y: number) {
    const P = x*Math.cos(theta)+y*Math.sin(theta);
    const Q =-x*Math.sin(theta)+y*Math.cos(theta);
    const alpha = (e^2)*((1-e^2)*(1-Math.cos(theta))^2+(Math.sin(theta))^2)-(1-e^2);
    const beta = 2*e*((1-e^2)*P*(1-Math.cos(theta))+Q*Math.sin(theta));
    const gamma =(1-e^2)*P^2+Q^2;

    return (Math.sqrt(beta^2-4*alpha*gamma)-beta)/(2*alpha)
}

/* ==== LISTEN ============================================================== */
server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});


/* ==== UTILS =============================================================== */
function removeLinks(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeLinks);
  } else if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (key !== 'links') {
        result[key] = removeLinks(obj[key]);
      }
    }
    return result;
  } else {
    return obj;
  }
}