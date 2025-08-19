class LeadManagementApp {
    constructor() {
        this.dataManager = new LeadDataManager();
        this.currentFilters = {};
        this.selectedLeads = new Set();
        this.currentEditingLead = null;
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 1;
        this.currentViewingLead = null;

        this.init();
    }

    async init() {
        try {
            this.bindEvents();
            await this.dataManager.loadLeads({ page: this.currentPage, limit: this.pageSize });
            this.dataManager.subscribe(() => {
                this.renderLeads();
            });
            this.renderLeads();
        } catch (error) {
            console.error('App initialization error:', error);
            showNotification('Error', error.message || 'Failed to load leads', 'error');
        }
    }

    bindEvents() {
        // Header buttons
        document.getElementById('addLeadBtn').addEventListener('click', () => this.showAddLeadModal());
        document.getElementById('addFirstLeadBtn')?.addEventListener('click', () => this.showAddLeadModal());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportLeads());

        // Modal events
        document.getElementById('closeModalBtn').addEventListener('click', () => this.hideLeadModal());
        document.getElementById('cancelModalBtn').addEventListener('click', () => this.hideLeadModal());
        document.getElementById('leadForm').addEventListener('submit', (e) => this.handleLeadFormSubmit(e));

        // Delete modal events
        document.getElementById('closeDeleteModalBtn').addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());

        // Filter events
        document.getElementById('searchInput').addEventListener('input',
            debounce((e) => this.handleSearch(e.target.value), 300)
        );
        document.getElementById('statusFilter').addEventListener('change', (e) => this.handleFilterChange('status', e.target.value));
        document.getElementById('tagFilter').addEventListener('change', (e) => this.handleFilterChange('tag', e.target.value));
        document.getElementById('dateFromFilter').addEventListener('change', (e) => this.handleFilterChange('dateFrom', e.target.value));
        document.getElementById('dateToFilter').addEventListener('change', (e) => this.handleFilterChange('dateTo', e.target.value));
        document.getElementById('followUpFromFilter').addEventListener('change', (e) => this.handleFilterChange('followUpFrom', e.target.value));
        document.getElementById('followUpToFilter').addEventListener('change', (e) => this.handleFilterChange('followUpTo', e.target.value));
        document.getElementById('clearFiltersBtn').addEventListener('click', () => this.clearFilters());

        // Select all checkbox
        document.getElementById('selectAllCheckbox').addEventListener('change', (e) => this.handleSelectAll(e.target.checked));

        // Bulk actions
        document.getElementById('bulkStatusSelect').addEventListener('change', (e) => this.handleBulkStatusChange(e.target.value));
        document.getElementById('bulkAssignSelect').addEventListener('change', (e) => this.handleBulkAssignChange(e.target.value));
        document.getElementById('bulkPrioritySelect').addEventListener('change', (e) => this.handleBulkPriorityChange(e.target.value));
        document.getElementById('bulkDeleteBtn').addEventListener('click', () => this.handleBulkDelete());

        // Pagination events
        document.getElementById('pageSizeSelect').addEventListener('change', (e) => this.handlePageSizeChange(e.target.value));
        document.getElementById('customPageSize').addEventListener('change', (e) => this.handleCustomPageSize(e.target.value));
        document.getElementById('firstPageBtn').addEventListener('click', () => this.goToPage(1));
        document.getElementById('prevPageBtn').addEventListener('click', () => this.goToPage(this.currentPage - 1));
        document.getElementById('nextPageBtn').addEventListener('click', () => this.goToPage(this.currentPage + 1));
        document.getElementById('lastPageBtn').addEventListener('click', () => this.goToPage(this.totalPages));

        // View modal events
        document.getElementById('closeViewModalBtn').addEventListener('click', () => this.hideViewModal());
        document.getElementById('closeViewLeadBtn').addEventListener('click', () => this.hideViewModal());
        document.getElementById('editFromViewBtn').addEventListener('click', () => this.editFromView());

        // Modal backdrop click to close
        document.getElementById('leadModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.hideLeadModal();
        });
        document.getElementById('viewLeadModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.hideViewModal();
        });
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.hideDeleteModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    handleKeyboardShortcuts(e) {
        // Escape key to close modals
        if (e.key === 'Escape') {
            this.hideLeadModal();
            this.hideDeleteModal();
        }

        // Ctrl/Cmd + N to add new lead
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.showAddLeadModal();
        }

        // Ctrl/Cmd + E to export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            this.exportLeads();
        }
    }

    setupFilters() {
        // Set default date range (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

        // Don't set default date filters - let users choose
        // document.getElementById('dateFromFilter').value = formatDateForInput(thirtyDaysAgo);
        // document.getElementById('dateToFilter').value = formatDateForInput(today);
    }

    renderLeads() {

        const leads = Array.isArray(this.dataManager.leads) ? this.dataManager.leads.slice() : [];
        const totalLeads = this.dataManager.totalLeads || 0;

        // pagination state from dataManager
        this.totalPages = this.dataManager.totalPages || Math.ceil(totalLeads / this.pageSize) || 1;
        this.currentPage = this.dataManager.page || this.currentPage;

        const tableBody = document.getElementById('leadsTableBody');
        const emptyState = document.getElementById('emptyState');
        const paginationSection = document.getElementById('paginationSection');

        tableBody.innerHTML = '';

        // If a searchTerm exists, do an in-memory filter on the current page
        let displayLeads = leads;
        if (this.searchTerm) {
            const term = this.searchTerm;
            displayLeads = leads.filter(lead => {
                const fields = [
                    lead.name, lead.email, lead.phone, lead.company,
                    lead.message, lead.notes
                ].filter(Boolean).join(' ').toLowerCase();
                return fields.includes(term);
            });
        }

        if (!displayLeads || displayLeads.length === 0) {
            document.querySelector('.leads-table').style.display = 'none';
            emptyState.style.display = 'block';
            paginationSection.style.display = 'none';
            this.updateBulkActionsVisibility();
            return;
        }

        document.querySelector('.leads-table').style.display = 'table';
        emptyState.style.display = 'none';
        paginationSection.style.display = 'flex';

        displayLeads.forEach(lead => {
            const row = this.createLeadRow(lead);
            tableBody.appendChild(row);
        });

        // Compute indexes for current page (start index is based on currentPage & pageSize)
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + displayLeads.length; // number shown on the page (after in-memory filter)

        this.updatePaginationInfo(totalLeads, startIndex, endIndex);
        this.updatePaginationButtons();
        this.updateSelectAllCheckbox();
        this.updateBulkActionsVisibility();
    }


    createLeadRow(lead) {
        const row = document.createElement('tr');
        row.dataset.leadId = lead._id;

        const statusInfo = getStatusInfo(lead.status);
        const priorityInfo = getPriorityInfo(lead.tag);
        const assignedUserName = getAssignedUserName(lead.assignedTo);
        const followUpInfo = formatFollowUpDate(lead.followUpDate);

        row.innerHTML = `
            <td>
                <input type="checkbox" class="checkbox lead-checkbox" value="${lead._id}"
                       ${this.selectedLeads.has(lead._id) ? 'checked' : ''}>
            </td>
            <td>
                <div class="contact-info">
                    <div class="contact-name">${escapeHtml(lead.name)}</div>
                    ${lead.company ? `<div class="contact-company">${escapeHtml(lead.company)}</div>` : ''}
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <div class="contact-email">${escapeHtml(lead.email)}</div>
                    ${lead.phone ? `<div class="contact-phone">${escapeHtml(lead.phone)}</div>` : ''}
                </div>
            </td>
            <td>
                <span class="status-badge ${lead.status}">
                    <i class="${statusInfo.icon}"></i>
                    ${statusInfo.label}
                </span>
            </td>
            <td>
                <span class="priority-badge ${lead.tag}">
                    <i class="${priorityInfo.icon}"></i>
                    ${priorityInfo.label}
                </span>
            </td>
            <td>
                <div class="assigned-user">
                    ${lead.assignedTo ? `
                        <i class="fas fa-user"></i>
                        ${assignedUserName}
                    ` : `
                        <i class="fas fa-user-times"></i>
                        Unassigned
                    `}
                </div>
            </td>
            <td>
                <div class="follow-up-date ${followUpInfo.class}">
                    <i class="${followUpInfo.icon}"></i>
                    ${followUpInfo.text}
                </div>
            </td>
            <td>${formatDate(lead.createdAt)}</td>
            <td>
                <div class="actions">
                    <button class="action-btn view" onclick="app.viewLead('${lead._id}')"
                            data-tooltip="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="app.editLead('${lead._id}')"
                            data-tooltip="Edit Lead">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="app.deleteLead('${lead._id}')"
                            data-tooltip="Delete Lead">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        // Add event listener for checkbox
        const checkbox = row.querySelector('.lead-checkbox');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectedLeads.add(lead._id);
            } else {
                this.selectedLeads.delete(lead._id);
            }
            this.updateSelectAllCheckbox();
            this.updateBulkActionsVisibility();
        });

        return row;
    }


    async handleSearch(searchTerm) {
        this.searchTerm = (searchTerm || '').trim().toLowerCase();
        this.currentFilters.search = this.searchTerm; // Store search in currentFilters
        this.currentPage = 1;
        try {
            // Just call loadLeads, it will use the updated currentFilters
            await this.dataManager.loadLeads({ ...this.currentFilters, page: 1 });
        } catch (err) {
            showNotification('Error', err.message || 'Search failed', 'error');
        }
    }

async handleFilterChange(filterType, value) {
    // Update the currentFilters state object
    if (value) {
        this.currentFilters[filterType] = value;
    } else {
        delete this.currentFilters[filterType];
    }

    this.currentPage = 1;
    try {
        // Trigger a reload from the dataManager with the combined filters
        await this.dataManager.loadLeads({ ...this.currentFilters, page: 1 });
    } catch (err) {
        showNotification('Error', err.message || 'Filter failed', 'error');
    }
}

async clearFilters() {
    // 1. Clear the state objects
    this.currentFilters = {};
    this.searchTerm = '';
    this.currentPage = 1;

    // 2. Reset all the input fields in the UI
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('tagFilter').value = '';
    document.getElementById('dateFromFilter').value = '';
    document.getElementById('dateToFilter').value = '';
    document.getElementById('followUpFromFilter').value = '';
    document.getElementById('followUpToFilter').value = '';

    // 3. Fetch the fresh, unfiltered data from the server
    try {
        await this.dataManager.loadLeads({ 
            page: this.currentPage, 
            limit: this.pageSize 
        });
    } catch (err) {
        showNotification('Error', err.message || 'Failed to clear filters', 'error');
    }
}


    handleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.lead-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            if (checked) {
                this.selectedLeads.add(checkbox.value);
            } else {
                this.selectedLeads.delete(checkbox.value);
            }
        });
        this.updateBulkActionsVisibility();
    }


    updateSelectAllCheckbox() {
        const checkboxes = document.querySelectorAll('.lead-checkbox');
        const checkedBoxes = document.querySelectorAll('.lead-checkbox:checked');
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');

        if (checkboxes.length === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (checkedBoxes.length === checkboxes.length) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else if (checkedBoxes.length > 0) {
            selectAllCheckbox.indeterminate = true;
        } else {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        }
    }

    updateBulkActionsVisibility() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');

        if (this.selectedLeads.size > 0) {
            selectedCount.textContent = `${this.selectedLeads.size} selected`;
            bulkActions.style.display = 'block';
        } else {
            bulkActions.style.display = 'none';
        }
    }

    async handleBulkStatusChange(status) {
        if (!status || this.selectedLeads.size === 0) return;

        try {
            await this.dataManager.bulkUpdateLeads([...this.selectedLeads], { status });
            showNotification('Success', `Updated ${this.selectedLeads.size} leads to ${status}`, 'success');

            document.getElementById('bulkStatusSelect').value = '';
            this.selectedLeads.clear();
        } catch (error) {
            showNotification('Error', error.message, 'error');
        }

    }



    async handleBulkAssignChange(assignedTo) {
        if (!assignedTo || this.selectedLeads.size === 0) return;

        try {
            await this.dataManager.bulkUpdateLeads([...this.selectedLeads], { assignedTo });
            const assigneeName = getAssignedUserName(assignedTo);
            showNotification('Success', `Assigned ${this.selectedLeads.size} leads to ${assigneeName}`, 'success');

            // Reset bulk controls and selections after a successful API call
            document.getElementById('bulkAssignSelect').value = '';
            this.selectedLeads.clear();
        } catch (error) {
            showNotification('Error', error.message, 'error');
        }
    }

    async handleBulkPriorityChange(priority) {
        if (!priority || this.selectedLeads.size === 0) return;

        try {
            await this.dataManager.bulkUpdateLeads([...this.selectedLeads], { tag: priority });
            const priorityInfo = getPriorityInfo(priority);
            showNotification('Success', `Updated ${this.selectedLeads.size} leads to ${priorityInfo.label}`, 'success');

            // Reset bulk controls and clear selections
            document.getElementById('bulkPrioritySelect').value = '';
            this.selectedLeads.clear();
        } catch (error) {
            showNotification('Error', error.message, 'error');
        }
    }

    calculatePagination(totalItems) {
        this.totalPages = Math.ceil(totalItems / this.pageSize) || 1;

        // Adjust current page if it's beyond total pages
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        }
    }

    updatePaginationInfo(totalItems, startIndex, endIndex) {
        const info = document.getElementById('paginationInfo');
        const actualEnd = Math.min(endIndex, totalItems);
        info.textContent = `Showing ${startIndex + 1}-${actualEnd} of ${totalItems} leads`;
    }

    updatePaginationButtons() {
        const firstBtn = document.getElementById('firstPageBtn');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const lastBtn = document.getElementById('lastPageBtn');
        const pageNumbers = document.getElementById('pageNumbers');

        // Enable/disable buttons
        firstBtn.disabled = this.currentPage === 1;
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === this.totalPages;
        lastBtn.disabled = this.currentPage === this.totalPages;

        // Generate page numbers
        pageNumbers.innerHTML = '';
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => this.goToPage(i));
            pageNumbers.appendChild(pageBtn);
        }
    }

    async goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.selectedLeads.clear(); // Clear selections when changing pages
        try {
            await this.dataManager.loadLeads({ ...this.currentFilters, page: this.currentPage, limit: this.pageSize });
        } catch (err) {
            showNotification('Error', err.message || 'Failed to change page', 'error');
        }
    }

    async handlePageSizeChange(value) {
        const customInput = document.getElementById('customPageSize');

        if (value === 'custom') {
            customInput.style.display = 'block';
            customInput.focus();
        } else {
            customInput.style.display = 'none';
            this.pageSize = parseInt(value);
            this.currentPage = 1;
            try {
                await this.dataManager.loadLeads({ ...this.currentFilters, page: this.currentPage, limit: this.pageSize });
            } catch (err) {
                showNotification('Error', err.message || 'Failed to change page size', 'error');
            }
        }
    }

    async handleCustomPageSize(value) {
        const size = parseInt(value);
        if (size > 0 && size <= 1000) {
            this.pageSize = size;
            this.currentPage = 1;
            try {
                await this.dataManager.loadLeads({ ...this.currentFilters, page: this.currentPage, limit: this.pageSize });
            } catch (err) {
                showNotification('Error', err.message || 'Failed to change page size', 'error');
            }
        }
    }

    async viewLead(leadId) {
        let lead = this.dataManager.leads.find(l => l._id === leadId);

        // If not found in current page, get from backend
        if (!lead) {
            try {
                lead = await this.dataManager.getLeadById(leadId);
            } catch (err) {
                showNotification('Error', err.message || 'Lead not found', 'error');
                return;
            }
        }

        this.currentViewingLead = lead;
        this.populateViewModal(lead);
        showModal('viewLeadModal');
    }

    populateViewModal(lead) {
        const content = document.getElementById('leadDetailsContent');
        const statusInfo = getStatusInfo(lead.status);
        const priorityInfo = getPriorityInfo(lead.tag);
        const assignedUserName = getAssignedUserName(lead.assignedTo);
        const followUpInfo = formatFollowUpDate(lead.followUpDate);

        content.innerHTML = `
            <div class="detail-section">
                <h3><i class="fas fa-user"></i> Contact Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Full Name</div>
                        <div class="detail-value">${escapeHtml(lead.name)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Email Address</div>
                        <div class="detail-value">${escapeHtml(lead.email)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Phone Number</div>
                        <div class="detail-value ${!lead.phone ? 'empty' : ''}">${lead.phone ? escapeHtml(lead.phone) : 'Not provided'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Company</div>
                        <div class="detail-value ${!lead.company ? 'empty' : ''}">${lead.company ? escapeHtml(lead.company) : 'Not provided'}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-cog"></i> Lead Management</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Status</div>
                        <div class="detail-value">
                            <span class="status-badge ${lead.status}">
                                <i class="${statusInfo.icon}"></i>
                                ${statusInfo.label}
                            </span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Priority</div>
                        <div class="detail-value">
                            <span class="priority-badge ${lead.tag}">
                                <i class="${priorityInfo.icon}"></i>
                                ${priorityInfo.label}
                            </span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Assigned To</div>
                        <div class="detail-value ${!lead.assignedTo ? 'empty' : ''}">${assignedUserName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Follow-up Date</div>
                        <div class="detail-value">
                            <div class="follow-up-date ${followUpInfo.class}">
                                <i class="${followUpInfo.icon}"></i>
                                ${followUpInfo.text}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-calendar"></i> Timeline</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Created Date</div>
                        <div class="detail-value">${formatDate(lead.createdAt)}</div>
                    </div>
                </div>
            </div>

            ${lead.message ? `
                <div class="detail-section">
                    <h3><i class="fas fa-comment"></i> Initial Message</h3>
                    <div class="detail-message">${escapeHtml(lead.message)}</div>
                </div>
            ` : ''}

            ${lead.notes ? `
                <div class="detail-section">
                    <h3><i class="fas fa-sticky-note"></i> Internal Notes</h3>
                    <div class="detail-notes">${escapeHtml(lead.notes)}</div>
                </div>
            ` : ''}
        `;
    }

    hideViewModal() {
        hideModal('viewLeadModal');
        this.currentViewingLead = null;
    }

    editFromView() {
        if (this.currentViewingLead) {
            this.hideViewModal();
            this.editLead(this.currentViewingLead._id);
        }
    }

    async handleBulkDelete() {
        if (this.selectedLeads.size === 0) return;

        const message = `Are you sure you want to delete ${this.selectedLeads.size} selected leads? This action cannot be undone.`;

        this.showDeleteModal(message, async () => {
            try {
                await this.dataManager.deleteLeads([...this.selectedLeads]);
                showNotification('Success', `Deleted ${this.selectedLeads.size} leads`, 'success');
                this.selectedLeads.clear();
            } catch (error) {
                showNotification('Error', error.message, 'error');
            }
        });
    }

    showAddLeadModal() {
        this.currentEditingLead = null;
        document.getElementById('modalTitle').textContent = 'Add New Lead';
        document.getElementById('saveLeadBtn').textContent = 'Save Lead';

        // Reset form
        document.getElementById('leadForm').reset();
        this.clearFormErrors();

        showModal('leadModal');

        // Focus on first input
        setTimeout(() => {
            document.getElementById('leadName').focus();
        }, 300);
    }

async editLead(leadId) {
    let lead = this.dataManager.leads.find(l => l._id === leadId);

    if (!lead) {
        try {
            lead = await this.dataManager.getLeadById(leadId);
        } catch (err) {
            showNotification('Error', 'Lead not found', 'error');
            return;
        }
    }

    this.currentEditingLead = lead;
    document.getElementById('modalTitle').textContent = 'Edit Lead';
    document.getElementById('saveLeadBtn').textContent = 'Update Lead';

    // Populate form
    document.getElementById('leadName').value = lead.name;
    document.getElementById('leadEmail').value = lead.email;
    document.getElementById('leadPhone').value = lead.phone || '';
    document.getElementById('leadCompany').value = lead.company || '';
    
    // FIXES: Ensure values match HTML and have a fallback for null/undefined
    document.getElementById('leadStatus').value = (lead.status || '').toLowerCase();
    document.getElementById('leadTag').value = (lead.tag || '').toLowerCase();
    document.getElementById('leadAssigned').value = lead.assignedTo || '';

    document.getElementById('leadMessage').value = lead.message || '';
    document.getElementById('leadNotes').value = lead.notes || '';
    document.getElementById('leadFollowUp').value = lead.followUpDate || '';

    this.clearFormErrors();
    showModal('leadModal');
}

    hideLeadModal() {
        hideModal('leadModal');
        this.currentEditingLead = null;
        this.clearFormErrors();
    }

    async handleLeadFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const leadData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            company: formData.get('company'),
            status: formData.get('status'),
            tag: formData.get('tag'),
            assignedTo: formData.get('assignedTo'),
            message: formData.get('message'),
            notes: formData.get('notes'),
            followUpDate: formData.get('followUpDate')
        };

        this.clearFormErrors();

        try {
            if (this.currentEditingLead) {
                // Update existing lead
                await this.dataManager.updateLead(this.currentEditingLead._id, leadData);
                showNotification('Success', 'Lead updated successfully', 'success');
            } else {
                // Add new lead
                await this.dataManager.addLead(leadData);
                showNotification('Success', 'Lead added successfully', 'success');
            }

            this.hideLeadModal();
        } catch (error) {
            this.displayFormError(error.message);
        }
    }

    displayFormError(message) {
        showNotification('Validation Error', message, 'error');

        // You could also highlight specific fields here
        if (message.includes('email')) {
            this.highlightField('leadEmail');
        } else if (message.includes('name')) {
            this.highlightField('leadName');
        } else if (message.includes('phone')) {
            this.highlightField('leadPhone');
        }
    }

    highlightField(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.focus();
            field.parentElement.classList.add('error');

            // Remove error class after user starts typing
            const removeError = () => {
                field.parentElement.classList.remove('error');
                field.removeEventListener('input', removeError);
            };
            field.addEventListener('input', removeError);
        }
    }

    clearFormErrors() {
        document.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
        });
    }

    async deleteLead(leadId) {
        let lead = this.dataManager.leads.find(l => l._id === leadId);
        if (!lead) {
            try {
                lead = await this.dataManager.getLeadById(leadId);
            } catch (err) {
                showNotification('Error', err.message || 'Lead not found', 'error');
                return;
            }
        }

        const message = `Are you sure you want to delete "${lead.name}"? This action cannot be undone.`;

        this.showDeleteModal(message, async () => {
            try {
                await this.dataManager.deleteLead(leadId);
                showNotification('Success', 'Lead deleted successfully', 'success');
            } catch (error) {
                showNotification('Error', error.message, 'error');
            }
        });
    }

    showDeleteModal(message, onConfirm) {
        document.getElementById('deleteMessage').textContent = message;
        this.deleteCallback = onConfirm;
        showModal('deleteModal');
    }

    hideDeleteModal() {
        hideModal('deleteModal');
        this.deleteCallback = null;
    }

    confirmDelete() {
        if (this.deleteCallback) {
            this.deleteCallback();
            this.hideDeleteModal();
        }
    }

    async exportLeads() {
        try {
            // Ask dataManager to fetch CSV blob
            const blobOrData = await this.dataManager.exportLeads({ ...this.currentFilters });
            if (blobOrData instanceof Blob || (blobOrData && blobOrData.blob)) {
                const blob = blobOrData instanceof Blob ? blobOrData : blobOrData.blob;
                const filename = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
                downloadBlob(blob, filename);
                showNotification('Success', 'Export started', 'success');
            } else {
                // server returned ApiResponse.data string — you can handle accordingly
                // Attempt to download string as CSV
                const csvString = typeof blobOrData === 'string' ? blobOrData : JSON.stringify(blobOrData);
                const blob = new Blob([csvString], { type: 'text/csv' });
                const filename = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
                downloadBlob(blob, filename);
                showNotification('Success', 'Export started', 'success');
            }
        } catch (err) {
            showNotification('Error', err.message || 'Failed to export leads', 'error');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // There is no need for local storage code anymore, as you're using a backend API
    window.app = new LeadManagementApp();
});

// Handle page unload to save any pending changes
window.addEventListener('beforeunload', () => {
    // Any cleanup if needed
});

// Handle online/offline status
window.addEventListener('online', () => {
    showNotification('Info', 'You are back online', 'info');
});

window.addEventListener('offline', () => {
    showNotification('Warning', 'You are offline. Changes will be saved locally.', 'warning');
});