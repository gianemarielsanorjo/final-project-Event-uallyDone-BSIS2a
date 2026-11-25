
const API_BASE = `${window.location.origin}/api`;

let inventoryItems = [];

// LOAD INVENTORY ITEMS
async function loadItems() {
    const select = document.getElementById("itemSelect");

    try {
        const response = await fetch(`${API_BASE}/items`);

        if (!response.ok) {
            throw new Error("Failed to load inventory.");
        }

        inventoryItems = await response.json();

        select.innerHTML = '<option value="">Select an item</option>';

        const availableItems = inventoryItems.filter(item =>
            Number(item.available_quantity) > 0 &&
            item.status !== "Unavailable"
        );

        if (availableItems.length === 0) {
            select.innerHTML =
                '<option value="">No available items</option>';
            return;
        }

        availableItems.forEach(item => {
            const option = document.createElement("option");

            option.value = item._id;
            option.textContent =
                `${item.item_name} (${item.available_quantity} available)`;

            select.appendChild(option);
        });

    } catch (error) {
        console.error("Inventory loading error:", error);

        select.innerHTML =
            '<option value="">Unable to load inventory</option>';
    }
}


// UPDATE STOCK INFORMATION
document.getElementById("itemSelect").addEventListener("change", function() {
    const selectedItem = inventoryItems.find(
        item => item._id === this.value
    );

    const quantityInput = document.getElementById("quantityInput");
    const stockInfo = document.getElementById("stockInfo");

    if (selectedItem) {
        quantityInput.max = selectedItem.available_quantity;

        stockInfo.textContent =
            `Available stock: ${selectedItem.available_quantity}`;

        quantityInput.value = "";
    } else {
        quantityInput.removeAttribute("max");
        stockInfo.textContent = "";
    }
});


// LOAD RESERVATIONS
async function loadReservations() {
    const table = document.getElementById("reservationTable");

    try {
        const response = await fetch(`${API_BASE}/reservations`);

        if (!response.ok) {
            throw new Error("Failed to load reservations.");
        }

        const reservations = await response.json();

        table.innerHTML = "";

        if (!reservations.length) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.className = "text-center text-muted";
            cell.textContent = "No reservations found.";

            row.appendChild(cell);
            table.appendChild(row);
            return;
        }

        reservations.forEach(reservation => {
            const row = document.createElement("tr");

            const itemName =
                reservation.item?.item_name || "Unknown Item";

            const eventDate = reservation.event_date
                ? new Date(reservation.event_date).toLocaleDateString()
                : "N/A";

            const values = [
                reservation.event_name,
                itemName,
                reservation.quantity,
                eventDate
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "N/A";
                row.appendChild(cell);
            });

            const statusCell = document.createElement("td");
            const badge = document.createElement("span");

            const status = reservation.status || "Pending";

            badge.className = `status ${status}`;
            badge.textContent = status;

            statusCell.appendChild(badge);
            row.appendChild(statusCell);

            table.appendChild(row);
        });

    } catch (error) {
        console.error("Reservation loading error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Unable to load reservations. Check your server.
                </td>
            </tr>
        `;
    }
}


// SUBMIT RESERVATION
document.getElementById("reservationForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const form = this;
    const submitButton = document.getElementById("submitButton");
    const message = document.getElementById("formMessage");
    const formData = new FormData(form);

    const selectedItem = inventoryItems.find(
        item => item._id === formData.get("item")
    );

    const quantity = Number(formData.get("quantity"));

    if (!selectedItem) {
        message.innerHTML = `
            <div class="alert alert-danger">
                Please select an inventory item.
            </div>
        `;
        return;
    }

    if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > selectedItem.available_quantity
    ) {
        message.innerHTML = `
            <div class="alert alert-danger">
                Invalid quantity. Please check available stock.
            </div>
        `;
        return;
    }

    const reservationData = {
        event_name: formData.get("event_name"),
        item: formData.get("item"),
        quantity: quantity,
        event_date: formData.get("event_date"),
        description: formData.get("description")
    };

    try {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
        message.innerHTML = "";

        const response = await fetch(`${API_BASE}/reservations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reservationData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Reservation failed.");
        }

        message.innerHTML = `
            <div class="alert alert-success">
                Reservation submitted successfully!
            </div>
        `;

        form.reset();

        document.getElementById("stockInfo").textContent = "";
        document.getElementById("quantityInput").removeAttribute("max");

        await loadItems();
        await loadReservations();

        setTimeout(() => {
            const modalElement =
                document.getElementById("addReservationModal");

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            if (modal) {
                modal.hide();
            }

            message.innerHTML = "";
        }, 1000);

    } catch (error) {
        message.textContent = "";

        const alert = document.createElement("div");
        alert.className = "alert alert-danger";
        alert.textContent = error.message;

        message.appendChild(alert);

        console.error("Reservation submission error:", error);

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Reservation";
    }
});


// PREVENT PAST EVENT DATES
document.getElementById("eventDate").min =
    new Date().toLocaleDateString("en-CA");


// INITIAL PAGE LOAD
loadItems();
loadReservations();
