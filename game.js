import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js";
import { createProtagonist, createProtagonistMaterials, createFPSViewModel } from "./character.js";

// DOM Elements
const canvas = document.querySelector("#game");
const healthMeter = document.querySelector("#health");
const energyMeter = document.querySelector("#energy");
const objectiveText = document.querySelector("#objective");
const subObjectiveText = document.querySelector("#sub-objective");
const levelTitle = document.querySelector("#level-title");
const message = document.querySelector("#message");
const essenceCountText = document.querySelector("#essence-count");
const modalEssenceCount = document.querySelector("#modal-essence-count");
const missionToast = document.querySelector("#mission-toast");

// Action Buttons & Modals
const btnCamToggle = document.querySelector("#btn-cam-toggle");
const camToggleText = document.querySelector("#cam-toggle-text");
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

const btnUpgradeOpen = document.querySelector("#btn-upgrade-open");
const upgradeModal = document.querySelector("#upgrade-modal");
const btnCloseUpgrade = document.querySelector("#btn-close-upgrade");
const btnUpgradeBow = document.querySelector("#btn-upgrade-bow");
const btnUpgradeDrone = document.querySelector("#btn-upgrade-drone");
const btnUpgradeArmor = document.querySelector("#btn-upgrade-armor");

// Level Transition & Boss HUD
const levelBanner = document.querySelector("#level-banner");
const bannerTitle = document.querySelector("#banner-title");
const bannerDesc = document.querySelector("#banner-desc");
const btnNextLevel = document.querySelector("#btn-next-level");
const bossHud = document.querySelector("#boss-hud");
const bossHealthFill = document.querySelector("#boss-health-fill");

// Touch Controls Elements
const joystickBase = document.querySelector("#joystick-base");
const joystickThumb = document.querySelector("#joystick-thumb");
const btnTouchCam = document.querySelector("#btn-touch-cam");
const btnTouchDash = document.querySelector("#btn-touch-dash");
const btnTouchShoot = document.querySelector("#btn-touch-shoot");
const btnTouchSpecial = document.querySelector("#btn-touch-special");

// Three.js Core
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
scene.add(camera);

const keys = new Set();
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const aimPoint = new THREE.Vector3(0, 0, -8);
const WORLD = { width: 84, depth: 64 };

// Audio Context for Synthesized Sound Effects
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
      osc.type = "sine";
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "shockwave") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "drone") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.setValueAtTime(1900, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "hit") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.14);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === "crystal") {
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
    } else if (type === "upgrade") {
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(freq, now + i * 0.07);
        g.gain.setValueAtTime(0.25, now + i * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.5);
        o.start(now + i * 0.07);
        o.stop(now + i * 0.07 + 0.5);
      });
    } else if (type === "victory") {
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
  } catch (e) {}
}

function vibrate(ms = 25) {
  if (navigator.vibrate) {
    try { navigator.vibrate(ms); } catch (e) {}
  }
}

// Camera Modes & FPS Viewmodel
let cameraMode = "fps"; // Default to First Person view as requested!
let cameraYaw = 0;
let cameraPitch = 0;
let walkBob = 0;
let isSprinting = false;
let fpsViewModel = null;

// Upgrades & Player State
const upgrades = {
  bow: 1,    // 1: Base (25 dmg), 2: Cadencia Rápida (40 dmg), 3: Flecha Triple
  drone: 1,  // 1: Pulso, 2: Láser de Plasma (35 dmg), 3: Escudo Deflector
  armor: 1,  // 1: Base (100 hp), 2: Placas Reforzadas (150 hp), 3: Paso Ancestral (200 hp, vel +30%)
};

const upgradeCosts = {
  bow: [0, 250, 500],
  drone: [0, 200, 450],
  armor: [0, 200, 450],
};

let playerEssence = 0;

const player = {
  group: null,
  heroine: null,
  health: 100,
  maxHealth: 100,
  energy: 100,
  speed: 9.5,
  velocity: new THREE.Vector3(),
  invulnerable: 0,
  shootCooldown: 0,
  specialCooldown: 0,
  shieldActive: false,
  enemiesDefeated: 0,
};

let currentLevel = 1;
let levelBoss = null;
let bolts = [];
let particles = [];
let enemies = [];
let crystals = [];
let portalCore;
let levelCleared = false;
let gameFinished = false;
let gameOver = false;
let elapsed = 0;
let lastFrameTime = performance.now();

// Drone Guardian Companion State
let droneAutoShootTimer = 0;
let droneCurrentTarget = null;
let droneScanAngle = 0;

// Touch Controls State
const joystick = {
  active: false,
  identifier: null,
  origin: { x: 0, y: 0 },
  current: { x: 0, y: 0 },
  vector: new THREE.Vector2(0, 0),
};
let touchLookId = null;
let prevTouchLook = { x: 0, y: 0 };

// Inspector Mode State
let inspectMode = false;
let currentView = "frontal";
let orbitAngles = { theta: 0, phi: 0.25, radius: 4.2 };
let isDragging = false;
let prevMousePos = { x: 0, y: 0 };
let isLeaderboardOpen = false;
let isUpgradeOpen = false;

// Shared Materials
const mats = {
  stone: new THREE.MeshStandardMaterial({ color: 0x596864, roughness: 0.9 }),
  stoneDark: new THREE.MeshStandardMaterial({ color: 0x35433f, roughness: 1 }),
  cyan: new THREE.MeshStandardMaterial({ color: 0x72f5ff, emissive: 0x23afbd, emissiveIntensity: 2.2 }),
  purple: new THREE.MeshStandardMaterial({ color: 0xad5bd1, emissive: 0x632080, emissiveIntensity: 1.5 }),
  enemy: new THREE.MeshStandardMaterial({ color: 0x35223f, emissive: 0x7f2490, emissiveIntensity: 1.2, roughness: 0.48 }),
  boss: new THREE.MeshStandardMaterial({ color: 0x24112e, emissive: 0x9e2cb0, emissiveIntensity: 2.0, roughness: 0.35, metalness: 0.6 }),
};

