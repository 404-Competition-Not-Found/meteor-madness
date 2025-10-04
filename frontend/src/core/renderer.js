import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { fetchOrbitData2 } from '../services/asteroidApi.js';


function keplerSolve(e, M) {
  let E = M;
  let dE = 1;
  while (Math.abs(dE) > 1e-6) {
    dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
  }
  return E;
}

function propagateOrbit(t, elements) {
    const { a, e, i, raan, argPeriapsis, period } = elements;
    const n = (2 * Math.PI) / period;
    const M = n * t;
    const E = keplerSolve(e, M);

    const x_orb = a * (Math.cos(E) - e);
    const y_orb = a * Math.sqrt(1 - e * e) * Math.sin(E);

    const pos = new THREE.Vector3(x_orb, y_orb, 0);
    const rot = new THREE.Euler(
      THREE.MathUtils.degToRad(i),
      THREE.MathUtils.degToRad(raan),
      THREE.MathUtils.degToRad(argPeriapsis),
      'ZYX'
    );
    pos.applyEuler(rot);

    return pos;
  }

  export function startRenderLoop(scene, camera, renderer, earthMesh, asteroidMesh) {
    fetchOrbitData2().then((orbitData) => {
        const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.5;
    controls.maxDistance = 20;

    const clock = new THREE.Clock();

    function animate() {
      const elapsed = clock.getElapsedTime();
      const dt = clock.getDelta();

      controls.update();

      const pos = propagateOrbit(elapsed, orbitData);
      asteroidMesh.position.copy(pos);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  });
}
