let cart = JSON.parse(localStorage.getItem("cart")) || [];
function generateOrderId() {
    return "ORD-" + Date.now().toString().slice(-6);
}

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

document.addEventListener("DOMContentLoaded", () => {
    updateCart();

    // 🔒 Prevent past date selection
    const eventDateInput = document.getElementById("eventDate");
    if (eventDateInput) {
        const today = new Date().toISOString().split("T")[0];
        eventDateInput.setAttribute("min", today);
    }
});





//-------------cart system-----------
// ================= CART LOGIC =================


function addToCart(name, price, btn) {

    if (cart.some(i => i.name === name)) return; // prevent duplicates

    cart.push({ name, price });

    updateCart();
}



function updateCart() {

    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, i) => {
        total += item.price;

        cartItems.innerHTML += `
    <div class="cart-item">
      <b>${item.name}</b><br>
      ₹${item.price}
      <button onclick="removeItem(${i})">x</button>
    </div>
   `;
    });

    totalPrice.innerText = total;

    // save cart
    localStorage.setItem("cart", JSON.stringify(cart));

    // 🔥 sync buttons with cart
    document.querySelectorAll(".btn-add").forEach(btn => {
        const name = btn.getAttribute("onclick").split("'")[1];

        const exists = cart.some(i => i.name === name);

        if (exists) {
            btn.innerText = "Added ✓";
            btn.disabled = true;
            btn.style.background = "#C5A059";
        } else {
            btn.innerText = "Add to Menu";
            btn.disabled = false;
            btn.style.background = "#2A0A0A";
        }
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    document.getElementById("cartCount").innerText = cart.length;


}



function removeItem(i) {
    cart.splice(i, 1);
    updateCart();
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
    const phone = custPhone.value.trim();
    const email = custEmail.value.trim();
    const eventType = document.getElementById("eventType").value;
    const eventDate = document.getElementById("eventDate").value;

    const phoneValid = /^[6-9]\d{9}$/.test(phone);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    if (!custName.value || !custAddress.value) {
        alert("Please fill all details");
        return;
    }

    if (!phoneValid) {
        alert("Please enter a valid 10-digit mobile number");
        return;
    }

    if (!emailValid) {
        alert("Please enter a valid email address");
        return;
    }

    if (!eventType) {
        alert("Please select event type");
        return;
    }

    if (!eventDate) {
        alert("Please select event date");
        return;
    }

    document.getElementById("qrSection").style.display = "block";
}














let orderPlaced = false;   // prevents double order

function placeOrder() {

    if (!custName.value || !custPhone.value || !custEmail.value) {
        alert("Please fill all details");
        return;
    }

    if (cart.length === 0) {
        alert("Your cart is empty");
        return;
    }

    const orderId = generateOrderId();

    let items = cart.map(i => i.name).join(", ");
    let total = totalPrice.innerText;

    emailjs.send("service_ckwt5qn", "template_wslh0f7", {
        order_id: orderId,
        customer_name: custName.value,
        phone: "+91" + custPhone.value,

        reply_to: custEmail.value,
        address: custAddress.value,
        items: items,
        total: total
    })
        .then(() => {

            // clear cart
            cart = [];
            updateCart();

            // show success screen
            document.getElementById("successOrderId").innerText = orderId;
            document.getElementById("successModal").style.display = "flex";


        })
        .catch(() => {
            alert("Order failed");
        });
}


function closeSuccess() {
    document.getElementById("successModal").style.display = "none";
}













//--------checks if the customer details are filled---
const inputs = ["custName", "custPhone", "custEmail", "custAddress"];

inputs.forEach(id => {
    document.getElementById(id).addEventListener("input", checkForm);
});
document.getElementById("eventType").addEventListener("change", checkForm);
document.getElementById("eventDate").addEventListener("change", checkForm);


function checkForm() {

    const name = custName.value.trim();
    const phone = custPhone.value.trim();
    const email = custEmail.value.trim();
    const address = custAddress.value.trim();
    const eventType = document.getElementById("eventType").value;
    const eventDate = document.getElementById("eventDate").value;


    const phoneValid = /^[6-9]\d{9}$/.test(phone);




    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const btn = document.getElementById("payBtn");

    const isValid =
        name &&
        phoneValid &&
        emailValid &&
        address &&
        eventType &&
        eventDate &&
        cart.length > 0;

    btn.disabled = !isValid;
    btn.style.opacity = isValid ? "1" : "0.6";
}









// -------------firebase ----------
const db = firebase.firestore();




//update cart
document.addEventListener("DOMContentLoaded", () => {
    updateCart();
});



function selectScreenshot() {
    document.getElementById("paymentImage").click();
}

document.getElementById("paymentImage").addEventListener("change", uploadScreenshot);

function uploadScreenshot(e) {

    if (cart.length === 0) {
        showUploadToast("Cart is empty", "error");
        return;
    }

    const file = e.target.files[0];
    if (!file) return;

    // 🚫 File size limit (2MB)
    if (file.size > 2 * 1024 * 1024) {
        showUploadToast("Upload failed – use smaller image", "error");
        return;
    }

    showUploadToast("Uploading payment screenshot…");

    const reader = new FileReader();

    reader.onload = function () {

        const base64Image = reader.result;
        const total = totalPrice.innerText;
        const orderId = generateOrderId();

        db.collection("orders").add({
            orderId: orderId,
            name: custName.value,
            phone: "+91" + custPhone.value,
            email: custEmail.value,
            address: custAddress.value,
            total: total,
            items: cart,
            paymentImage: base64Image,
            status: "pending",
            eventType: document.getElementById("eventType").value,
            eventDate: document.getElementById("eventDate").value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
            .then(() => {
                showUploadToast("Upload completed ✔", "success");

                document.getElementById("successOrderId").innerText = orderId;
                document.getElementById("successModal").style.display = "flex";

                // 2. Hide the Checkout Form explicitly
                document.getElementById("userForm").style.display = "none";

                cart = [];
                localStorage.removeItem("cart");
                updateCart();
            })
            .catch(() => {
                showUploadToast("Upload failed – try again", "error");
            });
    };

    reader.readAsDataURL(file);
}



function showUploadToast(message, type = "success") {
    const toast = document.getElementById("uploadToast");
    toast.textContent = message;
    toast.className = `upload-toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}
