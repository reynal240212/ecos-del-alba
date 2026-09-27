import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js";
import { createProtagonist } from "./character.js";
import { createGuardian } from "./guardian.js";

const obstacles = [];
function addObstacle(x, z, width, depth, height, rotation = 0) {
  obstacles.push({ x, z, width, depth, height, rotation });
}

// Resolve a circular footprint against rotated rectangular solid volumes.
function resolvePosition(position, radius, height = 0) {
  for (let pass = 0; pass < 4; pass++) {
    for (const b of obstacles) {
      if (height > b.height) continue;
      const c = Math.cos(b.rotation), s = Math.sin(b.rotation);
      let x = c * (position.x - b.x) - s * (position.z - b.z);
      let z = s * (position.x - b.x) + c * (position.z - b.z);
      const qx = THREE.MathUtils.clamp(x, -b.width / 2, b.width / 2);
      const qz = THREE.MathUtils.clamp(z, -b.depth / 2, b.depth / 2);
      const dx = x - qx, dz = z - qz, distance = Math.hypot(dx, dz);
      if (distance >= radius) continue;
      if (distance > 0.00001) {
        x += dx / distance * (radius - distance);
        z += dz / distance * (radius - distance);
      } else if (b.width / 2 - Math.abs(x) < b.depth / 2 - Math.abs(z)) {
        x = (Math.sign(x) || 1) * (b.width / 2 + radius);
      } else {
        z = (Math.sign(z) || 1) * (b.depth / 2 + radius);
      }
      position.x = b.x + c * x + s * z;
      position.z = b.z - s * x + c * z;
    }
  }
}

const canvas = document.querySelector("#game");
const healthMeter = document.querySelector("#health");
const energyMeter = document.querySelector("#energy");
const objectiveText = document.querySelector("#objective");
const message = document.querySelector("#message");
const btnInspect = document.querySelector("#btn-inspect");
const inspectPanel = document.querySelector("#inspect-panel");
const btnExitInspect = document.querySelector("#btn-exit-inspect");
const tabButtons = document.querySelectorAll(".tab-btn");

const btnLeaderboard = document.querySelector("#btn-leaderboard");
const leaderboardModal = document.querySelector("#leaderboard-modal");
const btnCloseLeaderboard = document.querySelector("#btn-close-leaderboard");
const leaderboardBody = document.querySelector("#leaderboard-body");
const dbStatusTag = document.querySelector("#leaderboard-db-status");
const scoreSubmitBox = document.querySelector("#score-submit-box");
const summaryScore = document.querySelector("#summary-score");
const summaryTime = document.querySelector("#summary-time");
const scoreForm = document.querySelector("#score-form");
const playerNameInput = document.querySelector("#player-name-input");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x89b6b5);
scene.fog = new THREE.FogExp2(0x8fb5ac, 0.012);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 240);
const keys = new Set();
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const aimPoint = new THREE.Vector3(0, 0, -8);
const WORLD = { width: 84, depth: 64 };
const playerVelocity = new THREE.Vector3();
let aimHold = 0;
let pointerKnown = false;

// Audio Context for synthesized sound effects
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playSound(type) {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "shoot") {
      // Light bow shoot sound: high-pitch harmonic energy release
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "drone") {
      // Drone chirp / pulse
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.setValueAtTime(1800, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "hit") {
      // Enemy hit sound
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.14);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === "crystal") {
      // Ancient crystal activation chime: harmonic arpeggio
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(freq, now + i * 0.08);
        g.gain.setValueAtTime(0.2, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);
        o.start(now + i * 0.08);
        o.stop(now + i * 0.08 + 0.6);
      });
    } else if (type === "victory") {
      // Epic ancestral chord
      [261.63, 329.63, 392.0, 523.25].forEach((freq) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = "triangle";
        o.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.25, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        o.start(now);
        o.stop(now + 1.8);
      });
    }
  } catch (e) {
    // Ignore audio errors
  }
}

// Game State
const player = {
  group: null,
  heroine: null,
  health: 100,
  energy: 100,
  speed: 9.5,
  invulnerable: 0,
  shootCooldown: 0,
};

let bolts = [];
let particles = [];
let enemies = [];
let crystals = [];
let portalCore;
let victory = false;
let gameOver = false;
let elapsed = 0;
let lastFrameTime = performance.now();

