// console.log("Animation JS loaded");

// const revealElements = document.querySelectorAll(".reveal");

// console.log("Reveal elements found:", revealElements.length);

// const observer = new IntersectionObserver((entries) => {
//     entries.forEach((entry) => {
//         console.log("Element visible:", entry.isIntersecting);

//         if (entry.isIntersecting) {
//             entry.target.classList.add("is-visible");
//         } else {
//             entry.target.classList.remove("is-visible");
//         }
//     });
// }, {
//     threshold: 0.15
// });

// revealElements.forEach((element) => {
//     observer.observe(element);
// });




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
