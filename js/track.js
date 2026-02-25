// --- 1. CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyBt8S-hhNLDOOCP9wBqzfX2RqE4lh9AODs",
    authDomain: "shudh-india.firebaseapp.com",
    projectId: "shudh-india",
    storageBucket: "shudh-india.firebasestorage.app",
    messagingSenderId: "1065730988145",
    appId: "1:1065730988145:web:733d8f2c1b0a0e426663d0"
};

// Initialize
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- 2. MAIN FUNCTION ---
function fetchOrders() {
    const phoneInput = document.getElementById('phoneInput').value.trim();
    const list = document.getElementById('ordersList');
    const loader = document.getElementById('loader');

    // Basic Validation
    if (phoneInput.length < 10) {
        alert("Please enter a valid phone number.");
        return;
    }

    // Reset UI
    list.innerHTML = "";
    loader.style.display = "block";

    // Format phone (+91)
    const formattedPhone = "+91" + phoneInput;

    // --- FIRESTORE QUERY ---
    db.collection("orders")
        .where("phone", "==", formattedPhone)
        .orderBy("createdAt", "desc")
        .get()
        .then((snapshot) => {
            loader.style.display = "none";

            if (snapshot.empty) {
                list.innerHTML = `<p class="no-orders">No orders found for this number.</p>`;
                return;
            }

            snapshot.forEach((doc) => {
                const order = doc.data();

                // --- SAFETY CHECKS (Prevent 'undefined') ---
                const orderId = order.orderId || "ID Missing";
                const status = order.status || "Pending";
                const total = order.total || "Price N/A";
                const eventType = order.eventType || "General Event";

                // Date Check
                let dateStr = "Date Pending";
                if (order.createdAt) {
                    dateStr = order.createdAt.toDate().toLocaleDateString("en-IN", {
                        day: 'numeric', month: 'short', year: 'numeric'
                    });
                } else if (order.eventDate) {
                    // Fallback to eventDate if createdAt is missing
                    dateStr = order.eventDate;
                }

                // Items Check
                let itemsHtml = "";
                if (order.items && order.items.length > 0) {
                    itemsHtml = order.items.map(item =>
                        `<div>• ${item.name || 'Item'} <span style="color:#777">x ${item.quantity || 1}</span></div>`
                    ).join('');
                } else {
                    itemsHtml = "<div>• Custom Order (Items not listed)</div>";
                }

                // --- GENERATE HTML ---
                const cardHtml = `
                    <div class="order-card ${status.toLowerCase()}">
                        <div class="card-header">
                            <span class="order-id">#${orderId}</span>
                            <span class="status-badge">${status}</span>
                        </div>
                        
                        <div class="event-details">
                            <i class="fas fa-calendar-alt"></i> ${dateStr}<br>
                            <i class="fas fa-glass-cheers"></i> Event: ${eventType}
                        </div>

                        <div class="item-list">
                            ${itemsHtml}
                        </div>

                        <div class="card-footer">
                            Total: ${total}
                        </div>
                    </div>
                `;

                list.innerHTML += cardHtml;
            });
        })
        .catch((error) => {
            loader.style.display = "none";
            console.error(error);
            list.innerHTML = `<p style="color:red; text-align:center;">Error loading data.</p>`;
        });
}