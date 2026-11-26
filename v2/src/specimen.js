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
  // perfil (raio, altura) de um corpo de coruja-das-torres, de baixo para cima, alisado por uma curva
  const prof = [[0.0, 0.2], [0.05, 0.205], [0.1, 0.228], [0.132, 0.278], [0.146, 0.34], [0.147, 0.4], [0.138, 0.46], [0.122, 0.51], [0.105, 0.55], [0.085, 0.58], [0.0, 0.6]];
  const ctrl = prof.map(([r, y]) => new THREE.Vector2(r * scale, 0.2 + (y - 0.2) * scale));
  const g = new THREE.LatheGeometry(new THREE.SplineCurve(ctrl).getPoints(40), 64);
  g.scale(1, 1, 0.86);
  g.computeVertexNormals();
  return g;
}

/* asa dobrada: elipsoide que afina para baixo, como a ponta das penas de voo */
function wingGeometry() {
  const g = new THREE.SphereGeometry(1, 32, 24);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), k = y < 0 ? 1 + y * 0.75 : 1 - y * y * 0.15;
    p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k);
  }
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
  const LIFT = 0.05; // a ave fica acima do ramo, com as patas e as garras à vista

  // ---------- materiais
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture(), color: 0xffffff, roughness: 0.55, metalness: 0 });
  const bark = new THREE.MeshStandardMaterial({ map: barkTexture(), roughness: 0.95 });
  // dorso e asas dourados com salpicos cinzentos; peito claro com pintas finas (coruja-das-torres)
  const featherGold = new THREE.MeshStandardMaterial({ map: featherTexture({ base: "#c9a066", edge: "#a47a47", light: "#e2c28d", fleck: "#6f6c68", rows: 22, seed: 3, repeat: [2, 2] }), roughness: 0.82 });
  const featherPale = new THREE.MeshStandardMaterial({ map: featherTexture({ base: "#eee4d0", edge: "#dccdb1", light: "#faf5ea", fleck: "#6e655b", rows: 26, seed: 9, repeat: [3, 3] }), roughness: 0.88 });
  const face = new THREE.MeshStandardMaterial({ color: 0xece1cc, roughness: 0.9 });
  const ridge = new THREE.MeshStandardMaterial({ color: 0xdccbb0, roughness: 0.85 });
  const faceRim = new THREE.MeshStandardMaterial({ color: 0xa87a46, roughness: 0.85 });
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
  const spine = new THREE.CatmullRomCurve3([V(0, 0.05, -0.02), V(0.01, 0.2, -0.01), V(0, 0.43, 0.0), V(0, 0.6, 0.01), V(0, 0.74, 0.02)]);
  arm.add(new THREE.Mesh(new THREE.TubeGeometry(spine, 40, 0.0045, 6), brassWire));
  for (const s of [-1, 1]) {
    const leg = new THREE.CatmullRomCurve3([V(0.045 * s, 0.205, 0.02), V(0.05 * s, 0.3, 0.0), V(0.02 * s, 0.39, -0.01)]);
    arm.add(new THREE.Mesh(new THREE.TubeGeometry(leg, 16, 0.0035, 6), brassWire));
  }
  root.add(arm);

  // ---------- Peca_Corpo: corpo esculpido (ligeiramente mais pequeno do que a pele)
  const body = new THREE.Group(); body.name = "Peca_Corpo";
  const core = new THREE.Mesh(latheBody(0.93), clay); core.position.y = LIFT; body.add(core);
  const headCore = new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 24), clay);
  headCore.scale.set(1.04, 0.88, 0.82); headCore.position.set(0, 0.665 + LIFT, -0.005); body.add(headCore);
  root.add(body);

  // ---------- Peca_Pele: penas, cabeça, disco facial, bico, asas, cauda, patas e garras
  const skin = new THREE.Group(); skin.name = "Peca_Pele";
  const torso = new THREE.Mesh(latheBody(1), featherPale); torso.position.y = LIFT; skin.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.122, 48, 36), featherGold);
  head.scale.set(1.06, 0.88, 0.84); head.position.set(0, 0.665 + LIFT, -0.005); skin.add(head);
  // disco facial: coração com rebordo arredondado e curvo, a envolver a cabeça
  const bend = (geo, k) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) - k * p.getX(i) * p.getX(i) - k * 0.35 * Math.max(0, p.getY(i)) ** 2);
    geo.computeVertexNormals(); return geo;
  };
  const discGeo = bend(new THREE.ExtrudeGeometry(heartShape(), { depth: 0.01, bevelEnabled: true, bevelThickness: 0.011, bevelSize: 0.01, bevelSegments: 6, curveSegments: 48 }), 2.6);
  const disc = new THREE.Mesh(discGeo, face); disc.scale.setScalar(1.04); disc.position.set(0, 0.665 + LIFT, 0.084); disc.rotation.x = -0.08; skin.add(disc);
  const rimGeo = bend(new THREE.ExtrudeGeometry(heartShape(), { depth: 0.006, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 3, curveSegments: 48 }), 2.6);
  const rim = new THREE.Mesh(rimGeo, faceRim); rim.scale.setScalar(1.11); rim.position.set(0, 0.665 + LIFT, 0.08); rim.rotation.x = -0.08; skin.add(rim);
  // crista ao meio do disco facial, dos olhos até ao bico
  const crest = new THREE.Mesh(new THREE.CapsuleGeometry(0.0065, 0.045, 6, 12), ridge);
  crest.position.set(0, 0.676 + LIFT, 0.107); crest.rotation.x = -0.08; skin.add(crest);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.04, 12), keratin);
  beak.position.set(0, 0.645 + LIFT, 0.112); beak.rotation.x = Math.PI - 0.55; skin.add(beak);
  const wingGeo = wingGeometry();
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(wingGeo, featherGold);
    wing.scale.set(0.042, 0.21, 0.125); wing.position.set(0.118 * s, 0.37 + LIFT, -0.035); wing.rotation.set(0.2, 0.3 * s, -0.05 * s); skin.add(wing);
    // pata emplumada, do corpo até ao ramo
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.017, 0.075, 12), featherPale);
    leg.position.set(0.045 * s, 0.258, 0.018); skin.add(leg);
    // garras: três dedos à frente do ramo e um atrás
    for (let k = 0; k < 4; k++) {
      const back = k === 3;
      const toe = new THREE.Mesh(new THREE.ConeGeometry(0.0065, 0.048, 8), claw);
      toe.position.set(0.045 * s + (back ? 0 : (k - 1) * 0.016), 0.226, back ? -0.012 : 0.034);
      toe.rotation.set(back ? -(Math.PI / 2 + 0.6) : Math.PI / 2 + 0.55, 0, back ? 0 : (k - 1) * 0.35); skin.add(toe);
    }
  }
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.02), featherGold);
  tail.position.set(0, 0.23 + LIFT, -0.11); tail.rotation.x = 0.35; skin.add(tail);
  root.add(skin);

  // ---------- Peca_Olho_E / Peca_Olho_D: olhos de vidro
  for (const [n, s] of [["Peca_Olho_E", 1], ["Peca_Olho_D", -1]]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0155, 24, 16), glass);
    eye.name = n; eye.position.set(0.036 * s, 0.684 + LIFT, 0.104); root.add(eye);
  }

  // ---------- pontos das notas (por ordem do gallery-data.js: disco facial, voo, garras, etiqueta)
  [V(0, 0.69 + LIFT, 0.12), V(0.162, 0.42 + LIFT, -0.02), V(0.045, 0.228, 0.055), V(-0.05, 0.03, 0.235)].forEach((p, i) => {
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
