// Data Management for Lead Management App

/**
 * Lead data structure and initial empty state
 */
const STORAGE_KEY = 'leadManagementData';

/**
 * Default leads data - starts empty as per requirements
 */
const DEFAULT_LEADS = [];

/**
 * Sales team members for assignment
 */
const SALES_TEAM = [
    { id: 'john-doe', name: 'John Doe' },
    { id: 'jane-smith', name: 'Jane Smith' },
    { id: 'mike-johnson', name: 'Mike Johnson' },
    { id: 'sarah-wilson', name: 'Sarah Wilson' }
];

/**
 * Available status options
 */
const STATUS_OPTIONS = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'closed', label: 'Closed' },
    { value: 'trash', label: 'Trash' }
];

/**
 * Available priority/tag options
 */
const PRIORITY_OPTIONS = [
    { value: 'important', label: 'Important' },
    { value: 'less-important', label: 'Less Important' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'follow-up', label: 'Follow-up' }
];

/**
 * Data management class
 */
class LeadDataManager {
    constructor() {
        this.subscribers = [];
        this.leads = this.loadLeads();
    }

    /**
     * Load leads from localStorage
     */
    loadLeads() {
        const savedLeads = Storage.get(STORAGE_KEY, DEFAULT_LEADS);
        
        // If no leads exist or we have fewer than 30 leads, recreate sample data
        if (savedLeads.length === 0 || savedLeads.length < 30) {
            return this.createSampleData();
        }
        
        return savedLeads;
    }

