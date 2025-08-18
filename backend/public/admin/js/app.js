// Main Application Logic for Lead Management App

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

    /**
     * Initialize the application
     */
    init() {
        try {
            this.bindEvents();
            this.renderLeads();
            this.setupFilters();
            
            // Subscribe to data changes
            this.dataManager.subscribe(() => {
                this.renderLeads();
            });
        } catch (error) {
            console.error('App initialization error:', error);
            // Clear localStorage and try again
            localStorage.removeItem('leadManagementData');
            location.reload();
        }
    }

    /**
     * Bind all event listeners
     */
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

    /**
     * Handle keyboard shortcuts
     */
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

    /**
     * Setup filter dropdowns
     */
    setupFilters() {
        // Set default date range (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        // Don't set default date filters - let users choose
        // document.getElementById('dateFromFilter').value = formatDateForInput(thirtyDaysAgo);
        // document.getElementById('dateToFilter').value = formatDateForInput(today);
    }

    /**
     * Render leads table with pagination
     */
    renderLeads() {
        const filteredLeads = this.dataManager.getFilteredLeads(this.currentFilters);
        this.calculatePagination(filteredLeads.length);
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageLeads = filteredLeads.slice(startIndex, endIndex);
        
        const tableBody = document.getElementById('leadsTableBody');
        const emptyState = document.getElementById('emptyState');
        const paginationSection = document.getElementById('paginationSection');
        
        // Clear existing content
        tableBody.innerHTML = '';
        
        if (filteredLeads.length === 0) {
            document.querySelector('.leads-table').style.display = 'none';
            emptyState.style.display = 'block';
            paginationSection.style.display = 'none';
            this.updateBulkActionsVisibility();
            return;
        }
        
        document.querySelector('.leads-table').style.display = 'table';
        emptyState.style.display = 'none';
        paginationSection.style.display = 'flex';
        
        pageLeads.forEach(lead => {
            const row = this.createLeadRow(lead);
            tableBody.appendChild(row);
        });
        
        this.updatePaginationInfo(filteredLeads.length, startIndex, endIndex);
        this.updatePaginationButtons();
        this.updateSelectAllCheckbox();
        this.updateBulkActionsVisibility();
    }

    /**
     * Create a table row for a lead
     */
    createLeadRow(lead) {
        const row = document.createElement('tr');
        row.dataset.leadId = lead.id;
        
        const statusInfo = getStatusInfo(lead.status);
        const priorityInfo = getPriorityInfo(lead.tag);
        const assignedUserName = getAssignedUserName(lead.assignedTo);
        const followUpInfo = formatFollowUpDate(lead.followUpDate);
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="checkbox lead-checkbox" value="${lead.id}" 
                       ${this.selectedLeads.has(lead.id) ? 'checked' : ''}>
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
                    <button class="action-btn view" onclick="app.viewLead('${lead.id}')" 
                            data-tooltip="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="app.editLead('${lead.id}')" 
                            data-tooltip="Edit Lead">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="app.deleteLead('${lead.id}')" 
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
                this.selectedLeads.add(lead.id);
            } else {
                this.selectedLeads.delete(lead.id);
            }
            this.updateSelectAllCheckbox();
            this.updateBulkActionsVisibility();
        });
        
        return row;
    }

    /**
     * Handle search
     */
    handleSearch(searchTerm) {
        this.currentFilters.search = searchTerm.trim();
        this.renderLeads();
    }

    /**
     * Handle filter changes
     */
    handleFilterChange(filterType, value) {
        if (value) {
            this.currentFilters[filterType] = value;
        } else {
            delete this.currentFilters[filterType];
        }
        this.renderLeads();
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.currentFilters = {};
        
        // Reset form controls
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('tagFilter').value = '';
        document.getElementById('dateFromFilter').value = '';
        document.getElementById('dateToFilter').value = '';
        document.getElementById('followUpFromFilter').value = '';
        document.getElementById('followUpToFilter').value = '';
        
        this.currentPage = 1; // Reset to first page
        this.renderLeads();
    }

    /**
     * Handle select all checkbox
     */
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

    /**
     * Update select all checkbox state
     */
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

    /**
     * Update bulk actions visibility
     */
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

    /**
     * Handle bulk status change
     */
    handleBulkStatusChange(status) {
        if (!status || this.selectedLeads.size === 0) return;
        
        try {
            this.dataManager.updateMultipleLeads([...this.selectedLeads], { status });
            showNotification('Success', `Updated ${this.selectedLeads.size} leads to ${status}`, 'success');
            
            // Reset bulk controls
            document.getElementById('bulkStatusSelect').value = '';
            this.selectedLeads.clear();
        } catch (error) {
            showNotification('Error', error.message, 'error');
        }
    }

    /**
     * Handle bulk assignment change
     */
    handleBulkAssignChange(assignedTo) {
        if (this.selectedLeads.size === 0) return;
        
        try {
            this.dataManager.updateMultipleLeads([...this.selectedLeads], { assignedTo });
            const assigneeName = assignedTo ? getAssignedUserName(assignedTo) : 'Unassigned';
            showNotification('Success', `Assigned ${this.selectedLeads.size} leads to ${assigneeName}`, 'success');
            
            // Reset bulk controls
            document.getElementById('bulkAssignSelect').value = '';
            this.selectedLeads.clear();
        } catch (error) {
            showNotification('Error', error.message, 'error');
        }
    }

    /**
     * Handle bulk priority change
     */
    handleBulkPriorityChange(priority) {
        if (!priority || this.selectedLeads.size === 0) return;
        
        try {
            this.dataManager.updateMultipleLeads([...this.selectedLeads], { tag: priority });
            const priorityInfo = getPriorityInfo(priority);
            showNotification('Success', `Updated ${this.selectedLeads.size} leads to ${priorityInfo.label}`, 'success');
            
            // Reset bulk controls
            document.getElementById('bulkPrioritySelect').value = '';
            this.selectedLeads.clear();
        } catch (error) {
            showNotification('Error', error.message, 'error');
        }
    }

    /**
     * Calculate pagination
     */
    calculatePagination(totalItems) {
        this.totalPages = Math.ceil(totalItems / this.pageSize) || 1;
        
        // Adjust current page if it's beyond total pages
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        }
    }

    /**
     * Update pagination info
     */
    updatePaginationInfo(totalItems, startIndex, endIndex) {
        const info = document.getElementById('paginationInfo');
        const actualEnd = Math.min(endIndex, totalItems);
        info.textContent = `Showing ${startIndex + 1}-${actualEnd} of ${totalItems} leads`;
    }

    /**
     * Update pagination buttons
     */
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

    /**
     * Go to specific page
     */
    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.selectedLeads.clear(); // Clear selections when changing pages
        this.renderLeads();
    }

    /**
     * Handle page size change
     */
    handlePageSizeChange(value) {
        const customInput = document.getElementById('customPageSize');
        
        if (value === 'custom') {
            customInput.style.display = 'block';
            customInput.focus();
        } else {
            customInput.style.display = 'none';
            this.pageSize = parseInt(value);
            this.currentPage = 1;
            this.renderLeads();
        }
    }

    /**
     * Handle custom page size
     */
    handleCustomPageSize(value) {
        const size = parseInt(value);
        if (size > 0 && size <= 1000) {
            this.pageSize = size;
            this.currentPage = 1;
            this.renderLeads();
        }
    }

    /**
     * View lead details
     */
    viewLead(leadId) {
        const lead = this.dataManager.getLeadById(leadId);
        if (!lead) {
            showNotification('Error', 'Lead not found', 'error');
            return;
        }
        
        this.currentViewingLead = lead;
        this.populateViewModal(lead);
        showModal('viewLeadModal');
    }

    /**
     * Populate view modal with lead details
     */
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

    /**
     * Hide view modal
     */
    hideViewModal() {
        hideModal('viewLeadModal');
        this.currentViewingLead = null;
    }

    /**
     * Edit from view modal
     */
    editFromView() {
        if (this.currentViewingLead) {
            this.hideViewModal();
            this.editLead(this.currentViewingLead.id);
        }
    }

    /**
     * Handle bulk delete
     */
    handleBulkDelete() {
        if (this.selectedLeads.size === 0) return;
        
        const message = `Are you sure you want to delete ${this.selectedLeads.size} selected leads? This action cannot be undone.`;
        this.showDeleteModal(message, () => {
            try {
                this.dataManager.deleteLeads([...this.selectedLeads]);
                showNotification('Success', `Deleted ${this.selectedLeads.size} leads`, 'success');
                this.selectedLeads.clear();
            } catch (error) {
                showNotification('Error', error.message, 'error');
            }
        });
    }

    /**
     * Show add lead modal
     */
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

    /**
     * Edit lead
     */
    editLead(leadId) {
        const lead = this.dataManager.getLeadById(leadId);
        if (!lead) {
            showNotification('Error', 'Lead not found', 'error');
            return;
        }
        
        this.currentEditingLead = lead;
        document.getElementById('modalTitle').textContent = 'Edit Lead';
        document.getElementById('saveLeadBtn').textContent = 'Update Lead';
        
        // Populate form
        document.getElementById('leadName').value = lead.name;
        document.getElementById('leadEmail').value = lead.email;
        document.getElementById('leadPhone').value = lead.phone || '';
        document.getElementById('leadCompany').value = lead.company || '';
        document.getElementById('leadStatus').value = lead.status;
        document.getElementById('leadTag').value = lead.tag;
        document.getElementById('leadAssigned').value = lead.assignedTo || '';
        document.getElementById('leadMessage').value = lead.message || '';
        document.getElementById('leadNotes').value = lead.notes || '';
        document.getElementById('leadFollowUp').value = lead.followUpDate || '';
        
        this.clearFormErrors();
        showModal('leadModal');
    }

    /**
     * Hide lead modal
     */
    hideLeadModal() {
        hideModal('leadModal');
        this.currentEditingLead = null;
        this.clearFormErrors();
    }

    /**
     * Handle lead form submission
     */
    handleLeadFormSubmit(e) {
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
                this.dataManager.updateLead(this.currentEditingLead.id, leadData);
                showNotification('Success', 'Lead updated successfully', 'success');
            } else {
                // Add new lead
                this.dataManager.addLead(leadData);
                showNotification('Success', 'Lead added successfully', 'success');
            }
            
            this.hideLeadModal();
        } catch (error) {
            this.displayFormError(error.message);
        }
    }

    /**
     * Display form validation error
     */
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

    /**
     * Highlight form field with error
     */
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

    /**
     * Clear form errors
     */
    clearFormErrors() {
        document.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
        });
    }

    /**
     * Delete lead
     */
    deleteLead(leadId) {
        const lead = this.dataManager.getLeadById(leadId);
        if (!lead) {
            showNotification('Error', 'Lead not found', 'error');
            return;
        }
        
        const message = `Are you sure you want to delete "${lead.name}"? This action cannot be undone.`;
        this.showDeleteModal(message, () => {
            try {
                this.dataManager.deleteLead(leadId);
                showNotification('Success', 'Lead deleted successfully', 'success');
            } catch (error) {
                showNotification('Error', error.message, 'error');
            }
        });
    }

    /**
     * Show delete confirmation modal
     */
    showDeleteModal(message, onConfirm) {
        document.getElementById('deleteMessage').textContent = message;
        this.deleteCallback = onConfirm;
        showModal('deleteModal');
    }

    /**
     * Hide delete modal
     */
    hideDeleteModal() {
        hideModal('deleteModal');
        this.deleteCallback = null;
    }

    /**
     * Confirm delete action
     */
    confirmDelete() {
        if (this.deleteCallback) {
            this.deleteCallback();
            this.hideDeleteModal();
        }
    }

    /**
     * Export leads to CSV
     */
    exportLeads() {
        try {
            const leadsToExport = this.dataManager.exportLeads(this.currentFilters);
            
            if (leadsToExport.length === 0) {
                showNotification('Warning', 'No leads to export with current filters', 'warning');
                return;
            }
            
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `leads-export-${timestamp}.csv`;
            
            exportToCSV(leadsToExport, filename);
            showNotification('Success', `Exported ${leadsToExport.length} leads to ${filename}`, 'success');
        } catch (error) {
            showNotification('Error', 'Failed to export leads', 'error');
            console.error('Export error:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Clear localStorage if there's corrupted data (temporary fix)
    try {
        const existingData = localStorage.getItem('leadManagementData');
        if (existingData) {
            const data = JSON.parse(existingData);
            if (!Array.isArray(data) || data.length < 30) {
                localStorage.removeItem('leadManagementData');
            }
        }
    } catch (e) {
        localStorage.removeItem('leadManagementData');
    }
    
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
