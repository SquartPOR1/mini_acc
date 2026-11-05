// Cinematic intro: subtle Three.js "Ledgerly" title, then place cards one by one.
(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const overlay = document.getElementById("intro-overlay");
  if (!overlay) return;

  const placeSelector = [
    ".topbar",
    "#page-dashboard .page-heading",
    "#page-dashboard .overview-summary > *",
    "#page-dashboard .dashboard-grid > *",
    "#page-dashboard .recent-panel",
    ".main-nav",
  ].join(",");

  function setPrePlace(on) {
    document.body.classList.toggle("intro-playing", on);
    if (!on) return;
    const els = Array.from(document.querySelectorAll(placeSelector));
    els.forEach((el, i) => {
      el.style.setProperty("--intro-delay", `${i * 70}ms`);
      el.classList.add("intro-place");
    });
  }

  async function placeCards() {
    const els = Array.from(document.querySelectorAll(placeSelector));
    // let browser paint pre-placed state
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    els.forEach((el) => el.classList.add("intro-place-in"));
    const last = els.length ? (els.length - 1) * 70 + 650 : 400;
    await new Promise((r) => setTimeout(r, last));
    document.body.classList.remove("intro-playing");
    document.body.classList.add("intro-done");
    els.forEach((el) => { el.classList.remove("intro-place", "intro-place-in"); el.style.removeProperty("--intro-delay"); });
    overlay.classList.add("intro-fade");
    overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
    setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 1400);
  }

  async function runThreeAccent() {
    try {
      const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
      const container = document.getElementById("intro-canvas");
      if (!container) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 260;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      // soft particle field behind title
      const count = 420;
      const pos = new Float32Array(count * 3);
      const vel = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        pos[i3] = (Math.random() - 0.5) * 520;
        pos[i3 + 1] = (Math.random() - 0.5) * 260;
        pos[i3 + 2] = (Math.random() - 0.5) * 180;
        vel[i3] = (Math.random() - 0.5) * 0.12;
        vel[i3 + 1] = (Math.random() - 0.5) * 0.08;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ size: 1.6, color: 0x1793d1, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
      const pts = new THREE.Points(geo, mat);
      scene.add(pts);

      let active = true;
      const onResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
      window.addEventListener("resize", onResize);
      const tick = () => {
        if (!active) return;
        const a = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          a[i3] += vel[i3]; a[i3 + 1] += vel[i3 + 1];
          if (Math.abs(a[i3]) > 280) vel[i3] *= -1;
          if (Math.abs(a[i3 + 1]) > 150) vel[i3 + 1] *= -1;
        }
        geo.attributes.position.needsUpdate = true;
        pts.rotation.y += 0.0008;
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
      };
      tick();
      // stop when overlay removed
      const stop = () => { active = false; window.removeEventListener("resize", onResize); renderer.dispose(); geo.dispose(); mat.dispose(); };
      overlay.addEventListener("transitionend", stop, { once: true });
      setTimeout(stop, 5000);
    } catch {}
  }

  async function start() {
    if (prefersReduced) {
      document.body.classList.add("intro-done");
      overlay.remove();
      return;
    }
    setPrePlace(true);
    runThreeAccent();
    // cinematic title beat, then place
    await new Promise((r) => setTimeout(r, 900));
    overlay.classList.add("intro-title-done");
    await placeCards();
  }

  start();
})();