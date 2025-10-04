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
app.get('/', (_req: any, res: any) => {
    res.send('Hello, Express with TypeScript!');
});

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

app.get("/asteroids/:id", async (req: any, res: any) => {
    const id = req.params["id"];
    if(!id) return res.status(400).send();

    const response = await axios.get(`${baseUrl}/neo/rest/v1/neo/${id}`,{ params: {
        api_key: API_KEY
    }});
    //const { links, ...data } = response.data;

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