// wardrobe.js - 3D Accessories, Wings, Helmets, and Armor Customization for Ecos del Alba
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js";

function mesh(geometry, material, shadows = true) {
  const obj = new THREE.Mesh(geometry, material);
  obj.castShadow = shadows;
  obj.receiveShadow = shadows;
  return obj;
}

// Accessory Catalog with prices, descriptions, and 3D builders
export const ACCESSORY_CATALOG = {
  head: [
    { id: "none", name: "Sin Accesorio", cost: 0, desc: "Aspecto natural sin casco ni visor." },
    {
      id: "cyber_visor",
      name: "Visor Táctico Neón",
      cost: 150,
      desc: "Visor holográfico de exploración con escáner de terreno.",
      build: () => {
        const group = new THREE.Group();
        group.name = "acc_head_cyber_visor";
        const visorMat = new THREE.MeshStandardMaterial({
          color: 0x5df8ff,
          emissive: 0x22c5d1,
          emissiveIntensity: 3.0,
          transparent: true,
          opacity: 0.85,
        });
        const bandMat = new THREE.MeshStandardMaterial({ color: 0x1a2428, roughness: 0.5, metalness: 0.8 });

        // Curved visor glass
        const glass = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16, 1, true, -Math.PI / 3, (2 * Math.PI) / 3), visorMat, false);
        glass.position.set(0, 0, 0.04);
        group.add(glass);

        // Side temples/frame
        const frame = mesh(new THREE.TorusGeometry(0.245, 0.016, 8, 20), bandMat, false);
        frame.rotation.x = Math.PI / 2;
        group.add(frame);

        return group;
      },
    },
    {
      id: "golden_tiara",
      name: "Tiara del Alba Ancestral",
      cost: 300,
      desc: "Corona forjada en oro solar con una gema sagrada incrustada.",
      build: () => {
        const group = new THREE.Group();
        group.name = "acc_head_golden_tiara";
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xffd447,
          emissive: 0xbf9511,
          emissiveIntensity: 1.8,
          metalness: 0.9,
          roughness: 0.2,
        });
        const gemMat = new THREE.MeshStandardMaterial({
          color: 0x88ffff,
          emissive: 0x3af4ff,
          emissiveIntensity: 3.5,
        });

        // Golden circlet
        const circlet = mesh(new THREE.TorusGeometry(0.24, 0.02, 8, 24), goldMat, false);
        circlet.rotation.x = Math.PI / 2;
        circlet.position.y = 0.06;
        group.add(circlet);

        // Front peak
        const peak = mesh(new THREE.ConeGeometry(0.06, 0.14, 4), goldMat, false);
        peak.position.set(0, 0.14, 0.23);
        group.add(peak);

        // Forehead gem
        const gem = mesh(new THREE.OctahedronGeometry(0.04, 0), gemMat, false);
        gem.position.set(0, 0.07, 0.24);
        group.add(gem);

        return group;
      },
    },
    {
      id: "spectral_helm",
      name: "Máscara de Sombra Umbría",
      cost: 450,
      desc: "Casco de sigilo con visor de resonancia violeta y cuernos cibernéticos.",
      build: () => {
        const group = new THREE.Group();
        group.name = "acc_head_spectral_helm";
        const helmMat = new THREE.MeshStandardMaterial({ color: 0x181020, roughness: 0.3, metalness: 0.85 });
        const purpleMat = new THREE.MeshStandardMaterial({ color: 0xd952ff, emissive: 0xaa1ee6, emissiveIntensity: 3.0 });

        // Half mask
        const mask = mesh(new THREE.SphereGeometry(0.25, 14, 12, 0, Math.PI, 0, Math.PI * 0.55), helmMat);
        mask.rotation.x = -Math.PI / 4;
        mask.position.set(0, 0.02, 0.05);
        group.add(mask);

        // Cyber horns
        [-0.18, 0.18].forEach((px, idx) => {
          const horn = mesh(new THREE.ConeGeometry(0.04, 0.22, 5), purpleMat, false);
          horn.position.set(px, 0.22, 0.08);
          horn.rotation.z = (idx === 0 ? 1 : -1) * 0.45;
          horn.rotation.x = -0.3;
          group.add(horn);
        });

        return group;
      },
    },
  ],

  back: [
    { id: "none", name: "Sin Accesorio de Espalda", cost: 0, desc: "Espalda despejada." },
    {
      id: "plasma_wings",
      name: "Alas de Plasma Sagrado",
      cost: 350,
      desc: "Alas de energía translúcida que proyectan una silueta divina.",
      build: () => {
        const group = new THREE.Group();
        group.name = "acc_back_plasma_wings";
        const wingMat = new THREE.MeshStandardMaterial({
          color: 0x5df8ff,
          emissive: 0x22c5d1,
          emissiveIntensity: 3.2,
          transparent: true,
          opacity: 0.78,
          side: THREE.DoubleSide,
        });

        [-1, 1].forEach((dir) => {
          const wing = new THREE.Group();
          wing.position.set(dir * 0.12, 0.45, -0.16);

          for (let f = 0; f < 3; f++) {
            const feather = mesh(new THREE.BoxGeometry(0.55 - f * 0.1, 0.08, 0.02), wingMat, false);
            feather.position.set(dir * (0.3 + f * 0.08), 0.1 - f * 0.12, 0);
            feather.rotation.z = dir * (0.4 - f * 0.25);
            feather.rotation.y = dir * 0.2;
            wing.add(feather);
          }
          group.add(wing);
        });

        return group;
      },
    },
    {
      id: "ceremonial_cape",
      name: "Capa Imperial del Alba",
      cost: 250,
      desc: "Capa ceremonial tejida con hilos rúnicos dorados.",
      build: () => {
        const group = new THREE.Group();
        group.name = "acc_back_ceremonial_cape";
        const clothMat = new THREE.MeshStandardMaterial({
          color: 0x22363b,
          roughness: 0.9,
          side: THREE.DoubleSide,
        });
        const trimMat = new THREE.MeshStandardMaterial({
          color: 0xffd147,
          emissive: 0xcc9314,
          emissiveIntensity: 2.0,
        });

        // Main cape cloth
        const capeGeo = new THREE.PlaneGeometry(0.58, 1.1, 6, 8);
        const cape = mesh(capeGeo, clothMat);
        cape.position.set(0, 0.05, -0.18);
        cape.rotation.x = 0.14;
        group.add(cape);

        // Gold collar brooches
        [-0.18, 0.18].forEach((px) => {
          const brooch = mesh(new THREE.SphereGeometry(0.04, 8, 8), trimMat, false);
          brooch.position.set(px, 0.58, -0.12);
          group.add(brooch);
        });

        return group;
      },
    },
  ],

  skins: [
    {
      id: "default",
      name: "Ecos del Alba (Original)",
      cost: 0,
      desc: "Colores tradicionales de las guardianas del bosque sagrado.",
      palette: {
        cuirass: 0x223035,
        cuirassEmissive: 0x3be7f5,
        cuirassIntensity: 1.8,
        trim: 0x5df8ff,
        leather: 0x1e282c,
      },
    },
    {
      id: "neon_shadow",
      name: "Obsidiana Neón Cyberpunk",
      cost: 280,
      desc: "Blindaje negro mate con acentos de plasma magenta brillante.",
      palette: {
        cuirass: 0x110c16,
        cuirassEmissive: 0xd938ff,
        cuirassIntensity: 2.6,
        trim: 0xeb4dff,
        leather: 0x0c0712,
      },
    },
    {
      id: "valkyrie_gold",
      name: "Valkiria Imperial Dorada",
      cost: 500,
      desc: "Armadura ceremonial de oro puro con runas celestiales resplandecientes.",
      palette: {
        cuirass: 0x3d2c0d,
        cuirassEmissive: 0xffcb36,
        cuirassIntensity: 2.8,
        trim: 0xffea78,
        leather: 0x291d08,
      },
    },
    {
      id: "arctic_frost",
      name: "Cero Absoluto Glacial",
      cost: 380,
      desc: "Recubrimiento térmico ártico con cristales criogénicos luminosos.",
      palette: {
        cuirass: 0x1a333d,
        cuirassEmissive: 0x88ffff,
        cuirassIntensity: 3.0,
        trim: 0xb5ffff,
        leather: 0x102128,
      },
    },
  ],
};

