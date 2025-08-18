// Utility Functions for Lead Management App

/**
 * Generate a unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format date to readable string
 */
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format date for input fields
 */
function formatDateForInput(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

/**
 * Debounce function for search
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
function isValidPhone(phone) {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''));
}

/**
 * Show notification
 */
function showNotification(title, message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    notification.innerHTML = `
        <div class="notification-content">
            <i class="notification-icon ${iconMap[type]}"></i>
            <div class="notification-text">
                <div class="notification-title">${escapeHtml(title)}</div>
                <div class="notification-message">${escapeHtml(message)}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto hide after 5 seconds
    const autoHideTimeout = setTimeout(() => {
        hideNotification(notification);
    }, 5000);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoHideTimeout);
        hideNotification(notification);
    });
}

/**
 * Hide notification
 */
function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * Show modal
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Hide modal
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
}

/**
 * Export data to CSV
 */
function exportToCSV(data, filename = 'leads.csv') {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data) {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Priority', 'Assigned To', 'Follow-up Date', 'Created', 'Message', 'Notes'];
    const csvRows = [headers.join(',')];

    data.forEach(lead => {
        const row = [
            `"${escapeCSV(lead.name)}"`,
            `"${escapeCSV(lead.email)}"`,
            `"${escapeCSV(lead.phone || '')}"`,
            `"${escapeCSV(lead.company || '')}"`,
            `"${escapeCSV(lead.status)}"`,
            `"${escapeCSV(lead.tag)}"`,
            `"${escapeCSV(getAssignedUserName(lead.assignedTo))}"`,
            `"${escapeCSV(lead.followUpDate || 'Not set')}"`,
            `"${escapeCSV(formatDate(lead.createdAt))}"`,
            `"${escapeCSV(lead.message || '')}"`,
            `"${escapeCSV(lead.notes || '')}"`
        ];
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
}

/**
 * Escape CSV special characters
 */
function escapeCSV(text) {
    if (!text) return '';
    return String(text).replace(/"/g, '""');
}

/**
 * Get assigned user display name
 */
function getAssignedUserName(userId) {
    const users = {
        'john-doe': 'John Doe',
        'jane-smith': 'Jane Smith',
        'mike-johnson': 'Mike Johnson',
        'sarah-wilson': 'Sarah Wilson'
    };
    return users[userId] || 'Unassigned';
}

/**
 * Get status display properties
 */
function getStatusInfo(status) {
    const statusMap = {
        'new': { label: 'New', icon: 'fas fa-star' },
        'contacted': { label: 'Contacted', icon: 'fas fa-phone' },
        'in-progress': { label: 'In Progress', icon: 'fas fa-clock' },
        'closed': { label: 'Closed', icon: 'fas fa-check' },
        'trash': { label: 'Trash', icon: 'fas fa-trash' }
    };
    return statusMap[status] || { label: status, icon: 'fas fa-question' };
}

/**
 * Get priority display properties
 */
function getPriorityInfo(tag) {
    const tagMap = {
        'important': { label: 'Important', icon: 'fas fa-exclamation' },
        'less-important': { label: 'Less Important', icon: 'fas fa-minus' },
        'urgent': { label: 'Urgent', icon: 'fas fa-fire' },
        'follow-up': { label: 'Follow-up', icon: 'fas fa-redo' }
    };
    return tagMap[tag] || { label: tag, icon: 'fas fa-tag' };
}

/**
 * Format follow-up date with status
 */
function formatFollowUpDate(followUpDate) {
    if (!followUpDate) {
        return { text: 'Not set', class: 'empty', icon: 'fas fa-calendar-times' };
    }
    
    const today = new Date();
    const followUp = new Date(followUpDate);
    const diffTime = followUp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let className = 'upcoming';
    let icon = 'fas fa-calendar-check';
    
    if (diffDays < 0) {
        className = 'overdue';
        icon = 'fas fa-calendar-times';
    } else if (diffDays === 0) {
        className = 'today';
        icon = 'fas fa-calendar-day';
    }
    
    return {
        text: formatDate(followUp),
        class: className,
        icon: icon,
        days: diffDays
    };
}

/**
 * Filter leads based on criteria
 */
function filterLeads(leads, filters) {
    if (!leads || !Array.isArray(leads)) {
        return [];
    }
    return leads.filter(lead => {
        // Search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const searchFields = [
                lead.name,
                lead.email,
                lead.phone,
                lead.company,
                lead.message,
                lead.notes
            ].filter(Boolean).join(' ').toLowerCase();
            
            if (!searchFields.includes(searchTerm)) {
                return false;
            }
        }

        // Status filter
        if (filters.status && lead.status !== filters.status) {
            return false;
        }

        // Tag filter
        if (filters.tag && lead.tag !== filters.tag) {
            return false;
        }

        // Date range filter (created date)
        if (filters.dateFrom || filters.dateTo) {
            const leadDate = new Date(lead.createdAt);
            const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
            const toDate = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59') : null;

            if (fromDate && leadDate < fromDate) {
                return false;
            }
            if (toDate && leadDate > toDate) {
                return false;
            }
        }

        // Follow-up date range filter
        if (filters.followUpFrom || filters.followUpTo) {
            if (!lead.followUpDate) return false; // Exclude leads without follow-up dates
            
            const followUpDate = new Date(lead.followUpDate);
            const fromDate = filters.followUpFrom ? new Date(filters.followUpFrom) : null;
            const toDate = filters.followUpTo ? new Date(filters.followUpTo + 'T23:59:59') : null;

            if (fromDate && followUpDate < fromDate) {
                return false;
            }
            if (toDate && followUpDate > toDate) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Sort leads by specified field
 */
function sortLeads(leads, sortBy = 'createdAt', sortOrder = 'desc') {
    if (!leads || !Array.isArray(leads)) {
        return [];
    }
    return [...leads].sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        // Handle date sorting
        if (sortBy === 'createdAt') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }

        // Handle string sorting
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
    });
}

/**
 * Animate element
 */
function animateElement(element, animation = 'fadeIn') {
    element.style.animation = `${animation} 0.3s ease-in-out`;
    element.addEventListener('animationend', () => {
        element.style.animation = '';
    }, { once: true });
}

/**
 * Confirm action with user
 */
function confirmAction(message, callback) {
    // This could be enhanced with a custom modal, but for now using browser confirm
    if (confirm(message)) {
        callback();
    }
}

/**
 * Local Storage helpers
 */
const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
};
