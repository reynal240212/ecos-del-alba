import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js";

function createTexture(width, height, drawFn) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  drawFn(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const runeTextures = {
  chest: createTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#1e282c";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#131a1d";
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    ctx.shadowColor = "#39e6f5";
    ctx.shadowBlur = 18;
    ctx.strokeStyle = "#5df8ff";
    ctx.fillStyle = "#3be7f5";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.28);
    ctx.lineTo(w * 0.68, h * 0.46);
    ctx.lineTo(w / 2, h * 0.64);
    ctx.lineTo(w * 0.32, h * 0.46);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w / 2, h * 0.46, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.52);
    ctx.lineTo(w * 0.2, h * 0.65);
    ctx.lineTo(w * 0.35, h * 0.75);
    ctx.moveTo(w * 0.7, h * 0.52);
    ctx.lineTo(w * 0.8, h * 0.65);
    ctx.lineTo(w * 0.65, h * 0.75);
    ctx.stroke();
  }),

  bracer: createTexture(256, 512, (ctx, w, h) => {
    ctx.fillStyle = "#222c30";
    ctx.fillRect(0, 0, w, h);
    ctx.shadowColor = "#39e6f5";
    ctx.shadowBlur = 14;
    ctx.strokeStyle = "#5df8ff";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";

    ctx.strokeRect(w * 0.18, h * 0.08, w * 0.64, h * 0.06);
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.28, w * 0.2, Math.PI * 0.9, Math.PI * 2.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.2);
    ctx.lineTo(w / 2, h * 0.44);
    ctx.stroke();
  }),

  tasset: createTexture(384, 512, (ctx, w, h) => {
    ctx.fillStyle = "#263236";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#4e3524";
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    ctx.shadowColor = "#39e6f5";
    ctx.shadowBlur = 16;
    ctx.strokeStyle = "#5df8ff";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(w * 0.22, h * 0.2);
    ctx.lineTo(w * 0.78, h * 0.2);
    ctx.bezierCurveTo(w * 0.88, h * 0.5, w * 0.65, h * 0.78, w / 2, h * 0.86);
    ctx.bezierCurveTo(w * 0.35, h * 0.78, w * 0.12, h * 0.5, w * 0.22, h * 0.2);
    ctx.stroke();
  }),

  face: createTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#a86a48";
    ctx.fillRect(0, 0, w, h);

    ctx.shadowColor = "#39e6f5";
    ctx.shadowBlur = 14;
    ctx.strokeStyle = "#5df8ff";
    ctx.fillStyle = "#45ebf7";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.18);
    ctx.lineTo(w * 0.57, h * 0.26);
    ctx.lineTo(w / 2, h * 0.34);
    ctx.lineTo(w * 0.43, h * 0.26);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.26, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#1b1411";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(w * 0.28, h * 0.44);
    ctx.quadraticCurveTo(w * 0.38, h * 0.4, w * 0.46, h * 0.44);
    ctx.moveTo(w * 0.72, h * 0.44);
    ctx.quadraticCurveTo(w * 0.62, h * 0.4, w * 0.54, h * 0.44);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(w * 0.37, h * 0.49, 22, 11, -0.05, 0, Math.PI * 2);
    ctx.ellipse(w * 0.63, h * 0.49, 22, 11, 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2c170d";
    ctx.beginPath();
    ctx.arc(w * 0.37, h * 0.49, 10, 0, Math.PI * 2);
    ctx.arc(w * 0.63, h * 0.49, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8d433b";
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.75, 26, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }),

  droneEye: createTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#121b1d";
    ctx.fillRect(0, 0, w, h);
    ctx.shadowColor = "#39e6f5";
    ctx.shadowBlur = 24;
    ctx.strokeStyle = "#5df8ff";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#4ef2fc";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }),
};