// Inspector Mode State
let inspectMode = false;
let currentView = "frontal"; // frontal, perfil, posterior, arco, dron, orbit
let orbitAngles = { theta: 0, phi: 0.25, radius: 4.2 };
let isDragging = false;
let prevMousePos = { x: 0, y: 0 };

const mats = {
  stone: new THREE.MeshStandardMaterial({ color: 0x596864, roughness: 0.9 }),
  stoneDark: new THREE.MeshStandardMaterial({ color: 0x35433f, roughness: 1 }),
  cyan: new THREE.MeshStandardMaterial({ color: 0x72f5ff, emissive: 0x23afbd, emissiveIntensity: 2.2 }),
  purple: new THREE.MeshStandardMaterial({ color: 0xad5bd1, emissive: 0x632080, emissiveIntensity: 1.5 }),
  enemy: new THREE.MeshStandardMaterial({ color: 0x35223f, emissive: 0x7f2490, emissiveIntensity: 1.2, roughness: 0.48 }),
};

function mesh(geometry, material, shadows = true) {
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = shadows;
  object.receiveShadow = shadows;
  return object;
}

function createWorld() {
  scene.add(new THREE.HemisphereLight(0xbfe8eb, 0x273322, 2.2));
  const sun = new THREE.DirectionalLight(0xffd4a0, 4.4);
  sun.position.set(-22, 36, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 42, bottom: -42 });
  scene.add(sun);

  // Soft ambient fill light for character details
  const fillLight = new THREE.DirectionalLight(0xa5e5ea, 1.2);
  fillLight.position.set(20, 15, -15);
  scene.add(fillLight);

  const groundGeo = new THREE.PlaneGeometry(WORLD.width, WORLD.depth, 36, 28);
  const positions = groundGeo.attributes.position;
  const colors = [];
  const tint = new THREE.Color();
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    positions.setZ(i, Math.sin(x * 0.22) * 0.16 + Math.cos(y * 0.28) * 0.12);
    tint.set(i % 5 === 0 ? 0x375742 : 0x294b3f);
    colors.push(tint.r, tint.g, tint.b);
  }
  groundGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  groundGeo.computeVertexNormals();
  const ground = mesh(groundGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96 }), false);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const pathMat = new THREE.MeshStandardMaterial({ color: 0x71806e, roughness: 1, transparent: true, opacity: 0.62 });
  for (let i = 0; i < 18; i += 1) {
    const slab = mesh(new THREE.BoxGeometry(3.3 + (i % 3), 0.12, 1.7), pathMat);
    slab.position.set(-28 + i * 3.4, 0.13, Math.sin(i * 0.7) * 2.8);
    slab.rotation.y = Math.sin(i * 1.4) * 0.12;
    scene.add(slab);
  }

  createRuins(-20, -14, 0.2);
  createRuins(12, -11, -0.45);
  createRuins(24, 14, 0.72);
  createPortal(34, -20);
  createFlora();
  createMountains();
}

function createRuins(x, z, rotation) {
  addObstacle(x, z, 12, 5, 0.7, rotation);
  for (const offset of [-4.8, 4.8]) {
    addObstacle(x + Math.cos(rotation) * offset, z - Math.sin(rotation) * offset, 1.8, 1.8, 6, rotation);
  }
  const ruin = new THREE.Group();
  ruin.position.set(x, 0, z);
  ruin.rotation.y = rotation;
  const base = mesh(new THREE.BoxGeometry(12, 0.7, 5), mats.stoneDark);
  base.position.y = 0.35;
  ruin.add(base);
  [-4.8, 4.8].forEach((px, i) => {
    const pillar = mesh(new THREE.BoxGeometry(1.5, 6 - i * 1.2, 1.5), mats.stone);
    pillar.position.set(px, 3 - i * 0.6, 0);
    pillar.rotation.z = (i ? -1 : 1) * 0.04;
    ruin.add(pillar);
  });
  const beam = mesh(new THREE.BoxGeometry(11.5, 1.1, 1.6), mats.stone);
  beam.position.set(0, 5.5, 0);
  beam.rotation.z = 0.04;
  ruin.add(beam);
  const rune = mesh(new THREE.BoxGeometry(5, 0.08, 0.12), mats.cyan, false);
  rune.position.set(0, 5.48, 0.86);
  ruin.add(rune);
  scene.add(ruin);
}

