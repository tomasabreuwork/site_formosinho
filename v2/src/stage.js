/* =========================================================================
   PALCO 3D — sala de museu à noite, vitrine-diorama e a peça.
   O fundo do diorama é o vídeo do habitat (o mesmo da versão 1).
   ========================================================================= */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { buildPlaceholder, loadModel, MODEL_URL } from "./specimen.js";
import { woodTexture, glowTexture, ringTexture } from "./textures.js";
import { OPEN, ORBIT, seg, smooth, easeIO, lerp, clamp } from "./choreo.js";

const DEG = Math.PI / 180;
/* vitrine larga e baixa, como os dioramas de museu: o fundo fica quase em 16:9,
   por isso o vídeo em ecrã inteiro e o fundo do diorama coincidem */
const CASE = { w: 1.7, h: 1.05, d: 0.85 };
const PANEL_Y = CASE.h / 2, PANEL_Z = -CASE.d / 2 + 0.004;
const CENTER = new THREE.Vector3(0, 0.42, 0);      // centro da peça
const WIDE_LOOK = new THREE.Vector3(0, 0.34, 0);   // para onde olha o plano geral
const WIDE_DIR = new THREE.Vector3(0, 0.2, 1).normalize();
const WIDE_EL = Math.asin(WIDE_DIR.y);
const SPOT_MAX = 19, HEMI_MAX = 0.22, RIM_MAX = 1.7, FILL_MAX = 0.35, ENV_MIN = 0.05, ENV_MAX = 0.42;

/* Acender de lâmpada antiga: sobe com cintilações (ligada ao scroll, por isso repete-se ao voltar atrás). */
function ignite(u) {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  const n = Math.sin(Math.floor(u * 18) * 91.7) * 43758.5453;
  const r = n - Math.floor(n);
  return smooth(u) * (u < 0.55 ? (r > 0.42 ? 1 : 0.22) : 1);
}

/* 12 arestas de latão numa só geometria (uma só chamada de desenho). */
function frameGeometry(w, h, d, t) {
  const parts = [];
  const box = (sx, sy, sz, x, y, z) => { const g = new THREE.BoxGeometry(sx, sy, sz); g.translate(x, y, z); parts.push(g); };
  for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) box(t, h, t, x, h / 2, z);
  for (const y of [t / 2, h - t / 2]) {
    for (const z of [-d / 2, d / 2]) box(w + t, t, t, 0, y, z);
    for (const x of [-w / 2, w / 2]) box(t, t, d + t, x, y, 0);
  }
  return mergeGeometries(parts);
}

function plinth(wood, dark, brass) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.38, 1.0), wood); body.position.y = -0.23;
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.04, 1.06), dark); top.position.y = -0.02;
  const foot = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.05, 1.08), dark); foot.position.y = -0.415;
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.006), brass); plate.position.set(0, -0.22, 0.503);
  g.add(body, top, foot, plate);
  return g;
}

