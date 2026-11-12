const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
let lenis = null;

const CHESS_USER = "vinu2023";

// ===== Footer year =====
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Smooth-scroll helper =====
function goTo(target) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
  else el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
}
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    goTo(target);
  });
});

// ===== Typing effect =====
const roles = [
  "software engineer.",
  "ai agent builder.",
  "ml researcher.",
  "full-stack developer.",
  "hackathon winner.",
  "chess player.",
];
const typedEl = document.getElementById("typed");
if (typedEl) {
  if (prefersReduced) {
    typedEl.textContent = roles[0];
  } else {
    let roleIdx = 0, charIdx = 0, deleting = false;
    (function tick() {
      const word = roles[roleIdx];
      if (!deleting) {
        charIdx++;
        typedEl.textContent = word.slice(0, charIdx);
        if (charIdx === word.length) { deleting = true; return setTimeout(tick, 1800); }
        setTimeout(tick, 70);
      } else {
        charIdx--;
        typedEl.textContent = word.slice(0, charIdx);
        if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; return setTimeout(tick, 350); }
        setTimeout(tick, 38);
      }
    })();
  }
}

// ===== Active nav link =====
const navLinks = document.querySelectorAll(".nav-links a");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        navLinks.forEach((link) =>
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`)
        );
      }
    }
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
document.querySelectorAll("section[id]").forEach((s) => sectionObserver.observe(s));

// ===== Toast =====
const toastEl = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2400);
}

// ===== Theme: flip the board (blush <-> midnight) =====
const themeBtn = document.getElementById("theme-btn");
function setTheme(midnight, announce = false) {
  document.documentElement.classList.toggle("midnight", midnight);
  if (themeBtn) themeBtn.textContent = midnight ? "☀" : "⛶";
  try { localStorage.setItem("ctheme", midnight ? "midnight" : "blush"); } catch (e) {}
  if (announce) showToast(midnight ? "♚ midnight board" : "♔ blush board");
}
if (themeBtn) {
  themeBtn.textContent = document.documentElement.classList.contains("midnight") ? "☀" : "⛶";
  themeBtn.addEventListener("click", () => setTheme(!document.documentElement.classList.contains("midnight"), true));
}

// ===== Live Chess.com stats =====
(function loadChessStats() {
  const foot = document.getElementById("chess-foot");
  const setText = (sel, val) => { const el = document.querySelector(sel); if (el && val != null) el.textContent = val; };

  fetch(`https://api.chess.com/pub/player/${CHESS_USER}/stats`, { headers: { Accept: "application/json" } })
    .then((r) => { if (!r.ok) throw new Error("stats " + r.status); return r.json(); })
    .then((d) => {
      document.querySelectorAll(".rating-card[data-mode]").forEach((card) => {
        const mode = d[card.dataset.mode];
        if (!mode) return;
        const set = (sel, v) => { const el = card.querySelector(sel); if (el && v != null) el.textContent = v; };
        if (mode.last && mode.last.rating) set("[data-rating]", mode.last.rating);
        if (mode.best && mode.best.rating) set("[data-best]", mode.best.rating);
      });
      if (d.tactics && d.tactics.highest) setText("[data-tactics]", d.tactics.highest.rating);
      if (foot) foot.textContent = "live from Chess.com, @" + CHESS_USER;
    })
    .catch(() => {
      if (foot) foot.textContent = "see my live profile at chess.com/member/Vinu2023";
    });

  fetch(`https://api.chess.com/pub/player/${CHESS_USER}`, { headers: { Accept: "application/json" } })
    .then((r) => r.ok ? r.json() : null)
    .then((p) => {
      if (!p) return;
      if (p.league) setText("[data-league]", p.league);
      if (p.joined) setText("[data-since]", new Date(p.joined * 1000).getFullYear());
    })
    .catch(() => {});
})();

// ===== Command palette (⌘K) =====
(function paletteInit() {
  const palette = document.getElementById("palette");
  const input = document.getElementById("palette-input");
  const list = document.getElementById("palette-list");
  const btn = document.getElementById("palette-btn");
  const backdrop = document.getElementById("palette-backdrop");
  if (!palette) return;

  const items = [
    { icon: "⏱", label: "The moves (experience)", hint: "01", action: () => goTo("#experience") },
    { icon: "♛", label: "Solve a puzzle (mate in one)", hint: "play", action: () => goTo("#puzzle") },
    { icon: "♟", label: "On the board (chess stats)", hint: "02", action: () => goTo("#chess") },
    { icon: "♜", label: "The board (projects)", hint: "03", action: () => goTo("#projects") },
    { icon: "♚", label: "The player (about)", hint: "04", action: () => goTo("#about") },
    { icon: "♟", label: "Play the game (scroll demo)", hint: "scroll", action: () => goTo("#game") },
    { icon: "☾", label: "Off the board (sky, books, trips)", hint: "05", action: () => goTo("#hobbies") },
    { icon: "⚔", label: "The arsenal (skills)", hint: "06", action: () => goTo("#skills") },
    { icon: "🎓", label: "Education", hint: "07", action: () => goTo("#education") },
    { icon: "♞", label: "Flip the board (theme)", hint: "theme", action: () => themeBtn && themeBtn.click() },
    { icon: "🐙", label: "GitHub", hint: "↗", action: () => window.open("https://github.com/vinisha231", "_blank") },
    { icon: "💼", label: "LinkedIn", hint: "↗", action: () => window.open("https://linkedin.com/in/vinishab", "_blank") },
    { icon: "♟", label: "Chess.com profile", hint: "↗", action: () => window.open("https://www.chess.com/member/Vinu2023", "_blank") },
    { icon: "✉", label: "Email me", hint: "mailto", action: () => { window.location.href = "mailto:viba2022@gmail.com"; } },
  ];

  let filtered = items, selected = 0;
  function render() {
    list.innerHTML = "";
    filtered.forEach((it, i) => {
      const li = document.createElement("li");
      if (i === selected) li.classList.add("is-selected");
      const icon = document.createElement("span"); icon.className = "p-icon"; icon.textContent = it.icon;
      const label = document.createElement("span"); label.textContent = it.label;
      const hint = document.createElement("span"); hint.className = "p-hint"; hint.textContent = it.hint;
      li.append(icon, label, hint);
      li.addEventListener("click", () => run(it));
      li.addEventListener("mousemove", () => {
        if (selected === i) return;
        selected = i;
        list.querySelectorAll("li").forEach((el, j) => el.classList.toggle("is-selected", j === selected));
      });
      list.appendChild(li);
    });
    const sel = list.querySelector(".is-selected");
    if (sel) sel.scrollIntoView({ block: "nearest" });
  }
  function open() {
    palette.hidden = false; document.body.classList.add("palette-open");
    if (lenis) lenis.stop();
    input.value = ""; filtered = items; selected = 0; render(); input.focus();
  }
  function close() { palette.hidden = true; document.body.classList.remove("palette-open"); if (lenis) lenis.start(); }
  function run(it) { close(); setTimeout(it.action, 60); }

  btn.addEventListener("click", open);
  backdrop.addEventListener("click", close);
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); palette.hidden ? open() : close(); }
    else if (e.key === "Escape" && !palette.hidden) close();
  });
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    filtered = items.filter((it) => it.label.toLowerCase().includes(q));
    selected = 0; render();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); selected = Math.min(selected + 1, filtered.length - 1); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); selected = Math.max(selected - 1, 0); render(); }
    else if (e.key === "Enter" && filtered[selected]) run(filtered[selected]);
  });
})();

// ===== Interactive terminal =====
(function terminalInit() {
  const terminal = document.getElementById("terminal");
  const termOut = document.getElementById("term-out");
  const termBody = document.getElementById("term-body");
  const termInput = document.getElementById("term-input");
  if (!terminal || !termInput) return;

  terminal.addEventListener("click", (e) => { if (!e.target.closest("a")) termInput.focus(); });

  const print = (text, cls = "t-out") => {
    const div = document.createElement("div");
    div.className = cls; div.textContent = text;
    termOut.appendChild(div);
  };
  const echo = (cmd) => {
    const div = document.createElement("div");
    const p = document.createElement("span"); p.className = "t-prompt"; p.textContent = "$";
    div.appendChild(p); div.appendChild(document.createTextNode(" " + cmd));
    termOut.appendChild(div);
  };

  const FENS = [
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR · the starting position",
    "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R · Italian Game",
    "rnbqkb1r/pp1p1ppp/4pn2/2p5/2P5/2N2N2/PP1PPPPP/R1BQKB1R · English-ish",
  ];

  const commands = {
    help: () => print("commands: whoami · experience · school · hobbies · sky · lumos · nox · puzzle · rating · projects · skills · fen · stats · gh · theme · clear · sudo hire-me"),
    whoami: () => print("vinisha · software dev @ eat together seattle · researcher · chess player (Legend league)"),
    experience: () => {
      document.querySelectorAll("#experience .move").forEach((m) => {
        const h = m.querySelector("h3"), d = m.querySelector(".date");
        if (h) print(`${m.querySelector(".move-no").textContent} ${h.textContent.replace(/\s+/g, " ")} (${d ? d.textContent : ""})`);
      });
    },
    school: () => print("M.S. Computational Linguistics @ UW Seattle (NLP + ML + AI) · B.S. CSSE + B.S. Math @ UW Bothell"),
    hobbies: () => print("chess · rereading harry potter · hiking rattlesnake ledge · road trips to bellingham + anacortes · watching the sky"),
    sky: () => { print("opening the live sky over seattle ☾"); goTo("#hobbies"); },
    lumos: () => { setTheme(false); print("✦ lumos. lights on."); },
    nox: () => { setTheme(true); print("☾ nox. lights out."); },
    puzzle: () => { print("white to play, mate in one ♟ scrolling to the board…"); goTo("#puzzle"); },
    rating: () => print("Chess.com · rapid ~1074 · blitz ~914 · bullet ~1208 · tactics peak 1603"),
    projects: () => { print("16 projects on the board above. king = Rta, queen = Big Back Bites, pawns = lab experiments."); print("↳ click any piece to read its story"); },
    skills: () => print("python · c/c++/c# · java · sql · js/ts · react · fastapi · tensorflow · aws · azure · copilot studio · power automate · docker"),
    fen: () => print(FENS[Math.floor(Math.random() * FENS.length)]),
    stats: () => {
      print("fetching live from chess.com…");
      fetch(`https://api.chess.com/pub/player/${CHESS_USER}/stats`)
        .then((r) => r.json())
        .then((d) => {
          const r = d.chess_rapid, b = d.chess_blitz, u = d.chess_bullet;
          if (r) print(`rapid ${r.last.rating} (best ${r.best.rating}) · ${r.record.win}W/${r.record.loss}L/${r.record.draw}D`);
          if (b) print(`blitz ${b.last.rating} (best ${b.best.rating})`);
          if (u) print(`bullet ${u.last.rating} (best ${u.best.rating})`);
          termBody.scrollTop = termBody.scrollHeight;
        })
        .catch(() => print("chess.com api unreachable, try again later"));
    },
    gh: () => { print("opening github.com/vinisha231 …"); window.open("https://github.com/vinisha231", "_blank"); },
    theme: () => { if (themeBtn) themeBtn.click(); print(document.documentElement.classList.contains("midnight") ? "♚ midnight board" : "♔ blush board"); },
    clear: () => { termOut.innerHTML = ""; },
    "sudo hire-me": () => { print("permission granted ♟ opening inbox…"); setTimeout(() => { window.location.href = "mailto:viba2022@gmail.com"; }, 600); },
  };

  termInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const cmd = termInput.value.trim();
    termInput.value = "";
    if (!cmd) return;
    echo(cmd);
    const fn = commands[cmd.toLowerCase()];
    if (fn) fn();
    else print(`command not found: ${cmd}, try \`help\``);
    termBody.scrollTop = termBody.scrollHeight;
  });
})();