function createPortal(x, z) {
  addObstacle(x, z, 12, 4, 1, -0.45);
  const portal = new THREE.Group();
  portal.position.set(x, 4.4, z);
  portal.rotation.y = -0.45;
  portal.add(mesh(new THREE.TorusGeometry(4.8, 0.85, 10, 38), mats.stone));
  portalCore = mesh(
    new THREE.CircleGeometry(3.85, 42),
    new THREE.MeshBasicMaterial({ color: 0x183b43, transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
    false
  );
  portalCore.position.z = -0.02;
  portal.add(portalCore);
  const base = mesh(new THREE.BoxGeometry(12, 1.1, 4), mats.stoneDark);
  base.position.y = -4.5;
  portal.add(base);
  scene.add(portal);
}

function createFlora() {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x293c2c, roughness: 1 });
  const leafMats = [0x4c8b51, 0x438d78, 0x7b477e].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
  for (let i = 0; i < 85; i += 1) {
    const x = ((i * 31.7) % 76) - 38;
    const z = ((i * 19.3 + 9) % 56) - 28;
    if (Math.abs(z - Math.sin((x + 28) / 3.4) * 2.8) < 3) continue;
    const plant = new THREE.Group();
    plant.position.set(x, 0.1, z);
    // Leave the starting point and crystal approaches clear of tall canopies.
    const landmarks = [[-31, 18], [-21, 19], [7, 13], [24, -17]];
    if (landmarks.some(([px, pz]) => Math.hypot(x - px, z - pz) < 4.5)) continue;
    const height = 5.5 + (i % 5) * 0.85;
    addObstacle(x, z, 0.8, 0.8, height * 0.7);
    const stem = mesh(new THREE.CylinderGeometry(0.19, 0.42, height * 0.7, 7), trunkMat);
    stem.position.y = height * 0.35;
    plant.add(stem);
    for (let tier = 0; tier < 3; tier += 1) {
      const leaves = mesh(new THREE.ConeGeometry(1.9 - tier * 0.4, height * 0.43, 7), leafMats[i % 3]);
      leaves.position.y = height * (0.49 + tier * 0.17);
      leaves.rotation.y = tier * 0.5 + i;
      plant.add(leaves);
    }
    scene.add(plant);
  }
}

function createMountains() {
  const mountainMat = new THREE.MeshStandardMaterial({ color: 0x52675f, roughness: 1 });
  for (let i = 0; i < 20; i += 1) {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 56 + (i % 4) * 4;
    const mountain = mesh(new THREE.ConeGeometry(7 + (i % 3) * 2, 15 + (i % 5) * 3, 6), mountainMat, false);
    mountain.position.set(Math.cos(angle) * radius, 5, Math.sin(angle) * radius);
    mountain.rotation.y = i * 0.73;
    scene.add(mountain);
  }
}

// Initialize Protagonist from Reference Sheet
function initPlayer() {
  const heroine = createProtagonist();
  heroine.root.position.set(-31, 0, 18);
  scene.add(heroine.root);

  player.group = heroine.root;
  player.heroine = heroine;
}

function createCrystal(x, z) {
  addObstacle(x, z, 3, 3, 0.7);
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  const base = mesh(new THREE.CylinderGeometry(1.45, 1.8, 0.65, 7), mats.stoneDark);
  base.position.y = 0.32;
  group.add(base);
  const gem = mesh(new THREE.OctahedronGeometry(1.15, 0), mats.purple);
  gem.position.y = 2;
  group.add(gem);
  const light = new THREE.PointLight(0xb363dc, 2.2, 9);
  light.position.y = 2;
  group.add(light);
  scene.add(group);
  crystals.push({ group, gem, light, active: false });
}

const enemyConfigs = [[-16, 8], [-2, -7], [12, 9], [23, -4], [29, 17], [3, 20]];
function spawnEnemies() {
  enemies.forEach((enemy) => scene.remove(enemy.group));
  enemies = enemyConfigs.map(([x, z], index) => {
    const guardian = createGuardian();
    const group = guardian.group;
    group.position.set(x, 0.15, z);
    resolvePosition(group.position, 1.4);
    scene.add(group);
    return { group, guardian, health: 75, speed: 2.2 + (index % 3) * 0.35, phase: index * 0.7 };
  });
}

