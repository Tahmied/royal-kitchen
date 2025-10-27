(function () {
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
      rootMargin: '0px 0px -15% 0px',
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
      const selectors = ['.second-section', '.third-section', '.fourth-section-container', '.fifth-section', '.sixth-section', 'footer'];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.classList.add('in-view'));
      });
    },

    setupObservers() {
      this.setupSingleSection('.second-section', CONFIG.REMOVE_DELAYS.second); 
      this.setupSingleSection('.third-section', CONFIG.REMOVE_DELAYS.third, {
        ...CONFIG.INTERSECTION_OPTIONS,
        rootMargin: '0px 0px -10% 0px',
        threshold: [0, 0.12, 0.25]
      });
      this.setupSingleSection('.sixth-section', CONFIG.REMOVE_DELAYS.sixth);
      this.setupSingleSection('footer', CONFIG.REMOVE_DELAYS.footer);

      this.setupFourthSections();
      this.setupFifthSections(); // Add observer for multiple fifth sections
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
        document.querySelectorAll('.fourth-section-container').forEach(section => {
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
                node.querySelectorAll?.('.fourth-section-container').forEach(section => {
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
    },

    setupFifthSections() {
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
          }, CONFIG.REMOVE_DELAYS.fifth);
        }
      });

      const observeElements = () => {
        document.querySelectorAll('.fifth-section').forEach(section => {
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
                if (node.classList?.contains('fifth-section')) {
                  if (!observedElements.has(node)) {
                    observer.observe(node);
                    observedElements.add(node);
                  }
                }
                node.querySelectorAll?.('.fifth-section').forEach(section => {
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
      this.observers.set('fifth-sections', { observer, mutationObserver });
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