    /**
     * Create sample data for demonstration
     */
    createSampleData() {
        const sampleLeads = [
            {
                id: generateId(),
                name: 'Sarah Johnson',
                email: 'sarah.johnson@techcorp.com',
                phone: '+1 (555) 123-4567',
                company: 'TechCorp Solutions',
                status: 'new',
                tag: 'important',
                assignedTo: '',
                message: 'Interested in enterprise software solutions for our growing team of 200+ employees.',
                notes: '',
                followUpDate: new Date(Date.now() + 604800000).toISOString().split('T')[0], // 1 week from now
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: 'Michael Chen',
                email: 'mchen@startup.io',
                phone: '+1 (555) 987-6543',
                company: 'Innovation Startup',
                status: 'contacted',
                tag: 'urgent',
                assignedTo: 'john-doe',
                message: 'Looking for cost-effective CRM solution. Budget around $50k annually.',
                notes: 'Follow up scheduled for next Tuesday. Very interested in our premium package.',
                followUpDate: new Date().toISOString().split('T')[0], // Today
                createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            },
            {
                id: generateId(),
                name: 'Emily Rodriguez',
                email: 'emily.r@marketingpro.com',
                phone: '+1 (555) 456-7890',
                company: 'Marketing Pro Agency',
                status: 'in-progress',
                tag: 'important',
                assignedTo: 'jane-smith',
                message: 'Need marketing automation tools for client campaigns. Requires API integration.',
                notes: 'Sent proposal. Waiting for decision from their board meeting.',
                followUpDate: new Date(Date.now() + 259200000).toISOString().split('T')[0], // 3 days from now
                createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
            },
            {
                id: generateId(),
                name: 'David Thompson',
                email: 'dthompson@retail.com',
                phone: '+1 (555) 321-0987',
                company: 'Retail Solutions Inc',
                status: 'closed',
                tag: 'follow-up',
                assignedTo: 'mike-johnson',
                message: 'Successfully implemented our e-commerce platform. Very satisfied with results.',
                notes: 'Deal closed! $75k annual contract. Ask for referrals in 3 months.',
                followUpDate: new Date(Date.now() + 7776000000).toISOString().split('T')[0], // 3 months from now
                createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
            },
            {
                id: generateId(),
                name: 'Lisa Wang',
                email: 'lisa.wang@healthcare.org',
                phone: '+1 (555) 654-3210',
                company: 'Healthcare Systems',
                status: 'new',
                tag: 'less-important',
                assignedTo: '',
                message: 'Exploring patient management systems for our clinic network.',
                notes: '',
                followUpDate: '', // No follow-up set
                createdAt: new Date(Date.now() - 345600000).toISOString() // 4 days ago
            },
            {
                id: generateId(),
                name: 'Robert Kim',
                email: 'robert.kim@fintech.io',
                phone: '+1 (555) 789-1234',
                company: 'FinTech Innovation',
                status: 'contacted',
                tag: 'urgent',
                assignedTo: 'sarah-wilson',
                message: 'Need compliance-ready financial software for our upcoming IPO.',
                notes: 'Scheduled demo for next week. High-value prospect.',
                followUpDate: new Date(Date.now() + 432000000).toISOString().split('T')[0], // 5 days from now
                createdAt: new Date(Date.now() - 518400000).toISOString() // 6 days ago
            },
            {
                id: generateId(),
                name: 'Amanda Foster',
                email: 'amanda@nonprofitorg.com',
                phone: '+1 (555) 234-5678',
                company: 'Community Foundation',
                status: 'in-progress',
                tag: 'important',
                assignedTo: 'john-doe',
                message: 'Looking for donor management and fundraising platform.',
                notes: 'Needs integration with existing accounting system.',
                followUpDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // 2 days from now
                createdAt: new Date(Date.now() - 691200000).toISOString() // 8 days ago
            },
            {
                id: generateId(),
                name: 'James Miller',
                email: 'j.miller@constructionco.com',
                phone: '+1 (555) 345-6789',
                company: 'Miller Construction',
                status: 'new',
                tag: 'follow-up',
                assignedTo: '',
                message: 'Interested in project management tools for construction teams.',
                notes: '',
                followUpDate: new Date(Date.now() + 864000000).toISOString().split('T')[0], // 10 days from now
                createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
            },
            {
                id: generateId(),
                name: 'Patricia Garcia',
                email: 'p.garcia@lawfirm.com',
                phone: '+1 (555) 456-7890',
                company: 'Garcia & Associates Law',
                status: 'closed',
                tag: 'follow-up',
                assignedTo: 'jane-smith',
                message: 'Successfully implemented case management system.',
                notes: 'Very satisfied with the solution. Potential for expansion.',
                followUpDate: new Date(Date.now() + 5184000000).toISOString().split('T')[0], // 2 months from now
                createdAt: new Date(Date.now() - 1296000000).toISOString() // 15 days ago
            },
            {
                id: generateId(),
                name: 'Kevin Liu',
                email: 'kevin.liu@ecommerce.shop',
                phone: '+1 (555) 567-8901',
                company: 'NextGen E-commerce',
                status: 'contacted',
                tag: 'important',
                assignedTo: 'mike-johnson',
                message: 'Need inventory management with AI-powered forecasting.',
                notes: 'Follow-up call scheduled. Strong interest in premium features.',
                followUpDate: new Date().toISOString().split('T')[0], // Today
                createdAt: new Date(Date.now() - 432000000).toISOString() // 5 days ago
            },
            {
                id: generateId(),
                name: 'Maria Santos',
                email: 'maria@educationalinst.edu',
                phone: '+1 (555) 678-9012',
                company: 'Riverside Educational Institute',
                status: 'in-progress',
                tag: 'urgent',
                assignedTo: 'sarah-wilson',
                message: 'Student information system for 5000+ students.',
                notes: 'Budget approved. Waiting on technical requirements document.',
                followUpDate: new Date(Date.now() + 345600000).toISOString().split('T')[0], // 4 days from now
                createdAt: new Date(Date.now() - 604800000).toISOString() // 7 days ago
            },
            {
                id: generateId(),
                name: 'Thomas Anderson',
                email: 'tanderson@securityfirm.com',
                phone: '+1 (555) 789-0123',
                company: 'CyberGuard Security',
                status: 'new',
                tag: 'urgent',
                assignedTo: '',
                message: 'Enterprise security management platform needed urgently.',
                notes: '',
                followUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            },
            {
                id: generateId(),
                name: 'Jennifer Brown',
                email: 'jen.brown@retailchain.com',
                phone: '+1 (555) 890-1234',
                company: 'Metro Retail Chain',
                status: 'contacted',
                tag: 'important',
                assignedTo: 'john-doe',
                message: 'Point of sale system for 50+ locations nationwide.',
                notes: 'Needs integration with existing loyalty program.',
                followUpDate: new Date(Date.now() + 518400000).toISOString().split('T')[0], // 6 days from now
                createdAt: new Date(Date.now() - 777600000).toISOString() // 9 days ago
            },
            {
                id: generateId(),
                name: 'Daniel Wilson',
                email: 'daniel@manufacturingco.com',
                phone: '+1 (555) 901-2345',
                company: 'Precision Manufacturing',
                status: 'trash',
                tag: 'less-important',
                assignedTo: '',
                message: 'Asked about manufacturing execution system but went with competitor.',
                notes: 'Decided to go with a cheaper alternative.',
                followUpDate: '',
                createdAt: new Date(Date.now() - 1728000000).toISOString() // 20 days ago
            },
            {
                id: generateId(),
                name: 'Rachel Green',
                email: 'rachel@startupaccel.com',
                phone: '+1 (555) 012-3456',
                company: 'Innovation Accelerator',
                status: 'in-progress',
                tag: 'follow-up',
                assignedTo: 'jane-smith',
                message: 'Startup incubator management platform for 100+ startups.',
                notes: 'Pilot program approved. Rolling out to 10 startups first.',
                followUpDate: new Date(Date.now() + 691200000).toISOString().split('T')[0], // 8 days from now
                createdAt: new Date(Date.now() - 950400000).toISOString() // 11 days ago
            },
            {
                id: generateId(),
                name: 'Mark Taylor',
                email: 'mark.taylor@consultinggroup.com',
                phone: '+1 (555) 123-4567',
                company: 'Strategic Consulting Group',
                status: 'closed',
                tag: 'important',
                assignedTo: 'mike-johnson',
                message: 'Project management and client collaboration tools.',
                notes: 'Deal closed successfully. $45k annual contract.',
                followUpDate: new Date(Date.now() + 7776000000).toISOString().split('T')[0], // 3 months from now
                createdAt: new Date(Date.now() - 1209600000).toISOString() // 14 days ago
            },
            {
                id: generateId(),
                name: 'Lisa Chen',
                email: 'lisa.chen@foodservice.com',
                phone: '+1 (555) 234-5678',
                company: 'Metro Food Services',
                status: 'new',
                tag: 'less-important',
                assignedTo: '',
                message: 'Restaurant management system for franchise operations.',
                notes: '',
                followUpDate: new Date(Date.now() + 1209600000).toISOString().split('T')[0], // 2 weeks from now
                createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
            },
            {
                id: generateId(),
                name: 'Steven Clark',
                email: 'sclark@logistics.transport',
                phone: '+1 (555) 345-6789',
                company: 'Clark Logistics',
                status: 'contacted',
                tag: 'urgent',
                assignedTo: 'sarah-wilson',
                message: 'Fleet management and route optimization system.',
                notes: 'Demo completed. Very impressed with GPS integration.',
                followUpDate: new Date(Date.now() + 259200000).toISOString().split('T')[0], // 3 days from now
                createdAt: new Date(Date.now() - 432000000).toISOString() // 5 days ago
            },
            {
                id: generateId(),
                name: 'Angela White',
                email: 'angela@medicalcenter.org',
                phone: '+1 (555) 456-7890',
                company: 'Regional Medical Center',
                status: 'in-progress',
                tag: 'important',
                assignedTo: 'john-doe',
                message: 'Electronic health records system for 500-bed hospital.',
                notes: 'HIPAA compliance review in progress.',
                followUpDate: new Date(Date.now() + 604800000).toISOString().split('T')[0], // 1 week from now
                createdAt: new Date(Date.now() - 864000000).toISOString() // 10 days ago
            },
            {
                id: generateId(),
                name: 'Charles Davis',
                email: 'charles@autoparts.supply',
                phone: '+1 (555) 567-8901',
                company: 'Auto Parts Supply Co',
                status: 'new',
                tag: 'follow-up',
                assignedTo: '',
                message: 'Inventory and supplier management for automotive parts.',
                notes: '',
                followUpDate: new Date(Date.now() + 777600000).toISOString().split('T')[0], // 9 days from now
                createdAt: new Date(Date.now() - 518400000).toISOString() // 6 days ago
            },
            {
                id: generateId(),
                name: 'Diana Martinez',
                email: 'diana@realtygroup.com',
                phone: '+1 (555) 678-9012',
                company: 'Premier Realty Group',
                status: 'contacted',
                tag: 'important',
                assignedTo: 'jane-smith',
                message: 'Real estate CRM and property management platform.',
                notes: 'Interested in MLS integration. Proposal sent.',
                followUpDate: new Date(Date.now() + 432000000).toISOString().split('T')[0], // 5 days from now
                createdAt: new Date(Date.now() - 691200000).toISOString() // 8 days ago
            },
            {
                id: generateId(),
                name: 'Paul Rodriguez',
                email: 'paul@fitnesschain.com',
                phone: '+1 (555) 789-0123',
                company: 'FitLife Gym Chain',
                status: 'closed',
                tag: 'follow-up',
                assignedTo: 'mike-johnson',
                message: 'Membership management and fitness tracking system.',
                notes: 'Successful implementation across 15 locations.',
                followUpDate: new Date(Date.now() + 5184000000).toISOString().split('T')[0], // 2 months from now
                createdAt: new Date(Date.now() - 1728000000).toISOString() // 20 days ago
            },
            {
                id: generateId(),
                name: 'Sandra Johnson',
                email: 'sandra@hotelgroup.com',
                phone: '+1 (555) 890-1234',
                company: 'Luxury Hotel Group',
                status: 'in-progress',
                tag: 'urgent',
                assignedTo: 'sarah-wilson',
                message: 'Hotel management system with online booking integration.',
                notes: 'Technical requirements finalized. Development started.',
                followUpDate: new Date(Date.now() + 1209600000).toISOString().split('T')[0], // 2 weeks from now
                createdAt: new Date(Date.now() - 1296000000).toISOString() // 15 days ago
            },
            {
                id: generateId(),
                name: 'Gary Thompson',
                email: 'gary@pharmadist.com',
                phone: '+1 (555) 901-2345',
                company: 'MedSupply Distribution',
                status: 'new',
                tag: 'less-important',
                assignedTo: '',
                message: 'Pharmaceutical supply chain management system.',
                notes: '',
                followUpDate: new Date(Date.now() + 1555200000).toISOString().split('T')[0], // 18 days from now
                createdAt: new Date(Date.now() - 345600000).toISOString() // 4 days ago
            },
            {
                id: generateId(),
                name: 'Helen Lee',
                email: 'helen@bankingcorp.com',
                phone: '+1 (555) 012-3456',
                company: 'Community Banking Corp',
                status: 'contacted',
                tag: 'urgent',
                assignedTo: 'john-doe',
                message: 'Core banking system modernization project.',
                notes: 'Regulatory compliance requirements under review.',
                followUpDate: new Date(Date.now() + 864000000).toISOString().split('T')[0], // 10 days from now
                createdAt: new Date(Date.now() - 1123200000).toISOString() // 13 days ago
            },
            {
                id: generateId(),
                name: 'Frank Wilson',
                email: 'frank@insurancegroup.com',
                phone: '+1 (555) 123-4567',
                company: 'Regional Insurance Group',
                status: 'trash',
                tag: 'less-important',
                assignedTo: '',
                message: 'Claims processing automation system inquiry.',
                notes: 'Project cancelled due to budget constraints.',
                followUpDate: '',
                createdAt: new Date(Date.now() - 2160000000).toISOString() // 25 days ago
            },
            {
                id: generateId(),
                name: 'Nancy Adams',
                email: 'nancy@advertisingagency.com',
                phone: '+1 (555) 234-5678',
                company: 'Creative Ad Agency',
                status: 'in-progress',
                tag: 'important',
                assignedTo: 'jane-smith',
                message: 'Campaign management and client reporting platform.',
                notes: 'Creative team loves the mockups. Technical review next week.',
                followUpDate: new Date(Date.now() + 518400000).toISOString().split('T')[0], // 6 days from now
                createdAt: new Date(Date.now() - 777600000).toISOString() // 9 days ago
            },
            {
                id: generateId(),
                name: 'George Martinez',
                email: 'george@agricorp.farm',
                phone: '+1 (555) 345-6789',
                company: 'AgriCorp Farming',
                status: 'new',
                tag: 'follow-up',
                assignedTo: '',
                message: 'Farm management and crop monitoring system.',
                notes: '',
                followUpDate: new Date(Date.now() + 1728000000).toISOString().split('T')[0], // 20 days from now
                createdAt: new Date(Date.now() - 432000000).toISOString() // 5 days ago
            },
            {
                id: generateId(),
                name: 'Carol Brown',
                email: 'carol@energycorp.com',
                phone: '+1 (555) 456-7890',
                company: 'Renewable Energy Corp',
                status: 'contacted',
                tag: 'urgent',
                assignedTo: 'mike-johnson',
                message: 'Grid management and energy trading platform.',
                notes: 'Proof of concept approved. Moving to pilot phase.',
                followUpDate: new Date(Date.now() + 1296000000).toISOString().split('T')[0], // 15 days from now
                createdAt: new Date(Date.now() - 1036800000).toISOString() // 12 days ago
            }
        ];

        this.saveLeads(sampleLeads);
        return sampleLeads;
    }

