// ================== CONFIG ==================
const API_BASE = "/api/v1/sales";

// =============== GLOBAL STATE ===============
let leadsData = [];
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};

// ================= INIT =====================
document.addEventListener("DOMContentLoaded", () => {
    loadSummary();
    loadLeads();

    // filters
    document.querySelector(".filters .btn").addEventListener("click", applyFilters);
    document.getElementById("search").addEventListener("keyup", debounce(applyFilters, 500));
});

// =============== API REQUEST HELPER =========
async function apiRequest(path, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            ...options
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Request failed");
        return data;
    } catch (err) {
        console.error("API error:", err);
        showNotification(err.message, "error");
        throw err;
    }
}

// =============== SUMMARY ====================
async function loadSummary() {
    const { data } = await apiRequest("/summary");
    document.querySelector(".stat-card:nth-child(1) h3").textContent = data.newLeads;
    document.querySelector(".stat-card:nth-child(2) h3").textContent = data.totalAssignedLeads;
    document.querySelector(".stat-card:nth-child(3) h3").textContent = data.followUpLeads;
}

// =============== LEADS ======================
async function loadLeads(page = 1) {
    currentPage = page;
    const params = new URLSearchParams({ page, limit: 10, ...currentFilters });
    const { data } = await apiRequest(`/leads?${params.toString()}`);

    leadsData = data.leads;
    totalPages = data.totalPages;

    renderLeads(leadsData);
    renderPagination(totalPages, currentPage);
}