// Wardrobe Manager for equipping and updating 3D protagonist meshes
export class WardrobeManager {
  constructor(protagonistHeroine, protagonistMats) {
    this.heroine = protagonistHeroine;
    this.mats = protagonistMats;
    this.equipped = {
      head: "none",
      back: "none",
      skin: "default",
    };
    this.currentHeadMesh = null;
    this.currentBackMesh = null;
  }

  equipAccessory(category, itemId) {
    if (category === "head") {
      if (this.currentHeadMesh) {
        this.heroine.headGroup.remove(this.currentHeadMesh);
        this.currentHeadMesh = null;
      }
      this.equipped.head = itemId;
      const item = ACCESSORY_CATALOG.head.find((a) => a.id === itemId);
      if (item && item.build) {
        const accMesh = item.build();
        this.heroine.headGroup.add(accMesh);
        this.currentHeadMesh = accMesh;
      }
    } else if (category === "back") {
      if (this.currentBackMesh) {
        this.heroine.torso.remove(this.currentBackMesh);
        this.currentBackMesh = null;
      }
      this.equipped.back = itemId;
      const item = ACCESSORY_CATALOG.back.find((a) => a.id === itemId);
      if (item && item.build) {
        const accMesh = item.build();
        this.heroine.torso.add(accMesh);
        this.currentBackMesh = accMesh;
      }
    } else if (category === "skin") {
      this.equipped.skin = itemId;
      const skin = ACCESSORY_CATALOG.skins.find((s) => s.id === itemId);
      if (skin && skin.palette && this.mats) {
        if (this.mats.cuirass) {
          this.mats.cuirass.color.set(skin.palette.cuirass);
          this.mats.cuirass.emissive.set(skin.palette.cuirassEmissive);
          this.mats.cuirass.emissiveIntensity = skin.palette.cuirassIntensity;
        }
        if (this.mats.armorTrim) {
          this.mats.armorTrim.color.set(skin.palette.trim);
        }
        if (this.mats.leatherDark) {
          this.mats.leatherDark.color.set(skin.palette.leather);
        }
      }
    }
  }

  getEquipped() {
    return { ...this.equipped };
  }

  loadEquipped(equippedObj) {
    if (!equippedObj) return;
    if (equippedObj.head) this.equipAccessory("head", equippedObj.head);
    if (equippedObj.back) this.equipAccessory("back", equippedObj.back);
    if (equippedObj.skin) this.equipAccessory("skin", equippedObj.skin);
  }
}