export async function createStage({ canvas, video, mobile, piece }) {
  // ------------------------------------------------------------ renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0a08);
  scene.fog = new THREE.Fog(0x0b0a08, 7, 16);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  // ------------------------------------------------------------ materiais da sala
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.5 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x1c120a, roughness: 0.45 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.88, roughness: 0.3 });
  const baize = new THREE.MeshStandardMaterial({ color: 0x1d2c25, roughness: 0.95 }); // verde de museu (v1)
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  glass.userData.envBase = 2.2;

  // ------------------------------------------------------------ vitrine principal
  const vitrine = new THREE.Group(); vitrine.name = "Vitrine";
  const base = plinth(wood, darkWood, brass); base.name = "Vitrine_Base";
  const floorIn = new THREE.Mesh(new THREE.PlaneGeometry(CASE.w, CASE.d), baize);
  floorIn.rotation.x = -Math.PI / 2; floorIn.position.y = 0.001; floorIn.receiveShadow = true;
  base.add(floorIn);
  base.traverse((o) => { if (o.isMesh) o.receiveShadow = true; });
  vitrine.add(base);

  // cúpula de vidro + caixilho de latão + fundo do diorama (sobem juntos na cena II)
  const hood = new THREE.Group(); hood.name = "Vitrine_Vidro";
  const frameGeo = frameGeometry(CASE.w, CASE.h, CASE.d, 0.016);
  hood.add(new THREE.Mesh(frameGeo, brass));
  const panes = [
    [CASE.w, CASE.h, [0, CASE.h / 2, CASE.d / 2], [0, 0, 0]],
    [CASE.d, CASE.h, [-CASE.w / 2, CASE.h / 2, 0], [0, Math.PI / 2, 0]],
    [CASE.d, CASE.h, [CASE.w / 2, CASE.h / 2, 0], [0, Math.PI / 2, 0]],
    [CASE.w, CASE.d, [0, CASE.h, 0], [Math.PI / 2, 0, 0]],
  ];
  for (const [w, h, p, r] of panes) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glass);
    m.position.set(...p); m.rotation.set(...r); m.renderOrder = 2; hood.add(m);
  }

  // fundo do diorama: o vídeo do habitat, com "revelação" de cor controlada pelo scroll
  const vtex = new THREE.VideoTexture(video);
  vtex.colorSpace = THREE.SRGBColorSpace;
  vtex.minFilter = THREE.LinearFilter; vtex.magFilter = THREE.LinearFilter; vtex.generateMipmaps = false;
  const grade = { uSat: { value: 1 }, uSepia: { value: 0 }, uBright: { value: 1 }, uVig: { value: 0 }, uReady: { value: 0 }, uRep: { value: new THREE.Vector2(1, 1) } };
  const panelMat = new THREE.MeshBasicMaterial({ map: vtex, toneMapped: false, fog: false });
  panelMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, grade);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uSat; uniform float uSepia; uniform float uBright; uniform float uVig; uniform float uReady; uniform vec2 uRep;")
      .replace("#include <map_fragment>", `#include <map_fragment>
        float lum = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
        vec3 graded = mix(vec3(lum), diffuseColor.rgb, uSat);
        graded = mix(graded, vec3(lum) * vec3(1.16, 0.97, 0.72), uSepia);
        vec2 q = (vMapUv - 0.5) / uRep;
        float vig = smoothstep(0.78, 0.18, length(q * vec2(1.0, 1.25)));
        graded *= uReady * uBright * mix(1.0, 0.35 + 0.65 * vig, uVig);
        diffuseColor.rgb = graded;`);
  };
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(CASE.w, CASE.h), panelMat);
  panel.name = "Vitrine_Diorama"; panel.position.set(0, PANEL_Y, PANEL_Z);
  hood.add(panel);
  vitrine.add(hood);
  scene.add(vitrine);

  // recorte "cover" da imagem no fundo (proporção do vídeo ≠ proporção do fundo)
  const fit = (t, va) => {
    const pa = CASE.w / CASE.h;
    const rx = va > pa ? pa / va : 1, ry = va > pa ? 1 : va / pa;
    t.repeat.set(rx, ry); t.offset.set((1 - rx) / 2, (1 - ry) / 2);
    if (panelMat.map === t) grade.uRep.value.set(rx, ry);
  };
  const fitVideo = () => fit(vtex, (video.videoWidth || 16) / (video.videoHeight || 9));
  fitVideo();
  video.addEventListener("loadedmetadata", fitVideo);

  // o fundo acende quando o vídeo tem imagem; se não arrancar (ex.: poupança de energia
  // no telemóvel), usa um fotograma do mesmo vídeo e troca para o vídeo quando ele arrancar
  const hasFrames = () => video.readyState >= 2 && !video.error;
  let ready = 0;
  setTimeout(() => {
    if (hasFrames()) return;
    new THREE.TextureLoader().load("../videos/hero-poster.jpg", (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      if (!hasFrames()) { panelMat.map = t; fit(t, t.image.width / t.image.height); }
    });
  }, 2500);

  // outras vitrines na penumbra: a sala continua para lá da luz
  for (const s of [-1, 1]) {
    const g = new THREE.Group();
    g.add(plinth(wood, darkWood, brass));
    g.add(new THREE.Mesh(frameGeo, brass));
    g.position.set(3.3 * s, 0, -1.9); g.rotation.y = -0.42 * s;
    scene.add(g);
  }

  // chão, parede verde ao fundo e poça de luz
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x17130f, roughness: 0.92 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.44; floor.receiveShadow = true;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 12), new THREE.MeshStandardMaterial({ color: 0x1d2c25, roughness: 1 }));
  wall.position.set(0, 5, -3.4);
  const glowMat = new THREE.MeshBasicMaterial({ map: glowTexture(), color: 0xffd8a8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.0), glowMat);
  glow.rotation.x = -Math.PI / 2; glow.position.set(0.15, -0.436, 0.45);
  scene.add(floor, wall, glow);

  // ------------------------------------------------------------ a peça
  const specimen = buildPlaceholder({ name: piece.name, sci: piece.sci, mobile });
  scene.add(specimen);
  const pieceMats = [];
  const collectPieceMats = () => {
    pieceMats.length = 0;
    specimen.traverse((o) => {
      if (!o.isMesh) return;
      for (const m of [].concat(o.material)) { m.transparent = true; pieceMats.push(m); }
      o.castShadow = !mobile; o.receiveShadow = !mobile;
    });
  };
  collectPieceMats();
  const anchors = [1, 2, 3, 4].map((i) => specimen.getObjectByName(`Nota_${i}`));
  if (MODEL_URL) loadModel(specimen, MODEL_URL, renderer).then(() => { collectPieceMats(); anchors.splice(0, 4, ...[1, 2, 3, 4].map((i) => specimen.getObjectByName(`Nota_${i}`))); applyEnv(true); }).catch(() => {});

  // ------------------------------------------------------------ luzes
  const hemi = new THREE.HemisphereLight(0xfff1dc, 0x1a140e, 0);
  const spot = new THREE.SpotLight(0xffd39a, 0, 7, 0.42, 0.75, 1.2);
  spot.position.set(0.55, 2.75, 1.3); spot.target.position.copy(CENTER);
  spot.castShadow = !mobile;
  spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0004; spot.shadow.normalBias = 0.02;
  spot.shadow.camera.near = 0.8; spot.shadow.camera.far = 6;
  const rim = new THREE.PointLight(0x9fc0ad, 0, 4, 1.6); rim.position.set(-0.75, 1.0, -0.5);
  const fill = new THREE.DirectionalLight(0xffe2bd, 0); fill.position.set(-1.5, 1.2, 2.2);
  scene.add(hemi, spot, spot.target, rim, fill);

  // reflexos: o ambiente é aplicado a cada material, com intensidade ligada à luz
  const envMats = [];
  const applyEnv = (reset) => {
    if (reset) envMats.length = 0;
    scene.traverse((o) => {
      if (!o.isMesh) return;
      for (const m of [].concat(o.material)) {
        if ((m.isMeshStandardMaterial) && !envMats.includes(m)) { m.envMap = envTex; envMats.push(m); }
      }
    });
  };
  applyEnv();

  // ------------------------------------------------------------ pó no feixe de luz
  const N = mobile ? 260 : 560;
  const dpos = new Float32Array(N * 3), dseed = new Float32Array(N);
  for (let k = 0; k < N;) {
    const x = -1.2 + Math.random() * 2.6, y = -0.3 + Math.random() * 3.0, z = -0.7 + Math.random() * 2.6;
    if (Math.abs(x) < CASE.w / 2 + 0.02 && y < CASE.h + 0.02 && Math.abs(z) < CASE.d / 2 + 0.02) continue; // não dentro da vitrine
    dpos.set([x, y, z], k * 3); dseed[k] = Math.random(); k++;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
  dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(dseed, 1));
  const spotDir = new THREE.Vector3().subVectors(spot.target.position, spot.position).normalize();
  const dustMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uOpacity: { value: 0 }, uSize: { value: 6.5 }, uPR: { value: renderer.getPixelRatio() },
      uSpotPos: { value: spot.position }, uSpotDir: { value: spotDir }, uCos: { value: Math.cos(0.42) },
    },
    vertexShader: /* glsl */`
      uniform float uTime, uSize, uPR, uCos; uniform vec3 uSpotPos, uSpotDir;
      attribute float aSeed; varying float vA;
      void main() {
        vec3 p = position;
        float sp = 0.01 + fract(aSeed * 7.13) * 0.018;
        p.y = -0.3 + mod(p.y + 0.3 + uTime * sp, 3.0);
        p.x += sin(uTime * 0.21 + aSeed * 31.0) * 0.05;
        p.z += cos(uTime * 0.17 + aSeed * 17.0) * 0.05;
        float c = dot(normalize(p - uSpotPos), uSpotDir);
        vA = smoothstep(uCos, uCos + 0.06, c) * (0.35 + 0.65 * fract(aSeed * 13.7)) * (0.6 + 0.4 * sin(uTime * (0.7 + aSeed) + aSeed * 40.0));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * uPR * (0.5 + fract(aSeed * 3.7)) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform float uOpacity; varying float vA;
      void main() {
        float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)) * vA * uOpacity;
        gl_FragColor = vec4(1.0, 0.87, 0.68, a);
      }`,
  });
  const dust = new THREE.Points(dustGeo, dustMat); dust.frustumCulled = false;
  scene.add(dust);

  // ------------------------------------------------------------ anel de latão nos pontos anotados
  const ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTexture(), depthTest: false, transparent: true, opacity: 0 }));
  ring.renderOrder = 10; ring.scale.setScalar(0.04);
  scene.add(ring);

  // ------------------------------------------------------------ câmara e enquadramento
  const camera = new THREE.PerspectiveCamera(34, 1, 0.02, 40);
  const L = { W: 1, H: 1, dCover: 1, dWide: 3, shiftX: 0, shiftY: 0, rMul: 1 };
  const stopKeys = [];
  const aimTmp = new THREE.Vector3();
  function layout() {
    L.W = canvas.clientWidth || window.innerWidth; L.H = canvas.clientHeight || window.innerHeight;
    renderer.setSize(L.W, L.H, false);
    const narrow = L.W <= 820, portrait = L.H > L.W;
    camera.fov = portrait ? 42 : 34; camera.aspect = L.W / L.H;
    const tan = Math.tan((camera.fov * DEG) / 2);
    // distância a que o vídeo ocupa o ecrã inteiro (com uma pequena margem)
    L.dCover = (Math.min(CASE.h, CASE.w / camera.aspect) / (2 * tan)) * 0.965;
    // onde fica a peça no ecrã: à direita do cartão (computador) ou na metade de cima (telemóvel)
    const fracW = narrow ? 0.92 : 0.56, fracH = narrow ? 0.5 : 0.8;
    L.shiftX = narrow ? 0 : 0.19; L.shiftY = narrow ? 0.17 : 0;
    L.dWide = Math.max(1.62 / (2 * tan * fracH), 2.0 / (2 * tan * camera.aspect * fracW));
    L.rMul = narrow ? 1.2 : 1;
    camera.updateProjectionMatrix();
    stopKeys.length = 0;
    ORBIT.stops.forEach((s, i) => {
      const a = anchors[i] ? anchors[i].getWorldPosition(aimTmp.clone()) : CENTER.clone();
      stopKeys.push({ az: s.az * DEG, el: s.el * DEG, r: s.r * L.rMul, t: CENTER.clone().lerp(a, s.aim) });
    });
  }
  layout();

  const pos = new THREE.Vector3(), look = new THREE.Vector3(), tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  const startPos = new THREE.Vector3(), startLook = new THREE.Vector3(0, PANEL_Y, PANEL_Z), endPos = new THREE.Vector3();
  const sph = (t, az, el, r, out) => out.set(t.x + r * Math.cos(el) * Math.sin(az), t.y + r * Math.sin(el), t.z + r * Math.cos(el) * Math.cos(az));

  // I · Abertura: do vídeo em ecrã inteiro ao plano geral da vitrine
  function shotOpen(p) {
    const t = easeIO(seg(p, OPEN.dolly));
    startPos.set(0, PANEL_Y, PANEL_Z + L.dCover);
    endPos.copy(WIDE_DIR).multiplyScalar(L.dWide).add(WIDE_LOOK);
    pos.lerpVectors(startPos, endPos, t);
    pos.x += Math.sin(t * Math.PI) * 0.32; // leve movimento de grua
    pos.y += Math.sin(t * Math.PI) * 0.12;
    look.lerpVectors(startLook, WIDE_LOOK, t);
    return easeIO(seg(p, OPEN.frame));
  }

  // II · Em volta: órbita com paragens nos pontos anotados
  const wideKey = { az: 0, el: WIDE_EL, r: 0, t: WIDE_LOOK };
  const DRIFT = 5 * DEG; // a câmara nunca pára de todo durante a leitura
  function shotOrbit(p) {
    wideKey.r = L.dWide;
    let prev = wideKey, k = { az: 0, el: 0, r: 0 }, at = -1, dwell = 0;
    const last = ORBIT.stops.length - 1;
    for (let i = 0; i <= last; i++) {
      const s = ORBIT.stops[i], key = stopKeys[i];
      if (p < s.travel[0]) { k = { ...prev }; tmpA.copy(prev.t); break; }
      if (p < s.travel[1]) {
        const e = easeIO(seg(p, s.travel));
        k.az = lerp(prev.az, key.az, e); k.el = lerp(prev.el, key.el, e);
        k.r = i === 0 ? prev.r * Math.pow(key.r / prev.r, e) : lerp(prev.r, key.r, e) + Math.sin(e * Math.PI) * (s.bump ?? 0.32);
        tmpA.lerpVectors(prev.t, key.t, e);
        break;
      }
      if (p <= s.dwell[1] || i === last) {
        const d = seg(p, s.dwell);
        k.az = key.az + d * DRIFT; k.el = key.el; k.r = key.r; tmpA.copy(key.t);
        at = i; dwell = smooth(clamp(d * 7)) * (i === last ? 1 : smooth(clamp((1 - d) * 7)));
        break;
      }
      prev = { az: key.az + DRIFT, el: key.el, r: key.r, t: key.t };
    }
    look.copy(tmpA);
    sph(look, k.az, k.el, k.r, pos);
    return { at, dwell };
  }

  // ------------------------------------------------------------ estado por fotograma
  let active = true, playing = false;
  const wantsVideo = (b) => {
    if (b && video.paused && !playing && video.readyState >= 1) {
      playing = true;
      video.play().catch(() => {}).finally(() => { playing = false; });
    } else if (!b && !video.paused) video.pause();
  };

  function update({ p0, p1 }, time) {
    const orbit = p1 > 0;

    // luz
    const lit = orbit ? 1 : ignite(seg(p0, OPEN.light));
    spot.intensity = lit * SPOT_MAX; hemi.intensity = lit * HEMI_MAX; rim.intensity = lit * RIM_MAX; fill.intensity = lit * FILL_MAX;
    const env = ENV_MIN + lit * (ENV_MAX - ENV_MIN);
    for (const m of envMats) m.envMapIntensity = env * (m.userData.envBase ?? 1);
    dustMat.uniforms.uOpacity.value = lit; dustMat.uniforms.uTime.value = time;
    glowMat.opacity = lit * 0.32;

    // cúpula: sobe na cena II
    const h = orbit ? easeIO(seg(p1, ORBIT.hood)) : 0;
    hood.position.y = h * 1.7; hood.visible = h < 0.999;
    glass.opacity = 0.11 * seg(p0, OPEN.glass) * (1 - h);

    // habitat → diorama
    const g = orbit ? 1 : seg(p0, OPEN.grade);
    if (panelMat.map !== vtex && hasFrames()) { panelMat.map = vtex; fitVideo(); }
    ready += ((panelMat.map === vtex ? (hasFrames() ? 1 : 0) : 1) - ready) * 0.05;
    grade.uReady.value = ready;
    grade.uSat.value = 1 - 0.7 * g; grade.uSepia.value = 0.8 * g; grade.uBright.value = 1 - 0.36 * g; grade.uVig.value = g;

    // a peça surge
    const f = orbit ? 1 : smooth(seg(p0, OPEN.appear));
    specimen.visible = f > 0.001;
    for (const m of pieceMats) m.opacity = f;

    // câmara
    let k, mark = { at: -1, dwell: 0 };
    if (orbit) { k = 1; mark = shotOrbit(p1); } else k = shotOpen(p0);
    camera.position.copy(pos); camera.lookAt(look);
    camera.setViewOffset(L.W, L.H, -L.shiftX * L.W * k, L.shiftY * L.H * k, L.W, L.H);

    // anel no ponto anotado
    if (mark.at >= 0 && anchors[mark.at]) {
      anchors[mark.at].getWorldPosition(ring.position);
      ring.material.opacity = mark.dwell * (0.75 + 0.25 * Math.sin(time * 3));
      ring.scale.setScalar(0.03 + 0.012 * mark.dwell);
    } else ring.material.opacity = 0;

    wantsVideo(active && hood.visible && !document.hidden);
    if (active) renderer.render(scene, camera);
    return mark;
  }

  const projV = new THREE.Vector3();
  function project(i) {
    const a = anchors[i];
    if (!a) return null;
    a.getWorldPosition(projV).project(camera);
    return { x: ((projV.x + 1) / 2) * L.W, y: ((1 - projV.y) / 2) * L.H, ok: projV.z < 1 && Math.abs(projV.x) < 1.05 && Math.abs(projV.y) < 1.05 };
  }

  function setActive(b) { active = b; if (!b) wantsVideo(false); }

  // diagnóstico (?debug): o que foi desenhado e a cor do píxel central
  function probe() {
    renderer.render(scene, camera);
    const gl = renderer.getContext(), px = new Uint8Array(4);
    gl.readPixels(gl.drawingBufferWidth >> 1, gl.drawingBufferHeight >> 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return { calls: renderer.info.render.calls, tris: renderer.info.render.triangles, w: gl.drawingBufferWidth, h: gl.drawingBufferHeight, px: Array.from(px), video: video.readyState, map: panelMat.map === vtex ? "video" : "poster", cam: camera.position.toArray().map((v) => +v.toFixed(2)) };
  }

  // compila os shaders antes de mostrar (evita um engasgo no primeiro scroll)
  renderer.compile(scene, camera);

  return { update, project, layout, setActive, probe, renderer };
}