// ===== Captured-piece particle burst =====
const PIECE_GLYPHS = ["♟", "♞", "♝", "♜", "♛", "♚"];
function makePiece(x, y) {
  const el = document.createElement("span");
  el.className = "cpiece";
  el.textContent = PIECE_GLYPHS[(Math.random() * PIECE_GLYPHS.length) | 0];
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.style.color = Math.random() < 0.5 ? "var(--purple-deep)" : "var(--pink)";
  document.body.appendChild(el);
  return el;
}
function pieceBurst(x, y, n = 7) {
  if (!hasGsap || prefersReduced) return;
  for (let i = 0; i < n; i++) {
    const el = makePiece(x, y);
    const angle = Math.random() * Math.PI * 2;
    const dist = 36 + Math.random() * 64;
    gsap.fromTo(el, { scale: 0.6, opacity: 1 }, {
      x: Math.cos(angle) * dist, y: Math.sin(angle) * dist + 26,
      rotation: gsap.utils.random(-180, 180), scale: gsap.utils.random(0.4, 1.05),
      opacity: 0, duration: gsap.utils.random(0.6, 1.1), ease: "power2.out",
      onComplete: () => el.remove(),
    });
  }
}
function pieceRain(count = 40) {
  if (!hasGsap || prefersReduced) return;
  for (let i = 0; i < count; i++) {
    const el = makePiece(Math.random() * window.innerWidth, -30);
    el.style.fontSize = gsap.utils.random(13, 26) + "px";
    gsap.to(el, {
      y: window.innerHeight + 80, x: "+=" + gsap.utils.random(-120, 120),
      rotation: gsap.utils.random(-360, 360), duration: gsap.utils.random(2.6, 5),
      delay: Math.random() * 0.8, ease: "power1.in", onComplete: () => el.remove(),
    });
  }
}
document.addEventListener("click", (e) => {
  if (e.target.closest(".palette-panel, .terminal, .piece-card, .piece, .nav, button, a, input")) return;
  pieceBurst(e.clientX, e.clientY);
});

// ===== Scroll choreography =====
if (hasGsap && !prefersReduced) {
  gsap.registerPlugin(ScrollTrigger);

  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  gsap.to(".progress-bar", {
    scaleX: 1, ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
  });

  gsap.from(".hero-line", { yPercent: 115, duration: 1.2, ease: "power4.out", stagger: 0.14, delay: 0.15 });
  gsap.from([".hero-eyebrow", ".hero-roles", ".hero-blurb", ".hero-actions", ".hero-stats", ".puzzle"], {
    y: 26, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, delay: 0.5,
  });
  gsap.to(".hero-inner", {
    yPercent: -10, autoAlpha: 0.3, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: true },
  });

  gsap.utils.toArray(".giant").forEach((el) => {
    gsap.fromTo(el, { xPercent: 6 }, {
      xPercent: -9, ease: "none",
      scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.from(el, {
      y: 52, autoAlpha: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  // chip pop-in
  gsap.utils.toArray(".skill-group").forEach((g) => {
    gsap.from(g.querySelectorAll(".chips span"), {
      scale: 0.5, autoAlpha: 0, duration: 0.5, ease: "back.out(2.2)", stagger: 0.02,
      scrollTrigger: { trigger: g, start: "top 85%" },
    });
  });

  // count-up
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    const proxy = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 92%", once: true,
      onEnter: () => gsap.to(proxy, { v: end, duration: 1.6, ease: "power2.out", onUpdate: () => { el.textContent = proxy.v.toFixed(dec); } }),
    });
  });

  // scramble section titles
  const SC = "♟♞♝♜♛♚*+";
  gsap.utils.toArray(".st-text").forEach((el) => {
    const original = el.textContent;
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => {
        let frame = 0; const total = 16;
        const timer = setInterval(() => {
          frame++;
          const settled = Math.floor((frame / total) * original.length);
          el.textContent = [...original].map((c, i) => (c === " " ? " " : i < settled ? c : SC[(Math.random() * SC.length) | 0])).join("");
          if (frame >= total) { clearInterval(timer); el.textContent = original; }
        }, 42);
      },
    });
  });
}

// ===== Pointer flourishes =====
if (finePointer) {
  // spotlight follow
  document.querySelectorAll(".spot").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  if (hasGsap) {
    // magnetic buttons
    document.querySelectorAll(".magnetic").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });

    // 3D tilt
    document.querySelectorAll(".rating-card, .edu-card, .skill-group").forEach((card) => {
      gsap.set(card, { transformPerspective: 900 });
      const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 7);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
      });
      card.addEventListener("mouseleave", () => { rx(0); ry(0); });
    });

    // trailing cursor
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (dot && ring) {
      document.body.classList.add("has-cursor");
      const dx = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
      const dy = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });
      const rxp = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
      const ryp = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
      window.addEventListener("mousemove", (e) => { dx(e.clientX); dy(e.clientY); rxp(e.clientX); ryp(e.clientY); });
      document.querySelectorAll("a, button, .piece, .rating-card, .card").forEach((el) => {
        el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
        el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
      });
    }
  }
}

// ===== Time-aware greeting =====
(function greeting() {
  const el = document.querySelector(".hero-eyebrow");
  if (!el) return;
  const h = new Date().getHours();
  const g = h < 5 ? "playing blitz at this hour? I'm" : h < 12 ? "good morning, I'm" : h < 18 ? "good afternoon, I'm" : "good evening, I'm";
  el.textContent = "♟ opening move · " + g;
})();

// ===== Brilliancy mode (Konami code) =====
function brilliancy() {
  showToast("✦✦ Brilliant!!");
  pieceRain(120);
  document.body.classList.add("brilliant");
  const banner = document.createElement("div");
  banner.className = "brilliant-banner";
  banner.innerHTML = "<b>Brilliant!!</b> ✦✦";
  document.body.appendChild(banner);
  if (hasGsap && !prefersReduced) {
    gsap.to(banner, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" });
    gsap.to(banner, { opacity: 0, scale: 1.2, duration: 0.5, delay: 2.2, ease: "power2.in", onComplete: () => banner.remove() });
  } else { setTimeout(() => banner.remove(), 2000); }
  setTimeout(() => document.body.classList.remove("brilliant"), 4000);
}
const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let kIdx = 0;
window.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  kIdx = key === KONAMI[kIdx] ? kIdx + 1 : key === KONAMI[0] ? 1 : 0;
  if (kIdx === KONAMI.length) { kIdx = 0; brilliancy(); }
});

