
const API_BASE = "/api";
const TOKEN = localStorage.getItem("token");

let currentUser = null;
let currentRole = "";
let inventoryItems = [];

try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
    currentRole = currentUser?.role || "";
} catch (error) {
    console.error("Unable to read logged-in user:", error);
}

const isStudent = currentRole === "Student";
const isOrganizer = currentRole === "Event Organizer";
const isAdmin = currentRole === "Admin";

const reservationTable = document.getElementById("reservationTable");
const reservationForm = document.getElementById("reservationForm");
const editReservationForm = document.getElementById("editReservationForm");

const itemSelect = document.getElementById("itemSelect");
const editItemSelect = document.getElementById("editItemSelect");

const stockInfo = document.getElementById("stockInfo");
const quantityInput = document.getElementById("quantityInput");

const formMessage = document.getElementById("formMessage");
const editFormMessage = document.getElementById("editFormMessage");

const submitButton = document.getElementById("submitButton");
const updateReservationButton = document.getElementById("updateReservationButton");

const addReservationModalElement = document.getElementById("addReservationModal");
const editReservationModalElement = document.getElementById("editReservationModal");

const addReservationModal = bootstrap.Modal.getOrCreateInstance(addReservationModalElement);
const editReservationModal = bootstrap.Modal.getOrCreateInstance(editReservationModalElement);

// ==========================================
// AUTHENTICATION
// ==========================================

if (!TOKEN || !currentUser) {
    window.location.replace("/login.html");
}

function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`
    };
}

function handleUnauthorized() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("/login.html");
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

function getUserId(user) {
    if (!user) return "";
    return String(user._id || user.id || "");
}

function getReservationOwnerId(reservation) {
    if (!reservation.user) return "";

    if (typeof reservation.user === "object") {
        return String(reservation.user._id || reservation.user.id || "");
    }

    return String(reservation.user);
}

function isReservationOwner(reservation) {
    return getReservationOwnerId(reservation) === getUserId(currentUser);
}

function showMessage(element, message, type = "danger") {
    if (!element) return;

    element.innerHTML = `
        <div class="alert alert-${type} py-2">
            ${escapeHTML(message)}
        </div>
    `;
}

function clearMessage(element) {
    if (element) element.innerHTML = "";
}

function formatDate(date) {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function getItemName(reservation) {
    if (reservation.item && typeof reservation.item === "object") {
        return reservation.item.item_name || "Unknown Item";
    }

    const item = inventoryItems.find(
        entry => String(entry._id) === String(reservation.item)
    );

    return item ? item.item_name : "Unknown Item";
}

// ==========================================
// ROLE-BASED NAVIGATION
// ==========================================

function setupRoleNavigation() {
    const navigation = document.querySelector(".page-navigation");
    if (!navigation) return;

    const links = navigation.querySelectorAll("a");

    links.forEach(link => {
        const href = link.getAttribute("href");

        if (isStudent && href === "/checklists.html") {
            link.remove();
        }

        if (href === "/dashboard") {
            if (isStudent) link.href = "/student-dashboard.html";
            else if (isOrganizer) link.href = "/organizer-dashboard.html";
            else if (isAdmin) link.href = "/admin-dashboard.html";
        }
    });

    const newReservationButton = document.querySelector(
        '[data-bs-target="#addReservationModal"]'
    );

    if (newReservationButton) {
        newReservationButton.style.display = "inline-block";
        newReservationButton.textContent = "+ New Reservation";
    }

    const pageTitle = document.querySelector(".page-header h2");

    if (pageTitle) {
        if (isStudent) pageTitle.textContent = "My Reservations";
        else if (isOrganizer) pageTitle.textContent = "Manage Reservations";
        else if (isAdmin) pageTitle.textContent = "All Reservations";
    }
}

// ==========================================
// LOAD INVENTORY ITEMS
// ==========================================

async function loadInventoryItems() {
    try {
        const response = await fetch(`${API_BASE}/items`);

        if (!response.ok) {
            throw new Error("Unable to load inventory items.");
        }

        inventoryItems = await response.json();

        if (!Array.isArray(inventoryItems)) {
            throw new Error("Invalid inventory data.");
        }

        populateItemDropdowns();

    } catch (error) {
        console.error("Inventory loading error:", error);

        if (itemSelect) {
            itemSelect.innerHTML = `
                <option value="">Unable to load inventory</option>
            `;
        }
    }
}

function populateItemDropdowns() {
    const options = inventoryItems.map(item => {
        const available = Number(item.available_quantity || 0);

        return `
            <option value="${escapeHTML(item._id)}"
                    ${available < 1 ? "disabled" : ""}>
                ${escapeHTML(item.item_name)}
                (${available} available)
            </option>
        `;
    }).join("");

    if (itemSelect) {
        itemSelect.innerHTML = `
            <option value="">Select an inventory item</option>
            ${options}
        `;
    }

    if (editItemSelect) {
        editItemSelect.innerHTML = `
            <option value="">Select an inventory item</option>
            ${options}
        `;
    }
}

// ==========================================
// STOCK INFORMATION
// ==========================================

function updateStockInfo() {
    const selectedId = itemSelect.value;

    const selectedItem = inventoryItems.find(
        item => String(item._id) === String(selectedId)
    );

    if (!selectedItem) {
        stockInfo.textContent = "";
        return;
    }

    stockInfo.textContent =
        `Available stock: ${selectedItem.available_quantity}`;
}

if (itemSelect) {
    itemSelect.addEventListener("change", updateStockInfo);
}

function updateEditStockInfo() {
    const selectedId = editItemSelect.value;

    const selectedItem = inventoryItems.find(
        item => String(item._id) === String(selectedId)
    );

    const editStockInfo = document.getElementById("editStockInfo");

    if (!selectedItem) {
        editStockInfo.textContent = "";
        return;
    }

    editStockInfo.textContent =
        `Available stock: ${selectedItem.available_quantity}`;
}

if (editItemSelect) {
    editItemSelect.addEventListener("change", updateEditStockInfo);
}

// ==========================================
// LOAD RESERVATIONS
// ==========================================

async function loadReservations() {
    try {
        reservationTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    Loading reservations...
                </td>
            </tr>
        `;

        const response = await fetch(`${API_BASE}/reservations`, {
            headers: getHeaders()
        });

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {
            throw new Error("Unable to load reservations.");
        }

        const reservations = await response.json();

        if (!Array.isArray(reservations)) {
            throw new Error("Invalid reservation data.");
        }

        displayReservations(reservations);

    } catch (error) {
        console.error("Reservation loading error:", error);

        reservationTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;
    }
}

