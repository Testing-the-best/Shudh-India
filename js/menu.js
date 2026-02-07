document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SETUP SELECTORS ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    // --- 2. SCROLL REVEAL ANIMATION (THE NEW PART) ---
    const observerOptions = {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before it hits bottom of screen
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the class that triggers the CSS transition
                entry.target.classList.add('visible');
                // Stop watching this element (so it doesn't fade out again)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements we want to animate
    const animatedElements = document.querySelectorAll('.section-header, .subsection-title, .menu-card');

    animatedElements.forEach(el => {
        el.classList.add('scroll-fade'); // Add base hidden class
        revealObserver.observe(el);      // Start watching
    });

    // --- 3. CLICK SCROLLING ---
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 75;
                window.scrollTo({
                    top: offsetTop,
                    behavior: "smooth"
                });
            }
        });
    });

    // --- 4. ACTIVE BUTTON HIGHLIGHTER ---
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 150)) {
                current = '#' + section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === current) {
                link.classList.add('active');
            }
        });
    });
});





//-------------cart system-----------
// ================= CART LOGIC =================
let cart = [];

function addToCart(name, price, btn) {

    cart.push({ name, price });

    btn.innerText = "Added ✓";
    btn.disabled = true;
    btn.style.background = "#C5A059";

    updateCart();
}


function updateCart() {

    document.getElementById("cartCount").innerText = cart.length;

    const items = document.getElementById("cartItems");
    items.innerHTML = "";

    let total = 0;

    cart.forEach((item, i) => {
        total += item.price;
        items.innerHTML += `
     <div class="cart-item">
        <div>
           <strong>${item.name}</strong><br>₹${item.price}
        </div>
        <button onclick="removeItem(${i})">X</button>
     </div>
   `;
    });

    document.getElementById("totalPrice").innerText = total;

    // ---------- NEW ----------
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (cart.length === 0) {
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = "0.5";
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = "1";
    }
}


function removeItem(i) {

    let removed = cart[i].name;

    cart.splice(i, 1);
    updateCart();

    document.querySelectorAll(".btn-add").forEach(btn => {
        if (btn.innerText.includes("Added") && btn.parentElement.innerText.includes(removed)) {
            btn.disabled = false;
            btn.innerText = "Add to Menu";
            btn.style.background = "#2A0A0A";
        }
    });
}


function openCart() {
    document.getElementById("cartModal").classList.add("active");
    document.body.classList.add("cart-open");
}

function closeCart(e) {
    if (!e || e.target.id === "cartModal") {
        document.getElementById("cartModal").classList.remove("active");
        document.body.classList.remove("cart-open");
    }
}


function showForm() {

    if (cart.length === 0) {
        alert("Please add items to cart first");
        return;
    }

    document.getElementById("userForm").style.display = "flex";

    ["custName", "custPhone", "custEmail", "custAddress"].forEach(id => {
        document.getElementById(id).addEventListener("input", checkForm);
    });

    checkForm();
}



function showQR() {

    const phoneValid = /^[6-9]\d{9}$/.test(custPhone.value);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(custEmail.value);

    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    if (!custName.value || !custAddress.value) {
        alert("Please fill all details");
        return;
    }

    if (!phoneValid) {
        alert("Please enter valid 10-digit mobile number");
        return;
    }

    if (!emailValid) {
        alert("Please enter valid email address");
        return;
    }

    document.getElementById("qrSection").style.display = "block";
}









//-----------emailjs---------
(function () {
    emailjs.init("7lwYU5Uw7qyTtx40_");
})();




function placeOrder() {

    if (!custName.value || !custPhone.value || !custEmail.value) {
        alert("Please fill all details");
        return;
    }

    let items = cart.map(i => i.name).join(", ");
    let total = document.getElementById("totalPrice").innerText;

    console.log("SENDING:", {
        customer_name: custName.value,
        phone: custPhone.value,
        email: custEmail.value,
        address: custAddress.value,
        items: items,
        total: total
    });

    emailjs.send("service_ckwt5qn", "template_wslh0f7", {
        customer_name: custName.value,
        phone: custPhone.value,
        reply_to: custEmail.value,   // <-- IMPORTANT
        address: custAddress.value,
        items: items,
        total: total
    })

        .then(res => {
            console.log("SUCCESS:", res);

            alert("Order placed!");

            window.open(`https://wa.me/919452737817?text=Thanks for ordering. Please send payment screenshot with your name.`);

        })
        .catch(err => {
            console.log("EMAIL ERROR FULL:", err);
            alert("Email failed – check console");
        });
}







//---------------auto whatapp message-------------

function sendWhatsApp(name, total) {

    const msg = `Hi ${name}, thanks for ordering from Shudh India Catering.

Total: ₹${total}

Please send your UPI payment screenshot WITH YOUR NAME to this WhatsApp number.

We will confirm shortly.`;

    window.open(`https://wa.me/919452737817?text=${encodeURIComponent(msg)}`, "_blank");
}






//--------checks if the customer details are filled---
const inputs = ["custName", "custPhone", "custEmail", "custAddress"];

inputs.forEach(id => {
    document.getElementById(id).addEventListener("input", checkForm);
});

function checkForm() {

    const name = custName.value.trim();
    const phone = custPhone.value.trim();
    const email = custEmail.value.trim();
    const address = custAddress.value.trim();

    const phoneValid = /^[6-9]\d{9}$/.test(phone);   // Indian mobile
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const btn = document.getElementById("payBtn");

    if (name && phoneValid && emailValid && address && cart.length > 0) {
        btn.disabled = false;
        btn.style.opacity = "1";
    } else {
        btn.disabled = true;
        btn.style.opacity = "0.6";
    }
}

