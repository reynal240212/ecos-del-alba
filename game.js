import * as THREE from "three";
import { buildForestWorld } from "./forest-world.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createProtagonist, createProtagonistMaterials, createFPSViewModel } from "./character.js";

let blenderHeroine = null;
let blenderMixer = null;
let blenderActions = {};
let activeBlenderAction = null;
import { musicEngine } from "./music.js";
import { createSentinelDrone, createCorruptedStalker, createTitanBossModel } from "./enemies.js";
import { ACCESSORY_CATALOG, WardrobeManager } from "./wardrobe.js";
import { profileManager } from "./profile.js";
import { ChestManager } from "./chests.js";

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
const btnMusicToggle = document.querySelector("#btn-music-toggle");
const musicIcon = document.querySelector("#music-icon");
const musicText = document.querySelector("#music-text");
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

// Main Menu, Settings, Profile & Wardrobe Shop DOM Elements
const mainMenuOverlay = document.querySelector("#main-menu-overlay");
const btnStartGame = document.querySelector("#btn-start-game");
const btnContinueGame = document.querySelector("#btn-continue-game");
const btnContinueSub = document.querySelector("#btn-continue-sub");
const btnOpenGalleryMenu = document.querySelector("#btn-open-gallery-menu");
const btnOpenShopMenu = document.querySelector("#btn-open-shop-menu");
const btnOpenRecordsMenu = document.querySelector("#btn-open-records-menu");
const btnOpenSettingsMenu = document.querySelector("#btn-open-settings-menu");
const btnOpenCreditsMenu = document.querySelector("#btn-open-credits-menu");
const creditsModal = document.querySelector("#credits-modal");
const btnCloseCredits = document.querySelector("#btn-close-credits");
const btnCreditsBack = document.querySelector("#btn-credits-back");
const btnMenuSwitchUser = document.querySelector("#btn-menu-switch-user");
const menuAvatarIcon = document.querySelector("#menu-avatar-icon");
const menuPlayerName = document.querySelector("#menu-player-name");
const menuPlayerLevel = document.querySelector("#menu-player-level");
const menuPlayerXp = document.querySelector("#menu-player-xp");
const menuPlayerEssence = document.querySelector("#menu-player-essence");
let openedInspectFromMenu = false;
let openedModalFromMenu = false;
let cameraTransitionTimer = 0;
const CAMERA_TRANSITION_DURATION = 0.85;

const btnProfileOpen = document.querySelector("#btn-profile-open");
const hudAvatarIcon = document.querySelector("#hud-avatar-icon");
const hudUsername = document.querySelector("#hud-username");
const hudLevelTag = document.querySelector("#hud-level-tag");
const hudXpFill = document.querySelector("#hud-xp-fill");

const profileModal = document.querySelector("#profile-modal");
const btnCloseProfile = document.querySelector("#btn-close-profile");
const profileForm = document.querySelector("#profile-form");
const inputProfileName = document.querySelector("#input-profile-name");
const avatarOptButtons = document.querySelectorAll(".avatar-opt-btn");
const profStatLevel = document.querySelector("#prof-stat-level");
const profStatXp = document.querySelector("#prof-stat-xp");
const profStatEssence = document.querySelector("#prof-stat-essence");

const btnSettingsOpen = document.querySelector("#btn-settings-open");
const settingsModal = document.querySelector("#settings-modal");
const btnCloseSettings = document.querySelector("#btn-close-settings");
const sliderVolumeMaster = document.querySelector("#slider-volume-master");
const valVolumeMaster = document.querySelector("#val-volume-master");
const sliderVolumeMusic = document.querySelector("#slider-volume-music");
const valVolumeMusic = document.querySelector("#val-volume-music");
const sliderVolumeSfx = document.querySelector("#slider-volume-sfx");
const valVolumeSfx = document.querySelector("#val-volume-sfx");
const selectShadows = document.querySelector("#select-shadows");
const selectParticles = document.querySelector("#select-particles");
const sliderMouseSens = document.querySelector("#slider-mouse-sens");
const valMouseSens = document.querySelector("#val-mouse-sens");
const btnResumeGame = document.querySelector("#btn-resume-game");
const btnRestartLevel = document.querySelector("#btn-restart-level");
const btnReturnMainMenu = document.querySelector("#btn-return-main-menu");

const btnWardrobeOpen = document.querySelector("#btn-wardrobe-open");
const wardrobeModal = document.querySelector("#wardrobe-modal");
const btnCloseWardrobe = document.querySelector("#btn-close-wardrobe");
const wardrobeEssenceVal = document.querySelector("#wardrobe-essence-val");
const wardrobeTabs = document.querySelectorAll(".wardrobe-tab");
const wardrobeItemsGrid = document.querySelector("#wardrobe-items-grid");

// Chest Interaction Elements
const chestPrompt = document.querySelector("#chest-prompt");
const btnOpenChest = document.querySelector("#btn-open-chest");
const btnTouchInteract = document.querySelector("#btn-touch-interact");

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
const btnFullscreenToggle = document.querySelector("#btn-fullscreen-toggle");
const btnMenuFullscreen = document.querySelector("#btn-menu-fullscreen");
const btnTouchFullscreen = document.querySelector("#btn-touch-fullscreen");

// Audio & Game Settings State
const audioSettings = {
  master: 0.8,
  music: 0.7,
  sfx: 0.85,
  mouseSensitivity: 0.0024,
};

let isGamePaused = true; // Paused while on Main Menu
let isSettingsOpen = false;
let isWardrobeOpen = false;
let isProfileOpen = false;
let currentWardrobeTab = "head";
let currentSelectedAvatar = "🏹";
let activeNearChest = null;

// Three.js Core Setup & Mobile 60 FPS Optimization
const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (window.innerWidth < 768);
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !isMobileDevice,
  powerPreference: "high-performance",
  precision: isMobileDevice ? "mediump" : "highp"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileDevice ? 1.0 : 1.5));
renderer.shadowMap.enabled = !isMobileDevice;
renderer.shadowMap.type = THREE.BasicShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x89b6b5);
scene.fog = new THREE.FogExp2(0x8fb5ac, 0.012);
const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 260);
scene.add(camera);

const keys = new Set();
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const aimPoint = new THREE.Vector3(0, 0, -8);
const WORLD = { width: 88, depth: 68 };

// Audio Context for Sound Effects
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
  const sfxVol = audioSettings.master * audioSettings.sfx;
  if (sfxVol <= 0.001) return;

  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "shoot") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.16);
      gain.gain.setValueAtTime(0.28 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === "enemyShoot") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);
      gain.gain.setValueAtTime(0.2 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "shockwave") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.45);
      gain.gain.setValueAtTime(0.48 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === "drone") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.setValueAtTime(1900, now + 0.05);
      gain.gain.setValueAtTime(0.12 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "hit") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.14);
      gain.gain.setValueAtTime(0.25 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === "crystal" || type === "chest") {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(freq, now + i * 0.08);
        g.gain.setValueAtTime(0.22 * sfxVol, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);
        o.start(now + i * 0.08);
        o.stop(now + i * 0.08 + 0.6);
      });
    } else if (type === "levelup") {
      [440, 554.37, 659.25, 880, 1108.7].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = "triangle";
        o.frequency.setValueAtTime(freq, now + i * 0.09);
        g.gain.setValueAtTime(0.3 * sfxVol, now + i * 0.09);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.8);
        o.start(now + i * 0.09);
        o.stop(now + i * 0.09 + 0.8);
      });
    } else if (type === "upgrade") {
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(freq, now + i * 0.07);
        g.gain.setValueAtTime(0.25 * sfxVol, now + i * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.5);
        o.start(now + i * 0.07);
        o.stop(now + i * 0.07 + 0.5);
      });
    } else if (type === "victory") {
      [261.63, 329.63, 392.0, 523.25, 659.25].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = "triangle";
        o.frequency.setValueAtTime(freq, now + i * 0.12);
        g.gain.setValueAtTime(0.25 * sfxVol, now + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 1.2);
        o.start(now + i * 0.12);
        o.stop(now + i * 0.12 + 1.2);
      });
    } else if (type === "uiHover") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.04);
      gain.gain.setValueAtTime(0.08 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "uiClick") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587, now);
      osc.frequency.exponentialRampToValueAtTime(987, now + 0.08);
      gain.gain.setValueAtTime(0.18 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (e) {}
}

function vibrate(ms = 25) {
  if (navigator.vibrate) {
    try { navigator.vibrate(ms); } catch (e) {}
  }
}

// ==========================================================================
// Robust 3D Collision System
// ==========================================================================
let worldColliders = [];

function addCircleCollider(x, z, radius, name = "prop") {
  worldColliders.push({ type: "circle", x, z, radius, name });
}

function addBoxCollider(minX, maxX, minZ, maxZ, name = "box") {
  worldColliders.push({ type: "box", minX, maxX, minZ, maxZ, name });
}

function resolveWorldCollision(position, radius = 0.65) {
  for (let i = 0; i < worldColliders.length; i++) {
    const col = worldColliders[i];
    if (col.type === "circle") {
      const dx = position.x - col.x;
      const dz = position.z - col.z;
      const minDist = radius + col.radius;
      const distSq = dx * dx + dz * dz;
      if (distSq < minDist * minDist && distSq > 0.00001) {
        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;
        position.x += (dx / dist) * overlap;
        position.z += (dz / dist) * overlap;
      }
    } else if (col.type === "box") {
      const nearestX = Math.max(col.minX, Math.min(position.x, col.maxX));
      const nearestZ = Math.max(col.minZ, Math.min(position.z, col.maxZ));
      const dx = position.x - nearestX;
      const dz = position.z - nearestZ;
      const distSq = dx * dx + dz * dz;
      if (distSq < radius * radius) {
        if (position.x >= col.minX && position.x <= col.maxX && position.z >= col.minZ && position.z <= col.maxZ) {
          const dLeft = position.x - col.minX;
          const dRight = col.maxX - position.x;
          const dTop = position.z - col.minZ;
          const dBottom = col.maxZ - position.z;
          const minD = Math.min(dLeft, dRight, dTop, dBottom);
          if (minD === dLeft) position.x = col.minX - radius;
          else if (minD === dRight) position.x = col.maxX + radius;
          else if (minD === dTop) position.z = col.minZ - radius;
          else position.z = col.maxZ + radius;
        } else {
          const dist = Math.sqrt(distSq);
          if (dist > 0.00001) {
            const overlap = radius - dist;
            position.x += (dx / dist) * overlap;
            position.z += (dz / dist) * overlap;
          }
        }
      }
    }
  }

  position.x = THREE.MathUtils.clamp(position.x, -41, 41);
  position.z = THREE.MathUtils.clamp(position.z, -31, 31);
}

function checkProjectileCollision(position, radius = 0.25) {
  for (let i = 0; i < worldColliders.length; i++) {
    const col = worldColliders[i];
    if (col.type === "circle") {
      const dx = position.x - col.x;
      const dz = position.z - col.z;
      const minDist = radius + col.radius;
      if (dx * dx + dz * dz < minDist * minDist) return true;
    } else if (col.type === "box") {
      if (
        position.x >= col.minX - radius &&
        position.x <= col.maxX + radius &&
        position.z >= col.minZ - radius &&
        position.z <= col.maxZ + radius
      ) {
        return true;
      }
    }
  }
  return false;
}

