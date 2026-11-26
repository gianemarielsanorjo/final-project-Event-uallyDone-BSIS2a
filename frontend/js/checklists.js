
// GET ELEMENTS
const taskList = document.getElementById("taskList");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const taskForm = document.getElementById("taskForm");
const taskNameInput = document.getElementById("taskName");
const assignedTeamInput = document.getElementById("assignedTeam");

const logoutLink = document.getElementById("logoutLink");

// UPDATE TASK APPEARANCE
function updateTaskAppearance() {
    const taskItems = document.querySelectorAll(".task-item");

    taskItems.forEach(task => {
        const checkbox = task.querySelector(".task-check");

        if (checkbox && checkbox.checked) {
            task.classList.add("task-completed");
        } else {
            task.classList.remove("task-completed");
        }
    });
}

// UPDATE PROGRESS
function updateProgress() {
    const checkboxes = document.querySelectorAll(".task-check");
    const completed = document.querySelectorAll(".task-check:checked").length;
    const total = checkboxes.length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    progressBar.style.width = percentage + "%";
    progressBar.setAttribute("aria-valuenow", percentage);

    progressText.textContent =
        `${completed} of ${total} completed (${percentage}%)`;

    updateTaskAppearance();
}

// CHECK TASK
taskList.addEventListener("change", function(event) {
    if (event.target.classList.contains("task-check")) {
        updateProgress();
    }
});

// ADD NEW TASK
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const taskName = taskNameInput.value.trim();
    const assignedTeam = assignedTeamInput.value.trim();

    if (!taskName || !assignedTeam) {
        return;
    }

    const task = document.createElement("div");
    task.className = "task-item d-flex align-items-center gap-3";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input task-check";

    const details = document.createElement("div");

    const heading = document.createElement("h6");
    heading.className = "mb-1";
    heading.textContent = taskName;

    const description = document.createElement("small");
    description.className = "text-muted";
    description.textContent = assignedTeam;

    details.appendChild(heading);
    details.appendChild(description);

    task.appendChild(checkbox);
    task.appendChild(details);

    taskList.appendChild(task);

    updateProgress();

    taskForm.reset();

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("addTaskModal")
    ).hide();
});

// LOGOUT
logoutLink.addEventListener("click", function(event) {
    event.preventDefault();

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    sessionStorage.clear();

    window.location.replace("/login.html");
});

// INITIALIZE CHECKLIST
updateProgress();