export function createProtagonistMaterials() {
  const skin = new THREE.MeshStandardMaterial({ color: 0xa86a48, roughness: 0.72, metalness: 0.05 });
  const faceMat = new THREE.MeshStandardMaterial({ map: runeTextures.face, roughness: 0.68 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x181210, roughness: 0.92 });
  const hairBead = new THREE.MeshStandardMaterial({ color: 0x48e8f5, emissive: 0x1da5b3, emissiveIntensity: 1.8 });

  const cuirass = new THREE.MeshStandardMaterial({
    color: 0x222c30,
    roughness: 0.38,
    metalness: 0.65,
    map: runeTextures.chest,
    emissiveMap: runeTextures.chest,
    emissive: 0x39e6f5,
    emissiveIntensity: 1.4,
  });

  const armorMetal = new THREE.MeshStandardMaterial({ color: 0x253135, roughness: 0.4, metalness: 0.65 });
  const armorTrim = new THREE.MeshStandardMaterial({ color: 0x6e5239, roughness: 0.5, metalness: 0.45 });
  const bracerMat = new THREE.MeshStandardMaterial({
    color: 0x222c30,
    roughness: 0.38,
    metalness: 0.6,
    map: runeTextures.bracer,
    emissiveMap: runeTextures.bracer,
    emissive: 0x39e6f5,
    emissiveIntensity: 1.5,
  });

  const tassetMat = new THREE.MeshStandardMaterial({
    color: 0x253135,
    roughness: 0.45,
    metalness: 0.5,
    map: runeTextures.tasset,
    emissiveMap: runeTextures.tasset,
    emissive: 0x39e6f5,
    emissiveIntensity: 1.5,
  });

  const leatherDark = new THREE.MeshStandardMaterial({ color: 0x2d1f19, roughness: 0.88 });
  const leatherBrown = new THREE.MeshStandardMaterial({ color: 0x4a3224, roughness: 0.82 });
  const runeGlow = new THREE.MeshStandardMaterial({
    color: 0x76f7ff,
    emissive: 0x2ae1f2,
    emissiveIntensity: 2.8,
    roughness: 0.2,
  });

  const droneChassis = new THREE.MeshStandardMaterial({ color: 0x2b383c, metalness: 0.82, roughness: 0.32 });
  const droneEyeMat = new THREE.MeshStandardMaterial({
    map: runeTextures.droneEye,
    emissiveMap: runeTextures.droneEye,
    emissive: 0x39e6f5,
    emissiveIntensity: 2.5,
  });

  return {
    skin, faceMat, hair, hairBead, cuirass, armorMetal, armorTrim,
    bracerMat, tassetMat, leatherDark, leatherBrown, runeGlow, droneChassis, droneEyeMat
  };
}

export function buildArcoDeLuz(mats) {
  const bow = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.32, 8), mats.leatherDark);
  handle.castShadow = true;
  bow.add(handle);

  [-0.14, 0.14].forEach((y) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.012, 6, 16), mats.runeGlow);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    bow.add(ring);
  });

  const blades = [];
  [-1, 1].forEach((dir) => {
    const limbGroup = new THREE.Group();
    limbGroup.position.y = dir * 0.16;

    const seg1 = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.34, 0.08), mats.armorMetal);
    seg1.position.set(0, dir * 0.16, -0.04);
    seg1.rotation.x = dir * 0.25;
    limbGroup.add(seg1);

    const seg2 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.42, 0.065), mats.armorMetal);
    seg2.position.set(0, dir * 0.46, -0.16);
    seg2.rotation.x = dir * -0.55;
    limbGroup.add(seg2);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.58, 0.05), mats.runeGlow);
    blade.position.set(0, dir * 0.35, -0.12);
    blade.rotation.x = dir * -0.3;
    limbGroup.add(blade);
    blades.push(blade);

    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 5), mats.runeGlow);
    tip.position.set(0, dir * 0.68, -0.22);
    tip.rotation.x = dir * -1.2;
    limbGroup.add(tip);

    bow.add(limbGroup);
  });
  bow.userData.blades = blades;

  const stringGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.82, -0.22),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -0.82, -0.22),
  ]);
  const bowString = new THREE.Line(stringGeo, new THREE.LineBasicMaterial({ color: 0x5df8ff, linewidth: 2 }));
  bow.add(bowString);
  bow.userData.bowString = bowString;

  const arrowGroup = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.1, 6), mats.runeGlow);
  shaft.rotation.x = Math.PI / 2;
  arrowGroup.add(shaft);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 4), mats.runeGlow);
  head.rotation.x = -Math.PI / 2;
  head.position.z = -0.6;
  arrowGroup.add(head);
  arrowGroup.visible = false;
  bow.add(arrowGroup);
  bow.userData.arrow = arrowGroup;

  return bow;
}