// ==========================================================================
// Procedural 3D Terrain Height
// ==========================================================================
function getTerrainHeight(x, z) {
  const dCenter = Math.hypot(x, z);
  const flatFactor = Math.min(1, Math.max(0, (dCenter - 6) / 16));

  const hill1 = Math.sin(x * 0.09) * Math.cos(z * 0.08) * 1.9;
  const hill2 = Math.sin(x * 0.2 + 0.8) * Math.cos(z * 0.17 - 0.4) * 0.95;
  const ridge = Math.cos((x - z) * 0.07) * 0.65;

  const edgeX = Math.max(0, Math.abs(x) - 32);
  const edgeZ = Math.max(0, Math.abs(z) - 23);
  const edgeLift = (edgeX * edgeX + edgeZ * edgeZ) * 0.012;

  return (hill1 + hill2 + ridge) * flatFactor + edgeLift;
}

// Camera Modes & FPS Viewmodel
let cameraMode = "tpp";
let cameraYaw = 0;
let cameraPitch = -0.12;
let walkBob = 0;
let isSprinting = false;
let fpsViewModel = null;

// Upgrades & Player State
const upgrades = {
  bow: 1,
  drone: 1,
  armor: 1,
};

const upgradeCosts = {
  bow: [0, 250, 500],
  drone: [0, 200, 450],
  armor: [0, 200, 450],
};

const player = {
  group: null,
  heroine: null,
  health: 100,
  maxHealth: 100,
  energy: 100,
  speed: 9.5,
  velocity: new THREE.Vector3(),
  verticalVelocity: 0,
  grounded: true,
  invulnerable: 0,
  shootCooldown: 0,
  specialCooldown: 0,
  shieldActive: false,
  enemiesDefeated: 0,
};

let currentLevel = 1;
let levelBoss = null;
let bolts = [];
let enemyBolts = [];
let particles = [];
let ambientMotes = [];
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

// Chest Manager & Wardrobe Manager instances
let chestManager = null;
let wardrobeManager = null;
let protagonistMaterials = null;

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
  stone: new THREE.MeshStandardMaterial({ color: 0x596864, roughness: 0.88 }),
  stoneDark: new THREE.MeshStandardMaterial({ color: 0x2b3834, roughness: 0.95 }),
  cyan: new THREE.MeshStandardMaterial({ color: 0x72f5ff, emissive: 0x23afbd, emissiveIntensity: 2.2 }),
  purple: new THREE.MeshStandardMaterial({ color: 0xad5bd1, emissive: 0x632080, emissiveIntensity: 1.8 }),
  enemy: new THREE.MeshStandardMaterial({ color: 0x301e38, emissive: 0x822194, emissiveIntensity: 1.4, roughness: 0.45 }),
  boss: new THREE.MeshStandardMaterial({ color: 0x200e28, emissive: 0xaa27bd, emissiveIntensity: 2.2, roughness: 0.35, metalness: 0.65 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xffd152, emissive: 0xcc8d08, emissiveIntensity: 1.6, metalness: 0.8, roughness: 0.25 }),
  bark: new THREE.MeshStandardMaterial({ color: 0x223028, roughness: 0.95 }),
  foliage: new THREE.MeshStandardMaterial({ color: 0x386d4e, roughness: 0.85 }),
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
  profileManager.addEssence(amount);
  updateProfileUI();
  updateUpgradeUI();
  updateWardrobeUI();
}

// ==========================================================================
// User Profile, Leveling & XP Progression System
// ==========================================================================
function updateProfileUI() {
  const u = profileManager.user;
  // HUD Badge
  if (hudAvatarIcon) hudAvatarIcon.textContent = u.avatarIcon;
  if (hudUsername) hudUsername.textContent = u.name;
  if (hudLevelTag) hudLevelTag.textContent = `NVL ${u.level}`;
  const pct = Math.min(100, (u.xp / u.xpToNext) * 100);
  if (hudXpFill) hudXpFill.style.width = `${pct}%`;
  if (essenceCountText) essenceCountText.textContent = u.essence;

  // Main Menu Card
  if (menuAvatarIcon) menuAvatarIcon.textContent = u.avatarIcon;
  if (menuPlayerName) menuPlayerName.textContent = u.name;
  if (menuPlayerLevel) menuPlayerLevel.textContent = `Nivel ${u.level}`;
  if (menuPlayerXp) menuPlayerXp.textContent = `${u.xp} / ${u.xpToNext} XP`;
  if (menuPlayerEssence) menuPlayerEssence.textContent = u.essence;
  if (btnContinueSub) btnContinueSub.textContent = `Reanudar Nivel ${currentLevel} (${u.name})`;

  // Profile Modal Stats
  if (profStatLevel) profStatLevel.textContent = u.level;
  if (profStatXp) profStatXp.textContent = `${u.xp}/${u.xpToNext}`;
  if (profStatEssence) profStatEssence.textContent = u.essence;
  if (inputProfileName) inputProfileName.value = u.name;
}

profileManager.onLevelUp = (newLevel) => {
  playSound("levelup");
  vibrate(60);
  player.health = player.maxHealth;
  player.energy = 100;
  burst(player.group.position, 0x52f8af, 32);
  showToast(`⭐ ¡SUBIDA DE NIVEL! Ahora eres Nivel ${newLevel} (+100 💎)`);
  updateProfileUI();
};

profileManager.onProfileChange = () => {
  updateProfileUI();
};

function awardXp(amount, reason = "") {
  const res = profileManager.addXp(amount);
  updateProfileUI();
  if (reason) {
    showToast(`+${amount} XP ${reason}`);
  }
}

// ==========================================================================
// Enhanced 3D World Generation with Full Colliders & Rich Atmosphere
// ==========================================================================
function createWorld() {
  worldColliders = [];

  scene.add(new THREE.HemisphereLight(0xcdeff8, 0x2e3b2e, 2.5));
  const sun = new THREE.DirectionalLight(0xffebd2, 3.8);
  sun.position.set(-26, 42, 22);
  sun.castShadow = !isMobileDevice;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -52, right: 52, top: 46, bottom: -46, near: 1, far: 140 });
  scene.add(sun);

  const fillLight = new THREE.DirectionalLight(0x8ae5ea, 1.5);
  fillLight.position.set(24, 18, -18);
  scene.add(fillLight);

  // Iluminación cinemática 3D para Aria en la pantalla de inicio
  const titleSpot = new THREE.SpotLight(0x5ef4ff, 3.5, 18, Math.PI / 3.8, 0.4, 1.2);
  titleSpot.position.set(-28, 6, 23);
  titleSpot.target.position.set(-31, 1.4, 18);
  scene.add(titleSpot);
  scene.add(titleSpot.target);

  const titleRim = new THREE.DirectionalLight(0xffebd2, 1.8);
  titleRim.position.set(-34, 4, 15);
  scene.add(titleRim);

  const groundGeo = new THREE.PlaneGeometry(WORLD.width, WORLD.depth, 76, 58);
  const positions = groundGeo.attributes.position;
  const colors = [];
  const tint = new THREE.Color();

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const worldX = x;
    const worldZ = -y;
    const height = getTerrainHeight(worldX, worldZ);
    positions.setZ(i, height);

    const dCenter = Math.hypot(worldX, worldZ);
    if (dCenter < 8) {
      tint.set(0x384a44);
    } else if (height > 2.0) {
      tint.set(0x485850);
    } else if (Math.abs(Math.sin(worldX * 0.3) * Math.cos(worldZ * 0.3)) > 0.88) {
      tint.set(0x19665c);
    } else {
      tint.set(i % 4 === 0 ? 0x2b523f : 0x214434);
    }
    colors.push(tint.r, tint.g, tint.b);
  }

  groundGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  groundGeo.computeVertexNormals();

  const groundMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.92,
    metalness: 0.1,
  });
  const ground = mesh(groundGeo, groundMat, false);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  buildForestWorld(scene, getTerrainHeight, addCircleCollider, isMobileDevice);
  createRuins(-22, -14, 0.2);
  createRuins(14, -12, -0.45);
  createRuins(24, 16, 0.72);
  createRuins(-12, 18, -0.3);

  createMonolith(-28, 4, 0.5);
  createMonolith(28, -2, -0.4);
  createMonolith(-4, -22, 0.8);
  createMonolith(2, 24, -0.7);

  createCrystalCluster(-16, -6, 0x88f5ff);
  createCrystalCluster(18, 4, 0xd05eff);
  createCrystalCluster(-8, 12, 0x5ef4ff);
  createCrystalCluster(10, -20, 0xbd47ff);

  createPortal(34, -20);
  createRockFormations();
  createMountains();
  createAmbientMotes();

  // Initialize Chest Manager
  chestManager = new ChestManager(scene, addCircleCollider, getTerrainHeight);
}

function createPavedPathways() {
  const pathMat = new THREE.MeshStandardMaterial({ color: 0x62736b, roughness: 0.95 });
  const runeMat = new THREE.MeshStandardMaterial({ color: 0x47e8f5, emissive: 0x1da6b2, emissiveIntensity: 2.0 });

  for (let i = 0; i < 22; i += 1) {
    const x = -30 + i * 2.9;
    const z = Math.sin(i * 0.65) * 2.6;
    const y = getTerrainHeight(x, z);

    const slab = mesh(new THREE.BoxGeometry(2.8 + (i % 3) * 0.4, 0.14, 2.0), pathMat, false);
    slab.position.set(x, y + 0.07, z);
    slab.rotation.y = Math.sin(i * 1.2) * 0.1;
    scene.add(slab);

    if (i % 3 === 0) {
      const seam = mesh(new THREE.BoxGeometry(2.4, 0.04, 0.08), runeMat, false);
      seam.position.set(x, y + 0.15, z);
      scene.add(seam);
    }
  }
}

function createRuins(x, z, rotation) {
  const ruin = new THREE.Group();
  const y = getTerrainHeight(x, z);
  ruin.position.set(x, y, z);
  ruin.rotation.y = rotation;

  const base = mesh(new THREE.BoxGeometry(12, 0.8, 5.5), mats.stoneDark);
  base.position.y = 0.4;
  ruin.add(base);
  addBoxCollider(x - 5.8, x + 5.8, z - 2.6, z + 2.6, "ruin_base");

  [-4.8, 4.8].forEach((px, i) => {
    const pillarH = 6.2 - i * 1.0;
    const pillar = mesh(new THREE.BoxGeometry(1.6, pillarH, 1.6), mats.stone);
    pillar.position.set(px, pillarH / 2 + 0.4, 0);
    ruin.add(pillar);

    const pWorld = new THREE.Vector3(px, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation).add(new THREE.Vector3(x, 0, z));
    addCircleCollider(pWorld.x, pWorld.z, 1.0, "ruin_pillar");
  });

  const beam = mesh(new THREE.BoxGeometry(11.8, 1.2, 1.8), mats.stone);
  beam.position.set(0, 6.2, 0);
  ruin.add(beam);

  const rune = mesh(new THREE.BoxGeometry(6.2, 0.12, 0.14), mats.cyan, false);
  rune.position.set(0, 6.18, 0.95);
  ruin.add(rune);

  scene.add(ruin);
}

