import express from 'express';
import http from 'http';
import cors from 'cors';
import axios from "axios";
import Decimal from 'decimal.js';

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

app.get("/asteroids/:id", async (req: any, res: any) => {
    const id = req.params["id"];
    if(!id) return res.status(400).send();

    const response = await axios.get(`${baseUrl}/neo/rest/v1/neo/${id}`,{ params: {
        api_key: API_KEY
    }});

    res.send(removeLinks(response.data));
})

/** Calculate new asteroid semi major axis so that it impacts the earth at the
 *  given coordinates. */
app.post("/simulate/trajectory", async (req: any, res: any) => {
    const { eccentricity, ascending_node_longitude, point } = req.body || {};

    if (
        typeof eccentricity !== 'number' || typeof ascending_node_longitude !== 'number' ||
        !point || typeof point.x !== 'number' || typeof point.y !== 'number'
    ) return res.status(400).send()

    res.send({ semi_major_axis: reverse(eccentricity, ascending_node_longitude, point.x, point.y) });
})

/** Calculate damage data of the impact of the asteroid on the earth. */
app.post("/simulate/impact", async (req: any, res: any) => {
    // TODO: calcolare:
    //  velocità iniziale dell'asteroide
    //  massa persa nell'atmosfera
    //  velocità persa nell'atmosfera
    //  energia cinetica dell'asteroide -> grand gratere, materiale disperso, shockwave, airburst, tsunami

    // TODO: mock dati impatto

    res.send({
        crater_radius: 10
    });
})

/* ==== LISTEN ============================================================== */
server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});


/* ==== CALCULATIONS ======================================================== */
/** Calculates the new semiaxis for the asteroid orbit so that it
 *  intersects the earth. */
function reverse(e: number, theta: number, x: number, y: number) {
    const P = x*Math.cos(theta)+y*Math.sin(theta);
    const Q =-x*Math.sin(theta)+y*Math.cos(theta);
    const alpha = (e**2)*((1-e**2)*(1-Math.cos(theta))**2+(Math.sin(theta))**2)-(1-e**2);
    const beta = 2*e*((1-e**2)*P*(1-Math.cos(theta))+Q*Math.sin(theta));
    const gamma =(1-e**2)*P**2+Q**2;

    return (-beta+Math.sqrt(beta**2-4*alpha*gamma))/(2*alpha)
}

const SOLAR_MASS = 1.988416*10**30
const GRAVITATIONAL_CONSTANT = 6.67*10**-11
function initialMeteorVelocity(x: number, y: number, semi_major_axis: number) {
    const meteor_sun_distance = Math.sqrt(x**2+y**2);
    return Math.sqrt(SOLAR_MASS*GRAVITATIONAL_CONSTANT*((2/meteor_sun_distance)-(1/semi_major_axis)))
}

const SOLAR_MASS2 = new Decimal('1.988416e30');
const GRAVITATIONAL_CONSTANT2 = new Decimal('6.67e-11');
function initialMeteorVelocity2(_x: number, _y: number, _semi_major_axis: number) {
  const x = new Decimal(_x);
  const y = new Decimal(_y);
  const semi_major_axis = new Decimal(_semi_major_axis);

  const r = x.pow(2).plus(y.pow(2)).sqrt();
  const term = new Decimal(2).div(r).minus(new Decimal(1).div(semi_major_axis));
  const result = SOLAR_MASS2.times(GRAVITATIONAL_CONSTANT2).times(term).sqrt();

  return result.toString();
}

/* ==== UTILS =============================================================== */
/** Removes the "links" key recursively from a JSON object. */
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