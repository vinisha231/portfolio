const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
let lenis = null;

// ===== Footer year =====
document.getElementById("year").textContent = new Date().getFullYear();

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
  "problem solver.",
];
const typedEl = document.getElementById("typed");

if (prefersReduced) {
  typedEl.textContent = roles[0];
} else {
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;

  (function tick() {
    const word = roles[roleIdx];
    if (!deleting) {
      charIdx++;
      typedEl.textContent = word.slice(0, charIdx);
      if (charIdx === word.length) {
        deleting = true;
        return setTimeout(tick, 1800);
      }
      setTimeout(tick, 70);
    } else {
      charIdx--;
      typedEl.textContent = word.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        return setTimeout(tick, 350);
      }
      setTimeout(tick, 38);
    }
  })();
}

// ===== Active nav link =====
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
document.querySelectorAll("section[id]").forEach((s) => sectionObserver.observe(s));

// ===== Toast =====
const toastEl = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2200);
}

// ===== Time-aware greeting =====
const hour = new Date().getHours();
document.querySelector(".hero-eyebrow").textContent =
  "✿ " + (hour < 5 ? "up late? same — I'm" : hour < 12 ? "good morning, I'm" : hour < 18 ? "good afternoon, I'm" : "good evening, I'm");

// ===== Dusk mode =====
const themeBtn = document.getElementById("theme-btn");
function setTheme(dusk, announce = false) {
  document.documentElement.classList.toggle("dusk", dusk);
  themeBtn.textContent = dusk ? "☀" : "☾";
  try { localStorage.setItem("theme", dusk ? "dusk" : "dawn"); } catch (e) {}
  if (announce) showToast(dusk ? "☾ dusk mode on" : "☀ back to dawn");
}
themeBtn.textContent = document.documentElement.classList.contains("dusk") ? "☀" : "☾";
themeBtn.addEventListener("click", () => setTheme(!document.documentElement.classList.contains("dusk"), true));

// ===== Party mode (try the Konami code) =====
function partyMode() {
  showToast("✿ PARTY MODE ✿");
  petalRain(120);
  document.body.classList.add("party");
  setTimeout(() => document.body.classList.remove("party"), 6000);
}
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let konamiIdx = 0;
window.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  konamiIdx = key === KONAMI[konamiIdx] ? konamiIdx + 1 : key === KONAMI[0] ? 1 : 0;
  if (konamiIdx === KONAMI.length) {
    konamiIdx = 0;
    partyMode();
  }
});

// ===== Petals =====
const PETAL_COLORS = ["#ff7d5c", "#ffb3c7", "#b89cff", "#ff9b73"];

function makePetal(x, y) {
  const p = document.createElement("span");
  p.className = "petal";
  p.textContent = "✿";
  p.style.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
  p.style.left = x + "px";
  p.style.top = y + "px";
  document.body.appendChild(p);
  return p;
}

function petalBurst(x, y, n = 8) {
  if (!hasGsap || prefersReduced) return;
  for (let i = 0; i < n; i++) {
    const p = makePetal(x, y);
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 70;
    gsap.fromTo(p, { scale: 0.6, opacity: 1 }, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist + 24,
      rotation: gsap.utils.random(-180, 180),
      scale: gsap.utils.random(0.4, 1.1),
      opacity: 0,
      duration: gsap.utils.random(0.6, 1.1),
      ease: "power2.out",
      onComplete: () => p.remove(),
    });
  }
}

function petalRain(count = 44) {
  if (!hasGsap || prefersReduced) return;
  for (let i = 0; i < count; i++) {
    const p = makePetal(Math.random() * window.innerWidth, -30);
    p.style.fontSize = gsap.utils.random(11, 22) + "px";
    gsap.to(p, {
      y: window.innerHeight + 80,
      x: "+=" + gsap.utils.random(-130, 130),
      rotation: gsap.utils.random(-360, 360),
      duration: gsap.utils.random(2.6, 5.5),
      delay: Math.random() * 0.9,
      ease: "power1.in",
      onComplete: () => p.remove(),
    });
  }
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".palette-panel") || e.target.closest(".terminal")) return;
  petalBurst(e.clientX, e.clientY);
});