function mesh(geometry, material, shadows = true) {
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = shadows;
  object.receiveShadow = shadows;
  return object;
}

function showToast(text) {
  missionToast.textContent = text;
  missionToast.classList.remove("hidden");
  missionToast.style.animation = "none";
  void missionToast.offsetWidth;
  missionToast.style.animation = "toastFade 2.8s ease forwards";
}

function addEssence(amount) {
  playerEssence += amount;
  essenceCountText.textContent = playerEssence;
  modalEssenceCount.textContent = playerEssence;
  updateUpgradeUI();
}

function createWorld() {
  scene.add(new THREE.HemisphereLight(0xbfe8eb, 0x273322, 2.2));
  const sun = new THREE.DirectionalLight(0xffd4a0, 4.4);
  sun.position.set(-22, 36, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 42, bottom: -42 });
  scene.add(sun);

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
  const ruin = new THREE.Group();
  ruin.position.set(x, 0, z);
  ruin.rotation.y = rotation;
  const base = mesh(new THREE.BoxGeometry(12, 0.7, 5), mats.stoneDark);
  base.position.y = 0.35;
  ruin.add(base);
  [-4.8, 4.8].forEach((px, i) => {
    const pillar = mesh(new THREE.BoxGeometry(1.5, 6 - i * 1.2, 1.5), mats.stone);
    pillar.position.set(px, 3 - i * 0.6, 0);
    ruin.add(pillar);
  });
  const beam = mesh(new THREE.BoxGeometry(11.5, 1.1, 1.6), mats.stone);
  beam.position.set(0, 5.5, 0);
  ruin.add(beam);
  const rune = mesh(new THREE.BoxGeometry(5, 0.08, 0.12), mats.cyan, false);
  rune.position.set(0, 5.48, 0.86);
  ruin.add(rune);
  scene.add(ruin);
}

function createPortal(x, z) {
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
    const stem = mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.8, 5), trunkMat, false);
    stem.position.y = 0.4;
    plant.add(stem);
    const leaves = mesh(new THREE.ConeGeometry(0.35 + (i % 4) * 0.08, 1.1, 5), leafMats[i % 3], false);
    leaves.position.y = 0.95;
    plant.add(leaves);
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
    scene.add(mountain);
  }
}

function initPlayer() {
  const heroine = createProtagonist();
  heroine.root.position.set(-31, 0, 18);
  scene.add(heroine.root);

  player.group = heroine.root;
  player.heroine = heroine;

  // Create First-Person ViewModel attached directly to Camera
  const pMats = createProtagonistMaterials();
  fpsViewModel = createFPSViewModel(pMats);
  camera.add(fpsViewModel.fpsRig);

  applyPlayerUpgrades();
}

function applyPlayerUpgrades() {
  if (upgrades.armor === 1) {
    player.maxHealth = 100;
    player.speed = 9.5;
  } else if (upgrades.armor === 2) {
    player.maxHealth = 150;
    player.speed = 10.8;
  } else if (upgrades.armor === 3) {
    player.maxHealth = 200;
    player.speed = 12.2;
  }
  healthMeter.max = player.maxHealth;
  player.health = Math.min(player.health, player.maxHealth);

  player.heroine.applyUpgrades({
    bowLevel: upgrades.bow,
    droneLevel: upgrades.drone,
    armorLevel: upgrades.armor,
  });
}

