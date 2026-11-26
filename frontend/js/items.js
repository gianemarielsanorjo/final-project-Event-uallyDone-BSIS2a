
const API_URL = "/api/items";
const AUTH_URL = "/api/auth/profile";

const token = localStorage.getItem("token");

let currentUser = null;
let isAdmin = false;
let allItems = [];

const itemsTableBody = document.getElementById("itemsTableBody");
const resultCount = document.getElementById("resultCount");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const clearFiltersButton = document.getElementById("clearFilters");

const addItemForm = document.getElementById("addItemForm");
const editItemForm = document.getElementById("editItemForm");

const saveItemButton = document.getElementById("saveItemButton");
const updateItemButton = document.getElementById("updateItemButton");

const addModalElement = document.getElementById("addItemModal");
const editModalElement = document.getElementById("editItemModal");

let addModal = null;
let editModal = null;


// AUTHORIZATION HEADER
function getAuthHeaders(includeJSON = false) {
    const headers = {
        Authorization: `Bearer ${token}`
    };

    if (includeJSON) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}


// VERIFY LOGGED-IN USER AND ROLE
async function verifyUser() {
    if (!token) {
        window.location.replace("/login.html");
        return false;
    }

    try {
        const response = await fetch(AUTH_URL, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error("Session expired. Please log in again.");
        }

        const data = await response.json();

        currentUser = data.user;

        if (!currentUser ||
            !["Admin", "Event Organizer", "Student"].includes(currentUser.role)) {
            throw new Error("Invalid user role.");
        }

        isAdmin = currentUser.role === "Admin";

        localStorage.setItem("user", JSON.stringify(currentUser));

        applyRolePermissions();

        return true;

    } catch (error) {
        console.error("User verification error:", error);

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        window.location.replace("/login.html");
        return false;
    }
}


// SHOW OR HIDE ADMIN CONTROLS
function applyRolePermissions() {
    // Hide Add Item button for non-admin users
    document.querySelectorAll(
        '[data-bs-target="#addItemModal"], [href="#addItemModal"]'
    ).forEach(element => {
        element.classList.toggle("d-none", !isAdmin);
    });

    // Hide Add and Edit modals for non-admin users
    if (addModalElement) {
        addModalElement.classList.toggle("d-none", !isAdmin);
    }

    if (editModalElement) {
        editModalElement.classList.toggle("d-none", !isAdmin);
    }

    // Update page role indicator if available
    const roleDisplay = document.getElementById("userRole");

    if (roleDisplay) {
        roleDisplay.textContent = currentUser.role;
    }
}


// GET AVAILABLE QUANTITY
function getAvailableQuantity(item) {
    return Number(item.available_quantity ?? item.quantity ?? 0);
}


// GET ITEM STATUS
function getItemStatus(item) {
    const available = getAvailableQuantity(item);

    if (available <= 0) {
        return "Unavailable";
    }

    if (available <= 3) {
        return "Low Stock";
    }

    return "Available";
}


// STATUS BADGE
function getStatusBadge(status) {
    if (status === "Available") {
        return '<span class="status-available">Available</span>';
    }

    if (status === "Low Stock") {
        return '<span class="status-low">Low Stock</span>';
    }

    return '<span class="status-unavailable">Unavailable</span>';
}


// SAFE HTML DISPLAY
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];
    });
}


// LOAD ITEMS FROM DATABASE
async function loadItems() {
    itemsTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">Loading inventory...</td>
        </tr>
    `;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load inventory.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid inventory data received.");
        }

        allItems = data;

        updateInventorySummary();
        displayItems();

    } catch (error) {
        console.error("Inventory loading error:", error);

        itemsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Failed to load inventory. Please check your server.
                </td>
            </tr>
        `;

        resultCount.textContent = "Unable to load inventory.";

        document.getElementById("lowStockAlertList").innerHTML =
            '<p class="text-danger mb-0">Unable to load stock alerts.</p>';
    }
}


