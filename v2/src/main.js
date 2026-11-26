/* =========================================================================
   FORMOSINHO · VERSÃO 2 — texto, scroll e arranque do 3D
   Os conteúdos vêm do mesmo ficheiro da versão 1: js/gallery-data.js
   ========================================================================= */
import "../../js/gallery-data.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ORBIT, clamp } from "./choreo.js";

const D = window.FORMOSINHO || {};
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const NARROW = matchMedia("(max-width: 820px)");
const COARSE = matchMedia("(pointer: coarse)");

/* ------------------------------------------------------------------ conteúdos */
const models = (D.turn3d && D.turn3d.models) || [];
const piece = models.find((m) => m.sci === "Tyto alba") || models[0] || { name: "Coruja-das-torres", sci: "Tyto alba", notes: [] };
$('[data-f="name"]').textContent = piece.name;
$('[data-f="sci"]').textContent = piece.sci;
$(".card--intro").dataset.to = ORBIT.intro[1];

const notes = (piece.notes || []).slice(0, ORBIT.stops.length);
notes.forEach((n, i) => {
  const s = ORBIT.stops[i];
  const li = document.createElement("li");
  li.className = "note";
  li.dataset.i = i;
  li.dataset.from = s.dwell[0] - 0.005;
  li.dataset.to = i === notes.length - 1 ? 1.01 : s.dwell[1];
  li.innerHTML = `
    <p class="note__no">II · Em volta</p>
    <span class="note__count">${i + 1} / ${notes.length}</span>
    <h3 class="note__title">${esc(n.t)}</h3>
    <p class="note__text">${esc(n.d)}</p>`;
  $("#notes").appendChild(li);
});

const HV = D.heroVideo || {};
if (HV.credit) $("#credit").textContent = `Vídeo do habitat: ${HV.credit.author}, usado com autorização do autor. A coruja é um estudo geométrico provisório.`;

/* ------------------------------------------------------------------ vídeo do habitat */
const video = $(".stage__video");
const videoSrc = () => {
  const s = (HV.sources || []).find((x) => !x.media || matchMedia(x.media).matches);
  return (s && s.src) || HV.src;
};
function startVideo() {
  const src = videoSrc();
  if (!src) return;
  video.muted = true;
  video.src = "../" + src;
  const T0 = HV.trimStart || 0, T1 = HV.trimEnd || 0;
  video.addEventListener("loadedmetadata", () => { if (T0 && video.duration > T0 + T1 + 1) video.currentTime = T0; }, { once: true });
  video.addEventListener("timeupdate", () => { if (T1 && video.duration && video.currentTime > video.duration - T1) video.currentTime = T0; });
  video.play().catch(() => {});
}
document.addEventListener("visibilitychange", () => { if (document.hidden) video.pause(); });

/* ------------------------------------------------------------------ modo estático
   Sem WebGL, ou com "reduzir movimento": página em fluxo normal, sem 3D nem scroll suave. */
const hasGL = (() => {
  try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); }
  catch (e) { return false; }
})();

if (RM || !hasGL) {
  html.classList.add("is-static");
  if (RM) { video.poster = "../videos/hero-poster.jpg"; video.preload = "none"; } // sem vídeo pesado nem movimento
  else startVideo();
} else {
  startVideo();
  runCinema();
}