function createMonolith(x, z, rotation) {
  const group = new THREE.Group();
  const y = getTerrainHeight(x, z);
  group.position.set(x, y, z);
  group.rotation.y = rotation;

  const pedestal = mesh(new THREE.CylinderGeometry(1.6, 2.0, 0.7, 8), mats.stoneDark);
  pedestal.position.y = 0.35;
  group.add(pedestal);
  addCircleCollider(x, z, 1.8, "monolith_base");

  const obelisk = mesh(new THREE.OctahedronGeometry(1.2, 0), mats.enemy);
  obelisk.scale.set(0.9, 3.2, 0.9);
  obelisk.position.y = 3.8;
  group.add(obelisk);

  const halo = mesh(new THREE.TorusGeometry(1.6, 0.08, 6, 24), mats.cyan, false);
  halo.position.y = 3.8;
  halo.rotation.x = Math.PI / 2;
  group.add(halo);

  const light = new THREE.PointLight(0x73eff7, 2.2, 12);
  light.position.y = 4.0;
  group.add(light);

  scene.add(group);
}

function createCrystalCluster(x, z, colorHex) {
  const group = new THREE.Group();
  const y = getTerrainHeight(x, z);
  group.position.set(x, y, z);

  const base = mesh(new THREE.DodecahedronGeometry(1.4), mats.stoneDark);
  base.position.y = 0.5;
  group.add(base);
  addCircleCollider(x, z, 1.5, "crystal_cluster");

  const crystalMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 2.8,
    roughness: 0.2,
    metalness: 0.5,
  });

  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const h = 1.2 + (i % 3) * 0.6;
    const c = mesh(new THREE.ConeGeometry(0.24, h, 6), crystalMat);
    c.position.set(Math.sin(angle) * 0.7, 0.6 + h / 2, Math.cos(angle) * 0.7);
    c.rotation.x = (Math.random() - 0.5) * 0.4;
    c.rotation.z = (Math.random() - 0.5) * 0.4;
    group.add(c);
  }

  const pLight = new THREE.PointLight(colorHex, 2.0, 10);
  pLight.position.y = 2.0;
  group.add(pLight);

  scene.add(group);
}

function createPortal(x, z) {
  const portal = new THREE.Group();
  const y = getTerrainHeight(x, z);
  portal.position.set(x, y + 4.4, z);
  portal.rotation.y = -0.45;

  portal.add(mesh(new THREE.TorusGeometry(4.8, 0.9, 12, 42), mats.stone));
  portalCore = mesh(
    new THREE.CircleGeometry(3.85, 42),
    new THREE.MeshBasicMaterial({ color: 0x183b43, transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
    false
  );
  portalCore.position.z = -0.02;
  portal.add(portalCore);

  const base = mesh(new THREE.BoxGeometry(12, 1.2, 4.4), mats.stoneDark);
  base.position.y = -4.5;
  portal.add(base);
  addBoxCollider(x - 5.5, x + 5.5, z - 2.2, z + 2.2, "portal_base");

  scene.add(portal);
}

function createDetailedFlora() {
  const leafMats = [mats.foliage, new THREE.MeshStandardMaterial({ color: 0x2e6b62, roughness: 0.85 }), mats.enemy];
  const count = isMobileDevice ? 36 : 48;

  for (let i = 0; i < count; i += 1) {
    const x = ((i * 37.3) % 76) - 38;
    const z = ((i * 23.7 + 11) % 56) - 28;
    if (Math.hypot(x, z) < 9) continue;

    const y = getTerrainHeight(x, z);
    const plant = new THREE.Group();
    plant.position.set(x, y, z);

    const stem = mesh(new THREE.CylinderGeometry(0.18, 0.32, 1.8, 6), mats.bark, false);
    stem.position.y = 0.9;
    stem.rotation.z = Math.sin(i) * 0.15;
    plant.add(stem);
    addCircleCollider(x, z, 0.45, "tree_trunk");

    for (let layer = 0; layer < 3; layer++) {
      const leaves = mesh(new THREE.ConeGeometry(1.4 - layer * 0.35, 1.2, 6), leafMats[(i + layer) % 3], false);
      leaves.position.y = 1.8 + layer * 0.8;
      leaves.rotation.y = layer * 0.5;
      plant.add(leaves);
    }

    scene.add(plant);
  }
}

function createRockFormations() {
  const rockPositions = [
    [-18, 12, 1.4], [-8, -14, 1.8], [6, 18, 1.2], [22, -8, 1.6],
    [-32, -18, 2.2], [30, 10, 1.9], [-26, 22, 1.5], [16, 26, 1.7]
  ];

  rockPositions.forEach(([rx, rz, scale]) => {
    const ry = getTerrainHeight(rx, rz);
    const rock = mesh(new THREE.DodecahedronGeometry(scale, 1), mats.stoneDark);
    rock.position.set(rx, ry + scale * 0.6, rz);
    rock.rotation.set(rx, rz, scale);
    scene.add(rock);
    addCircleCollider(rx, rz, scale * 1.05, "rock");
  });
}

function createMountains() {
  const mountainMat = new THREE.MeshStandardMaterial({ color: 0x3e4e47, roughness: 1.0 });
  for (let i = 0; i < 28; i += 1) {
    const angle = (i / 28) * Math.PI * 2;
    const radius = 58 + (i % 5) * 5;
    const h = 18 + (i % 6) * 5;
    const mountain = mesh(new THREE.ConeGeometry(9 + (i % 4) * 2, h, 6), mountainMat, false);
    const mx = Math.cos(angle) * radius;
    const mz = Math.sin(angle) * radius;
    mountain.position.set(mx, h / 2 - 2, mz);
    mountain.rotation.y = angle + 0.3;
    scene.add(mountain);
  }
}

function createAmbientMotes() {
  const count = 140;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 78;
    positions[i * 3 + 1] = 1 + Math.random() * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 58;
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const moteMat = new THREE.PointsMaterial({
    color: 0x72f5ff,
    size: 0.18,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  });

  const motePoints = new THREE.Points(moteGeo, moteMat);
  scene.add(motePoints);
  ambientMotes.push({ points: motePoints, count });
}

function updateAmbientMotes(dt) {
  ambientMotes.forEach(({ points, count }) => {
    const pos = points.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(elapsed * 2 + i) * 0.008;
      pos[i * 3] += Math.cos(elapsed * 1.5 + i) * 0.005;
      if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = 1;
    }
    points.geometry.attributes.position.needsUpdate = true;
  });
}

// ==========================================================================
// Player Initialization & Systems
// ==========================================================================
function initPlayer() {
  const heroine = createProtagonist();
  const startY = getTerrainHeight(-31, 18);
  heroine.root.position.set(-31, startY, 18);
  heroine.root.rotation.y = -0.38;
  scene.add(heroine.root);

  player.group = heroine.root;
  player.heroine = heroine;

  protagonistMaterials = createProtagonistMaterials();
  fpsViewModel = createFPSViewModel(protagonistMaterials);
  camera.add(fpsViewModel.fpsRig);

  // Initialize Wardrobe Manager with heroine and materials
  wardrobeManager = new WardrobeManager(heroine, protagonistMaterials);
  wardrobeManager.loadEquipped(profileManager.user.equipped);

  if (cameraMode === "fps") {
    if (blenderHeroine) blenderHeroine.visible = false;
    if (fpsViewModel) fpsViewModel.fpsRig.visible = true;
  } else {
    if (blenderHeroine) blenderHeroine.visible = true;
    if (fpsViewModel) fpsViewModel.fpsRig.visible = false;
  }

  applyPlayerUpgrades();
  updateProfileUI();
  loadBlenderCharacter();
}

function loadBlenderCharacter() {
  const loader = new GLTFLoader();
  loader.load(
    "models/heroine_aria.glb",
    (gltf) => {
      blenderHeroine = gltf.scene;

      blenderHeroine.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = !isMobileDevice;
          child.receiveShadow = true;
          if (child.material) {
            child.material.envMapIntensity = 1.0;
          }
        }
      });

      blenderHeroine.position.set(0, 0, 0);
      blenderHeroine.scale.set(1.0, 1.0, 1.0);
      blenderHeroine.visible = (cameraMode !== "fps");

      if (gltf.animations && gltf.animations.length > 0) {
        blenderMixer = new THREE.AnimationMixer(blenderHeroine);
        gltf.animations.forEach((clip) => {
          blenderActions[clip.name] = blenderMixer.clipAction(clip);
        });

        if (blenderActions["Idle"]) {
          blenderActions["Idle"].play();
          activeBlenderAction = blenderActions["Idle"];
        }
      }

      player.group.add(blenderHeroine);
      player.blenderModel = blenderHeroine;
      player.blenderMixer = blenderMixer;
      player.blenderActions = blenderActions;

      showToast("✨ Modelo 3D de Blender integrado con éxito");
    },
    undefined,
    (err) => {
      console.warn("Aviso GLB: manteniendo modelo procedural Three.js", err);
    }
  );
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
  const y = getTerrainHeight(x, z);
  group.position.set(x, y, z);

  const base = mesh(new THREE.CylinderGeometry(1.5, 1.9, 0.7, 8), mats.stoneDark);
  base.position.y = 0.35;
  group.add(base);
  addCircleCollider(x, z, 1.6, "crystal_pedestal");

  const gem = mesh(new THREE.OctahedronGeometry(1.2, 0), mats.purple);
  gem.position.y = 2.1;
  group.add(gem);

  const light = new THREE.PointLight(0xb363dc, 2.4, 10);
  light.position.y = 2.1;
  group.add(light);

  scene.add(group);
  crystals.push({ group, gem, light, active: false });
}

