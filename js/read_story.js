
// Intersection Observer for Fading In Elements
const observerOptions = {
    threshold: 0.2, // Trigger when 20% visible
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            // Add 'active' class to sticky cards
            if (entry.target.classList.contains('exp-card')) {
                entry.target.classList.add('active');
            }
            // Fade in director section
            if (entry.target.classList.contains('hidden-fade')) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        }
    });
}, observerOptions);

// Observe Vision Section
const visionElements = document.querySelectorAll('.hidden-fade');
visionElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.8s ease-out";
    observer.observe(el);
});

// Observe Sticky Cards
const stickyCards = document.querySelectorAll('.exp-card');
stickyCards.forEach((el) => observer.observe(el));


