"use strict";


/* =====================================================
   OFF4Apps
   VERSION 2.2
   INTERACTION ENGINE
===================================================== */


/* =====================================================
   ELEMENTS
===================================================== */

const body =
    document.body;

const themeButton =
    document.getElementById(
        "themeButton"
    );

const cinematic =
    document.getElementById(
        "home"
    );

const laptop =
    document.getElementById(
        "laptop"
    );

const laptopWorld =
    document.getElementById(
        "laptopWorld"
    );

const laptopShadow =
    document.getElementById(
        "laptopShadow"
    );

const heroContent =
    document.getElementById(
        "heroContent"
    );

const ambientPink =
    document.getElementById(
        "ambientPink"
    );

const ambientBlue =
    document.getElementById(
        "ambientBlue"
    );

const ambientWhite =
    document.getElementById(
        "ambientWhite"
    );

const cinematicOverlay =
    document.getElementById(
        "cinematicOverlay"
    );

const scrollIndicator =
    document.getElementById(
        "scrollIndicator"
    );

const choices =
    document.querySelectorAll(
        ".choice"
    );


/* =====================================================
   THEME
===================================================== */

const savedTheme =
    localStorage.getItem(
        "off4apps-theme"
    );


if (
    savedTheme === "dark"
) {

    body.classList.add(
        "dark"
    );

}


function updateThemeIcon() {

    if (!themeButton) {
        return;
    }

    themeButton.textContent =
        body.classList.contains("dark")
            ? "☾"
            : "☼";

}


updateThemeIcon();


if (themeButton) {

    themeButton.addEventListener(
        "click",
        () => {

            const isDark =
                body.classList.toggle(
                    "dark"
                );


            localStorage.setItem(
                "off4apps-theme",
                isDark
                    ? "dark"
                    : "light"
            );


            updateThemeIcon();

        }
    );

}


/* =====================================================
   UTILITIES
===================================================== */

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );

}


function easeInOutCubic(
    value
) {

    return value < 0.5

        ? 4 *
          value *
          value *
          value

        : 1 -
          Math.pow(
              -2 * value + 2,
              3
          ) / 2;

}


/* =====================================================
   CINEMATIC STATE
===================================================== */

let targetProgress = 0;

let currentProgress = 0;

let frame = null;


/* =====================================================
   GET CINEMATIC PROGRESS
===================================================== */

function getProgress() {

    if (!cinematic) {
        return 0;
    }


    const totalDistance =
        cinematic.offsetHeight -
        window.innerHeight;


    if (
        totalDistance <= 0
    ) {

        return 0;

    }


    const travelled =
        -cinematic.getBoundingClientRect().top;


    return clamp(
        travelled /
        totalDistance,

        0,
        1
    );

}


/* =====================================================
   UPDATE TARGET
===================================================== */

function updateTarget() {

    targetProgress =
        getProgress();


    startAnimation();

}


/* =====================================================
   ANIMATION LOOP
===================================================== */

function startAnimation() {

    if (frame !== null) {
        return;
    }


    frame =
        requestAnimationFrame(
            render
        );

}


/* =====================================================
   MAIN RENDER
===================================================== */

function render() {

    frame = null;


    /*
       Smoothly follow the actual
       scroll position.

       This creates a camera-like
       feeling instead of a harsh
       mechanical movement.
    */

    const difference =
        targetProgress -
        currentProgress;


    currentProgress +=
        difference * 0.14;


    if (
        Math.abs(
            difference
        ) < 0.00005
    ) {

        currentProgress =
            targetProgress;

    }


    const progress =
        currentProgress;


    const eased =
        easeInOutCubic(
            progress
        );


    /* =================================================
       CAMERA
    ================================================= */


    /*
       Scale

       Beginning:
       distant laptop

       End:
       screen becomes dominant
    */

    const scale =
        0.82 +
        eased * 2.35;


    /*
       Camera depth.
    */

    const depth =
        eased * 700;


    /*
       Vertical movement.
    */

    const moveY =
        7 -
        eased * 12;


    /*
       Camera tilt.

       Starts with a slight
       first-person perspective.
    */

    const rotateX =
        12 -
        eased * 10;


    /*
       Slight horizontal angle.
    */

    const rotateY =
        -2 +
        eased * 2;


    laptop.style.setProperty(
        "--scale",
        scale.toFixed(4)
    );


    laptop.style.setProperty(
        "--depth",
        `${depth.toFixed(2)}px`
    );


    laptop.style.setProperty(
        "--moveY",
        `${moveY.toFixed(2)}vh`
    );


    laptop.style.setProperty(
        "--rx",
        `${rotateX.toFixed(2)}deg`
    );


    laptop.style.setProperty(
        "--ry",
        `${rotateY.toFixed(2)}deg`
    );


    /* =================================================
       HERO TEXT
    ================================================= */


    const textOpacity =
        clamp(
            1 -
            progress * 2.15,

            0,
            1
        );


    const textY =
        progress * -100;


    const textBlur =
        progress * 5;


    heroContent.style.opacity =
        textOpacity;


    heroContent.style.transform =
        `translate(
            -50%,
            ${textY}px
        )`;


    heroContent.style.filter =
        `blur(${textBlur}px)`;


    /* =================================================
       LAPTOP SHADOW
    ================================================= */


    const shadowScale =
        1 -
        eased * .45;


    const shadowOpacity =
        .55 -
        eased * .35;


    laptopShadow.style.setProperty(
        "--shadow-scale",
        shadowScale.toFixed(3)
    );


    laptopShadow.style.setProperty(
        "--shadow-opacity",
        shadowOpacity.toFixed(3)
    );


    /* =================================================
       AMBIENT LIGHT
    ================================================= */


    ambientPink.style.transform =
        `translate3d(
            ${progress * 70}px,
            ${progress * 35}px,
            0
        )
        scale(
            ${1 + progress * .35}
        )`;


    ambientBlue.style.transform =
        `translate3d(
            ${progress * -80}px,
            ${progress * -35}px,
            0
        )
        scale(
            ${1 + progress * .40}
        )`;


    ambientWhite.style.transform =
        `translate3d(
            ${progress * 20}px,
            ${progress * -45}px,
            0
        )
        scale(
            ${1 + progress * .55}
        )`;


    /* =================================================
       VIGNETTE
    ================================================= */

    cinematicOverlay.style.setProperty(
        "--vignette",
        (eased * .30).toFixed(3)
    );


    /* =================================================
       SCROLL INDICATOR
    ================================================= */

    scrollIndicator.style.opacity =
        clamp(
            1 -
            progress * 5,

            0,
            1
        );


    /* =================================================
       CONTINUE IF STILL MOVING
    ================================================= */

    if (
        Math.abs(
            targetProgress -
            currentProgress
        ) > 0.00005
    ) {

        startAnimation();

    }

}


