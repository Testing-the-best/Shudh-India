// page loading animation

// 1. ENTRY ANIMATION (Fade Out on Load)
window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');
    // Small delay to ensure the brand logo is seen briefly
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 500);
});

// 2. EXIT ANIMATION (Fade In on Click)
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('pageLoader');
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetUrl = this.getAttribute('href');

            // Ignore external links, anchors (#), or mail/tel links
            if (!targetUrl || targetUrl.startsWith('#') || targetUrl.startsWith('mailto:') || targetUrl.startsWith('tel:') || targetUrl.includes('http')) {
                return;
            }

            // Stop the browser from moving immediately
            e.preventDefault();

            // Show the loader again (Remove hidden class)
            loader.classList.remove('hidden');

            // Wait 600ms for the fade-in, then go to the new page
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 600);
        });
    });
});


window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        document.getElementById('pageLoader').classList.add('hidden');
    }
});






// 1. Navbar Background Change on Scroll
const navbar = document.getElementById('navbar');
window.onscroll = () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
};

// 2. Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');

    // Animate Links Fade In
    links.forEach((link, index) => {
        if (link.style.animation) {
            link.style.animation = '';
        } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
    });

    // Hamburger Animation (Optional toggle class for X shape)
    hamburger.classList.toggle('toggle');
});

// 3. Smooth Scrolling & Close Mobile Menu on Click
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Close mobile menu if open
        if (navLinks.classList.contains('nav-active')) {
            navLinks.classList.remove('nav-active');
        }

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Calculate position minus navbar height (80px)
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    });
});

// 4. Reveal Animations on Scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
});

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));


/* --- NUMBER COUNTING ANIMATION --- */

const counters = document.querySelectorAll('.counter');
const speed = 200; // The lower the number, the faster the count

const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;

            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;

                // Lower inc = slower counting
                const inc = target / speed;

                // Check if target is reached
                if (count < target) {
                    // Add increment and run function again
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                }
            };

            updateCount();

            // Stop observing once animation has run once
            observer.unobserve(counter);
        }
    });
}, {
    rootMargin: '0px 0px -50px 0px', // Starts animation slightly before element is fully visible
    threshold: 0.5
});

counters.forEach(counter => {
    counterObserver.observe(counter);
});





/* =========================================
   6. MEDIA LIGHTBOX (MODAL) LOGIC
   ========================================= */

const modal = document.getElementById("mediaModal");
const modalImg = document.getElementById("fullImage");
const closeBtn = document.querySelector(".close-btn");

// 1. Select all media cards
const mediaCards = document.querySelectorAll('.media-card');

mediaCards.forEach(card => {
    card.addEventListener('click', function() {
        // Find the image inside the clicked card
        const imgInside = this.querySelector('img');
        
        if (imgInside) {
            // Show the modal
            modal.style.display = "flex";
            // Small delay to allow display:flex to apply before opacity transition
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
            
            // Set the modal image source to match the clicked image
            modalImg.src = imgInside.src;
        }
    });
});

// 2. Close Modal Functions
function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = "none";
    }, 300); // Wait for fade out
}

// Click the 'X' to close
closeBtn.addEventListener('click', closeModal);

// Click anywhere outside the image to close
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// Press 'Escape' key to close
document.addEventListener('keydown', function(e) {
    if (e.key === "Escape" && modal.style.display === "flex") {
        closeModal();
    }
});