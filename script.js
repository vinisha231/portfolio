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