// ==========================================
// DISPLAY RESERVATIONS
// CSP-SAFE BUTTONS: NO INLINE ONCLICK
// ==========================================

function displayReservations(reservations) {
    if (!reservations.length) {
        reservationTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    No reservations found.
                </td>
            </tr>
        `;
        return;
    }

    reservationTable.innerHTML = reservations.map(reservation => {
        const status = reservation.status || "Pending";
        let actions = "";

        if (isAdmin) {
            actions = `
                <button type="button"
                        class="btn btn-sm btn-primary mb-1"
                        data-action="edit"
                        data-id="${escapeHTML(reservation._id)}">
                    Edit
                </button>

                <button type="button"
                        class="btn btn-sm btn-danger mb-1"
                        data-action="delete"
                        data-id="${escapeHTML(reservation._id)}">
                    Delete
                </button>
            `;
        } else if (
            isOrganizer &&
            isReservationOwner(reservation) &&
            status === "Pending"
        ) {
            actions = `
                <button type="button"
                        class="btn btn-sm btn-primary mb-1"
                        data-action="edit"
                        data-id="${escapeHTML(reservation._id)}">
                    Edit
                </button>

                <button type="button"
                        class="btn btn-sm btn-danger mb-1"
                        data-action="delete"
                        data-id="${escapeHTML(reservation._id)}">
                    Delete
                </button>
            `;
        } else if (isStudent) {
            actions = `
                <span class="badge bg-secondary">View Only</span>
            `;
        } else {
            actions = `
                <span class="text-muted small">No actions available</span>
            `;
        }

        return `
            <tr>
                <td>${escapeHTML(reservation.event_name)}</td>
                <td>${escapeHTML(getItemName(reservation))}</td>
                <td>${escapeHTML(reservation.quantity)}</td>
                <td>${escapeHTML(formatDate(reservation.event_date))}</td>
                <td>
                    <span class="status ${escapeHTML(status)}">
                        ${escapeHTML(status)}
                    </span>
                </td>
                <td>${actions}</td>
            </tr>
        `;
    }).join("");
}

// ==========================================
// CREATE RESERVATION
// ==========================================

if (reservationForm) {
    reservationForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        clearMessage(formMessage);

        const formData = new FormData(reservationForm);

        const reservationData = {
            event_name: formData.get("event_name").trim(),
            item: formData.get("item"),
            quantity: Number(formData.get("quantity")),
            event_date: formData.get("event_date"),
            description: formData.get("description").trim()
        };

        if (
            !reservationData.event_name ||
            !reservationData.item ||
            !reservationData.event_date ||
            !Number.isInteger(reservationData.quantity) ||
            reservationData.quantity < 1
        ) {
            showMessage(formMessage, "Please complete all required fields.");
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";

            const response = await fetch(`${API_BASE}/reservations`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(reservationData)
            });

            const data = await response.json();

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "Reservation failed.");
            }

            showMessage(
                formMessage,
                "Reservation submitted successfully!",
                "success"
            );

            reservationForm.reset();
            if (stockInfo) stockInfo.textContent = "";

            await loadReservations();

            setTimeout(() => {
                addReservationModal.hide();
                clearMessage(formMessage);
            }, 1000);

        } catch (error) {
            showMessage(formMessage, error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Submit Reservation";
        }
    });
}

// ==========================================
// EDIT RESERVATION
// ==========================================

async function editReservation(id) {
    if (isStudent) {
        alert("Students are not allowed to edit reservations.");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/reservations/${encodeURIComponent(id)}`,
            { headers: getHeaders() }
        );

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to open reservation.");
        }

        const reservation = data.reservation || data;

        const canEditOrganizer =
            isOrganizer &&
            isReservationOwner(reservation) &&
            reservation.status === "Pending";

        if (!isAdmin && !canEditOrganizer) {
            throw new Error("You are not allowed to edit this reservation.");
        }

        document.getElementById("editReservationId").value = reservation._id;
        document.getElementById("editEventName").value = reservation.event_name || "";

        const selectedItemId =
            reservation.item?._id || reservation.item || "";

        editItemSelect.value = selectedItemId;

        document.getElementById("editQuantity").value = reservation.quantity || 1;

        document.getElementById("editEventDate").value =
            reservation.event_date
                ? new Date(reservation.event_date).toISOString().split("T")[0]
                : "";

        document.getElementById("editDescription").value =
            reservation.description || "";

        const statusSelect = document.getElementById("editStatus");

        statusSelect.value = reservation.status || "Pending";

        // Only Admin may change reservation status
        statusSelect.disabled = !isAdmin;

        statusSelect.parentElement.style.display = isAdmin ? "block" : "none";

        updateEditStockInfo();
        clearMessage(editFormMessage);

        editReservationModal.show();

    } catch (error) {
        console.error("Edit reservation error:", error);
        alert(error.message);
    }
}

