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
  if (!dusk && window.exitSkyEdit) window.exitSkyEdit();
  if (window.renderSky) window.renderSky();
  if (announce) showToast(dusk ? "☾ welcome to the night sky" : "☀ back to dawn");
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
  if (document.body.classList.contains("sky-editing")) return;
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
    help: () => print("commands: whoami · projects · skills · stats · contact · gh · theme · sky · constellations · petals · party · clear · sudo hire-me"),
    constellations: () => {
      print("orion → rta · ursa major → big back bites · cassiopeia → interview simulator · cygnus → the hollow pact · lyra → burnlist · gemini → atma milan · scorpius → aml detection");
      print("↳ in night mode, click a constellation to open its project");
    },
    sky: () => {
      print("✎ opening the sky editor — go draw your constellation");
      if (window.enterSkyEdit) window.enterSkyEdit();
    },
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
  { icon: "🌗", label: "Toggle night / dawn", hint: "theme", action: () => themeBtn.click() },
  { icon: "🌌", label: "Edit the night sky", hint: "✎", action: () => window.enterSkyEdit && window.enterSkyEdit() },
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

// ===== Night sky: real constellations mapped to projects =====
const skyCanvas = document.getElementById("sky");
if (skyCanvas) {
  const ctx = skyCanvas.getContext("2d");
  const skyEditBtn = document.getElementById("sky-edit-btn");
  const starModal = document.getElementById("star-modal");
  const isDusk = () => document.documentElement.classList.contains("dusk");

  let W = 0, H = 0;
  let bgStars = [];
  let editing = false;
  let selected = -1;
  let hovered = -1;
  let hoveredConst = -1;
  let shooting = null;
  let lastShot = 0;
  const staticLayer = document.createElement("canvas");

  // Real constellations (stick figures, local 0..1 coords), each holding a project.
  // anchor: normalized screen position of the figure's top-left; scale: vs min(W,H).
  const CONSTELLATIONS = [
    {
      name: "Orion", myth: "the hunter", anchor: [0.05, 0.45], scale: 0.3, bright: [0, 6],
      stars: [[0.62, 0.18], [0.28, 0.22], [0.52, 0.5], [0.45, 0.53], [0.38, 0.56], [0.58, 0.85], [0.25, 0.88]],
      edges: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [5, 6]],
      project: {
        title: "Rta — AI Benefits Navigator",
        desc: "Orion hunts; Rta navigates. A multilingual AI benefits navigator built from scratch in 48 hours — 2nd place at AWS Hacks 2026, serverless on AWS Bedrock and Lambda.",
        links: [["view code ↗", "https://github.com/vinisha231/AWS-Hacks-2026"]],
      },
    },
    {
      name: "Ursa Major", myth: "the great bear", anchor: [0.55, 0.08], scale: 0.32, bright: [0],
      stars: [[0.2, 0.2], [0.22, 0.45], [0.45, 0.48], [0.42, 0.24], [0.6, 0.28], [0.76, 0.36], [0.95, 0.5]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
      project: {
        title: "Big Back Bites",
        desc: "A big appetite deserves a great bear. Food discovery app designed in Figma and built in TypeScript — 1st place at the IxDA UWB Designathon 2026.",
        links: [["view code ↗", "https://github.com/vinisha231/Big-Back-Bites"]],
      },
    },
    {
      name: "Cassiopeia", myth: "the queen", anchor: [0.3, 0.05], scale: 0.2, bright: [2],
      stars: [[0.05, 0.35], [0.25, 0.6], [0.5, 0.3], [0.75, 0.55], [0.95, 0.25]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
      project: {
        title: "Interview Simulator Platform",
        desc: "Practice answering to the throne. A voice-driven AI interview coach — Claude-generated questions and feedback with Polly and Transcribe, live in production.",
        links: [["live site ↗", "https://vdhaya-interview-simulator.com"], ["view code ↗", "https://github.com/vinisha231/Interview_simulator"]],
      },
    },
    {
      name: "Cygnus", myth: "the swan", anchor: [0.8, 0.36], scale: 0.26, bright: [0],
      stars: [[0.5, 0.08], [0.5, 0.45], [0.5, 0.95], [0.12, 0.32], [0.88, 0.6]],
      edges: [[0, 1], [1, 2], [3, 1], [1, 4]],
      project: {
        title: "The Hollow Pact",
        desc: "A graceful companion — but is it loyal? An asymmetric AI co-op adventure rebuilt in Unity 6, where your party member's hidden trust system decides your fate.",
        links: [["view code ↗", "https://github.com/vinisha231/The-Hollow-Pact-v2"]],
      },
    },
    {
      name: "Lyra", myth: "the lyre", anchor: [0.68, 0.72], scale: 0.16, bright: [0],
      stars: [[0.35, 0.08], [0.45, 0.3], [0.7, 0.42], [0.55, 0.75], [0.78, 0.78]],
      edges: [[0, 1], [1, 2], [2, 4], [4, 3], [3, 1]],
      project: {
        title: "Burnlist",
        desc: "A song for the lyre, played only once. A Spotify playlist that self-destructs after one listen — make someone a mix and let it vanish.",
        links: [["live site ↗", "https://vinisha231.github.io/Burnlist/"], ["view code ↗", "https://github.com/vinisha231/Burnlist"]],
      },
    },
    {
      name: "Gemini", myth: "the twins", anchor: [0.04, 0.07], scale: 0.28, bright: [0, 4],
      stars: [[0.3, 0.08], [0.28, 0.38], [0.22, 0.68], [0.14, 0.95], [0.62, 0.15], [0.6, 0.45], [0.68, 0.72], [0.6, 0.97]],
      edges: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [1, 5]],
      project: {
        title: "Atma Milan",
        desc: "Twin souls, matched in the stars. A Vedic soul-compatibility checker inspired by Hindu Jyotish astrology — kundali matching in TypeScript.",
        links: [["view code ↗", "https://github.com/vinisha231/atma-milan"]],
      },
    },
    {
      name: "Scorpius", myth: "the scorpion", anchor: [0.36, 0.58], scale: 0.3, bright: [4],
      stars: [[0.1, 0.1], [0.05, 0.3], [0.12, 0.45], [0.25, 0.3], [0.38, 0.42], [0.45, 0.6], [0.5, 0.8], [0.62, 0.92], [0.78, 0.88], [0.85, 0.75]],
      edges: [[0, 3], [1, 3], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]],
      project: {
        title: "AML Detection System",
        desc: "Built to catch what stings. An anti-money-laundering toolkit: synthetic typology generator, rules engine, graph-based scoring, and an analyst dashboard.",
        links: [["view code ↗", "https://github.com/vinisha231/aml-detection"]],
      },
    },
  ];

  // User-drawn layer
  let custom = null;
  try { custom = JSON.parse(localStorage.getItem("skyCustom")); } catch (e) {}
  if (!custom || !Array.isArray(custom.stars) || !Array.isArray(custom.edges)) custom = { stars: [], edges: [] };
  const saveSky = () => {
    try { localStorage.setItem("skyCustom", JSON.stringify(custom)); } catch (e) {}
  };

  function constPoints(c) {
    const S = c.scale * Math.min(W, H);
    const ax = Math.max(8, Math.min(c.anchor[0] * W, W - S - 12));
    const ay = Math.max(8, Math.min(c.anchor[1] * H, H - S - 12));
    return c.stars.map(([lx, ly]) => [ax + lx * S, ay + ly * S]);
  }

  function distToSeg(px, py, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy || 1;
    let t = ((px - a[0]) * dx + (py - a[1]) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (a[0] + t * dx), py - (a[1] + t * dy));
  }

  function constellationAt(px, py) {
    for (let ci = 0; ci < CONSTELLATIONS.length; ci++) {
      const c = CONSTELLATIONS[ci];
      const pts = constPoints(c);
      for (const p of pts) {
        if (Math.hypot(p[0] - px, p[1] - py) < 26) return ci;
      }
      for (const [a, b] of c.edges) {
        if (distToSeg(px, py, pts[a], pts[b]) < 11) return ci;
      }
    }
    return -1;
  }

  // Milky way band + nebulae, repainted on resize only
  function paintStatic() {
    staticLayer.width = W;
    staticLayer.height = H;
    const c2 = staticLayer.getContext("2d");
    c2.clearRect(0, 0, W, H);
    const nebulae = [
      [0.22, 0.3, 0.24, "124, 108, 255"],
      [0.74, 0.52, 0.26, "76, 140, 200"],
      [0.5, 0.85, 0.2, "200, 100, 160"],
    ];
    for (const [nx, ny, nr, rgb] of nebulae) {
      const r = nr * Math.max(W, H);
      const g = c2.createRadialGradient(nx * W, ny * H, 0, nx * W, ny * H, r);
      g.addColorStop(0, `rgba(${rgb}, 0.09)`);
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      c2.fillStyle = g;
      c2.fillRect(0, 0, W, H);
    }
    const len = Math.hypot(W, H);
    c2.save();
    c2.translate(W * 0.5, H * 0.42);
    c2.rotate(-0.5);
    const band = c2.createLinearGradient(0, -H * 0.16, 0, H * 0.16);
    band.addColorStop(0, "rgba(180, 190, 255, 0)");
    band.addColorStop(0.5, "rgba(180, 190, 255, 0.055)");
    band.addColorStop(1, "rgba(180, 190, 255, 0)");
    c2.fillStyle = band;
    c2.fillRect(-len / 2, -H * 0.16, len, H * 0.32);
    for (let i = 0; i < 420; i++) {
      const x = (Math.random() - 0.5) * len;
      const y = (Math.random() + Math.random() + Math.random() - 1.5) * H * 0.09;
      c2.globalAlpha = 0.04 + Math.random() * 0.12;
      c2.fillStyle = Math.random() < 0.8 ? "#cdd5ff" : "#ffe9c9";
      c2.beginPath();
      c2.arc(x, y, Math.random() * 0.9 + 0.3, 0, Math.PI * 2);
      c2.fill();
    }
    c2.restore();
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    skyCanvas.width = W * dpr;
    skyCanvas.height = H * dpr;
    skyCanvas.style.width = W + "px";
    skyCanvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(260, Math.floor((W * H) / 9000));
    bgStars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      color: Math.random() < 0.12 ? "#ffe9c9" : Math.random() < 0.5 ? "#dfe4ff" : "#cfe6ff",
      bright: Math.random() < 0.04,
    }));
    paintStatic();
    if (prefersReduced) render(0);
  }

  function flare(x, y, r, alpha) {
    ctx.strokeStyle = `rgba(242, 239, 255, ${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x - r, y); ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r); ctx.lineTo(x, y + r);
    ctx.stroke();
  }

  function render(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(staticLayer, 0, 0, W, H);
    if (editing) {
      ctx.fillStyle = "rgba(7, 10, 26, 0.86)";
      ctx.fillRect(0, 0, W, H);
    }

    // Background stars with scroll parallax
    const off = (window.scrollY || 0) * 0.06;
    for (const s of bgStars) {
      const tw = prefersReduced ? 0.75 : 0.55 + 0.45 * Math.sin((t / 1000) * s.speed + s.phase);
      const y = (((s.y * H - off) % H) + H) % H;
      const x = s.x * W;
      ctx.globalAlpha = 0.22 + 0.6 * tw;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(x, y, s.bright ? s.r * 1.8 : s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.bright) {
        ctx.globalAlpha = 1;
        flare(x, y, 6 + 3 * tw, 0.25 + 0.3 * tw);
      }
    }
    ctx.globalAlpha = 1;

    // Shooting star
    if (shooting) {
      const sh = shooting;
      ctx.strokeStyle = "rgba(233, 236, 255, " + Math.max(sh.life, 0) + ")";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - sh.vx * 14, sh.y - sh.vy * 14);
      ctx.stroke();
      sh.x += sh.vx;
      sh.y += sh.vy;
      sh.life -= 0.016;
      if (sh.life <= 0) shooting = null;
    }

    // Real constellations
    CONSTELLATIONS.forEach((c, ci) => {
      const pts = constPoints(c);
      const hov = ci === hoveredConst && !editing;
      const lineAlpha = editing ? 0.12 : hov ? 0.95 : 0.42;
      ctx.save();
      if (hov) {
        ctx.shadowColor = "#b89cff";
        ctx.shadowBlur = 7;
      }
      ctx.strokeStyle = `rgba(184, 156, 255, ${lineAlpha})`;
      ctx.lineWidth = hov ? 1.5 : 1;
      for (const [a, b] of c.edges) {
        ctx.beginPath();
        ctx.moveTo(pts[a][0], pts[a][1]);
        ctx.lineTo(pts[b][0], pts[b][1]);
        ctx.stroke();
      }
      ctx.restore();

      pts.forEach((p, i) => {
        const isBright = c.bright.includes(i);
        const r = (isBright ? 3.1 : 2.1) * (hov ? 1.35 : 1);
        ctx.save();
        ctx.shadowColor = "#b89cff";
        ctx.shadowBlur = hov ? 14 : 9;
        ctx.globalAlpha = editing ? 0.25 : 1;
        ctx.fillStyle = "#f2efff";
        ctx.beginPath();
        ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (isBright && !editing) flare(p[0], p[1], hov ? 10 : 7, hov ? 0.6 : 0.35);
      });

      // Label at the figure's foot
      let cx = 0, maxY = 0;
      pts.forEach((p) => { cx += p[0]; maxY = Math.max(maxY, p[1]); });
      cx /= pts.length;
      ctx.textAlign = "center";
      ctx.font = "italic 15px Fraunces, Georgia, serif";
      ctx.fillStyle = `rgba(233, 236, 255, ${editing ? 0.08 : hov ? 0.95 : 0.38})`;
      ctx.fillText(c.name, cx, maxY + 22);
      if (hov) {
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(255, 179, 199, 0.95)";
        ctx.fillText("→ " + c.project.title + " · click to open", cx, maxY + 40);
      }
    });

    // User-drawn layer
    ctx.strokeStyle = "rgba(255, 179, 199, 0.55)";
    ctx.lineWidth = 1;
    for (const [a, b] of custom.edges) {
      const A = custom.stars[a], B = custom.stars[b];
      if (!A || !B) continue;
      ctx.beginPath();
      ctx.moveTo(A.x * W, A.y * H);
      ctx.lineTo(B.x * W, B.y * H);
      ctx.stroke();
    }
    custom.stars.forEach((s, i) => {
      const x = s.x * W, y = s.y * H;
      ctx.save();
      ctx.shadowColor = "#ffb3c7";
      ctx.shadowBlur = 10;
      ctx.fillStyle = i === selected ? "#ff7d5c" : "#ffd3e0";
      ctx.beginPath();
      ctx.arc(x, y, i === selected ? 4 : 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (editing && (i === hovered || i === selected)) {
        ctx.strokeStyle = i === selected ? "#ff7d5c" : "rgba(255, 211, 224, 0.8)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  const renderNow = () => render(performance.now());
  window.renderSky = renderNow;

  function loop(t) {
    if (isDusk()) {
      if (!shooting && !editing && t - lastShot > 6000 + Math.random() * 6000) {
        lastShot = t;
        const fromLeft = Math.random() > 0.5;
        shooting = {
          x: Math.random() * W * 0.6 + (fromLeft ? 0 : W * 0.4),
          y: Math.random() * H * 0.35,
          vx: (fromLeft ? 1 : -1) * (3 + Math.random() * 3),
          vy: 1.5 + Math.random() * 1.5,
          life: 1,
        };
      }
      render(t);
    }
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener("resize", resize);
  if (prefersReduced) renderNow();
  else requestAnimationFrame(loop);

  // --- Constellation hover + click → project card ---
  const INTERACTIVE_SEL = "a, button, input, textarea, .card, .work-card, .lab-card, .skill-group, .terminal, .stat, .nav, .palette-panel, .sky-toolbar, .star-modal, .marquee, .sticker, .toast";

  document.addEventListener("mousemove", (e) => {
    if (!finePointer) return;
    let next = -1;
    if (isDusk() && !editing && starModal.hidden && !e.target.closest(INTERACTIVE_SEL)) {
      next = constellationAt(e.clientX, e.clientY);
    }
    if (next !== hoveredConst) {
      hoveredConst = next;
      document.body.classList.toggle("const-hover", next >= 0);
      if (prefersReduced) renderNow();
    }
  });

  document.addEventListener("click", (e) => {
    if (!isDusk() || editing || !starModal.hidden) return;
    if (e.target.closest(INTERACTIVE_SEL)) return;
    const ci = constellationAt(e.clientX, e.clientY);
    if (ci >= 0) openStarCard(CONSTELLATIONS[ci]);
  });

  function openStarCard(c) {
    document.getElementById("star-card-const").textContent = "✦ " + c.name + " — " + c.myth;
    document.getElementById("star-card-title").textContent = c.project.title;
    document.getElementById("star-card-desc").textContent = c.project.desc;
    const linksEl = document.getElementById("star-card-links");
    linksEl.innerHTML = "";
    c.project.links.forEach(([label, url]) => {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = label;
      linksEl.appendChild(a);
    });
    starModal.hidden = false;
    document.body.classList.add("star-open");
    document.body.classList.remove("const-hover");
    hoveredConst = -1;
    if (lenis) lenis.stop();
    if (prefersReduced) renderNow();
  }

  function closeStarCard() {
    starModal.hidden = true;
    document.body.classList.remove("star-open");
    if (lenis) lenis.start();
  }

  document.getElementById("star-card-close").addEventListener("click", closeStarCard);
  document.getElementById("star-backdrop").addEventListener("click", closeStarCard);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !starModal.hidden) closeStarCard();
  });

  // One-time hint
  if (isDusk()) {
    setTimeout(() => {
      try {
        if (!localStorage.getItem("constHint")) {
          showToast("✨ psst — the constellations are clickable");
          localStorage.setItem("constHint", "1");
        }
      } catch (e) {}
    }, 2600);
  }

  // --- Editing (user layer only) ---
  const hitStar = (px, py) => {
    let best = -1, bestD = 18;
    custom.stars.forEach((s, i) => {
      const d = Math.hypot(s.x * W - px, s.y * H - py);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  };

  let dragIdx = -1, dragMoved = false, downX = 0, downY = 0;

  skyCanvas.addEventListener("pointerdown", (e) => {
    if (!editing) return;
    downX = e.clientX;
    downY = e.clientY;
    const i = hitStar(e.clientX, e.clientY);
    if (i >= 0) {
      dragIdx = i;
      dragMoved = false;
      skyCanvas.setPointerCapture(e.pointerId);
    }
  });

  skyCanvas.addEventListener("pointermove", (e) => {
    if (!editing) return;
    if (dragIdx >= 0) {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) dragMoved = true;
      if (dragMoved) {
        custom.stars[dragIdx].x = Math.min(Math.max(e.clientX / W, 0.01), 0.99);
        custom.stars[dragIdx].y = Math.min(Math.max(e.clientY / H, 0.01), 0.99);
      }
    } else {
      hovered = hitStar(e.clientX, e.clientY);
    }
    if (prefersReduced) renderNow();
  });

  skyCanvas.addEventListener("pointerup", (e) => {
    if (!editing) return;
    if (dragIdx >= 0) {
      const i = dragIdx;
      dragIdx = -1;
      if (dragMoved) {
        saveSky();
      } else if (selected === -1) {
        selected = i;
      } else if (selected === i) {
        selected = -1;
      } else {
        const at = custom.edges.findIndex(([a, b]) => (a === selected && b === i) || (a === i && b === selected));
        if (at >= 0) custom.edges.splice(at, 1);
        else custom.edges.push([selected, i]);
        selected = i;
        saveSky();
      }
    } else {
      custom.stars.push({ x: e.clientX / W, y: e.clientY / H });
      selected = -1;
      saveSky();
    }
    if (prefersReduced) renderNow();
  });

  skyCanvas.addEventListener("dblclick", (e) => {
    if (!editing) return;
    const i = hitStar(e.clientX, e.clientY);
    if (i < 0) return;
    custom.stars.splice(i, 1);
    custom.edges = custom.edges
      .filter(([a, b]) => a !== i && b !== i)
      .map(([a, b]) => [a > i ? a - 1 : a, b > i ? b - 1 : b]);
    selected = -1;
    hovered = -1;
    saveSky();
    if (prefersReduced) renderNow();
  });

  function enterSkyEdit() {
    if (!isDusk()) setTheme(true);
    closeStarCard();
    editing = true;
    hoveredConst = -1;
    document.body.classList.add("sky-editing");
    document.body.classList.remove("const-hover");
    if (lenis) lenis.stop();
    showToast("✎ sky editor — your stars save automatically");
    if (prefersReduced) renderNow();
  }

  function exitSkyEdit() {
    if (!editing) return;
    editing = false;
    selected = -1;
    hovered = -1;
    document.body.classList.remove("sky-editing");
    if (lenis) lenis.start();
    if (prefersReduced) renderNow();
  }

  window.enterSkyEdit = enterSkyEdit;
  window.exitSkyEdit = exitSkyEdit;

  skyEditBtn.addEventListener("click", enterSkyEdit);
  document.getElementById("sky-done").addEventListener("click", exitSkyEdit);
  document.getElementById("sky-reset").addEventListener("click", () => {
    custom = { stars: [], edges: [] };
    selected = -1;
    saveSky();
    showToast("your stars were cleared ✿");
    if (prefersReduced) renderNow();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && editing) exitSkyEdit();
  });
}
