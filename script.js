(() => {
  "use strict";

  /* =====================================================
     ELEMENTS
  ===================================================== */

  const html = document.documentElement;

  const track =
    document.getElementById("cinematicTrack");

  const laptop =
    document.getElementById("laptopRig");

  const scrollCue =
    document.getElementById("scrollCue");

  const themeToggle =
    document.getElementById("themeToggle");

  const themeIcon =
    document.getElementById("themeIcon");

  const choiceCards =
    document.querySelectorAll(".choice-card");

  const ambientOne =
    document.querySelector(".ambient-one");

  const ambientTwo =
    document.querySelector(".ambient-two");

  const ambientThree =
    document.querySelector(".ambient-three");


  /* =====================================================
     SAFETY CHECK
  ===================================================== */

  if (!track || !laptop) {
    console.error(
      "OFF4Apps: Required cinematic elements are missing."
    );

    return;
  }


  /* =====================================================
     THEME
  ===================================================== */

  const savedTheme =
    localStorage.getItem("off4apps-theme");

  if (savedTheme === "dark") {

    html.classList.add("dark");

    if (themeIcon) {
      themeIcon.textContent = "☀";
    }

  } else {

    html.classList.remove("dark");

    if (themeIcon) {
      themeIcon.textContent = "☾";
    }
  }


  if (themeToggle) {

    themeToggle.addEventListener(
      "click",
      () => {

        const dark =
          html.classList.toggle("dark");

        localStorage.setItem(
          "off4apps-theme",
          dark ? "dark" : "light"
        );

        if (themeIcon) {

          themeIcon.textContent =
            dark ? "☀" : "☾";
        }

      }
    );

  }


  /* =====================================================
     CINEMATIC CAMERA
     
     IMPORTANT:
     
     Scroll position directly controls
     cinematic progress.

     No autoplay.
     No timer.
     No automatic camera movement.
  ===================================================== */

  let targetProgress = 0;

  let displayedProgress = 0;

  let ticking = false;


  /* =====================================================
     CLAMP
  ===================================================== */

  function clamp(
    value,
    min,
    max
  ) {

    return Math.min(
      Math.max(value, min),
      max
    );
  }


  /* =====================================================
     SMOOTHSTEP
  ===================================================== */

  function smoothStep(value) {

    return value * value *
      (3 - 2 * value);
  }


  /* =====================================================
     GET SCROLL PROGRESS
  ===================================================== */

  function calculateProgress() {

    const maxScroll =
      track.offsetHeight -
      window.innerHeight;

    if (maxScroll <= 0) {
      return 0;
    }

    return clamp(
      window.scrollY / maxScroll,
      0,
      1
    );
  }


  /* =====================================================
     UPDATE TARGET
  ===================================================== */

  function updateTarget() {

    targetProgress =
      calculateProgress();

    if (!ticking) {

      ticking = true;

      requestAnimationFrame(
        render
      );
    }

  }


  /* =====================================================
     RENDER CAMERA
  ===================================================== */

  function render() {

    ticking = false;


    /* ---------------------------------------------
       Follow scroll position
    --------------------------------------------- */

    const difference =
      targetProgress -
      displayedProgress;


    displayedProgress +=
      difference * 0.18;


    /*
       Snap when close enough.

       This prevents endless tiny animation.
    */

    if (
      Math.abs(
        targetProgress -
        displayedProgress
      ) < 0.0001
    ) {

      displayedProgress =
        targetProgress;
    }


    /* ---------------------------------------------
       Camera easing
    --------------------------------------------- */

    const p =
      smoothStep(
        displayedProgress
      );


    /* ---------------------------------------------
       Camera values
       
       Start:
       - laptop distant
       - slightly tilted
       - lower position

       End:
       - laptop very close
       - almost straight
       - slightly higher
    --------------------------------------------- */

    const scale =
      0.46 +
      (3.25 - 0.46) * p;


    const translateZ =
      -40 +
      (120 + 40) * p;


    const translateY =
      32 +
      (-12 - 32) * p;


    const rotateX =
      18 +
      (1 - 18) * p;


    const rotateY =
      -1.2 +
      (0 + 1.2) * p;


    /* ---------------------------------------------
       Apply camera
    --------------------------------------------- */

    laptop.style.transform = `
      translate3d(
        0,
        ${translateY}px,
        ${translateZ}px
      )
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(${scale})
    `;


    /* ---------------------------------------------
       Ambient background movement
    --------------------------------------------- */

    if (ambientOne) {

      ambientOne.style.transform =
        `translate3d(
          ${p * 35}px,
          ${p * 20}px,
          0
        )`;

    }


    if (ambientTwo) {

      ambientTwo.style.transform =
        `translate3d(
          ${p * -45}px,
          ${p * -25}px,
          0
        )`;

    }


    if (ambientThree) {

      ambientThree.style.transform =
        `translate3d(
          ${p * 20}px,
          ${p * -35}px,
          0
        )`;

    }


    /* ---------------------------------------------
       Scroll cue fades as camera approaches
    --------------------------------------------- */

    if (scrollCue) {

      scrollCue.style.opacity =
        String(
          clamp(
            0.75 -
            displayedProgress * 2.5,
            0,
            0.75
          )
        );

    }


    /* ---------------------------------------------
       Continue only while needed
    --------------------------------------------- */

    if (
      Math.abs(
        targetProgress -
        displayedProgress
      ) > 0.0001
    ) {

      ticking = true;

      requestAnimationFrame(
        render
      );
    }

  }


  /* =====================================================
     SCROLL LISTENERS
  ===================================================== */

  window.addEventListener(
    "scroll",
    updateTarget,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    updateTarget,
    {
      passive: true
    }
  );


  /* =====================================================
     INITIAL POSITION
  ===================================================== */

  targetProgress =
    calculateProgress();

  displayedProgress =
    targetProgress;

  render();


  /* =====================================================
     CHOICE CARDS
     
     Clicking a laptop option moves
     the page to the corresponding world.
  ===================================================== */

  choiceCards.forEach(
    (card) => {

      card.addEventListener(
        "click",
        () => {

          const panel =
            card.dataset.panel;

          if (!panel) {
            return;
          }


          const target =
            document.getElementById(
              panel
            );

          if (!target) {
            return;
          }


          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }
      );

    }
  );


  /* =====================================================
     KEYBOARD ACCESSIBILITY
  ===================================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }

    }
  );


  /* =====================================================
     REDUCED MOTION
  ===================================================== */

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  function handleReducedMotion() {

    if (
      reducedMotion.matches
    ) {

      laptop.style.transform = `
        translate3d(
          0,
          0,
          0
        )
        rotateX(0deg)
        rotateY(0deg)
        scale(1)
      `;

    } else {

      updateTarget();

    }

  }


  if (
    reducedMotion.addEventListener
  ) {

    reducedMotion.addEventListener(
      "change",
      handleReducedMotion
    );

  }


  handleReducedMotion();

})();
