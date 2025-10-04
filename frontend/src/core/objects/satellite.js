import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function createSatellite() {
  const loader = new GLTFLoader();

  // restituisce una Promise
  return new Promise((resolve, reject) => {
    loader.load(
      '/models/satellite.glb', // percorso al file .glb
      (gltf) => {
        const satellite = gltf.scene;

        // scala e posizione iniziale
        satellite.scale.set(0.01, 0.09, 0.09);
        satellite.position.set(-5, 0, 0);

        satellite.traverse((child) => {
            if (child.isMesh) {
                const edges = new THREE.EdgesGeometry(child.geometry);
                const line = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: 0xffffff })
                );
                child.add(line);
            }
        });

        resolve(satellite); // risolve la Promise con il modello
      },
      undefined,
      (error) => {
        console.error('Errore nel caricamento del satellite:', error);
        reject(error);
      }
    );
  });
}
