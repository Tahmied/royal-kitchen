
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

async function apiRequest(path, { method = 'GET', body = null, params = null, signal = null } = {}) {
    // build URL with query params
    const url = new URL(path, window.location.origin);
    if (params && typeof params === 'object') {
        Object.keys(params).forEach(k => {
            const v = params[k];
            if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
        });
    }

    const headers = { 'Accept': 'application/json' };
    // if sending JSON body
    if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';

    const fetchOptions = {
        method,
        headers,
        signal
    };

    if (body) {
        fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    const res = await fetch(url.toString(), fetchOptions);

    // If response is CSV / blob (for export), return blob
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('text/csv')) {
        const blob = await res.blob();
        return { __blob: true, blob };
    }

    // otherwise parse json
    let json;
    try {
        json = await res.json();
    } catch (e) {
        if (!res.ok) throw new Error(res.statusText || 'Network error');
        return null;
    }

    // Your ApiResponse wrapper -> { status, data, message }
    if (!res.ok || (json && json.status && json.status >= 400)) {
        // prefer server-provided message
        const message = (json && json.message) ? json.message : res.statusText || 'API Error';
        throw new Error(message);
    }

    // return unwrapped data
    return json.data !== undefined ? json.data : json;
}


/**
 * Download a blob (CSV) returned by apiRequest
 */
function downloadBlob(blob, filename = 'download.csv') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

/**
 * Simple loading state toggler — adjust UI to suit.
 * Add CSS for .loading to show spinner/overlay if you want.
 */
function setLoading(isLoading = true) {
    if (isLoading) {
        document.body.classList.add('loading');
    } else {
        document.body.classList.remove('loading');
    }
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
        'New': { label: 'New', icon: 'fas fa-star' },
        'Contacted': { label: 'Contacted', icon: 'fas fa-phone' },
        'In-progress': { label: 'In Progress', icon: 'fas fa-clock' },
        'Closed': { label: 'Closed', icon: 'fas fa-check' },
        'Trash': { label: 'Trash', icon: 'fas fa-trash' }
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
 * Animate element
 */
function animateElement(element, animation = 'fadeIn') {
    element.style.animation = `${animation} 0.3s ease-in-out`;
    element.addEventListener('animationend', () => {
        element.style.animation = '';
    }, { once: true });
}