// ===== Build project scenes + lab pawns =====
(function buildProjects() {
  const scenesEl = document.getElementById("scenes");
  const labEl = document.getElementById("lab-grid");
  if (!scenesEl || !labEl) return;

  const ROLE = { king: "King", queen: "Queen", rook: "Rook", bishop: "Bishop", knight: "Knight", pawn: "Pawn" };
  const PIECE_DEFS = '<defs><linearGradient id="iv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffefb"/><stop offset="0.42" stop-color="#f1e7d3"/><stop offset="0.76" stop-color="#dbc6a2"/><stop offset="1" stop-color="#b89e74"/></linearGradient><radialGradient id="hl" cx="0.35" cy="0.3" r="0.7"><stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>';
  const PIECE_BODY = {
    pawn: '<g transform="translate(0,8)" stroke="#5e4a2c" stroke-width="1.6" stroke-linejoin="round"> <ellipse cx="45" cy="96" rx="30" ry="5" fill="#000" opacity="0.22" stroke="none"/> <path d="M20 95 Q17 86 28 82 L62 82 Q73 86 70 95 Z" fill="url(#iv)"/> <rect x="26" y="74" width="38" height="9" rx="3.5" fill="url(#iv)"/> <path d="M34 73 Q31 58 38 50 L52 50 Q59 58 56 73 Z" fill="url(#iv)"/> <ellipse cx="45" cy="49" rx="11" ry="4" fill="url(#iv)"/> <circle cx="45" cy="34" r="12" fill="url(#iv)"/> <circle cx="41" cy="30" r="5" fill="url(#hl)" stroke="none"/> </g>',
    rook: '<g transform="translate(0,8)" stroke="#5e4a2c" stroke-width="1.6" stroke-linejoin="round"> <ellipse cx="45" cy="96" rx="31" ry="5" fill="#000" opacity="0.22" stroke="none"/> <path d="M18 95 Q15 86 27 82 L63 82 Q75 86 72 95 Z" fill="url(#iv)"/> <rect x="25" y="73" width="40" height="9" rx="3" fill="url(#iv)"/> <path d="M30 73 L28 50 L62 50 L60 73 Z" fill="url(#iv)"/> <path d="M26 50 L26 36 L33 36 L33 41 L41 41 L41 36 L49 36 L49 41 L57 41 L57 36 L64 36 L64 50 Z" fill="url(#iv)"/> <ellipse cx="40" cy="44" rx="5" ry="9" fill="url(#hl)" stroke="none"/> </g>',
    bishop: '<g transform="translate(0,8)" stroke="#5e4a2c" stroke-width="1.6" stroke-linejoin="round"> <ellipse cx="45" cy="96" rx="30" ry="5" fill="#000" opacity="0.22" stroke="none"/> <path d="M20 95 Q17 86 28 82 L62 82 Q73 86 70 95 Z" fill="url(#iv)"/> <rect x="27" y="72" width="36" height="9" rx="3.5" fill="url(#iv)"/> <path d="M33 72 Q29 60 35 52 L55 52 Q61 60 57 72 Z" fill="url(#iv)"/> <ellipse cx="45" cy="51" rx="12" ry="4" fill="url(#iv)"/> <path d="M45 16 C56 26 56 42 45 50 C34 42 34 26 45 16 Z" fill="url(#iv)"/> <path d="M45 22 L52 33" stroke="#5e4a2c" stroke-width="1.6" fill="none"/> <circle cx="45" cy="14" r="4" fill="url(#iv)"/> <ellipse cx="41" cy="30" rx="4" ry="8" fill="url(#hl)" stroke="none"/> </g>',
    knight: '<g transform="translate(0,8)" stroke="#5e4a2c" stroke-width="1.6" stroke-linejoin="round"> <ellipse cx="45" cy="96" rx="31" ry="5" fill="#000" opacity="0.22" stroke="none"/> <path d="M18 95 Q15 86 27 82 L63 82 Q75 86 72 95 Z" fill="url(#iv)"/> <rect x="25" y="73" width="40" height="9" rx="3" fill="url(#iv)"/> <path d="M30 73 Q30 64 34 60 L58 60 Q62 66 60 73 Z" fill="url(#iv)"/> <path d="M60 60 C62 48 60 36 52 28 C58 24 56 16 50 15 L47 21 C42 14 33 13 27 19 C22 24 19 31 15 35 C12 38 13 43 18 42 L27 39 C25 45 26 51 31 55 C37 59 42 56 46 60 Z" fill="url(#iv)"/> <circle cx="33" cy="27" r="2.4" fill="#000" stroke="none"/> <path d="M24 33 L31 31" stroke="#5e4a2c" stroke-width="1.4" fill="none"/> </g>',
    queen: '<g transform="translate(0,8)" stroke="#5e4a2c" stroke-width="1.6" stroke-linejoin="round"> <ellipse cx="45" cy="96" rx="32" ry="5" fill="#000" opacity="0.22" stroke="none"/> <path d="M16 95 Q13 86 26 82 L64 82 Q77 86 74 95 Z" fill="url(#iv)"/> <rect x="24" y="72" width="42" height="9" rx="3" fill="url(#iv)"/> <path d="M31 72 Q27 56 25 46 L65 46 Q63 56 59 72 Z" fill="url(#iv)"/> <ellipse cx="45" cy="46" rx="20" ry="4" fill="url(#iv)"/> <path d="M25 46 L22 22 L31 33 L38 18 L45 30 L52 18 L59 33 L68 22 L65 46 Z" fill="url(#iv)"/> <circle cx="22" cy="21" r="4" fill="url(#iv)"/> <circle cx="38" cy="16" r="4" fill="url(#iv)"/> <circle cx="45" cy="13" r="4.5" fill="url(#iv)"/> <circle cx="52" cy="16" r="4" fill="url(#iv)"/> <circle cx="68" cy="21" r="4" fill="url(#iv)"/> <ellipse cx="39" cy="40" rx="5" ry="8" fill="url(#hl)" stroke="none"/> </g>',
    king: '<g transform="translate(0,8)" stroke="#5e4a2c" stroke-width="1.6" stroke-linejoin="round"> <ellipse cx="45" cy="96" rx="32" ry="5" fill="#000" opacity="0.22" stroke="none"/> <path d="M16 95 Q13 86 26 82 L64 82 Q77 86 74 95 Z" fill="url(#iv)"/> <rect x="24" y="72" width="42" height="9" rx="3" fill="url(#iv)"/> <path d="M31 72 Q27 56 26 44 L64 44 Q63 56 59 72 Z" fill="url(#iv)"/> <ellipse cx="45" cy="44" rx="19" ry="4" fill="url(#iv)"/> <path d="M28 44 Q26 30 38 26 L52 26 Q64 30 62 44 Z" fill="url(#iv)"/> <rect x="41" y="6" width="8" height="20" rx="2" fill="url(#iv)"/> <rect x="34" y="12" width="22" height="7" rx="2" fill="url(#iv)"/> <ellipse cx="39" cy="38" rx="5" ry="7" fill="url(#hl)" stroke="none"/> </g>',
  };
  const pieceSvg = (type, cls = "piece-svg") => `<svg class="${cls}" viewBox="0 0 90 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${PIECE_DEFS}${PIECE_BODY[type]}</svg>`;

  const SCENES = [
    { piece: "queen", title: "Rta, AI Benefits Navigator", award: "2nd Place, AWS Hacks 2026",
      desc: "The most powerful piece on the board. An AI government benefits navigator: a 9 question intake checks 10+ programs against 2025 Federal Poverty data, then an AI Advocate drafts appeal letters, runs mock caseworker interviews, and helps with denials. Fully serverless, with 75+ language support.",
      chips: ["AWS Bedrock", "Lambda", "API Gateway", "Aurora", "Cognito", "Polly", "React"],
      links: [["view code", "https://github.com/vinisha231/AWS-Hacks-2026"]] },
    { piece: "bishop", title: "CT Reconstruction with CNNs", award: null,
      desc: "Precise and exact, like a bishop down a long diagonal. My undergraduate research on sparse view CT reconstruction using CNNs and SART to cut patient radiation exposure. PSNR 36.5 to 39.9 dB, SSIM 0.95 to 0.97, and writing to publish.",
      chips: ["Python", "TensorFlow", "NumPy", "OpenCV"],
      links: [["view code", "https://github.com/vinisha231/Computed_Tomography_Reconstruction_using_Convolutional_Neural_Networks"]] },
    { piece: "rook", title: "Interview Simulator Platform", award: "Live in production",
      desc: "A rook holds the line. A voice driven AI interview coach: Claude generates role specific questions and structured feedback, while Polly and Transcribe make every session fully conversational. Deployed on Elastic Beanstalk and Amplify with PostgreSQL on RDS.",
      chips: ["Python", "FastAPI", "PostgreSQL", "Claude", "Polly", "Transcribe"],
      links: [["live site", "https://vdhaya-interview-simulator.com"], ["view code", "https://github.com/vinisha231/Interview_simulator"]] },
    { piece: "king", title: "Big Back Bites", award: "1st Place, IxDA UWB Designathon 2026",
      desc: "The piece the whole game is built to protect. A food discovery app designed end to end in Figma, then built as a fully interactive TypeScript frontend. First place across every competing team.",
      chips: ["TypeScript", "Figma", "REST APIs", "Agile UX"],
      links: [["view code", "https://github.com/vinisha231/Big-Back-Bites"]] },
    { piece: "knight", title: "The Hollow Pact", award: null,
      desc: "Knights move in ways you do not expect, and so might your companion. An asymmetric AI co op adventure in Unity 6 where your party member has a hidden trust system and may be quietly plotting against you.",
      chips: ["Unity 6", "C#", "Companion AI"],
      links: [["view code", "https://github.com/vinisha231/The-Hollow-Pact-v2"]] },
    { piece: "bishop", black: true, title: "Atma Milan", award: null,
      desc: "The bishop moves on faith. A Vedic soul compatibility checker inspired by Hindu Jyotish astrology, bringing kundali matching to TypeScript.",
      chips: ["TypeScript", "Jyotish"],
      links: [["view code", "https://github.com/vinisha231/atma-milan"]] },
    { piece: "rook", black: true, title: "AML Detection System", award: null,
      desc: "Another rook on the board, built to defend. An anti money laundering toolkit with a synthetic typology generator, a rules engine, graph based scoring, and an analyst dashboard.",
      chips: ["Python", "Graph Analysis"],
      links: [["view code", "https://github.com/vinisha231/aml-detection"]] },
    { piece: "knight", black: true, title: "BridgeTales AI", award: null,
      desc: "Knights leap where others cannot. An interactive AI storybook with branching narratives, AI generated images, and speech, plus a Visa API integration for local business donations.",
      chips: ["AWS Bedrock", "React", "Node.js", "PostgreSQL"],
      links: [["view code", "https://github.com/HarshitaRag/BridgeTales-AI"]] },
  ];

  const LAB = [
    { title: "Burnlist", tag: "Spotify", desc: "A Spotify playlist that self destructs after one listen. Make someone a mix, and once they play it, it is gone.", chips: ["JavaScript", "Spotify API"], links: [["live", "https://vinisha231.github.io/Burnlist/"], ["code", "https://github.com/vinisha231/Burnlist"]] },
    { title: "Chess Analyzer", tag: "TypeScript", desc: "Naturally. A chess engine and analysis app with play versus computer across five difficulty levels and an analysis mode.", chips: ["TypeScript"], links: [["code", "https://github.com/vinisha231/chess-analyzer"]] },
    { title: "PipeLens", tag: "DevSecOps", desc: "An AI security auditor for Dockerfiles and CI/CD pipelines that catches misconfigurations before they ship.", chips: ["TypeScript", "Docker", "CI/CD"], links: [["code", "https://github.com/vinisha231/pipelens"]] },
    { title: "MercuryCI", tag: "Python", desc: "The emotionally aware, astrologically governed CI/CD pipeline. Deploys are blocked during Mercury retrograde, obviously.", chips: ["Python", "CI/CD"], links: [["code", "https://github.com/vinisha231/MercuryCI"]] },
    { title: "Lease Clause Decoder", tag: "LLM", desc: "AI that reads your lease and flags illegal clauses, landlord favoring terms, and negotiation openings before you sign.", chips: ["TypeScript", "LLM"], links: [["code", "https://github.com/vinisha231/lease-clause-decoder"]] },
    { title: "OpenMRS Contributions", tag: "Open source", desc: "Accessibility, TypeScript, and UX improvements to the OpenMRS patient chart used in global health clinics.", chips: ["TypeScript", "A11y"], links: [["code", "https://github.com/vinisha231/openmrs-patient-chart-improvements"]] },
    { title: "Spotify Playlist Generator", tag: "JavaScript", desc: "Generates playlists based on the weather and time of day. A rainy Tuesday evening has its own mood.", chips: ["JavaScript", "Spotify API"], links: [["code", "https://github.com/vinisha231/SpotifyPlaylistGenerator"]] },
    { title: "Conversation Starter", tag: "MVP", desc: "A small MVP for breaking the ice, with prompts that get people actually talking.", chips: ["JavaScript"], links: [["code", "https://github.com/vinisha231/conversation-starter"]] },
  ];

  const chipsHtml = (chips) => chips.map((c) => `<span>${c}</span>`).join("");
  const linksHtml = (links) => links.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${t} ↗</a>`).join("");

  // scenes
  SCENES.forEach((s, i) => {
    const scene = document.createElement("article");
    scene.className = "scene" + (i % 2 ? " flip" : "");
    scene.dataset.chips = s.chips.join("|");
    const pieceSrc = `assets/${s.black ? "black-" : ""}${s.piece}.png`;
    const art = `<div class="scene-art"><div class="scene-glow"></div><figure class="piece-photo"><img src="${pieceSrc}" alt="${s.title}, a ${s.black ? "black" : "white"} ${s.piece} chess piece" loading="lazy" /></figure></div>`;
    const body = `<div class="scene-body">
        <div class="scene-no">move ${String(i + 1).padStart(2, "0")}</div>
        <div class="scene-piece-name">${ROLE[s.piece]}</div>
        ${s.award ? `<div class="scene-award">${s.award}</div>` : ""}
        <h3 class="scene-title">${s.title}</h3>
        <p class="scene-desc">${s.desc}</p>
        <div class="chips">${chipsHtml(s.chips)}</div>
        <div class="scene-links">${linksHtml(s.links)}</div>
      </div>`;
    scene.innerHTML = art + body;
    scenesEl.appendChild(scene);
  });

  // lab pawns -> modal
  const modal = document.getElementById("piece-modal");
  function openLab(p) {
    document.getElementById("piece-card-glyph").innerHTML = `<img src="assets/pawn.png" alt="" style="width:46px;height:auto" />`;
    document.getElementById("piece-card-role").textContent = "Pawn, side quest";
    document.getElementById("piece-card-title").textContent = p.title;
    const award = document.getElementById("piece-card-award");
    award.hidden = true;
    document.getElementById("piece-card-desc").textContent = p.desc;
    const chipsEl = document.getElementById("piece-card-chips");
    chipsEl.innerHTML = chipsHtml(p.chips);
    document.getElementById("piece-card-links").innerHTML = linksHtml(p.links);
    modal.hidden = false;
    document.body.classList.add("modal-open");
    if (lenis) lenis.stop();
  }
  function closeLab() { modal.hidden = true; document.body.classList.remove("modal-open"); if (lenis) lenis.start(); }

  LAB.forEach((p) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "lab-pawn";
    card.dataset.chips = p.chips.join("|");
    card.innerHTML = `<img class="lab-pawn-img" src="assets/pawn.png" alt="" loading="lazy" /><span class="lab-pawn-title">${p.title}</span><span class="lab-pawn-tag">${p.tag}</span>`;
    card.addEventListener("click", () => openLab(p));
    labEl.appendChild(card);
  });

  document.getElementById("piece-card-close").addEventListener("click", closeLab);
  document.getElementById("piece-backdrop").addEventListener("click", closeLab);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeLab(); });
})();

// ===== Scene motion: pieces rotate clockwise as you scroll =====
if (hasGsap && !prefersReduced) {
  gsap.utils.toArray(".scene").forEach((scene) => {
    const dir = scene.classList.contains("flip") ? 44 : -44;
    gsap.from(scene.querySelector(".scene-body"), {
      x: dir, autoAlpha: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: scene, start: "top 68%" },
    });
    gsap.from(scene.querySelector(".scene-art"), {
      autoAlpha: 0, scale: 0.78, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: scene, start: "top 74%" },
    });
  });

  gsap.from("#lab-grid .lab-pawn", {
    y: 30, autoAlpha: 0, duration: 0.5, ease: "power2.out", stagger: 0.05,
    scrollTrigger: { trigger: "#lab-grid", start: "top 86%" },
  });

  ScrollTrigger.refresh();
}

// ===== Cursor wiring for dynamically built elements =====
if (finePointer) {
  const ring = document.querySelector(".cursor-ring");
  if (ring) {
    document.querySelectorAll("#scenes a, #lab-grid .lab-pawn, .piece-card a, .rating-card").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
    });
  }
}

// ===== Pieces: tilt on hover, grab and toss on drag =====
if (finePointer) {
  const clamp = (min, max, v) => Math.max(min, Math.min(max, v));
  document.querySelectorAll(".piece-photo").forEach((fig) => {
    const img = fig.querySelector("img");
    if (!img) return;
    let dragging = false, dx = 0, dy = 0, sx = 0, sy = 0, vx = 0, vy = 0, lx = 0, ly = 0, lt = 0;

    fig.addEventListener("pointermove", (e) => {
      const r = fig.getBoundingClientRect();
      if (dragging) {
        const now = performance.now(), dt = Math.max(now - lt, 1);
        vx = ((e.clientX - lx) / dt) * 1000; vy = ((e.clientY - ly) / dt) * 1000;
        lx = e.clientX; ly = e.clientY; lt = now;
        dx = e.clientX - sx; dy = e.clientY - sy;
        img.style.transform = `translate(${dx}px, ${dy}px) rotate(${clamp(-22, 22, vx / 45)}deg) scale(1.06)`;
      } else {
        const rx = (0.5 - (e.clientY - r.top) / r.height) * 14;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 14;
        img.style.transform = `perspective(720px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
      }
    });
    fig.addEventListener("pointerleave", () => { if (!dragging) img.style.transform = ""; });

    fig.addEventListener("pointerdown", (e) => {
      dragging = true; fig.classList.add("grabbing");
      sx = e.clientX - dx; sy = e.clientY - dy;
      lx = e.clientX; ly = e.clientY; lt = performance.now(); vx = vy = 0;
      try { fig.setPointerCapture(e.pointerId); } catch (err) {}
    });
    const release = () => {
      if (!dragging) return;
      dragging = false; fig.classList.remove("grabbing");
      if (Math.hypot(vx, vy) > 700 && typeof pieceBurst === "function") {
        const r = img.getBoundingClientRect();
        pieceBurst(r.left + r.width / 2, r.top + r.height / 2, 6);
      }
      if (hasGsap) {
        const o = { dx, dy };
        gsap.to(o, {
          dx: 0, dy: 0, duration: 1, ease: "elastic.out(1, 0.4)",
          onUpdate() { img.style.transform = `translate(${o.dx}px, ${o.dy}px) scale(1)`; },
          onComplete() { dx = dy = 0; img.style.transform = ""; },
        });
      } else { dx = dy = 0; img.style.transform = ""; }
    };
    fig.addEventListener("pointerup", release);
    fig.addEventListener("pointercancel", release);
  });
}