function shoot() {
  if (inspectMode || player.energy < 13 || player.shootCooldown > 0 || gameOver || victory) return;
  updateAim();
  aimHold = 0.4;
  initAudio();
  player.energy -= 13;
  player.shootCooldown = 0.22;

  // Trigger character shoot animation
  player.heroine.playShootAnim();
  playSound("shoot");

  const origin = player.group.position.clone().add(new THREE.Vector3(0, 1.5, 0));
  const direction = aimPoint.clone().sub(player.group.position);
  direction.y = 0;
  if (direction.lengthSq() < 0.01) direction.set(0, 0, -1);
  direction.normalize();

  // Primary Light Arrow Bolt from Arco de Luz
  const boltMesh = new THREE.Group();
  const arrowCore = mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), mats.cyan, false);
  arrowCore.rotation.x = Math.PI / 2;
  boltMesh.add(arrowCore);

  const headGlow = mesh(new THREE.ConeGeometry(0.12, 0.32, 6), mats.cyan, false);
  headGlow.rotation.x = -Math.PI / 2;
  headGlow.position.z = -0.7;
  boltMesh.add(headGlow);

  boltMesh.position.copy(origin).addScaledVector(direction, 1.2);
  boltMesh.lookAt(boltMesh.position.clone().add(direction));
  scene.add(boltMesh);
  bolts.push({ mesh: boltMesh, velocity: direction.clone().multiplyScalar(28), life: 1.6 });

  // Companion Drone synchronized energy assist
  setTimeout(() => {
    if (gameOver || victory || inspectMode) return;
    playSound("drone");
    const dronePos = new THREE.Vector3();
    player.heroine.drone.getWorldPosition(dronePos);

    const droneBolt = mesh(new THREE.SphereGeometry(0.14, 6, 6), mats.cyan, false);
    droneBolt.scale.set(1, 1, 2.2);
    droneBolt.position.copy(dronePos);
    droneBolt.lookAt(dronePos.clone().add(direction));
    scene.add(droneBolt);
    bolts.push({ mesh: droneBolt, velocity: direction.clone().multiplyScalar(32), life: 1.4 });
    burst(dronePos, 0x5ef4ff, 5);
  }, 60);
}

function burst(position, color = 0x73eff7, count = 8) {
  for (let i = 0; i < count; i += 1) {
    const particle = mesh(new THREE.SphereGeometry(0.08, 5, 4), new THREE.MeshBasicMaterial({ color }), false);
    particle.position.copy(position).add(new THREE.Vector3(0, 0.8, 0));
    const velocity = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() * 0.8,
      Math.random() - 0.5
    ).normalize().multiplyScalar(3 + Math.random() * 4);
    scene.add(particle);
    particles.push({ mesh: particle, velocity, life: 0.65 });
  }
}

function updateAim() {
  if (inspectMode) return;
  if (!pointerKnown) {
    aimPoint.copy(player.group.position).add(new THREE.Vector3(Math.sin(player.group.rotation.y), 0, Math.cos(player.group.rotation.y)).multiplyScalar(10));
    return;
  }
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), aimPoint);
  const direction = aimPoint.clone().sub(player.group.position);
  direction.y = 0;
  // Keep aiming independent of body rotation; the locomotion code turns smoothly.
}