// ==========================================================================
// Level Loading, Enemies & Treasure Chest Spawning
// ==========================================================================
function loadLevel(levelNum) {
  player.verticalVelocity = 0;
  player.grounded = true;
  currentLevel = levelNum;
  levelCleared = false;
  levelBanner.classList.add("hidden");

  enemies.forEach((e) => scene.remove(e.group));
  crystals.forEach((c) => scene.remove(c.group));
  bolts.forEach((b) => scene.remove(b.mesh));
  enemyBolts.forEach((b) => scene.remove(b.mesh));
  shockwaves.forEach((s) => scene.remove(s.mesh));
  enemies = [];
  crystals = [];
  bolts = [];
  enemyBolts = [];
  shockwaves.length = 0;
  levelBoss = null;
  bossHud.classList.add("hidden");
  if (chestManager) chestManager.clear();

  portalCore.material.color.set(0x183b43);
  portalCore.material.opacity = 0.28;

  if (currentLevel === 1) {
    levelTitle.textContent = "NIVEL 1";
    scene.background.set(0x89b6b5);
    scene.fog.color.set(0x8fb5ac);

    createCrystal(-21, 19);
    createCrystal(7, 13);
    createCrystal(24, -17);

    // Spawning Treasure Chests
    chestManager.spawnChest(-18, -10, { essence: 180, xp: 120 });
    chestManager.spawnChest(16, 20, { essence: 220, xp: 150 });

    // Spawning Enemies
    enemies.push(spawnSentinelEnemy(-16, 8, 45, 2.2));
    enemies.push(spawnStalkerEnemy(-2, -7, 60, 3.4));
    enemies.push(spawnSentinelEnemy(12, 9, 45, 2.2));
    enemies.push(spawnStalkerEnemy(23, -4, 60, 3.5));
    enemies.push(spawnSentinelEnemy(29, 17, 45, 2.4));
    enemies.push(spawnStalkerEnemy(3, 20, 60, 3.3));

    showToast("✨ Misión: Sintoniza cristales y abre los cofres rúnicos");
  } else if (currentLevel === 2) {
    levelTitle.textContent = "NIVEL 2";
    scene.background.set(0x382247);
    scene.fog.color.set(0x2f1c3d);

    createCrystal(-25, 12);
    createCrystal(-6, -16);
    createCrystal(14, 18);
    createCrystal(28, -6);

    // Spawning Treasure Chests
    chestManager.spawnChest(-6, 22, { essence: 250, xp: 160 });
    chestManager.spawnChest(26, -16, { essence: 300, xp: 200 });

    enemies.push(spawnSentinelEnemy(-20, 5, 70, 2.5, true));
    enemies.push(spawnStalkerEnemy(-12, -12, 85, 3.8, true));
    enemies.push(spawnSentinelEnemy(-4, 8, 70, 2.5, true));
    enemies.push(spawnStalkerEnemy(8, -8, 85, 3.8, true));
    enemies.push(spawnSentinelEnemy(16, 6, 70, 2.6, true));
    enemies.push(spawnStalkerEnemy(22, -14, 85, 3.9, true));
    enemies.push(spawnSentinelEnemy(28, 12, 70, 2.6, true));
    enemies.push(spawnStalkerEnemy(2, 22, 85, 3.8, true));

    showToast("⚡ Misión: Sintoniza los 4 monolitos sombríos");
  } else if (currentLevel === 3) {
    levelTitle.textContent = "NIVEL 3";
    scene.background.set(0x1e122b);
    scene.fog.color.set(0x180d24);

    createCrystal(-15, 0);
    createCrystal(15, 0);

    // Spawning Grand Relic Chest
    chestManager.spawnChest(0, -22, { essence: 500, xp: 350 });

    spawnTitanBoss(18, -12);
    enemies.push(spawnSentinelEnemy(-10, 14, 60, 2.6));
    enemies.push(spawnStalkerEnemy(10, 14, 75, 3.6));

    bossHud.classList.remove("hidden");
    bossHealthFill.style.width = "100%";
    showToast("👑 ¡Derrota al Titán Ancestral Corrupto!");
  }

  const startY = getTerrainHeight(-31, 18);
  player.health = player.maxHealth;
  player.group.position.set(-31, startY, 18);
  player.velocity.set(0, 0, 0);
}

function spawnSentinelEnemy(x, z, health = 45, speed = 2.4, isElite = false) {
  const model = createSentinelDrone(mats, isElite);
  const y = getTerrainHeight(x, z);
  model.root.position.set(x, y, z);
  scene.add(model.root);

  return {
    group: model.root,
    model,
    type: "drone",
    health,
    maxHealth: health,
    speed,
    isElite,
    isBoss: false,
    radius: model.radius,
    hoverHeight: 0.15,
  };
}

function spawnStalkerEnemy(x, z, health = 60, speed = 3.5, isElite = false) {
  const model = createCorruptedStalker(mats, isElite);
  const y = getTerrainHeight(x, z);
  model.root.position.set(x, y, z);
  scene.add(model.root);

  return {
    group: model.root,
    model,
    type: "stalker",
    health,
    maxHealth: health,
    speed,
    isElite,
    isBoss: false,
    radius: model.radius,
    hoverHeight: 0.05,
  };
}

function spawnTitanBoss(x, z) {
  const model = createTitanBossModel(mats);
  const y = getTerrainHeight(x, z);
  model.root.position.set(x, y, z);
  scene.add(model.root);

  levelBoss = {
    group: model.root,
    model,
    type: "boss",
    health: 600,
    maxHealth: 600,
    speed: 1.8,
    isElite: true,
    isBoss: true,
    radius: model.radius,
    hoverHeight: 0.2,
  };
  enemies.push(levelBoss);
}

// ==========================================================================
// Combat: Weapons, Recoil, Projectiles & EMP
// ==========================================================================
const shockwaves = [];
function createImpactShockwave(position, color = 0x5df8ff, maxRadius = 2.4) {
  const geo = new THREE.RingGeometry(0.12, 0.32, 22);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide
  });
  const ringMesh = new THREE.Mesh(geo, mat);
  ringMesh.position.copy(position).add(new THREE.Vector3(0, 0.12, 0));
  ringMesh.rotation.x = -Math.PI / 2;
  scene.add(ringMesh);
  shockwaves.push({ mesh: ringMesh, maxRadius, life: 0.35, maxLife: 0.35 });
}

function updateShockwaves(dt) {
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.life -= dt;
    const p = 1 - Math.max(0, sw.life / sw.maxLife);
    const r = THREE.MathUtils.lerp(0.3, sw.maxRadius, Math.sqrt(p));
    sw.mesh.scale.set(r, r, 1);
    sw.mesh.material.opacity = (1 - p) * 0.9;
    if (sw.life <= 0) {
      scene.remove(sw.mesh);
      sw.mesh.geometry.dispose();
      sw.mesh.material.dispose();
      shockwaves.splice(i, 1);
    }
  }
}

function spawnArrowTrail(position, color = 0x5df8ff) {
  if (Math.random() > 0.55) return;
  const pMesh = mesh(
    new THREE.SphereGeometry(0.045, 4, 3),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 }),
    false
  );
  pMesh.position.copy(position).add(new THREE.Vector3(
    (Math.random() - 0.5) * 0.08,
    (Math.random() - 0.5) * 0.08,
    (Math.random() - 0.5) * 0.08
  ));
  scene.add(pMesh);
  particles.push({
    mesh: pMesh,
    velocity: new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4),
    life: 0.2
  });
}

function createRunicArrowMesh(tier = 1) {
  const group = new THREE.Group();
  const colorHex = tier >= 3 ? 0xe959ff : tier === 2 ? 0x4ef2bb : 0x5df8ff;

  const arrowMat = new THREE.MeshBasicMaterial({ color: colorHex });
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Luminous main shaft
  const shaft = mesh(new THREE.CylinderGeometry(0.024, 0.024, 1.45, 6), arrowMat, false);
  shaft.rotation.x = Math.PI / 2;
  group.add(shaft);

  // White-hot core energy beam
  const core = mesh(new THREE.CylinderGeometry(0.009, 0.009, 1.35, 4), coreMat, false);
  core.rotation.x = Math.PI / 2;
  group.add(core);

  // Diamond arrowhead
  const head = mesh(new THREE.ConeGeometry(0.09, 0.38, 4), arrowMat, false);
  head.rotation.x = -Math.PI / 2;
  head.position.z = -0.74;
  group.add(head);

  // 3 Holographic Fletching fins at the rear
  for (let i = 0; i < 3; i++) {
    const finAngle = (i * Math.PI * 2) / 3;
    const fin = mesh(new THREE.BoxGeometry(0.012, 0.12, 0.24), arrowMat, false);
    fin.position.set(Math.cos(finAngle) * 0.038, Math.sin(finAngle) * 0.038, 0.52);
    fin.rotation.z = finAngle;
    fin.rotation.y = 0.08;
    group.add(fin);
  }

  // Energy halo ring that spins along flight
  const ring = mesh(new THREE.TorusGeometry(0.095, 0.014, 5, 14), arrowMat, false);
  ring.position.z = -0.22;
  group.add(ring);

  return { group, ring, color: colorHex };
}

function shoot() {
  if (isGamePaused || inspectMode || isLeaderboardOpen || isUpgradeOpen || isWardrobeOpen || isProfileOpen || isSettingsOpen) return;
  if (player.energy < 12 || player.shootCooldown > 0 || gameOver || gameFinished) return;

  initAudio();
  vibrate(25);

  const cooldownRate = upgrades.bow === 1 ? 0.24 : upgrades.bow === 2 ? 0.16 : 0.12;
  player.energy -= 12;
  player.shootCooldown = cooldownRate;
  playSound("shoot");

  let direction = new THREE.Vector3();
  let origin = new THREE.Vector3();

  if (cameraMode === "fps") {
    camera.getWorldDirection(direction);
    origin.copy(camera.position).addScaledVector(direction, 0.6);
    fpsViewModel.playShoot();
    cameraPitch = Math.min(1.2, cameraPitch + 0.025); // Snappy visual recoil
  } else {
    origin.copy(player.group.position).add(new THREE.Vector3(0, 1.5, 0));
    updateAim();
    direction.copy(aimPoint).sub(origin);
    if (direction.lengthSq() < 0.01) direction.set(0, 0, -1);
    direction.normalize();
    player.heroine.playShootAnim();
    if (blenderActions && blenderActions["Shoot"]) {
      blenderActions["Shoot"].reset().setLoop(THREE.LoopOnce, 1).play();
    }
  }

  const arrowDamage = upgrades.bow === 1 ? 25 : upgrades.bow === 2 ? 40 : 55;

  const fireBolt = (dirOffset = 0) => {
    const { group: boltMesh, ring, color } = createRunicArrowMesh(upgrades.bow);
    const finalDir = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), dirOffset);
    // Slight upward ballistic tilt for satisfying arc
    finalDir.y += 0.04;
    finalDir.normalize();

    boltMesh.position.copy(origin).addScaledVector(finalDir, 0.7);
    boltMesh.lookAt(boltMesh.position.clone().add(finalDir));
    scene.add(boltMesh);

    bolts.push({
      mesh: boltMesh,
      ring,
      color,
      velocity: finalDir.multiplyScalar(36),
      damage: arrowDamage,
      life: 1.8
    });
  };

  fireBolt(0);
  if (upgrades.bow >= 3) {
    fireBolt(0.12);
    fireBolt(-0.12);
  }
}