export function buildCompanionDrone(mats) {
  const drone = new THREE.Group();
  const coreGeo = new THREE.SphereGeometry(0.36, 16, 12);
  coreGeo.scale(1, 0.65, 1);
  const core = new THREE.Mesh(coreGeo, mats.droneChassis);
  core.castShadow = true;
  drone.add(core);

  const eye = new THREE.Mesh(new THREE.CircleGeometry(0.22, 20), mats.droneEyeMat);
  eye.position.set(0, 0, 0.35);
  drone.add(eye);

  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), mats.runeGlow);
  pupil.position.set(0, 0, 0.36);
  drone.add(pupil);

  const finsGroup = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
    const finPiv = new THREE.Group();
    finPiv.rotation.z = angle;

    const finBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.14), mats.droneChassis);
    finBlade.position.set(0, 0.38, 0);
    finPiv.add(finBlade);

    const thruster = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.08), mats.runeGlow);
    thruster.position.set(0, 0.5, 0.02);
    finPiv.add(thruster);

    finsGroup.add(finPiv);
  }
  drone.add(finsGroup);
  drone.userData.finsGroup = finsGroup;

  // Targeting laser beam
  const laserGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0.35),
    new THREE.Vector3(0, 0, 8.0),
  ]);
  const laserMat = new THREE.LineBasicMaterial({ color: 0x5df8ff, transparent: true, opacity: 0 });
  const laser = new THREE.Line(laserGeo, laserMat);
  drone.add(laser);
  drone.userData.laser = laser;

  // Scanning Spotlight (sweeps the fog and illuminates targets)
  const spotLight = new THREE.SpotLight(0x5df8ff, 3.8, 30, Math.PI / 6, 0.35);
  spotLight.position.set(0, 0, 0.35);
  const spotTarget = new THREE.Object3D();
  spotTarget.position.set(0, 0, 10);
  drone.add(spotLight);
  drone.add(spotTarget);
  spotLight.target = spotTarget;
  drone.userData.spotLight = spotLight;
  drone.userData.spotTarget = spotTarget;

  // Hex Shield Bubble (protects player on demand or damage)
  const shieldBubble = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.65, 2),
    new THREE.MeshBasicMaterial({ color: 0x5df8ff, transparent: true, opacity: 0.3, wireframe: true })
  );
  shieldBubble.visible = false;
  drone.add(shieldBubble);
  drone.userData.shieldBubble = shieldBubble;
  drone.userData.shieldRing = shieldBubble;

  const droneLight = new THREE.PointLight(0x52f2fc, 2.0, 7);
  droneLight.position.set(0, 0, 0.2);
  drone.add(droneLight);
  drone.userData.light = droneLight;

  return drone;
}

// First-Person ViewModel (FPS Light Bow Rig)
export function createFPSViewModel(mats) {
  const fpsRig = new THREE.Group();
  fpsRig.name = "FPS_ViewModel";

  // Light Bow attached in First Person perspective
  const bow = buildArcoDeLuz(mats);
  bow.position.set(0.28, -0.25, -0.58);
  bow.rotation.set(0.08, 0.32, -0.12);
  bow.scale.set(0.65, 0.65, 0.65);
  fpsRig.add(bow);

  // Left & right arm sleeves and gloves holding bow
  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.048, 0.36, 8), mats.bracerMat);
  leftForearm.position.set(0.24, -0.38, -0.44);
  leftForearm.rotation.set(0.7, 0.25, -0.4);
  fpsRig.add(leftForearm);

  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), mats.leatherDark);
  rightHand.position.set(0.16, -0.26, -0.32);
  fpsRig.add(rightHand);

  let fpsShootTimer = 0;
  let bobTimer = 0;
  let recoilKick = 0;

  function playShoot() {
    fpsShootTimer = 0.28;
    recoilKick = 0.14;
    bow.userData.arrow.visible = true;
  }

  function update(dt, isMoving, movingRatio = isMoving ? 1 : 0) {
    bobTimer += dt * (isMoving ? 9.5 : 2.6);
    const bobY = Math.sin(bobTimer) * (isMoving ? 0.022 : 0.004);
    const bobX = Math.cos(bobTimer * 0.5) * (isMoving ? 0.016 : 0.003);
    const breathe = Math.sin(bobTimer * 0.8) * 0.004;

    // Smooth recoil decay with spring damping
    recoilKick = THREE.MathUtils.lerp(recoilKick, 0, 1 - Math.pow(0.001, dt));

    if (fpsShootTimer > 0) {
      fpsShootTimer -= dt;
      const p = Math.max(0, fpsShootTimer / 0.28);
      bow.userData.arrow.visible = p > 0.45;
      
      const kickZ = Math.sin(p * Math.PI) * 0.09;
      const kickRot = Math.sin(p * Math.PI) * 0.16;

      bow.position.set(0.25 + bobX, -0.22 + bobY + breathe + kickRot * 0.25, -0.53 + kickZ - recoilKick);
      bow.rotation.set(0.08 - kickRot, 0.30, -0.10 + kickRot * 0.4);
      rightHand.position.set(0.14, -0.23, -0.26 - p * 0.2);
    } else {
      bow.userData.arrow.visible = false;
      bow.position.set(0.28 + bobX, -0.25 + bobY + breathe, -0.58 - recoilKick);
      bow.rotation.set(0.08, 0.32, -0.12);
      rightHand.position.set(0.18 + bobX, -0.28 + bobY + breathe, -0.38);
    }
  }

  return { fpsRig, bow, playShoot, update };
}

