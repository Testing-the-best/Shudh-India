
// ---------------- FIREBASE CONFIG (UNCHANGED) ----------------
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
const auth = firebase.auth();

// Variable to track the real-time listener
let ordersListener = null;


// ---------------- LOGIN LOGIC ----------------
function login() {

    auth.signInWithEmailAndPassword(email.value, password.value)
        .then(res => {

            const userEmail = res.user.email;

            db.collection("admins")
                .where("email", "==", userEmail)
                .get()
                .then(snapshot => {

                    if (snapshot.empty) {
                        alert("Not authorized");
                        auth.signOut();
                        return;
                    }

                    loginCard.classList.add("hidden");
                    dashboard.classList.remove("hidden");
                    loadOrders();

                });

        })
        .catch(e => alert(e.message));
}

// ---------------- MANUAL REFRESH BUTTON ----------------
function manualRefresh(btn) {
    // 1. Visual Feedback (Spin the icon)
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-sync-alt fa-spin"></i> Refreshing...`;
    btn.disabled = true;

    // 2. Reload Data
    loadOrders();

    // 3. Reset Button after 1 second
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1000);
}

// ---------------- LOAD ORDERS (UPDATED) ----------------
function loadOrders() {
    // STOP previous listener if it exists (Prevents duplicates)
    if (ordersListener) {
        ordersListener();
    }

    const ordersDiv = document.getElementById("orders");
    ordersDiv.style.opacity = "0.5"; // Visual cue that it's loading

    // START new listener and save it to variable
    ordersListener = db.collection("orders")
        .orderBy("createdAt", "desc")
        .onSnapshot(snap => {

            ordersDiv.style.opacity = "1"; // Done loading
            ordersDiv.innerHTML = "";

            if (snap.empty) {
                ordersDiv.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-clipboard-check" style="font-size:40px; color:#ddd; margin-bottom:15px;"></i>
                                <p>No active orders found.</p>
                            </div>
                        `;
                return;
            }

            snap.forEach(doc => {
                const o = doc.data();
                const id = doc.id;
                const isDone = o.status === 'done';
                const itemsList = o.items ? o.items.map(i => `• ${i.name}`).join("<br>") : "No items listed";

                ordersDiv.innerHTML += `
                        <div class="order-card ${isDone ? 'done' : 'pending'}">
                            <div class="card-header">
                                <div>
                                    <div class="customer-name">${o.name || 'Guest'}</div>
                                    <div class="order-id">ID: ${o.orderId || "N/A"}</div>

                                </div>
                                <span class="status-badge ${isDone ? 'done' : 'pending'}">
                                    ${o.status || 'PENDING'}
                                </span>
                            </div>

                            <div class="card-body">
                                <div class="info-row"><i class="fas fa-phone-alt"></i> ${o.phone || 'N/A'}</div>
                                <div class="info-row"><i class="fas fa-envelope"></i> ${o.email || 'N/A'}</div>
                                <div class="info-row"><i class="fas fa-map-marker-alt"></i> ${o.address || 'Location not set'}</div>
                                
                                <div class="info-row">
  <i class="fas fa-calendar-alt"></i>
  ${o.eventType || "Event"} on ${o.eventDate || "N/A"}
</div>

                                <div class="items-box">
                                    <span class="items-title">Order Contents</span>
                                    ${itemsList}
                                </div>
                                ${o.paymentImage ? `
<div style="margin-top:12px">
    <img src="${o.paymentImage}"
    style="width:100%;
    max-height:240px;
    object-fit:contain;
    border-radius:10px;
    border:1px solid #ddd;">
</div>
` : ""}

                                <div class="price-tag">₹${o.total}</div>
                            </div>

                            <div class="card-footer">
                                ${!isDone ?
                        `<button onclick="markDone('${id}')" class="primary-action">
                                        <i class="fas fa-check"></i> Complete
                                    </button>`
                        :
                        `<button disabled class="secondary" style="cursor:not-allowed; opacity:0.5">
                                        <i class="fas fa-check-double"></i> Completed
                                    </button>`
                    }
                                <button onclick="deleteOrder('${id}')" class="secondary">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                        `;
            });
        });
}

function markDone(id) {
    if (!confirm("Mark completed?")) return;
    db.collection("orders").doc(id).update({ status: "done" });
}

function deleteOrder(id) {
    if (!confirm("Delete this order?")) return;
    db.collection("orders").doc(id).delete();
}