// ===== Self-playing game: a miniature that plays as you scroll =====
(function buildGame() {
  const board = document.getElementById("game-board");
  if (!board) return;
  const moveEl = document.getElementById("game-move");
  const noteEl = document.getElementById("game-note");
  const fillEl = document.getElementById("game-progress-fill");

  const GLYPH = { K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟" };
  const back = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  const START = [];
  for (let f = 0; f < 8; f++) {
    const file = String.fromCharCode(97 + f);
    START.push({ type: back[f], color: "w", sq: file + "1" });
    START.push({ type: "P", color: "w", sq: file + "2" });
    START.push({ type: "P", color: "b", sq: file + "7" });
    START.push({ type: back[f], color: "b", sq: file + "8" });
  }
  const MOVES = [
    ["e2","e4"],["e7","e5"],["g1","f3"],["d7","d6"],["f1","c4"],["c8","g4"],
    ["b1","c3"],["g7","g6"],["f3","e5"],["g4","d1"],["c4","f7"],["e8","e7"],["c3","d5"],
  ];
  const NOTES = [
    ['1. e4', 'King’s pawn, the classic opening.'],
    ['1… e5', 'Black answers symmetrically.'],
    ['2. Nf3', 'Developing and eyeing e5.'],
    ['2… d6', 'A solid but passive defense.'],
    ['3. Bc4', 'The bishop aims at f7, the weak point.'],
    ['3… Bg4', 'Pinning the knight to the queen.'],
    ['4. Nc3', 'Calmly developing.'],
    ['4… g6', 'A slip that loosens the king.'],
    ['5. Nxe5<span class="bang">!</span>', 'The sacrifice. The knight grabs the pawn and defies the pin.'],
    ['5… Bxd1<span class="blunder">??</span>', 'Black snatches the queen, and walks right into it.'],
    ['6. Bxf7<span class="bang">+</span>', 'Check. The trap snaps shut.'],
    ['6… Ke7', 'The only move, into the corner of the net.'],
    ['7. Nd5<span class="bang">#</span>', 'Checkmate, with a queen still down. Légal’s immortal trap.'],
  ];
  const N = MOVES.length;

  const pieces = START.map((p, i) => ({ id: i, type: p.type, color: p.color }));
  const cur = {};
  START.forEach((p, i) => { cur[p.sq] = i; });
  const snap = () => { const m = {}; pieces.forEach((p) => { m[p.id] = null; }); for (const sq in cur) m[cur[sq]] = sq; return m; };
  const stateSq = [snap()];
  const plies = [];
  MOVES.forEach(([from, to]) => {
    const moverId = cur[from];
    const capturedId = cur[to] != null ? cur[to] : null;
    plies.push({ moverId, from, to, capturedId });
    delete cur[from];
    cur[to] = moverId;
    stateSq.push(snap());
  });

  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    const s = document.createElement("div");
    s.className = "game-sq" + ((r + f) % 2 === 1 ? " dark" : "");
    s.style.left = f * 12.5 + "%";
    s.style.top = r * 12.5 + "%";
    board.appendChild(s);
  }
  const els = pieces.map((p) => {
    const el = document.createElement("div");
    el.className = "gp " + p.color;
    el.textContent = GLYPH[p.type];
    board.appendChild(el);
    return el;
  });

  const fileOf = (sq) => sq.charCodeAt(0) - 97;
  const rankOf = (sq) => +sq[1];
  const cell = () => board.clientWidth / 8;
  const xy = (sq) => { const c = cell(); return [fileOf(sq) * c, (8 - rankOf(sq)) * c]; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  let last = 0;
  function render(progress) {
    last = progress;
    const pp = clamp(progress, 0, 1) * N;
    let seg = Math.floor(pp), f = pp - seg;
    if (seg >= N) { seg = N - 1; f = 1; }
    const base = stateSq[seg];
    const ply = plies[seg];
    pieces.forEach((p) => {
      const el = els[p.id];
      if (p.id === ply.moverId) {
        const a = xy(ply.from), b = xy(ply.to);
        el.style.transform = `translate(${lerp(a[0], b[0], f)}px, ${lerp(a[1], b[1], f)}px)`;
        el.style.opacity = "1"; el.style.zIndex = "3";
      } else if (p.id === ply.capturedId) {
        const b = xy(ply.to);
        el.style.transform = `translate(${b[0]}px, ${b[1]}px) scale(${lerp(1, 0.4, f)})`;
        el.style.opacity = String(1 - f); el.style.zIndex = "1";
      } else {
        const sq = base[p.id];
        if (!sq) { el.style.opacity = "0"; return; }
        const c = xy(sq);
        el.style.transform = `translate(${c[0]}px, ${c[1]}px)`;
        el.style.opacity = "1"; el.style.zIndex = "2";
      }
    });
    const idx = Math.min(seg, N - 1);
    if (moveEl) moveEl.innerHTML = NOTES[idx][0];
    if (noteEl) noteEl.textContent = NOTES[idx][1] || "";
    if (fillEl) fillEl.style.width = clamp(progress, 0, 1) * 100 + "%";
  }

  render(0);

  if (hasGsap && !prefersReduced) {
    ScrollTrigger.create({
      trigger: "#game", start: "top top", end: "+=" + N * 150,
      pin: ".game-inner", scrub: 0.6, invalidateOnRefresh: true,
      onUpdate: (self) => render(self.progress),
    });
    ScrollTrigger.refresh();
  } else {
    render(1);
  }

  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => render(last), 150); });
})();

