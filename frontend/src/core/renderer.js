import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

export function startRenderLoop(scene, camera, renderer, earthMesh) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2.5;
  controls.maxDistance = 20;

  const clock = new THREE.Clock();

  function animate() {
    const dt = clock.getDelta();
    earthMesh.rotation.y += 0.05 * dt;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}