function createCrystal(x, z) {
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

function loadLevel(levelNum) {
  currentLevel = levelNum;
  levelCleared = false;
  levelBanner.classList.add("hidden");

  enemies.forEach((e) => scene.remove(e.group));
  crystals.forEach((c) => scene.remove(c.group));
  bolts.forEach((b) => scene.remove(b.mesh));
  enemies = [];
  crystals = [];
  bolts = [];
  levelBoss = null;
  bossHud.classList.add("hidden");

  portalCore.material.color.set(0x183b43);
  portalCore.material.opacity = 0.28;

  if (currentLevel === 1) {
    levelTitle.textContent = "NIVEL 1";
    scene.background.set(0x89b6b5);
    scene.fog.color.set(0x8fb5ac);

    createCrystal(-21, 19);
    createCrystal(7, 13);
    createCrystal(24, -17);

    const configs = [[-16, 8], [-2, -7], [12, 9], [23, -4], [29, 17], [3, 20]];
    enemies = configs.map(([x, z], i) => spawnGuardian(x, z, 45, 2.2 + (i % 3) * 0.35, 1.0));
    showToast("✨ Misión: Sintoniza los 3 cristales ancestrales");
  } else if (currentLevel === 2) {
    levelTitle.textContent = "NIVEL 2";
    scene.background.set(0x453158);
    scene.fog.color.set(0x382647);

    createCrystal(-25, 12);
    createCrystal(-6, -16);
    createCrystal(14, 18);
    createCrystal(28, -6);

    const configs = [
      [-20, 5], [-12, -12], [-4, 8], [8, -8],
      [16, 6], [22, -14], [28, 12], [2, 22], [-18, 22]
    ];
    enemies = configs.map(([x, z], i) => spawnGuardian(x, z, 65, 3.2 + (i % 3) * 0.4, 1.1, true));
    showToast("⚡ Misión: Sintoniza los 4 monolitos sombríos");
  } else if (currentLevel === 3) {
    levelTitle.textContent = "NIVEL 3";
    scene.background.set(0x281a36);
    scene.fog.color.set(0x1e122b);

    createCrystal(-15, 0);
    createCrystal(15, 0);

    spawnTitanBoss(18, -12);
    enemies.push(spawnGuardian(-10, 14, 50, 2.8, 1.0));
    enemies.push(spawnGuardian(10, 14, 50, 2.8, 1.0));

    bossHud.classList.remove("hidden");
    bossHealthFill.style.width = "100%";
    showToast("👑 ¡Derrota al Titán Ancestral Corrupto!");
  }

  player.health = player.maxHealth;
  player.group.position.set(-31, 0, 18);
  player.velocity.set(0, 0, 0);
}

function spawnGuardian(x, z, health = 45, speed = 2.4, scale = 1.0, isElite = false) {
  const group = new THREE.Group();
  const body = mesh(new THREE.IcosahedronGeometry(0.95 * scale, 1), isElite ? mats.boss : mats.enemy);
  body.position.y = 1.35 * scale;
  group.add(body);

  const ring = mesh(new THREE.TorusGeometry(1.25 * scale, 0.09, 6, 18), mats.purple);
  ring.position.y = 1.35 * scale;
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  const eye = mesh(new THREE.SphereGeometry(0.2 * scale, 10, 8), mats.cyan);
  eye.position.set(0, 1.42 * scale, 0.96 * scale);
  group.add(eye);

  group.position.set(x, 0.15, z);
  scene.add(group);
  return { group, health, maxHealth: health, speed, isElite, isBoss: false };
}

function spawnTitanBoss(x, z) {
  const group = new THREE.Group();
  const scale = 2.6;

  const core = mesh(new THREE.DodecahedronGeometry(1.4 * scale), mats.boss);
  core.position.y = 3.6;
  group.add(core);

  const crown = mesh(new THREE.TorusGeometry(1.6 * scale, 0.2, 8, 24), mats.purple);
  crown.position.y = 4.2;
  crown.rotation.x = Math.PI / 2;
  group.add(crown);

  const mainEye = mesh(new THREE.SphereGeometry(0.6, 16, 12), mats.cyan);
  mainEye.position.set(0, 3.8, 2.2);
  group.add(mainEye);

  const auraRing = mesh(new THREE.RingGeometry(2.8 * scale, 3.2 * scale, 32), mats.cyan, false);
  auraRing.rotation.x = Math.PI / 2;
  auraRing.position.y = 0.2;
  group.add(auraRing);

  group.position.set(x, 0.2, z);
  scene.add(group);

  levelBoss = { group, health: 500, maxHealth: 500, speed: 1.8, isBoss: true };
  enemies.push(levelBoss);
}

// Combat: Shooting & Weapon Handling
function shoot() {
  if (inspectMode || isLeaderboardOpen || isUpgradeOpen || player.energy < 12 || player.shootCooldown > 0 || gameOver || gameFinished) return;
  initAudio();
  vibrate(25);

  const cooldownRate = upgrades.bow === 1 ? 0.24 : upgrades.bow === 2 ? 0.16 : 0.12;
  player.energy -= 12;
  player.shootCooldown = cooldownRate;
  playSound("shoot");

  let direction = new THREE.Vector3();
  let origin = new THREE.Vector3();

  if (cameraMode === "fps") {
    // In First Person, shoots straight where camera is looking
    camera.getWorldDirection(direction);
    origin.copy(camera.position).addScaledVector(direction, 0.6);
    fpsViewModel.playShoot();
  } else {
    // In Third Person, shoots from hero towards aim point
    origin.copy(player.group.position).add(new THREE.Vector3(0, 1.5, 0));
    direction.copy(aimPoint).sub(player.group.position);
    direction.y = 0;
    if (direction.lengthSq() < 0.01) direction.set(0, 0, -1);
    direction.normalize();
    player.heroine.playShootAnim();
  }

  const arrowDamage = upgrades.bow === 1 ? 25 : upgrades.bow === 2 ? 40 : 55;

  const fireBolt = (dirOffset = 0) => {
    const boltMesh = new THREE.Group();
    const arrowCore = mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), mats.cyan, false);
    arrowCore.rotation.x = Math.PI / 2;
    boltMesh.add(arrowCore);

    const headGlow = mesh(new THREE.ConeGeometry(0.12, 0.32, 6), mats.cyan, false);
    headGlow.rotation.x = -Math.PI / 2;
    headGlow.position.z = -0.7;
    boltMesh.add(headGlow);

    const finalDir = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), dirOffset);
    boltMesh.position.copy(origin).addScaledVector(finalDir, 0.8);
    boltMesh.lookAt(boltMesh.position.clone().add(finalDir));
    scene.add(boltMesh);
    bolts.push({ mesh: boltMesh, velocity: finalDir.multiplyScalar(32), damage: arrowDamage, life: 1.6 });
  };

  fireBolt(0);
  if (upgrades.bow >= 3) {
    fireBolt(0.15);
    fireBolt(-0.15);
  }
}

// Special Ability: Companion Guardian Shockwave / EMP
function triggerDroneShockwave() {
  if (inspectMode || player.energy < 32 || player.specialCooldown > 0 || gameOver || gameFinished) return;
  initAudio();
  vibrate(50);
  player.energy -= 32;
  player.specialCooldown = 3.5;
  playSound("shockwave");

  const center = player.group.position.clone();
  burst(center, 0x5df8ff, 36);

  showToast("💥 ¡Onda EMP del Guardián activada!");

  // Expand shockwave ring
  const shockRing = mesh(new THREE.RingGeometry(0.6, 1.4, 32), mats.cyan, false);
  shockRing.rotation.x = Math.PI / 2;
  shockRing.position.copy(center).add(new THREE.Vector3(0, 0.4, 0));
  scene.add(shockRing);

  enemies.forEach((enemy) => {
    const dist = enemy.group.position.distanceTo(center);
    if (dist < 16) {
      const pushDir = enemy.group.position.clone().sub(center).normalize();
      enemy.group.position.addScaledVector(pushDir, 5.0);
      enemy.health -= 50;
      burst(enemy.group.position, 0x5df8ff, 12);
      if (enemy.health <= 0) destroyEnemy(enemy);
    }
  });

  let radius = 1;
  const ringAnim = setInterval(() => {
    radius += 0.9;
    shockRing.scale.setScalar(radius);
    if (radius > 8) {
      clearInterval(ringAnim);
      scene.remove(shockRing);
      shockRing.geometry.dispose();
    }
  }, 25);
}

