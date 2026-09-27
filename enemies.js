// enemies.js - Rich Enemy Models, AI Behaviors & Combat Systems for Ecos del Alba
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js";
import { createGuardian } from "./guardian.js";

// Helper to create shadowed meshes
function mesh(geometry, material, shadows = true) {
  const obj = new THREE.Mesh(geometry, material);
  obj.castShadow = shadows;
  obj.receiveShadow = shadows;
  return obj;
}

// 3D Billboard Health Bar that floats above an enemy
export function create3DHealthBar(width = 1.4, height = 0.16) {
  const group = new THREE.Group();

  // Background frame (dark)
  const bgMat = new THREE.MeshBasicMaterial({ color: 0x0a1418, transparent: true, opacity: 0.85, depthTest: false });
  const bgGeo = new THREE.PlaneGeometry(width + 0.08, height + 0.06);
  const bg = new THREE.Mesh(bgGeo, bgMat);
  bg.renderOrder = 998;
  group.add(bg);

  // Border frame
  const borderMat = new THREE.MeshBasicMaterial({ color: 0x34545d, wireframe: true, depthTest: false });
  const border = new THREE.Mesh(bgGeo, borderMat);
  border.renderOrder = 998;
  group.add(border);

  // Health fill bar
  const fillMat = new THREE.MeshBasicMaterial({ color: 0x3cf38b, depthTest: false });
  const fillGeo = new THREE.PlaneGeometry(width, height);
  // Shift pivot to left
  fillGeo.translate(width / 2, 0, 0);
  const fill = new THREE.Mesh(fillGeo, fillMat);
  fill.position.x = -width / 2;
  fill.position.z = 0.005;
  fill.renderOrder = 999;
  group.add(fill);

  return {
    group,
    update(currentHealth, maxHealth, camera) {
      group.quaternion.copy(camera.quaternion);
      const ratio = Math.max(0, Math.min(1, currentHealth / maxHealth));
      fill.scale.x = ratio;

      // Color transition from green -> yellow -> red
      if (ratio > 0.5) {
        fillMat.color.set(0x3cf38b); // green
      } else if (ratio > 0.25) {
        fillMat.color.set(0xf5d033); // yellow
      } else {
        fillMat.color.set(0xff3d5a); // red
      }
    }
  };
}

// Enemy Type 1: Sentinel Hunter Drone (Hovering Ranged Mech)
export function createSentinelDrone(mats, isElite = false) {
  const root = new THREE.Group();
  const scale = isElite ? 1.3 : 1.0;

  // Armored Central Core
  const coreMat = isElite ? mats.boss : mats.enemy;
  const core = mesh(new THREE.OctahedronGeometry(0.7 * scale, 1), coreMat);
  core.position.y = 1.6 * scale;
  root.add(core);

  // Outer Armor Carapace Rings
  const ring1 = mesh(new THREE.TorusGeometry(0.95 * scale, 0.08 * scale, 6, 20), mats.purple);
  ring1.position.y = 1.6 * scale;
  ring1.rotation.x = Math.PI / 2;
  root.add(ring1);

  const ring2 = mesh(new THREE.TorusGeometry(1.2 * scale, 0.06 * scale, 6, 24), mats.cyan);
  ring2.position.y = 1.6 * scale;
  ring2.rotation.y = Math.PI / 4;
  root.add(ring2);

  // Rotating Wing Blades (Rotors)
  const rotorGroup = new THREE.Group();
  rotorGroup.position.y = 2.1 * scale;
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const blade = mesh(new THREE.BoxGeometry(0.12 * scale, 0.04 * scale, 1.1 * scale), mats.stone);
    blade.position.set(Math.sin(angle) * 0.55 * scale, 0, Math.cos(angle) * 0.55 * scale);
    blade.rotation.y = angle;
    rotorGroup.add(blade);
  }
  root.add(rotorGroup);

  // Glowing Cyclopean Eye / Cannon Sensor
  const eyeMat = new THREE.MeshStandardMaterial({
    color: isElite ? 0xff477e : 0xff3b52,
    emissive: isElite ? 0xff1a4d : 0xff002b,
    emissiveIntensity: 3.5,
  });
  const eye = mesh(new THREE.SphereGeometry(0.24 * scale, 12, 10), eyeMat, false);
  eye.position.set(0, 1.6 * scale, 0.65 * scale);
  root.add(eye);

  // Targeting laser beam attached to eye
  const laserGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 8),
  ]);
  const laserMat = new THREE.LineBasicMaterial({
    color: 0xff3355,
    transparent: true,
    opacity: 0,
  });
  const targetingLaser = new THREE.Line(laserGeo, laserMat);
  targetingLaser.position.copy(eye.position);
  root.add(targetingLaser);

  // Thruster Vent underneath
  const thruster = mesh(new THREE.ConeGeometry(0.25 * scale, 0.5 * scale, 8), mats.stoneDark);
  thruster.rotation.x = Math.PI;
  thruster.position.y = 1.0 * scale;
  root.add(thruster);

  const thrusterGlow = mesh(new THREE.ConeGeometry(0.18 * scale, 0.6 * scale, 8), mats.cyan, false);
  thrusterGlow.rotation.x = Math.PI;
  thrusterGlow.position.y = 0.8 * scale;
  root.add(thrusterGlow);

  // 3D Health Bar
  const hpBar = create3DHealthBar(isElite ? 1.8 : 1.4, isElite ? 0.2 : 0.16);
  hpBar.group.position.set(0, 2.6 * scale, 0);
  root.add(hpBar.group);

  return {
    root,
    type: "drone",
    core,
    rotorGroup,
    ring1,
    ring2,
    eye,
    eyeMat,
    targetingLaser,
    thrusterGlow,
    hpBar,
    shootCooldown: 2.0 + Math.random() * 1.5,
    chargeTimer: 0,
    isCharging: false,
    radius: 0.9 * scale,
    update(dt, time, isMoving) {
      rotorGroup.rotation.y += dt * 10;
      ring1.rotation.z += dt * 2.2;
      ring2.rotation.x += dt * 1.8;
      root.position.y += Math.sin(time * 3.5) * 0.006;
      thrusterGlow.scale.set(1, 1 + Math.sin(time * 16) * 0.25, 1);
    }
  };
}