function triggerDroneShockwave() {
  if (isGamePaused || inspectMode || isWardrobeOpen || isProfileOpen || isSettingsOpen) return;
  if (player.energy < 32 || player.specialCooldown > 0 || gameOver || gameFinished) return;

  initAudio();
  vibrate(50);
  player.energy -= 32;
  player.specialCooldown = 3.5;
  playSound("shockwave");

  const center = player.group.position.clone();
  burst(center, 0x5df8ff, 36);
  showToast("💥 ¡Onda EMP del Guardián activada!");

  const shockRing = mesh(new THREE.RingGeometry(0.6, 1.4, 32), mats.cyan, false);
  shockRing.rotation.x = -Math.PI / 2;
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

// Enemy Defeat with XP and Essence Rewards
function destroyEnemy(enemy) {
  const idx = enemies.indexOf(enemy);
  if (idx !== -1) {
    burst(enemy.group.position, 0xd66cff, 26);
    playSound("hit");
    scene.remove(enemy.group);
    enemies.splice(idx, 1);
    player.enemiesDefeated += 1;

    // Grant XP and Essence based on enemy type
    let xpGain = 45;
    let essenceGain = 30;
    if (enemy.isBoss) {
      xpGain = 600;
      essenceGain = 250;
    } else if (enemy.type === "stalker") {
      xpGain = 75;
      essenceGain = 45;
    }

    addEssence(essenceGain);
    awardXp(xpGain, `(+${essenceGain} 💎)`);
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

// Companion Guardian AI
function updateCompanionGuardian(dt) {
  const drone = player.heroine.drone;
  if (!drone) return;

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

    if (drone.userData.laser) {
      drone.userData.laser.material.opacity = 0.85;
      const pts = [
        new THREE.Vector3(0, 0, 0.35),
        drone.worldToLocal(enemyPos.clone())
      ];
      drone.userData.laser.geometry.setFromPoints(pts);
    }

    droneAutoShootTimer -= dt;
    const fireInterval = upgrades.drone === 1 ? 1.4 : upgrades.drone === 2 ? 0.9 : 0.55;
    if (droneAutoShootTimer <= 0 && !gameOver && !gameFinished && !isGamePaused) {
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
    if (drone.userData.laser) drone.userData.laser.material.opacity = 0;
    droneScanAngle += dt * 1.5;
    const sweepX = Math.sin(droneScanAngle) * 7;
    drone.userData.spotTarget.position.set(sweepX, 0, 14);
  }

  if (drone.userData.shieldBubble) {
    drone.userData.shieldBubble.visible = player.shieldActive;
    if (player.shieldActive) {
      drone.userData.shieldBubble.rotation.y += dt * 2.2;
      drone.userData.shieldBubble.rotation.x += dt * 1.2;
    }
  }

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
  camera.getWorldDirection(aimPoint);
  aimPoint.multiplyScalar(60).add(camera.position);
}

function jump() {
  if (!player.grounded || isGamePaused || inspectMode || gameOver || gameFinished || isSettingsOpen || isWardrobeOpen || isProfileOpen || isLeaderboardOpen || isUpgradeOpen) return;
  player.verticalVelocity = 7.5;
  player.grounded = false;
}

function updatePlayer(dt) {
  const currentSpeed = player.speed * (isSprinting ? 1.45 : 1.0);
  const move = new THREE.Vector3();

  if (cameraMode === "fps") {
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
    if (keys.has("w") || keys.has("arrowup")) move.z -= 1;
    if (keys.has("s") || keys.has("arrowdown")) move.z += 1;
    if (keys.has("a") || keys.has("arrowleft")) move.x -= 1;
    if (keys.has("d") || keys.has("arrowright")) move.x += 1;

    if (joystick.active && joystick.vector.lengthSq() > 0.04) {
      move.x += joystick.vector.x;
      move.z += joystick.vector.y;
    }
    move.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
  }

  const isMoving = move.lengthSq() > 0.01;
  if (isMoving) move.normalize();

  const targetVelocity = move.multiplyScalar(isMoving ? currentSpeed : 0);
  player.velocity.lerp(targetVelocity, 1 - Math.exp(-14 * dt));
  const previousPosition = player.group.position.clone();
  player.group.position.addScaledVector(player.velocity, dt);

  resolveWorldCollision(player.group.position, 0.65);
  const actualSpeed = Math.hypot(player.group.position.x - previousPosition.x, player.group.position.z - previousPosition.z) / Math.max(dt, 0.001);

  const terrainY = getTerrainHeight(player.group.position.x, player.group.position.z);
  if (!player.grounded) {
    player.verticalVelocity -= 22 * dt;
    player.group.position.y += player.verticalVelocity * dt;
    if (player.group.position.y <= terrainY && player.verticalVelocity <= 0) {
      player.group.position.y = terrainY;
      player.verticalVelocity = 0;
      player.grounded = true;
    }
  } else {
    player.group.position.y = terrainY;
  }

  if (isMoving) {
    walkBob += dt * (isSprinting ? 14 : 10);
  }

  const energyRegen = upgrades.armor >= 2 ? 30 : 20;
  player.energy = Math.min(100, player.energy + energyRegen * dt);
  player.shootCooldown = Math.max(0, player.shootCooldown - dt);
  player.specialCooldown = Math.max(0, player.specialCooldown - dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);

  if (cameraMode === "fps") {
    if (blenderHeroine) blenderHeroine.visible = false;
    fpsViewModel.fpsRig.visible = !inspectMode;
    fpsViewModel.update(dt, isMoving, isSprinting ? 1.4 : 1.0);
    player.group.rotation.y = cameraYaw;
  } else {
    if (blenderHeroine) blenderHeroine.visible = true;
    fpsViewModel.fpsRig.visible = false;
    updateAim();
    const targetYaw = cameraYaw + Math.PI;
    const turn = Math.atan2(Math.sin(targetYaw - player.group.rotation.y), Math.cos(targetYaw - player.group.rotation.y));
    player.group.rotation.y += turn * (1 - Math.exp(-12 * dt));
    player.heroine.update(dt, isMoving, move, true, aimPoint, isSprinting ? 1.4 : 1.0);
  }

  // Actualización de animaciones esqueléticas de Blender (Idle, Run)
  if (blenderMixer) {
    if (actualSpeed > 0.15) {
      if (blenderActions["Run"]) blenderActions["Run"].setEffectiveTimeScale(THREE.MathUtils.clamp(actualSpeed / player.speed, 0.35, 1.5));
      if (blenderActions["Run"] && activeBlenderAction !== blenderActions["Run"]) {
        if (activeBlenderAction) activeBlenderAction.fadeOut(0.2);
        blenderActions["Run"].reset().fadeIn(0.2).play();
        activeBlenderAction = blenderActions["Run"];
      }
    } else {
      if (blenderActions["Idle"] && activeBlenderAction !== blenderActions["Idle"]) {
        if (activeBlenderAction) activeBlenderAction.fadeOut(0.25);
        blenderActions["Idle"].reset().fadeIn(0.25).play();
        activeBlenderAction = blenderActions["Idle"];
      }
    }
    blenderMixer.update(dt);
  }

  updateCompanionGuardian(dt);
}

function updateCrystals(dt) {
  crystals.forEach((crystal) => {
    crystal.gem.rotation.y += dt * (crystal.active ? 1.9 : 0.7);
    crystal.gem.position.y = 2.1 + Math.sin(elapsed * 2.4) * 0.22;
    if (!crystal.active && crystal.group.position.distanceTo(player.group.position) < 3.3) {
      crystal.active = true;
      crystal.gem.material = mats.cyan;
      crystal.light.color.set(0x6ff6ff);
      crystal.light.intensity = 4.8;
      burst(crystal.group.position, 0x7cf7ff, 22);
      playSound("crystal");
      vibrate(30);
      addEssence(75);
      awardXp(100, "¡Cristal Sintonizado! (+75 💎)");
    }
  });
}

// Chest Opening Action
function tryOpenNearestChest() {
  if (!activeNearChest || activeNearChest.opened) return;
  const loot = chestManager.openChest(activeNearChest);
  if (loot) {
    playSound("chest");
    vibrate(45);
    burst(activeNearChest.chest3D.root.position, 0xffd147, 28);
    addEssence(loot.essence);
    awardXp(loot.xp, `🎁 ¡Cofre Rúnico Abierto! (+${loot.essence} 💎)`);
    chestPrompt.classList.add("hidden");
    btnTouchInteract.classList.add("hidden");
    activeNearChest = null;
  }
}

// ==========================================================================
// Advanced Enemy AI & Combat Behaviors
// ==========================================================================
function updateEnemies(dt) {
  enemies.forEach((enemy) => {
    const towardPlayer = player.group.position.clone().sub(enemy.group.position);
    const distance = towardPlayer.length();
    towardPlayer.y = 0;

    const isMoving = distance > 2.0 && distance < 26;

    if (enemy.model && enemy.model.update) {
      enemy.model.update(dt, elapsed, isMoving);
    }
    if (enemy.model && enemy.model.hpBar) {
      enemy.model.hpBar.update(enemy.health, enemy.maxHealth, camera);
    }

    if (enemy.type === "drone") {
      if (distance > 13) {
        enemy.group.position.addScaledVector(towardPlayer.clone().normalize(), enemy.speed * dt);
      } else if (distance < 8) {
        enemy.group.position.addScaledVector(towardPlayer.clone().normalize(), -enemy.speed * dt * 0.8);
      }
      enemy.group.lookAt(player.group.position.x, enemy.group.position.y, player.group.position.z);

      enemy.model.shootCooldown -= dt;
      if (distance < 22 && enemy.model.shootCooldown <= 1.2) {
        enemy.model.targetingLaser.material.opacity = 0.8;
        enemy.model.eyeMat.color.set(0xff1133);
        enemy.model.eyeMat.emissive.set(0xff0022);
      } else {
        enemy.model.targetingLaser.material.opacity = 0;
      }

      if (enemy.model.shootCooldown <= 0 && distance < 22) {
        enemy.model.shootCooldown = 2.8 + Math.random() * 1.2;
        playSound("enemyShoot");

        const boltDir = player.group.position.clone().add(new THREE.Vector3(0, 1.4, 0)).sub(enemy.group.position).normalize();
        const eBolt = mesh(new THREE.SphereGeometry(0.22, 8, 8), mats.purple, false);
        eBolt.position.copy(enemy.group.position).add(new THREE.Vector3(0, 1.6, 0));
        scene.add(eBolt);
        enemyBolts.push({ mesh: eBolt, velocity: boltDir.multiplyScalar(20), damage: 16, life: 2.2 });
        burst(eBolt.position, 0xbd3fff, 6);
      }
    } else if (enemy.type === "stalker") {
      if (distance > 1.8 && distance < 26) {
        enemy.group.position.addScaledVector(towardPlayer.clone().normalize(), enemy.speed * dt);
        enemy.group.lookAt(player.group.position.x, enemy.group.position.y, player.group.position.z);
      }
    } else if (enemy.type === "boss") {
      if (distance > 4.5) {
        enemy.group.position.addScaledVector(towardPlayer.clone().normalize(), enemy.speed * dt);
      }
      enemy.group.lookAt(player.group.position.x, enemy.group.position.y, player.group.position.z);

      enemy.model.shootCooldown -= dt;
      if (enemy.model.shootCooldown <= 0) {
        enemy.model.shootCooldown = 3.2;
        playSound("enemyShoot");
        for (let i = -1; i <= 1; i++) {
          const bDir = towardPlayer.clone().normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), i * 0.25);
          const bMesh = mesh(new THREE.SphereGeometry(0.35, 10, 10), mats.boss, false);
          bMesh.position.copy(enemy.group.position).add(new THREE.Vector3(0, 3.6, 0));
          scene.add(bMesh);
          enemyBolts.push({ mesh: bMesh, velocity: bDir.multiplyScalar(18), damage: 24, life: 2.5 });
        }
      }
    }

    resolveWorldCollision(enemy.group.position, enemy.radius);
    const groundY = getTerrainHeight(enemy.group.position.x, enemy.group.position.z);
    enemy.group.position.y = groundY + enemy.hoverHeight;

    if (distance < (enemy.radius + 0.8) && player.invulnerable <= 0) {
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
    // Gentle ballistic gravity arc for natural arrow flight
    bolt.velocity.y -= 3.6 * dt;
    bolt.mesh.position.addScaledVector(bolt.velocity, dt);
    bolt.mesh.lookAt(bolt.mesh.position.clone().add(bolt.velocity));

    // Spin energy halo ring
    if (bolt.ring) {
      bolt.ring.rotation.z += dt * 18;
    }

    // Leave luminous comet trail
    const arrowColor = bolt.color || 0x5df8ff;
    spawnArrowTrail(bolt.mesh.position, arrowColor);

    bolt.life -= dt;
    let hit = false;

    if (checkProjectileCollision(bolt.mesh.position, 0.25)) {
      burst(bolt.mesh.position, arrowColor, 12);
      createImpactShockwave(bolt.mesh.position, arrowColor, 2.0);
      playSound("hit");
      hit = true;
    }

    if (!hit) {
      for (let j = enemies.length - 1; j >= 0; j -= 1) {
        const enemy = enemies[j];
        const hitRadius = enemy.isBoss ? 3.0 : enemy.radius + 0.5;
        const enemyCenter = enemy.group.position.clone().add(new THREE.Vector3(0, enemy.isBoss ? 3.0 : 1.2, 0));
        if (bolt.mesh.position.distanceTo(enemyCenter) < hitRadius) {
          enemy.health -= bolt.damage;
          burst(enemy.group.position, arrowColor, 16);
          createImpactShockwave(enemy.group.position, arrowColor, enemy.isBoss ? 4.0 : 2.4);
          playSound("hit");
          hit = true;
          if (enemy.health <= 0) {
            destroyEnemy(enemy);
          }
          break;
        }
      }
    }

    if (hit || bolt.life <= 0) {
      scene.remove(bolt.mesh);
      bolts.splice(i, 1);
    }
  }
}

function updateEnemyBolts(dt) {
  for (let i = enemyBolts.length - 1; i >= 0; i -= 1) {
    const bolt = enemyBolts[i];
    bolt.mesh.position.addScaledVector(bolt.velocity, dt);
    bolt.life -= dt;
    let hit = false;

    if (checkProjectileCollision(bolt.mesh.position, 0.3)) {
      burst(bolt.mesh.position, 0xbd3fff, 8);
      hit = true;
    }

    const playerCenter = player.group.position.clone().add(new THREE.Vector3(0, 1.3, 0));
    if (!hit && bolt.mesh.position.distanceTo(playerCenter) < 1.2) {
      hit = true;
      if (player.shieldActive) {
        showToast("🛡️ ¡Impacto absorbido por el Escudo!");
        burst(bolt.mesh.position, 0x5df8ff, 14);
      } else if (player.invulnerable <= 0) {
        player.health -= bolt.damage;
        player.invulnerable = 0.8;
        burst(player.group.position, 0xff5577, 14);
        playSound("hit");
        vibrate(40);
        if (player.health <= 0) gameOver = true;
      }
    }

    if (hit || bolt.life <= 0) {
      scene.remove(bolt.mesh);
      enemyBolts.splice(i, 1);
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
    const bob = Math.sin(walkBob) * (player.velocity.length() > 0.5 ? 0.05 : 0.008);
    const eyePos = player.group.position.clone().add(new THREE.Vector3(0, 2.3 + bob, 0));
    camera.position.copy(eyePos);

    camera.rotation.order = "YXZ";
    camera.rotation.y = cameraYaw;
    camera.rotation.x = cameraPitch;
  } else if (!mainMenuOverlay.classList.contains("hidden")) {
    // Cámara cinemática 3D inspirada en la referencia de Horizon / Aurora Studios
    const titleTime = performance.now() * 0.0006;
    const isPortrait = camera.aspect < 1;

    // Sutil paralaje cinemático con movimiento del ratón
    const breatheX = Math.sin(titleTime * 0.45) * 0.08 + (mouse.x * 0.22);
    const breatheY = Math.cos(titleTime * 0.6) * 0.05 - (mouse.y * 0.15);
    const breatheZ = Math.cos(titleTime * 0.35) * 0.08;

    // Encuadre 3/4 posterior (detrás del hombro izquierdo de Aria, contemplando el valle al amanecer)
    const camBackDist = isPortrait ? 3.4 : 2.7;
    const camHeight = isPortrait ? 1.55 : 1.42;
    const camSideOffset = isPortrait ? -0.3 : -0.75;

    const targetCamPos = player.group.position.clone().add(
      new THREE.Vector3(camSideOffset + breatheX, camHeight + breatheY, camBackDist + breatheZ)
    );

    camera.position.lerp(targetCamPos, 1 - Math.pow(0.005, dt));

    // El punto de mira enfoca hacia el valle y el horizonte rúnico delante de Aria
    const lookTarget = player.group.position.clone().add(
      new THREE.Vector3(1.1 + breatheX * 0.08, 1.38, -3.2)
    );
    camera.lookAt(lookTarget);
  } else if (cameraTransitionTimer > 0) {
    cameraTransitionTimer = Math.max(0, cameraTransitionTimer - dt);
    const progress = 1 - (cameraTransitionTimer / CAMERA_TRANSITION_DURATION);
    const t = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    camera.rotation.order = 'YXZ';
    camera.rotation.set(cameraPitch, cameraYaw, 0, 'YXZ');
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const pivot = player.group.position.clone().add(new THREE.Vector3(0, 1.65, 0));
    const gameplayCamPos = pivot.clone().addScaledVector(forward, -4.0).addScaledVector(right, 0.4);
    gameplayCamPos.y = Math.max(gameplayCamPos.y, getTerrainHeight(gameplayCamPos.x, gameplayCamPos.z) + 0.4);

    const titleCamPos = player.group.position.clone().add(new THREE.Vector3(-0.75, 1.42, 2.7));
    camera.position.copy(titleCamPos.clone().lerp(gameplayCamPos, t));

    const titleLook = player.group.position.clone().add(new THREE.Vector3(1.1, 1.38, -3.2));
    const gameplayLook = player.group.position.clone().add(new THREE.Vector3(0, 1.4, 0));
    camera.lookAt(titleLook.clone().lerp(gameplayLook, t));
  } else if (cameraMode === "tpp") {
    camera.rotation.order = 'YXZ';
    camera.rotation.set(cameraPitch, cameraYaw, 0, 'YXZ');
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const pivot = player.group.position.clone().add(new THREE.Vector3(0, 1.65, 0));
    const desired = pivot.clone().addScaledVector(forward, -3.8).addScaledVector(right, 0.7);
    desired.y = Math.max(desired.y, getTerrainHeight(desired.x, desired.z) + 0.4);
    camera.position.lerp(desired, 1 - Math.exp(-18 * dt));
  } else {
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
    message.innerHTML = "¡Victoria Legendaria!<small>Récord registrado en tu Perfil</small>";
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

// Battle Music UI & Toggling
function updateMusicUI() {
  if (musicEngine.isEnabled) {
    if (musicIcon) musicIcon.textContent = "🎵";
    if (musicText) musicText.textContent = "Música ON";
    btnMusicToggle.classList.add("active");
  } else {
    if (musicIcon) musicIcon.textContent = "🔇";
    if (musicText) musicText.textContent = "Música OFF";
    btnMusicToggle.classList.remove("active");
  }
}

function toggleMusic() {
  initAudio();
  const enabled = musicEngine.toggle();
  updateMusicUI();
  showToast(enabled ? "🎵 Música de Batalla Activada" : "🔇 Música Silenciada");
}

if (btnMusicToggle) {
  btnMusicToggle.addEventListener("click", toggleMusic);
}

function toggleCameraMode() {
  cameraMode = cameraMode === "fps" ? "tpp" : "fps";
  cameraPitch = cameraMode === 'tpp' ? -0.12 : 0;
  canvas.tabIndex = 0;
  canvas.focus({ preventScroll: true });
  player.velocity.set(0, 0, 0);
  if (camToggleText) {
    camToggleText.textContent = cameraMode === "fps" ? "1ra Persona" : "3ra Persona";
  }
  showToast(cameraMode === "fps" ? "👁️ Vista: Primera Persona (FPS)" : "🏹 Vista: Tercera Persona (Isométrica)");

  if (blenderHeroine) {
    blenderHeroine.visible = (cameraMode === "tpp");
  }
  if (fpsViewModel) {
    fpsViewModel.fpsRig.visible = (cameraMode === "fps" && !inspectMode);
  }

  resizeGame();
}

function updateUpgradeUI() {
  modalEssenceCount.textContent = profileManager.user.essence;
  essenceCountText.textContent = profileManager.user.essence;

  const bowCost = upgradeCosts.bow[upgrades.bow] || 0;
  btnUpgradeBow.disabled = upgrades.bow >= 3 || profileManager.user.essence < bowCost;
  btnUpgradeBow.innerHTML = upgrades.bow >= 3 ? "NIVEL MÁXIMO" : `Mejorar <span class="cost-tag">${bowCost} 💎</span>`;
  document.querySelectorAll("#bow-dots .dot").forEach((d, i) => d.classList.toggle("active", i < upgrades.bow));

  const droneCost = upgradeCosts.drone[upgrades.drone] || 0;
  btnUpgradeDrone.disabled = upgrades.drone >= 3 || profileManager.user.essence < droneCost;
  btnUpgradeDrone.innerHTML = upgrades.drone >= 3 ? "NIVEL MÁXIMO" : `Mejorar <span class="cost-tag">${droneCost} 💎</span>`;
  document.querySelectorAll("#drone-dots .dot").forEach((d, i) => d.classList.toggle("active", i < upgrades.drone));

  const armorCost = upgradeCosts.armor[upgrades.armor] || 0;
  btnUpgradeArmor.disabled = upgrades.armor >= 3 || profileManager.user.essence < armorCost;
  btnUpgradeArmor.innerHTML = upgrades.armor >= 3 ? "NIVEL MÁXIMO" : `Mejorar <span class="cost-tag">${armorCost} 💎</span>`;
  document.querySelectorAll("#armor-dots .dot").forEach((d, i) => d.classList.toggle("active", i < upgrades.armor));
}

function buyUpgrade(tree) {
  const currentLvl = upgrades[tree];
  if (currentLvl >= 3) return;
  const cost = upgradeCosts[tree][currentLvl];
  if (profileManager.spendEssence(cost)) {
    upgrades[tree] += 1;
    playSound("upgrade");
    vibrate(40);
    applyPlayerUpgrades();
    updateUpgradeUI();
    showToast(`⚡ ¡${tree.toUpperCase()} mejorado a Nivel ${upgrades[tree]}!`);
  }
}

// ==========================================================================
// Wardrobe Shop & 3D Customization
// ==========================================================================
function updateWardrobeUI() {
  if (wardrobeEssenceVal) {
    wardrobeEssenceVal.textContent = profileManager.user.essence;
  }
  if (!wardrobeItemsGrid) return;
  wardrobeItemsGrid.innerHTML = "";

  const items = ACCESSORY_CATALOG[currentWardrobeTab] || [];
  const equipped = profileManager.user.equipped[currentWardrobeTab === "skins" ? "skin" : currentWardrobeTab];

  items.forEach((item) => {
    const isUnlocked = profileManager.isItemUnlocked(item.id);
    const isEquipped = equipped === item.id;

    const card = document.createElement("div");
    card.className = `wardrobe-card ${isEquipped ? "equipped-card" : ""}`;

    let actionBtnHtml = "";
    if (isEquipped) {
      actionBtnHtml = `<button class="btn-wardrobe-action equipped" disabled>✓ Equipado</button>`;
    } else if (isUnlocked) {
      actionBtnHtml = `<button class="btn-wardrobe-action btn-equip" data-cat="${currentWardrobeTab}" data-id="${item.id}">Equipar</button>`;
    } else {
      actionBtnHtml = `<button class="btn-wardrobe-action buy btn-buy" data-cat="${currentWardrobeTab}" data-id="${item.id}" data-cost="${item.cost}">Comprar ${item.cost} 💎</button>`;
    }

    card.innerHTML = `
      <div class="wardrobe-card-info">
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
      </div>
      ${actionBtnHtml}
    `;

    wardrobeItemsGrid.appendChild(card);
  });

  // Attach button listeners
  wardrobeItemsGrid.querySelectorAll(".btn-equip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat === "skins" ? "skin" : btn.dataset.cat;
      const id = btn.dataset.id;
      profileManager.equipItem(cat, id);
      wardrobeManager.equipAccessory(cat, id);
      playSound("upgrade");
      updateWardrobeUI();
      showToast(`👗 ¡Equipado con éxito!`);
    });
  });

  wardrobeItemsGrid.querySelectorAll(".btn-buy").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cost = parseInt(btn.dataset.cost, 10);
      const cat = btn.dataset.cat === "skins" ? "skin" : btn.dataset.cat;
      const id = btn.dataset.id;
      if (profileManager.spendEssence(cost)) {
        profileManager.unlockItem(id);
        profileManager.equipItem(cat, id);
        wardrobeManager.equipAccessory(cat, id);
        playSound("upgrade");
        vibrate(40);
        updateWardrobeUI();
        showToast(`✨ ¡Has adquirido y equipado un nuevo accesorio!`);
      } else {
        showToast("❌ No tienes suficiente Esencia para este accesorio");
      }
    });
  });
}

wardrobeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    wardrobeTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentWardrobeTab = tab.dataset.tab;
    updateWardrobeUI();
  });
});

function openWardrobe() {
  initAudio();
  playSound("uiClick");
  if (!mainMenuOverlay.classList.contains("hidden")) {
    openedModalFromMenu = true;
    mainMenuOverlay.classList.add("hidden");
  }
  isWardrobeOpen = true;
  updateWardrobeUI();
  wardrobeModal.classList.remove("hidden");
}

function closeWardrobe() {
  initAudio();
  playSound("uiClick");
  isWardrobeOpen = false;
  wardrobeModal.classList.add("hidden");
  if (openedModalFromMenu && isGamePaused) {
    mainMenuOverlay.classList.remove("hidden");
    openedModalFromMenu = false;
  }
}

btnWardrobeOpen.addEventListener("click", openWardrobe);
btnCloseWardrobe.addEventListener("click", closeWardrobe);
btnOpenShopMenu.addEventListener("click", () => {
  openWardrobe();
});

// ==========================================================================
// Settings, Pause & Audio Options
// ==========================================================================
function openSettings() {
  initAudio();
  playSound("uiClick");
  if (!mainMenuOverlay.classList.contains("hidden")) {
    openedModalFromMenu = true;
    mainMenuOverlay.classList.add("hidden");
  }
  isSettingsOpen = true;
  settingsModal.classList.remove("hidden");
}

