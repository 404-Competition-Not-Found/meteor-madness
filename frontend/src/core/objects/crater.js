import * as THREE from 'three';

export function addCraterVertexColor(earthMesh, centerDir, craterRadius, craterDepth) {
  const geom = earthMesh.geometry;
  const radiusSphere = geom.parameters.radius;
  const craterColor = new THREE.Color(0.5, 0.45, 0.35); // Colore bordo
  const baseColor = new THREE.Color(0.55, 0.5, 0.4);   // Colore base
  const darkColor = new THREE.Color(0.2, 0.15, 0.1);   // Fondo cratere più scuro

  if (!geom.attributes.color) {
    const colors = [];
    for (let i = 0; i < geom.attributes.position.count; i++) {
      colors.push(1, 1, 1); // Bianco di default
    }
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }

  const posAttr = geom.attributes.position;
  const colAttr = geom.attributes.color;

  for (let i = 0; i < posAttr.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(posAttr, i);
    const angle = vertex.angleTo(centerDir);

    if (angle < craterRadius / radiusSphere) {
      const factor = 1 - angle / (craterRadius / radiusSphere);
      // Usa una funzione non lineare per una transizione più morbida
      const smoothFactor = Math.pow(factor, 2); // Esponenziale per un effetto più realistico

      // Deforma la geometria per il cratere
      vertex.addScaledVector(vertex.clone().normalize(), -craterDepth * smoothFactor);
      posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);

      // Aggiungi un bordo rialzato (rim) al cratere
      if (angle > 0.8 * (craterRadius / radiusSphere)) {
        vertex.addScaledVector(vertex.clone().normalize(), craterDepth * 0.1); // Piccolo rialzo
        posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }

      // Interpolazione colore più realistica
      let color;
      if (factor > 0.8) {
        color = craterColor.clone().lerp(baseColor, (factor - 0.8) / 0.2); // Bordo
      } else {
        color = darkColor.clone().lerp(craterColor, smoothFactor); // Fondo
      }
      colAttr.setXYZ(i, color.r, color.g, color.b);
    }
  }

  posAttr.needsUpdate = true;
  colAttr.needsUpdate = true;
  geom.computeVertexNormals();
}