// ===== Playable puzzles: mate in one =====
(function puzzleInit() {
  const boardEl = document.getElementById("puzzle-board");
  if (!boardEl) return;
  const titleEl = document.getElementById("puzzle-title");
  const countEl = document.getElementById("puzzle-count");
  const statusEl = document.getElementById("puzzle-status");
  const scoreEl = document.getElementById("puzzle-score");
  const hintBtn = document.getElementById("puzzle-hint");
  const nextBtn = document.getElementById("puzzle-next");

  // legal moves and mating moves are precomputed, so no engine ships with the page
  const PUZZLES = [{"title":"Back-rank mate","tip":"The king is boxed in by its own pawns.","fen":"6k1/5ppp/8/8/8/8/5PPP/4R1K1","moves":{"f2":["f3","f4"],"g2":["g3","g4"],"h2":["h3","h4"],"e1":["e2","e3","e4","e5","e6","e7","e8","f1","d1","c1","b1","a1"],"g1":["h1","f1"]},"mates":["e1e8"],"san":"Re8#"},{"title":"Scholar's mate","tip":"f7 is only guarded by the king.","fen":"r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR","moves":{"h5":["g6","f7","h6","h7","h4","h3","g4","f3","e2","d1","g5","f5","e5"],"c4":["b5","a6","d5","e6","f7","d3","e2","f1","b3"],"a2":["a3","a4"],"b2":["b3","b4"],"c2":["c3"],"d2":["d3","d4"],"f2":["f3","f4"],"g2":["g3","g4"],"h2":["h3","h4"],"b1":["a3","c3"],"e1":["e2","f1","d1"],"g1":["e2","f3","h3"]},"mates":["h5f7"],"san":"Qxf7#"},{"title":"Smothered mate","tip":"A knight doesn't care who's in the way.","fen":"6rk/6pp/8/6N1/8/8/8/6K1","moves":{"g5":["e6","f7","h7","h3","f3","e4"],"g1":["f2","g2","h2","h1","f1"]},"mates":["g5f7"],"san":"Nf7#"},{"title":"Légal's mate","tip":"Down a queen, up a checkmate.","fen":"rn1q1bnr/ppp1kB1p/3p2p1/4N3/4P3/2N5/PPPP1PPP/R1BbK2R","moves":{"f7":["e8","g8","g6","e6","d5","c4","b3"],"e5":["c6","d7","g6","g4","f3","d3","c4"],"c3":["a4","b5","d5","e2","d1","b1"],"a2":["a3","a4"],"b2":["b3","b4"],"d2":["d3","d4"],"f2":["f3","f4"],"g2":["g3","g4"],"h2":["h3","h4"],"a1":["b1"],"e1":["f1","d1"],"h1":["g1","f1"]},"mates":["c3d5"],"san":"Nd5#"}];
  const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
  const NAME = { k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn" };

  let solved = new Set();
  try { solved = new Set(JSON.parse(localStorage.getItem("cpuzzles") || "[]")); } catch (e) {}
  let idx = PUZZLES.findIndex((_, i) => !solved.has(i));
  if (idx < 0) idx = 0;
  let pos = {}, sel = null, locked = false, hint = null, last = [], done = false;

  function parse(fen) {
    const m = {};
    fen.split("/").forEach((row, r) => {
      let f = 0;
      for (const ch of row) {
        if (/\d/.test(ch)) { f += +ch; continue; }
        m[String.fromCharCode(97 + f) + (8 - r)] = { c: ch === ch.toUpperCase() ? "w" : "b", t: ch.toLowerCase() };
        f++;
      }
    });
    return m;
  }

  const squares = {};
  for (let r = 8; r >= 1; r--) for (let f = 0; f < 8; f++) {
    const sq = String.fromCharCode(97 + f) + r;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pz-sq" + ((r + f) % 2 === 1 ? " dark" : "");
    b.addEventListener("click", () => onSquare(sq));
    boardEl.appendChild(b);
    squares[sq] = b;
  }

  function draw() {
    const p = PUZZLES[idx];
    const targets = sel ? p.moves[sel] || [] : [];
    for (const sq in squares) {
      const b = squares[sq], pc = pos[sq];
      b.innerHTML = pc ? `<span class="pz-piece ${pc.c}">${GLYPH[pc.t]}</span>` : "";
      b.setAttribute("aria-label", sq + (pc ? `, ${pc.c === "w" ? "white" : "black"} ${NAME[pc.t]}` : ""));
      b.classList.toggle("sel", sq === sel);
      b.classList.toggle("target", targets.includes(sq));
      b.classList.toggle("hint", sq === hint);
      b.classList.toggle("last", last.includes(sq));
      b.classList.toggle("mated", !!(done && pc && pc.c === "b" && pc.t === "k"));
      b.classList.toggle("movable", !locked && !!pc && pc.c === "w" && !!p.moves[sq]);
    }
    scoreEl.textContent = `solved ${solved.size}/${PUZZLES.length}`;
  }

  function load(i) {
    idx = i;
    const p = PUZZLES[idx];
    pos = parse(p.fen); sel = null; hint = null; last = []; locked = false; done = false;
    titleEl.textContent = p.title;
    countEl.textContent = `${idx + 1}/${PUZZLES.length}`;
    statusEl.textContent = "Find the checkmate. Tap a white piece, then a square.";
    statusEl.className = "puzzle-status";
    nextBtn.textContent = "Skip →";
    hintBtn.disabled = false;
    draw();
  }

  function onSquare(sq) {
    if (locked) return;
    const p = PUZZLES[idx];
    if (sel && (p.moves[sel] || []).includes(sq)) return tryMove(sel, sq);
    sel = pos[sq] && pos[sq].c === "w" && p.moves[sq] && sel !== sq ? sq : null;
    draw();
  }

  function tryMove(from, to) {
    const p = PUZZLES[idx];
    const before = Object.assign({}, pos);
    pos[to] = pos[from]; delete pos[from];
    sel = null; hint = null; last = [from, to]; locked = true;
    if (p.mates.includes(from + to)) {
      done = true;
      const first = !solved.has(idx);
      solved.add(idx);
      try { localStorage.setItem("cpuzzles", JSON.stringify([...solved])); } catch (e) {}
      statusEl.textContent = `${p.san} Checkmate! ${p.tip}`;
      statusEl.className = "puzzle-status ok";
      nextBtn.textContent = "Next puzzle →";
      hintBtn.disabled = true;
      draw();
      const r = squares[to].getBoundingClientRect();
      pieceBurst(r.left + r.width / 2, r.top + r.height / 2, 12);
      if (first && solved.size === PUZZLES.length) setTimeout(brilliancy, 500);
    } else {
      statusEl.textContent = "Legal, but the king escapes. Try again.";
      statusEl.className = "puzzle-status no";
      boardEl.classList.add("shake");
      draw();
      setTimeout(() => {
        boardEl.classList.remove("shake");
        pos = before; last = []; locked = false;
        draw();
      }, 800);
    }
  }

  hintBtn.addEventListener("click", () => {
    if (locked) return;
    const p = PUZZLES[idx];
    hint = p.mates[0].slice(0, 2); sel = null;
    statusEl.textContent = "Hint: " + p.tip;
    statusEl.className = "puzzle-status";
    draw();
  });
  nextBtn.addEventListener("click", () => load((idx + 1) % PUZZLES.length));

  load(idx);
})();

// ===== Experience move list: jump to a role, track the current one =====
(function moveListInit() {
  const nav = document.getElementById("move-list");
  const moves = [...document.querySelectorAll("#experience .move")];
  if (!nav || !moves.length) return;
  const btns = moves.map((m, i) => {
    const at = m.querySelector(".at");
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `<span class="ml-no">${i + 1}.</span> `;
    b.appendChild(document.createTextNode(at ? at.textContent.replace(/^[\s·]+/, "") : "role " + (i + 1)));
    b.addEventListener("click", () => {
      goTo(m);
      const card = m.querySelector(".card");
      card.classList.remove("flash");
      void card.offsetWidth;
      card.classList.add("flash");
    });
    nav.appendChild(b);
    return b;
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) btns.forEach((b, i) => b.classList.toggle("active", moves[i] === en.target));
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  moves.forEach((m) => io.observe(m));
})();

// ===== Skill highlight: tap a chip to light up where it was used =====
(function skillHighlightInit() {
  const pill = document.getElementById("skill-pill");
  const pillText = document.getElementById("skill-pill-text");
  if (!pill) return;
  const tokens = (s) => s.toLowerCase().split(/[\s/]+/).filter(Boolean);
  const subset = (a, b) => a.every((t) => b.includes(t));
  const matches = (skill, chip) => { const a = tokens(skill), b = tokens(chip); return subset(a, b) || subset(b, a); };
  const targets = () => [
    ...[...document.querySelectorAll("#experience .card")].map((el) => ({ el, kind: "role", chips: [...el.querySelectorAll(".chips span")].map((c) => c.textContent) })),
    ...[...document.querySelectorAll("#scenes .scene, #lab-grid .lab-pawn")].map((el) => ({ el, kind: "project", chips: (el.dataset.chips || "").split("|") })),
  ];
  let active = null, firstHit = null;

  function clear() {
    active = null; firstHit = null;
    document.body.classList.remove("skill-on");
    document.querySelectorAll(".skill-hit").forEach((el) => el.classList.remove("skill-hit"));
    document.querySelectorAll(".chips span.on").forEach((el) => el.classList.remove("on"));
    pill.hidden = true;
  }
  function apply(skill) {
    if (active && active.toLowerCase() === skill.toLowerCase()) return clear();
    clear();
    active = skill;
    let roles = 0, projects = 0;
    targets().forEach((t) => {
      if (!t.chips.some((c) => c && matches(skill, c))) return;
      t.el.classList.add("skill-hit");
      if (!firstHit) firstHit = t.el;
      t.kind === "role" ? roles++ : projects++;
    });
    document.querySelectorAll(".chips span").forEach((c) => c.classList.toggle("on", matches(skill, c.textContent)));
    document.body.classList.add("skill-on");
    const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
    pillText.textContent = roles + projects
      ? `♟ ${skill} · ${plural(roles, "role")} · ${plural(projects, "project")}`
      : `♟ ${skill} · in the toolbox, not on the board yet`;
    document.getElementById("skill-pill-jump").hidden = !firstHit;
    pill.hidden = false;
  }

  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".chips span");
    if (chip) apply(chip.textContent.trim());
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && active) clear();
    const chip = e.target.closest && e.target.closest(".chips span");
    if (chip && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); apply(chip.textContent.trim()); }
  });
  document.getElementById("skill-pill-clear").addEventListener("click", clear);
  document.getElementById("skill-pill-jump").addEventListener("click", () => { if (firstHit) goTo(firstHit); });
  document.querySelectorAll(".chips span").forEach((c) => { c.tabIndex = 0; c.setAttribute("role", "button"); });
})();

