import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js";

function part(geometry, material) {
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

function joint(material, radius = 0.12) {
  return part(new THREE.SphereGeometry(radius, 12, 8), material);
}

function limb(length, radius, material) {
  const pivot = new THREE.Group();
  const bone = part(new THREE.CylinderGeometry(radius, radius, length, 8), material);
  bone.position.y = -length / 2;
  pivot.add(bone);
  const end = joint(material, radius * 1.18);
  end.position.y = -length;
  pivot.add(end);
  return { pivot, end, length };
}

function createDrone(dark, glow) {
  const drone = new THREE.Group();
  const core = part(new THREE.SphereGeometry(0.24, 12, 8), dark);
  core.scale.z = 0.65;
  drone.add(core);
  const eye = part(new THREE.SphereGeometry(0.11, 12, 8), glow);
  eye.position.z = 0.2;
  drone.add(eye);

  const finsGroup = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const fin = part(new THREE.BoxGeometry(0.08, 0.5, 0.1), dark);
    fin.position.y = 0.42;
    const holder = new THREE.Group();
    holder.rotation.z = i * Math.PI / 2;
    holder.add(fin);
    finsGroup.add(holder);
  }
  drone.add(finsGroup);
  const light = new THREE.PointLight(0x63f4ff, 2.2, 6);
  drone.add(light);
  drone.userData.finsGroup = finsGroup;
  drone.userData.light = light;
  return drone;
}

function createBow(glow) {
  const bow = new THREE.Group();
  const upper = part(new THREE.TorusGeometry(0.58, 0.045, 6, 18, Math.PI * 0.72), glow);
  upper.rotation.z = Math.PI * 0.14;
  upper.position.y = 0.28;
  bow.add(upper);
  const lower = upper.clone();
  lower.rotation.z = Math.PI * 1.14;
  lower.position.y = -0.28;
  bow.add(lower);
  const string = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.72, 0),
      new THREE.Vector3(0, 0, -0.12),
      new THREE.Vector3(0, -0.72, 0),
    ]),
    new THREE.LineBasicMaterial({ color: 0xd9fdff }),
  );
  bow.add(string);
  bow.userData.bowString = string;
  bow.userData.arrow = new THREE.Object3D();
  bow.userData.arrow.visible = false;
  bow.add(bow.userData.arrow);
  return bow;
}