function destroyEnemy(enemy) {
  const idx = enemies.indexOf(enemy);
  if (idx !== -1) {
    burst(enemy.group.position, 0xd66cff, 22);
    playSound("hit");
    scene.remove(enemy.group);
    enemies.splice(idx, 1);
    player.enemiesDefeated += 1;
    addEssence(25);
    showToast("+25 💎 Esencia Ancestral");
  }
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

// Smart Companion Guardian AI (Autonomous Defense & Scanner)
function updateCompanionGuardian(dt) {
  const drone = player.heroine.drone;
  if (!drone) return;

  // 1. Autonomous Target Acquisition: find closest enemy
  let closestTarget = null;
  let closestDist = 24;
  enemies.forEach((enemy) => {
    const d = enemy.group.position.distanceTo(player.group.position);
    if (d < closestDist) {
      closestDist = d;
      closestTarget = enemy;
    }
  });

  droneCurrentTarget = closestTarget;

  if (closestTarget) {
    const enemyPos = closestTarget.group.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    drone.userData.spotTarget.position.copy(enemyPos);

    // Turn drone targeting laser on
    if (drone.userData.laser) {
      drone.userData.laser.material.opacity = 0.85;
      const pts = [
        new THREE.Vector3(0, 0, 0.35),
        drone.worldToLocal(enemyPos.clone())
      ];
      drone.userData.laser.geometry.setFromPoints(pts);
    }

    // Autonomous Plasma Darts
    droneAutoShootTimer -= dt;
    const fireInterval = upgrades.drone === 1 ? 1.4 : upgrades.drone === 2 ? 0.9 : 0.55;
    if (droneAutoShootTimer <= 0 && !gameOver && !gameFinished && !inspectMode) {
      droneAutoShootTimer = fireInterval;
      playSound("drone");
      const droneWorldPos = new THREE.Vector3();
      drone.getWorldPosition(droneWorldPos);
      const toEnemy = enemyPos.clone().sub(droneWorldPos).normalize();

      const droneBolt = mesh(new THREE.SphereGeometry(0.16, 6, 6), mats.cyan, false);
      droneBolt.scale.set(1, 1, 2.4);
      droneBolt.position.copy(droneWorldPos);
      droneBolt.lookAt(droneWorldPos.clone().add(toEnemy));
      scene.add(droneBolt);

      const droneDamage = upgrades.drone === 1 ? 18 : upgrades.drone === 2 ? 35 : 50;
      bolts.push({ mesh: droneBolt, velocity: toEnemy.multiplyScalar(36), damage: droneDamage, life: 1.2 });
      burst(droneWorldPos, 0x5ef4ff, 4);
    }
  } else {
    // Idle Scanner Spotlight sweep
    if (drone.userData.laser) drone.userData.laser.material.opacity = 0;
    droneScanAngle += dt * 1.5;
    const sweepX = Math.sin(droneScanAngle) * 7;
    drone.userData.spotTarget.position.set(sweepX, 0, 14);
  }

  // Shield Bubble positioning & rotation
  if (drone.userData.shieldBubble) {
    drone.userData.shieldBubble.visible = player.shieldActive;
    if (player.shieldActive) {
      drone.userData.shieldBubble.rotation.y += dt * 2.2;
      drone.userData.shieldBubble.rotation.x += dt * 1.2;
    }
  }

  // Positioning in First Person Mode
  if (cameraMode === "fps" && !inspectMode) {
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    camDir.y = 0;
    camDir.normalize();
    const right = new THREE.Vector3(-camDir.z, 0, camDir.x);

    const targetPos = camera.position.clone()
      .addScaledVector(camDir, 1.4)
      .addScaledVector(right, 1.1)
      .add(new THREE.Vector3(0, Math.sin(elapsed * 2.8) * 0.1 - 0.25, 0));

    drone.position.copy(player.group.worldToLocal(targetPos));
  }
}

function updateAim() {
  if (inspectMode || cameraMode === "fps") return;
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), aimPoint);
  const direction = aimPoint.clone().sub(player.group.position);
  direction.y = 0;
  if (direction.lengthSq() > 0.1) {
    player.group.rotation.y = Math.atan2(direction.x, direction.z);
  }
}