/* ------------------------------------------------------------------ modo cinema */
function runCinema() {
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Rever um momento exato: ?vh=250 abre nesse ponto do scroll (em % da altura do ecrã);
  // ?cena=1&p=0.3 fixa a cena II a 30 % sem fazer scroll (pré-visualização / capturas).
  const qs = new URLSearchParams(location.search);
  const PREVIEW = qs.has("p") ? { s: parseInt(qs.get("cena") || "0", 10), p: clamp(parseFloat(qs.get("p")) || 0) } : null;

  // progresso de cada cena (0 → 1); a última termina quando o fundo chega ao fundo do ecrã
  const scenes = $$(".scene");
  const raw = scenes.map(() => 0), sm = scenes.map(() => 0);
  scenes.forEach((el, i) => ScrollTrigger.create({
    trigger: el, start: "top top", end: i === scenes.length - 1 ? "bottom bottom" : "bottom top",
    onUpdate: (st) => { if (!PREVIEW) raw[i] = st.progress; }, onRefresh: (st) => { if (!PREVIEW) raw[i] = st.progress; },
  }));

  if (qs.has("vh")) lenis.scrollTo((parseFloat(qs.get("vh")) || 0) * window.innerHeight / 100, { immediate: true, force: true });
  if (PREVIEW) {
    lenis.stop();
    raw.forEach((_, i) => { raw[i] = i < PREVIEW.s ? 1 : i === PREVIEW.s ? PREVIEW.p : 0; sm[i] = raw[i]; });
    html.classList.toggle("hide-opening", PREVIEW.s > 0 || PREVIEW.p > 0.25);
  }

  const groups = scenes.map((s) => $$("[data-from]", s));
  const num = $(".nav__num"), label = $(".nav__label"), rule = $(".rule"), after = $("#depois");
  const path = $(".leader"), dot = $(".leader__dot");
  let cur = -1;

  function syncText() {
    let c = 0;
    for (let i = 0; i < raw.length; i++) if (raw[i] > 0) c = i;
    groups.forEach((cards, i) => cards.forEach((el) => {
      const on = i === c && sm[i] >= +el.dataset.from && sm[i] < +el.dataset.to;
      if (on !== el.classList.contains("is-on")) el.classList.toggle("is-on", on);
    }));
    if (c !== cur) { cur = c; num.textContent = scenes[c].dataset.num; label.textContent = scenes[c].dataset.label; }
    rule.style.setProperty("--p", (raw.reduce((a, b) => a + b, 0) / raw.length).toFixed(4));
  }

  // fio da etiqueta: do cartão até ao ponto da peça
  function drawLeader(mark) {
    const card = $(".note.is-on");
    const pt = card && mark && mark.at >= 0 && +card.dataset.i === mark.at && mark.dwell > 0.35 ? stage.project(mark.at) : null;
    if (!pt || !pt.ok) { html.classList.remove("has-leader"); return; }
    const r = card.getBoundingClientRect();
    let d;
    if (NARROW.matches) {
      const sx = clamp(pt.x, r.left + 28, r.right - 28), sy = r.top;
      d = `M${sx},${sy} L${sx},${sy - 26} L${pt.x},${pt.y}`;
    } else {
      const sx = r.right, sy = r.top + 30, mx = sx + Math.max(28, (pt.x - sx) * 0.38);
      d = `M${sx},${sy} L${mx},${sy} L${pt.x},${pt.y}`;
    }
    path.setAttribute("d", d);
    dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y);
    html.classList.add("has-leader");
  }

  // o 3D carrega depois de o texto e o vídeo estarem no ecrã
  let stage = null, live = true;
  async function start3D() {
    try {
      await Promise.all(["italic 54px 'Cormorant Garamond'", "30px 'Cormorant Garamond'", "500 22px 'IBM Plex Mono'"].map((f) => document.fonts.load(f))).catch(() => {});
      const { createStage } = await import("./stage.js");
      stage = await createStage({ canvas: $(".stage__canvas"), video, mobile: NARROW.matches || COARSE.matches, piece });
      stage.update({ p0: sm[0], p1: sm[1] }, gsap.ticker.time);
      requestAnimationFrame(() => html.classList.add("is-3d"));
      new ResizeObserver(() => stage.layout()).observe($(".stage__canvas"));
      if (qs.has("debug")) setInterval(() => { document.title = "DBG " + JSON.stringify(stage.probe()); }, 1000);
    } catch (e) {
      console.warn("[Formosinho v2] 3D indisponível:", e); // fica o vídeo e o texto
    }
  }
  (window.requestIdleCallback || ((f) => setTimeout(f, 150)))(start3D, { timeout: 1200 });

  gsap.ticker.add((time, deltaMs) => {
    const a = 1 - Math.exp(-(Math.min(deltaMs, 64) / 1000) * 9); // suaviza ainda um pouco o scroll do 3D
    for (let i = 0; i < raw.length; i++) {
      sm[i] += (raw[i] - sm[i]) * a;
      if (Math.abs(raw[i] - sm[i]) < 0.0005) sm[i] = raw[i];
    }
    syncText();
    if (!stage) return;
    const on = after.getBoundingClientRect().top > 1; // pausa quando o 3D fica tapado
    if (on !== live) { live = on; stage.setActive(on); }
    if (!on) { html.classList.remove("has-leader"); return; }
    drawLeader(stage.update({ p0: sm[0], p1: sm[1] }, time));
  });
}
