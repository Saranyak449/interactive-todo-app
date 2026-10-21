// ==================== INTERACTIVE TO-DO LIST APPLICATION LOGIC ====================

// DOM Element Selections
const taskInput = document.getElementById("task-input");
const dueDateInput = document.getElementById("due-date-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const validationMsg = document.getElementById("validation-msg");
const counterDisplay = document.getElementById("counter-display");
const statsBadge = document.getElementById("task-stats-badge");
const progressBarFill = document.getElementById("progress-bar-fill");
const quickStats = document.getElementById("quick-stats");
const filterBtns = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed-btn");

// Application State Management (LocalStorage Integration)
let tasks = JSON.parse(localStorage.getItem("taskflow_tasks")) || [];
let currentFilter = "all";

// ==================== CORE FUNCTIONS ====================

// Render tasks safely using textContent to prevent XSS vulnerability
function renderTasks() {
    taskList.innerHTML = "";

    // Filter tasks based on active filter tab
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true; // "all"
    });

    // Handle Empty State
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>No tasks found. Get started by adding a new professional objective above!</p>
            </div>
        `;
        updateStatistics();
        return;
    }

    // Render individual task elements
    filteredTasks.forEach((task) => {
        const originalIndex = tasks.indexOf(task);

        const li = document.createElement("li");
        li.className = `task-item ${task.completed ? "completed" : ""}`;

        // Left Content: Checkbox + Text Details
        const contentDiv = document.createElement("div");
        contentDiv.className = "task-content";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Mark "${task.text}" as completed`);
        checkbox.addEventListener("change", () => toggleTaskStatus(originalIndex));

        const detailsDiv = document.createElement("div");
        detailsDiv.className = "task-details";

        const textSpan = document.createElement("span");
        textSpan.className = "task-text";
        textSpan.textContent = task.text; // Safe rendering

        detailsDiv.appendChild(textSpan);

        // Append due date if specified
        if (task.dueDate) {
            const dateSpan = document.createElement("span");
            dateSpan.className = "task-due-date";
            dateSpan.innerHTML = `<i class="far fa-calendar-alt"></i> Due: ${task.dueDate}`;
            detailsDiv.appendChild(dateSpan);
        }

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(detailsDiv);

        // Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.setAttribute("aria-label", `Delete task "${task.text}"`);
        deleteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
        deleteBtn.addEventListener("click", () => deleteTask(originalIndex));

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });

    updateStatistics();
    saveToLocalStorage();
}

// Add a new task with validation
function addTask() {
    const text = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    // Validation: Reject empty or whitespace-only inputs
    if (text === "") {
        validationMsg.textContent = "Please enter a valid task name before adding.";
        taskInput.focus();
        return;
    }

    validationMsg.textContent = ""; // Clear validation message

    tasks.push({
        text: text,
        dueDate: dueDate || null,
        completed: false
    });

    // Reset input fields
    taskInput.value = "";
    dueDateInput.value = "";
    taskInput.focus();

    renderTasks();
}

// Toggle task completion status
function toggleTaskStatus(index) {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
}

// Delete an individual task
function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

// Clear all completed tasks
function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    renderTasks();
}

// Update statistics, counters, and progress bar
function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Update UI Elements
    counterDisplay.textContent = `${active} item${active === 1 ? '' : 's'} remaining`;
    statsBadge.textContent = `${percentage}% Completed`;
    progressBarFill.style.width = `${percentage}%`;
    quickStats.textContent = `Total: ${total} | Active: ${active} | Completed: ${completed}`;
}

// Save task array to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
}

// ==================== EVENT LISTENERS ====================

// Add task via button click
addBtn.addEventListener("click", addTask);

// Add task via Enter key press
taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addTask();
    }
});

// Clear validation error message on typing
taskInput.addEventListener("input", () => {
    if (validationMsg.textContent !== "") {
        validationMsg.textContent = "";
    }
});

// Filter tabs event handling
filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => {
            b.classList.remove("active");
            b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        currentFilter = btn.getAttribute("data-filter");
        renderTasks();
    });
});

// Clear completed button event listener
clearCompletedBtn.addEventListener("click", clearCompletedTasks);

// Initial execution on page load
renderTasks();