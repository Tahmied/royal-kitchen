// Default language (change this to 'pl' for Polish default)
const DEFAULT_LANGUAGE = 'en';

// Wait for translations to be loaded
function waitForTranslations(callback) {
  if (typeof translations !== 'undefined') {
    callback();
  } else {
    setTimeout(() => waitForTranslations(callback), 100);
  }
}

// Initialize language system
function initLanguage() {
  // Check if translations is loaded
  if (typeof translations === 'undefined') {
    console.error('Translations not loaded! Make sure translation.js is loaded before language-switch.js');
    return;
  }

  const langSelect = document.getElementById('lang-select');
  
  if (!langSelect) {
    console.error('Language selector not found!');
    return;
  }

  const savedLang = localStorage.getItem('preferredLanguage') || DEFAULT_LANGUAGE;
  
  // Set the dropdown to saved language
  langSelect.value = savedLang;
  
  // Apply the language
  setLanguage(savedLang);
  
  // Listen for language changes
  langSelect.addEventListener('change', (e) => {
    setLanguage(e.target.value);
  });
  
  // Watch for dynamically added content
  observeDynamicContent();
}

// Set language and update all text
function setLanguage(lang) {
  // Check if translations exists
  if (typeof translations === 'undefined') {
    console.error('Translations object not found!');
    return;
  }

  // Check if the selected language exists
  if (!translations[lang]) {
    console.error(`Language '${lang}' not found in translations!`);
    return;
  }

  // Save preference
  localStorage.setItem('preferredLanguage', lang);
  
  const texts = translations[lang];
  
  // Update all elements with data-translate attribute
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    if (texts[key]) {
      element.innerHTML = texts[key];
    } else {
      console.warn(`Translation key '${key}' not found for language '${lang}'`);
    }
  });
  
  // Update placeholders for form inputs
  document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
    const key = element.getAttribute('data-translate-placeholder');
    if (texts[key]) {
      const label = element.nextElementSibling;
      if (label && label.classList.contains('pcf-floating')) {
        label.textContent = texts[key];
      }
    }
  });
}

// Observe for dynamically added content
function observeDynamicContent() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the node itself or its children have data-translate attributes
          const elementsToTranslate = node.querySelectorAll ? 
            node.querySelectorAll('[data-translate]') : [];
          
          // Also check if the node itself has data-translate
          if (node.hasAttribute && node.hasAttribute('data-translate')) {
            translateElement(node);
          }
          
          // Translate all child elements
          elementsToTranslate.forEach(element => {
            translateElement(element);
          });
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Helper function to translate a single element
function translateElement(element) {
  if (typeof translations === 'undefined') {
    return;
  }

  const savedLang = localStorage.getItem('preferredLanguage') || DEFAULT_LANGUAGE;
  
  if (!translations[savedLang]) {
    return;
  }

  const texts = translations[savedLang];
  const key = element.getAttribute('data-translate');
  
  if (texts[key]) {
    element.innerHTML = texts[key];
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    waitForTranslations(initLanguage);
  });
} else {
  waitForTranslations(initLanguage);
}