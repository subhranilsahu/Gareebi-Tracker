
/* GAREEBI TRACKER — SHARED CINEMATIC PAGE MOTION */

(() => {
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    const animate = (element, keyframes, options = {}) => {
        if (!element) return;

        element.animate(keyframes, {
            duration: options.duration || 850,
            delay: options.delay || 0,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "both"
        });
    };

    const revealItems = (items, startDelay = 100) => {
        items.forEach((item, index) => {
            animate(item, [
                {
                    opacity: 0,
                    transform: "translateY(22px)",
                    filter: "blur(7px)"
                },
                {
                    opacity: 1,
                    transform: "translateY(0)",
                    filter: "blur(0)"
                }
            ], {
                duration: 950,
                delay: startDelay + index * 110
            });
        });
    };

    const startMotion = () => {
        document.body.classList.add("page-motion-ready");

        const path = window.location.pathname;

        if (path.includes("landing") || document.body.classList.contains("landing-body")) {
            const hero = document.querySelector(".hero-section");

            if (hero) {
                revealItems(
                    Array.from(hero.querySelectorAll("h1, h2, p, .btn, a"))
                        .slice(0, 8),
                    100
                );
            }

            const sections = document.querySelectorAll(
                ".features-section, .why-section, .cta-section"
            );

            sections.forEach((section, index) => {
                animate(section, [
                    { opacity: 0, transform: "translateY(35px)", filter: "blur(5px)" },
                    { opacity: 1, transform: "translateY(0)", filter: "blur(0)" }
                ], {
                    duration: 1100,
                    delay: 250 + index * 140
                });
            });

            revealItems(
                Array.from(document.querySelectorAll(
                    ".bento-card, .feature-card, .why-card"
                )),
                350
            );
            return;
        }

        if (document.body.classList.contains("auth-body")) {
            const container = document.querySelector(".auth-container");

            animate(container, [
                {
                    opacity: 0,
                    transform: "translateY(28px) scale(0.985)",
                    filter: "blur(9px)"
                },
                {
                    opacity: 1,
                    transform: "translateY(0) scale(1)",
                    filter: "blur(0)"
                }
            ], { duration: 1100 });

            if (container) {
                revealItems(
                    Array.from(container.querySelectorAll(
                        ".auth-header, .auth-form > *, .auth-switch-link"
                    )),
                    250
                );
            }
            return;
        }

        if (document.body.classList.contains("dashboard-body")) {
            const activeView = document.querySelector(
                "#dashboard-view:not([hidden])"
            );

            if (activeView) {
                animate(activeView, [
                    {
                        opacity: 0,
                        transform: "translateY(18px)",
                        filter: "blur(6px)"
                    },
                    {
                        opacity: 1,
                        transform: "translateY(0)",
                        filter: "blur(0)"
                    }
                ], { duration: 900 });

                revealItems(
                    Array.from(activeView.querySelectorAll(
                        ".metric-card, .analytics-grid > *, .table-card"
                    )),
                    180
                );
            }
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startMotion, { once: true });
    } else {
        startMotion();
    }
})();