    /**
     * Save leads to localStorage
     */
    saveLeads(leads = this.leads) {
        const success = Storage.set(STORAGE_KEY, leads);
        if (success) {
            this.leads = leads;
            this.notifySubscribers();
        }
        return success;
    }

    /**
     * Subscribe to data changes
     */
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    /**
     * Notify all subscribers of data changes
     */
    notifySubscribers() {
        if (this.subscribers && Array.isArray(this.subscribers)) {
            this.subscribers.forEach(callback => {
                try {
                    callback(this.leads);
                } catch (error) {
                    console.error('Error in subscriber callback:', error);
                }
            });
        }
    }

    /**
     * Get all leads
     */
    getAllLeads() {
        return [...this.leads];
    }

    /**
     * Get lead by ID
     */
    getLeadById(id) {
        return this.leads.find(lead => lead.id === id);
    }

    /**
     * Add new lead
     */
    addLead(leadData) {
        const newLead = {
            id: generateId(),
            name: leadData.name.trim(),
            email: leadData.email.trim().toLowerCase(),
            phone: leadData.phone ? leadData.phone.trim() : '',
            company: leadData.company ? leadData.company.trim() : '',
            status: leadData.status || 'new',
            tag: leadData.tag || 'less-important',
            assignedTo: leadData.assignedTo || '',
            message: leadData.message ? leadData.message.trim() : '',
            notes: leadData.notes ? leadData.notes.trim() : '',
            followUpDate: leadData.followUpDate || '',
            createdAt: new Date().toISOString()
        };

        // Validate required fields
        if (!newLead.name || !newLead.email) {
            throw new Error('Name and email are required fields');
        }

        if (!isValidEmail(newLead.email)) {
            throw new Error('Please enter a valid email address');
        }

        if (newLead.phone && !isValidPhone(newLead.phone)) {
            throw new Error('Please enter a valid phone number');
        }

        // Check for duplicate email
        if (this.leads.some(lead => lead.email === newLead.email)) {
            throw new Error('A lead with this email already exists');
        }

        this.leads.unshift(newLead); // Add to beginning
        this.saveLeads();
        return newLead;
    }