// UPDATE SUMMARY CARDS
function updateInventorySummary() {
    let availableCount = 0;
    let lowStockCount = 0;
    let unavailableCount = 0;

    allItems.forEach(item => {
        const status = getItemStatus(item);

        if (status === "Available") {
            availableCount++;
        } else if (status === "Low Stock") {
            lowStockCount++;
        } else {
            unavailableCount++;
        }
    });

    document.getElementById("totalItems").textContent = allItems.length;
    document.getElementById("availableItems").textContent = availableCount;
    document.getElementById("lowStockItems").textContent = lowStockCount;
    document.getElementById("unavailableItems").textContent = unavailableCount;

    displayLowStockAlerts();
}


// DISPLAY LOW STOCK ALERTS
function displayLowStockAlerts() {
    const alertList = document.getElementById("lowStockAlertList");

    const lowStockItems = allItems.filter(item => {
        return getItemStatus(item) === "Low Stock";
    });

    document.getElementById("lowStockAlertCount").textContent =
        `${lowStockItems.length} Alerts`;

    if (lowStockItems.length === 0) {
        alertList.innerHTML = `
            <p class="text-muted mb-0">No low-stock items at the moment.</p>
        `;
        return;
    }

    alertList.innerHTML = lowStockItems.map(item => `
        <div class="alert-item">
            <strong>${escapeHTML(item.item_name)}</strong>
            <p class="text-muted mb-0">
                Only ${getAvailableQuantity(item)} available
                (${escapeHTML(item.category)})
            </p>
        </div>
    `).join("");
}