// Fluid Movement Physics with Acceleration & Friction
function updatePlayer(dt) {
  const currentSpeed = player.speed * (isSprinting ? 1.45 : 1.0);
  const move = new THREE.Vector3();

  if (cameraMode === "fps") {
    // Movement relative to camera view angle (FPS strafing and forward/back)
    const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    const right = new THREE.Vector3(-forward.z, 0, forward.x);

    if (keys.has("w") || keys.has("arrowup")) move.add(forward);
    if (keys.has("s") || keys.has("arrowdown")) move.sub(forward);
    if (keys.has("a") || keys.has("arrowleft")) move.sub(right);
    if (keys.has("d") || keys.has("arrowright")) move.add(right);

    if (joystick.active && joystick.vector.lengthSq() > 0.04) {
      move.addScaledVector(forward, -joystick.vector.y);
      move.addScaledVector(right, joystick.vector.x);
    }
  } else {
    // Isometric third person movement
    if (keys.has("w") || keys.has("arrowup")) move.z -= 1;
    if (keys.has("s") || keys.has("arrowdown")) move.z += 1;
    if (keys.has("a") || keys.has("arrowleft")) move.x -= 1;
    if (keys.has("d") || keys.has("arrowright")) move.x += 1;

    if (joystick.active && joystick.vector.lengthSq() > 0.04) {
      move.x += joystick.vector.x;
      move.z += joystick.vector.y;
    }
  }

  const isMoving = move.lengthSq() > 0.01;
  if (isMoving) move.normalize();

  // Smooth acceleration and deceleration
  const targetVelocity = move.multiplyScalar(isMoving ? currentSpeed : 0);
  player.velocity.lerp(targetVelocity, 1 - Math.exp(-14 * dt));
  player.group.position.addScaledVector(player.velocity, dt);

  player.group.position.x = THREE.MathUtils.clamp(player.group.position.x, -39, 39);
  player.group.position.z = THREE.MathUtils.clamp(player.group.position.z, -29, 29);

  // Head bobbing calculation for FPS
  if (isMoving) {
    walkBob += dt * (isSprinting ? 14 : 10);
  }

  // Energy & Cooldowns
  const energyRegen = upgrades.armor >= 2 ? 30 : 20;
  player.energy = Math.min(100, player.energy + energyRegen * dt);
  player.shootCooldown = Math.max(0, player.shootCooldown - dt);
  player.specialCooldown = Math.max(0, player.specialCooldown - dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);

  // Switch display between FPS and TPP
  if (cameraMode === "fps") {
    player.heroine.hips.visible = false;
    player.heroine.arcoDeLuz.visible = false;
    fpsViewModel.fpsRig.visible = !inspectMode;
    fpsViewModel.update(dt, isMoving, isSprinting ? 1.4 : 1.0);
    player.group.rotation.y = cameraYaw;
  } else {
    player.heroine.hips.visible = true;
    player.heroine.arcoDeLuz.visible = true;
    fpsViewModel.fpsRig.visible = false;
    updateAim();
    player.heroine.update(dt, isMoving, move, true, aimPoint, isSprinting ? 1.4 : 1.0);
  }

  updateCompanionGuardian(dt);
}

function updateCrystals(dt) {
  crystals.forEach((crystal) => {
    crystal.gem.rotation.y += dt * (crystal.active ? 1.9 : 0.7);
    crystal.gem.position.y = 2 + Math.sin(elapsed * 2.4) * 0.22;
    if (!crystal.active && crystal.group.position.distanceTo(player.group.position) < 3.3) {
      crystal.active = true;
      crystal.gem.material = mats.cyan;
      crystal.light.color.set(0x6ff6ff);
      crystal.light.intensity = 4.8;
      burst(crystal.group.position, 0x7cf7ff, 22);
      playSound("crystal");
      vibrate(30);
      addEssence(75);
      showToast("+75 💎 ¡Cristal Ancestral Sintonizado!");
    }
  });
}

function updateEnemies(dt) {
  enemies.forEach((enemy) => {
    const towardPlayer = player.group.position.clone().sub(enemy.group.position);
    const distance = towardPlayer.length();
    towardPlayer.y = 0;

    if (distance < 24 && distance > 1.6) {
      enemy.group.position.addScaledVector(towardPlayer.normalize(), enemy.speed * dt);
    }
    enemy.group.position.y = 0.15 + Math.sin(elapsed * 3) * 0.18;
    enemy.group.rotation.y += dt * 0.9;

    // Contact attack on player
    if (distance < 1.8 && player.invulnerable <= 0) {
      if (upgrades.drone >= 3 && !player.shieldActive) {
        player.shieldActive = true;
        showToast("🛡️ ¡El Guardián desplegó su Escudo Deflector!");
        burst(player.group.position, 0x5df8ff, 18);
        player.invulnerable = 1.2;
        setTimeout(() => { player.shieldActive = false; }, 10000);
        return;
      }

      player.health -= enemy.isBoss ? 28 : 14;
      player.invulnerable = 0.9;
      burst(player.group.position, 0xff6677, 12);
      playSound("hit");
      vibrate(50);
      if (player.health <= 0) {
        gameOver = true;
      }
    }
  });

  if (levelBoss) {
    const pct = Math.max(0, (levelBoss.health / levelBoss.maxHealth) * 100);
    bossHealthFill.style.width = `${pct}%`;
  }
}

