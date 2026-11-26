
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


// UPDATE STOCK INFORMATION IN ADD FORM
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

            cell.colSpan = 6;
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

            // STATUS
            const statusCell = document.createElement("td");
            const badge = document.createElement("span");

            const status = reservation.status || "Pending";

            badge.className = `status ${status}`;
            badge.textContent = status;

            statusCell.appendChild(badge);
            row.appendChild(statusCell);

            // ACTIONS
            const actionCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "btn btn-sm btn-warning me-1";
            editButton.textContent = "Edit";

            editButton.addEventListener("click", () => {
                editReservation(reservation._id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn btn-sm btn-danger";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteReservation(reservation._id);
            });

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);

            row.appendChild(actionCell);
            table.appendChild(row);
        });

    } catch (error) {
        console.error("Reservation loading error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Unable to load reservations. Check your server.
                </td>
            </tr>
        `;
    }
}


// SUBMIT NEW RESERVATION
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
        quantity > Number(selectedItem.available_quantity)
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
        message.innerHTML = "";

        const alertBox = document.createElement("div");
        alertBox.className = "alert alert-danger";
        alertBox.textContent = error.message;

        message.appendChild(alertBox);

        console.error("Reservation submission error:", error);

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Reservation";
    }
});


// LOAD INVENTORY OPTIONS FOR EDIT MODAL
function loadEditItemOptions(selectedItemId) {
    const select = document.getElementById("editItemSelect");

    select.innerHTML = '<option value="">Select an item</option>';

    inventoryItems.forEach(item => {
        const option = document.createElement("option");

        option.value = item._id;
        option.textContent =
            `${item.item_name} (${item.available_quantity} available)`;

        select.appendChild(option);
    });

    select.value = selectedItemId || "";
}


// UPDATE EDIT STOCK INFORMATION
document.getElementById("editItemSelect").addEventListener("change", function() {
    const selectedItem = inventoryItems.find(
        item => item._id === this.value
    );

    const quantityInput = document.getElementById("editQuantity");
    const stockInfo = document.getElementById("editStockInfo");

    if (selectedItem) {
        quantityInput.max = selectedItem.available_quantity;

        stockInfo.textContent =
            `Available stock: ${selectedItem.available_quantity}`;
    } else {
        quantityInput.removeAttribute("max");
        stockInfo.textContent = "";
    }
});


// EDIT RESERVATION
async function editReservation(id) {
    try {
        const response = await fetch(`${API_BASE}/reservations/${id}`);

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to get reservation.");
        }

        const reservation = result.reservation || result;

        document.getElementById("editReservationId").value =
            reservation._id;

        document.getElementById("editEventName").value =
            reservation.event_name || "";

        const itemId =
            reservation.item?._id || reservation.item;

        loadEditItemOptions(itemId);

        document.getElementById("editQuantity").value =
            reservation.quantity || 1;

        document.getElementById("editEventDate").value =
            reservation.event_date
                ? new Date(reservation.event_date).toISOString().split("T")[0]
                : "";

        document.getElementById("editDescription").value =
            reservation.description || "";

        document.getElementById("editStatus").value =
            reservation.status || "Pending";

        const selectedItem = inventoryItems.find(
            item => item._id === itemId
        );

        document.getElementById("editStockInfo").textContent =
            selectedItem
                ? `Available stock: ${selectedItem.available_quantity}`
                : "";

        // Keep the existing reservation quantity editable
        // even if the current available quantity is lower.
        const quantityInput = document.getElementById("editQuantity");

        if (selectedItem) {
            quantityInput.max = Math.max(
                Number(selectedItem.available_quantity),
                Number(reservation.quantity)
            );
        }

        document.getElementById("editFormMessage").innerHTML = "";

        const modal = new bootstrap.Modal(
            document.getElementById("editReservationModal")
        );

        modal.show();

    } catch (error) {
        alert(error.message);
        console.error("Edit reservation error:", error);
    }
}


// SAVE EDITED RESERVATION
document.getElementById("editReservationForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("editReservationId").value;
    const button = document.getElementById("updateReservationButton");
    const message = document.getElementById("editFormMessage");

    const selectedItemId =
        document.getElementById("editItemSelect").value;

    const selectedItem = inventoryItems.find(
        item => item._id === selectedItemId
    );

    const quantity = Number(
        document.getElementById("editQuantity").value
    );

    if (!selectedItem) {
        message.innerHTML = `
            <div class="alert alert-danger">
                Please select an inventory item.
            </div>
        `;
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        message.innerHTML = `
            <div class="alert alert-danger">
                Quantity must be a positive whole number.
            </div>
        `;
        return;
    }

    if (quantity > Number(document.getElementById("editQuantity").max)) {
        message.innerHTML = `
            <div class="alert alert-danger">
                Quantity exceeds the allowed amount.
            </div>
        `;
        return;
    }

    const updatedData = {
        event_name: document.getElementById("editEventName").value.trim(),
        item: selectedItemId,
        quantity: quantity,
        event_date: document.getElementById("editEventDate").value,
        description: document.getElementById("editDescription").value,
        status: document.getElementById("editStatus").value
    };

    try {
        button.disabled = true;
        button.textContent = "Saving...";

        const response = await fetch(`${API_BASE}/reservations/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to update reservation.");
        }

        alert("Reservation updated successfully!");

        const modalElement =
            document.getElementById("editReservationModal");

        const modal = bootstrap.Modal.getInstance(modalElement);

        if (modal) {
            modal.hide();
        }

        await loadReservations();

    } catch (error) {
        message.innerHTML = "";

        const alertBox = document.createElement("div");
        alertBox.className = "alert alert-danger";
        alertBox.textContent = error.message;

        message.appendChild(alertBox);

        console.error("Update reservation error:", error);

    } finally {
        button.disabled = false;
        button.textContent = "Save Changes";
    }
});


// DELETE RESERVATION
async function deleteReservation(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this reservation?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/reservations/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to delete reservation.");
        }

        alert("Reservation deleted successfully!");

        await loadReservations();

    } catch (error) {
        alert(error.message);
        console.error("Delete reservation error:", error);
    }
}


// PREVENT PAST EVENT DATES FOR NEW RESERVATIONS
document.getElementById("eventDate").min =
    new Date().toLocaleDateString("en-CA");


// INITIAL PAGE LOAD
async function initializeReservationsPage() {
    await loadItems();
    await loadReservations();
}

initializeReservationsPage();
