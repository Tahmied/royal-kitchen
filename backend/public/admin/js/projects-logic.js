document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_BASE = '/api/v1/projects';

    // --- Data & State ---
    let projects = [];
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

    // Rich text editor elements
    const editor = document.getElementById('projectContent');
    const editorTextarea = document.getElementById('projectContentTextarea');
    const imageUpload = document.getElementById('imageUpload');
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    const formatSelect = document.querySelector('.toolbar-select');

    // File upload elements
    const homepageImagesInput = document.getElementById('homepageImages');
    const videoThumbnailInput = document.getElementById('videoThumbnail');
    const videoInput = document.getElementById('video');
    const ownerProfileImageInput = document.getElementById('ownerProfileImage');

    // --- Utility Functions ---
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
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    // --- API Functions ---
    async function apiRequest(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            credentials: 'include', // Include cookies for authentication
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async function fetchProjects() {
        try {
            const result = await apiRequest('/getAllProjects');
            projects = result.data || [];
            renderProjectsTable();
        } catch (error) {
            showNotification('Failed to load projects: ' + error.message, 'error');
        }
    }

    async function fetchProjectDetails(id) {
        try {
            // Use public endpoint to get full project details
            const response = await fetch(`${API_BASE}/public/${id}`, {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch project details: ${response.statusText}`);
            }
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching project details:', error);
            throw error;
        }
    }

    async function createProject(formData) {
        try {
            const result = await apiRequest('/createProject', {
                method: 'POST',
                body: formData
            });
            return result;
        } catch (error) {
            throw new Error('Failed to create project: ' + error.message);
        }
    }

    async function updateProject(id, formData) {
        try {
            const result = await apiRequest(`/admin/${id}`, {
                method: 'PUT',
                body: formData
            });
            return result;
        } catch (error) {
            throw new Error('Failed to update project: ' + error.message);
        }
    }

    async function deleteProject(id) {
        try {
            await apiRequest(`/admin/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            throw new Error('Failed to delete project: ' + error.message);
        }
    }

    async function uploadContentImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const result = await apiRequest('/upload-content-image', {
                method: 'POST',
                body: formData
            });
            
            return result.data.url;
        } catch (error) {
            throw new Error('Failed to upload image: ' + error.message);
        }
    }

    // --- UI Rendering Functions ---
    function renderProjectsTable() {
        projectsTableBody.innerHTML = '';
        
        if (projects.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="3" class="text-center" style="padding: 2rem; color: #666;">
                    No projects found. <a href="#" id="create-first-project" style="color: #007bff;">Create your first project</a>
                </td>
            `;
            projectsTableBody.appendChild(row);
            
            document.getElementById('create-first-project').addEventListener('click', (e) => {
                e.preventDefault();
                showForm('create');
            });
            return;
        }

        projects.forEach(project => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${project.projectName || 'Untitled Project'}</td>
                <td>${formatDate(project.dateCreated || project.createdAt)}</td>
                <td class="text-center project-action-btns">
                    <button class="action-btn edit-btn" data-id="${project.id || project._id}" title="Edit Project">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" data-id="${project.id || project._id}" title="Delete Project">
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
        fetchProjects(); // Refresh the projects list
    }

async function showForm(mode, projectId = null) {
        dashboardView.classList.add('hidden');
        formView.classList.remove('hidden');

        currentMode = mode;
        
        if (mode === 'create') {
            formTitle.textContent = 'Create New Project';
            projectForm.reset();
            editor.innerHTML = '';
            editingProjectId = null;
            clearFilePreviews();
        } else if (mode === 'edit' && projectId) {
            formTitle.textContent = 'Edit Project';
            editingProjectId = projectId;
            
            try {
                const project = await fetchProjectDetails(projectId);
                
                // Populate form fields
                document.getElementById('projectName').value = project.projectName || '';
                editor.innerHTML = project.projectContent || '';
                
                // --- Fix to display existing file previews ---
                clearFilePreviews(); // Clear any existing previews first
                
                const homepagePreviews = document.getElementById('homepageImages-previews');
                if (project.homepageImages && Array.isArray(project.homepageImages)) {
                    project.homepageImages.forEach(imageUrl => {
                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.alt = 'Homepage Image';
                        img.style.maxWidth = '100px';
                        img.style.maxHeight = '100px';
                        img.style.margin = '5px';
                        img.style.objectFit = 'cover';
                        homepagePreviews.appendChild(img);
                    });
                }

                const videoThumbnailPreview = document.getElementById('videoThumbnail-preview');
                if (project.videoThumbnailPath) {
                    const img = document.createElement('img');
                    img.src = project.videoThumbnailPath;
                    img.alt = 'Video Thumbnail';
                    img.style.maxWidth = '150px';
                    img.style.maxHeight = '100px';
                    img.style.objectFit = 'cover';
                    videoThumbnailPreview.appendChild(img);
                }

                const videoPreview = document.getElementById('video-preview');
                if (project.videoPath) {
                    const video = document.createElement('video');
                    video.src = project.videoPath;
                    video.controls = true;
                    video.style.maxWidth = '200px';
                    video.style.maxHeight = '150px';
                    videoPreview.appendChild(video);
                }

                const ownerProfileImagePreview = document.getElementById('ownerProfileImage-preview');
                if (project.ownerProfileImagePath) {
                    const img = document.createElement('img');
                    img.src = project.ownerProfileImagePath;
                    img.alt = 'Owner Profile Picture';
                    img.style.maxWidth = '100px';
                    img.style.maxHeight = '100px';
                    img.style.objectFit = 'cover';
                    ownerProfileImagePreview.appendChild(img);
                }

                
            } catch (error) {
                showNotification('Failed to load project details: ' + error.message, 'error');
                showDashboard();
            }
        }
    }
    function showDeleteModal(id) {
        deleteModal.classList.remove('hidden');
        deleteModal.dataset.projectId = id;
    }

    function hideDeleteModal() {
        deleteModal.classList.add('hidden');
        deleteModal.removeAttribute('data-project-id');
    }

    function clearFilePreviews() {
        // Clear file previews
        document.getElementById('homepageImages-previews').innerHTML = '';
        document.getElementById('videoThumbnail-preview').innerHTML = '';
        document.getElementById('video-preview').innerHTML = '';
        document.getElementById('ownerProfileImage-preview').innerHTML = ''; 
    }

    // --- Rich Text Editor Functions ---
    function initRichTextEditor() {
        // Toolbar button actions
        toolbarButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const command = this.dataset.command;
                
                if (command === 'insertImage') {
                    imageUpload.click();
                } else {
                    document.execCommand(command, false, null);
                    editor.focus();
                }
            });
        });
        
        // Heading format change
        if (formatSelect) {
            formatSelect.addEventListener('change', function() {
                const format = this.value;
                document.execCommand('formatBlock', false, format);
                editor.focus();
            });
        }
        
        // Handle image upload for rich text editor
        imageUpload.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                try {
                    showNotification('Uploading image...', 'info');
                    const imageUrl = await uploadContentImage(file);
                    
                    // Insert image into editor
                    document.execCommand('insertImage', false, imageUrl);
                    editor.focus();
                    
                    showNotification('Image uploaded successfully!', 'success');
                } catch (error) {
                    showNotification('Failed to upload image: ' + error.message, 'error');
                }
            }
            // Reset the input to allow uploading the same image again
            this.value = '';
        });
    }

    // --- File Preview Functions ---
    function setupFilePreviewHandlers() {
        // Homepage images preview
        homepageImagesInput.addEventListener('change', function(e) {
            const preview = document.getElementById('homepageImages-previews');
            preview.innerHTML = '';
            
            Array.from(e.target.files).forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.maxWidth = '100px';
                        img.style.maxHeight = '100px';
                        img.style.margin = '5px';
                        img.style.objectFit = 'cover';
                        preview.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            });
        });

        // Video thumbnail preview
        videoThumbnailInput.addEventListener('change', function(e) {
            const preview = document.getElementById('videoThumbnail-preview');
            preview.innerHTML = '';
            
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '150px';
                    img.style.maxHeight = '100px';
                    img.style.objectFit = 'cover';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });

        // Video preview
        videoInput.addEventListener('change', function(e) {
            const preview = document.getElementById('video-preview');
            preview.innerHTML = '';
            
            const file = e.target.files[0];
            if (file && file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.controls = true;
                video.style.maxWidth = '200px';
                video.style.maxHeight = '150px';
                preview.appendChild(video);
            }
        });

        ownerProfileImageInput.addEventListener('change', function(e) {
            const preview = document.getElementById('ownerProfileImage-preview');
            preview.innerHTML = '';

            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100px';
                    img.style.maxHeight = '100px';
                    img.style.objectFit = 'cover';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });

    }

    // --- Form Validation ---
function validateForm() {
    const projectName = document.getElementById('projectName').value.trim();

    if (!projectName) {
        showNotification('Project name is required', 'error');
        return false;
    }

    if (currentMode === 'create') {
        const homepageImages = homepageImagesInput.files;
        const videoThumbnail = videoThumbnailInput.files[0];
        const video = videoInput.files[0];
        const ownerProfileImage = ownerProfileImageInput.files[0]; // Get the new field

        // Check for required files only when creating a new project
        if (!ownerProfileImage) {
            showNotification('Owner profile picture is required', 'error');
            return false;
        }

        if (homepageImages.length !== 6) {
            showNotification('Exactly 6 homepage images are required', 'error');
            return false;
        }

        if (!videoThumbnail) {
            showNotification('Video thumbnail is required', 'error');
            return false;
        }

        if (!video) {
            showNotification('Video file is required', 'error');
            return false;
        }
    }

    return true;
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

        if (target.classList.contains('edit-btn')) {
            showForm('edit', projectId);
        } else if (target.classList.contains('delete-btn')) {
            showDeleteModal(projectId);
        }
    });

    // Form Submission Handler
    projectForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (!validateForm()) return;
        
        // Sync editor content with textarea
        editorTextarea.value = editor.innerHTML;
        
        const formData = new FormData();
        formData.append('projectName', document.getElementById('projectName').value);
        formData.append('projectContent', editor.innerHTML);
        
        // Append homepage images
        Array.from(homepageImagesInput.files).forEach((file, index) => {
            formData.append('homepageImages', file);
        });
        
        // Append video thumbnail
        if (videoThumbnailInput.files[0]) {
            formData.append('videoThumbnail', videoThumbnailInput.files[0]);
        }
        
        // Append video file
        if (videoInput.files[0]) {
            formData.append('video', videoInput.files[0]);
        }

        // Append owner's profile image
        if (ownerProfileImageInput.files[0]) {
            formData.append('ownerProfileImage', ownerProfileImageInput.files[0]);
        }
        
        try {
            if (currentMode === 'create') {
                showNotification('Creating project...', 'info');
                await createProject(formData);
                showNotification('Project created successfully!', 'success');
            } else {
                showNotification('Updating project...', 'info');
                await updateProject(editingProjectId, formData);
                showNotification('Project updated successfully!', 'success');
            }
            
            showDashboard();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    // Delete Confirmation Handler
    confirmDeleteBtn.addEventListener('click', async () => {
        const projectIdToDelete = deleteModal.dataset.projectId;
        
        try {
            showNotification('Deleting project...', 'info');
            await deleteProject(projectIdToDelete);
            hideDeleteModal();
            showNotification('Project deleted successfully!', 'success');
            fetchProjects(); // Refresh the projects list
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    // --- Initialization ---
    function init() {
        initRichTextEditor();
        setupFilePreviewHandlers();
        fetchProjects(); // Load projects on page load
    }

    // Start the application
    init();
});

// Add CSS for notifications if not already present
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.3s ease;
            max-width: 300px;
        }
        
        .notification-toast.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .notification-toast.success {
            border-left: 4px solid #28a745;
            color: #155724;
        }
        
        .notification-toast.error {
            border-left: 4px solid #dc3545;
            color: #721c24;
        }
        
        .notification-toast.info {
            border-left: 4px solid #17a2b8;
            color: #0c5460;
        }
        
        .notification-toast i {
            font-size: 18px;
        }
    `;
    document.head.appendChild(style);
}