function updateBolts(dt) {
  for (let i = bolts.length - 1; i >= 0; i -= 1) {
    const bolt = bolts[i];
    bolt.mesh.position.addScaledVector(bolt.velocity, dt);
    bolt.life -= dt;
    let hit = false;

    for (let j = enemies.length - 1; j >= 0; j -= 1) {
      const enemy = enemies[j];
      const hitRadius = enemy.isBoss ? 2.8 : 1.4;
      if (bolt.mesh.position.distanceTo(enemy.group.position.clone().add(new THREE.Vector3(0, 1, 0))) < hitRadius) {
        enemy.health -= bolt.damage;
        burst(enemy.group.position, 0x73eff7, 8);
        playSound("hit");
        hit = true;
        if (enemy.health <= 0) {
          destroyEnemy(enemy);
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

function updateCamera(dt) {
  if (inspectMode) {
    const charPos = player.group.position.clone().add(new THREE.Vector3(0, 1.4, 0));
    let targetPos = new THREE.Vector3();
    let lookTarget = charPos.clone();

    if (currentView === "frontal") {
      targetPos.set(0, 1.45, 3.4).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y).add(player.group.position);
    } else if (currentView === "perfil") {
      targetPos.set(3.4, 1.45, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y).add(player.group.position);
    } else if (currentView === "posterior") {
      targetPos.set(0, 1.5, -3.4).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y).add(player.group.position);
    } else if (currentView === "arco") {
      targetPos.set(1.4, 1.4, 1.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y).add(player.group.position);
      lookTarget = player.group.position.clone().add(new THREE.Vector3(0.5, 1.35, 0.1));
    } else if (currentView === "dron") {
      targetPos.set(2.4, 2.7, 0.6).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y).add(player.group.position);
      lookTarget = player.group.position.clone().add(new THREE.Vector3(1.3, 2.6, -0.7));
    } else {
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
  } else if (cameraMode === "fps") {
    // First-Person Mode: eye level + realistic head bobbing
    const bob = Math.sin(walkBob) * (player.velocity.length() > 0.5 ? 0.05 : 0.008);
    const eyePos = player.group.position.clone().add(new THREE.Vector3(0, 2.3 + bob, 0));
    camera.position.copy(eyePos);

    camera.rotation.order = "YXZ";
    camera.rotation.y = cameraYaw;
    camera.rotation.x = cameraPitch;
  } else {
    // Third-Person Mode: isometric chase view
    const isPortrait = camera.aspect < 1;
    const camOffset = isPortrait ? new THREE.Vector3(14, 26, 26) : new THREE.Vector3(12, 18, 18);
    const desired = player.group.position.clone().add(camOffset);
    camera.position.lerp(desired, 1 - Math.pow(0.002, dt));
    camera.lookAt(player.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
  }
}

function updateHud() {
  const activeCrystals = crystals.filter((c) => c.active).length;
  healthMeter.value = Math.max(0, player.health);
  energyMeter.value = player.energy;

  if (gameOver) {
    objectiveText.textContent = "La corrupción te alcanzó";
    message.innerHTML = "Has caído en batalla<small>Pulsa R para volver a intentarlo</small>";
  } else if (gameFinished) {
    objectiveText.textContent = "¡EL REINO DEL ALBA HA SIDO SALVADO!";
    message.innerHTML = "¡Victoria Legendaria!<small>Récord registrado en la Base de Datos</small>";
  } else {
    if (currentLevel === 1) {
      objectiveText.textContent = `Cristales (${activeCrystals}/3) · Guardianes (${player.enemiesDefeated}/6)`;
      subObjectiveText.textContent = `Secundaria: Purifica a los guardianes`;
    } else if (currentLevel === 2) {
      objectiveText.textContent = `Monolitos sombríos (${activeCrystals}/4)`;
      subObjectiveText.textContent = `Secundaria: Enemigos restantes: ${enemies.length}`;
    } else if (currentLevel === 3) {
      objectiveText.textContent = `¡Derrota al Titán Ancestral!`;
      subObjectiveText.textContent = `Cristales de apoyo (${activeCrystals}/2)`;
    }
  }
}

function toggleCameraMode() {
  cameraMode = cameraMode === "fps" ? "tpp" : "fps";
  if (camToggleText) {
    camToggleText.textContent = cameraMode === "fps" ? "1ra Persona" : "3ra Persona";
  }
  showToast(cameraMode === "fps" ? "🎥 Vista: Primera Persona (FPS)" : "🎥 Vista: Tercera Persona (Isométrica)");
  resizeGame();
}

function updateUpgradeUI() {
  modalEssenceCount.textContent = playerEssence;
  essenceCountText.textContent = playerEssence;

  const bowCost = upgradeCosts.bow[upgrades.bow] || 0;
  btnUpgradeBow.disabled = upgrades.bow >= 3 || playerEssence < bowCost;
  btnUpgradeBow.innerHTML = upgrades.bow >= 3 ? "NIVEL MÁXIMO" : `Mejorar <span class="cost-tag">${bowCost} 💎</span>`;
  document.querySelectorAll("#bow-dots .dot").forEach((d, i) => d.classList.toggle("active", i < upgrades.bow));

  const droneCost = upgradeCosts.drone[upgrades.drone] || 0;
  btnUpgradeDrone.disabled = upgrades.drone >= 3 || playerEssence < droneCost;
  btnUpgradeDrone.innerHTML = upgrades.drone >= 3 ? "NIVEL MÁXIMO" : `Mejorar <span class="cost-tag">${droneCost} 💎</span>`;
  document.querySelectorAll("#drone-dots .dot").forEach((d, i) => d.classList.toggle("active", i < upgrades.drone));

  const armorCost = upgradeCosts.armor[upgrades.armor] || 0;
  btnUpgradeArmor.disabled = upgrades.armor >= 3 || playerEssence < armorCost;
  btnUpgradeArmor.innerHTML = upgrades.armor >= 3 ? "NIVEL MÁXIMO" : `Mejorar <span class="cost-tag">${armorCost} 💎</span>`;
  document.querySelectorAll("#armor-dots .dot").forEach((d, i) => d.classList.toggle("active", i < upgrades.armor));
}

function buyUpgrade(tree) {
  const currentLvl = upgrades[tree];
  if (currentLvl >= 3) return;
  const cost = upgradeCosts[tree][currentLvl];
  if (playerEssence >= cost) {
    playerEssence -= cost;
    upgrades[tree] += 1;
    playSound("upgrade");
    vibrate(40);
    applyPlayerUpgrades();
    updateUpgradeUI();
    showToast(`⚡ ¡${tree.toUpperCase()} mejorado a Nivel ${upgrades[tree]}!`);
  }
}

function checkLevelCompletion() {
  if (levelCleared || gameOver || gameFinished) return;

  const allCrystalsActive = crystals.every((c) => c.active);
  let isComplete = false;

  if (currentLevel === 1 && allCrystalsActive && enemies.length === 0) {
    isComplete = true;
  } else if (currentLevel === 2 && allCrystalsActive && enemies.length <= 1) {
    isComplete = true;
  } else if (currentLevel === 3 && levelBoss && levelBoss.health <= 0) {
    isComplete = true;
  }

  if (isComplete) {
    levelCleared = true;
    playSound("victory");
    portalCore.material.color.set(0x52e8f2);
    portalCore.material.opacity = 0.76;

    if (currentLevel < 3) {
      bannerTitle.textContent = `¡NIVEL ${currentLevel} COMPLETADO!`;
      bannerDesc.textContent = `Has sintonizado el portal ancestral. Listo para avanzar al Nivel ${currentLevel + 1}.`;
      btnNextLevel.textContent = `Continuar al Nivel ${currentLevel + 1} →`;
      setTimeout(() => { levelBanner.classList.remove("hidden"); }, 1200);
    } else {
      gameFinished = true;
      setTimeout(() => { openLeaderboard(true); }, 1500);
    }
  }
}

btnNextLevel.addEventListener("click", () => {
  if (currentLevel < 3) {
    loadLevel(currentLevel + 1);
  }
});

// Leaderboard Database Logic
async function fetchScores() {
  leaderboardBody.innerHTML = '<tr><td colspan="5" class="loading-td">Cargando récords ancestrales...</td></tr>';
  try {
    const res = await fetch("/api/scores");
    const data = await res.json();
    if (data.source === "vercel_postgres") {
      dbStatusTag.textContent = "Conectado a Vercel Postgres";
    } else {
      dbStatusTag.textContent = "Modo Demo / En Memoria";
    }

    const list = data.scores || [];
    leaderboardBody.innerHTML = list.map((item, idx) => `
      <tr>
        <td><strong>#${idx + 1}</strong></td>
        <td>${item.player_name || "Anónimo"}</td>
        <td><strong style="color: #6cf5ff;">${item.score.toLocaleString()}</strong></td>
        <td>${item.crystals}</td>
        <td>${item.time_seconds}s</td>
      </tr>
    `).join("");
  } catch (err) {
    dbStatusTag.textContent = "Modo Local";
    leaderboardBody.innerHTML = `
      <tr><td>#1</td><td>Aura</td><td><strong style="color: #6cf5ff;">4,500</strong></td><td>9</td><td>82s</td></tr>
      <tr><td>#2</td><td>Kael</td><td><strong style="color: #6cf5ff;">3,800</strong></td><td>7</td><td>95s</td></tr>
    `;
  }
}

function openLeaderboard(allowSubmit = false) {
  isLeaderboardOpen = true;
  leaderboardModal.classList.remove("hidden");
  fetchScores();
  if (allowSubmit) {
    const totalScore = Math.floor(playerEssence * 5 + player.health * 10 + player.enemiesDefeated * 100);
    summaryScore.textContent = totalScore.toLocaleString();
    summaryTime.textContent = Math.max(1, Math.floor(elapsed));
    scoreSubmitBox.classList.remove("hidden");
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
  const totalScore = Math.floor(playerEssence * 5 + player.health * 10 + player.enemiesDefeated * 100);
  const timeSec = Math.max(1, Math.floor(elapsed));

  try {
    await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_name: name, score: totalScore, crystals: 9, time_seconds: timeSec }),
    });
    scoreSubmitBox.classList.add("hidden");
    fetchScores();
  } catch (err) {
    scoreSubmitBox.classList.add("hidden");
  }
});

