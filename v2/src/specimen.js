/* =========================================================================
   A PEÇA — coruja-das-torres (Tyto alba) em formas geométricas provisórias.
   Cada camada é um grupo com nome fixo; um .glb com malhas dos mesmos nomes
   substitui-as sem mexer no resto (ver v2/MODELOS.md).
     Peca_Base      base oval de madeira, cepo e ramo
     Peca_Armacao   armação de arame (dentro do corpo)
     Peca_Corpo     corpo esculpido (por baixo da pele)
     Peca_Olho_E    olho de vidro esquerdo
     Peca_Olho_D    olho de vidro direito
     Peca_Pele      pele com penas, disco facial, bico, asas e garras
     Nota_1 … Nota_4  pontos das notas (objetos vazios)
   Unidades em metros; a base assenta em y = 0; a peça olha para +z.
   ========================================================================= */
import * as THREE from "three";
import { featherTexture, woodTexture, barkTexture, labelTexture } from "./textures.js";

/* Para usar um modelo real: ponha o ficheiro em v2/models/ e indique o caminho, ex. "models/peca.glb" */
export const MODEL_URL = null;

const V = (x, y, z) => new THREE.Vector3(x, y, z);

function latheBody(scale = 1) {
  // perfil (raio, altura) de um corpo de coruja, de baixo para cima
  const prof = [[0.0, 0.205], [0.06, 0.215], [0.115, 0.25], [0.148, 0.31], [0.16, 0.38], [0.156, 0.45], [0.14, 0.51], [0.115, 0.56], [0.09, 0.595], [0.0, 0.61]];
  const pts = prof.map(([r, y]) => new THREE.Vector2(r * scale, 0.205 + (y - 0.205) * scale));
  const g = new THREE.LatheGeometry(pts, 48);
  g.scale(1, 1, 0.86);
  g.computeVertexNormals();
  return g;
}

function heartShape() {
  // disco facial em forma de coração (ponta para baixo)
  const s = new THREE.Shape();
  s.moveTo(0, -0.098);
  s.bezierCurveTo(0.05, -0.07, 0.112, -0.02, 0.104, 0.045);
  s.bezierCurveTo(0.098, 0.09, 0.04, 0.1, 0, 0.062);
  s.bezierCurveTo(-0.04, 0.1, -0.098, 0.09, -0.104, 0.045);
  s.bezierCurveTo(-0.112, -0.02, -0.05, -0.07, 0, -0.098);
  return s;
}