// ==========================================
// SAVE EDITED RESERVATION
// ==========================================

if (editReservationForm) {
    editReservationForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (isStudent) {
            alert("Students are not allowed to edit reservations.");
            return;
        }

        clearMessage(editFormMessage);

        const id = document.getElementById("editReservationId").value;

        const reservationData = {
            event_name: document.getElementById("editEventName").value.trim(),
            item: editItemSelect.value,
            quantity: Number(document.getElementById("editQuantity").value),
            event_date: document.getElementById("editEventDate").value,
            description: document.getElementById("editDescription").value.trim()
        };

        if (isAdmin) {
            reservationData.status =
                document.getElementById("editStatus").value;
        }

        if (
            !reservationData.event_name ||
            !reservationData.item ||
            !reservationData.event_date ||
            !Number.isInteger(reservationData.quantity) ||
            reservationData.quantity < 1
        ) {
            showMessage(editFormMessage, "Please complete all required fields.");
            return;
        }

        try {
            updateReservationButton.disabled = true;
            updateReservationButton.textContent = "Saving...";

            const response = await fetch(
                `${API_BASE}/reservations/${encodeURIComponent(id)}`,
                {
                    method: "PUT",
                    headers: getHeaders(),
                    body: JSON.stringify(reservationData)
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "Unable to update reservation.");
            }

            showMessage(
                editFormMessage,
                "Reservation updated successfully!",
                "success"
            );

            await loadReservations();

            setTimeout(() => {
                editReservationModal.hide();
                clearMessage(editFormMessage);
            }, 1000);

        } catch (error) {
            showMessage(editFormMessage, error.message);
        } finally {
            updateReservationButton.disabled = false;
            updateReservationButton.textContent = "Save Changes";
        }
    });
}

// ==========================================
// DELETE RESERVATION
// ==========================================

async function deleteReservation(id) {
    if (isStudent) {
        alert("Students are not allowed to delete reservations.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete this reservation?"
    );

    if (!confirmed) return;

    try {
        const response = await fetch(
            `${API_BASE}/reservations/${encodeURIComponent(id)}`,
            {
                method: "DELETE",
                headers: getHeaders()
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {
            throw new Error(data.message || "Unable to delete reservation.");
        }

        alert("Reservation deleted successfully!");
        await loadReservations();

    } catch (error) {
        alert(error.message);
    }
}

// ==========================================
// CSP-SAFE EVENT DELEGATION
// ==========================================

reservationTable.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    if (!id) return;

    if (action === "edit") {
        editReservation(id);
    } else if (action === "delete") {
        deleteReservation(id);
    }
});

// ==========================================
// INITIALIZE PAGE
// ==========================================

async function initializeReservationsPage() {
    if (!TOKEN || !currentUser) return;

    setupRoleNavigation();

    await loadInventoryItems();
    await loadReservations();
}

initializeReservationsPage();
