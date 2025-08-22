
    document.addEventListener('DOMContentLoaded', () => {

        // --- Data & State ---
        let projects = [
            { id: '1', projectName: 'Minimalist Kitchen Remodel', dateCreated: '2023-10-26', hasImages: true, hasVideo: true },
            { id: '2', projectName: 'Modern Open-Concept Living', dateCreated: '2023-09-15', hasImages: true, hasVideo: false },
            { id: '3', projectName: 'Classic Home Office Design', dateCreated: '2023-08-01', hasImages: false, hasVideo: true },
        ];
        let currentMode = 'create'; // 'create' or 'edit'
        let editingProjectId = null;


        // --- DOM Elements ---
        const dashboardView = document.getElementById('dashboard-view');
        const formView = document.getElementById('form-view');
        const formTitle = document.getElementById('form-title');
        const projectsTableBody = document.getElementById('projects-table-body');
        const projectForm = document.getElementById('project-form');
        const createBtn = document.getElementById('create-project-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const deleteModal = document.getElementById('delete-modal');
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');


        // --- UI Rendering Functions ---
        function renderProjectsTable() {
            projectsTableBody.innerHTML = '';
            projects.forEach(project => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${project.projectName}</td>
                    <td>${project.dateCreated}</td>
                    <td class="text-center project-action-btns">
                        <button class="action-btn edit-btn" data-id="${project.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete-btn" data-id="${project.id}">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </td>
                `;
                projectsTableBody.appendChild(row);
            });
        }

        function showDashboard() {
            dashboardView.classList.remove('hidden');
            formView.classList.add('hidden');
        }

        function showForm(mode, project = {}) {
            dashboardView.classList.add('hidden');
            formView.classList.remove('hidden');

            currentMode = mode;
            if (mode === 'create') {
                formTitle.textContent = 'Create New Project';
                projectForm.reset();
                editingProjectId = null;
            } else if (mode === 'edit') {
                formTitle.textContent = 'Edit Project';
                // Pre-populate the form (simulated)
                projectForm.projectName.value = project.projectName;
                projectForm.projectContent.value = 'This is the simulated content for ' + project.projectName;
                editingProjectId = project.id;
            }
        }

        function showDeleteModal(id) {
            deleteModal.classList.remove('hidden');
            deleteModal.dataset.projectId = id;
        }

        function hideDeleteModal() {
            deleteModal.classList.add('hidden');
            deleteModal.removeAttribute('data-projectId');
        }


        // --- Event Listeners ---
        createBtn.addEventListener('click', () => showForm('create'));
        cancelBtn.addEventListener('click', () => showDashboard());
        cancelDeleteBtn.addEventListener('click', () => hideDeleteModal());

        // Event delegation for table buttons
        projectsTableBody.addEventListener('click', (event) => {
            const target = event.target.closest('button');
            if (!target) return;

            const projectId = target.dataset.id;
            const project = projects.find(p => p.id === projectId);

            if (target.classList.contains('edit-btn')) {
                showForm('edit', project);
            } else if (target.classList.contains('delete-btn')) {
                showDeleteModal(projectId);
            }
        });

        // Form Submission Handler
        projectForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Simulate form data handling
            const newProject = {
                id: editingProjectId || Date.now().toString(),
                projectName: projectForm.projectName.value,
                dateCreated: new Date().toISOString().slice(0, 10),
                // Simulate file existence
                hasImages: true,
                hasVideo: true
            };
            
            if (currentMode === 'create') {
                projects.push(newProject);
                alert('Simulated: Project created successfully!');
            } else {
                projects = projects.map(p => p.id === editingProjectId ? newProject : p);
                alert('Simulated: Project updated successfully!');
            }
            
            showDashboard();
            renderProjectsTable();
        });

        // Delete Confirmation Handler
        confirmDeleteBtn.addEventListener('click', () => {
            const projectIdToDelete = deleteModal.dataset.projectId;
            projects = projects.filter(project => project.id !== projectIdToDelete);
            
            hideDeleteModal();
            renderProjectsTable();
            alert('Simulated: Project deleted successfully!');
        });


        // --- Initial Call ---
        renderProjectsTable();
    });
        function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