export function buildPlaceholder({ name, sci, mobile }) {
  const root = new THREE.Group();
  root.name = "Peca";

  // ---------- materiais
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture(), color: 0xffffff, roughness: 0.55, metalness: 0 });
  const bark = new THREE.MeshStandardMaterial({ map: barkTexture(), roughness: 0.95 });
  const featherGold = new THREE.MeshStandardMaterial({ map: featherTexture({ seed: 3 }), roughness: 0.8, metalness: 0 });
  const featherPale = new THREE.MeshStandardMaterial({ map: featherTexture({ base: "#ece0c6", edge: "#cdb58e", light: "#fbf4e4", fleck: "#8a7e70", rows: 18, seed: 9 }), roughness: 0.85 });
  const face = new THREE.MeshStandardMaterial({ color: 0xf3eadb, roughness: 0.9 });
  const faceRim = new THREE.MeshStandardMaterial({ color: 0xb88a52, roughness: 0.85 });
  const keratin = new THREE.MeshStandardMaterial({ color: 0xd9c9a8, roughness: 0.45 });
  const claw = new THREE.MeshStandardMaterial({ color: 0x2a221b, roughness: 0.35 });
  const clay = new THREE.MeshStandardMaterial({ color: 0xb9a58a, roughness: 0.9 });
  const brassWire = new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.35, metalness: 0.9 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x050403, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02 });
  const paper = new THREE.MeshStandardMaterial({ map: labelTexture({ name, sci }), roughness: 0.9 });

  // ---------- Peca_Base: base oval, cepo e ramo
  const base = new THREE.Group(); base.name = "Peca_Base";
  const oval = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.315, 0.05, 64), wood);
  oval.scale.z = 0.72; oval.position.y = 0.025; base.add(oval);
  const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.16, 20), bark);
  stump.position.set(0.02, 0.13, -0.02); stump.rotation.z = 0.06; base.add(stump);
  const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.036, 0.52, 18), bark);
  branch.rotation.z = Math.PI / 2 + 0.05; branch.position.set(0.0, 0.205, 0.0); base.add(branch);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.085), paper);
  label.position.set(-0.05, 0.03, 0.229); label.rotation.x = -0.12; base.add(label);
  root.add(base);

  // ---------- Peca_Armacao: arame (coluna até à cabeça + pernas)
  const arm = new THREE.Group(); arm.name = "Peca_Armacao";
  const spine = new THREE.CatmullRomCurve3([V(0, 0.05, -0.02), V(0.01, 0.2, -0.01), V(0, 0.38, 0.0), V(0, 0.55, 0.01), V(0, 0.69, 0.02)]);
  arm.add(new THREE.Mesh(new THREE.TubeGeometry(spine, 40, 0.0045, 6), brassWire));
  for (const s of [-1, 1]) {
    const leg = new THREE.CatmullRomCurve3([V(0.045 * s, 0.205, 0.02), V(0.05 * s, 0.27, 0.0), V(0.02 * s, 0.34, -0.01)]);
    arm.add(new THREE.Mesh(new THREE.TubeGeometry(leg, 16, 0.0035, 6), brassWire));
  }
  root.add(arm);

  // ---------- Peca_Corpo: corpo esculpido (ligeiramente mais pequeno do que a pele)
  const body = new THREE.Group(); body.name = "Peca_Corpo";
  body.add(new THREE.Mesh(latheBody(0.93), clay));
  const headCore = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 24), clay);
  headCore.scale.set(1, 0.92, 0.86); headCore.position.set(0, 0.665, 0.0); body.add(headCore);
  root.add(body);

  // ---------- Peca_Pele: penas, cabeça, disco facial, bico, asas, cauda, garras
  const skin = new THREE.Group(); skin.name = "Peca_Pele";
  const torso = new THREE.Mesh(latheBody(1), featherPale); skin.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.112, 40, 30), featherGold);
  head.scale.set(1, 0.92, 0.88); head.position.set(0, 0.67, 0.0); skin.add(head);
  const discGeo = new THREE.ExtrudeGeometry(heartShape(), { depth: 0.012, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 3, curveSegments: 32 });
  const disc = new THREE.Mesh(discGeo, face); disc.position.set(0, 0.665, 0.088); disc.rotation.x = -0.08; skin.add(disc);
  const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(heartShape(), { depth: 0.006, bevelEnabled: false, curveSegments: 32 }), faceRim);
  rim.scale.setScalar(1.08); rim.position.set(0, 0.665, 0.084); rim.rotation.x = -0.08; skin.add(rim);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.04, 12), keratin);
  beak.position.set(0, 0.645, 0.112); beak.rotation.x = Math.PI - 0.55; skin.add(beak);
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), featherGold);
    wing.scale.set(0.05, 0.2, 0.125); wing.position.set(0.128 * s, 0.4, -0.025); wing.rotation.set(0.12, 0.18 * s, -0.08 * s); skin.add(wing);
    // garras: três dedos sobre o ramo
    for (let k = 0; k < 3; k++) {
      const toe = new THREE.Mesh(new THREE.ConeGeometry(0.007, 0.045, 8), claw);
      toe.position.set(0.045 * s + (k - 1) * 0.016, 0.228, 0.03);
      toe.rotation.set(Math.PI / 2 + 0.5, 0, (k - 1) * 0.35); skin.add(toe);
    }
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.05, 10), featherPale);
    leg.position.set(0.045 * s, 0.245, 0.015); skin.add(leg);
  }
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.02), featherGold);
  tail.position.set(0, 0.23, -0.11); tail.rotation.x = 0.35; skin.add(tail);
  root.add(skin);

  // ---------- Peca_Olho_E / Peca_Olho_D: olhos de vidro
  for (const [n, s] of [["Peca_Olho_E", 1], ["Peca_Olho_D", -1]]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0155, 24, 16), glass);
    eye.name = n; eye.position.set(0.036 * s, 0.684, 0.104); root.add(eye);
  }

  // ---------- pontos das notas (por ordem do gallery-data.js: disco facial, voo, garras, etiqueta)
  [V(0, 0.69, 0.12), V(0.17, 0.42, 0.0), V(0.03, 0.225, 0.05), V(-0.05, 0.03, 0.235)].forEach((p, i) => {
    const o = new THREE.Object3D(); o.name = `Nota_${i + 1}`; o.position.copy(p); root.add(o);
  });

  root.traverse((o) => { if (o.isMesh) { o.castShadow = !mobile; o.receiveShadow = !mobile; } });
  return root;
}

/* Carrega um .glb (Draco ou Meshopt) e troca as camadas provisórias pelas do modelo. */
export async function loadModel(root, url, renderer) {
  const [{ GLTFLoader }, { DRACOLoader }, { MeshoptDecoder }] = await Promise.all([
    import("three/addons/loaders/GLTFLoader.js"),
    import("three/addons/loaders/DRACOLoader.js"),
    import("three/addons/libs/meshopt_decoder.module.js"),
  ]);
  const draco = new DRACOLoader().setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/");
  const loader = new GLTFLoader().setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  const names = ["Peca_Base", "Peca_Armacao", "Peca_Corpo", "Peca_Olho_E", "Peca_Olho_D", "Peca_Pele", "Nota_1", "Nota_2", "Nota_3", "Nota_4"];
  for (const n of names) {
    const fresh = gltf.scene.getObjectByName(n);
    const old = root.getObjectByName(n);
    if (!fresh) continue;
    if (old) root.remove(old);
    root.add(fresh);
  }
  root.traverse((o) => { if (o.isMesh && o.material && o.material.map) renderer.initTexture(o.material.map); });
  draco.dispose();
  return root;
}
