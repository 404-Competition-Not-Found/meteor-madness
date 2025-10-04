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
  console.log(response.data)
  return response.data;
}