btnLeaderboard.addEventListener("click", () => openLeaderboard(false));
btnCloseLeaderboard.addEventListener("click", closeLeaderboard);

btnUpgradeOpen.addEventListener("click", () => {
  isUpgradeOpen = true;
  updateUpgradeUI();
  upgradeModal.classList.remove("hidden");
});
btnCloseUpgrade.addEventListener("click", () => {
  isUpgradeOpen = false;
  upgradeModal.classList.add("hidden");
});
btnUpgradeBow.addEventListener("click", () => buyUpgrade("bow"));
btnUpgradeDrone.addEventListener("click", () => buyUpgrade("drone"));
btnUpgradeArmor.addEventListener("click", () => buyUpgrade("armor"));

// Mobile Touch Virtual Joystick & Tap to Aim / Look
function handleTouchStart(e) {
  initAudio();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    if (t.clientX < window.innerWidth * 0.44) {
      if (!joystick.active) {
        joystick.active = true;
        joystick.identifier = t.identifier;
        const rect = joystickBase.getBoundingClientRect();
        joystick.origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        updateJoystick(t.clientX, t.clientY);
      }
    } else {
      if (!inspectMode && !isLeaderboardOpen && !isUpgradeOpen) {
        const target = e.target;
        if (!target.closest("button") && !target.closest("input") && !target.closest(".modal-box")) {
          touchLookId = t.identifier;
          prevTouchLook = { x: t.clientX, y: t.clientY };
          // If in TPP, shoot toward tap point
          if (cameraMode === "tpp") {
            mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
            shoot();
          }
        }
      }
    }
  }
}

function handleTouchMove(e) {
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    if (joystick.active && t.identifier === joystick.identifier) {
      updateJoystick(t.clientX, t.clientY);
    }
    // Rotate look angle in FPS mode on touch drag
    if (cameraMode === "fps" && t.identifier === touchLookId) {
      const dx = t.clientX - prevTouchLook.x;
      const dy = t.clientY - prevTouchLook.y;
      cameraYaw -= dx * 0.005;
      cameraPitch = THREE.MathUtils.clamp(cameraPitch - dy * 0.004, -1.2, 1.2);
      prevTouchLook = { x: t.clientX, y: t.clientY };
    }
  }
}