// DISPLAY INVENTORY TABLE
function displayItems() {
    const searchValue = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedStatus = statusFilter.value;

    const filteredItems = allItems.filter(item => {
        const matchesSearch = String(item.item_name ?? "")
            .toLowerCase()
            .includes(searchValue);

        const matchesCategory =
            !selectedCategory || item.category === selectedCategory;

        const matchesStatus =
            !selectedStatus || getItemStatus(item) === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    resultCount.textContent =
        `Showing ${filteredItems.length} of ${allItems.length} items`;

    if (filteredItems.length === 0) {
        itemsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    No inventory items found.
                </td>
            </tr>
        `;
        return;
    }

    itemsTableBody.innerHTML = filteredItems.map(item => {
        const id = escapeHTML(item._id);
        const status = getItemStatus(item);

        // ADMIN ONLY ACTION BUTTONS
        const adminActions = isAdmin ? `
            <button
                class="btn btn-sm btn-warning me-1 edit-item"
                data-id="${id}">
                Edit
            </button>

            <button
                class="btn btn-sm btn-danger delete-item"
                data-id="${id}">
                Delete
            </button>
        ` : `
            <span class="text-muted">View Only</span>
        `;

        return `
            <tr>
                <td>${escapeHTML(item.item_name)}</td>
                <td>${escapeHTML(item.category)}</td>
                <td>${Number(item.quantity ?? 0)}</td>
                <td>${getAvailableQuantity(item)}</td>
                <td>${getStatusBadge(status)}</td>
                <td>${adminActions}</td>
            </tr>
        `;
    }).join("");
}


// SEARCH AND FILTER EVENTS
searchInput.addEventListener("input", displayItems);
categoryFilter.addEventListener("change", displayItems);
statusFilter.addEventListener("change", displayItems);


// CLEAR FILTERS
clearFiltersButton.addEventListener("click", function () {
    searchInput.value = "";
    categoryFilter.value = "";
    statusFilter.value = "";

    displayItems();
});


// ADD NEW ITEM - ADMIN ONLY
if (addItemForm) {
    addItemForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!isAdmin) {
            alert("Only Admin can add inventory items.");
            return;
        }

        const itemName = document.getElementById("item_name").value.trim();
        const category = document.getElementById("category").value;
        const quantity = Number(document.getElementById("quantity").value);

        if (!itemName || !category ||
            !Number.isInteger(quantity) || quantity < 0) {
            alert("Please enter valid item information.");
            return;
        }

        saveItemButton.disabled = true;
        saveItemButton.textContent = "Saving...";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: getAuthHeaders(true),
                body: JSON.stringify({
                    item_name: itemName,
                    category: category,
                    quantity: quantity,
                    available_quantity: quantity,
                    status: quantity > 0 ? "Available" : "Unavailable"
                })
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.message || "Failed to add item.");
            }

            alert("Item added successfully!");

            addItemForm.reset();
            addModal.hide();

            await loadItems();

        } catch (error) {
            console.error("Add item error:", error);
            alert(error.message);

        } finally {
            saveItemButton.disabled = false;
            saveItemButton.textContent = "Save Item";
        }
    });
}


// EDIT ITEM - ADMIN ONLY
itemsTableBody.addEventListener("click", function (event) {
    const editButton = event.target.closest(".edit-item");

    if (!editButton) return;

    if (!isAdmin) {
        alert("Only Admin can edit inventory items.");
        return;
    }

    const itemId = editButton.dataset.id;
    const item = allItems.find(item => String(item._id) === itemId);

    if (!item) {
        alert("Item not found.");
        return;
    }

    document.getElementById("editItemId").value = item._id;
    document.getElementById("edit_item_name").value = item.item_name;
    document.getElementById("edit_category").value = item.category;
    document.getElementById("edit_quantity").value = item.quantity;

    editModal.show();
});


// UPDATE ITEM - ADMIN ONLY
if (editItemForm) {
    editItemForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!isAdmin) {
            alert("Only Admin can update inventory items.");
            return;
        }

        const itemId = document.getElementById("editItemId").value;
        const itemName = document.getElementById("edit_item_name").value.trim();
        const category = document.getElementById("edit_category").value;
        const quantity = Number(document.getElementById("edit_quantity").value);

        if (!itemName || !category ||
            !Number.isInteger(quantity) || quantity < 0) {
            alert("Please enter valid item information.");
            return;
        }

        updateItemButton.disabled = true;
        updateItemButton.textContent = "Updating...";

        try {
            const response = await fetch(
                `${API_URL}/${encodeURIComponent(itemId)}`,
                {
                    method: "PUT",
                    headers: getAuthHeaders(true),
                    body: JSON.stringify({
                        item_name: itemName,
                        category: category,
                        quantity: quantity
                    })
                }
            );

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.message || "Failed to update item.");
            }

            alert("Item updated successfully!");

            editModal.hide();

            await loadItems();

        } catch (error) {
            console.error("Update item error:", error);
            alert(error.message);

        } finally {
            updateItemButton.disabled = false;
            updateItemButton.textContent = "Update Item";
        }
    });
}


// DELETE ITEM - ADMIN ONLY
itemsTableBody.addEventListener("click", async function (event) {
    const deleteButton = event.target.closest(".delete-item");

    if (!deleteButton) return;

    if (!isAdmin) {
        alert("Only Admin can delete inventory items.");
        return;
    }

    const itemId = deleteButton.dataset.id;

    const confirmed = confirm("Are you sure you want to delete this item?");

    if (!confirmed) return;

    deleteButton.disabled = true;
    deleteButton.textContent = "Deleting...";

    try {
        const response = await fetch(
            `${API_URL}/${encodeURIComponent(itemId)}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || "Failed to delete item.");
        }

        alert("Item deleted successfully!");

        await loadItems();

    } catch (error) {
        console.error("Delete item error:", error);
        alert(error.message);

        deleteButton.disabled = false;
        deleteButton.textContent = "Delete";
    }
});


// LOGOUT
document.querySelector(".logout-link")?.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.replace("/login.html");
});


// INITIALIZE INVENTORY PAGE
async function initializeInventoryPage() {
    const authorized = await verifyUser();

    if (!authorized) return;

    if (isAdmin) {
        if (addModalElement) {
            addModal = bootstrap.Modal.getOrCreateInstance(addModalElement);
        }

        if (editModalElement) {
            editModal = bootstrap.Modal.getOrCreateInstance(editModalElement);
        }
    }

    await loadItems();
}

initializeInventoryPage();
