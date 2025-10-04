import * as THREE from 'three';

export function addCraterVertexColor(earthMesh, centerDir, craterRadius, craterDepth) {
  const geom = earthMesh.geometry;
  const radiusSphere = geom.parameters.radius;
  const craterColor = new THREE.Color(0.5, 0.45, 0.35);
  const baseColor = new THREE.Color(0.55, 0.5, 0.4);

            // scuro per il fondo del cratere
  const darkColor = new THREE.Color(0.35, 0.3, 0.25);

  // Assicurati che la geometria abbia un attributo color
  if (!geom.attributes.color) {
    const colors = [];
    for (let i = 0; i < geom.attributes.position.count; i++) {
      colors.push(1, 1, 1); // bianco di default
    }
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }

  const posAttr = geom.attributes.position;
  const colAttr = geom.attributes.color;

  for (let i = 0; i < posAttr.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(posAttr, i);

    // distanza angolare tra vertice e centro del cratere
    const angle = vertex.angleTo(centerDir);

    if (angle < craterRadius / radiusSphere) {
        const factor = 1 - angle / (craterRadius / radiusSphere);

        // Deforma la geometria verso il centro della sfera
        vertex.addScaledVector(vertex.clone().normalize(), -craterDepth * factor);
        posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);

        

        if (angle < craterRadius / radiusSphere) {
            const factor = 1 - angle / (craterRadius / radiusSphere);

            // Deforma la geometria verso il centro della sfera
            vertex.addScaledVector(vertex.clone().normalize(), -craterDepth * factor);
            posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);

            // Interpolazione tra colore chiaro e scuro in base alla distanza dal centro
            const color = baseColor.clone().lerp(darkColor, factor);
            colAttr.setXYZ(i, color.r, color.g, color.b);
        }
    }
  }

  posAttr.needsUpdate = true;
  colAttr.needsUpdate = true;
  geom.computeVertexNormals();
}