function handleTouchEnd(e) {
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    if (joystick.active && t.identifier === joystick.identifier) {
      joystick.active = false;
      joystick.identifier = null;
      joystick.vector.set(0, 0);
      joystickThumb.style.transform = `translate(0px, 0px)`;
    }
    if (t.identifier === touchLookId) {
      touchLookId = null;
    }
  }
}

function updateJoystick(touchX, touchY) {
  const dx = touchX - joystick.origin.x;
  const dy = touchY - joystick.origin.y;
  const maxRadius = 40;
  const dist = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const clampedDist = Math.min(dist, maxRadius);

  const thumbX = Math.cos(angle) * clampedDist;
  const thumbY = Math.sin(angle) * clampedDist;
  joystickThumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

  joystick.vector.set(thumbX / maxRadius, thumbY / maxRadius);
}

window.addEventListener("touchstart", handleTouchStart, { passive: false });
window.addEventListener("touchmove", handleTouchMove, { passive: false });
window.addEventListener("touchend", handleTouchEnd, { passive: false });
window.addEventListener("touchcancel", handleTouchEnd, { passive: false });

// Action Buttons
btnTouchShoot.addEventListener("touchstart", (e) => { e.preventDefault(); e.stopPropagation(); shoot(); });
btnTouchShoot.addEventListener("pointerdown", (e) => { e.stopPropagation(); shoot(); });
btnTouchSpecial.addEventListener("touchstart", (e) => { e.preventDefault(); e.stopPropagation(); triggerDroneShockwave(); });
btnTouchSpecial.addEventListener("pointerdown", (e) => { e.stopPropagation(); triggerDroneShockwave(); });
btnTouchCam.addEventListener("click", () => toggleCameraMode());
btnTouchDash.addEventListener("click", () => {
  isSprinting = !isSprinting;
  showToast(isSprinting ? "💨 ¡Sprint Activado!" : "Modo Normal");
});

btnCamToggle.addEventListener("click", toggleCameraMode);

function resetGame() {
  elapsed = 0;
  playerEssence = 0;
  player.enemiesDefeated = 0;
  gameOver = false;
  gameFinished = false;
  message.textContent = "";
  loadLevel(1);
  updateUpgradeUI();
  closeLeaderboard();
}

function setInspectMode(active) {
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

function resizeGame() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.fov = cameraMode === "fps" ? 65 : (camera.aspect < 1 ? 68 : 50);
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resizeGame);
window.addEventListener("orientationchange", () => setTimeout(resizeGame, 100));

// Desktop Controls & Pointer Lock
canvas.addEventListener("click", () => {
  if (cameraMode === "fps" && !inspectMode && !isLeaderboardOpen && !isUpgradeOpen) {
    try { canvas.requestPointerLock(); } catch (e) {}
  }
});

window.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement === canvas && cameraMode === "fps" && !inspectMode) {
    cameraYaw -= e.movementX * 0.0024;
    cameraPitch = THREE.MathUtils.clamp(cameraPitch - e.movementY * 0.0022, -1.25, 1.25);
  }
});

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  keys.add(k);
  if (e.key === " " && !inspectMode) { e.preventDefault(); shoot(); }
  if (e.key === "Shift") isSprinting = true;
  if (k === "q") triggerDroneShockwave();
  if (k === "c") toggleCameraMode();
  if (k === "r") resetGame();
  if (k === "v") setInspectMode(!inspectMode);
  if (k === "u") {
    isUpgradeOpen = !isUpgradeOpen;
    upgradeModal.classList.toggle("hidden", !isUpgradeOpen);
    if (isUpgradeOpen) updateUpgradeUI();
  }
  if (k === "t") openLeaderboard(false);
  if (e.key === "Escape") {
    closeLeaderboard();
    upgradeModal.classList.add("hidden");
    if (inspectMode) setInspectMode(false);
  }
});

window.addEventListener("keyup", (e) => {
  keys.delete(e.key.toLowerCase());
  if (e.key === "Shift") isSprinting = false;
});

canvas.addEventListener("pointermove", (e) => {
  if (inspectMode && isDragging) {
    const deltaX = e.clientX - prevMousePos.x;
    const deltaY = e.clientY - prevMousePos.y;
    orbitAngles.theta -= deltaX * 0.008;
    orbitAngles.phi = THREE.MathUtils.clamp(orbitAngles.phi + deltaY * 0.008, -0.4, 1.2);
    prevMousePos = { x: e.clientX, y: e.clientY };
    currentView = "orbit";
  } else if (cameraMode === "tpp") {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }
});

canvas.addEventListener("pointerdown", (e) => {
  initAudio();
  if (inspectMode) {
    isDragging = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
  } else if (e.pointerType === "mouse") {
    shoot();
  }
});

window.addEventListener("pointerup", () => { isDragging = false; });

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

// Main Game Loop
function animate(frameTime = performance.now()) {
  const dt = Math.min((frameTime - lastFrameTime) / 1000, 0.033);
  lastFrameTime = frameTime;
  elapsed += dt;

  if (inspectMode || isLeaderboardOpen || isUpgradeOpen) {
    player.heroine.update(dt, false, null, false, null);
    updateParticles(dt);
  } else if (!gameOver && !gameFinished) {
    updatePlayer(dt);
    updateCrystals(dt);
    updateEnemies(dt);
    updateBolts(dt);
    updateParticles(dt);
    checkLevelCompletion();
  } else {
    player.heroine.update(dt, false, null, false, null);
    updateParticles(dt);
  }

  updateCamera(dt);
  updateHud();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Start Game
createWorld();
initPlayer();
loadLevel(1);
resizeGame();
camera.position.set(-31, 2.3, 18);
animate();