function updatePlayer(dt) {
  const move = new THREE.Vector3();
  if (keys.has("w") || keys.has("arrowup")) move.z -= 1;
  if (keys.has("s") || keys.has("arrowdown")) move.z += 1;
  if (keys.has("a") || keys.has("arrowleft")) move.x -= 1;
  if (keys.has("d") || keys.has("arrowright")) move.x += 1;

  const desired = move.clone().normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(12, 18)).multiplyScalar(player.speed);
  playerVelocity.lerp(desired, 1 - Math.exp(-(move.lengthSq() ? 14 : 22) * dt));
  if (playerVelocity.lengthSq() < 0.0025) playerVelocity.set(0, 0, 0);
  const before = player.group.position.clone();
  const steps = Math.max(1, Math.ceil(playerVelocity.length() * dt / 0.12));
  for (let step = 0; step < steps; step++) {
    player.group.position.addScaledVector(playerVelocity, dt / steps);
    resolvePosition(player.group.position, 0.48);
  }
  player.group.position.x = THREE.MathUtils.clamp(player.group.position.x, -39, 39);
  player.group.position.z = THREE.MathUtils.clamp(player.group.position.z, -29, 29);

  player.energy = Math.min(100, player.energy + 20 * dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.shootCooldown = Math.max(0, player.shootCooldown - dt);

  updateAim();
  aimHold = Math.max(0, aimHold - dt);
  const actualMove = player.group.position.clone().sub(before);
  const speedRatio = Math.min(1, actualMove.length() / Math.max(0.0001, dt * player.speed));
  const facing = aimHold > 0 ? aimPoint.clone().sub(player.group.position) : actualMove;
  if (facing.lengthSq() > 0.00001) {
    const target = Math.atan2(facing.x, facing.z);
    const delta = Math.atan2(Math.sin(target - player.group.rotation.y), Math.cos(target - player.group.rotation.y));
    player.group.rotation.y += THREE.MathUtils.clamp(delta, -9 * dt, 9 * dt);
  }

  // Update protagonist animation rig
  player.heroine.update(dt, speedRatio > 0.025, actualMove, true, aimPoint, speedRatio);
}

function updateCrystals(dt) {
  crystals.forEach((crystal, index) => {
    crystal.gem.rotation.y += dt * (crystal.active ? 1.9 : 0.7);
    crystal.gem.position.y = 2 + Math.sin(elapsed * 2.4 + index) * 0.22;
    if (!crystal.active && crystal.group.position.distanceTo(player.group.position) < 3.3) {
      crystal.active = true;
      crystal.gem.material = mats.cyan;
      crystal.light.color.set(0x6ff6ff);
      crystal.light.intensity = 4.8;
      burst(crystal.group.position, 0x7cf7ff, 22);
      playSound("crystal");
    }
  });
}

function updateEnemies(dt) {
  enemies.forEach((enemy) => {
    const towardPlayer = player.group.position.clone().sub(enemy.group.position);
    const distance = towardPlayer.length();
    towardPlayer.y = 0;
    if (distance < 23 && distance > 1.95) {
      enemy.group.position.addScaledVector(towardPlayer.normalize(), enemy.speed * dt);
    }
    resolvePosition(enemy.group.position, 1.4);
    enemy.group.rotation.y = Math.atan2(towardPlayer.x, towardPlayer.z);
    enemy.guardian.update(elapsed + enemy.phase, distance < 23 && distance > 1.95);
    const separation = player.group.position.clone().sub(enemy.group.position);
    separation.y = 0;
    if (separation.length() < 1.88) {
      if (separation.lengthSq() < 0.00001) separation.set(1, 0, 0);
      enemy.group.position.copy(player.group.position).add(separation.normalize().multiplyScalar(-1.89));
      enemy.group.position.y = 0.15;
      resolvePosition(enemy.group.position, 1.4);
    }

    if (distance < 2.15 && player.invulnerable <= 0) {
      player.health -= 14;
      player.invulnerable = 0.9;
      burst(player.group.position, 0xff6677, 12);
      playSound("hit");
      if (player.health <= 0) {
        gameOver = true;
      }
    }
  });
}

function updateBolts(dt) {
  for (let i = bolts.length - 1; i >= 0; i -= 1) {
    const bolt = bolts[i];
    let blocked = false;
    const steps = Math.max(1, Math.ceil(bolt.velocity.length() * dt / 0.18));
    for (let step = 0; step < steps; step++) {
      bolt.mesh.position.addScaledVector(bolt.velocity, dt / steps);
      const probe = bolt.mesh.position.clone();
      resolvePosition(probe, 0.12, probe.y);
      if (probe.distanceToSquared(bolt.mesh.position) > 0.000001) { blocked = true; break; }
    }
    bolt.life -= dt;
    let hit = blocked;
    for (let j = enemies.length - 1; j >= 0; j -= 1) {
      if (blocked) break;
      const enemy = enemies[j];
      if (bolt.mesh.position.distanceTo(enemy.group.position.clone().add(new THREE.Vector3(0, 1.6, 0))) < 1.6) {
        enemy.health -= 25;
        burst(enemy.group.position, 0x73eff7, 8);
        playSound("hit");
        hit = true;
        if (enemy.health <= 0) {
          burst(enemy.group.position, 0xd66cff, 18);
          scene.remove(enemy.group);
          enemies.splice(j, 1);
        }
        break;
      }
    }
    if (hit || bolt.life <= 0) {
      scene.remove(bolt.mesh);
      bolts.splice(i, 1);
    }
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.mesh.position.addScaledVector(particle.velocity, dt);
    particle.velocity.y -= 7 * dt;
    particle.life -= dt;
    particle.mesh.scale.setScalar(Math.max(0.01, particle.life));
    if (particle.life <= 0) {
      scene.remove(particle.mesh);
      particle.mesh.material.dispose();
      particles.splice(i, 1);
    }
  }
}