export function createProtagonist() {
  const root = new THREE.Group();
  root.name = "Stickman del Alba";

  const dark = new THREE.MeshStandardMaterial({ color: 0x172025, roughness: 0.55, metalness: 0.3 });
  const glow = new THREE.MeshStandardMaterial({
    color: 0x7af6ff,
    emissive: 0x1fb8c7,
    emissiveIntensity: 2.8,
    roughness: 0.25,
  });
  const face = new THREE.MeshStandardMaterial({ color: 0x26343a, roughness: 0.7 });

  const hips = new THREE.Group();
  hips.position.y = 1.35;
  root.add(hips);
  const hipBar = part(new THREE.CapsuleGeometry(0.14, 0.42, 4, 8), dark);
  hipBar.rotation.z = Math.PI / 2;
  hips.add(hipBar);
  const hipRune = joint(glow, 0.13);
  hipRune.position.z = 0.12;
  hips.add(hipRune);

  const torso = new THREE.Group();
  torso.position.y = 0.18;
  hips.add(torso);
  const spine = part(new THREE.CapsuleGeometry(0.13, 0.75, 5, 8), dark);
  spine.position.y = 0.48;
  torso.add(spine);
  const chest = part(new THREE.CapsuleGeometry(0.13, 0.72, 5, 8), dark);
  chest.position.y = 0.72;
  chest.rotation.z = Math.PI / 2;
  torso.add(chest);
  const chestRune = part(new THREE.TorusGeometry(0.16, 0.035, 6, 16), glow);
  chestRune.position.set(0, 0.58, 0.15);
  torso.add(chestRune);

  const neck = part(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 8), dark);
  neck.position.y = 1.06;
  torso.add(neck);
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.38;
  torso.add(headGroup);
  const head = part(new THREE.SphereGeometry(0.29, 16, 12), face);
  headGroup.add(head);
  const visor = part(new THREE.BoxGeometry(0.3, 0.055, 0.035), glow);
  visor.position.set(0, 0.035, 0.27);
  headGroup.add(visor);

  const arms = {};
  [-1, 1].forEach((side) => {
    const name = side < 0 ? "left" : "right";
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.48, 0.78, 0);
    torso.add(shoulder);
    shoulder.add(joint(glow, 0.13));
    const upper = limb(0.6, 0.075, dark);
    shoulder.add(upper.pivot);
    const elbow = new THREE.Group();
    elbow.position.y = -0.6;
    upper.pivot.add(elbow);
    elbow.add(joint(glow, 0.11));
    const lower = limb(0.57, 0.065, dark);
    elbow.add(lower.pivot);
    arms[name] = { shoulder, elbow, lower };
  });

  const legs = {};
  [-1, 1].forEach((side) => {
    const name = side < 0 ? "left" : "right";
    const hip = new THREE.Group();
    hip.position.x = side * 0.22;
    hips.add(hip);
    hip.add(joint(glow, 0.12));
    const upper = limb(0.72, 0.085, dark);
    hip.add(upper.pivot);
    const knee = new THREE.Group();
    knee.position.y = -0.72;
    upper.pivot.add(knee);
    knee.add(joint(glow, 0.11));
    const lower = limb(0.68, 0.075, dark);
    knee.add(lower.pivot);
    const foot = part(new THREE.BoxGeometry(0.2, 0.1, 0.38), dark);
    foot.position.set(0, -0.72, 0.1);
    knee.add(foot);
    legs[name] = { hip, knee };
  });

  const arcoDeLuz = createBow(glow);
  arcoDeLuz.position.set(0, -0.48, 0.14);
  arcoDeLuz.rotation.z = Math.PI / 2;
  arms.left.elbow.add(arcoDeLuz);

  const drone = createDrone(dark, glow);
  drone.position.set(1.25, 2.55, -0.65);
  root.add(drone);

  let walkPhase = 0;
  let shootTimer = 0;
  let lifeTime = 0;
  let motion = 0;

  function playShootAnim() {
    shootTimer = 0.3;
  }

  function update(dt, isMoving, moveDir, isAiming, aimVec, speedRatio = isMoving ? 1 : 0) {
    lifeTime += dt;
    shootTimer = Math.max(0, shootTimer - dt);
    const blend = 1 - Math.exp(-14 * dt);
    motion = THREE.MathUtils.lerp(motion, speedRatio, 1 - Math.exp(-12 * dt));
    walkPhase += dt * 9 * motion;
    const stride = Math.sin(walkPhase) * motion;
    const bounce = (1 - Math.cos(walkPhase * 2)) * 0.018 * motion;
    hips.position.y = 1.49 + bounce + Math.sin(lifeTime * 2) * 0.015 * (1 - motion);
    hips.rotation.y = stride * 0.04;
    hips.rotation.z = stride * 0.015;
    const ease = (rotation, axis, target) => { rotation[axis] += (target - rotation[axis]) * blend; };
    for (const [name, offset] of [["left", 0], ["right", Math.PI]]) {
      const phase = walkPhase + offset;
      ease(legs[name].hip.rotation, "x", Math.sin(phase) * 0.8 * motion - 0.04);
      ease(legs[name].knee.rotation, "x", 0.08 + Math.pow(Math.max(0, Math.sin(phase - 0.65)), 2) * 1.05 * motion);
    }
    torso.rotation.z = -stride * 0.025;
    torso.rotation.y = -stride * 0.06;
    torso.rotation.x = motion * 0.1;
    headGroup.rotation.z = stride * 0.025;

    if (shootTimer > 0) {
      ease(arms.left.shoulder.rotation, "x", -1.42);
      ease(arms.left.shoulder.rotation, "y", 0.1);
      ease(arms.left.shoulder.rotation, "z", -0.28);
      ease(arms.left.elbow.rotation, "x", -0.15);
      ease(arms.right.shoulder.rotation, "x", -1.18);
      ease(arms.right.shoulder.rotation, "y", -0.35);
      ease(arms.right.shoulder.rotation, "z", 0.72);
      ease(arms.right.elbow.rotation, "x", -1.35);
      arcoDeLuz.scale.setScalar(1 + Math.sin((shootTimer / 0.3) * Math.PI) * 0.18);
    } else {
      for (const [name, sign] of [["left", -1], ["right", 1]]) {
        ease(arms[name].shoulder.rotation, "x", 0.08 + sign * stride * 0.7);
        ease(arms[name].shoulder.rotation, "y", 0);
        ease(arms[name].shoulder.rotation, "z", sign * (0.12 + motion * 0.08));
        ease(arms[name].elbow.rotation, "x", -0.22 - motion * 0.35 - sign * stride * 0.16);
      }
      arcoDeLuz.scale.setScalar(1);
    }

    drone.position.set(
      1.25 + Math.cos(lifeTime * 1.4) * 0.12,
      2.55 + Math.sin(lifeTime * 2.4) * 0.15,
      -0.65,
    );
    drone.userData.finsGroup.rotation.z += dt * 1.3;
    drone.userData.light.intensity = 2 + Math.sin(lifeTime * 4) * 0.5;
  }

  return { root, hips, torso, headGroup, drone, arcoDeLuz, update, playShootAnim };
}
