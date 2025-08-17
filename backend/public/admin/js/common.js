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
document.querySelector('.mobile-toggle').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('active');
});
// Nav item active state
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', function() {
        navItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
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