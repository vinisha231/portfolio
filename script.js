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

// ===== Theme: flip the board (ivory <-> midnight) =====
const themeBtn = document.getElementById("theme-btn");
function setTheme(midnight, announce = false) {
  document.documentElement.classList.toggle("midnight", midnight);
  if (themeBtn) themeBtn.textContent = midnight ? "☀" : "⛶";
  try { localStorage.setItem("ctheme", midnight ? "midnight" : "ivory"); } catch (e) {}
  if (announce) showToast(midnight ? "♚ midnight board" : "♔ ivory board");
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
      let totalGames = 0;
      document.querySelectorAll(".rating-card[data-mode]").forEach((card) => {
        const mode = d[card.dataset.mode];
        if (!mode) return;
        const rec = mode.record || {};
        const w = rec.win || 0, l = rec.loss || 0, dr = rec.draw || 0;
        const tot = w + l + dr || 1;
        totalGames += w + l + dr;
        const set = (sel, v) => { const el = card.querySelector(sel); if (el) el.textContent = v; };
        if (mode.last && mode.last.rating) set("[data-rating]", mode.last.rating);
        if (mode.best && mode.best.rating) set("[data-best]", mode.best.rating);
        set("[data-w]", w); set("[data-d]", dr); set("[data-l]", l);
        const bar = (sel, n) => { const el = card.querySelector(sel); if (el) el.style.width = (n / tot) * 100 + "%"; };
        bar("[data-w-bar]", w); bar("[data-d-bar]", dr); bar("[data-l-bar]", l);
      });

      if (d.tactics && d.tactics.highest) setText("[data-tactics]", d.tactics.highest.rating);
      if (d.puzzle_rush && d.puzzle_rush.best) setText("[data-puzzlerush]", d.puzzle_rush.best.score);
      setText("[data-total]", totalGames.toLocaleString());

      // Daily counts too
      ["chess_daily", "chess960_daily"].forEach((k) => {
        if (d[k] && d[k].record) {
          const r = d[k].record;
          totalGames += (r.win || 0) + (r.loss || 0) + (r.draw || 0);
        }
      });
      setText("[data-total]", totalGames.toLocaleString());
      if (foot) foot.textContent = "↻ live from Chess.com · @" + CHESS_USER;
    })
    .catch(() => {
      if (foot) foot.textContent = "showing my last-known stats · see live at chess.com/member/Vinu2023";
    });

  // League from profile
  fetch(`https://api.chess.com/pub/player/${CHESS_USER}`, { headers: { Accept: "application/json" } })
    .then((r) => r.ok ? r.json() : null)
    .then((p) => { if (p && p.league) setText("[data-league]", p.league); })
    .catch(() => {});
})();