// ===== Interactive terminal =====
const terminal = document.getElementById("terminal");
const termOut = document.getElementById("term-out");
const termBody = document.getElementById("term-body");
const termInput = document.getElementById("term-input");

if (terminal && termInput) {
  terminal.addEventListener("click", () => termInput.focus());

  const print = (text, cls = "t-out") => {
    const div = document.createElement("div");
    div.className = cls;
    div.textContent = text;
    termOut.appendChild(div);
  };

  const echo = (cmd) => {
    const div = document.createElement("div");
    const prompt = document.createElement("span");
    prompt.className = "t-prompt";
    prompt.textContent = "$";
    div.appendChild(prompt);
    div.appendChild(document.createTextNode(" " + cmd));
    termOut.appendChild(div);
  };

  const commands = {
    help: () => print("commands: whoami · projects · skills · stats · contact · gh · theme · petals · party · clear · sudo hire-me"),
    stats: () => {
      print("fetching live from the github api…");
      fetch("https://api.github.com/users/vinisha231")
        .then((r) => r.json())
        .then((d) => {
          print(`public repos: ${d.public_repos} · followers: ${d.followers} · on github since ${new Date(d.created_at).getFullYear()}`);
          termBody.scrollTop = termBody.scrollHeight;
        })
        .catch(() => print("github api unreachable — try again later"));
    },
    theme: () => {
      themeBtn.click();
      print(document.documentElement.classList.contains("dusk") ? "☾ dusk mode on" : "☀ dawn mode on");
    },
    party: () => {
      print("✿ ✿ ✿");
      partyMode();
    },
    whoami: () => print("vinisha — engineer · researcher · builder"),
    projects: () => {
      print("rta · interview-simulator · big-back-bites · burnlist · the-hollow-pact · pipelens · mercuryci · aml-detection …");
      print("↳ see ‘Selected work’ and ‘The lab’ above, or run `gh`");
    },
    skills: () => print("python · c/c++/c# · java · sql · js/ts · react · fastapi · tensorflow · aws · azure · docker"),
    contact: () => print("viba2022@gmail.com · linkedin.com/in/vinishab · github.com/vinisha231"),
    gh: () => {
      print("opening github.com/vinisha231 …");
      window.open("https://github.com/vinisha231", "_blank");
    },
    petals: () => {
      if (!hasGsap || prefersReduced) return print("petals are napping (reduced motion is on) 🌙");
      print("✿ ✿ ✿");
      petalRain();
    },
    clear: () => { termOut.innerHTML = ""; },
    "sudo hire-me": () => {
      print("permission granted ✿ opening inbox…");
      setTimeout(() => { window.location.href = "mailto:viba2022@gmail.com"; }, 600);
    },
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
}

// ===== Command palette (⌘K) =====
const palette = document.getElementById("palette");
const paletteInput = document.getElementById("palette-input");
const paletteList = document.getElementById("palette-list");
const paletteBtn = document.getElementById("palette-btn");
const paletteBackdrop = document.getElementById("palette-backdrop");

const paletteItems = [
  { icon: "✿", label: "About me", hint: "01", action: () => goTo("#about") },
  { icon: "🔬", label: "Experience", hint: "02", action: () => goTo("#experience") },
  { icon: "🏆", label: "Selected work", hint: "03", action: () => goTo("#projects") },
  { icon: "🧪", label: "The lab", hint: "04", action: () => goTo("#lab") },
  { icon: "🧰", label: "Toolbox", hint: "05", action: () => goTo("#skills") },
  { icon: "🎓", label: "Education", hint: "06", action: () => goTo("#education") },
  { icon: "💌", label: "Contact", hint: "say hi", action: () => goTo("#contact") },
  { icon: "🐙", label: "GitHub", hint: "↗", action: () => window.open("https://github.com/vinisha231", "_blank") },
  { icon: "💼", label: "LinkedIn", hint: "↗", action: () => window.open("https://linkedin.com/in/vinishab", "_blank") },
  { icon: "✉️", label: "Email me", hint: "mailto", action: () => { window.location.href = "mailto:viba2022@gmail.com"; } },
  { icon: "🌗", label: "Toggle dusk mode", hint: "theme", action: () => themeBtn.click() },
  { icon: "🌸", label: "Make it rain petals", hint: "fun", action: () => petalRain(60) },
  { icon: "🎉", label: "Party mode", hint: "konami", action: partyMode },
];

let filtered = paletteItems;
let selected = 0;

function renderPalette() {
  paletteList.innerHTML = "";
  filtered.forEach((item, i) => {
    const li = document.createElement("li");
    if (i === selected) li.classList.add("is-selected");
    const icon = document.createElement("span");
    icon.className = "p-icon";
    icon.textContent = item.icon;
    const label = document.createElement("span");
    label.textContent = item.label;
    const hint = document.createElement("span");
    hint.className = "p-hint";
    hint.textContent = item.hint;
    li.append(icon, label, hint);
    li.addEventListener("click", () => runItem(item));
    li.addEventListener("mousemove", () => {
      if (selected === i) return;
      selected = i;
      paletteList.querySelectorAll("li").forEach((el, j) =>
        el.classList.toggle("is-selected", j === selected)
      );
    });
    paletteList.appendChild(li);
  });
  const sel = paletteList.querySelector(".is-selected");
  if (sel) sel.scrollIntoView({ block: "nearest" });
}

function openPalette() {
  palette.hidden = false;
  document.body.classList.add("palette-open");
  if (lenis) lenis.stop();
  paletteInput.value = "";
  filtered = paletteItems;
  selected = 0;
  renderPalette();
  paletteInput.focus();
}

function closePalette() {
  palette.hidden = true;
  document.body.classList.remove("palette-open");
  if (lenis) lenis.start();
}

function runItem(item) {
  closePalette();
  setTimeout(item.action, 60);
}

paletteBtn.addEventListener("click", openPalette);
paletteBackdrop.addEventListener("click", closePalette);

window.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    palette.hidden ? openPalette() : closePalette();
  } else if (e.key === "Escape" && !palette.hidden) {
    closePalette();
  }
});

