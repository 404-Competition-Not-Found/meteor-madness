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
    if (!startDate || !endDate) return res.status(400).send();

    const response = await axios.get(`${baseUrl}/neo/rest/v1/feed`, {
        params: {
            start_date: startDate, end_date: endDate,
            detailed: false, api_key: API_KEY
        }
    });

    // Remove links from response data
    const data = removeLinks(response.data)

    // Flatten array and put date in each object
    let result: any = [];
    for (const [date, objects] of Object.entries(data.near_earth_objects) as any) {
        objects.forEach((obj: any) => {
            result.push({ ...obj, date });
        });
    }

    // Set average diameter in kilometers for each meteor
    result = result.map((obj: any) => {
        const km = obj.estimated_diameter?.kilometers;
        if (km && typeof km.estimated_diameter_min === 'number' && typeof km.estimated_diameter_max === 'number') {
            const avgDiameter = (km.estimated_diameter_min + km.estimated_diameter_max) / 2;
            return {
                ...obj,
                estimated_diameter: avgDiameter
            };
        }
        // If no diameter info, just return the object as is
        return obj;
    });

    res.send(result);
})

/** Retrieve specific asteroid data by id. */
app.get("/asteroids/:id", async (req: any, res: any) => {
    const id = req.params["id"];
    if (!id) return res.status(400).send();

    const data: any = (await axios.get(`${baseUrl}/neo/rest/v1/neo/${id}`, {
        params: {
            api_key: API_KEY
        }
    })).data;

    // Parse useful floats (returned as strings by the API)
    [
        'semi_major_axis', 'eccentricity', 'inclination',
        'ascending_node_longitude', 'perihelion_argument', 'orbital_period'
    ].forEach(key => {
        if (data.orbital_data[key] !== undefined) {
            data.orbital_data[key] = parseFloat(data.orbital_data[key]);
        }
    });

    res.send(removeLinks(data));
})

/** Calculate new asteroid semi major axis so that it impacts the earth at the
 *  given coordinates. */
app.post("/simulate/trajectory", async (req: any, res: any) => {
    const { eccentricity: e, ascending_node_longitude: theta, point } = req.body || {};
    if (
        typeof e !== 'number' || typeof theta !== 'number' ||
        !point || typeof point.x !== 'number' || typeof point.y !== 'number'
    ) return res.status(400).send()
    const { x, y } = point;

    // Calculates the new semiaxis using current e, theta and earth coordinates
    const P = x * Math.cos(theta) + y * Math.sin(theta);
    const Q = -x * Math.sin(theta) + y * Math.cos(theta);
    const alpha = (e ** 2) * ((1 - e ** 2) * (1 - Math.cos(theta)) ** 2 + (Math.sin(theta)) ** 2) - (1 - e ** 2);
    const beta = 2 * e * ((1 - e ** 2) * P * (1 - Math.cos(theta)) + Q * Math.sin(theta));
    const gamma = (1 - e ** 2) * P ** 2 + Q ** 2;

    const semi_major_axis = (-beta + Math.sqrt(beta ** 2 - 4 * alpha * gamma)) / (2 * alpha)

    res.send({ semi_major_axis });
})

/** Calculate damage data of the impact of the asteroid on the earth. */
app.post("/simulate/impact", async (req: any, res: any) => {
    const { point, diameter: d, semi_major_axis: sma } = req.body || {};
    if (
        typeof sma !== 'number' || typeof d !== 'number'
        //|| !point || typeof point.x !== 'number' || typeof point.y !== 'number'
    ) return res.status(400).send()

    // TODO: calcolare:
    //  massa persa nell'atmosfera
    //  velocità persa nell'atmosfera
    //  energia cinetica dell'asteroide -> grand gratere, materiale disperso, shockwave, airburst, tsunami

    // TODO: mock dati impatto

    // Calculate initial velocity
    //const x = new Decimal(point.x);
    //const y = new Decimal(point.y);
    const semi_major_axis = uaToMeters(new Decimal(sma));

    const SOLAR_MASS2 = new Decimal('1.988416e30');
    const GRAVITATIONAL_CONSTANT2 = new Decimal('6.67e-11');
    const r = uaToMeters(new Decimal(1));  // x.pow(2).plus(y.pow(2)).sqrt();

    const term = new Decimal(2).div(r).minus(new Decimal(1).div(semi_major_axis));

    const initialVelocity = SOLAR_MASS2.times(GRAVITATIONAL_CONSTANT2).times(term).sqrt();

    // Calculate crater radius
    const densities = (new Decimal(6/5)).pow(new Decimal(1/3))
    // Diametro in km, divido per 1000
    const diameter = (new Decimal(d).div(1000)).pow(new Decimal(0.78))
    const velocity = (new Decimal(initialVelocity)).pow(new Decimal(0.44))
    const gravity = (new Decimal(9.81)).pow(new Decimal(-0.22))
    const crater_radius: Decimal = densities.times(diameter).times(velocity).times(gravity)

    const energy = (new Decimal(2/3)).times(diameter.div(new Decimal(2))).times(new Decimal(3000)).times(velocity.pow(new Decimal(2)))

    res.send({
        crater_radius: crater_radius.toNumber(),
        victims: 1500000,
        shockwave_radius: crater_radius.times(10.2).toNumber(),
        earthquake_radius: crater_radius.times(100).toNumber(),
        earthquake_magnitude: energy.log(10).minus(new Decimal(4.8)).div(new Decimal(1.5)).toNumber(),
        money: 45000000000,
        velocity: velocity.toNumber(),
        tsunami_height: energy.div(980000).squareRoot().times((new Decimal(400)).pow(1/4)).toNumber()
    });
})

app.post("/simulate/deflect", async (req: any, res: any) => {
    const { velocity, diameter, point } = req.body || {};
    if (
        typeof velocity !== 'number' ||
        !point || typeof point.x !== 'number' || typeof point.y !== 'number'
    ) return res.status(400).send()

    // Calculate asteroid velocity after impact
    const probe_mass = new Decimal(570);    // 610kg con carburante
    const probe_velocity = new Decimal(6.6);
    // Diametro in km, divido per 1000
    const asteroid_mass = new Decimal(4/3).times(Math.PI).times( (new Decimal(diameter).div(1000)).div(2).pow(3) ).times(3000);
    const asteroid_velocity = new Decimal(10);
    const final_asteroid_velocity = probe_mass.times(probe_velocity).minus(asteroid_mass.times(asteroid_velocity)).div(probe_mass.plus(asteroid_mass))

    const SOLAR_MASS2 = new Decimal('1.988416e30');
    const GRAVITATIONAL_CONSTANT2 = new Decimal('6.67e-11');
    const distance = uaToMeters(new Decimal(1)) //new Decimal(point.x).pow(2).plus( new Decimal(point.y).pow(2) ).sqrt();

    const semi_major_axis = new Decimal(-1/2).times(distance).times(SOLAR_MASS2).times(GRAVITATIONAL_CONSTANT2).div(
        new Decimal(1/2).times( final_asteroid_velocity.pow(2) ).times(distance).minus( SOLAR_MASS2.times(GRAVITATIONAL_CONSTANT2) )
    )

    return { semi_major_axis: metersToUa(semi_major_axis).toNumber() };
})


const CONVERSION_RATIO = new Decimal(149.6).times( (new Decimal(10)).pow(9) );
const metersToUa = (m: Decimal): Decimal => m.div(CONVERSION_RATIO);
const uaToMeters = (ua: Decimal): Decimal => ua.times(CONVERSION_RATIO);



/* ==== LISTEN ============================================================== */
server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});


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