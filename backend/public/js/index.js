
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


document.addEventListener('DOMContentLoaded', () => {
  // Elements
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
// Video modal functionality for project sections
// Video modal functionality for project sections
const videoModal = document.getElementById('video-modal');
const videoOverlay = document.getElementById('video-modal-overlay');
const videoCloseBtn = document.getElementById('video-modal-close');
const videoElement = document.getElementById('local-video');
const videoSource = document.getElementById('local-video-source');
const videoContainers = document.querySelectorAll('.fourth-video-container, .fourth-video-overlay');

// Video paths for each project section 
const videoPaths = [
  './uploads/projects/WhatsApp Video 2025-08-02 at 20.35.42.mp4',
  '/uploads/projects/project2-video.mp4',
  '/uploads/projects/project3-video.mp4'
];

// Function to open video modal with the correct video
function openVideoModal(event) {
  // Find the closest project section
  const projectSection = event.currentTarget.closest('.fourth-section');
  
  // Find the index of this section among all fourth-section elements
  const allSections = document.querySelectorAll('.fourth-section');
  const sectionIndex = Array.from(allSections).indexOf(projectSection);
  
  // Use the section index to get the correct video path
  const videoPath = videoPaths[sectionIndex] || videoPaths[0];
  
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
    // Remove the event listener after it's used
    videoElement.removeEventListener('canplay', playVideo);
  };
  
  videoElement.addEventListener('canplay', playVideo);
}

// Function to close video modal
function closeVideoModal() {
  videoModal.setAttribute('aria-hidden', 'true');
  videoElement.pause();
  videoElement.currentTime = 0;
  document.body.style.overflow = '';
}

// Add event listeners to all video containers
videoContainers.forEach(container => {
  container.addEventListener('click', openVideoModal);
  container.style.cursor = 'pointer';
});

// Close modal events
videoCloseBtn.addEventListener('click', closeVideoModal);
videoOverlay.addEventListener('click', function(e) {
  if (e.target === videoOverlay) {
    closeVideoModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && videoModal.getAttribute('aria-hidden') === 'false') {
    closeVideoModal();
  }
});

// Reset video when modal is closed
videoModal.addEventListener('transitionend', function(e) {
  if (e.propertyName === 'opacity' && videoModal.getAttribute('aria-hidden') === 'true') {
    videoElement.pause();
    videoElement.currentTime = 0;
  }
});

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
          message: 'We’ll review your message and reply within 1 business day.'
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

  
  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && videoModal.getAttribute('aria-hidden') === 'false') {
      closeVideoModal();
    }
  });
});

