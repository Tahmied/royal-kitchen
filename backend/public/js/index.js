
    function updateHeroImage() {
        const img = document.querySelector('.hero-image');
        if (!img) return;
        if (window.innerWidth <= 600) {
            img.src = 'images/hero/hero-ain-image-mobile.png';
        } else {
            img.src = 'images/hero/hero image.png';
        }
    }

    window.addEventListener('load', updateHeroImage);
    window.addEventListener('resize', updateHeroImage);
    

    const slider = document.querySelector('.slider');
    const container = document.querySelector('.sixth-left-container');

    slider.addEventListener('input', (e) => {
      const position = `${e.target.value}%`;
      container.style.setProperty('--position', position);
    });

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
                            // Check for sections within the added node
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ProjectImageSwitcher();
    });
} else {
    new ProjectImageSwitcher();
}

window.ProjectImageSwitcher = ProjectImageSwitcher;