// Camera Modes & Inspection
function updateCamera(dt) {
  if (inspectMode) {
    const charPos = player.group.position.clone().add(new THREE.Vector3(0, 1.4, 0));
    let targetPos = new THREE.Vector3();
    let lookTarget = charPos.clone();

    // Preset positions matching reference sheet views
    if (currentView === "frontal") {
      targetPos.set(0, 1.45, 3.4).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y).add(player.group.position);
      lookTarget = player.group.position.clone().add(new THREE.Vector3(0, 1.45, 0));
    } else if (currentView === "perfil") {
      targetPos.set(3.4, 1.45, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y).add(player.group.position);
      lookTarget = player.group.position.clone().add(new THREE.Vector3(0, 1.45, 0));
    } else if (currentView === "posterior") {
      targetPos.set(0, 1.5, -3.4).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y).add(player.group.position);
      lookTarget = player.group.position.clone().add(new THREE.Vector3(0, 1.45, 0));
    } else if (currentView === "arco") {
      // Focus on Left Hand / Light Bow
      targetPos.set(1.4, 1.4, 1.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y).add(player.group.position);
      lookTarget = player.group.position.clone().add(new THREE.Vector3(0.5, 1.35, 0.1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y));
    } else if (currentView === "dron") {
      // Focus on Companion Drone
      targetPos.set(2.4, 2.7, 0.6).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y).add(player.group.position);
      lookTarget = player.group.position.clone().add(new THREE.Vector3(1.3, 2.6, -0.7).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y));
    } else {
      // 360 Orbit
      const cosPhi = Math.cos(orbitAngles.phi);
      const sinPhi = Math.sin(orbitAngles.phi);
      const sinTheta = Math.sin(orbitAngles.theta);
      const cosTheta = Math.cos(orbitAngles.theta);

      targetPos.set(
        charPos.x + orbitAngles.radius * cosPhi * sinTheta,
        charPos.y + orbitAngles.radius * sinPhi,
        charPos.z + orbitAngles.radius * cosPhi * cosTheta
      );
    }

    camera.position.lerp(targetPos, 1 - Math.pow(0.001, dt));
    camera.lookAt(lookTarget);
  } else {
    // Standard Isometric Gameplay Follow Camera
    const desired = player.group.position.clone().add(new THREE.Vector3(12, 18, 18));
    camera.position.lerp(desired, 1 - Math.pow(0.002, dt));
    camera.lookAt(player.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
  }
}

function updateHud() {
  const active = crystals.filter((crystal) => crystal.active).length;
  healthMeter.value = Math.max(0, player.health);
  energyMeter.value = player.energy;

  if (gameOver) {
    objectiveText.textContent = "La corrupción te alcanzó";
    message.innerHTML = "La corrupción te alcanzó<small>Pulsa R para volver a intentarlo</small>";
  } else if (victory) {
    objectiveText.textContent = "La puerta ancestral ha despertado";
    message.innerHTML = "El legado despierta<small>Demo completada · Pulsa R para jugar otra vez</small>";
  } else {
    objectiveText.textContent = `Cristales ${active}/3 · Guardianes ${enemies.length}`;
    message.textContent = "";
  }
}

function setInspectMode(active) {
  keys.clear();
  playerVelocity.set(0, 0, 0);
  inspectMode = active;
  if (inspectMode) {
    inspectPanel.classList.remove("hidden");
    orbitAngles.theta = player.group.rotation.y;
    orbitAngles.phi = 0.2;
    orbitAngles.radius = 3.6;
    document.querySelector(".reticle").style.display = "none";
  } else {
    inspectPanel.classList.add("hidden");
    document.querySelector(".reticle").style.display = "block";
  }
}