paletteInput.addEventListener("input", () => {
  const q = paletteInput.value.trim().toLowerCase();
  filtered = paletteItems.filter((it) => it.label.toLowerCase().includes(q));
  selected = 0;
  renderPalette();
});

paletteInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    selected = Math.min(selected + 1, filtered.length - 1);
    renderPalette();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selected = Math.max(selected - 1, 0);
    renderPalette();
  } else if (e.key === "Enter" && filtered[selected]) {
    runItem(filtered[selected]);
  }
});

// ===== Spotlight follows the mouse on cards =====
if (finePointer) {
  document.querySelectorAll(".spot").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });
}

// ===== Scroll choreography (GSAP + Lenis) =====
if (hasGsap && !prefersReduced) {
  gsap.registerPlugin(ScrollTrigger);

  // Smooth inertia scrolling
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Scroll progress bar
  gsap.to(".progress-bar", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
  });

  // Hero entrance
  gsap.from(".hero-line", { yPercent: 115, duration: 1.2, ease: "power4.out", stagger: 0.14, delay: 0.15 });
  gsap.from([".hero-eyebrow", ".hero-roles", ".hero-blurb", ".hero-actions", ".hero-stats"], {
    y: 28, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, delay: 0.55,
  });

  // Hero name: split into letters that bounce on hover
  if (finePointer) {
    document.querySelectorAll(".hero-line").forEach((line) => {
      const frag = document.createDocumentFragment();
      const split = (text, grad) => {
        for (const ch of text) {
          if (ch === " ") {
            frag.appendChild(document.createTextNode(" "));
            continue;
          }
          const s = document.createElement("span");
          s.className = grad ? "ch grad" : "ch";
          s.textContent = ch;
          frag.appendChild(s);
        }
      };
      [...line.childNodes].forEach((node) => {
        split(node.textContent, node.nodeType === Node.ELEMENT_NODE);
      });
      line.innerHTML = "";
      line.appendChild(frag);
      line.querySelectorAll(".ch").forEach((chEl) => {
        chEl.addEventListener("mouseenter", () => {
          if (gsap.isTweening(chEl)) return;
          gsap.timeline()
            .to(chEl, { y: -16, rotation: gsap.utils.random(-10, 10), duration: 0.22, ease: "power2.out" })
            .to(chEl, { y: 0, rotation: 0, duration: 1, ease: "elastic.out(1, 0.35)" });
        });
      });
    });
  }

  // Hero drifts away as you scroll
  gsap.to(".hero-inner", {
    yPercent: -12, autoAlpha: 0.25, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: true },
  });

  // Pastel blobs parallax at different depths
  gsap.utils.toArray(".blob").forEach((blob, i) => {
    gsap.to(blob, {
      yPercent: (i + 1) * 16 * (i % 2 ? -1 : 1),
      ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1.2 },
    });
  });

  // Marquee reacts to scroll velocity (speeds up + flips direction)
  const marqueeTrack = document.querySelector(".marquee-track");
  if (marqueeTrack) {
    const loop = gsap.to(marqueeTrack, { xPercent: -50, ease: "none", duration: 16, repeat: -1 });
    ScrollTrigger.create({
      onUpdate(self) {
        const v = self.getVelocity();
        if (Math.abs(v) > 60) {
          loop.timeScale(gsap.utils.clamp(-5, 5, v / 220));
          gsap.to(loop, { timeScale: v < 0 ? -1 : 1, duration: 0.9, overwrite: true });
        }
      },
    });
  }

  // Giant outlined words drift sideways with scroll
  gsap.utils.toArray(".giant").forEach((el) => {
    gsap.fromTo(el, { xPercent: 7 }, {
      xPercent: -10, ease: "none",
      scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  // Generic reveals
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.from(el, {
      y: 56, autoAlpha: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" },
    });
  });

  // Timeline line draws itself as you scroll
  gsap.from(".timeline-line", {
    scaleY: 0, transformOrigin: "top center", ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 75%", end: "bottom 65%", scrub: 0.5 },
  });

  // Skill chips pop in
  gsap.utils.toArray(".skill-group").forEach((group) => {
    gsap.from(group.querySelectorAll(".chips span"), {
      scale: 0.5, autoAlpha: 0, duration: 0.5, ease: "back.out(2.2)", stagger: 0.022,
      scrollTrigger: { trigger: group, start: "top 85%" },
    });
  });

  // Stat counters
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    const proxy = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 92%", once: true,
      onEnter: () => {
        gsap.to(proxy, {
          v: end, duration: 1.8, ease: "power2.out",
          onUpdate: () => { el.textContent = proxy.v.toFixed(decimals); },
        });
      },
    });
  });

  // Section titles scramble into place
  const SCRAMBLE_CHARS = "✿*+~<>/-";
  gsap.utils.toArray(".st-text").forEach((el) => {
    const original = el.textContent;
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => {
        let frame = 0;
        const total = 16;
        const timer = setInterval(() => {
          frame++;
          const settled = Math.floor((frame / total) * original.length);
          el.textContent = [...original]
            .map((c, i) => (c === " " ? " " : i < settled ? c : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0]))
            .join("");
          if (frame >= total) {
            clearInterval(timer);
            el.textContent = original;
          }
        }, 42);
      },
    });
  });

  // Cards lean with scroll velocity
  const skewTargets = gsap.utils.toArray(".lab-card, .timeline-item .card");
  if (skewTargets.length) {
    const skewSetters = skewTargets.map((el) => gsap.quickSetter(el, "skewY", "deg"));
    const skewClamp = gsap.utils.clamp(-4, 4);
    const skewProxy = { v: 0 };
    ScrollTrigger.create({
      onUpdate(self) {
        const skew = skewClamp(self.getVelocity() / -500);
        if (Math.abs(skew) > Math.abs(skewProxy.v)) {
          skewProxy.v = skew;
          gsap.to(skewProxy, {
            v: 0, duration: 0.9, ease: "power3", overwrite: true,
            onUpdate: () => skewSetters.forEach((set) => set(skewProxy.v)),
          });
        }
      },
    });
  }

  // Nav flower spins as you scroll
  gsap.to(".logo-dot", {
    rotation: 1080, ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.6 },
  });

  // Pinned horizontal project gallery (desktop only)
  const mm = gsap.matchMedia();
  mm.add("(min-width: 900px)", () => {
    const track = document.querySelector(".work-track");
    const viewport = document.querySelector(".work-viewport");
    if (!track || !viewport) return;
    const amount = () => track.scrollWidth - viewport.clientWidth;
    gsap.to(track, {
      x: () => -amount(),
      ease: "none",
      scrollTrigger: {
        trigger: ".work",
        start: "top top",
        end: () => "+=" + amount(),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  });

  // Draggable hero stickers — grab and toss them
  if (finePointer) {
    document.querySelectorAll(".sticker").forEach((st) => {
      gsap.to(st, { y: "+=14", duration: gsap.utils.random(1.8, 2.8), ease: "sine.inOut", yoyo: true, repeat: -1 });
      let offsetX = 0, offsetY = 0, lastX = 0, lastY = 0, lastT = 0, vx = 0, vy = 0, dragging = false;
      st.addEventListener("pointerdown", (e) => {
        dragging = true;
        st.setPointerCapture(e.pointerId);
        gsap.killTweensOf(st);
        offsetX = e.clientX - gsap.getProperty(st, "x");
        offsetY = e.clientY - gsap.getProperty(st, "y");
        lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
        vx = 0; vy = 0;
      });
      st.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const now = performance.now();
        const dt = Math.max(now - lastT, 1);
        vx = ((e.clientX - lastX) / dt) * 1000;
        vy = ((e.clientY - lastY) / dt) * 1000;
        lastX = e.clientX; lastY = e.clientY; lastT = now;
        gsap.set(st, {
          x: e.clientX - offsetX,
          y: e.clientY - offsetY,
          rotation: gsap.utils.clamp(-24, 24, vx / 30),
        });
      });
      const release = () => {
        if (!dragging) return;
        dragging = false;
        gsap.to(st, {
          x: "+=" + gsap.utils.clamp(-260, 260, vx * 0.15),
          y: "+=" + gsap.utils.clamp(-260, 260, vy * 0.15),
          rotation: 0,
          duration: 0.9,
          ease: "power3.out",
        });
      };
      st.addEventListener("pointerup", release);
      st.addEventListener("pointercancel", release);
    });
  }

  // 3D tilt on cards (mouse only)
  if (finePointer) {
    document.querySelectorAll(".tilt").forEach((card) => {
      gsap.set(card, { transformPerspective: 900 });
      const rotX = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
      const rotY = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        rotY(((e.clientX - r.left) / r.width - 0.5) * 8);
        rotX(-((e.clientY - r.top) / r.height - 0.5) * 8);
      });
      card.addEventListener("mouseleave", () => { rotX(0); rotY(0); });
    });
  }

  // Magnetic buttons
  if (finePointer) {
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
  }

  // Trailing cursor
  if (finePointer) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (dot && ring) {
      document.body.classList.add("has-cursor");
      const dotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
      const dotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });
      const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
      const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
      window.addEventListener("mousemove", (e) => {
        dotX(e.clientX); dotY(e.clientY);
        ringX(e.clientX); ringY(e.clientY);
      });
      document.querySelectorAll("a, button, .tilt, .work-card").forEach((el) => {
        el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
        el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
      });
    }
  }
}