    /**
     * Update existing lead
     */
    updateLead(id, updates) {
        const leadIndex = this.leads.findIndex(lead => lead.id === id);
        if (leadIndex === -1) {
            throw new Error('Lead not found');
        }

        const updatedLead = {
            ...this.leads[leadIndex],
            ...updates,
            // Ensure these fields are properly trimmed
            name: updates.name ? updates.name.trim() : this.leads[leadIndex].name,
            email: updates.email ? updates.email.trim().toLowerCase() : this.leads[leadIndex].email,
            phone: updates.phone !== undefined ? updates.phone.trim() : this.leads[leadIndex].phone,
            company: updates.company !== undefined ? updates.company.trim() : this.leads[leadIndex].company,
            message: updates.message !== undefined ? updates.message.trim() : this.leads[leadIndex].message,
            notes: updates.notes !== undefined ? updates.notes.trim() : this.leads[leadIndex].notes,
            followUpDate: updates.followUpDate !== undefined ? updates.followUpDate : this.leads[leadIndex].followUpDate
        };

        // Validate required fields
        if (!updatedLead.name || !updatedLead.email) {
            throw new Error('Name and email are required fields');
        }

        if (!isValidEmail(updatedLead.email)) {
            throw new Error('Please enter a valid email address');
        }

        if (updatedLead.phone && !isValidPhone(updatedLead.phone)) {
            throw new Error('Please enter a valid phone number');
        }

        // Check for duplicate email (excluding current lead)
        if (this.leads.some(lead => lead.id !== id && lead.email === updatedLead.email)) {
            throw new Error('A lead with this email already exists');
        }

        this.leads[leadIndex] = updatedLead;
        this.saveLeads();
        return updatedLead;
    }