// ===== Keyboard shortcuts =====
window.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.closest && e.target.closest("input, textarea, [role=button]")) return;
  if (e.key === "?") showToast("⌨ e moves · p puzzle · s sky · t flip board · ⌘K menu");
  else if (e.key === "t") { if (themeBtn) themeBtn.click(); }
  else if (e.key === "p") goTo("#puzzle");
  else if (e.key === "e") goTo("#experience");
  else if (e.key === "s") goTo("#hobbies");
});

// ===== Live sky over Seattle: real sun, moon and star positions =====
(function skyInit() {
  const cv = document.getElementById("sky-canvas");
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext("2d");
  const $ = (id) => document.getElementById(id);
  const slider = $("sky-time"), nowBtn = $("sky-now"), tip = $("sky-tip");

  // <astro>
  const LAT = 47.6062, LNG = -122.3321, RAD = Math.PI / 180, OBL = RAD * 23.4397;
  const toDays = (ms) => ms / 86400000 - 10957.5; // days since J2000
  const eclToEq = (lon, lat) => ({
    ra: Math.atan2(Math.sin(lon) * Math.cos(OBL) - Math.tan(lat) * Math.sin(OBL), Math.cos(lon)),
    dec: Math.asin(Math.sin(lat) * Math.cos(OBL) + Math.cos(lat) * Math.sin(OBL) * Math.sin(lon)),
  });
  function horizon(d, ra, dec) {
    const H = RAD * (280.16 + 360.9856235 * d) + RAD * LNG - ra, phi = RAD * LAT;
    const alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
    const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
    return { alt: alt / RAD, az: ((az / RAD + 180) % 360 + 360) % 360 }; // azimuth clockwise from north
  }
  function sunEq(d) {
    const M = RAD * (357.5291 + 0.98560028 * d);
    const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    return eclToEq(M + C + RAD * 102.9372 + Math.PI, 0);
  }
  function moonEq(d) {
    const L = RAD * (218.316 + 13.176396 * d), M = RAD * (134.963 + 13.064993 * d), F = RAD * (93.272 + 13.22935 * d);
    const eq = eclToEq(L + RAD * 6.289 * Math.sin(M), RAD * 5.128 * Math.sin(F));
    eq.dist = 385001 - 20905 * Math.cos(M);
    return eq;
  }
  function moonPhase(d) {
    const s = sunEq(d), m = moonEq(d), sd = 149598000;
    const phi = Math.acos(Math.sin(s.dec) * Math.sin(m.dec) + Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra));
    const inc = Math.atan2(sd * Math.sin(phi), m.dist - sd * Math.cos(phi));
    const angle = Math.atan2(Math.cos(s.dec) * Math.sin(s.ra - m.ra), Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra));
    return { fraction: (1 + Math.cos(inc)) / 2, phase: 0.5 + (0.5 * inc * (angle < 0 ? -1 : 1)) / Math.PI };
  }
  const phaseName = (p) => ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"][
    p < 0.02 || p > 0.98 ? 0 : p < 0.23 ? 1 : p < 0.27 ? 2 : p < 0.48 ? 3 : p < 0.52 ? 4 : p < 0.73 ? 5 : p < 0.77 ? 6 : 7];
  const sunAlt = (ms) => { const d = toDays(ms), s = sunEq(d); return horizon(d, s.ra, s.dec).alt; };
  // first sunrise and sunset in the 24h after `start`
  function riseSet(start) {
    let rise = null, set = null, prev = sunAlt(start) + 0.833;
    for (let m = 1; m <= 1440; m++) {
      const cur = sunAlt(start + m * 60000) + 0.833;
      if (prev < 0 && cur >= 0 && rise == null) rise = start + m * 60000;
      if (prev >= 0 && cur < 0 && set == null) set = start + m * 60000;
      prev = cur;
    }
    return { rise, set };
  }
  // </astro>

  // [name, RA hours, Dec degrees, magnitude]
  const STARS = [
    ["Sirius", 6.752, -16.716, -1.46], ["Arcturus", 14.261, 19.182, -0.05], ["Vega", 18.616, 38.784, 0.03],
    ["Capella", 5.278, 45.998, 0.08], ["Rigel", 5.242, -8.202, 0.13], ["Procyon", 7.655, 5.225, 0.34],
    ["Betelgeuse", 5.919, 7.407, 0.42], ["Altair", 19.846, 8.868, 0.76], ["Aldebaran", 4.599, 16.509, 0.86],
    ["Spica", 13.42, -11.161, 0.97], ["Antares", 16.49, -26.432, 1.06], ["Pollux", 7.755, 28.026, 1.14],
    ["Fomalhaut", 22.961, -29.622, 1.16], ["Deneb", 20.69, 45.28, 1.25], ["Regulus", 10.139, 11.967, 1.35],
    ["Castor", 7.577, 31.888, 1.58], ["Bellatrix", 5.419, 6.35, 1.64], ["Alnilam", 5.604, -1.202, 1.69],
    ["Alnitak", 5.679, -1.943, 1.77], ["Mintaka", 5.533, -0.299, 2.23], ["Saiph", 5.796, -9.67, 2.06],
    ["Polaris", 2.53, 89.264, 1.98], ["Dubhe", 11.062, 61.751, 1.79], ["Merak", 11.031, 56.382, 2.37],
    ["Phecda", 11.897, 53.695, 2.44], ["Megrez", 12.257, 57.033, 3.31], ["Alioth", 12.9, 55.96, 1.77],
    ["Mizar", 13.399, 54.925, 2.27], ["Alkaid", 13.792, 49.313, 1.86], ["Caph", 0.153, 59.15, 2.27],
    ["Schedar", 0.675, 56.537, 2.23], ["Navi", 0.945, 60.717, 2.47], ["Ruchbah", 1.43, 60.235, 2.68], ["Segin", 1.907, 63.67, 3.37],
  ];
  const FIGURES = [
    ["Orion", ["Betelgeuse", "Bellatrix", "Mintaka", "Alnilam", "Alnitak", "Saiph", "Rigel", "Mintaka"], ["Betelgeuse", "Alnitak"]],
    ["Big Dipper", ["Alkaid", "Mizar", "Alioth", "Megrez", "Dubhe", "Merak", "Phecda", "Megrez"]],
    ["Cassiopeia", ["Caph", "Schedar", "Navi", "Ruchbah", "Segin"]],
    ["Summer Triangle", ["Vega", "Deneb", "Altair", "Vega"]],
    ["Gemini twins", ["Castor", "Pollux"]],
  ];
  const BELONGS = {};
  FIGURES.forEach(([name, ...chains]) => chains.forEach((c) => c.forEach((s) => { BELONGS[s] = BELONGS[s] || name; })));

  // faint backdrop stars, fixed on the celestial sphere so they rise and set with the named ones
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const DUST = Array.from({ length: 520 }, () => ({ ra: rnd() * 2 * Math.PI, dec: Math.asin(rnd() * 2 - 1), r: 0.5 + rnd() * 1.2, tw: rnd() * 6.28 }));

  const SKY = [ // sun altitude -> [top, bottom] colors
    [-18, [5, 7, 26], [20, 20, 51]], [-12, [11, 16, 48], [44, 36, 84]], [-6, [31, 36, 84], [128, 92, 142]],
    [0, [92, 110, 178], [247, 178, 160]], [6, [96, 152, 216], [226, 214, 226]], [14, [74, 144, 217], [191, 224, 245]],
  ];
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  function skyColors(alt) {
    if (alt <= SKY[0][0]) return [SKY[0][1], SKY[0][2]];
    for (let i = 1; i < SKY.length; i++) if (alt <= SKY[i][0]) {
      const t = (alt - SKY[i - 1][0]) / (SKY[i][0] - SKY[i - 1][0]);
      return [mix(SKY[i - 1][1], SKY[i][1], t), mix(SKY[i - 1][2], SKY[i][2], t)];
    }
    return [SKY[SKY.length - 1][1], SKY[SKY.length - 1][2]];
  }
  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  const TZ = "America/Los_Angeles", FOV = 190;
  const fmtTime = (ms) => new Date(ms).toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
  let offset = 0, look = 180, W = 0, H = 0, dpr = 1, hover = null, pinned = null, meteors = [], spots = [], inView = false, facts = { key: null };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const horizonY = () => H * 0.8;
  function place(p) { // alt/az -> canvas x,y (null when off screen)
    const dx = ((p.az - look + 540) % 360) - 180;
    if (Math.abs(dx) > FOV / 2 + 6) return null;
    return { x: W / 2 + (dx / FOV) * W, y: horizonY() - (p.alt / 90) * (horizonY() - 14) };
  }
  const ridge = (x, amp, f, ph) => amp * (0.55 + 0.25 * Math.sin(x * f + ph) + 0.14 * Math.sin(x * f * 2.3 + ph * 1.7) + 0.06 * Math.sin(x * f * 5.1 + ph));

  function drawMoon(x, y, r, p, dim) {
    ctx.save();
    const g = ctx.createRadialGradient(x, y, r, x, y, r * 4);
    g.addColorStop(0, `rgba(255,244,214,${0.28 * dim})`); g.addColorStop(1, "rgba(255,244,214,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, 6.2832); ctx.fill();
    ctx.fillStyle = "rgba(58,56,84,0.95)"; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    const k = Math.cos(2 * Math.PI * p), wax = p < 0.5;
    ctx.fillStyle = "#fbf3dc"; ctx.beginPath();
    if (wax) { ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2); ctx.ellipse(x, y, r * Math.abs(k), r, 0, Math.PI / 2, 1.5 * Math.PI, k > 0); }
    else { ctx.arc(x, y, r, Math.PI / 2, 1.5 * Math.PI); ctx.ellipse(x, y, r * Math.abs(k), r, 0, -Math.PI / 2, Math.PI / 2, k > 0); }
    ctx.fill(); ctx.restore();
  }

  function draw(now) {
    const ms = Date.now() + offset * 60000, d = toDays(ms);
    const sEq = sunEq(d), sun = horizon(d, sEq.ra, sEq.dec);
    const mEq = moonEq(d), moon = horizon(d, mEq.ra, mEq.dec), mp = moonPhase(d);
    const [top, bot] = skyColors(sun.alt), hy = horizonY();
    const night = Math.max(0, Math.min(1, (-sun.alt - 3) / 9)); // 0 by day, 1 once it is properly dark

    const g = ctx.createLinearGradient(0, 0, 0, hy);
    g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    spots = [];
    if (night > 0) {
      DUST.forEach((s) => {
        const p = horizon(d, s.ra, s.dec); if (p.alt < 1) return;
        const q = place(p); if (!q) return;
        const tw = prefersReduced ? 1 : 0.75 + 0.25 * Math.sin(now / 700 + s.tw);
        ctx.fillStyle = `rgba(255,255,255,${0.7 * night * tw})`;
        ctx.fillRect(q.x, q.y, s.r, s.r);
      });
      const pos = {};
      STARS.forEach(([name, ra, dec, mag]) => {
        const p = horizon(d, ra * 15 * RAD, dec * RAD); if (p.alt < 0.5) return;
        const q = place(p); if (q) pos[name] = Object.assign(q, { mag, alt: p.alt });
      });
      ctx.lineWidth = 1; ctx.strokeStyle = `rgba(214,190,255,${0.42 * night})`;
      FIGURES.forEach(([, ...chains]) => chains.forEach((c) => {
        for (let i = 1; i < c.length; i++) {
          const a = pos[c[i - 1]], b = pos[c[i]];
          if (!a || !b || Math.abs(a.x - b.x) > W / 2) continue;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }));
      for (const name in pos) {
        const q = pos[name], r = Math.max(1.1, 3.4 - q.mag * 0.75);
        const tw = prefersReduced ? 1 : 0.85 + 0.15 * Math.sin(now / 500 + q.x);
        ctx.fillStyle = `rgba(255,250,240,${night * tw})`;
        ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 6.2832); ctx.fill();
        spots.push({ x: q.x, y: q.y, label: BELONGS[name] ? `${name} · ${BELONGS[name]}` : name });
      }
    }
    const sp = place(sun);
    if (sp && sun.alt > -3) {
      const sg = ctx.createRadialGradient(sp.x, sp.y, 4, sp.x, sp.y, 90);
      sg.addColorStop(0, "rgba(255,246,214,1)"); sg.addColorStop(0.16, "rgba(255,226,160,0.9)"); sg.addColorStop(1, "rgba(255,200,150,0)");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sp.x, sp.y, 90, 0, 6.2832); ctx.fill();
      spots.push({ x: sp.x, y: sp.y, label: `Sun · ${sun.alt.toFixed(0)}° up` });
    }
    const mq = place(moon);
    if (mq && moon.alt > 0) {
      drawMoon(mq.x, mq.y, 13, mp.phase, 0.4 + 0.6 * night);
      spots.push({ x: mq.x, y: mq.y, label: `Moon · ${phaseName(mp.phase).toLowerCase()}, ${Math.round(mp.fraction * 100)}% lit` });
    }

    meteors = meteors.filter((m) => now - m.t < 700);
    meteors.forEach((m) => {
      const t = (now - m.t) / 700, x = m.x + m.dx * t, y = m.y + m.dy * t;
      const lg = ctx.createLinearGradient(x, y, x - m.dx * 0.25, y - m.dy * 0.25);
      lg.addColorStop(0, `rgba(255,255,255,${1 - t})`); lg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = lg; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - m.dx * 0.25, y - m.dy * 0.25); ctx.stroke();
    });

    // Cascades-style ridgelines, lit by the time of day
    const day = 1 - night;
    [[0.012, 1.3, 0.2, mix([34, 26, 58], [112, 122, 164], day)], [0.021, 4.1, 0.13, mix([18, 13, 34], [58, 72, 98], day)]].forEach(([f, ph, amp, col]) => {
      ctx.fillStyle = rgb(col); ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 6) ctx.lineTo(x, hy + H * 0.06 - ridge(x + look * (f * 90), H * amp, f, ph));
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    });
    ctx.font = "500 11px 'JetBrains Mono', monospace"; ctx.textAlign = "center"; ctx.fillStyle = "rgba(255,255,255,0.72)";
    ["N", "NE", "E", "SE", "S", "SW", "W", "NW"].forEach((c, i) => { const q = place({ az: i * 45, alt: 0 }); if (q) ctx.fillText(c, q.x, H - 10); });

    const lab = hover || pinned;
    if (lab) {
      ctx.font = "500 12px Inter, sans-serif";
      const w = ctx.measureText(lab.label).width + 16, x = Math.max(6, Math.min(W - w - 6, lab.x - w / 2)), y = Math.max(8, lab.y - 36);
      ctx.fillStyle = "rgba(20,14,34,0.86)"; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, 24, 8) : ctx.rect(x, y, w, 24); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.fillText(lab.label, x + 8, y + 16);
      ctx.strokeStyle = "rgba(244,166,202,0.95)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(lab.x, lab.y, 9, 0, 6.2832); ctx.stroke();
    }

    // readouts (recomputed when the minute or the sky changes)
    const key = Math.floor(ms / 60000);
    if (facts.key !== key) {
      facts.key = key;
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(ms);
      const n = (t) => +parts.find((p) => p.type === t).value;
      const midnight = ms - (((n("hour") % 24) * 60 + n("minute")) * 60 + n("second")) * 1000;
      if (facts.midnight == null || Math.abs(facts.midnight - midnight) > 60000) { facts.midnight = midnight; facts.rs = riseSet(midnight); }
      $("sky-clock").textContent = new Date(ms).toLocaleString("en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) + (offset ? "" : " · live");
      $("sky-title").textContent = offset ? (offset > 0 ? "The sky later" : "The sky earlier") : "The sky right now";
      $("sky-sun").textContent = sun.alt > 6 ? `Up, ${sun.alt.toFixed(0)}° high` : sun.alt > -0.833 ? "Golden hour" : sun.alt > -6 ? "Twilight" : sun.alt > -18 ? "Dusk glow" : "Down, fully dark";
      $("sky-rise").textContent = facts.rs.rise ? fmtTime(facts.rs.rise) : "—";
      $("sky-set").textContent = facts.rs.set ? fmtTime(facts.rs.set) : "—";
      $("sky-moon").textContent = `${phaseName(mp.phase)}, ${Math.round(mp.fraction * 100)}% lit${moon.alt > 0 ? "" : " (below horizon)"}`;
      const up = FIGURES.map(([name, c]) => { const st = STARS.find((s) => s[0] === c[0]); return [name, horizon(d, st[1] * 15 * RAD, st[2] * RAD).alt]; }).filter((f) => f[1] > 12).sort((a, b) => b[1] - a[1]);
      $("sky-look").textContent = night < 0.5 ? "Stars come out after dusk" : up.length ? up.slice(0, 2).map((f) => f[0]).join(" and ") : "Polaris, due north";
    }
  }

  let raf = 0;
  function loop(now) { draw(now); raf = inView && !prefersReduced ? requestAnimationFrame(loop) : 0; }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const redraw = () => { facts.key = null; if (prefersReduced || !inView) draw(performance.now()); else kick(); };

  const nearest = (x, y) => { let best = null, bd = 16; spots.forEach((s) => { const dd = Math.hypot(s.x - x, s.y - y); if (dd < bd) { bd = dd; best = s; } }); return best; };
  let drag = null;
  cv.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, look, moved: false }; try { cv.setPointerCapture(e.pointerId); } catch (err) {} });
  cv.addEventListener("pointermove", (e) => {
    const r = cv.getBoundingClientRect();
    if (drag) {
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      if (drag.moved) { look = ((drag.look - (dx / W) * FOV) % 360 + 360) % 360; pinned = null; hover = null; }
    } else { hover = nearest(e.clientX - r.left, e.clientY - r.top); cv.style.cursor = hover ? "pointer" : "grab"; }
    redraw();
  });
  cv.addEventListener("pointerup", (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (drag && !drag.moved) {
      const hit = nearest(x, y);
      if (hit) pinned = hit;
      else { pinned = null; if (!prefersReduced && y < horizonY()) meteors.push({ x, y, dx: 150 + Math.random() * 90, dy: 60 + Math.random() * 50, t: performance.now() }); }
    }
    drag = null; if (tip) tip.classList.add("gone"); redraw();
  });
  cv.addEventListener("pointerleave", () => { hover = null; redraw(); });
  cv.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") look = (look + 345) % 360; else if (e.key === "ArrowRight") look = (look + 15) % 360; else return;
    e.preventDefault(); e.stopPropagation(); redraw();
  });
  cv.tabIndex = 0;
  slider.addEventListener("input", () => { offset = +slider.value; pinned = null; redraw(); });
  nowBtn.addEventListener("click", () => { offset = 0; slider.value = 0; redraw(); });
  window.addEventListener("resize", () => { resize(); redraw(); });
  new IntersectionObserver((en) => { inView = en[0].isIntersecting; if (inView) { resize(); redraw(); } }).observe(cv);
  setInterval(() => { if (inView && prefersReduced) redraw(); }, 60000);
  resize(); draw(0);
})();

