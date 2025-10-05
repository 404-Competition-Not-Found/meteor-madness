import axios from 'axios';

let startDate = "2015-10-09"
let endDate = "2015-10-10"

export async function getAsteroids() {
  const response = await axios.get(`http://localhost:8000/asteroids`, {
    params: {
      start_date: startDate,
      end_date: endDate,
    },
  });
  return response.data;
}

export async function getImpact(diameter) {
  const response = await axios.post(`http://localhost:8000/simulate/impact`, {
    semi_major_axis: 0.86,
    diameter: diameter,
    
  });
  return response.data;
}

export async function simulateDeflect(diameter) {
  const response = await axios.post(`http://localhost:8000/simulate/deflect`, {
    semi_major_axis: 0.86,
    diameter: diameter,
    
  });
  return response.data;
}