(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    REMOVE_DELAYS: {
      second: 120,
      third: 90,
      fourth: 100,
      fifth: 110,
      sixth: 100,
      footer: 110
    },
    INTERSECTION_OPTIONS: {
      root: null,
      rootMargin: '0px 0px -12% 0px',
      threshold: [0, 0.12, 0.25, 0.5]
    },
    PCF_TRIGGER_CLASS: 'pcf-open'
  };

  // Utility functions
  const utils = {
    // Check if user prefers reduced motion
    prefersReducedMotion: () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    
    // Debounced class toggle with cleanup
    createToggler: (element, delay) => {
      let timer = null;
      return {
        add: () => {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          element.classList.add('in-view');
        },
        remove: () => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            element.classList.remove('in-view');
            timer = null;
          }, delay);
        }
      };
    },

    // Create intersection observer with common logic
    createObserver: (callback, options = CONFIG.INTERSECTION_OPTIONS) => {
      return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const isVisible = entry.intersectionRatio >= 0.12;
          callback(entry.target, isVisible);
        });
      }, options);
    }
  };

  // Section Animation Manager
  const sectionAnimations = {
    observers: new Map(),
    togglers: new Map(),

    init() {
      if (utils.prefersReducedMotion()) {
        this.handleReducedMotion();
        return;
      }
      this.setupObservers();
    },

    handleReducedMotion() {
      const selectors = ['.second-section', '.third-section', '.fourth-section', '.fifth-section', '.sixth-section', 'footer'];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.classList.add('in-view'));
      });
    },

    setupObservers() {
      // Individual sections with specific configs
      this.setupSingleSection('.second-section', CONFIG.REMOVE_DELAYS.second);
      this.setupSingleSection('.third-section', CONFIG.REMOVE_DELAYS.third, {
        ...CONFIG.INTERSECTION_OPTIONS,
        rootMargin: '0px 0px -10% 0px',
        threshold: [0, 0.12, 0.25]
      });
      this.setupSingleSection('.fifth-section', CONFIG.REMOVE_DELAYS.fifth);
      this.setupSingleSection('.sixth-section', CONFIG.REMOVE_DELAYS.sixth);
      this.setupSingleSection('footer', CONFIG.REMOVE_DELAYS.footer);
      
      // Special handling for multiple .fourth-section elements
      this.setupFourthSections();
    },

    setupSingleSection(selector, delay, options) {
      const element = document.querySelector(selector);
      if (!element) return;

      const toggler = utils.createToggler(element, delay);
      this.togglers.set(selector, toggler);

      const observer = utils.createObserver((target, isVisible) => {
        if (isVisible) toggler.add();
        else toggler.remove();
      }, options);

      observer.observe(element);
      this.observers.set(selector, observer);
    },

    setupFourthSections() {
      const observedElements = new WeakSet();
      
      const observer = utils.createObserver((target, isVisible) => {
        if (!target.__removeTimer) target.__removeTimer = null;
        
        if (isVisible) {
          if (target.__removeTimer) {
            clearTimeout(target.__removeTimer);
            target.__removeTimer = null;
          }
          target.classList.add('in-view');
        } else {
          if (target.__removeTimer) clearTimeout(target.__removeTimer);
          target.__removeTimer = setTimeout(() => {
            target.classList.remove('in-view');
            target.__removeTimer = null;
          }, CONFIG.REMOVE_DELAYS.fourth);
        }
      });

      const observeElements = () => {
        document.querySelectorAll('.fourth-section').forEach(section => {
          if (!observedElements.has(section)) {
            observer.observe(section);
            observedElements.add(section);
          }
        });
      };

      // Observe existing elements
      observeElements();

      // Watch for dynamically added elements
      const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) {
                if (node.classList?.contains('fourth-section')) {
                  if (!observedElements.has(node)) {
                    observer.observe(node);
                    observedElements.add(node);
                  }
                }
                node.querySelectorAll?.('.fourth-section').forEach(section => {
                  if (!observedElements.has(section)) {
                    observer.observe(section);
                    observedElements.add(section);
                  }
                });
              }
            });
          }
        });
      });

      mutationObserver.observe(document.body, { childList: true, subtree: true });
      this.observers.set('fourth-sections', { observer, mutationObserver });
    }
  };

  // Contact Form Manager
  const contactForm = {
    elements: {},
    lastFocusedElement: null,
    focusTrapHandler: null,

    init() {
      this.cacheElements();
      if (!this.elements.root) {
        console.warn('PCF: .pcf-root not found - contact form not initialized.');
        return;
      }
      this.bindEvents();
      this.initializeForm();
    },

    cacheElements() {
      this.elements = {
        root: document.querySelector('.pcf-root'),
        overlay: document.getElementById('pcf-overlay'),
        modal: document.getElementById('pcf-modal'),
        closeBtn: document.getElementById('pcf-closeBtn'),
        cancelBtn: document.getElementById('pcf-cancelBtn'),
        form: document.getElementById('pcf-contactForm'),
        submitBtn: document.getElementById('pcf-submitBtn')
      };
    },

    bindEvents() {
      // Delegated event for form triggers
      document.addEventListener('click', this.handleTriggerClick.bind(this));
      
      // Form events
      document.addEventListener('input', this.refreshFloatingLabels.bind(this));
      document.addEventListener('change', this.refreshFloatingLabels.bind(this));
      
      // Close events
      this.elements.closeBtn?.addEventListener('click', this.closeModal.bind(this));
      this.elements.cancelBtn?.addEventListener('click', this.closeModal.bind(this));
      this.elements.overlay?.addEventListener('click', this.handleOverlayClick.bind(this));
      
      // Form submission
      this.elements.form?.addEventListener('submit', this.handleSubmit.bind(this));
    },

    initializeForm() {
      this.elements.overlay?.setAttribute('aria-hidden', 'true');
      this.elements.root?.setAttribute('aria-hidden', 'true');
      this.refreshFloatingLabels();
    },

    refreshFloatingLabels() {
      this.elements.root?.querySelectorAll('.pcf-field').forEach(field => {
        const input = field.querySelector('input, textarea, select');
        if (!input) return;
        
        const hasValue = input.value && input.value.trim() !== '';
        field.classList.toggle('pcf-has-value', hasValue);
      });
    },

    handleTriggerClick(e) {
      const trigger = e.target.closest?.(`.${CONFIG.PCF_TRIGGER_CLASS}`);
      if (!trigger) return;
      
      e.preventDefault();
      const prefill = {
        name: trigger.getAttribute('data-pcf-prefill-name') || '',
        email: trigger.getAttribute('data-pcf-prefill-email') || '',
        message: trigger.getAttribute('data-pcf-prefill-message') || ''
      };
      this.openModal(prefill);
    },

    handleOverlayClick(e) {
      if (e.target === this.elements.overlay) {
        this.closeModal();
      }
    },

    openModal(prefill = {}) {
      this.elements.overlay?.setAttribute('aria-hidden', 'false');
      this.elements.root?.setAttribute('aria-hidden', 'false');
      
      // Prefill form
      if (this.elements.form) {
        if (prefill.name && this.elements.form.name) this.elements.form.name.value = prefill.name;
        if (prefill.email && this.elements.form.email) this.elements.form.email.value = prefill.email;
        if (prefill.message && this.elements.form.message) this.elements.form.message.value = prefill.message;
      }
      
      this.refreshFloatingLabels();
      this.setupFocusTrap();
      
      // Focus first input after animation
      setTimeout(() => {
        const nameInput = document.getElementById('pcf-name');
        nameInput?.focus();
      }, 140);
    },

    closeModal() {
      this.elements.overlay?.setAttribute('aria-hidden', 'true');
      this.elements.root?.setAttribute('aria-hidden', 'true');
      
      this.removeFocusTrap();
      this.resetForm();
      
      if (this.lastFocusedElement?.focus) {
        this.lastFocusedElement.focus();
      }
    },

    setupFocusTrap() {
      this.lastFocusedElement = document.activeElement;
      
      if (!this.elements.modal) return;
      
      const focusableElements = Array.from(
        this.elements.modal.querySelectorAll(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(Boolean);
      
      if (!focusableElements.length) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      this.focusTrapHandler = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
        if (e.key === 'Escape') {
          this.closeModal();
        }
      };
      
      document.addEventListener('keydown', this.focusTrapHandler);
    },

    removeFocusTrap() {
      if (this.focusTrapHandler) {
        document.removeEventListener('keydown', this.focusTrapHandler);
        this.focusTrapHandler = null;
      }
    },

    resetForm() {
      // Remove success card if present
      const successCard = this.elements.modal?.querySelector('.pcf-success');
      successCard?.remove();
      
      // Reset form state
      if (this.elements.form) {
        this.elements.form.style.display = '';
        this.elements.form.reset();
      }
      
      if (this.elements.submitBtn) {
        this.elements.submitBtn.disabled = false;
        this.elements.submitBtn.textContent = 'Send message';
      }
      
      this.refreshFloatingLabels();
    },

    async handleSubmit(e) {
      e.preventDefault();
      
      const formData = new FormData(this.elements.form);
      const name = formData.get('name')?.toString().trim();
      const email = formData.get('email')?.toString().trim();
      const message = formData.get('message')?.toString().trim();
      
      if (!name || !email || !message) {
        this.shakeModal();
        return;
      }
      
      await this.submitForm();
    },

    shakeModal() {
      this.elements.modal?.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(0)' }
      ], { duration: 360 });
    },

    async submitForm() {
      // Show loading state
      if (this.elements.submitBtn) {
        this.elements.submitBtn.disabled = true;
        this.elements.submitBtn.innerHTML = '<span class="pcf-spinner"></span>';
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 900 + Math.random() * 900));
      
      this.showSuccessMessage();
    },

    showSuccessMessage() {
      if (!this.elements.form || !this.elements.modal) return;
      
      this.elements.form.style.display = 'none';
      
      const successCard = document.createElement('div');
      successCard.className = 'pcf-success pcf-full';
      successCard.innerHTML = `
        <div class="pcf-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="${getComputedStyle(document.documentElement).getPropertyValue('--pcf-success') || '#22c55e'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </div>
        <h3 style="margin:0;">Message sent</h3>
        <p style="margin:0;color:var(--pcf-muted);text-align:center;max-width:420px">
          Thanks! We received your message and will reply within 1 business day. If your request is urgent, please include a phone number.
        </p>
      `;
      
      this.elements.form.insertAdjacentElement('afterend', successCard);
      this.elements.closeBtn?.focus();
      
      // Auto-close after delay
      setTimeout(() => {
        const fadeOut = successCard.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 600,
          fill: 'forwards'
        });
        fadeOut.onfinish = () => this.closeModal();
      }, 1400);
    }
  };

  // Initialize animations and contact form when DOM is ready
  function initialize() {
    sectionAnimations.init();
    contactForm.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Expose utilities for debugging (optional - remove in production)
  if (typeof window !== 'undefined' && window.console) {
    window.__pageAnimations = { sectionAnimations, contactForm };
  }

})();
