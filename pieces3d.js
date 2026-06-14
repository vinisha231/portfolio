// 3D chess pieces (Three.js): black glossy pieces revolved from a profile,
// spinning around their vertical axis as you scroll. Falls back silently to
// the inline SVG pieces if Three.js, WebGL, or reduced-motion applies.
(function () {
  "use strict";
  if (typeof THREE === "undefined") return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // WebGL availability
  try {
    const test = document.createElement("canvas");
    if (!(test.getContext("webgl") || test.getContext("experimental-webgl"))) return;
  } catch (e) { return; }

  // ---- profiles: [radius, height] from base to top (revolved around Y) ----
  const PROFILES = {
    pawn:   [[0,0],[0.95,0],[0.95,0.18],[0.78,0.30],[0.55,0.42],[0.40,0.55],[0.30,0.95],[0.28,1.15],[0.46,1.28],[0.30,1.42],[0.30,1.50],[0.52,1.66],[0.63,1.95],[0.55,2.28],[0.30,2.52],[0,2.64]],
    rook:   [[0,0],[1.0,0],[1.0,0.18],[0.82,0.30],[0.60,0.44],[0.50,0.62],[0.46,1.45],[0.52,1.72],[0.70,1.82],[0.70,1.98],[0.84,2.04],[0.86,2.5],[0,2.5]],
    bishop: [[0,0],[0.95,0],[0.95,0.18],[0.76,0.30],[0.55,0.44],[0.44,0.62],[0.33,1.25],[0.50,1.44],[0.32,1.56],[0.31,1.64],[0.52,1.95],[0.52,2.35],[0.38,2.74],[0.17,2.96],[0.22,3.08],[0,3.16]],
    queen:  [[0,0],[1.0,0],[1.0,0.18],[0.82,0.30],[0.60,0.44],[0.50,0.62],[0.38,1.45],[0.56,1.62],[0.40,1.74],[0.45,1.88],[0.70,2.08],[0.72,2.42],[0.55,2.52],[0.55,2.62],[0,2.62]],
    king:   [[0,0],[1.0,0],[1.0,0.18],[0.82,0.30],[0.60,0.44],[0.50,0.62],[0.40,1.45],[0.58,1.64],[0.40,1.76],[0.44,1.9],[0.62,2.05],[0.60,2.4],[0.48,2.55],[0.40,2.62],[0,2.62]],
  };

  function bodyGeometry(type) {
    const pts = (PROFILES[type] || PROFILES.pawn).map(([x, y]) => new THREE.Vector2(Math.max(x, 0.0001), y));
    return new THREE.LatheGeometry(pts, 80);
  }

  // crown points, cross, crenellations, finials added as separate meshes
  function decorations(type, mat) {
    const g = new THREE.Group();
    if (type === "king") {
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.78, 0.16), mat); v.position.y = 3.02;
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.16, 0.16), mat); h.position.y = 3.08;
      g.add(v, h);
    } else if (type === "queen") {
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 18), mat);
        b.position.set(Math.cos(a) * 0.6, 2.66, Math.sin(a) * 0.6);
        g.add(b);
      }
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 18), mat); tip.position.y = 2.8; g.add(tip);
    } else if (type === "rook") {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.32), mat);
        m.position.set(Math.cos(a) * 0.55, 2.62, Math.sin(a) * 0.55);
        g.add(m);
      }
    } else if (type === "bishop") {
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 18), mat); tip.position.y = 3.22; g.add(tip);
    }
    return g;
  }

  // knight: stylized extruded head on a turned base (not a surface of revolution)
  function knightGroup(mat) {
    const group = new THREE.Group();
    const basePts = [[0,0],[1.0,0],[1.0,0.18],[0.82,0.30],[0.58,0.5],[0.5,1.05],[0.6,1.25],[0,1.25]].map(([x, y]) => new THREE.Vector2(Math.max(x, 0.0001), y));
    group.add(new THREE.Mesh(new THREE.LatheGeometry(basePts, 64), mat));
    const s = new THREE.Shape();
    s.moveTo(-0.15, 0);
    s.lineTo(0.55, 0.05);
    s.bezierCurveTo(0.72, 0.5, 0.6, 1.05, 0.32, 1.45);
    s.bezierCurveTo(0.5, 1.5, 0.6, 1.55, 0.52, 1.72);
    s.lineTo(0.18, 1.5);
    s.bezierCurveTo(-0.05, 1.72, -0.55, 1.66, -0.78, 1.32);
    s.bezierCurveTo(-1.0, 1.0, -0.92, 0.62, -0.5, 0.5);
    s.lineTo(-0.42, 0.28);
    s.bezierCurveTo(-0.36, 0.08, -0.32, 0, -0.15, 0);
    const ext = new THREE.ExtrudeGeometry(s, { depth: 0.62, bevelEnabled: true, bevelSize: 0.07, bevelThickness: 0.07, bevelSegments: 2 });
    ext.center();
    const head = new THREE.Mesh(ext, mat);
    head.position.y = 2.0;
    group.add(head);
    return group;
  }

  // soft reflection environment for the glossy look (per renderer/context)
  function makeEnv(renderer) {
    try {
      const c = document.createElement("canvas"); c.width = 16; c.height = 64;
      const ctx = c.getContext("2d");
      const grad = ctx.createLinearGradient(0, 0, 0, 64);
      grad.addColorStop(0, "#aab2c4"); grad.addColorStop(0.5, "#3c424e"); grad.addColorStop(1, "#0b0d12");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 16, 64);
      const tex = new THREE.CanvasTexture(c);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromEquirectangular(tex).texture;
      tex.dispose(); pmrem.dispose();
      return env;
    } catch (e) { return null; }
  }

  function setupSlot(slot) {
    const type = slot.dataset.piece;
    const w = slot.clientWidth || 280, h = slot.clientHeight || 360;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    if ("outputEncoding" in renderer) renderer.outputEncoding = THREE.sRGBEncoding;
    slot.appendChild(renderer.domElement);
    slot.classList.add("has3d");

    const scene = new THREE.Scene();
    const env = makeEnv(renderer);
    if (env) scene.environment = env;

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x0c0c0c, metalness: 0.1, roughness: 0.32,
      clearcoat: 0.9, clearcoatRoughness: 0.22, envMapIntensity: 1.1,
    });

    let piece;
    if (type === "knight") {
      piece = knightGroup(mat);
    } else {
      piece = new THREE.Group();
      piece.add(new THREE.Mesh(bodyGeometry(type), mat));
      piece.add(decorations(type, mat));
    }

    // center the piece on the origin so it spins about its own vertical axis
    const box = new THREE.Box3().setFromObject(piece);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    piece.position.set(-center.x, -center.y, -center.z);
    const spin = new THREE.Group();
    spin.add(piece);
    scene.add(spin);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x202028, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(3, 6, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0x9db4ff, 0.5); fill.position.set(-5, 2, 4); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffe2b0, 1.5); rim.position.set(-3, 4, -6); scene.add(rim);

    const cam = new THREE.PerspectiveCamera(32, w / h, 0.1, 100);
    const fit = Math.max(size.x, size.y);
    const dist = fit / (2 * Math.tan((Math.PI * 32) / 360)) * 1.15 + 1.1;
    cam.position.set(0, 0.15, dist);
    cam.lookAt(0, 0, 0);

    const ctx = {
      slot, renderer, scene, cam, spin, drag: 0,
      resize() {
        const nw = slot.clientWidth, nh = slot.clientHeight;
        if (!nw || !nh) return;
        renderer.setSize(nw, nh);
        cam.aspect = nw / nh;
        cam.updateProjectionMatrix();
      },
    };

    // grab a piece and spin it on its vertical axis by hand
    let dragging = false, lastX = 0;
    const cv = renderer.domElement;
    cv.style.cursor = "grab";
    cv.style.touchAction = "pan-y";
    cv.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; cv.style.cursor = "grabbing"; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", (e) => { if (!dragging) return; ctx.drag += (e.clientX - lastX) * 0.01; lastX = e.clientX; });
    const end = () => { dragging = false; cv.style.cursor = "grab"; };
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointercancel", end);
    return ctx;
  }

  // ---- mount every slot, render only those in view ----
  const ctxs = [];
  document.querySelectorAll(".piece3d").forEach((slot) => {
    const c = setupSlot(slot);
    if (c) { slot._ctx = c; ctxs.push(c); }
  });
  if (!ctxs.length) return;

  const active = new Set();
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) active.add(e.target._ctx);
      else active.delete(e.target._ctx);
    }),
    { rootMargin: "120px 0px" }
  );
  ctxs.forEach((c) => io.observe(c.slot));

  function frame(now) {
    const vh = window.innerHeight;
    active.forEach((c) => {
      const r = c.slot.getBoundingClientRect();
      const progress = (vh - r.top) / (vh + r.height); // ~0 entering bottom, ~1 leaving top
      c.spin.rotation.y = progress * Math.PI * 2.4 + now * 0.00018 + c.drag;
      c.renderer.render(c.scene, c.cam);
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => ctxs.forEach((c) => c.resize()), 150);
  });
})();
