document.querySelector('.logout-btn').addEventListener('click' , async (e)=>{
    e.preventDefault()
    try {
        const response = await fetch('/api/v1/admin/logout' , {
            method:'GET',
            credentials : 'include'
        })
        if(response.ok){
            window.location.href = '/index.html'
        }
    } catch (err) {
        console.log(`failed to log out`)
    }
})

// Mobile sidebar toggle
const mobileToggle = document.querySelector('.mobile-toggle');
if (mobileToggle) {
  mobileToggle.addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('active');
  });
}

// Map sidebar items (by index or by text) to target URLs
const routes = {
  Dashboard: '/admin/index.html',
  Projects: '/admin/projects.html',
  Feedback: '/admin/feedback.html',
  Leads: '/admin/leads.html',
  Users: '/admin/sales-persons.html',
  // all other items go here as default
  default: '/index.html'
};

// Attach click handlers and manage active state
const navItems = document.querySelectorAll('.sidebar .nav-item');
navItems.forEach(item => {
  item.addEventListener('click', function () {
    // active state
    navItems.forEach(i => i.classList.remove('active'));
    this.classList.add('active');

    // determine text label (trim to be safe)
    const labelEl = this.querySelector('.nav-text');
    const label = labelEl ? labelEl.textContent.trim() : '';

    // choose route
    const target = routes[label] || routes.default;

    // navigate
    window.location.href = target;
  });
});

// Card hover effect enhancement
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});
// Switch toggle animation
const switches = document.querySelectorAll('.switch input');
switches.forEach(sw => {
    sw.addEventListener('change', function() {
        if(this.checked) {
            this.parentNode.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.parentNode.style.transform = 'scale(1)';
            }, 300);
        }
    });
});