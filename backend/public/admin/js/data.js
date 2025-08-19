
class LeadDataManager {
    constructor() {
        this.subscribers = [];
        this.leads = [];       // current page leads
        this.totalLeads = 0;   // total count from server
        this.page = 1;
        this.limit = 20;
        this.totalPages = 1;
        this.currentFilters = {};
    }

    // subscribe / notify (keeps app.js usage same)
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    notifySubscribers() {
        if (this.subscribers && Array.isArray(this.subscribers)) {
            this.subscribers.forEach(cb => {
                try {
                    cb(this.leads);
                } catch (error) {
                    console.error('Error in subscriber callback:', error);
                }
            });
        }
    }

    /**
     * Load leads from backend with filters + pagination.
     * filters: { page, limit, status, tag, startDate, endDate }
     */
   async loadLeads(filters = {}) {
    this.currentFilters = filters;
    this.page = Number(this.currentFilters.page || 1);
    this.limit = Number(this.currentFilters.limit || 20);

    // Build params for the API call from the currentFilters state
    const params = {
        page: this.page,
        limit: this.limit,
        status: this.currentFilters.status || '',
        tag: this.currentFilters.tag || '',
        startDate: this.currentFilters.dateFrom || '', // map frontend name to backend name
        endDate: this.currentFilters.dateTo || '',     // map frontend name to backend name
        followUpFrom: this.currentFilters.followUpFrom || '',
        followUpTo: this.currentFilters.followUpTo || '',
        search: this.currentFilters.search || ''
    };

        try {
            setLoading(true);
            const data = await apiRequest('/api/v1/admin/getLeads', { method: 'GET', params });
            // backend returns { page, limit, totalLeads, totalPages, leads } inside data
            if (data) {
                this.page = Number(data.page || this.page);
                this.limit = Number(data.limit || this.limit);
                this.totalLeads = Number(data.totalLeads || 0);
                this.totalPages = Number(data.totalPages || Math.ceil(this.totalLeads / this.limit) || 1);
                this.leads = Array.isArray(data.leads) ? data.leads : [];
            } else {
                this.leads = [];
                this.totalLeads = 0;
                this.totalPages = 1;
            }
            this.notifySubscribers();
            return { leads: this.leads, totalLeads: this.totalLeads, totalPages: this.totalPages };
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    }


    // Get single lead
    async getLeadById(id) {
        if (!id) throw new Error('Lead ID required');
        try {
            setLoading(true);
            const data = await apiRequest(`/api/v1/admin/getLead/${id}`, { method: 'GET' });
            return data; // will be single lead object
        } finally {
            setLoading(false);
        }
    }

    // Add lead (requires server create endpoint)
async addLead(leadData) {
    try {
        setLoading(true);
        const data = await apiRequest('/api/v1/leads/submitLead', { // <--- FIXED URL
            method: 'POST',
            body: leadData 
        });
        await this.loadLeads({ page: 1 });
        return data;
    } catch (err) {
        throw err;
    } finally {
        setLoading(false);
    }
}


    // Update lead
    async updateLead(id, updates) {
        if (!id) throw new Error('Lead ID required');
        try {
            setLoading(true);
            const data = await apiRequest(`/api/v1/admin/editLead/${id}`, { method: 'PUT', body: updates });
            // refresh current page after update
            await this.loadLeads({ page: this.page, limit: this.limit });
            return data;
        } finally {
            setLoading(false);
        }
    }

    // Delete single lead
    async deleteLead(id) {
        if (!id) throw new Error('Lead ID required');
        try {
            setLoading(true);
            const data = await apiRequest(`/api/v1/admin/deleteLead/${id}`, { method: 'DELETE' });
            // refresh page (adjust page if needed)
            // If current page becomes empty after delete, you might want to decrement page
            await this.loadLeads({ page: this.page, limit: this.limit });
            return data;
        } finally {
            setLoading(false);
        }
    }

    // Bulk assign (calls assignLeads)
    async assignLeads(leadIds = [], userId, role) {
        if (!Array.isArray(leadIds) || leadIds.length === 0) throw new Error('leadIds required');
        try {
            setLoading(true);
            const data = await apiRequest('/api/v1/admin/assignLeads', {
                method: 'POST',
                body: { leadIds, userId, role }
            });
            await this.loadLeads({ page: this.page, limit: this.limit });
            return data;
        } finally {
            setLoading(false);
        }
    }

    // Bulk update
   async bulkUpdateLeads(leadIds = [], updates = {}) {
    if (!Array.isArray(leadIds) || leadIds.length === 0 || !updates) {
        throw new Error('An array of lead IDs and update fields are required.');
    }
    try {
        setLoading(true);
        const data = await apiRequest('/api/v1/admin/bulk-update', {
            method: 'PUT',
            body: { leadIds, updates }
        });
        // Reload leads to show changes
        await this.loadLeads({ page: this.page, limit: this.limit });
        return data;
    } catch (err) {
        throw err;
    } finally {
        setLoading(false);
    }
}

    // Bulk delete
async deleteLeads(leadIds = []) {
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
        throw new Error('An array of lead IDs is required for bulk deletion.');
    }
    try {
        setLoading(true);
        const data = await apiRequest('/api/v1/admin/bulk-delete', {
            method: 'DELETE',
            body: { leadIds } // Pass leadIds in the body
        });
        // Reload leads and adjust page if the current page becomes empty
        await this.loadLeads({ page: this.page, limit: this.limit });
        return data;
    } catch (err) {
        throw err;
    } finally {
        setLoading(false);
    }
}

    // Export leads (returns blob if backend sends CSV)
async exportLeads(filters = {}) {
        // Combine current filters with any specific filters passed to the function
        const params = {
            ...this.currentFilters,
            ...filters,
        };

        try {
            setLoading(true);
            const res = await apiRequest('/api/v1/admin/exportLeads', { method: 'GET', params });
            if (res && res.__blob && res.blob) {
                // If the server returns a blob, handle it directly
                return res.blob;
            } else {
                // If the server returns data string inside ApiResponse.data, return that data
                return res;
            }
        } finally {
            setLoading(false);
        }
    }

    // Small convenience: get statistics from the current (cached) page
    getStatistics() {
        const total = this.totalLeads || this.leads.length;
        const statusCounts = {};
        const priorityCounts = {};
        let assigned = 0, unassigned = 0;

        this.leads.forEach(l => {
            statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
            priorityCounts[l.tag] = (priorityCounts[l.tag] || 0) + 1;
            if (l.assignedTo) assigned++; else unassigned++;
        });

        return { total, statusCounts, priorityCounts, assignmentCounts: { assigned, unassigned } };
    }
}
