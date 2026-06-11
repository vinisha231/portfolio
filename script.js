const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

// ===== Footer year =====
document.getElementById("year").textContent = new Date().getFullYear();

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

// ===== Scroll choreography (GSAP + Lenis) =====
if (hasGsap && !prefersReduced) {
  gsap.registerPlugin(ScrollTrigger);

  // Smooth inertia scrolling
  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Anchor links through Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.4 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

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
