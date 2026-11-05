/* ==========================================================================
   GAREEBI TRACKER — LANDING PAGE LOGIC (static/js/landing.js)
   Handles navbar blur on scroll and smooth link scrolling.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. STICKY NAVBAR DYNAMIC BLUR EFFECT
       Adds a deeper shadow when the user scrolls down the landing page.
       -------------------------------------------------------------------------- */
    const navbarWrapper = document.querySelector('.navbar-wrapper');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbarWrapper.style.backgroundColor = 'rgba(8, 9, 12, 0.9)';
            navbarWrapper.style.borderBottomColor = 'rgba(255, 255, 255, 0.15)';
        } else {
            navbarWrapper.style.backgroundColor = 'rgba(8, 9, 12, 0.7)';
            navbarWrapper.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
        }
    });

    /* --------------------------------------------------------------------------
       2. SMOOTH SCROLLING FOR IN-PAGE ANCHOR LINKS (#features, #why-us)
       -------------------------------------------------------------------------- */
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                event.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

});