function renderLeads(leads) {
    const tbody = document.querySelector(".leads-table tbody");
    tbody.innerHTML = "";

    if (!leads.length) {
        tbody.innerHTML = `<tr><td colspan="6">No leads found</td></tr>`;
        return;
    }

    leads.forEach(lead => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${lead.name}</td>
            <td>${lead.email}<br>${lead.phone || ""}</td>
            <td>${lead.company || "-"}</td>
            <td><span class="status-badge status-${lead.status.toLowerCase()}">${lead.status}</span></td>
            <td>${lead.followUpDate ? lead.followUpDate.split("T")[0] : "-"}</td>
            <td class="action-buttons">
                <button class="action-btn view-btn" onclick="openViewModal('${lead._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-btn" onclick="openEditModal('${lead._id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPagination(total, current) {
    const container = document.querySelector(".pagination");
    container.innerHTML = "";

    if (total <= 1) return;

    const prevBtn = createPaginationBtn("«", current > 1 ? () => loadLeads(current - 1) : null);
    container.appendChild(prevBtn);

    for (let i = 1; i <= total; i++) {
        const btn = createPaginationBtn(i, () => loadLeads(i), i === current);
        container.appendChild(btn);
    }

    const nextBtn = createPaginationBtn("»", current < total ? () => loadLeads(current + 1) : null);
    container.appendChild(nextBtn);
}

function createPaginationBtn(label, onClick, active = false) {
    const btn = document.createElement("button");
    btn.className = "pagination-btn" + (active ? " active" : "");
    btn.innerHTML = label;
    if (onClick) btn.addEventListener("click", onClick);
    return btn;
}

// =============== FILTERS ====================
function applyFilters() {
    currentFilters = {};

    const status = document.getElementById("status-filter").value;
    if (status !== "all") currentFilters.status = status;

    const tag = document.getElementById("tag-filter").value;
    if (tag !== "all") currentFilters.tag = tag;

    const followUpFrom = document.getElementById("follow-up-date-from").value;
    const followUpTo = document.getElementById("follow-up-date-to").value;
    if (followUpFrom) currentFilters.followUpFrom = followUpFrom;
    if (followUpTo) currentFilters.followUpTo = followUpTo;

    const createdFrom = document.getElementById("created-date-from").value;
    const createdTo = document.getElementById("created-date-to").value;
    if (createdFrom) currentFilters.startDate = createdFrom;
    if (createdTo) currentFilters.endDate = createdTo;

    const search = document.getElementById("search").value.trim();
    if (search) currentFilters.search = search;

    loadLeads(1);
}

// debounce helper for search
function debounce(fn, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

// =============== VIEW MODAL =================
async function openViewModal(id) {
    const { data } = await apiRequest(`/getLeadDetails/${id}`);

    const modal = document.getElementById("view-modal");
    modal.querySelectorAll("input, textarea").forEach(input => input.value = "");
    modal.querySelector(".modal-body").innerHTML = `
        <div class="lead-details">
            <div class="form-group"><label>Full Name</label><input type="text" value="${data.name}" readonly></div>
            <div class="form-group"><label>Email Address</label><input type="email" value="${data.email}" readonly></div>
            <div class="form-group"><label>Phone Number</label><input type="tel" value="${data.phone || ""}" readonly></div>
            <div class="form-group"><label>Company</label><input type="text" value="${data.company || ""}" readonly></div>
            <div class="form-group"><label>Status</label><input type="text" value="${data.status}" readonly></div>
            <div class="form-group"><label>Tag</label><input type="text" value="${data.tag || ""}" readonly></div>
            <div class="form-group"><label>Follow-up Date</label><input type="date" value="${data.followUpDate ? data.followUpDate.split("T")[0] : ""}" readonly></div>
            <div class="form-group"><label>Created Date</label><input type="date" value="${data.createdAt ? data.createdAt.split("T")[0] : ""}" readonly></div>
        </div>
        <div class="form-group"><label>Lead Message</label><textarea readonly>${data.message || ""}</textarea></div>
        <div class="form-group"><label>Notes</label><textarea readonly>${data.notes || ""}</textarea></div>
    `;

    modal.classList.add("active");
}
function closeViewModal() {
    document.getElementById("view-modal").classList.remove("active");
}

// =============== EDIT MODAL =================
async function openEditModal(id) {
    const { data } = await apiRequest(`/getLeadDetails/${id}`);

    const modal = document.getElementById("edit-modal");
    modal.dataset.leadId = id;

    modal.querySelector(".modal-body").innerHTML = `
        <div class="lead-details">
            <div class="form-group">
                <label>Status</label>
                <select id="edit-status">
                    ${["New","Contacted","In Progress","Closed","Trash"].map(s => 
                        `<option ${data.status === s ? "selected" : ""}>${s}</option>`).join("")}
                </select>
            </div>
            <div class="form-group">
                <label>Tag</label>
                <select id="edit-tag">
                    ${["Important","Less Important","Urgent","Follow-up"].map(t => 
                        `<option ${data.tag === t ? "selected" : ""}>${t}</option>`).join("")}
                </select>
            </div>
            <div class="form-group">
                <label>Follow-up Date</label>
                <input type="date" id="edit-followUp" value="${data.followUpDate ? data.followUpDate.split("T")[0] : ""}">
            </div>
        </div>
        <div class="form-group">
            <label>Notes</label>
            <textarea id="edit-notes">${data.notes || ""}</textarea>
        </div>
    `;

    modal.classList.add("active");
}
function closeEditModal() {
    document.getElementById("edit-modal").classList.remove("active");
}
async function saveChanges() {
    const modal = document.getElementById("edit-modal");
    const id = modal.dataset.leadId;

    const body = {
        status: document.getElementById("edit-status").value.toLowerCase(),
        tag: document.getElementById("edit-tag").value,
        followUpDate: document.getElementById("edit-followUp").value,
        notes: document.getElementById("edit-notes").value
    };

    await apiRequest(`/leads/${id}`, { method: "PUT", body: JSON.stringify(body) });

    showNotification("Changes saved successfully!", "success");
    closeEditModal();
    loadLeads(currentPage);
    loadSummary();
}

// =============== NOTIFICATIONS ==============
function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// =============== CLOSE MODALS OUTSIDE CLICK =
document.addEventListener("click", e => {
    if (e.target.classList.contains("modal-overlay")) {
        closeViewModal();
        closeEditModal();
    }
});
