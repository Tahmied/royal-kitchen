// Featured Projects Image Switcher with Smooth Animation
class ProjectImageSwitcher {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('click', this.handleImageClick.bind(this));
        this.initializeExistingSections();
        this.setupMutationObserver();
    }

    initializeExistingSections() {
        const sections = document.querySelectorAll('.fourth-section');
        sections.forEach(section => {
            this.initializeSection(section);
        });
    }

    initializeSection(section) {
        const thumbnails = section.querySelectorAll('.other-project-imgs');
        
        thumbnails.forEach(thumbnail => {
            this.updateThumbnailOverlay(thumbnail);
        });
    }

    handleImageClick(event) {
        const clickedThumbnail = event.target.closest('.other-project-imgs');
        
        if (!clickedThumbnail) return;
        
        const section = clickedThumbnail.closest('.fourth-section');
        const pinnedImg = section.querySelector('.pinned-project-img');
        const clickedImg = clickedThumbnail.querySelector('img');
        
        if (!section || !pinnedImg || !clickedImg) return;
        
        if (clickedThumbnail.id === 'active-project-img') return;
        
        this.switchImages(section, pinnedImg, clickedImg, clickedThumbnail);
    }

    switchImages(section, pinnedImg, clickedImg, clickedThumbnail) {
        const currentActive = section.querySelector('#active-project-img');
        const currentPinnedSrc = pinnedImg.src;
        const newPinnedSrc = clickedImg.src;
        
        pinnedImg.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
        clickedImg.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
        
        pinnedImg.style.opacity = '0';
        pinnedImg.style.transform = 'scale(0.95)';
        
        clickedImg.style.opacity = '0';
        clickedImg.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            pinnedImg.src = newPinnedSrc;
            
            if (currentActive && currentActive !== clickedThumbnail) {
                const currentActiveImg = currentActive.querySelector('img');
                if (currentActiveImg) {
                    currentActiveImg.src = currentPinnedSrc;
                }
            }
            
            if (currentActive) {
                currentActive.removeAttribute('id');
            }
            clickedThumbnail.id = 'active-project-img';
            
            const allThumbnails = section.querySelectorAll('.other-project-imgs');
            allThumbnails.forEach(thumbnail => {
                this.updateThumbnailOverlay(thumbnail);
            });
            
            pinnedImg.style.opacity = '1';
            pinnedImg.style.transform = 'scale(1)';
            clickedImg.style.opacity = '1';
            clickedImg.style.transform = 'scale(1)';
            
            setTimeout(() => {
                pinnedImg.style.transition = '';
                clickedImg.style.transition = '';
            }, 300);
            
        }, 150); 
    }

    updateThumbnailOverlay(thumbnail) {
        const existingOverlay = thumbnail.querySelector('.thumbnail-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        if (thumbnail.id !== 'active-project-img') {
            const overlay = document.createElement('div');
            overlay.className = 'thumbnail-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.4);
                border-radius: 12px;
                cursor: pointer;
                transition: opacity 0.2s ease;
                z-index: 1;
            `;
            
            overlay.addEventListener('mouseenter', () => {
                overlay.style.opacity = '0.2';
            });
            
            overlay.addEventListener('mouseleave', () => {
                overlay.style.opacity = '1';
            });
            
            thumbnail.style.position = 'relative';
            thumbnail.appendChild(overlay);
        }
    }

    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && node.classList.contains('fourth-section')) {
                            this.initializeSection(node);
                        } else {
                            const sections = node.querySelectorAll && node.querySelectorAll('.fourth-section');
                            if (sections) {
                                sections.forEach(section => {
                                    this.initializeSection(section);
                                });
                            }
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Dynamic Projects Loader
class DynamicProjectsLoader {
    constructor() {
        this.projects = [];
        this.projectsContainer = null;
        this.init();
    }

    async init() {
        await this.fetchProjects();
        this.findProjectsContainer();
        this.renderProjects();
        this.initVideoFunctionality();
    }

    async fetchProjects() {
        try {
            const response = await fetch('/api/v1/projects/public');
            const result = await response.json();
            
            if (result.success && result.data) {
                this.projects = result.data;
                console.log('Projects loaded:', this.projects);
            } else {
                console.error('Failed to fetch projects:', result.message);
                this.projects = [];
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            this.projects = [];
        }
    }

    findProjectsContainer() {
        // Find the fifth-section to insert projects before it
        const fifthSection = document.querySelector('.fifth-section');
        this.projectsContainer = fifthSection ? fifthSection.parentElement : document.body;
        this.insertionPoint = fifthSection;
    }

    renderProjects() {
        if (!this.projects.length) {
            console.log('No projects to render');
            return;
        }

        // Remove existing static sections
        const existingSections = document.querySelectorAll('.fourth-section');
        existingSections.forEach(section => section.remove());

        // Create and insert new dynamic sections
        this.projects.forEach((project, index) => {
            const section = this.createProjectSection(project, index);
            if (this.insertionPoint) {
                this.projectsContainer.insertBefore(section, this.insertionPoint);
            } else {
                this.projectsContainer.appendChild(section);
            }
        });

        // Add video modal if not exists
        this.ensureVideoModal();
    }

    createProjectSection(project, index) {
        const isReverse = index % 2 !== 0;
        
        const section = document.createElement('section');
        section.className = 'fourth-section';
        section.dataset.projectId = project._id;
        
        if (isReverse) {
            section.id = 'reverse-project-section';
        }

        // Add shadow overlay for first and non-reverse sections
        let shadowOverlay = '';
        if (index === 0 || !isReverse) {
            shadowOverlay = '<img src="images/section-four/fourth-overlay-shadow.png" alt="" class="fourth-overlay-shadow">';
        }

        // Add heading only for first section
        let heading = '';
        if (index === 0) {
            heading = '<h2 class="fourth-heading">Featured Projects</h2>';
        }

        const containerClass = isReverse ? 'fourth-container' : 'fourth-container';
        const containerId = isReverse ? 'id="reverse-project-container"' : '';

        section.innerHTML = `
            ${shadowOverlay}
            ${heading}
            <div class="${containerClass}" ${containerId}>
                <div class="fourth-left">
                    <img src="${project.homepageImages[0]}" alt="" class="pinned-project-img" id="pinned-project-img-id">

                    <button class="project-pinned-pic-btn" onclick="window.location.href='project.html?id=${project._id}'">
                        <div class="house-owner">
                            <img src="images/section-four/owner.png" alt="" class="profile-pic">
                        </div>
                        <div class="house-owner-details">
                            <p class="owner-name">${project.projectName}</p>
                            <p class="see-details">See Details</p>
                        </div>
                    </button>

                    <button class="project-details-page-indicator-btn" onclick="window.location.href='project.html?id=${project._id}'">
                        <span class="project-button-text">Click for details</span>
                        <img id="project-cta-btn-arrow" src="images/hero/button-arrow.svg" alt="" class="cta-btn-arrow">
                    </button>
                </div>
                <div class="fourth-right">
                    ${this.createThumbnails(project.homepageImages)}
                </div>
            </div>
            <div class="fourth-video-container" data-video-path="${project.videoPath}">
                <img src="${project.videoThumbnailPath}" alt="" class="fourth-video-thumbnail">
                <div class="fourth-video-overlay">
                    <p class="video-overlay-text">PLAY</p>
                    <img src="images/section-four/video-play-icon.svg" alt="" class="video-play-icon">
                    <p class="video-overlay-text">VIDEO</p>
                </div>
            </div>
        `;

        return section;
    }

    createThumbnails(images) {
        return images.map((imageSrc, index) => `
            <div class="other-project-imgs" ${index === 0 ? 'id="active-project-img"' : ''}>
                <img src="${imageSrc}" alt="">
            </div>
        `).join('');
    }

    ensureVideoModal() {
        if (!document.getElementById('video-modal')) {
            const modalHTML = `
                <div id="video-modal" class="video-modal" aria-hidden="true">
                    <div class="video-modal-overlay" id="video-modal-overlay"></div>
                    <div class="video-modal-content">
                        <button id="video-modal-close" class="video-modal-close">×</button>
                        <div class="video-container">
                            <video id="local-video" controls>
                                <source id="local-video-source" src="" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    initVideoFunctionality() {
        const videoModal = document.getElementById('video-modal');
        const videoOverlay = document.getElementById('video-modal-overlay');
        const videoCloseBtn = document.getElementById('video-modal-close');
        const videoElement = document.getElementById('local-video');
        const videoSource = document.getElementById('local-video-source');

        // Function to open video modal with the correct video
        const openVideoModal = (event) => {
            const videoContainer = event.currentTarget;
            const videoPath = videoContainer.dataset.videoPath;
            
            if (!videoPath) {
                console.error('No video path found for this project');
                return;
            }
            
            // Set the video source and load it
            videoSource.src = videoPath;
            videoElement.load();
            
            // Show the modal
            videoModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Play the video when it's ready
            const playVideo = function() {
                videoElement.play().catch(error => {
                    console.log('Auto-play prevented:', error);
                });
                videoElement.removeEventListener('canplay', playVideo);
            };
            
            videoElement.addEventListener('canplay', playVideo);
        };

        // Function to close video modal
        const closeVideoModal = () => {
            videoModal.setAttribute('aria-hidden', 'true');
            videoElement.pause();
            videoElement.currentTime = 0;
            document.body.style.overflow = '';
        };

        // Add event listeners to all video containers (using event delegation)
        document.addEventListener('click', (event) => {
            const clickedElement = event.target.closest('.fourth-video-container, .fourth-video-overlay');
            if (clickedElement) {
                event.preventDefault();
                
                // Find the video container that has the data-video-path attribute
                let videoContainer = clickedElement;
                if (clickedElement.classList.contains('fourth-video-overlay')) {
                    videoContainer = clickedElement.closest('.fourth-video-container');
                }
                
                if (videoContainer) {
                    openVideoModal({ currentTarget: videoContainer });
                }
            }
        });

        // Close modal events
        if (videoCloseBtn) {
            videoCloseBtn.addEventListener('click', closeVideoModal);
        }
        
        if (videoOverlay) {
            videoOverlay.addEventListener('click', function(e) {
                if (e.target === videoOverlay) {
                    closeVideoModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && videoModal && videoModal.getAttribute('aria-hidden') === 'false') {
                closeVideoModal();
            }
        });

        // Reset video when modal is closed
        if (videoModal) {
            videoModal.addEventListener('transitionend', function(e) {
                if (e.propertyName === 'opacity' && videoModal.getAttribute('aria-hidden') === 'true') {
                    videoElement.pause();
                    videoElement.currentTime = 0;
                }
            });
        }
    }
}

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ProjectImageSwitcher();
        new DynamicProjectsLoader();
    });
} else {
    new ProjectImageSwitcher();
    new DynamicProjectsLoader();
}

