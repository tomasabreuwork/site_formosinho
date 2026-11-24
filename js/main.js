/* =========================================================================
   FORMOSINHO — interações (sem dependências)
   ========================================================================= */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const D = window.FORMOSINHO || {};
  const PIECES = D.pieces || [], STEPS = D.steps || [], DRAWERS = D.drawers || [], PINS = D.pins || [];
  const CAT = { aves: "Aves", mamiferos: "Mamíferos", peixes: "Peixes", trofeus: "Troféus" };
  const LIC = { by: "CC BY", "by-sa": "CC BY-SA", cc0: "CC0", pdm: "Domínio público" };
  const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

  let vw = innerWidth, vh = innerHeight;
  const mouse = { x: vw / 2, y: vh / 2, nx: 0, ny: 0 };
  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.nx = (e.clientX / vw) * 2 - 1; mouse.ny = (e.clientY / vh) * 2 - 1;
  }, { passive: true });

  const licText = (c) => c ? `${c.license ? (LIC[c.license] || c.license.toUpperCase()) + (c.version ? " " + c.version : "") : ""}` : "";
  const today = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, "0")}.${ROMAN[d.getMonth()]}.${d.getFullYear()}`; };

  /* ---------------------------------------------------------------------
     Imagens em falta → bloco de reserva
     --------------------------------------------------------------------- */
  function watchImage(img) {
    const host = img.parentElement;
    const fail = () => { host.classList.add("ph"); host.dataset.label = img.dataset.ph || img.alt || "imagem"; };
    img.addEventListener("error", fail);
    img.addEventListener("load", () => host.classList.remove("ph"));
    if (img.complete && img.getAttribute("src") && img.naturalWidth === 0) fail();
  }

  /* =====================================================================
     HERO — vídeo de drone que se recolhe numa prancha
     ===================================================================== */
  const hero = $(".hero"), heroSticky = $(".hero__sticky"), heroFrame = $(".hero__frame"), heroMedia = $(".hero__media");
  const heroMark = $(".hero__mark");

  /* Vídeo de drone a partir do YouTube (leitor oficial, sem som, em ciclo).
     O vídeo continua alojado no YouTube — não é copiado para o site. */
  const HV = D.heroVideo || {};
  const YT_ID = HV.youtube || "";
  let ytPlayer = null, ytReady = false;
  if (YT_ID) heroMedia.style.setProperty("--poster", `url("https://i.ytimg.com/vi/${YT_ID}/maxresdefault.jpg")`);
  (function setupYouTube() {
    if (!YT_ID || RM) return;
    const start = HV.start || 0, end = HV.end || 0;
    window.onYouTubeIframeAPIReady = () => {
      const vars = { autoplay: 1, mute: 1, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, loop: 1, playlist: YT_ID,
        modestbranding: 1, playsinline: 1, rel: 0, start, cc_load_policy: 0 };
      if (location.protocol.startsWith("http")) vars.origin = location.origin;
      ytPlayer = new YT.Player("heroYT", {
        host: "https://www.youtube-nocookie.com", videoId: YT_ID, playerVars: vars,
        events: {
          onReady: (e) => { ytReady = true; e.target.mute(); e.target.playVideo(); },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) setTimeout(() => heroFrame.classList.add("has-video"), 450);
            if (e.data === YT.PlayerState.ENDED) e.target.seekTo(start, true);
          },
          onError: () => heroFrame.classList.remove("has-video"),
        },
      });
      // ciclo suave: volta ao início um pouco antes do fim (evita o ecrã final do YouTube)
      setInterval(() => {
        if (!ytReady || !ytPlayer.getDuration) return;
        const d = ytPlayer.getDuration(), c = ytPlayer.getCurrentTime();
        const stop = end || d - 1.2;
        if (d && c > stop) ytPlayer.seekTo(start, true);
      }, 400);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api"; s.async = true;
    document.head.appendChild(s);
    // poupar recursos: pausa quando o hero sai do ecrã
    new IntersectionObserver(([e]) => {
      if (!ytReady) return;
      e.isIntersecting ? ytPlayer.playVideo() : ytPlayer.pauseVideo();
    }).observe(hero);
  })();

  // título letra a letra
  let ci = 0;
  $$(".hero__title-row").forEach((row) => {
    const txt = row.textContent; row.textContent = "";
    [...txt].forEach((c) => { const s = document.createElement("span"); s.className = "ch"; s.style.setProperty("--i", ci++); s.textContent = c; row.appendChild(s); });
  });
  const ready = () => requestAnimationFrame(() => document.body.classList.add("is-ready"));
  (document.fonts && document.fonts.ready) ? document.fonts.ready.then(ready) : addEventListener("load", ready);
  setTimeout(ready, 1800);

  // frase do hero (telemóvel) que muda de 3 em 3 segundos
  (function rotatePhrases() {
    const box = $(".hero__phrase"), list = D.heroPhrases || [];
    if (!box || list.length < 2) return;
    let i = 0;
    box.firstElementChild.textContent = list[0];
    setInterval(() => {
      if (document.hidden || heroE > 0.6) return;
      i = (i + 1) % list.length;
      const old = box.firstElementChild;
      const nu = document.createElement("span");
      nu.className = "is-enter"; nu.textContent = list[i];
      box.appendChild(nu);
      void nu.offsetWidth;
      nu.classList.remove("is-enter");
      old.classList.add("is-leave");
      setTimeout(() => old.remove(), 950);
    }, 3000);
  })();

  let heroE = 0;
  function updateHero() {
    const r = hero.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - vh), 0, 1);
    const q = clamp(p / 0.72, 0, 1);
    const e = RM ? (q > 0.5 ? 1 : 0) : 1 - Math.pow(1 - q, 3);
    heroE = e;
    if (r.bottom < 0) return;
    const small = vw < 820;
    const gut = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gut")) || 0;
    const rail = small ? 0 : 44;
    const it = e * (small ? 76 : Math.max(84, vh * 0.12));
    const il = e * (small ? 16 : Math.max(24, vw * 0.04));
    const ir = e * (small ? 16 : Math.max(24, vw * 0.04) + rail);
    const ib = e * vh * (small ? 0.27 : 0.22);
    const st = heroSticky.style;
    st.setProperty("--it", it + "px"); st.setProperty("--il", il + "px");
    st.setProperty("--ir", ir + "px"); st.setProperty("--ib", ib + "px");
    st.setProperty("--vs", (1.08 - e * 0.06).toFixed(4));
    st.setProperty("--hud", clamp(1 - e * 1.8, 0, 1).toFixed(3));
    st.setProperty("--cap", clamp((e - 0.55) / 0.4, 0, 1).toFixed(3));
    if (small) {
      // telemóvel: a marca sobe e desvanece enquanto a imagem se recolhe
      heroMark.style.transform = `translate3d(0, ${-e * (vh * 0.16)}px, 0) scale(${1 - e * 0.22})`;
      heroMark.style.opacity = clamp(1 - e * 1.25, 0, 1);
    } else {
      heroMark.style.opacity = "";
      heroMark.style.transform = `translate3d(${e * (il + 20 - gut * 0.2)}px, ${-ib - e * 18}px, 0) scale(${1 - e * 0.42})`;
    }
  }

  /* =====================================================================
     BARRA, ÍNDICE E RÉGUA
     ===================================================================== */
  const bar = $(".bar"), nowNum = $(".bar__now-num"), nowLabel = $(".bar__now-label");
  const sections = $$("[data-label]");
  let curLabel = "";
  const themeAt = (y) => {
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) {
        if (s === hero) return heroE > 0.45 ? "light" : "dark";
        return s.dataset.theme || "light";
      }
    }
    return "light";
  };
  function updateBar() {
    const idxOpen = document.body.classList.contains("index-open");
    bar.dataset.theme = idxOpen ? (vw < 820 ? "dark" : "light") : themeAt(36);
    // sólida assim que a prancha do topo começa a sair do ecrã
    bar.classList.toggle("is-solid", !idxOpen && hero.getBoundingClientRect().bottom < vh - 2);
    const y = vh * 0.4;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) {
        const lbl = s.dataset.label;
        if (lbl !== curLabel) { curLabel = lbl; nowNum.textContent = s.dataset.num; nowLabel.textContent = lbl; }
        break;
      }
    }
  }

  const idxBtn = $(".bar__index"), idx = $(".index");
  const setIndex = (open) => {
    document.body.classList.toggle("index-open", open);
    idxBtn.setAttribute("aria-expanded", open);
    idx.setAttribute("aria-hidden", !open);
    $(".bar__index-text").textContent = open ? "Fechar" : "Índice";
    idxBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    // no telemóvel o menu ocupa o ecrã inteiro: bloqueia o scroll por trás
    document.documentElement.style.overflow = open && vw < 820 ? "hidden" : "";
    updateCTA();
  };
  idxBtn.addEventListener("click", () => setIndex(!document.body.classList.contains("index-open")));
  idx.addEventListener("click", (e) => { if (e.target === idx || e.target.closest("a")) setIndex(false); });

  // Régua: 0–120 cm ao longo da página
  const ruler = $(".ruler"), ticks = $(".ruler__ticks"), mark = $(".ruler__mark"), read = $(".ruler__read");
  const CM = 120;
  for (let i = 0; i <= CM; i++) {
    const t = document.createElement("i");
    t.style.top = (i / CM) * 100 + "%";
    if (i % 10 === 0) { t.className = "major"; const b = document.createElement("b"); b.textContent = i; b.style.top = (i / CM) * 100 + "%"; ticks.appendChild(b); }
    else if (i % 5 === 0) t.className = "mid";
    ticks.appendChild(t);
  }
  function updateRuler() {
    const max = document.documentElement.scrollHeight - vh;
    const p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    mark.style.transform = `translateY(${14 + p * (vh - 28)}px)`;
    read.textContent = (p * CM).toFixed(1).replace(".", ",") + " cm";
    ruler.classList.toggle("is-dark", themeAt(vh * 0.5) === "dark");
  }

  /* =====================================================================
     REVELAÇÕES
     ===================================================================== */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  const observeReveals = (root = document) => $$(".reveal, .reveal-img, .chapter", root).forEach((el) => io.observe(el));

  /* =====================================================================
     I · ASSINATURA desenhada com o scroll
     ===================================================================== */
  const sig = $(".signature"), sigText = sig && sig.querySelector("text");
  function updateSignature() {
    if (!sig) return;
    const r = sig.getBoundingClientRect();
    if (r.top > vh || r.bottom < 0) return;
    const p = clamp((vh - r.top) / (vh * 0.55), 0, 1);
    sigText.style.strokeDashoffset = 900 * (1 - p);
    sigText.style.fill = `rgba(27,25,20,${clamp((p - 0.8) / 0.2, 0, 1) * 0.9})`;
  }

  /* =====================================================================
     II · MÉTODO
     ===================================================================== */
  const figsBox = $("#methodFigs"), stepsBox = $("#methodSteps");
  STEPS.forEach((s, i) => {
    const fig = document.createElement("div");
    fig.className = "plate__fig-img" + (i === 0 ? " is-on" : "");
    fig.innerHTML = `<img src="${esc(s.src)}" alt="${esc(s.title)}" loading="lazy" data-ph="Fig. ${i + 1} · ${esc(s.title)}">`;
    figsBox.appendChild(fig);

    const li = document.createElement("li");
    li.className = "step" + (i === 0 ? " is-active" : "");
    li.dataset.i = i;
    li.innerHTML = `
      <div class="step__mobile-img"><img src="${esc(s.src)}" alt="" loading="lazy" data-ph="Fig. ${i + 1}"></div>
      <span class="step__n">Fig. ${i + 1} — ${ROMAN[i]}</span>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.text)}</p>
      <p class="step__time">${esc(s.time || "")}</p>`;
    stepsBox.appendChild(li);
  });
  const figs = $$(".plate__fig-img"), steps = $$(".step");
  const figLabel = $(".plate__fig"), figCount = $(".plate__count"), methodRule = $(".method__rule span"), methodSec = $("#metodo");
  let curStep = 0;
  const setStep = (i) => {
    if (i === curStep) return;
    figs.forEach((f, k) => { f.classList.remove("was-on"); if (k === curStep) f.classList.add("was-on"); f.classList.toggle("is-on", k === i); });
    steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
    figLabel.textContent = `Fig. ${i + 1} — ${STEPS[i].title}`;
    figCount.textContent = `${i + 1} / ${STEPS.length}`;
    curStep = i;
  };
  if (STEPS.length) { figLabel.textContent = `Fig. 1 — ${STEPS[0].title}`; figCount.textContent = `1 / ${STEPS.length}`; }
  const stepIO = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) setStep(+e.target.dataset.i); }), { rootMargin: "-48% 0px -48% 0px" });
  steps.forEach((s) => stepIO.observe(s));
  function updateMethod() {
    const r = methodSec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = clamp((vh * 0.5 - r.top) / r.height, 0, 1);
    methodRule.style.height = p * 100 + "%";
  }

  /* =====================================================================
     III · CATÁLOGO — vitrine, etiquetas, índice
     ===================================================================== */
  const vitrine = $("#vitrine"), ledger = $("#ledger"), ledgerRows = $("#ledgerRows"), tabsBox = $("#catTabs"), catCount = $("#catCount");
  let filter = "all";

  const pieceRecord = (p) => ({
    no: p.no, title: p.title, sci: p.sci, src: p.src,
    fields: [["Classe", CAT[p.cat] || p.cat], ["Proveniência", p.origin], ["Região", p.region], ["Ano", p.year], ["Dimensões", p.dims]],
    desc: p.desc, credit: p.credit,
  });

  PIECES.forEach((p, i) => {
    const el = document.createElement("article");
    el.className = "spec-item";
    el.dataset.cat = p.cat; el.dataset.i = i;
    el.tabIndex = 0; el.setAttribute("role", "button");
    el.setAttribute("aria-label", `${p.title}, ${p.sci} — abrir ficha`);
    if (p.ar) el.style.setProperty("--ar", p.ar);
    el.innerHTML = `
      <span class="spec-item__no">${esc(p.no)}</span>
      <div class="spec-item__img"><img src="${esc(p.src)}" alt="${esc(p.title)} (${esc(p.sci)})" loading="lazy" decoding="async" data-ph="${esc(p.title)}"></div>
      <div class="tag" aria-hidden="true"><div class="tag__card">
        <p class="tag__top"><span>${esc(p.no)}</span><span>${esc(CAT[p.cat] || p.cat)}</span></p>
        <p class="tag__name">${esc(p.title)}</p>
        <p class="tag__sci">${esc(p.sci)}</p>
        <p class="tag__meta">${esc(p.region || "")} · ${esc(p.year || "")}</p>
      </div></div>`;
    vitrine.appendChild(el);

    const li = document.createElement("li");
    li.innerHTML = `<button class="ledger__row" data-i="${i}" data-cat="${esc(p.cat)}">
      <span class="c-no">${esc(p.no)}</span><span class="c-name">${esc(p.title)}</span><span class="c-sci">${esc(p.sci)}</span>
      <span class="c-cat">${esc(CAT[p.cat] || p.cat)}</span><span class="c-y">${esc(p.year || "")}</span><span class="c-d">${esc(p.dims || "")}</span></button>`;
    ledgerRows.appendChild(li);
  });
  const items = $$(".spec-item"), rows = $$(".ledger__row");

  // Separadores com contagem
  const cats = ["all", ...Object.keys(CAT).filter((c) => PIECES.some((p) => p.cat === c))];
  cats.forEach((c) => {
    const n = c === "all" ? PIECES.length : PIECES.filter((p) => p.cat === c).length;
    const b = document.createElement("button");
    b.className = "tab" + (c === "all" ? " is-on" : "");
    b.setAttribute("role", "tab"); b.setAttribute("aria-selected", c === "all");
    b.dataset.cat = c;
    b.innerHTML = `${c === "all" ? "Todas" : CAT[c]}<sup>${n}</sup>`;
    tabsBox.appendChild(b);
  });

  const visibleIdx = () => PIECES.map((p, i) => i).filter((i) => filter === "all" || PIECES[i].cat === filter);
  function layoutVitrine() {
    let k = 0;
    items.forEach((el) => {
      el.className = el.className.replace(/\bs\d\b/g, "").trim();
      if (!el.hidden) el.classList.add("s" + (k++ % 7));
    });
  }
  function applyFilter(c) {
    filter = c;
    $$(".tab").forEach((t) => { const on = t.dataset.cat === c; t.classList.toggle("is-on", on); t.setAttribute("aria-selected", on); });
    items.forEach((el) => el.classList.add("is-out"));
    setTimeout(() => {
      items.forEach((el) => { el.hidden = !(c === "all" || el.dataset.cat === c); });
      rows.forEach((r) => { r.parentElement.hidden = !(c === "all" || r.dataset.cat === c); });
      layoutVitrine();
      catCount.textContent = visibleIdx().length;
      let d = 0;
      items.forEach((el) => { if (!el.hidden) { el.style.transitionDelay = (d++ * 60) + "ms"; requestAnimationFrame(() => el.classList.remove("is-out")); } });
      setTimeout(() => items.forEach((el) => (el.style.transitionDelay = "")), 900);
    }, RM ? 0 : 380);
  }
  tabsBox.addEventListener("click", (e) => { const t = e.target.closest(".tab"); if (t) applyFilter(t.dataset.cat); });
  layoutVitrine();
  catCount.textContent = PIECES.length;

  // Vitrine ⇄ Índice
  $$(".view-toggle button").forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.view;
    $$(".view-toggle button").forEach((x) => { const on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on); });
    vitrine.hidden = v !== "vitrine"; ledger.hidden = v !== "indice";
  }));

  const openPiece = (i) => {
    const list = visibleIdx();
    const pos = Math.max(0, list.indexOf(i));
    openRecord(list.map((k) => pieceRecord(PIECES[k])), pos);
  };
  items.forEach((el) => {
    el.addEventListener("click", () => openPiece(+el.dataset.i));
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPiece(+el.dataset.i); } });
  });
  rows.forEach((r) => r.addEventListener("click", () => openPiece(+r.dataset.i)));

  // Etiquetas: física de pêndulo ligada à velocidade do scroll
  const tags = items.map((el) => ({ el: el.querySelector(".tag"), a: 0, w: 0, k: 0.8 + Math.random() * 0.5, vis: false }));
  const tagIO = new IntersectionObserver((es) => es.forEach((e) => { const t = tags.find((x) => x.el === e.target); if (t) t.vis = e.isIntersecting; }));
  tags.forEach((t) => tagIO.observe(t.el));
  items.forEach((el, i) => el.addEventListener("pointerenter", (e) => { tags[i].w += (e.movementX >= 0 ? 1.6 : -1.6) * tags[i].k; }));
  let lastY = scrollY, scrollV = 0;
  function updateTags() {
    if (RM) return;
    for (const t of tags) {
      if (!t.vis) continue;
      t.w += -0.04 * t.a - 0.085 * t.w + scrollV * 0.045 * t.k;
      t.a = clamp(t.a + t.w, -22, 22);
      if (Math.abs(t.a) < 0.01 && Math.abs(t.w) < 0.01) { t.a = 0; t.w = 0; }
      t.el.style.setProperty("--sw", t.a.toFixed(2) + "deg");
    }
  }

  // Pré-visualização no modo Índice
  const prev = $(".ledger-preview"), prevImg = prev.querySelector("img");
  const pv = { x: 0, y: 0, on: false };
  if (FINE) {
    rows.forEach((r) => r.addEventListener("pointerenter", () => { prevImg.src = PIECES[+r.dataset.i].src; prev.classList.add("is-on"); pv.on = true; }));
    ledgerRows.addEventListener("pointerleave", () => { prev.classList.remove("is-on"); pv.on = false; });
  }
  function updatePreview() {
    if (!pv.on) return;
    const tx = mouse.x + 28, ty = mouse.y - 120;
    const dx = tx - pv.x;
    pv.x = lerp(pv.x, tx, 0.16); pv.y = lerp(pv.y, ty, 0.16);
    prev.style.transform = `translate3d(${pv.x}px, ${pv.y}px, 0) rotate(${clamp(dx * 0.05, -8, 8)}deg)`;
  }

  /* =====================================================================
     IV · GAVETAS 3D
     ===================================================================== */
  const cab = $("#cabinet"), cabSec = $("#gavetas");
  const readN = $(".cabinet__readout-n"), readT = $(".cabinet__readout-t");
  const drawerRecord = (d, i) => ({
    no: `GAV-${String(i + 1).padStart(2, "0")}`, title: d.title, sci: d.sci, src: d.src,
    fields: [["Gaveta", `${String(i + 1).padStart(2, "0")} · ${d.label}`], ["Conteúdo", d.count], ["Uso", "Coleção de estudo · referência"]],
    desc: d.desc, credit: d.credit,
  });
  DRAWERS.forEach((d, i) => {
    const el = document.createElement("div");
    el.className = "drawer"; el.tabIndex = 0; el.setAttribute("role", "button");
    el.setAttribute("aria-label", `Gaveta ${i + 1}: ${d.title} — abrir ficha`);
    el.innerHTML = `
      <div class="drawer__top"><img src="${esc(d.src)}" alt="" loading="lazy" data-ph="${esc(d.title)}"></div>
      <div class="drawer__side drawer__side--l"></div><div class="drawer__side drawer__side--r"></div>
      <div class="drawer__front"><span class="drawer__label">${esc(d.label)}</span><span class="drawer__pull"></span></div>`;
    const show = () => { readN.textContent = `Gaveta ${String(i + 1).padStart(2, "0")} · ${d.label}`; readT.textContent = d.title; };
    el.addEventListener("pointerenter", show); el.addEventListener("focus", show);
    const open = () => openRecord(DRAWERS.map(drawerRecord), i);
    el.addEventListener("click", open);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    cab.appendChild(el);
  });
  function updateCabinet() {
    if (!FINE || RM) return;
    const r = cabSec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    cab.style.setProperty("--cry", (mouse.nx * 7).toFixed(2) + "deg");
    cab.style.setProperty("--crx", (6 - mouse.ny * 4).toFixed(2) + "deg");
  }

  /* =====================================================================
     V · LUPA
     ===================================================================== */
  const spec = $("#specimen"), specImg = spec.querySelector("img"), loupe = $(".loupe"), pinsBox = $("#pins"), annBox = $("#annotations");
  const Z = 3, LR = 115;
  PINS.forEach((p, i) => {
    const pin = document.createElement("span");
    pin.className = "pin"; pin.textContent = i + 1;
    pin.style.left = p.x + "%"; pin.style.top = p.y + "%";
    pinsBox.appendChild(pin);
    const li = document.createElement("li");
    li.innerHTML = `<b>${String(i + 1).padStart(2, "0")} — ${esc(p.title)}</b><span>${esc(p.text)}</span>`;
    annBox.appendChild(li);
  });
  const pinEls = $$(".pin"), annEls = $$("#annotations li");
  function moveLoupe(cx, cy) {
    if (spec.classList.contains("ph")) return;
    const r = specImg.getBoundingClientRect();
    const x = clamp(cx - r.left, 0, r.width), y = clamp(cy - r.top, 0, r.height);
    loupe.style.left = x + "px"; loupe.style.top = y + "px";
    loupe.style.backgroundImage = `url("${specImg.currentSrc || specImg.src}")`;
    loupe.style.backgroundSize = `${r.width * Z}px ${r.height * Z}px`;
    loupe.style.backgroundPosition = `${-(x * Z - LR)}px ${-(y * Z - LR)}px`;
    spec.classList.add("is-looking");
    PINS.forEach((p, i) => {
      const near = Math.hypot((p.x / 100) * r.width - x, (p.y / 100) * r.height - y) < 110;
      pinEls[i].classList.toggle("is-near", near); annEls[i].classList.toggle("is-near", near);
    });
  }
  spec.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" || e.pointerType === "pen") moveLoupe(e.clientX, e.clientY); });
  spec.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") moveLoupe(e.clientX, e.clientY); });
  spec.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") spec.classList.remove("is-looking"); });
  spec.style.touchAction = "manipulation";

  /* =====================================================================
     FICHA (lightbox)
     ===================================================================== */
  const rec = $(".record"), recImg = $(".record__img img"), recImgBox = $(".record__img");
  let recList = [], recPos = 0, lastFocus = null;
  recImg.addEventListener("error", () => { recImgBox.classList.add("ph"); recImgBox.dataset.label = recImg.alt; });
  recImg.addEventListener("load", () => recImgBox.classList.remove("ph"));
  function fillRecord() {
    const r = recList[recPos];
    recImgBox.classList.remove("ph");
    recImg.src = r.src; recImg.alt = r.title;
    $(".record__no").textContent = `Nº ${r.no}`;
    $(".record__title").textContent = r.title;
    $(".record__sci").textContent = r.sci || "";
    $(".record__fields").innerHTML = r.fields.filter(([, v]) => v).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");
    $(".record__desc").textContent = r.desc || "";
    const c = r.credit;
    $(".record__credit").innerHTML = c ? `Fotografia: ${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.author || "autor")}</a>` : esc(c.author || "")}${licText(c) ? " · " + esc(licText(c)) : ""}` : "";
    $(".record__prev").style.visibility = recList.length > 1 ? "" : "hidden";
    $(".record__next").style.visibility = recList.length > 1 ? "" : "hidden";
  }
  function openRecord(list, pos) {
    recList = list; recPos = pos; lastFocus = document.activeElement;
    fillRecord();
    rec.classList.add("is-open"); rec.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    $(".record__close").focus({ preventScroll: true }); updateCTA();
  }
  function closeRecord() {
    rec.classList.remove("is-open"); rec.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    if (lastFocus) lastFocus.focus({ preventScroll: true }); updateCTA();
  }
  function step(dir) {
    rec.classList.add("is-switching");
    setTimeout(() => { recPos = (recPos + dir + recList.length) % recList.length; fillRecord(); rec.classList.remove("is-switching"); }, 220);
  }
  $(".record__close").addEventListener("click", closeRecord);
  $(".record__prev").addEventListener("click", () => step(-1));
  $(".record__next").addEventListener("click", () => step(1));
  rec.addEventListener("click", (e) => { if (e.target === rec) closeRecord(); });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (rec.classList.contains("is-open")) closeRecord(); else if (document.body.classList.contains("index-open")) setIndex(false); }
    if (!rec.classList.contains("is-open")) return;
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });
  let tx0 = 0;
  rec.addEventListener("touchstart", (e) => (tx0 = e.touches[0].clientX), { passive: true });
  rec.addEventListener("touchend", (e) => { const dx = e.changedTouches[0].clientX - tx0; if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1); });

  /* =====================================================================
     VII · FICHA DE ENCOMENDA + CARIMBO
     ===================================================================== */
  const slip = $(".slip"), status = $(".slip__status");
  $("#slipNo").textContent = String(1000 + (Math.floor(Date.now() / 86400000) % 9000)).padStart(4, "0");
  $("#slipDate").textContent = today();
  $("#stampDate").textContent = today();
  slip.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (slip.classList.contains("is-stamped")) return;
    let ok = true;
    $$(".line", slip).forEach((l) => {
      const f = l.querySelector("input, textarea");
      let bad = f.required && !f.value.trim();
      if (f.name === "contacto" && f.value.trim()) bad = !(/@.+\./.test(f.value) || f.value.replace(/\D/g, "").length >= 9);
      l.classList.toggle("is-error", bad);
      if (bad) ok = false;
    });
    if (!ok) { status.textContent = "Faltam campos por preencher."; return; }
    status.textContent = "A enviar…";
    try {
      const action = slip.getAttribute("action");
      if (action && action !== "#") {
        const res = await fetch(action, { method: "POST", body: new FormData(slip), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error();
      }
      slip.classList.add("is-stamped");
      status.textContent = "Ficha recebida. Respondemos em 48 h.";
      const btn = $(".stamp-btn"); btn.textContent = "Carimbada ✓"; btn.disabled = true;
    } catch {
      status.textContent = "Não foi possível enviar. Escreva-nos para geral@formosinho.pt.";
    }
  });

  /* =====================================================================
     EFEITO 3D AO PASSAR O RATO OU O DEDO (genérico)
     ===================================================================== */
  function tilt3d(el, max = 8, glare = true) {
    if (!el || RM) return;
    el.classList.add("tilt3d");
    if (glare && !el.querySelector(":scope > .glare")) { const g = document.createElement("span"); g.className = "glare"; el.appendChild(g); }
    let raf = 0;
    const set = (x, y) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = clamp((x - r.left) / r.width, 0, 1), py = clamp((y - r.top) / r.height, 0, 1);
        el.style.setProperty("--ry", ((px - 0.5) * max * 2).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((0.5 - py) * max * 2).toFixed(2) + "deg");
        el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
        el.classList.add("is-tilting");
      });
    };
    const reset = () => { cancelAnimationFrame(raf); el.classList.remove("is-tilting"); el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); };
    el.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") set(e.clientX, e.clientY); });
    el.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") reset(); });
    // toque: inclina enquanto o dedo está pousado (não impede o scroll)
    el.addEventListener("touchstart", (e) => set(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    el.addEventListener("touchmove", (e) => set(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    el.addEventListener("touchend", reset, { passive: true });
    el.addEventListener("touchcancel", reset, { passive: true });
  }
  $$(".spec-item__img").forEach((el) => tilt3d(el, 7));
  tilt3d($(".pinned"), 9);
  tilt3d($(".plate"), 4);
  $$(".entry").forEach((el) => tilt3d(el, 3, false));
  tilt3d($(".card3d"), 10, false);
  tilt3d($(".record__img"), 4);
  $$(".spec > div").forEach((el) => tilt3d(el, 10, false));
  tilt3d($(".loupe-side__lead"), 5, false);

  // vitrine 3D: o vidro inclina-se ligeiramente com o rato fora do modelo
  const caseEl = $("#case3d"), caseGlass = $(".case__glass");
  if (FINE && !RM) {
    $("#volta").addEventListener("pointermove", (e) => {
      if (e.target.closest(".case__view")) return;
      caseGlass.style.setProperty("--ry", (mouse.nx * 5).toFixed(2) + "deg");
      caseGlass.style.setProperty("--rx", (-mouse.ny * 3).toFixed(2) + "deg");
    });
  }

  /* Letras do colofão que se viram para o cursor / dedo */
  const colWord = $(".colophon__word");
  if (colWord && !RM) {
    const txt = colWord.textContent; colWord.textContent = "";
    const lts = [...txt].map((c) => { const s = document.createElement("span"); s.className = "lt"; s.textContent = c; colWord.appendChild(s); return s; });
    const aim = (x, y) => {
      colWord.classList.add("is-active");
      lts.forEach((s) => {
        const r = s.getBoundingClientRect();
        const dx = (r.left + r.width / 2 - x) / vw, dy = Math.abs(r.top + r.height / 2 - y) / vh;
        s.style.setProperty("--ly", clamp(dx * -110, -55, 55).toFixed(1) + "deg");
        s.style.setProperty("--lz", (clamp(1 - Math.abs(dx) * 4 - dy, 0, 1) * 60).toFixed(1) + "px");
      });
    };
    const rest = () => { colWord.classList.remove("is-active"); lts.forEach((s) => { s.style.setProperty("--ly", "0deg"); s.style.setProperty("--lz", "0px"); }); };
    const col = $(".colophon");
    col.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") aim(e.clientX, e.clientY); });
    col.addEventListener("pointerleave", rest);
    col.addEventListener("touchmove", (e) => aim(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    col.addEventListener("touchend", rest, { passive: true });
  }

  /* =====================================================================
     VI · CABEÇA DE VEADO 3D (visualizador Sketchfab, carregado só quando perto)
     ===================================================================== */
  (function setupTurn() {
    const T = D.turn3d || {}, view = $("#turnView");
    if (!T.sketchfab || !view) return;
    const params = new URLSearchParams({
      autostart: 1, preload: 1, autospin: RM ? 0 : (T.autospin ?? 0.18), camera: 0, dnt: 1, scrollwheel: 0, transparent: 1,
      ui_theme: "dark", ui_infos: 0, ui_controls: 0, ui_stop: 0, ui_inspector: 0, ui_settings: 0, ui_help: 0, ui_vr: 0, ui_ar: 0,
      ui_ar_help: 0, ui_ar_qrcode: 0, ui_fullscreen: 0, ui_annotations: 0, ui_hint: 2, ui_watermark: 0, ui_watermark_link: 0, ui_loading: 0,
    });
    let loaded = false;
    const load = () => {
      if (loaded) return; loaded = true;
      const f = document.createElement("iframe");
      f.title = T.title || "Modelo 3D";
      f.allow = "autoplay; fullscreen; xr-spatial-tracking";
      f.setAttribute("allowfullscreen", "");
      f.src = `https://sketchfab.com/models/${T.sketchfab}/embed?${params}`;
      f.addEventListener("load", () => setTimeout(() => caseEl.classList.add("is-live"), 1600));
      view.appendChild(f);
    };
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { load(); o.disconnect(); } }, { rootMargin: "700px 0px" }).observe(view);
  })();

  /* =====================================================================
     PROMOÇÃO (barra no fundo em computador) + BOTÃO "ENCOMENDE JÁ" (telemóvel)
     ===================================================================== */
  const promo = $(".promo"), cta = $(".cta-mobile"), orderSec = $("#encomendas");
  (function setupPromo() {
    const P = D.promo;
    const expired = P && P.until && new Date() > new Date(P.until);
    const closedKey = "formosinho-promo-" + (P && P.label || "");
    if (!P || !P.active || expired || sessionStorage.getItem(closedKey)) { promo.remove(); return; }
    $(".promo__tag").textContent = P.label;
    $(".promo__link").href = P.href || "#encomendas";
    const track = $(".promo__track");
    const items = (P.items || []).map((t) => `<span>${esc(t)}</span>`).join("");
    track.innerHTML = items.repeat(4) + items.repeat(4); // duas metades iguais → ciclo contínuo
    track.style.setProperty("--promo-dur", Math.max(24, (P.items || []).join(" ").length * 0.9) + "s");
    promo.hidden = false;
    document.body.classList.add("has-promo");
    setTimeout(() => promo.classList.add("is-on"), 1600);
    $(".promo__close").addEventListener("click", () => {
      promo.classList.remove("is-on"); sessionStorage.setItem(closedKey, "1");
      document.body.classList.remove("has-promo");
      setTimeout(() => promo.remove(), 800);
    });
  })();
  let orderVisible = false;
  new IntersectionObserver(([e]) => { orderVisible = e.isIntersecting; updateCTA(); }, { rootMargin: "0px 0px -30% 0px" }).observe(orderSec);
  function updateCTA() {
    if (!cta) return;
    const show = scrollY > vh * 0.6 && !orderVisible && !document.body.classList.contains("index-open") && !rec.classList.contains("is-open");
    cta.classList.toggle("is-on", show);
  }
  addEventListener("scroll", updateCTA, { passive: true });

  /* =====================================================================
     PARALLAX genérico (data-speed)
     ===================================================================== */
  const speedEls = $$("[data-speed]");
  function updateParallax() {
    if (RM) return;
    for (const el of speedEls) {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * +el.dataset.speed).toFixed(1)}px`;
    }
  }

  /* =====================================================================
     CRÉDITOS (obrigatórios para imagens CC BY)
     ===================================================================== */
  const creditList = $("#credits"), seen = new Set();
  const addCredit = (what, c) => {
    if (!c || !c.author || seen.has(c.url)) return;
    seen.add(c.url);
    const li = document.createElement("li");
    li.innerHTML = `${esc(what)} — ${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.author)}</a>` : esc(c.author)}${licText(c) ? ", " + esc(licText(c)) : ""}`;
    creditList.appendChild(li);
  };
  if (HV.credit) addCredit("Vídeo do topo (YouTube)", HV.credit);
  if (D.turn3d && D.turn3d.credit) addCredit("Modelo 3D · cabeça de veado", D.turn3d.credit);
  (D.extraCredits || []).forEach((c) => addCredit(c.what, c));
  STEPS.forEach((s) => addCredit(`Método: ${s.title}`, s.credit));
  PIECES.forEach((p) => addCredit(p.title, p.credit));
  DRAWERS.forEach((d) => addCredit(`Gaveta: ${d.title}`, d.credit));
  if (!creditList.children.length) $(".credits").remove();

  /* =====================================================================
     ARRANQUE
     ===================================================================== */
  $$("img").forEach((img) => { if (!img.closest(".record, .ledger-preview")) watchImage(img); });
  observeReveals();
  $("#year").textContent = new Date().getFullYear();

  function frame(t) {
    scrollV = lerp(scrollV, scrollY - lastY, 0.5); lastY = scrollY;
    updateHero(t);
    updateBar();
    updateRuler();
    updateSignature();
    updateMethod();
    updateTags();
    updatePreview();
    updateCabinet();
    updateParallax();
    requestAnimationFrame(frame);
  }
  addEventListener("resize", () => { vw = innerWidth; vh = innerHeight; });
  requestAnimationFrame(frame);
})();
