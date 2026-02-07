let cart = JSON.parse(localStorage.getItem("cart")) || [];

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


function addToCart(name, price, btn) {

  if(cart.some(i=>i.name===name)) return; // prevent duplicates

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




let orderPlaced = false;   // prevents double order

function placeOrder() {

    if (orderPlaced) {
        alert("Order already placed.");
        return;
    }

    if (!custName.value || !custPhone.value || !custEmail.value) {
        alert("Please fill all details");
        return;
    }

    let items = cart.map(i => i.name).join(", ");
    let total = document.getElementById("totalPrice").innerText;
    db.collection("orders").add({
        name: custName.value,
        phone: custPhone.value,
        email: custEmail.value,
        address: custAddress.value,
        total: total,
        items: cart,              // <-- add items
        status: "pending",        // <-- add status
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });



    // -------- WHATSAPP FIRST (so you don't waste EmailJS credits while testing)
    const msg = `Hi,

I have completed the payment.

Name: ${custName.value}
Items: ${items}
Total: ₹${total}

Please find the payment screenshot attached.`;

    window.open("https://wa.me/916387343878?text=" + encodeURIComponent(msg), "_blank");


    localStorage.removeItem("cart"); //empties cart after successful order
    cart = [];
    updateCart();



    // -------- EMAIL (only after whatsapp opened)
    // emailjs.send("service_ckwt5qn", "template_wslh0f7", {
    //     customer_name: custName.value,
    //     phone: custPhone.value,
    //     reply_to: custEmail.value,
    //     address: custAddress.value,
    //     items: items,
    //     total: total
    // }).then(() => {

    //     orderPlaced = true;

    //     alert("Order placed successfully!");

    //     cart = [];
    //     updateCart();

    //     document.getElementById("qrSection").style.display = "none";
    //     document.getElementById("cartModal").classList.remove("active");

    // }).catch(err => {
    //     console.log(err);
    //     alert("Email failed");
    // });

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





//-------------share ss opens whatsapp------


window.sharePayment = function () {

    if (!custName.value) {
        alert("Please enter your name first");
        return;
    }

    let total = document.getElementById("totalPrice").innerText;

    const msg = `Hi,

I have completed the payment.

Name: ${custName.value}
Total: ₹${total}

Please find the payment screenshot attached.`;


    window.open(
        "https://wa.me/919452737817?text=" + encodeURIComponent(msg),
        "_blank"
    );
};








// -------------firebase ----------
const db = firebase.firestore();




//update cart
document.addEventListener("DOMContentLoaded", () => {
    updateCart();
});