// Enemy Type 2: Corrupted Stalker (Articulated Hexapod Mech)
export function createCorruptedStalker(mats, isElite = false) {
  const guardianData = createGuardian();
  const root = guardianData.group;
  const scale = isElite ? 1.25 : 1.0;
  root.scale.setScalar(scale);

  // Add glowing corrupted spines / crystals on back
  const spineMat = new THREE.MeshStandardMaterial({
    color: 0xbd3fff,
    emissive: 0x9e17eb,
    emissiveIntensity: 2.5,
  });
  for (let i = 0; i < 4; i++) {
    const spine = mesh(new THREE.ConeGeometry(0.12, 0.6 + i * 0.1, 5), spineMat, false);
    spine.position.set((i % 2 === 0 ? 0.35 : -0.35), 2.2 + i * 0.15, -0.2 - i * 0.25);
    spine.rotation.x = -0.5 - i * 0.1;
    spine.rotation.z = (i % 2 === 0 ? 0.3 : -0.3);
    root.add(spine);
  }

  // 3D Health Bar
  const hpBar = create3DHealthBar(isElite ? 2.0 : 1.5, isElite ? 0.22 : 0.17);
  hpBar.group.position.set(0, 3.4 * scale, 0);
  root.add(hpBar.group);

  return {
    root,
    type: "stalker",
    guardianData,
    hpBar,
    lungeCooldown: 3.0 + Math.random() * 2.0,
    isLunging: false,
    lungeDuration: 0,
    radius: 1.2 * scale,
    update(dt, time, isMoving) {
      guardianData.update(time, isMoving);
    }
  };
}

// Enemy Type 3: Titan Ancestral Corrupto (Level 3 Colossal Boss)
export function createTitanBossModel(mats) {
  const root = new THREE.Group();
  const scale = 2.8;

  // Massive Corrupted Core
  const coreMat = mats.boss;
  const core = mesh(new THREE.DodecahedronGeometry(1.35 * scale), coreMat);
  core.position.y = 3.6;
  root.add(core);

  // Dual Counter-Rotating Runic Torus Rings
  const ringOuter = mesh(new THREE.TorusGeometry(1.8 * scale, 0.16 * scale, 8, 32), mats.purple);
  ringOuter.position.y = 3.6;
  ringOuter.rotation.x = Math.PI / 2;
  root.add(ringOuter);

  const ringInner = mesh(new THREE.TorusGeometry(2.2 * scale, 0.1 * scale, 8, 36), mats.cyan);
  ringInner.position.y = 3.6;
  ringInner.rotation.y = Math.PI / 4;
  root.add(ringInner);

  // 4 Orbiting Satellite Pylons (Defense Crystals)
  const pylons = [];
  for (let i = 0; i < 4; i++) {
    const pylon = new THREE.Group();
    const crystal = mesh(new THREE.OctahedronGeometry(0.45 * scale, 0), mats.cyan);
    pylon.add(crystal);
    pylons.push({ group: pylon, angle: (i * Math.PI) / 2 });
    root.add(pylon);
  }

  // Giant Glowing Cyclopean Eye
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xff1e56,
    emissive: 0xff0044,
    emissiveIntensity: 4.0,
  });
  const mainEye = mesh(new THREE.SphereGeometry(0.7, 18, 14), eyeMat, false);
  mainEye.position.set(0, 3.8, 2.3);
  root.add(mainEye);

  // Ground Runestone Aura Ring
  const auraRing = mesh(new THREE.RingGeometry(3.2 * scale, 3.8 * scale, 48), mats.cyan, false);
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.y = 0.2;
  root.add(auraRing);

  // 3D Boss Health Bar
  const hpBar = create3DHealthBar(3.4, 0.28);
  hpBar.group.position.set(0, 7.8, 0);
  root.add(hpBar.group);

  return {
    root,
    type: "boss",
    core,
    ringOuter,
    ringInner,
    pylons,
    mainEye,
    eyeMat,
    auraRing,
    hpBar,
    slamCooldown: 5.0,
    shootCooldown: 3.0,
    isSlamming: false,
    radius: 3.2,
    update(dt, time, isMoving) {
      core.rotation.y += dt * 0.6;
      ringOuter.rotation.z += dt * 1.4;
      ringInner.rotation.x -= dt * 1.1;
      auraRing.rotation.z += dt * 0.8;
      root.position.y = 0.2 + Math.sin(time * 2.2) * 0.25;

      // Orbiting pylons
      pylons.forEach((p, idx) => {
        p.angle += dt * 1.5;
        const rad = 3.6 * scale;
        p.group.position.set(
          Math.sin(p.angle) * rad,
          3.6 + Math.sin(time * 3 + idx) * 0.5,
          Math.cos(p.angle) * rad
        );
        p.group.rotation.y += dt * 3;
      });
    }
  };
}
