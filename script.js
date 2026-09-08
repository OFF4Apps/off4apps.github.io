(() => {
  "use strict";

  /* ---------------- Theme (day / night) ---------------- */
  const root = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle");
  const THEME_KEY = "off4apps-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    toggleBtn.setAttribute("aria-pressed", theme === "night" ? "true" : "false");
    toggleBtn.setAttribute("aria-label", theme === "night" ? "Switch to day mode" : "Switch to night mode");
  }

  let storedTheme = null;
  try { storedTheme = localStorage.getItem(THEME_KEY); } catch (e) { /* storage unavailable, ignore */ }

  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(storedTheme || (prefersDark ? "night" : "day"));

  toggleBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "night" ? "day" : "night";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
  });

  /* ---------------- Scroll-driven cinematic entry ---------------- */
  const heroTrack = document.getElementById("hero-track");
  const rig = document.getElementById("laptop-rig");
  const shadow = document.getElementById("laptop-shadow");
  const scrollCue = document.getElementById("scroll-cue");

  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(v) { return Math.min(1, Math.max(0, v)); }

  // Eased so the motion feels like it settles rather than moving linearly.
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  let ticking = false;

  function getProgress() {
    const rect = heroTrack.getBoundingClientRect();
    const total = heroTrack.offsetHeight - window.innerHeight;
    if (total <= 0) return 1;
    return clamp01(-rect.top / total);
  }

  function render() {
    ticking = false;
    const raw = getProgress();
    const t = easeOutCubic(raw);

    const rotX = lerp(20, 6, t);
    const scale = lerp(0.62, 1, t);
    const ty = lerp(30, 0, t);

    rig.style.transform =
      `rotateX(${rotX}deg) scale(${scale}) translateY(${ty}px)`;

    shadow.style.opacity = String(lerp(0.25, 0.55, t));

    if (raw > 0.04) {
      scrollCue.classList.add("is-hidden");
    } else {
      scrollCue.classList.remove("is-hidden");
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  if (reduceMotion) {
    // Skip the scroll-linked camera move; present a calm, settled resting state.
    rig.style.transform = "rotateX(6deg) scale(1) translateY(0px)";
    shadow.style.opacity = "0.55";
    scrollCue.classList.add("is-hidden");
  } else {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    render();
  }

  /* ---------------- Choice / back panel switching ---------------- */
  const screenInner = document.getElementById("screen-inner");
  const panels = {
    choices: document.getElementById("panel-choices"),
    offline: document.getElementById("panel-offline"),
    online: document.getElementById("panel-online"),
  };

  function showPanel(target) {
    Object.values(panels).forEach((p) => p.classList.remove("is-active"));
    const next = panels[target];
    if (next) next.classList.add("is-active");

    screenInner.classList.remove("tint-offline", "tint-online");
    if (target === "offline") screenInner.classList.add("tint-offline");
    if (target === "online") screenInner.classList.add("tint-online");
  }

  document.querySelectorAll("[data-target]").forEach((el) => {
    el.addEventListener("click", () => showPanel(el.getAttribute("data-target")));
  });
})();
