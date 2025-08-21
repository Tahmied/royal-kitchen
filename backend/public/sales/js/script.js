// Modal functionality
function openViewModal() {
    document.getElementById('view-modal').classList.add('active');
}

function closeViewModal() {
    document.getElementById('view-modal').classList.remove('active');
}

function openEditModal() {
    document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('active');
}

function saveChanges() {
    // In a real application, this would save the changes to a database
    showNotification('Changes saved successfully!', 'success');
    closeEditModal();
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeViewModal();
        closeEditModal();
    }
});

// Pagination functionality
document.querySelectorAll('.pagination-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        if (!this.querySelector('i')) {
            this.classList.add('active');
        }
    });
});

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
                <span>${message}</span>
                <button onclick="this.parentElement.remove()">&times;</button>
            `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

