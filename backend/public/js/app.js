
async function loadOrders() {
    const message = document.getElementById("message");
    const container = document.getElementById("ordersContainer");

    if (!message || !container) {
        console.error("Orders HTML elements not found!");
        return;
    }

    try {
        message.textContent = "Loading orders...";
        container.innerHTML = "";

        const res = await fetch("/api/orders");

        if (!res.ok) {
            throw new Error("Failed to load orders");
        }

        const data = await res.json();

        console.log("Orders received:", data);

        if (data.length === 0) {
            message.textContent = "No orders found.";
            return;
        }

        message.textContent = "Orders loaded successfully!";

        data.forEach(order => {
            const card = document.createElement("div");
            card.className = "card shadow-sm mb-3";

            const userName = order.user
                ? order.user.full_name
                : "Unknown User";

            const productNames = order.items
                .map(item => item.item_name)
                .join(", ");

            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">Order Details</h5>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>User Name:</strong> ${userName}</p>
                    <p><strong>Products:</strong> ${productNames}</p>
                    <h5 class="text-success">
                        Total Amount: ₱${Number(order.totalAmount).toLocaleString("en-PH", {
                            minimumFractionDigits: 2
                        })}
                    </h5>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading orders:", error);
        message.textContent = error.message;
    }
}

document.addEventListener("DOMContentLoaded", loadOrders);