export function createProtagonist() {
  const root = new THREE.Group();
  root.name = "Protagonista Ecos del Alba";
  const mats = createProtagonistMaterials();

  // Contenedores jerárquicos lógicos (el render 3D visible proviene al 100% de Blender GLTF)
  const hips = new THREE.Group();
  hips.name = "hips_logic";
  hips.position.y = 1.35;
  root.add(hips);

  const torso = new THREE.Group();
  torso.name = "torso_logic";
  hips.add(torso);

  const headGroup = new THREE.Group();
  headGroup.name = "headGroup_logic";
  torso.add(headGroup);

  const leftShoulder = new THREE.Group();
  const leftHand = new THREE.Group();
  leftShoulder.add(leftHand);
  torso.add(leftShoulder);

  const rightShoulder = new THREE.Group();
  torso.add(rightShoulder);

  const arcoDeLuz = new THREE.Group();
  arcoDeLuz.name = "arcoDeLuz_logic";
  arcoDeLuz.userData = {
    arrow: new THREE.Group(),
    blades: []
  };
  leftHand.add(arcoDeLuz);

  // Companion Drone lógico (posicionado junto al hombro derecho de Aria, sin mallas procedurales flotantes)
  const drone = new THREE.Group();
  drone.name = "companion_drone_logic";
  drone.position.set(0.55, 1.76, 0.28);
  root.add(drone);

  const laserGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 8.0)
  ]);
  const laserMat = new THREE.LineBasicMaterial({ color: 0x5df8ff, transparent: true, opacity: 0 });
  const laser = new THREE.Line(laserGeo, laserMat);
  drone.add(laser);

  const spotLight = new THREE.SpotLight(0x5df8ff, 3.8, 30, Math.PI / 6, 0.35);
  spotLight.position.set(0, 0, 0.35);
  const spotTarget = new THREE.Object3D();
  spotTarget.position.set(0, 0, 10);
  drone.add(spotLight);
  drone.add(spotTarget);
  spotLight.target = spotTarget;

  const shieldBubble = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.65, 2),
    new THREE.MeshBasicMaterial({ color: 0x5df8ff, transparent: true, opacity: 0.3, wireframe: true })
  );
  shieldBubble.visible = false;
  drone.add(shieldBubble);

  const droneLight = new THREE.PointLight(0x52f2fc, 2.0, 7);
  droneLight.position.set(0, 0, 0.2);
  drone.add(droneLight);

  drone.userData = {
    laser,
    spotLight,
    spotTarget,
    shieldBubble,
    shieldRing: shieldBubble,
    light: droneLight,
    finsGroup: new THREE.Group()
  };

  const auraRing = new THREE.Mesh(
    new THREE.RingGeometry(0.65, 0.78, 32),
    new THREE.MeshBasicMaterial({ color: 0x5df8ff, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
  );
  auraRing.rotation.x = Math.PI / 2;
  auraRing.position.y = 0.04;
  auraRing.visible = false;
  root.add(auraRing);

  let shootTimer = 0;
  let droneHoverTimer = 0;

  function playShootAnim() {
    shootTimer = 0.3;
  }

  function applyUpgrades({ bowLevel = 1, droneLevel = 1, armorLevel = 1 } = {}) {
    if (droneLevel >= 2) {
      if (drone.userData.shieldBubble) drone.userData.shieldBubble.visible = true;
      if (drone.userData.light) drone.userData.light.intensity = 3.5;
    }
    if (armorLevel >= 3) {
      auraRing.visible = true;
    }
  }

  function update(dt, isMoving, moveDir, isAiming, aimVec, speedRatio = isMoving ? 1 : 0) {
    droneHoverTimer += dt * 2.8;
    if (shootTimer > 0) {
      shootTimer -= dt;
    }
    // Suave seguimiento del dron respecto a la pose de Aria
    drone.position.x = 0.55 + Math.cos(droneHoverTimer * 0.7) * 0.04;
    drone.position.y = 1.76 + Math.sin(droneHoverTimer) * 0.05;
    drone.position.z = 0.28 + (isMoving ? -0.04 : 0);

    if (drone.userData.shieldBubble && drone.userData.shieldBubble.visible) {
      drone.userData.shieldBubble.rotation.z += dt * 2.5;
    }
    if (auraRing.visible) {
      auraRing.rotation.z += dt * 1.2;
    }
  }

  return {
    root, hips, torso, headGroup, drone, arcoDeLuz,
    update, playShootAnim, applyUpgrades
  };
}
