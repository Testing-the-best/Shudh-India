
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
let currentUserRole = "admin"; // Global variable to store role

function login() {
    auth.signInWithEmailAndPassword(email.value, password.value)
        .then(res => {
            const userEmail = res.user.email;

            db.collection("admins").where("email", "==", userEmail).get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        alert("Not authorized");
                        auth.signOut();
                        return;
                    }

                    // Get role from database
                    const adminData = snapshot.docs[0].data();
                    currentUserRole = adminData.role || "admin";

                    // If Super Admin, show the extra tab!
                    if (currentUserRole === "super_admin") {
                        document.getElementById("tab-admins").classList.remove("hidden");
                    }

                    loginCard.classList.add("hidden");
                    dashboard.classList.remove("hidden");

                    document.getElementById("adminEmailDisplay").innerText = userEmail + ` (${currentUserRole})`;

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
                const itemsList = o.items
                    ? o.items.map(i => `• ${i.name} x ${i.quantity ?? i.qty ?? 1}`).join("<br>")
                    : "No items listed";

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


// ---------------- TAB NAVIGATION ----------------
function switchTab(tabName) {
    // Hide both sections
    document.getElementById("section-orders").classList.add("hidden");
    document.getElementById("section-admins").classList.add("hidden");

    // Remove active styling from buttons
    document.getElementById("tab-orders").classList.remove("active");
    document.getElementById("tab-admins").classList.remove("active");

    // Show selected section
    if (tabName === 'orders') {
        document.getElementById("section-orders").classList.remove("hidden");
        document.getElementById("tab-orders").classList.add("active");
    } else {
        document.getElementById("section-admins").classList.remove("hidden");
        document.getElementById("tab-admins").classList.add("active");
        loadAdminsList(); // Load admins when tab is clicked
    }
}

// ---------------- ADMIN MANAGEMENT (SUPER ADMIN ONLY) ----------------
function loadAdminsList() {
    const list = document.getElementById("adminsList");
    list.innerHTML = "<p>Loading admins...</p>";

    db.collection("admins").get().then(snap => {
        list.innerHTML = "";
        snap.forEach(doc => {
            const data = doc.data();
            const id = doc.id;
            const isSuper = data.role === "super_admin";

            list.innerHTML += `
                <div class="order-card" style="padding: 20px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div class="customer-name">${data.email}</div>
                        <span class="status-badge ${isSuper ? 'pending' : 'done'}">
                            ${isSuper ? 'SUPER ADMIN' : 'NORMAL ADMIN'}
                        </span>
                    </div>
                    <button onclick="removeAdmin('${id}')" class="secondary" style="width:auto; padding:8px 15px;">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;
        });
    });
}

async function addNewAdmin() {
    const emailInput = document.getElementById("newAdminEmail").value.trim().toLowerCase();
    const passwordInput = document.getElementById("newAdminPassword").value.trim();
    const roleInput = document.getElementById("newAdminRole").value;

    // 1. Validation
    if (!emailInput || passwordInput.length < 6) {
        alert("Please enter a valid email and a password of at least 6 characters.");
        return;
    }
    try {
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = "Processing...";
        btn.disabled = true;

        const secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");

        try {
            // 3. Try to create the actual user login
            await secondaryApp.auth().createUserWithEmailAndPassword(emailInput, passwordInput);

        } catch (authError) {
            // THE SMART FIX: Catch the specific "already in use" error
            if (authError.code === 'auth/email-already-in-use') {
                alert(`Note: An account for ${emailInput} already exists! Restoring their admin permissions using their old password.`);
            } else {
                // If it's a different error (like a bad email format), throw it to the main catch block
                throw authError;
            }
        }

        await secondaryApp.auth().signOut();
        await secondaryApp.delete();

        // 4. Save/Update their role to the Firestore database
        await db.collection("admins").doc(emailInput).set({
            email: emailInput,
            role: roleInput
        });

        // Success!
        alert(`Successfully updated permissions for ${emailInput} as ${roleInput}!`);

        document.getElementById("newAdminEmail").value = "";
        document.getElementById("newAdminPassword").value = "";
        loadAdminsList();

        btn.innerText = originalText;
        btn.disabled = false;

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
        event.target.innerText = "Create Account";
        event.target.disabled = false;
    }
}

function removeAdmin(id) {
    if (!confirm("Are you sure you want to remove this admin's access?")) return;

    db.collection("admins").doc(id).delete()
        .then(() => loadAdminsList())
        .catch(e => alert(e.message));
}