// ===== Projects as chess pieces =====
(function buildBoard() {
  const board = document.getElementById("chessboard");
  if (!board) return;

  // role glyphs: white pieces sit on the back two ranks
  const G = { K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟" };
  const ROLE = { K: "King", Q: "Queen", R: "Rook", B: "Bishop", N: "Knight", P: "Pawn" };

  // Back rank (rank 8) in standard order, then pawn rank (rank 7)
  const PIECES = [
    { r: 0, c: 0, t: "R", title: "Interview Simulator", award: "● Live in production",
      desc: "A voice-driven AI interview coach — a fortress you can drill against. Claude generates role-specific questions and structured feedback; Polly and Transcribe make it fully conversational.",
      chips: ["Python", "FastAPI", "PostgreSQL", "Claude", "Polly", "Transcribe"],
      links: [["live site ↗", "https://vdhaya-interview-simulator.com"], ["code ↗", "https://github.com/vinisha231/Interview_simulator"]] },
    { r: 0, c: 1, t: "N", title: "The Hollow Pact", award: null,
      desc: "Knights are unpredictable — so is your companion. An asymmetric AI co-op adventure in Unity 6 where your party member's hidden trust system might be plotting against you.",
      chips: ["Unity 6", "C#", "Companion AI"],
      links: [["code ↗", "https://github.com/vinisha231/The-Hollow-Pact-v2"]] },
    { r: 0, c: 2, t: "B", title: "Atma Milan", award: null,
      desc: "The bishop moves on faith. A Vedic soul-compatibility checker inspired by Hindu Jyotish astrology — kundali matching, in TypeScript.",
      chips: ["TypeScript", "Jyotish"],
      links: [["code ↗", "https://github.com/vinisha231/atma-milan"]] },
    { r: 0, c: 3, t: "Q", title: "Big Back Bites", award: "🥇 1st Place · IxDA UWB Designathon 2026",
      desc: "The most powerful piece on the board. A food discovery app designed end-to-end in Figma, then built as a fully interactive TypeScript frontend — first place across all teams.",
      chips: ["TypeScript", "Figma", "REST APIs", "Agile UX"],
      links: [["code ↗", "https://github.com/vinisha231/Big-Back-Bites"]] },
    { r: 0, c: 4, t: "K", title: "Rta — AI Benefits Navigator", award: "🥈 2nd Place · AWS Hacks 2026",
      desc: "The piece you protect at all costs. An AI government-benefits navigator: a 9-question intake checks 10+ programs against 2025 Federal Poverty data, then an AI Advocate drafts letters, runs mock interviews, and helps with denials — fully serverless, 75+ languages.",
      chips: ["AWS Bedrock", "Lambda", "API Gateway", "Aurora", "Cognito", "Polly", "React"],
      links: [["code ↗", "https://github.com/vinisha231/AWS-Hacks-2026"]] },
    { r: 0, c: 5, t: "B", title: "CT Reconstruction with CNNs", award: null,
      desc: "Precise, diagonal, exact. My undergraduate research — sparse-view CT reconstruction using CNNs + SART to cut patient radiation exposure. PSNR 36.5–39.9 dB, SSIM 0.95–0.97. Writing to publish.",
      chips: ["Python", "TensorFlow", "NumPy", "OpenCV"],
      links: [["code ↗", "https://github.com/vinisha231/Computed_Tomography_Reconstruction_using_Convolutional_Neural_Networks"]] },
    { r: 0, c: 6, t: "N", title: "BridgeTales AI", award: null,
      desc: "Knights leap where others can't. An interactive AI storybook with branching narratives, AI-generated images, and speech — plus a Visa API integration for local-business donations.",
      chips: ["AWS Bedrock", "React", "Node.js", "PostgreSQL"],
      links: [["code ↗", "https://github.com/HarshitaRag/BridgeTales-AI"]] },
    { r: 0, c: 7, t: "R", title: "AML Detection System", award: null,
      desc: "A rook holds the line. An anti-money-laundering toolkit: synthetic typology generator, rules engine, graph-based scoring, and an analyst dashboard.",
      chips: ["Python", "Graph Analysis"],
      links: [["code ↗", "https://github.com/vinisha231/aml-detection"]] },
    // pawn rank — lab experiments
    { r: 1, c: 0, t: "P", title: "Burnlist", award: null,
      desc: "A Spotify playlist that self-destructs after one listen. Make someone a mix; once they play it, it's gone.",
      chips: ["JavaScript", "Spotify API"],
      links: [["live ↗", "https://vinisha231.github.io/Burnlist/"], ["code ↗", "https://github.com/vinisha231/Burnlist"]] },
    { r: 1, c: 1, t: "P", title: "Chess Analyzer", award: null,
      desc: "Naturally. A chess engine and analysis app — play vs computer across five difficulty levels (~800 to 2400+ Elo), with an analysis mode.",
      chips: ["TypeScript"],
      links: [["code ↗", "https://github.com/vinisha231/chess-analyzer"]] },
    { r: 1, c: 2, t: "P", title: "PipeLens", award: null,
      desc: "AI-powered security auditor for Dockerfiles and CI/CD pipelines — catches misconfigurations before they ship.",
      chips: ["TypeScript", "Docker", "CI/CD"],
      links: [["code ↗", "https://github.com/vinisha231/pipelens"]] },
    { r: 1, c: 3, t: "P", title: "MercuryCI", award: null,
      desc: "The emotionally aware, astrologically governed CI/CD pipeline. Deploys are blocked during Mercury retrograde. Obviously.",
      chips: ["Python", "CI/CD", "✨"],
      links: [["code ↗", "https://github.com/vinisha231/MercuryCI"]] },
    { r: 1, c: 4, t: "P", title: "Lease Clause Decoder", award: null,
      desc: "AI that reads your lease and flags illegal clauses, landlord-favoring terms, and negotiation openings before you sign.",
      chips: ["TypeScript", "LLM"],
      links: [["code ↗", "https://github.com/vinisha231/lease-clause-decoder"]] },
    { r: 1, c: 5, t: "P", title: "OpenMRS Contributions", award: null,
      desc: "Open-source accessibility, TypeScript, and UX improvements to the OpenMRS patient chart used in global-health clinics.",
      chips: ["TypeScript", "Open Source", "A11y"],
      links: [["code ↗", "https://github.com/vinisha231/openmrs-patient-chart-improvements"]] },
    { r: 1, c: 6, t: "P", title: "Spotify Playlist Generator", award: null,
      desc: "Generates playlists based on the weather and time of day. Rainy Tuesday evening? It's got a mood for that.",
      chips: ["JavaScript", "Spotify API"],
      links: [["code ↗", "https://github.com/vinisha231/SpotifyPlaylistGenerator"]] },
    { r: 1, c: 7, t: "P", title: "Conversation Starter", award: null,
      desc: "A small MVP for breaking the ice — prompts that get people actually talking.",
      chips: ["JavaScript"],
      links: [["code ↗", "https://github.com/vinisha231/conversation-starter"]] },
  ];

  const byPos = {};
  PIECES.forEach((p) => { byPos[p.r + "-" + p.c] = p; });

  // build 8x8
  const squares = [];
  for (let r = 0; r < 8; r++) {
    squares[r] = [];
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement("div");
      sq.className = "sq " + ((r + c) % 2 === 0 ? "light" : "dark");
      sq.dataset.r = r; sq.dataset.c = c;
      const p = byPos[r + "-" + c];
      if (p) {
        const btn = document.createElement("button");
        btn.className = "piece " + (p.t === "P" ? "pawn" : "major");
        btn.type = "button";
        btn.textContent = G[p.t];
        btn.setAttribute("aria-label", ROLE[p.t] + ": " + p.title);
        btn.setAttribute("role", "listitem");
        const tip = document.createElement("span");
        tip.className = "piece-tip";
        tip.textContent = p.title;
        btn.appendChild(tip);
        btn.addEventListener("mouseenter", () => showMoves(r, c, p.t));
        btn.addEventListener("mouseleave", clearMoves);
        btn.addEventListener("focus", () => showMoves(r, c, p.t));
        btn.addEventListener("blur", clearMoves);
        btn.addEventListener("click", () => openPiece(p));
        sq.appendChild(btn);
      }
      board.appendChild(sq);
      squares[r][c] = sq;
    }
  }

  // coordinate labels
  const ranks = document.getElementById("ranks");
  const files = document.getElementById("files");
  if (ranks) for (let i = 8; i >= 1; i--) { const s = document.createElement("span"); s.textContent = i; ranks.appendChild(s); }
  if (files) for (const f of "abcdefgh") { const s = document.createElement("span"); s.textContent = f; files.appendChild(s); }

  // legal-move dots (empty-board movement, clamped to edges)
  const inB = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  function moveTargets(r, c, t) {
    const out = [];
    const ray = (dr, dc) => { let nr = r + dr, nc = c + dc; while (inB(nr, nc)) { out.push([nr, nc]); nr += dr; nc += dc; } };
    if (t === "R" || t === "Q") [[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b]) => ray(a,b));
    if (t === "B" || t === "Q") [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,b]) => ray(a,b));
    if (t === "K") [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,b]) => { if (inB(r+a,c+b)) out.push([r+a,c+b]); });
    if (t === "N") [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([a,b]) => { if (inB(r+a,c+b)) out.push([r+a,c+b]); });
    if (t === "P") { if (inB(r+1,c)) out.push([r+1,c]); if (r === 1 && inB(r+2,c)) out.push([r+2,c]); }
    return out;
  }
  function showMoves(r, c, t) {
    if (!finePointer) return;
    squares[r][c].classList.add("lit");
    moveTargets(r, c, t).forEach(([nr, nc]) => squares[nr][nc].classList.add("dot"));
  }
  function clearMoves() {
    document.querySelectorAll(".sq.lit, .sq.dot").forEach((s) => s.classList.remove("lit", "dot"));
  }

  // modal
  const modal = document.getElementById("piece-modal");
  function openPiece(p) {
    document.getElementById("piece-card-glyph").textContent = G[p.t];
    document.getElementById("piece-card-role").textContent = ROLE[p.t] + (p.t === "P" ? " · side quest" : " · headline project");
    document.getElementById("piece-card-title").textContent = p.title;
    const award = document.getElementById("piece-card-award");
    if (p.award) { award.textContent = p.award; award.hidden = false; } else { award.hidden = true; }
    document.getElementById("piece-card-desc").textContent = p.desc;
    const chipsEl = document.getElementById("piece-card-chips");
    chipsEl.innerHTML = "";
    p.chips.forEach((ch) => { const s = document.createElement("span"); s.textContent = ch; chipsEl.appendChild(s); });
    const linksEl = document.getElementById("piece-card-links");
    linksEl.innerHTML = "";
    p.links.forEach(([label, url]) => {
      const a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener"; a.textContent = label;
      linksEl.appendChild(a);
    });
    modal.hidden = false;
    document.body.classList.add("modal-open");
    if (lenis) lenis.stop();
  }
  function closePiece() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lenis) lenis.start();
  }
  document.getElementById("piece-card-close").addEventListener("click", closePiece);
  document.getElementById("piece-backdrop").addEventListener("click", closePiece);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closePiece(); });
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
    { icon: "♟", label: "On the board (chess stats)", hint: "01", action: () => goTo("#chess") },
    { icon: "♜", label: "The board (projects)", hint: "02", action: () => goTo("#projects") },
    { icon: "♚", label: "The player (about)", hint: "03", action: () => goTo("#about") },
    { icon: "⏱", label: "The moves (experience)", hint: "04", action: () => goTo("#experience") },
    { icon: "⚔", label: "The arsenal (skills)", hint: "05", action: () => goTo("#skills") },
    { icon: "🎓", label: "Education", hint: "06", action: () => goTo("#education") },
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
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR — the starting position",
    "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R — Italian Game",
    "rnbqkb1r/pp1p1ppp/4pn2/2p5/2P5/2N2N2/PP1PPPPP/R1BQKB1R — English-ish",
  ];

  const commands = {
    help: () => print("commands: whoami · rating · projects · skills · fen · stats · gh · theme · clear · sudo hire-me"),
    whoami: () => print("vinisha — engineer · researcher · chess player (Legend league)"),
    rating: () => print("Chess.com — rapid ~1074 · blitz ~914 · bullet ~1208 · tactics best 1603"),
    projects: () => { print("16 projects on the board above — king = Rta, queen = Big Back Bites, pawns = lab experiments."); print("↳ click any piece to read its story"); },
    skills: () => print("python · c/c++/c# · java · sql · js/ts · react · fastapi · tensorflow · aws · azure · docker"),
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
        .catch(() => print("chess.com api unreachable — try again later"));
    },
    gh: () => { print("opening github.com/vinisha231 …"); window.open("https://github.com/vinisha231", "_blank"); },
    theme: () => { if (themeBtn) themeBtn.click(); print(document.documentElement.classList.contains("midnight") ? "♚ midnight board" : "♔ ivory board"); },
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
    else print(`command not found: ${cmd} — try \`help\``);
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
  el.style.color = Math.random() < 0.5 ? "var(--green-deep)" : "var(--gold)";
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
  gsap.from([".hero-eyebrow", ".hero-roles", ".hero-blurb", ".hero-actions", ".hero-stats"], {
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

  // board entrance: pieces drop in rank by rank
  ScrollTrigger.create({
    trigger: "#chessboard", start: "top 78%", once: true,
    onEnter: () => gsap.from("#chessboard .piece", { y: -40, autoAlpha: 0, duration: 0.5, ease: "back.out(1.7)", stagger: { each: 0.03, from: "center" } }),
  });
}