window.ProjectImageSwitcher = ProjectImageSwitcher;
window.DynamicProjectsLoader = DynamicProjectsLoader;

// Contact form and other existing functionality
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pcf-contactForm');
    const nameInput = document.getElementById('pcf-name');
    const phoneInput = document.getElementById('pcf-email');       //  "Phone Number" in markup
    const emailInput = document.getElementById('pcf-company');     //  "Email address" in markup
    const messageInput = document.getElementById('pcf-message');
    const submitBtn = document.getElementById('pcf-submitBtn');
    const cancelBtn = document.getElementById('pcf-cancelBtn');
    const closeBtn = document.getElementById('pcf-closeBtn');
    const overlay = document.getElementById('pcf-overlay');
    const modal = document.getElementById('pcf-modal');

    // Toast styles creation
    (function createToastStyles() {
        if (document.getElementById('pcf-toast-styles')) return;
        const style = document.createElement('style');
        style.id = 'pcf-toast-styles';
        style.textContent = `
            .pcf-toast-container {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            }
            .pcf-toast {
                pointer-events: auto;
                min-width: 280px;
                max-width: 420px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(12,15,20,0.12);
                padding: 14px 16px;
                display: flex;
                gap: 12px;
                align-items: flex-start;
                transform-origin: top right;
                animation: pcf-toast-in .18s ease-out;
                color: #0b1020;
                background: linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(250,250,255,0.96) 100%);
                border: 1px solid rgba(12,15,20,0.06);
                font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
            }
            .pcf-toast .pcf-icon {
                width: 36px; height: 36px; flex: 0 0 36px; border-radius: 10px;
                display: grid; place-items: center; font-size: 18px;
            }
            .pcf-toast .pcf-body { flex: 1; }
            .pcf-toast .pcf-title { font-weight: 600; margin-bottom: 2px; font-size: 14px; }
            .pcf-toast .pcf-msg { font-size: 13px; opacity: 0.9; line-height: 1.3; }
            .pcf-toast .pcf-close {
                margin-left: 8px; background: transparent; border: none; cursor: pointer; opacity: 0.7;
            }
            .pcf-toast-success .pcf-icon { background: linear-gradient(135deg,#7C3AED,#06B6D4); color: #fff; }
            .pcf-toast-error .pcf-icon { background: linear-gradient(135deg,#FB7185,#F97316); color: #fff; }
            @keyframes pcf-toast-in {
                from { transform: translateY(-6px) scale(.98); opacity: 0; }
                to   { transform: translateY(0) scale(1); opacity: 1; }
            }
            @keyframes pcf-toast-out {
                from { opacity: 1; transform: translateY(0) scale(1); }
                to   { opacity: 0; transform: translateY(-8px) scale(.98); }
            }
            .pcf-toast-fadeout { animation: pcf-toast-out .16s ease-in forwards; }
        `;
        document.head.appendChild(style);

        const container = document.createElement('div');
        container.className = 'pcf-toast-container';
        container.id = 'pcf-toast-container';
        document.body.appendChild(container);
    })();

    function showToast({ type = 'success', title = '', message = '', duration = 4500 } = {}) {
        const container = document.getElementById('pcf-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `pcf-toast pcf-toast-${type}`;

        const icon = document.createElement('div');
        icon.className = 'pcf-icon';
        icon.innerHTML = type === 'success' ? '✓' : '!';
        toast.appendChild(icon);

        const body = document.createElement('div');
        body.className = 'pcf-body';
        const t = document.createElement('div');
        t.className = 'pcf-title';
        t.textContent = title || (type === 'success' ? 'Message sent' : 'Something went wrong');
        const m = document.createElement('div');
        m.className = 'pcf-msg';
        m.textContent = message || '';
        body.appendChild(t);
        body.appendChild(m);
        toast.appendChild(body);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'pcf-close';
        closeBtn.setAttribute('aria-label', 'Close notification');
        closeBtn.innerHTML = '✕';
        closeBtn.addEventListener('click', () => {
            removeToast(toast);
        });
        toast.appendChild(closeBtn);

        container.appendChild(toast);

        // auto-dismiss
        const to = setTimeout(() => removeToast(toast), duration);

        function removeToast(node) {
            clearTimeout(to);
            node.classList.add('pcf-toast-fadeout');
            node.addEventListener('animationend', () => node.remove(), { once: true });
        }
    }

    // Utility: toggle modal visibility
    function closeModal() {
        if (overlay) overlay.setAttribute('aria-hidden', 'true');
        if (modal) modal.setAttribute('aria-hidden', 'true');
    }
    
    function openModal() {
        if (overlay) overlay.setAttribute('aria-hidden', 'false');
        if (modal) modal.setAttribute('aria-hidden', 'false');
    }

    // Wire up close/cancel
    if (cancelBtn) cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });
    if (closeBtn) closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });
    if (overlay) overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // gather values
            const name = nameInput?.value?.trim() || '';
            const phone = phoneInput?.value?.trim() || '';
            const email = emailInput?.value?.trim() || '';
            const message = messageInput?.value?.trim() || '';

            // validate backend requirement: either email or phone
            if (!email && !phone) {
                showToast({
                    type: 'error',
                    title: 'Contact info required',
                    message: 'Please provide at least an email address or a phone number.'
                });
                return;
            }

            // disable
            submitBtn.disabled = true;
            const oldText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';

            try {
                const res = await fetch('/api/v1/leads/submitLead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, message }),
                });

                const data = await res.json().catch(() => null);

                if (!res.ok) {
                    const errorMessage = (data && data.message) || `Server responded with ${res.status}`;
                    throw new Error(errorMessage);
                }

                // success UI
                showToast({
                    type: 'success',
                    title: 'Thanks — we received it!',
                    message: 'We\'ll review your message and reply within 1 business day.'
                });

                // clear form
                form.reset();
                // close modal after a short delay so user sees confirmation
                setTimeout(() => closeModal(), 650);

            } catch (err) {
                console.error('Lead submit error:', err);
                showToast({
                    type: 'error',
                    title: 'Submission failed',
                    message: err?.message || 'Unable to submit your message. Please try again later.'
                });
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = oldText;
            }
        });
    }
});