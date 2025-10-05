function createGlowEffect(position) {
  const loader = new THREE.TextureLoader();
  const glowTexture = loader.load('/textures/glow.png'); // Texture di alone luminoso
  const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xffaa33,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });
  const glowSprite = new THREE.Sprite(glowMaterial);
  glowSprite.position.copy(position);
  glowSprite.scale.set(2, 2, 1); // Dimensione iniziale
  scene.add(glowSprite);
  return glowSprite;
}

function createImpactEffects(position) {
  // Lampo di luce
  impactLight = new THREE.PointLight(0xffffff, 2, 10, 2);
  impactLight.position.copy(position);
  scene.add(impactLight);

  // Onda d'urto
  const shockwaveGeometry = new THREE.RingGeometry(0.1, 0.5, 32);
  const shockwaveMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
  shockwave.position.copy(position);
  shockwave.lookAt(earthMesh.position);
  scene.add(shockwave);

  // Effetto di incandescenza
  const glow = createGlowEffect(position);
  return { shockwave, impactLight, glow };
}

function updateImpactEffects(dt, effects) {
  const { shockwave, impactLight, glow } = effects;

  const timeSinceImpact = clock.getElapsedTime() - impactTime;

  if (impactLight) {
    impactLight.intensity = Math.max(0, 2 * (1 - timeSinceImpact / 0.5));
    if (timeSinceImpact > 0.5) {
      scene.remove(impactLight);
      effects.impactLight = null;
    }
  }

  if (shockwave) {
    shockwave.scale.multiplyScalar(1 + dt * 5);
    shockwave.material.opacity = Math.max(0, 0.5 * (1 - timeSinceImpact / 0.7));
    if (timeSinceImpact > 0.7) {
      scene.remove(shockwave);
      effects.shockwave = null;
    }
  }

  if (glow) {
    glow.scale.multiplyScalar(1 + dt * 2); // Espansione più lenta
    glow.material.opacity = Math.max(0, 0.8 * (1 - timeSinceImpact / 1.0)); // Dissolvenza in 1 secondo
    if (timeSinceImpact > 1.0) {
      scene.remove(glow);
      effects.glow = null;
    }
  }
}