// ===== Bookshelf: Harry Potter, with spells that flip the theme =====
(function shelfInit() {
  const shelf = document.getElementById("shelf"), detail = document.getElementById("book-detail");
  if (!shelf || !detail) return;
  const BOOKS = [
    ["Sorcerer's Stone", 1997, "#8e3b46", 0.86, "Wizard's chess lives here. Ron's knight sacrifice is still the bravest move in the series."],
    ["Chamber of Secrets", 1998, "#3d6b5c", 0.9, "A diary that writes back. The original chatbot, and a reminder to check where the answers come from."],
    ["Prisoner of Azkaban", 1999, "#5a4a8a", 0.94, "Time travel done properly. Also a debugging lesson: go back and retrace every step."],
    ["Goblet of Fire", 2000, "#b0703a", 1, "A tournament arc with dragons, a lake and a maze. The stakes go up for good."],
    ["Order of the Phoenix", 2003, "#2f5d8a", 1, "The longest of the seven. Worth every page."],
    ["Half-Blood Prince", 2005, "#4f7a45", 0.95, "Always read the notes someone left in the margins."],
    ["Deathly Hallows", 2007, "#9c5a86", 0.98, "The endgame. Every piece set up over six books finally moves."],
  ];
  BOOKS.forEach(([title, year, color, h, note], i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "spine"; b.setAttribute("role", "listitem");
    b.style.setProperty("--spine", color); b.style.height = h * 100 + "%";
    b.innerHTML = `<span class="spine-no">${i + 1}</span><span class="spine-title">${title}</span>`;
    b.setAttribute("aria-label", `Book ${i + 1}: Harry Potter and the ${title}`);
    b.addEventListener("click", () => {
      shelf.querySelectorAll(".spine").forEach((s) => s.classList.toggle("out", s === b));
      detail.innerHTML = "";
      const n = document.createElement("p"); n.className = "book-name"; n.textContent = `${i + 1}. Harry Potter and the ${title} · ${year}`;
      const t = document.createElement("p"); t.className = "book-note"; t.textContent = note;
      detail.append(n, t);
    });
    shelf.appendChild(b);
  });
  const cast = (midnight, msg) => (e) => {
    setTheme(midnight); showToast(msg);
    const r = e.currentTarget.getBoundingClientRect();
    pieceBurst(r.left + r.width / 2, r.top + r.height / 2, 9);
  };
  document.getElementById("spell-lumos").addEventListener("click", cast(false, "✦ Lumos"));
  document.getElementById("spell-nox").addEventListener("click", cast(true, "☾ Nox"));
})();