function calculateCurrentScore() {
  const activeCrystals = crystals.filter((c) => c.active).length;
  const crystalScore = activeCrystals * 1000;
  const healthScore = Math.floor(Math.max(0, player.health) * 10);
  const timeScore = Math.max(0, 3000 - Math.floor(elapsed) * 35);
  return crystalScore + healthScore + timeScore;
}

let isLeaderboardOpen = false;

async function fetchScores() {
  leaderboardBody.innerHTML = '<tr><td colspan="5" class="loading-td">Cargando récords ancestrales...</td></tr>';
  try {
    const res = await fetch("/api/scores");
    const data = await res.json();
    if (data.source === "vercel_postgres") {
      dbStatusTag.textContent = "Conectado a Vercel Postgres";
      dbStatusTag.style.borderColor = "rgba(94, 244, 255, 0.4)";
    } else {
      dbStatusTag.textContent = "Modo Demo Local / En Memoria";
    }

    const list = data.scores || [];
    if (list.length === 0) {
      leaderboardBody.innerHTML = '<tr><td colspan="5" class="loading-td">No hay récords registrados aún. ¡Sé el primero!</td></tr>';
      return;
    }

    leaderboardBody.innerHTML = list.map((item, idx) => `
      <tr>
        <td><strong>#${idx + 1}</strong></td>
        <td>${escapeHtml(item.player_name || "Anónimo")}</td>
        <td><strong style="color: #6cf5ff;">${item.score.toLocaleString()}</strong></td>
        <td>${item.crystals} / 3</td>
        <td>${item.time_seconds}s</td>
      </tr>
    `).join("");
  } catch (err) {
    dbStatusTag.textContent = "Modo Sin Conexión / Local";
    leaderboardBody.innerHTML = `
      <tr><td>#1</td><td>Aura</td><td><strong style="color: #6cf5ff;">3,200</strong></td><td>3 / 3</td><td>45s</td></tr>
      <tr><td>#2</td><td>Kael</td><td><strong style="color: #6cf5ff;">2,850</strong></td><td>3 / 3</td><td>52s</td></tr>
      <tr><td>#3</td><td>Sombra</td><td><strong style="color: #6cf5ff;">2,100</strong></td><td>2 / 3</td><td>68s</td></tr>
    `;
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, (tag) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[tag] || tag));
}

function openLeaderboard(allowSubmit = false) {
  keys.clear();
  isLeaderboardOpen = true;
  leaderboardModal.classList.remove("hidden");
  fetchScores();

  if (allowSubmit) {
    const currentScore = calculateCurrentScore();
    const currentTime = Math.max(1, Math.floor(elapsed));
    summaryScore.textContent = currentScore.toLocaleString();
    summaryTime.textContent = currentTime;
    scoreSubmitBox.classList.remove("hidden");
    playerNameInput.focus();
  } else {
    scoreSubmitBox.classList.add("hidden");
  }
}

function closeLeaderboard() {
  isLeaderboardOpen = false;
  leaderboardModal.classList.add("hidden");
}

scoreForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = playerNameInput.value.trim() || "Guerrera Ancestral";
  const currentScore = calculateCurrentScore();
  const currentTime = Math.max(1, Math.floor(elapsed));
  const activeCrystals = crystals.filter((c) => c.active).length;

  const submitBtn = scoreForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "Guardando...";

  try {
    await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_name: name,
        score: currentScore,
        crystals: activeCrystals,
        time_seconds: currentTime,
      }),
    });
    scoreSubmitBox.classList.add("hidden");
    fetchScores();
  } catch (err) {
    console.error("Error saving score:", err);
    scoreSubmitBox.classList.add("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Guardar Récord";
  }
});

btnLeaderboard.addEventListener("click", () => openLeaderboard(false));
btnCloseLeaderboard.addEventListener("click", closeLeaderboard);