function closeSettings() {
  initAudio();
  playSound("uiClick");
  isSettingsOpen = false;
  settingsModal.classList.add("hidden");
  if (openedModalFromMenu && isGamePaused) {
    mainMenuOverlay.classList.remove("hidden");
    openedModalFromMenu = false;
  }
}

btnSettingsOpen.addEventListener("click", openSettings);
btnCloseSettings.addEventListener("click", closeSettings);
btnOpenSettingsMenu.addEventListener("click", openSettings);
btnResumeGame.addEventListener("click", () => {
  closeSettings();
  if (isGamePaused && mainMenuOverlay.classList.contains("hidden")) {
    isGamePaused = false;
  }
});

btnRestartLevel.addEventListener("click", () => {
  closeSettings();
  loadLevel(currentLevel);
  isGamePaused = false;
  showToast("🔄 Nivel reiniciado");
});

btnReturnMainMenu.addEventListener("click", () => {
  closeSettings();
  isGamePaused = true;
  mainMenuOverlay.classList.remove("hidden");
});

sliderVolumeMaster.addEventListener("input", (e) => {
  audioSettings.master = parseInt(e.target.value, 10) / 100;
  valVolumeMaster.textContent = `${e.target.value}%`;
  musicEngine.setVolume(audioSettings.master * audioSettings.music);
});

sliderVolumeMusic.addEventListener("input", (e) => {
  audioSettings.music = parseInt(e.target.value, 10) / 100;
  valVolumeMusic.textContent = `${e.target.value}%`;
  musicEngine.setVolume(audioSettings.master * audioSettings.music);
});

sliderVolumeSfx.addEventListener("input", (e) => {
  audioSettings.sfx = parseInt(e.target.value, 10) / 100;
  valVolumeSfx.textContent = `${e.target.value}%`;
});

sliderMouseSens.addEventListener("input", (e) => {
  const val = parseInt(e.target.value, 10);
  audioSettings.mouseSensitivity = 0.0012 + val * 0.0004;
  valMouseSens.textContent = val;
});

selectShadows.addEventListener("change", (e) => {
  if (e.target.value === "high") {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
  } else if (e.target.value === "low") {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
  } else {
    renderer.shadowMap.enabled = false;
  }
  renderer.shadowMap.needsUpdate = true;
});

// ==========================================================================
// Profile & User Login Modal
// ==========================================================================
function openProfile() {
  initAudio();
  playSound("uiClick");
  if (!mainMenuOverlay.classList.contains("hidden")) {
    openedModalFromMenu = true;
    mainMenuOverlay.classList.add("hidden");
  }
  isProfileOpen = true;
  updateProfileUI();
  profileModal.classList.remove("hidden");
}

function closeProfile() {
  initAudio();
  playSound("uiClick");
  isProfileOpen = false;
  profileModal.classList.add("hidden");
  if (openedModalFromMenu && isGamePaused) {
    mainMenuOverlay.classList.remove("hidden");
    openedModalFromMenu = false;
  }
}

btnProfileOpen.addEventListener("click", openProfile);
btnMenuSwitchUser.addEventListener("click", openProfile);
btnCloseProfile.addEventListener("click", closeProfile);

avatarOptButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    avatarOptButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentSelectedAvatar = btn.dataset.avatar;
  });
});

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = inputProfileName.value.trim() || "Guerrera del Alba";
  profileManager.login(name, currentSelectedAvatar);
  closeProfile();
  showToast(`👤 Perfil actualizado: ${name}`);
});

// ==========================================================================
// Credits & Lore Modal (Aurora Studios)
// ==========================================================================
function openCredits() {
  initAudio();
  playSound("uiClick");
  if (!mainMenuOverlay.classList.contains("hidden")) {
    openedModalFromMenu = true;
    mainMenuOverlay.classList.add("hidden");
  }
  if (creditsModal) creditsModal.classList.remove("hidden");
}

function closeCredits() {
  initAudio();
  playSound("uiClick");
  if (creditsModal) creditsModal.classList.add("hidden");
  if (openedModalFromMenu && isGamePaused) {
    mainMenuOverlay.classList.remove("hidden");
    openedModalFromMenu = false;
  }
}

if (btnOpenCreditsMenu) btnOpenCreditsMenu.addEventListener("click", openCredits);
if (btnCloseCredits) btnCloseCredits.addEventListener("click", closeCredits);
if (btnCreditsBack) btnCreditsBack.addEventListener("click", closeCredits);

// ==========================================================================
// Main Menu Actions (Nueva Partida, Continuar, Galería 3D)
// ==========================================================================
function startGame(isNew = false) {
  initAudio();
  if (isNew) {
    resetGame();
  }
  mainMenuOverlay.classList.add("hidden");
  isGamePaused = false;
  cameraTransitionTimer = CAMERA_TRANSITION_DURATION;
  if (!musicEngine.isPlaying) {
    musicEngine.start();
    musicEngine.setVolume(audioSettings.master * audioSettings.music);
    updateMusicUI();
  }
}

btnStartGame.addEventListener("click", (e) => {
  e.preventDefault();
  playSound("uiClick");
  startGame(true);
  showToast("⚔️ ¡Nueva Partida Iniciada! Nivel 1");
});

btnStartGame.addEventListener("touchend", (e) => {
  e.preventDefault();
  playSound("uiClick");
  startGame(true);
  showToast("⚔️ ¡Nueva Partida Iniciada! Nivel 1");
});

if (btnContinueGame) {
  btnContinueGame.addEventListener("click", (e) => {
    e.preventDefault();
    playSound("uiClick");
    startGame(false);
    showToast(`💾 Partida Reanudada · Nivel ${currentLevel}`);
  });

  btnContinueGame.addEventListener("touchend", (e) => {
    e.preventDefault();
    playSound("uiClick");
    startGame(false);
    showToast(`💾 Partida Reanudada · Nivel ${currentLevel}`);
  });
}

if (btnOpenGalleryMenu) {
  btnOpenGalleryMenu.addEventListener("click", (e) => {
    e.preventDefault();
    initAudio();
    playSound("uiClick");
    openedInspectFromMenu = true;
    mainMenuOverlay.classList.add("hidden");
    setInspectMode(true);
    showToast("🏛️ Extra: Galería de Modelos 3D");
  });
}

// Audio de Hover en Botones del Menú
document.querySelectorAll(".menu-action-btn").forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    playSound("uiHover");
  });
});

// Chest Open Event Listener
btnOpenChest.addEventListener("click", tryOpenNearestChest);
btnTouchInteract.addEventListener("click", tryOpenNearestChest);

// Level Completion & Real Record Saving
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
      const totalScore = Math.floor(profileManager.user.essence * 5 + player.health * 10 + player.enemiesDefeated * 100);
      const timeSec = Math.max(1, Math.floor(elapsed));
      profileManager.recordScore(totalScore, timeSec, 9, currentLevel);
      setTimeout(() => { openLeaderboard(true); }, 1500);
    }
  }
}

btnNextLevel.addEventListener("click", () => {
  if (currentLevel < 3) {
    loadLevel(currentLevel + 1);
  }
});

// Real Leaderboard System
async function fetchScores() {
  leaderboardBody.innerHTML = '<tr><td colspan="5" class="loading-td">Cargando récords...</td></tr>';
  const localList = profileManager.getLocalLeaderboard();

  try {
    const res = await fetch("/api/scores");
    const data = await res.json();
    if (data.source === "vercel_postgres" && data.scores && data.scores.length > 0) {
      dbStatusTag.textContent = "Conectado a Vercel Postgres";
      renderLeaderboard(data.scores);
      return;
    }
  } catch (err) {}

  dbStatusTag.textContent = "Base de Datos Local / Offline";
  renderLeaderboard(localList);
}

