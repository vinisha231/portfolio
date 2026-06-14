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
