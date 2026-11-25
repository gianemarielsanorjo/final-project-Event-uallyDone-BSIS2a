
const API_URL = "/api/items";

// GET HTML ELEMENTS
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

let allItems = [];

// BOOTSTRAP MODALS
const addModalElement = document.getElementById("addItemModal");
const editModalElement = document.getElementById("editItemModal");

const addModal = bootstrap.Modal.getOrCreateInstance(addModalElement);
const editModal = bootstrap.Modal.getOrCreateInstance(editModalElement);


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

        return `
            <tr>
                <td>${escapeHTML(item.item_name)}</td>
                <td>${escapeHTML(item.category)}</td>
                <td>${Number(item.quantity ?? 0)}</td>
                <td>${getAvailableQuantity(item)}</td>
                <td>${getStatusBadge(status)}</td>
                <td>
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
                </td>
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


// ADD NEW ITEM
addItemForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const itemName = document.getElementById("item_name").value.trim();
    const category = document.getElementById("category").value;
    const quantity = Number(document.getElementById("quantity").value);

    if (!itemName || !category || !Number.isInteger(quantity) || quantity < 0) {
        alert("Please enter valid item information.");
        return;
    }

    saveItemButton.disabled = true;
    saveItemButton.textContent = "Saving...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
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


// EDIT ITEM - OPEN MODAL
itemsTableBody.addEventListener("click", function (event) {
    const editButton = event.target.closest(".edit-item");

    if (!editButton) return;

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


// UPDATE ITEM
editItemForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const itemId = document.getElementById("editItemId").value;
    const itemName = document.getElementById("edit_item_name").value.trim();
    const category = document.getElementById("edit_category").value;
    const quantity = Number(document.getElementById("edit_quantity").value);

    if (!itemName || !category || !Number.isInteger(quantity) || quantity < 0) {
        alert("Please enter valid item information.");
        return;
    }

    updateItemButton.disabled = true;
    updateItemButton.textContent = "Updating...";

    try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(itemId)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                item_name: itemName,
                category: category,
                quantity: quantity
            })
        });

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


// DELETE ITEM
itemsTableBody.addEventListener("click", async function (event) {
    const deleteButton = event.target.closest(".delete-item");

    if (!deleteButton) return;

    const itemId = deleteButton.dataset.id;

    const confirmed = confirm("Are you sure you want to delete this item?");

    if (!confirmed) return;

    deleteButton.disabled = true;
    deleteButton.textContent = "Deleting...";

    try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(itemId)}`, {
            method: "DELETE"
        });

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


// LOAD INVENTORY WHEN PAGE OPENS
loadItems();
