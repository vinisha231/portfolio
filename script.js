// ===== Typing effect =====
const roles = [
  "Software Engineer.",
  "ML Researcher.",
  "Full-Stack Developer.",
  "Hackathon Winner.",
  "Problem Solver.",
];

const typedEl = document.getElementById("typed");
let roleIdx = 0;
let charIdx = 0;
let deleting = false;

function tick() {
  const word = roles[roleIdx];

  if (!deleting) {
    charIdx++;
    typedEl.textContent = word.slice(0, charIdx);
    if (charIdx === word.length) {
      deleting = true;
      setTimeout(tick, 1800);
      return;
    }
    setTimeout(tick, 70);
  } else {
    charIdx--;
    typedEl.textContent = word.slice(0, charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      setTimeout(tick, 350);
      return;
    }
    setTimeout(tick, 38);
  }
}

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  typedEl.textContent = roles[0];
} else {
  tick();
}

// ===== Scroll reveal =====
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        navLinks.forEach((link) =>
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          )
        );
      }
    }
  },
  { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach((section) => sectionObserver.observe(section));

// ===== Footer year =====
document.getElementById("year").textContent = new Date().getFullYear();
