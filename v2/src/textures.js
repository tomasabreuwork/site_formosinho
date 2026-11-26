/* Texturas desenhadas em código (canvas): penas, madeira, casca, etiqueta, brilho do chão.
   Não há imagens a carregar — leves e nítidas em qualquer ecrã. */
import * as THREE from "three";

const canvas = (w, h = w) => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")];
};
const tex = (c, { repeat = [1, 1], srgb = true } = {}) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 4;
  return t;
};
// gerador pseudoaleatório com semente: as texturas saem sempre iguais
const rng = (seed = 7) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

/* Penas em escama: filas de meias-luas desencontradas, com ráquis e salpicos. */
export function featherTexture({ base = "#c9a066", edge = "#8a6436", fleck = "#5d5a55", light = "#e9d7b4", size = 512, rows = 14, seed = 3, repeat = [2, 2] } = {}) {
  const [c, g] = canvas(size);
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  const step = size / rows, rad = step * 0.78;
  for (let row = rows + 1; row >= -1; row--) {
    for (let col = -1; col <= rows + 1; col++) {
      const x = col * step + (row % 2 ? step / 2 : 0) + (r() - 0.5) * step * 0.18;
      const y = row * step * 0.82;
      const grd = g.createRadialGradient(x, y - rad * 0.2, rad * 0.1, x, y, rad);
      grd.addColorStop(0, light); grd.addColorStop(0.55, base); grd.addColorStop(1, edge);
      g.fillStyle = grd;
      g.beginPath(); g.arc(x, y, rad, 0, Math.PI); g.closePath(); g.fill();
      g.strokeStyle = "rgba(40,28,14,.35)"; g.lineWidth = 1.2;
      g.beginPath(); g.arc(x, y, rad, 0.08, Math.PI - 0.08); g.stroke();
      g.strokeStyle = "rgba(255,245,225,.18)"; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + rad * 0.92); g.stroke();
      if (r() < 0.55) { g.fillStyle = fleck; g.beginPath(); g.arc(x + (r() - 0.5) * rad * 0.6, y + rad * (0.45 + r() * 0.3), 1.2 + r() * 1.8, 0, Math.PI * 2); g.fill(); }
    }
  }
  return tex(c, { repeat });
}

/* Madeira de nogueira: veios ondulados. */
export function woodTexture({ base = "#3b2515", dark = "#24150b", light = "#5a3a22", size = 512, seed = 11 } = {}) {
  const [c, g] = canvas(size);
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 90; i++) {
    const y0 = r() * size, amp = 3 + r() * 9, f = 0.004 + r() * 0.01, ph = r() * 6.28;
    g.strokeStyle = r() < 0.5 ? dark : light; g.globalAlpha = 0.18 + r() * 0.3; g.lineWidth = 0.6 + r() * 2.2;
    g.beginPath();
    for (let x = 0; x <= size; x += 8) { const y = y0 + Math.sin(x * f + ph) * amp; x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  g.globalAlpha = 1;
  return tex(c, { repeat: [1, 1] });
}

/* Casca de ramo: estrias verticais irregulares. */
export function barkTexture({ size = 256, seed = 5 } = {}) {
  const [c, g] = canvas(size);
  const r = rng(seed);
  g.fillStyle = "#4a3624"; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 160; i++) {
    const x = r() * size, w = 1 + r() * 4, h = 20 + r() * 90, y = r() * size;
    g.fillStyle = r() < 0.5 ? "rgba(25,16,8,.55)" : "rgba(120,96,70,.35)";
    g.fillRect(x, y, w, h);
  }
  return tex(c, { repeat: [1, 3] });
}

/* Etiqueta de coleção em papel, escrita à mão. O número fica em branco:
   cada peça real recebe o seu número de registo. */
export function labelTexture({ name = "", sci = "" } = {}) {
  const [c, g] = canvas(512, 256);
  g.fillStyle = "#ece4d0"; g.fillRect(0, 0, 512, 256);
  g.strokeStyle = "#9a2e1f"; g.lineWidth = 3; g.strokeRect(14, 14, 484, 228);
  g.lineWidth = 1; g.strokeRect(22, 22, 468, 212);
  g.fillStyle = "#9a2e1f"; g.font = "500 22px 'IBM Plex Mono', monospace"; g.fillText("FORMOSINHO · COLEÇÃO", 44, 66);
  g.fillStyle = "#1b1914"; g.font = "italic 54px 'Cormorant Garamond', serif"; g.fillText(sci, 44, 140);
  g.font = "30px 'Cormorant Garamond', serif"; g.fillStyle = "#474238"; g.fillText(name, 44, 186);
  g.font = "20px 'IBM Plex Mono', monospace"; g.fillText("Nº", 330, 212);
  g.strokeStyle = "#474238"; g.beginPath(); g.moveTo(368, 214); g.lineTo(468, 214); g.stroke();
  const t = tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}

/* Poça de luz no chão (gradiente radial). */
export function glowTexture() {
  const [c, g] = canvas(256);
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,214,160,1)"); grd.addColorStop(0.35, "rgba(255,200,140,.35)"); grd.addColorStop(1, "rgba(255,190,130,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  const t = tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}

/* Anel de latão para marcar os pontos anotados. */
export function ringTexture() {
  const [c, g] = canvas(128);
  g.strokeStyle = "#e3c48c"; g.lineWidth = 6; g.beginPath(); g.arc(64, 64, 50, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#e3c48c"; g.beginPath(); g.arc(64, 64, 13, 0, Math.PI * 2); g.fill();
  const t = tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