function reset() {
  keys.clear();
  playerVelocity.set(0, 0, 0);
  aimHold = 0;
  bolts.forEach((bolt) => scene.remove(bolt.mesh));
  particles.forEach((particle) => scene.remove(particle.mesh));
  bolts = [];
  particles = [];
  player.group.position.set(-31, 0, 18);
  player.health = 100;
  player.energy = 100;
  player.invulnerable = 0;
  elapsed = 0;
  crystals.forEach((crystal) => {
    crystal.active = false;
    crystal.gem.material = mats.purple;
    crystal.light.color.set(0xb363dc);
    crystal.light.intensity = 2.2;
  });
  portalCore.material.color.set(0x183b43);
  portalCore.material.opacity = 0.28;
  spawnEnemies();
  victory = false;
  gameOver = false;
  closeLeaderboard();
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate(frameTime = performance.now()) {
  const dt = Math.min((frameTime - lastFrameTime) / 1000, 0.033);
  lastFrameTime = frameTime;
  elapsed += dt;

  if (inspectMode || isLeaderboardOpen) {
    // In inspect or modal mode, character plays idle breathing & drone floats
    player.heroine.update(dt, false, null, false, null);
    updateParticles(dt);
  } else if (!gameOver && !victory) {
    updatePlayer(dt);
    updateCrystals(dt);
    updateEnemies(dt);
    updateBolts(dt);
    updateParticles(dt);

    const allCrystalsActive = crystals.every((crystal) => crystal.active);
    if (!victory && allCrystalsActive && enemies.length === 0) {
      victory = true;
      playSound("victory");
      portalCore.material.color.set(0x52e8f2);
      portalCore.material.opacity = 0.76;
      setTimeout(() => {
        openLeaderboard(true);
      }, 1400);
    }
  } else {
    player.heroine.update(dt, false, null, false, null);
    updateParticles(dt);
  }

  updateCamera(dt);
  updateHud();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Event Listeners
window.addEventListener("resize", resize);

window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
  if (event.key === " " && !inspectMode && !isLeaderboardOpen) {
    event.preventDefault();
    shoot();
  }
  if (event.key.toLowerCase() === "r" && !isLeaderboardOpen) reset();
  if (event.key.toLowerCase() === "v" && !isLeaderboardOpen) {
    setInspectMode(!inspectMode);
  }
  if (event.key.toLowerCase() === "t" && !inspectMode) {
    if (isLeaderboardOpen) closeLeaderboard();
    else openLeaderboard(false);
  }
  if (event.key === "Escape") {
    if (isLeaderboardOpen) closeLeaderboard();
    if (inspectMode) setInspectMode(false);
  }
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener("blur", () => { keys.clear(); playerVelocity.set(0, 0, 0); });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { keys.clear(); playerVelocity.set(0, 0, 0); }
  lastFrameTime = performance.now();
});

canvas.addEventListener("pointermove", (event) => {
  pointerKnown = true;
  if (inspectMode && isDragging) {
    const deltaX = event.clientX - prevMousePos.x;
    const deltaY = event.clientY - prevMousePos.y;
    orbitAngles.theta -= deltaX * 0.008;
    orbitAngles.phi = THREE.MathUtils.clamp(orbitAngles.phi + deltaY * 0.008, -0.4, 1.2);
    prevMousePos = { x: event.clientX, y: event.clientY };
    currentView = "orbit";
    tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === "orbit"));
  } else {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
});

canvas.addEventListener("pointerdown", (event) => {
  initAudio();
  if (inspectMode) {
    isDragging = true;
    prevMousePos = { x: event.clientX, y: event.clientY };
  } else {
    shoot();
  }
});

window.addEventListener("pointerup", () => {
  isDragging = false;
});

canvas.addEventListener("wheel", (event) => {
  if (inspectMode) {
    event.preventDefault();
    orbitAngles.radius = THREE.MathUtils.clamp(orbitAngles.radius + event.deltaY * 0.003, 1.8, 6.5);
    currentView = "orbit";
    tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === "orbit"));
  }
}, { passive: false });

canvas.addEventListener("contextmenu", (event) => event.preventDefault());

// Inspector Panel Tab Controls
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentView = btn.dataset.view;
    if (currentView === "orbit") {
      orbitAngles.theta = player.group.rotation.y;
      orbitAngles.phi = 0.2;
    }
  });
});

btnInspect.addEventListener("click", () => setInspectMode(true));
btnExitInspect.addEventListener("click", () => setInspectMode(false));

// Initialization
createWorld();
initPlayer();
createCrystal(-21, 19);
createCrystal(7, 13);
createCrystal(24, -17);
spawnEnemies();
resize();
camera.position.set(-19, 18, 36);
animate();
