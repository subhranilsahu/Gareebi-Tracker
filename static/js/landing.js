const revealElements = document.querySelectorAll(".reveal");

function revealOnScroll() {
    const windowHeight = window.innerHeight;

    revealElements.forEach((element) => {
        const rect = element.getBoundingClientRect();

        // Element viewport ke andar hai
        if (rect.top < windowHeight - 50 && rect.bottom > 50) {
            element.classList.add("is-visible");
        } 
        
        // Element viewport se bahar hai
        else {
            element.classList.remove("is-visible");
        }
    });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("resize", revealOnScroll);

// Initial check
revealOnScroll();
