(() => {
  "use strict";

  /* ============================================================
     THEME (day / night)
     ============================================================ */
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

  /* ============================================================
     CINEMATIC CAMERA
     Architecture: SCROLL POSITION -> CAMERA STATE -> VISUAL STATE

     1. getProgress()      reads the scroll position and turns it
                            into a single number from 0 (top) to 1
                            (fully scrolled through the hero track).
     2. deriveCameraState() turns that number into concrete camera
                            values (perspective, depth, tilt, drift).
                            This is a pure function: same progress
                            always produces the same state, with no
                            memory of time or direction.
     3. applyCameraState()  writes those values to the DOM.

     There is no timer, no autoplaying animation, and no easing
     that lags behind the current frame — every call is a full,
     immediate re-computation from the live scroll position, so
     the scene freezes the instant scrolling stops and reverses
     cleanly when the user scrolls back up.
     ============================================================ */

  const heroTrack   = document.getElementById("hero-track");
  const scene        = document.getElementById("laptop-scene");
  const rig           = document.getElementById("laptop-rig");
  const shadow       = document.getElementById("laptop-shadow");
  const vignette     = document.getElementById("depth-vignette");
  const glow          = document.getElementById("screen-glow");
  const blobBlue      = document.getElementById("blob-blue");
  const blobPink      = document.getElementById("blob-pink");
  const scrollCue    = document.getElementById("scroll-cue");

  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tunable range for the whole journey. Change these numbers to
  // adjust how dramatic the "camera approaching" effect feels.
  const CAMERA = {
    perspectiveFar:  1600,
    perspectiveNear:  900,
    translateZFar:    -820,
    translateZNear:    430,
    rotateXFar:         26,
    rotateXNear:         2,
    translateYFar:      22,
    translateYNear:     -8,
    shadowOpacityFar:  .22,
    shadowOpacityNear: .58,
    glowOpacityFar:    .25,
    glowOpacityNear:   .85,
    vignetteOpacityFar:   0,
    vignetteOpacityNear: .6,
  };

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  // Purely a re-shaping of the 0..1 range — still a function of
  // position only, so it does not introduce any time-based lag.
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // ---- 1. SCROLL POSITION -> PROGRESS ----
  function getProgress() {
    const rect = heroTrack.getBoundingClientRect();
    const total = heroTrack.offsetHeight - window.innerHeight;
    if (total <= 0) return 1;
    return clamp01(-rect.top / total);
  }

  // ---- 2. PROGRESS -> CAMERA STATE ----
  function deriveCameraState(progress) {
    const t = easeInOutCubic(progress);
    return {
      raw: progress,
      perspective: lerp(CAMERA.perspectiveFar, CAMERA.perspectiveNear, t),
      translateZ:  lerp(CAMERA.translateZFar,  CAMERA.translateZNear,  t),
      rotateX:     lerp(CAMERA.rotateXFar,     CAMERA.rotateXNear,     t),
      translateY:  lerp(CAMERA.translateYFar,  CAMERA.translateYNear,  t),
      shadowOpacity:   lerp(CAMERA.shadowOpacityFar,   CAMERA.shadowOpacityNear,   t),
      glowOpacity:     lerp(CAMERA.glowOpacityFar,     CAMERA.glowOpacityNear,     t),
      vignetteOpacity: lerp(CAMERA.vignetteOpacityFar, CAMERA.vignetteOpacityNear, t),
      // Background elements drift and dissolve faster than the
      // main journey completes, so they feel "passed" by roughly
      // the two-thirds mark rather than lingering the whole way.
      bgT: clamp01(t / 0.7),
    };
  }

  // ---- 3. CAMERA STATE -> DOM ----
  function applyCameraState(state) {
    scene.style.perspective = state.perspective + "px";

    rig.style.transform =
      "translateY(" + state.translateY.toFixed(2) + "px) " +
      "rotateX(" + state.rotateX.toFixed(2) + "deg) " +
      "translateZ(" + state.translateZ.toFixed(2) + "px)";

    shadow.style.opacity = state.shadowOpacity.toFixed(3);
    glow.style.opacity = state.glowOpacity.toFixed(3);
    vignette.style.opacity = state.vignetteOpacity.toFixed(3);

    const bgFade = 1 - state.bgT;
    blobBlue.style.opacity = (0.55 * bgFade).toFixed(3);
    blobBlue.style.transform = "translate3d(0, " + (-70 * state.bgT).toFixed(1) + "px, 0) scale(" + (1 - 0.15 * state.bgT).toFixed(3) + ")";
    blobPink.style.opacity = (0.55 * bgFade).toFixed(3);
    blobPink.style.transform = "translate3d(0, " + (50 * state.bgT).toFixed(1) + "px, 0) scale(" + (1 - 0.15 * state.bgT).toFixed(3) + ")";

    if (state.raw > 0.03) {
      scrollCue.classList.add("is-hidden");
    } else {
      scrollCue.classList.remove("is-hidden");
    }
  }

  function render() {
    applyCameraState(deriveCameraState(getProgress()));
  }

  if (reduceMotion) {
    // No scroll-linked camera move: present a single calm, settled
    // resting state instead (still fully functional/reachable).
    applyCameraState(deriveCameraState(1));
    scrollCue.classList.add("is-hidden");
  } else {
    /* --------------------------------------------------------
       Frame loop, active only while the user is actually
       scrolling or touching the screen.

       Plain "scroll" event listeners are enough on desktop, but
       some mobile browsers coalesce/delay scroll events during
       inertial (momentum) touch scrolling, which makes a purely
       event-driven animation look stepped. To keep the camera
       genuinely tied to live scroll position on mobile too, a
       requestAnimationFrame loop runs for the duration of an
       active scroll/touch gesture (plus a short settle window),
       reading real scroll position every frame, then stops
       itself — so there is no animation running while idle.
       -------------------------------------------------------- */
    let looping = false;
    let idleTimer = null;

    function frame() {
      render();
      if (looping) requestAnimationFrame(frame);
    }

    function keepAlive() {
      if (!looping) {
        looping = true;
        requestAnimationFrame(frame);
      }
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        looping = false;
        render(); // final precise settle at the resting scroll position
      }, 160);
    }

    window.addEventListener("scroll", keepAlive, { passive: true });
    window.addEventListener("touchmove", keepAlive, { passive: true });
    window.addEventListener("touchstart", keepAlive, { passive: true });
    window.addEventListener("resize", render);

    render();
  }

  /* ============================================================
     CHOICE / BACK PANEL SWITCHING
     ============================================================ */
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