    /**
     * Delete lead
     */
    deleteLead(id) {
        const leadIndex = this.leads.findIndex(lead => lead.id === id);
        if (leadIndex === -1) {
            throw new Error('Lead not found');
        }

        const deletedLead = this.leads.splice(leadIndex, 1)[0];
        this.saveLeads();
        return deletedLead;
    }

    /**
     * Delete multiple leads
     */
    deleteLeads(ids) {
        const deletedLeads = [];
        const idsToDelete = new Set(ids);
        
        this.leads = this.leads.filter(lead => {
            if (idsToDelete.has(lead.id)) {
                deletedLeads.push(lead);
                return false;
            }
            return true;
        });

        this.saveLeads();
        return deletedLeads;
    }

    /**
     * Update multiple leads
     */
    updateMultipleLeads(ids, updates) {
        const updatedLeads = [];
        const idsToUpdate = new Set(ids);

        this.leads.forEach(lead => {
            if (idsToUpdate.has(lead.id)) {
                Object.assign(lead, updates);
                updatedLeads.push(lead);
            }
        });

        this.saveLeads();
        return updatedLeads;
    }

    /**
     * Get leads with filters applied
     */
    getFilteredLeads(filters = {}) {
        let filteredLeads = filterLeads(this.leads, filters);
        
        // Apply sorting
        if (filters.sortBy) {
            filteredLeads = sortLeads(filteredLeads, filters.sortBy, filters.sortOrder);
        } else {
            // Default sort by creation date (newest first)
            filteredLeads = sortLeads(filteredLeads, 'createdAt', 'desc');
        }

        return filteredLeads;
    }