function renderLeaderboard(list) {
  leaderboardBody.innerHTML = list.map((item, idx) => `
    <tr>
      <td><strong>#${idx + 1}</strong></td>
      <td>${item.avatar || "🏹"} ${item.player_name || "Anónimo"}</td>
      <td><strong style="color: #6cf5ff;">${(item.score || 0).toLocaleString()}</strong></td>
      <td>${item.crystals || 0}</td>
      <td>${item.time_seconds || 0}s</td>
    </tr>
  `).join("");
}

function openLeaderboard(allowSubmit = false) {
  initAudio();
  playSound("uiClick");
  if (!mainMenuOverlay.classList.contains("hidden")) {
    openedModalFromMenu = true;
    mainMenuOverlay.classList.add("hidden");
  }
  isLeaderboardOpen = true;
  leaderboardModal.classList.remove("hidden");
  fetchScores();
  if (allowSubmit) {
    const totalScore = Math.floor(profileManager.user.essence * 5 + player.health * 10 + player.enemiesDefeated * 100);
    summaryScore.textContent = totalScore.toLocaleString();
    summaryTime.textContent = Math.max(1, Math.floor(elapsed));
    if (playerNameInput) playerNameInput.value = profileManager.user.name;
    scoreSubmitBox.classList.remove("hidden");
  } else {
    scoreSubmitBox.classList.add("hidden");
  }
}

function closeLeaderboard() {
  initAudio();
  playSound("uiClick");
  isLeaderboardOpen = false;
  leaderboardModal.classList.add("hidden");
  if (openedModalFromMenu && isGamePaused) {
    mainMenuOverlay.classList.remove("hidden");
    openedModalFromMenu = false;
  }
}

scoreForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = playerNameInput.value.trim() || profileManager.user.name;
  const totalScore = Math.floor(profileManager.user.essence * 5 + player.health * 10 + player.enemiesDefeated * 100);
  const timeSec = Math.max(1, Math.floor(elapsed));

  await profileManager.recordScore(totalScore, timeSec, 9, currentLevel);
  scoreSubmitBox.classList.add("hidden");
  fetchScores();
  showToast("🏆 ¡Récord guardado con éxito!");
});

btnLeaderboard.addEventListener("click", () => openLeaderboard(false));
btnOpenRecordsMenu.addEventListener("click", () => openLeaderboard(false));
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
  const target = e.target;
  if (target && (target.closest("button") || target.closest("input") || target.closest(".menu-overlay") || target.closest(".modal-overlay") || target.closest(".hud"))) {
    return;
  }
  if (isGamePaused || !mainMenuOverlay.classList.contains("hidden") || inspectMode || isLeaderboardOpen || isUpgradeOpen || isWardrobeOpen || isProfileOpen || isSettingsOpen) {
    return;
  }
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
      if (!isGamePaused && !inspectMode && !isLeaderboardOpen && !isUpgradeOpen && !isWardrobeOpen && !isProfileOpen && !isSettingsOpen) {
        const target = e.target;
        if (!target.closest("button") && !target.closest("input") && !target.closest(".modal-box") && !target.closest(".main-menu-card")) {
          touchLookId = t.identifier;
          prevTouchLook = { x: t.clientX, y: t.clientY };
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
    if (t.identifier === touchLookId) {
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
  player.enemiesDefeated = 0;
  player.health = player.maxHealth;
  player.energy = 100;
  player.velocity.set(0, 0, 0);
  const startY = getTerrainHeight(-31, 18);
  player.group.position.set(-31, startY, 18);
  player.group.rotation.y = -0.38;
  gameOver = false;
  gameFinished = false;
  message.textContent = "";
  loadLevel(1);
  updateUpgradeUI();
  closeLeaderboard();
  closeSettings();
  closeWardrobe();
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
    if (openedInspectFromMenu && isGamePaused) {
      openedInspectFromMenu = false;
      mainMenuOverlay.classList.remove("hidden");
    }
  }
}

function resizeGame() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = width / height;
  // Adaptive FOV for landscape vs portrait
  if (cameraMode === "fps") {
    camera.fov = camera.aspect > 1.2 ? 65 : 75;
  } else {
    camera.fov = camera.aspect < 1 ? 68 : 50;
  }
  camera.updateProjectionMatrix();
}

async function toggleFullscreenLandscape() {
  initAudio();
  try {
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (!isFull) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      }
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock("landscape").catch(() => {});
      }
      showToast("⛶ Pantalla Completa & Modo Horizontal Activado");
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      }
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
      showToast("Pantalla Completa Desactivada");
    }
  } catch (err) {
    showToast("Gira tu celular horizontalmente para jugar");
  }
  setTimeout(resizeGame, 80);
  setTimeout(resizeGame, 250);
}

if (btnFullscreenToggle) btnFullscreenToggle.addEventListener("click", toggleFullscreenLandscape);
if (btnMenuFullscreen) btnMenuFullscreen.addEventListener("click", toggleFullscreenLandscape);
if (btnTouchFullscreen) btnTouchFullscreen.addEventListener("click", toggleFullscreenLandscape);

window.addEventListener("resize", () => {
  resizeGame();
  setTimeout(resizeGame, 80);
  setTimeout(resizeGame, 250);
});
window.addEventListener("orientationchange", () => {
  setTimeout(resizeGame, 50);
  setTimeout(resizeGame, 150);
  setTimeout(resizeGame, 350);
});
if (screen.orientation) {
  screen.orientation.addEventListener("change", () => {
    setTimeout(resizeGame, 50);
    setTimeout(resizeGame, 150);
    setTimeout(resizeGame, 350);
  });
}
document.addEventListener("fullscreenchange", () => {
  setTimeout(resizeGame, 80);
  setTimeout(resizeGame, 250);
});

canvas.addEventListener("click", () => {
  if (!isGamePaused && !inspectMode && !isLeaderboardOpen && !isUpgradeOpen && !isWardrobeOpen && !isSettingsOpen) {
    try { canvas.requestPointerLock()?.catch(() => {}); } catch (e) {}
  }
});

window.addEventListener("mousemove", (e) => {
  if ((document.pointerLockElement === canvas || e.buttons === 2) && !inspectMode && !isGamePaused && !isSettingsOpen && !isWardrobeOpen && !isProfileOpen && !isLeaderboardOpen && !isUpgradeOpen) {
    cameraYaw -= e.movementX * audioSettings.mouseSensitivity;
    cameraPitch = THREE.MathUtils.clamp(cameraPitch - e.movementY * (audioSettings.mouseSensitivity * 0.9), -1.25, 1.25);
  }
});

canvas.addEventListener('contextmenu', e => e.preventDefault());

window.addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLElement && (e.target.matches('input, textarea, select') || e.target.isContentEditable)) return;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
  initAudio();
  const k = e.key.toLowerCase();
  keys.add(k);

  if (e.code === "Space" && !e.repeat) { e.preventDefault(); jump(); }
  if (e.key === "Shift") isSprinting = true;
  if (k === "e") tryOpenNearestChest();
  if (k === "q") triggerDroneShockwave();
  if (k === "c" && !e.repeat) toggleCameraMode();
  if (k === "m") toggleMusic();
  if (k === "f") toggleFullscreenLandscape();
  if (k === "b") openWardrobe();
  if (k === "p") {
    if (isSettingsOpen) closeSettings();
    else openSettings();
  }
  if (k === "r") resetGame();
  if (k === "v") setInspectMode(!inspectMode);
  if (k === "u") {
    isUpgradeOpen = !isUpgradeOpen;
    upgradeModal.classList.toggle("hidden", !isUpgradeOpen);
    if (isUpgradeOpen) updateUpgradeUI();
  }
  if (k === "t") openLeaderboard(false);
  if (e.key === "Escape") {
    if (isSettingsOpen) closeSettings();
    else if (isWardrobeOpen) closeWardrobe();
    else if (isProfileOpen) closeProfile();
    else if (isLeaderboardOpen) closeLeaderboard();
    else if (isUpgradeOpen) {
      isUpgradeOpen = false;
      upgradeModal.classList.add("hidden");
    } else if (inspectMode) setInspectMode(false);
    else if (!isGamePaused) openSettings();
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

window.addEventListener("pointermove", (e) => {
  if (!mainMenuOverlay.classList.contains("hidden")) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }
});

canvas.addEventListener("pointerdown", (e) => {
  initAudio();
  if (inspectMode) {
    isDragging = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
  } else if (e.pointerType === "mouse" && e.button === 0 && !isGamePaused) {
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

// ==========================================================================
// Main Game Loop with Pause, Chests & Dynamic Music Intensity
// ==========================================================================
function animate(frameTime = performance.now()) {
  const dt = Math.min((frameTime - lastFrameTime) / 1000, 0.033);
  lastFrameTime = frameTime;

  if (!isGamePaused && !gameOver && !gameFinished) {
    elapsed += dt;
    updatePlayer(dt);
    updateCrystals(dt);
    updateEnemies(dt);
    updateBolts(dt);
    updateEnemyBolts(dt);
    updateParticles(dt);
    updateShockwaves(dt);
    updateAmbientMotes(dt);

    // Update Chests & Proximity Check
    if (chestManager) {
      activeNearChest = chestManager.update(dt, player.group.position);
      if (activeNearChest) {
        chestPrompt.classList.remove("hidden");
        btnTouchInteract.classList.remove("hidden");
      } else {
        chestPrompt.classList.add("hidden");
        btnTouchInteract.classList.add("hidden");
      }
    }

    checkLevelCompletion();

    // Dynamic Battle Music Intensity
    if (musicEngine.isEnabled) {
      let closestDist = 999;
      enemies.forEach((e) => {
        const d = e.group.position.distanceTo(player.group.position);
        if (d < closestDist) closestDist = d;
      });

      if (currentLevel === 3 && levelBoss && levelBoss.health > 0) {
        musicEngine.setIntensity("boss");
      } else if (closestDist < 20) {
        musicEngine.setIntensity("combat");
      } else {
        musicEngine.setIntensity("ambient");
      }
    }
  } else if (player.heroine) {
    player.heroine.update(dt, false, null, false, null);
    if (blenderMixer) {
      if (blenderActions["Idle"] && activeBlenderAction !== blenderActions["Idle"]) {
        if (activeBlenderAction) activeBlenderAction.fadeOut(0.25);
        blenderActions["Idle"].reset().fadeIn(0.25).play();
        activeBlenderAction = blenderActions["Idle"];
      }
      blenderMixer.update(dt);
    }
    updateCrystals(dt);
    updateParticles(dt);
    updateShockwaves(dt);
    updateAmbientMotes(dt);
  }

  updateCamera(dt);
  updateHud();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Start Game Setup
document.querySelector('#btn-touch-jump').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  jump();
});

createWorld();
initPlayer();
loadLevel(1);
resizeGame();
camera.position.set(-31, 2.3, 18);
updateProfileUI();
animate();
