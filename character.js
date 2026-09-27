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

  // Drone Protective Shield Ring (Unlocked on Upgrade)
  const shieldRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.58, 0.02, 8, 28),
    new THREE.MeshBasicMaterial({ color: 0x5df8ff, transparent: true, opacity: 0.6 })
  );
  shieldRing.rotation.x = Math.PI / 2;
  shieldRing.visible = false;
  drone.add(shieldRing);
  drone.userData.shieldRing = shieldRing;

  const droneLight = new THREE.PointLight(0x52f2fc, 2.0, 7);
  droneLight.position.set(0, 0, 0.2);
  drone.add(droneLight);
  drone.userData.light = droneLight;

  return drone;
}

export function createProtagonist() {
  const root = new THREE.Group();
  root.name = "Protagonista Ecos del Alba";
  const mats = createProtagonistMaterials();

  const hips = new THREE.Group();
  hips.position.y = 1.35;
  root.add(hips);

  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.28, 12), mats.leatherDark);
  hips.add(pelvis);

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.3, 0.18, 14), mats.leatherBrown);
  belt.position.y = 0.08;
  hips.add(belt);

  const buckle = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.02, 8, 18), mats.armorMetal);
  buckle.position.set(0, 0.08, 0.31);
  hips.add(buckle);

  [-0.32, 0.32].forEach((px, i) => {
    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.18), mats.leatherDark);
    pouch.position.set(px, 0.04, 0.02);
    pouch.rotation.z = (i === 0 ? 1 : -1) * 0.1;
    hips.add(pouch);
  });

  const frontTasset = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.38, 0.04), mats.armorTrim);
  frontTasset.position.set(0, -0.16, 0.28);
  hips.add(frontTasset);

  const leftTasset = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.44, 0.32), mats.tassetMat);
  leftTasset.position.set(0.31, -0.14, 0);
  leftTasset.rotation.z = -0.16;
  hips.add(leftTasset);

  const rightTasset = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.44, 0.32), mats.armorTrim);
  rightTasset.position.set(-0.31, -0.14, 0);
  rightTasset.rotation.z = 0.16;
  hips.add(rightTasset);

  const torso = new THREE.Group();
  torso.position.y = 0.18;
  hips.add(torso);

  const midriff = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.28, 0.26, 12), mats.skin);
  midriff.position.y = 0.12;
  torso.add(midriff);

  const cuirassGeo = new THREE.CylinderGeometry(0.33, 0.28, 0.42, 14);
  cuirassGeo.scale(1.15, 1, 0.85);
  const cuirassMesh = new THREE.Mesh(cuirassGeo, mats.cuirass);
  cuirassMesh.position.y = 0.42;
  cuirassMesh.castShadow = true;
  torso.add(cuirassMesh);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 8, 16), mats.runeGlow);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.63;
  torso.add(collar);

  [-0.38, 0.38].forEach((px, i) => {
    const pauldronGroup = new THREE.Group();
    pauldronGroup.position.set(px, 0.6, 0);
    const dir = i === 0 ? -1 : 1;

    const p1Geo = new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI);
    p1Geo.scale(1, 0.7, 1.3);
    const p1 = new THREE.Mesh(p1Geo, mats.armorMetal);
    p1.rotation.z = dir * 0.4;
    p1.rotation.y = Math.PI / 2;
    pauldronGroup.add(p1);

    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.03), mats.runeGlow);
    trim.position.set(dir * 0.04, 0.06, 0);
    pauldronGroup.add(trim);
    torso.add(pauldronGroup);
  });

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.18, 10), mats.skin);
  neck.position.y = 0.7;
  torso.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.y = 0.88;
  torso.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.24, 18, 14);
  headGeo.scale(0.9, 1.05, 0.96);
  const headMesh = new THREE.Mesh(headGeo, mats.faceMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  const hairBaseGeo = new THREE.SphereGeometry(0.25, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6);
  hairBaseGeo.scale(0.94, 1.04, 0.98);
  const hairBase = new THREE.Mesh(hairBaseGeo, mats.hair);
  hairBase.position.set(0, 0.02, -0.02);
  headGroup.add(hairBase);

  // Ponytail segments
  const ponytailKnot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.08, 8), mats.hairBead);
  ponytailKnot.position.set(0, 0.19, -0.22);
  ponytailKnot.rotation.x = -0.4;
  headGroup.add(ponytailKnot);

  const ponytailSegments = [];
  let prevJoint = ponytailKnot;
  for (let s = 0; s < 6; s++) {
    const segGroup = new THREE.Group();
    segGroup.position.set(0, s === 0 ? -0.05 : -0.12, s === 0 ? -0.04 : -0.02);
    const radius = 0.046 * (1 - (s / 6) * 0.55);
    const segMesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, 0.1, 6, 8), mats.hair);
    segMesh.position.y = -0.05;
    segGroup.add(segMesh);
    prevJoint.add(segGroup);
    ponytailSegments.push(segGroup);
    prevJoint = segGroup;
  }

  // Arms
  const arms = { left: {}, right: {} };
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(0.4, 0.52, 0);
  torso.add(leftShoulder);
  arms.left.shoulder = leftShoulder;

  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.36, 8), mats.skin);
  leftUpperArm.position.y = -0.18;
  leftShoulder.add(leftUpperArm);

  const leftElbow = new THREE.Group();
  leftElbow.position.y = -0.36;
  leftShoulder.add(leftElbow);
  arms.left.elbow = leftElbow;

  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.34, 8), mats.bracerMat);
  leftForearm.position.y = -0.17;
  leftElbow.add(leftForearm);

  const leftHand = new THREE.Group();
  leftHand.position.y = -0.34;
  leftElbow.add(leftHand);
  arms.left.hand = leftHand;

  const arcoDeLuz = buildArcoDeLuz(mats);
  arcoDeLuz.position.set(0, -0.02, 0.1);
  arcoDeLuz.rotation.set(0, Math.PI / 2, -Math.PI / 12);
  leftHand.add(arcoDeLuz);

  const rightShoulder = new THREE.Group();
  rightShoulder.position.set(-0.4, 0.52, 0);
  torso.add(rightShoulder);
  arms.right.shoulder = rightShoulder;

  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.36, 8), mats.skin);
  rightUpperArm.position.y = -0.18;
  rightShoulder.add(rightUpperArm);

  const rightElbow = new THREE.Group();
  rightElbow.position.y = -0.36;
  rightShoulder.add(rightElbow);
  arms.right.elbow = rightElbow;

  const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.34, 8), mats.bracerMat);
  rightForearm.position.y = -0.17;
  rightElbow.add(rightForearm);

  // Legs
  const legs = { left: {}, right: {} };
  [
    { name: "left", pos: 0.18 },
    { name: "right", pos: -0.18 },
  ].forEach(({ name, pos }) => {
    const hipJoint = new THREE.Group();
    hipJoint.position.set(pos, -0.14, 0);
    hips.add(hipJoint);
    legs[name].hip = hipJoint;

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.5, 8), mats.leatherDark);
    thigh.position.y = -0.25;
    hipJoint.add(thigh);

    const kneeJoint = new THREE.Group();
    kneeJoint.position.y = -0.5;
    hipJoint.add(kneeJoint);
    legs[name].knee = kneeJoint;

    const kneeCap = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), mats.armorMetal);
    kneeCap.position.set(0, 0, 0.06);
    kneeJoint.add(kneeCap);

    const greave = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.085, 0.46, 8), mats.armorMetal);
    greave.position.y = -0.23;
    kneeJoint.add(greave);

    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.28), mats.leatherBrown);
    boot.position.set(0, -0.48, 0.05);
    kneeJoint.add(boot);
  });

  // Companion Drone
  const drone = buildCompanionDrone(mats);
  root.add(drone);
  drone.position.set(1.4, 2.8, -0.8);

  // Visual Upgrades Aura Ring
  const auraRing = new THREE.Mesh(
    new THREE.RingGeometry(0.65, 0.78, 32),
    new THREE.MeshBasicMaterial({ color: 0x5df8ff, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
  );
  auraRing.rotation.x = Math.PI / 2;
  auraRing.position.y = 0.04;
  auraRing.visible = false;
  root.add(auraRing);

  let walkPhase = 0;
  let shootTimer = 0;
  let droneHoverTimer = 0;

  function playShootAnim() {
    shootTimer = 0.3;
    arcoDeLuz.userData.arrow.visible = true;
  }

  function applyUpgrades({ bowLevel = 1, droneLevel = 1, armorLevel = 1 } = {}) {
    // Bow Visual Upgrades
    if (bowLevel >= 2) {
      arcoDeLuz.scale.set(1.15, 1.15, 1.15);
      arcoDeLuz.userData.blades.forEach((b) => b.scale.set(1.4, 1.1, 1.4));
    }
    if (bowLevel >= 3) {
      arcoDeLuz.scale.set(1.28, 1.28, 1.28);
    }

    // Drone Visual Upgrades
    if (droneLevel >= 2) {
      drone.userData.shieldRing.visible = true;
      drone.userData.light.intensity = 3.5;
    }
    if (droneLevel >= 3) {
      drone.scale.set(1.2, 1.2, 1.2);
    }

    // Armor Visual Upgrades
    if (armorLevel >= 2) {
      mats.cuirass.emissiveIntensity = 2.2;
      mats.bracerMat.emissiveIntensity = 2.2;
      mats.tassetMat.emissiveIntensity = 2.2;
    }
    if (armorLevel >= 3) {
      auraRing.visible = true;
      mats.cuirass.emissiveIntensity = 3.2;
    }
  }

  function update(dt, isMoving, moveDir, isAiming, aimVec, speedRatio = isMoving ? 1 : 0) {
    droneHoverTimer += dt * 2.8;

    if (shootTimer > 0) {
      shootTimer -= dt;
      const progress = Math.max(0, shootTimer / 0.3);
      arcoDeLuz.userData.arrow.visible = progress > 0.1;
      arcoDeLuz.userData.arrow.position.z = (1 - progress) * 0.4;
      leftShoulder.rotation.set(1.4, 0.2, -0.4);
      rightShoulder.rotation.set(1.2, -0.5, 0.7);
    } else {
      arcoDeLuz.userData.arrow.visible = false;
      leftShoulder.rotation.set(0.4, 0.1, -0.25);
      rightShoulder.rotation.set(-0.1, -0.1, 0.25);
    }

    if (isMoving) {
      walkPhase += dt * 10;
      const swing = Math.sin(walkPhase);
      legs.left.hip.rotation.x = swing * 0.65;
      legs.right.hip.rotation.x = -swing * 0.65;
      legs.left.knee.rotation.x = Math.max(0, -swing * 0.7);
      legs.right.knee.rotation.x = Math.max(0, swing * 0.7);
      hips.position.y = 1.35 + Math.abs(Math.cos(walkPhase)) * 0.06;
      torso.rotation.y = swing * 0.1;
    } else {
      legs.left.hip.rotation.set(0.04, 0, -0.04);
      legs.right.hip.rotation.set(-0.04, 0, 0.04);
      legs.left.knee.rotation.set(0.06, 0, 0);
      legs.right.knee.rotation.set(0.06, 0, 0);
      hips.position.y = 1.35 + Math.sin(droneHoverTimer * 0.8) * 0.02;
    }

    ponytailSegments.forEach((seg, i) => {
      seg.rotation.x = -0.25 + Math.sin(droneHoverTimer + i * 0.3) * 0.08 + (isMoving ? 0.35 : 0);
      seg.rotation.z = Math.sin(walkPhase + i * 0.2) * 0.08;
    });

    // Drone hovering physics
    drone.position.x = 1.3 + Math.cos(droneHoverTimer * 0.7) * 0.12;
    drone.position.y = 2.6 + Math.sin(droneHoverTimer) * 0.16;
    drone.position.z = -0.7 + (isMoving ? -0.2 : 0);
    drone.userData.finsGroup.rotation.z += dt * (isMoving ? 1.8 : 0.8);
    if (drone.userData.shieldRing.visible) {
      drone.userData.shieldRing.rotation.z += dt * 2.5;
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