    /**
     * Get leads statistics
     */
    getStatistics() {
        const total = this.leads.length;
        const statusCounts = {};
        const priorityCounts = {};
        const assignmentCounts = {};

        STATUS_OPTIONS.forEach(status => {
            statusCounts[status.value] = 0;
        });

        PRIORITY_OPTIONS.forEach(priority => {
            priorityCounts[priority.value] = 0;
        });

        assignmentCounts.assigned = 0;
        assignmentCounts.unassigned = 0;

        this.leads.forEach(lead => {
            statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
            priorityCounts[lead.tag] = (priorityCounts[lead.tag] || 0) + 1;
            
            if (lead.assignedTo) {
                assignmentCounts.assigned++;
            } else {
                assignmentCounts.unassigned++;
            }
        });

        return {
            total,
            statusCounts,
            priorityCounts,
            assignmentCounts
        };
    }

    /**
     * Export leads data
     */
    exportLeads(filters = {}) {
        const leadsToExport = this.getFilteredLeads(filters);
        return leadsToExport;
    }

    /**
     * Clear all data (for reset)
     */
    clearAllData() {
        this.leads = [];
        this.saveLeads();
        Storage.remove(STORAGE_KEY);
    }

    /**
     * Import leads from array
     */
    importLeads(leadsArray) {
        const validLeads = [];
        const errors = [];

        leadsArray.forEach((leadData, index) => {
            try {
                // Validate lead data
                if (!leadData.name || !leadData.email) {
                    throw new Error('Name and email are required');
                }

                if (!isValidEmail(leadData.email)) {
                    throw new Error('Invalid email format');
                }

                const newLead = {
                    id: generateId(),
                    name: leadData.name.trim(),
                    email: leadData.email.trim().toLowerCase(),
                    phone: leadData.phone ? leadData.phone.trim() : '',
                    company: leadData.company ? leadData.company.trim() : '',
                    status: leadData.status || 'new',
                    tag: leadData.tag || 'less-important',
                    assignedTo: leadData.assignedTo || '',
                    message: leadData.message ? leadData.message.trim() : '',
                    notes: leadData.notes ? leadData.notes.trim() : '',
                    createdAt: leadData.createdAt || new Date().toISOString()
                };

                validLeads.push(newLead);
            } catch (error) {
                errors.push({ index, error: error.message });
            }
        });

        if (validLeads.length > 0) {
            this.leads = [...validLeads, ...this.leads];
            this.saveLeads();
        }

        return {
            imported: validLeads.length,
            errors
        };
    }
}

// Data manager instance will be created in app.js