// ===== Trips map: drive from Seattle, then scrub the Rattlesnake Ledge climb =====
(function tripsInit() {
  const svg = document.getElementById("trip-map"), info = document.getElementById("trip-info");
  if (!svg || !info) return;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, text) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (text) n.textContent = text; svg.appendChild(n); return n; };
  // real coordinates, flat-projected around 48°N
  const xy = (lon, lat) => [50 + ((lon + 123) / 1.5) * 189, 320 - ((lat - 47.3) / 1.6) * 300];
  const SEA = xy(-122.33, 47.61), EVERETT = xy(-122.2, 47.98), BURL = xy(-122.33, 48.47);
  const TRIPS = [
    { id: "rattlesnake", name: "Rattlesnake Ledge", kind: "hike", at: xy(-121.77, 47.43), via: [xy(-122.03, 47.53), xy(-121.79, 47.5)],
      stats: "about 35 mi from Seattle · 4 mi round trip · 1,160 ft of climbing", note: "My favorite. The ledge sits at 2,078 ft and the view from the top is awesome.", anchor: "middle", dx: -14, dy: 22 },
    { id: "bellingham", name: "Bellingham", kind: "road trip", at: xy(-122.48, 48.75), via: [EVERETT, BURL],
      stats: "about 90 mi north on I-5 · roughly 1.5 hours", note: "Straight up the coast, almost to the Canadian border.", anchor: "start", dx: 9 },
    { id: "anacortes", name: "Anacortes", kind: "road trip", at: xy(-122.61, 48.51), via: [EVERETT, BURL],
      stats: "about 80 mi · I-5, then west on Highway 20 · roughly 1.5 hours", note: "Out onto Fidalgo Island, where the ferries leave for the San Juans.", anchor: "end", dx: -9 },
  ];
  el("text", { x: 20, y: 205, class: "tm-region" }, "Puget Sound");
  el("text", { x: 228, y: 150, class: "tm-region" }, "Cascades");
  TRIPS.forEach((t) => { t.path = el("path", { d: "M" + [SEA, ...t.via, t.at].map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L"), class: "tm-route" }); });
  el("circle", { cx: SEA[0], cy: SEA[1], r: 5, class: "tm-home" });
  el("text", { x: SEA[0] - 9, y: SEA[1] + 4, class: "tm-label", "text-anchor": "end" }, "Seattle");
  TRIPS.forEach((t) => {
    t.pin = el("circle", { cx: t.at[0], cy: t.at[1], r: 7, class: "tm-pin", tabindex: 0, role: "button", "aria-label": `${t.name}, ${t.kind}` });
    el("text", { x: t.at[0] + t.dx, y: t.at[1] + (t.dy || 4), class: "tm-label", "text-anchor": t.anchor }, t.name);
    const go = () => select(t);
    t.pin.addEventListener("click", go);
    t.pin.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });
  const car = el("circle", { r: 4.5, class: "tm-car", cx: SEA[0], cy: SEA[1] });

  let anim = 0;
  function drive(path) {
    cancelAnimationFrame(anim);
    const len = path.getTotalLength(), t0 = performance.now();
    const put = (f) => { const p = path.getPointAtLength(len * f); car.setAttribute("cx", p.x); car.setAttribute("cy", p.y); };
    if (prefersReduced) return put(1);
    const step = (now) => { const f = Math.min(1, (now - t0) / 1500); put(1 - Math.pow(1 - f, 3)); if (f < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  }

  // approximate shape of the climb: 920 ft at the lake to 2,078 ft at the ledge, 2 miles one way
  const elev = (mi) => { const t = mi / 2; return 920 + 1158 * (0.25 * t + 0.75 * (t * t * (3 - 2 * t))); };
  function climbHtml() {
    const pts = []; for (let i = 0; i <= 40; i++) { const mi = i / 20; pts.push(`${(10 + mi * 140).toFixed(1)},${(84 - ((elev(mi) - 920) / 1158) * 64).toFixed(1)}`); }
    return `<div class="climb"><svg viewBox="0 0 300 96" aria-hidden="true"><path class="climb-fill" d="M10,84 L${pts.join(" L")} L290,84 Z"/><path class="climb-line" d="M${pts.join(" L")}"/><circle class="climb-dot" id="climb-dot" r="5" cx="10" cy="84"/></svg>
      <input type="range" id="climb-range" min="0" max="2" step="0.05" value="0" aria-label="Walk up the trail" />
      <p class="climb-read" id="climb-read"></p></div>`;
  }
  function wireClimb() {
    const range = document.getElementById("climb-range"), dot = document.getElementById("climb-dot"), read = document.getElementById("climb-read");
    const upd = () => {
      const mi = +range.value, ft = Math.round(elev(mi) / 10) * 10;
      dot.setAttribute("cx", 10 + mi * 140); dot.setAttribute("cy", 84 - ((elev(mi) - 920) / 1158) * 64);
      read.textContent = mi === 0 ? "Trailhead at Rattlesnake Lake. Drag to start climbing." : mi >= 2 ? "The ledge, 2,078 ft. The lake is straight down and the whole valley opens up." : `${mi.toFixed(1)} mi in · about ${ft.toLocaleString()} ft · ${Math.round(2078 - elev(mi)).toLocaleString()} ft to go`;
    };
    range.addEventListener("input", upd); upd();
  }

  function select(t, animate = true) {
    TRIPS.forEach((o) => { o.pin.classList.toggle("on", o === t); o.path.classList.toggle("on", o === t); });
    info.innerHTML = "";
    const k = document.createElement("p"); k.className = "trip-kind"; k.textContent = t.kind;
    const h = document.createElement("h4"); h.textContent = t.name;
    const s = document.createElement("p"); s.className = "trip-stats"; s.textContent = t.stats;
    const n = document.createElement("p"); n.className = "trip-note"; n.textContent = t.note;
    info.append(k, h, s, n);
    if (t.id === "rattlesnake") { info.insertAdjacentHTML("beforeend", climbHtml()); wireClimb(); }
    if (animate) drive(t.path); else { car.setAttribute("cx", t.at[0]); car.setAttribute("cy", t.at[1]); }
  }
  select(TRIPS[0], false);
})();
