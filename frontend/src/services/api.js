export async function getAsteroids() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { name: 'Apophis', diameter: 340, velocity: 7.4, eccentricity: 0.191, semiMajor: 0.922 },
        { name: 'Bennu', diameter: 490, velocity: 28, eccentricity: 0.203, semiMajor: 1.126 },
        { name: 'Didymos', diameter: 780, velocity: 5.2, eccentricity: 0.38, semiMajor: 1.64 },
        { name: 'Golevka', diameter: 0.53, velocity: 15.1, eccentricity: 0.62, semiMajor: 2.25 }
      ]);
    }, 200);
  });
}
