// chests.js - 3D Treasure Chests, Beacon Lights, and Loot System for Ecos del Alba
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js";

function mesh(geometry, material, shadows = true) {
  const obj = new THREE.Mesh(geometry, material);
  obj.castShadow = shadows;
  obj.receiveShadow = shadows;
  return obj;
}

export function build3DChest(mats) {
  const root = new THREE.Group();

  const chestWood = new THREE.MeshStandardMaterial({ color: 0x362312, roughness: 0.85 });
  const chestGold = new THREE.MeshStandardMaterial({
    color: 0xffcc33,
    emissive: 0x9e7308,
    emissiveIntensity: 1.5,
    metalness: 0.8,
    roughness: 0.3,
  });
  const lockGlow = new THREE.MeshStandardMaterial({
    color: 0x5df8ff,
    emissive: 0x35e7f2,
    emissiveIntensity: 3.5,
  });

  // Chest Base Box
  const base = mesh(new THREE.BoxGeometry(1.2, 0.55, 0.8), chestWood);
  base.position.y = 0.275;
  root.add(base);

  // Gold Trim on Base
  [-0.56, 0.56].forEach((px) => {
    const trim = mesh(new THREE.BoxGeometry(0.08, 0.57, 0.82), chestGold, false);
    trim.position.set(px, 0.275, 0);
    root.add(trim);
  });

  // Pivot Group for the Hinged Lid (hinge is at back top edge: z = -0.4, y = 0.55)
  const lidHinge = new THREE.Group();
  lidHinge.position.set(0, 0.55, -0.4);
  root.add(lidHinge);

  // Curved Lid Mesh
  const lidGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 14, 1, false, 0, Math.PI);
  lidGeo.rotateZ(Math.PI / 2);
  const lidMesh = mesh(lidGeo, chestWood);
  lidMesh.position.set(0, 0, 0.4);
  lidHinge.add(lidMesh);

  // Gold Bands on Lid
  [-0.56, 0.56].forEach((px) => {
    const bandGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 14, 1, false, 0, Math.PI);
    bandGeo.rotateZ(Math.PI / 2);
    const band = mesh(bandGeo, chestGold, false);
    band.position.set(px, 0, 0.4);
    lidHinge.add(band);
  });

  // Front Lock Clasp
  const lock = mesh(new THREE.BoxGeometry(0.14, 0.16, 0.1), lockGlow, false);
  lock.position.set(0, -0.05, 0.82);
  lidHinge.add(lock);

  // Vertical Light Beacon (so players can spot chests from afar)
  const beaconGeo = new THREE.CylinderGeometry(0.08, 0.35, 14, 8, 1, true);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0xffd147,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 7.0;
  root.add(beacon);

  // Soft Point Light
  const pLight = new THREE.PointLight(0xffcc44, 2.0, 8);
  pLight.position.y = 0.8;
  root.add(pLight);

  return {
    root,
    lidHinge,
    lock,
    beacon,
    pLight,
    opened: false,
    openProgress: 0,
    animateOpen(dt) {
      if (this.openProgress < 1.0) {
        this.openProgress = Math.min(1.0, this.openProgress + dt * 2.2);
        // Smooth swing back ~75 degrees
        this.lidHinge.rotation.x = -this.openProgress * (Math.PI * 0.48);
        this.beacon.material.opacity = Math.max(0, 0.35 * (1 - this.openProgress));
        if (this.openProgress >= 1.0) {
          this.beacon.visible = false;
        }
      }
    },
  };
}

export class ChestManager {
  constructor(scene, addColliderFn, getTerrainHeightFn) {
    this.scene = scene;
    this.addColliderFn = addColliderFn;
    this.getTerrainHeightFn = getTerrainHeightFn;
    this.chests = [];
  }

  clear() {
    this.chests.forEach((c) => this.scene.remove(c.chest3D.root));
    this.chests = [];
  }

  spawnChest(x, z, loot = { essence: 180, xp: 120 }) {
    const y = this.getTerrainHeightFn(x, z);
    const chest3D = build3DChest();
    chest3D.root.position.set(x, y, z);
    chest3D.root.rotation.y = (Math.random() - 0.5) * 1.5;
    this.scene.add(chest3D.root);

    // Register physical collider
    if (this.addColliderFn) {
      this.addColliderFn(x, z, 0.85, "treasure_chest");
    }

    const chestObj = {
      x,
      z,
      chest3D,
      loot,
      opened: false,
    };
    this.chests.push(chestObj);
    return chestObj;
  }

  update(dt, playerPosition) {
    let nearChest = null;

    this.chests.forEach((chest) => {
      if (chest.opened) {
        chest.chest3D.animateOpen(dt);
      } else {
        const dist = Math.hypot(chest.x - playerPosition.x, chest.z - playerPosition.z);
        if (dist < 2.8) {
          nearChest = chest;
        }
      }
    });

    return nearChest;
  }

  openChest(chest) {
    if (!chest || chest.opened) return null;
    chest.opened = true;
    chest.chest3D.opened = true;
    return chest.loot;
  }
}