/* =====================================================
   SCROLL
===================================================== */

window.addEventListener(
    "scroll",
    updateTarget,
    {
        passive: true
    }
);


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
    "resize",
    updateTarget
);


/* =====================================================
   INITIAL RENDER
===================================================== */

targetProgress =
    getProgress();

currentProgress =
    targetProgress;

render();


/* =====================================================
   DESKTOP POINTER DEPTH
===================================================== */

const finePointer =
    window.matchMedia(
        "(pointer:fine)"
    );


if (
    finePointer.matches &&
    laptopWorld
) {

    laptopWorld.addEventListener(
        "pointermove",
        (event) => {

            const rect =
                laptopWorld.getBoundingClientRect();


            const x =
                (
                    event.clientX -
                    rect.left
                )
                /
                rect.width
                -
                .5;


            const y =
                (
                    event.clientY -
                    rect.top
                )
                /
                rect.height
                -
                .5;


            /*
               Very subtle movement.

               It should feel like
               physical depth, not
               like a game.
            */

            const pointerY =
                y * -2;


            const pointerX =
                x * 3;


            laptop.style.setProperty(
                "--pointerX",
                pointerX.toFixed(2)
            );


            laptop.style.setProperty(
                "--pointerY",
                pointerY.toFixed(2)
            );


            /*
               We intentionally use the
               existing rotation variables
               so pointer movement does
               not create another transform.
            */

            const baseRX =
                12 -
                easeInOutCubic(
                    currentProgress
                ) * 10;


            const baseRY =
                -2 +
                easeInOutCubic(
                    currentProgress
                ) * 2;


            laptop.style.setProperty(
                "--rx",
                `${(
                    baseRX +
                    pointerY
                ).toFixed(2)}deg`
            );


            laptop.style.setProperty(
                "--ry",
                `${(
                    baseRY +
                    pointerX
                ).toFixed(2)}deg`
            );

        }
    );


    laptopWorld.addEventListener(
        "pointerleave",
        () => {

            const eased =
                easeInOutCubic(
                    currentProgress
                );


            laptop.style.setProperty(
                "--rx",
                `${(
                    12 -
                    eased * 10
                ).toFixed(2)}deg`
            );


            laptop.style.setProperty(
                "--ry",
                `${(
                    -2 +
                    eased * 2
                ).toFixed(2)}deg`
            );

        }
    );

}


/* =====================================================
   CHOICE CARD INTERACTION
===================================================== */

choices.forEach(
    (choice) => {

        choice.addEventListener(
            "pointerenter",
            () => {

                choices.forEach(
                    (other) => {

                        if (
                            other !== choice
                        ) {

                            other.style.opacity =
                                ".55";

                            other.style.transform =
                                "scale(.97)";

                        }

                    }
                );

            }
        );


        choice.addEventListener(
            "pointerleave",
            () => {

                choices.forEach(
                    (other) => {

                        other.style.opacity =
                            "";

                        other.style.transform =
                            "";

                    }
                );

            }
        );

    }
);


/* =====================================================
   SECTION REVEALS
===================================================== */

const revealObserver =
    new IntersectionObserver(

        (entries) => {

            entries.forEach(
                (entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target
                            .classList
                            .add(
                                "visible"
                            );

                    }

                }
            );

        },

        {
            threshold:
                0.15
        }

    );


document
    .querySelectorAll(
        ".reveal"
    )
    .forEach(
        (element) => {

            revealObserver.observe(
                element
            );

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

        laptop.style.setProperty(
            "--scale",
            "1"
        );

        laptop.style.setProperty(
            "--depth",
            "0px"
        );

        laptop.style.setProperty(
            "--moveY",
            "0vh"
        );

        laptop.style.setProperty(
            "--rx",
            "0deg"
        );

        laptop.style.setProperty(
            "--ry",
            "0deg"
        );

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


/* =====================================================
   KEYBOARD
===================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    }
);
