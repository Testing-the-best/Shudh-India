
const firebaseConfig = {
    apiKey: "AIzaSyBt8S-hhNLDOOCP9wBqzfX2RqE4lh9AODs",
    authDomain: "shudh-india.firebaseapp.com",
    projectId: "shudh-india",
    storageBucket: "shudh-india.firebasestorage.app",
    messagingSenderId: "1065730988145",
    appId: "1:1065730988145:web:733d8f2c1b0a0e426663d0"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

window.addEventListener('load', function () {
    const loader = document.getElementById('pageLoader');
    setTimeout(() => { loader.classList.add('hidden'); }, 500);
});

document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });

    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    updateCartBadge();
});

let cart = JSON.parse(localStorage.getItem("amity_cart")) || [];

function saveCart() {
    localStorage.setItem("amity_cart", JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    saveCart();
    showUploadToast(`${name} Added to Cart!`, "success");
}

function updateCartBadge() {
    const badge = document.getElementById("cartBadge");
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    badge.innerText = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
}

function toggleCart() {
    const modal = document.getElementById("cartModal");
    if (modal.style.display === "flex") {
        modal.style.display = "none";
    } else {
        renderCart();
        modal.style.display = "flex";
    }
}

function closeCart() {
    document.getElementById("cartModal").style.display = "none";
}

function renderCart() {
    const container = document.getElementById("cartItemsContainer");
    const checkoutBtn = document.getElementById("cartCheckoutBtn");
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:20px; color:#777;'>Your cart is empty.</p>";
        document.getElementById("cartTotalAmount").innerText = "₹0";
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = "0.5";
        return;
    }

    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = "1";

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        container.innerHTML += `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p style="font-size:13px; color:#666;">₹${item.price}</p>
                        </div>
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="changeQuantity(${index}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
                        </div>
                    </div>
                `;
    });
    document.getElementById("cartTotalAmount").innerText = "₹" + total;
}

function changeQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    renderCart();
}

function proceedToCheckout() {
    if (cart.length === 0) return;
    closeCart();
    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById("finalAmountDisplay").innerText = "₹" + total;
    document.getElementById("userForm").style.display = "flex";
}

function closeCheckout() {
    document.getElementById("userForm").style.display = "none";
    document.getElementById('paymentImage').value = '';
}

function closeSuccess() {
    document.getElementById("successModal").style.display = "none";
    window.location.reload();
}

function generateOrderId() {
    return "AMITY-" + Date.now().toString().slice(-6);
}

function selectScreenshot() {
    document.getElementById('paymentImage').click();
}

document.getElementById('paymentImage').addEventListener('change', function (e) {
    if (e.target.files.length > 0) {
        uploadToOrder(e.target.files[0]);
    }
});

function uploadToOrder(file) {
    const custName = document.getElementById("custName").value.trim();
    const custPhone = document.getElementById("custPhone").value.trim();

    if (!custName || !custPhone) {
        showUploadToast("Please fill in your Name & Phone Number.", "error");
        document.getElementById('paymentImage').value = '';
        return;
    }

    if (custPhone.length !== 10) {
        showUploadToast("Please enter a valid 10-digit phone number.", "error");
        document.getElementById('paymentImage').value = '';
        return;
    }

    if (file.size > 1048576) {
        showUploadToast("Image too large! (Max 1MB)", "error");
        document.getElementById('paymentImage').value = '';
        return;
    }

    showUploadToast("Processing Order...", "success");

    const reader = new FileReader();
    reader.onloadend = function () {
        const base64Image = reader.result;
        const orderId = generateOrderId();
        let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        db.collection("orders").doc(orderId).set({
            orderId: orderId,
            name: custName,
            phone: "+91" + custPhone,
            email: document.getElementById("custEmail").value || "N/A",
            address: "Stall Pickup (Amity)",
            total: total,
            items: cart,
            paymentImage: base64Image,
            status: "pending",
            eventType: "Amity Mobile Order",
            eventDate: new Date().toISOString().split('T')[0],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
            .then(() => {
                showUploadToast("Order Placed Successfully ✔", "success");
                document.getElementById("successOrderId").innerText = orderId;
                document.getElementById("userForm").style.display = "none";
                document.getElementById("successModal").style.display = "flex";

                cart = [];
                saveCart();
            })
            .catch((e) => {
                showUploadToast("Order failed – try again", "error");
                console.error(e);
            });
    };
    reader.readAsDataURL(file);
}

function showUploadToast(message, type = "success") {
    const toast = document.getElementById("uploadToast");
    toast.textContent = message;
    toast.className = `upload-toast show ${type}`;
    setTimeout(() => { toast.classList.remove("show"); }, 3000);
}
