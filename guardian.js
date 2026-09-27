import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js';

const armor = new THREE.MeshStandardMaterial({ color: 0x736b59, roughness: 0.75, metalness: 0.45 });
const dark = new THREE.MeshStandardMaterial({ color: 0x20282b, metalness: 0.7, roughness: 0.4 });
const pink = new THREE.MeshStandardMaterial({ color: 0xff65d9, emissive: 0xda188f, emissiveIntensity: 2 });
const blue = new THREE.MeshStandardMaterial({ color: 0x94faff, emissive: 0x24bfea, emissiveIntensity: 3 });

export function createGuardian() {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  function add(parent, geometry, material, x, y, z) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  add(body, new THREE.SphereGeometry(1.15, 12, 8), dark, 0, 1.45, 0).scale.set(1.2, 0.65, 1);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    const plate = add(body, new THREE.BoxGeometry(0.75, 0.38, 0.85), armor, Math.sin(a) * 0.95, 1.7, Math.cos(a) * 0.85);
    plate.rotation.set(0, a, 0.15);
    const ring = add(body, new THREE.TorusGeometry(0.24, 0.045, 6, 14), pink, Math.sin(a) * 1.17, 1.52, Math.cos(a) * 1.08);
    ring.rotation.y = a;
  }
  add(body, new THREE.CylinderGeometry(0.38, 0.7, 0.9, 8), armor, 0, 2.13, 0);
  add(body, new THREE.SphereGeometry(0.52, 12, 8), dark, 0, 2.75, 0);
  add(body, new THREE.TorusGeometry(0.37, 0.09, 8, 20), armor, 0, 2.78, 0.38);
  const eye = add(body, new THREE.SphereGeometry(0.27, 12, 8), blue, 0, 2.78, 0.49);
  const legs = [];
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3 + Math.PI / 6;
    const leg = new THREE.Group();
    leg.rotation.y = a;
    group.add(leg);
    const upper = new THREE.Group();
    upper.position.set(0, 1.45, 0.85);
    leg.add(upper);
    const knee = new THREE.Vector3(0, 2.1, 1.7);
    function segment(parent, from, to) {
      const direction = to.clone().sub(from);
      const bone = add(parent, new THREE.CylinderGeometry(0.14, 0.19, direction.length(), 6), dark, 0, 0, 0);
      bone.position.copy(from).add(to).multiplyScalar(0.5);
      bone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      for (let k = 0; k < 4; k++) {
        const p = from.clone().lerp(to, (k + 0.5) / 4);
        const plate = add(parent, new THREE.BoxGeometry(0.38, 0.32, 0.4), armor, p.x, p.y, p.z);
        plate.quaternion.copy(bone.quaternion);
      }
    }
    segment(upper, new THREE.Vector3(), knee.clone().sub(upper.position));
    const lower = new THREE.Group();
    lower.position.copy(knee).sub(upper.position);
    upper.add(lower);
    segment(lower, new THREE.Vector3(), new THREE.Vector3(0, -1.9, 0.7));
    add(lower, new THREE.ConeGeometry(0.24, 0.5, 5), dark, 0, -1.95, 0.7).rotation.x = Math.PI;
    legs.push({ upper, lower });
  }
  return { group, update(time, moving) {
    body.position.y = Math.sin(time * 5) * 0.055;
    eye.scale.setScalar(1 + Math.sin(time * 4) * 0.07);
    legs.forEach(({ upper, lower }, i) => {
      const phase = time * 7 + (i % 2) * Math.PI;
      upper.rotation.y = Math.sin(phase) * (moving ? 0.2 : 0.015);
      upper.rotation.x = Math.max(0, Math.sin(phase)) * (moving ? 0.19 : 0.015);
      lower.rotation.x = -upper.rotation.x * 0.8;
    });
  } };
}
