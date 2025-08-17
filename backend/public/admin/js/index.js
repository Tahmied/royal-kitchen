document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/v1/admin/checkLogin', {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      if (window.location.pathname !== '/login.html') {
        window.location.replace('/login.html');
      }
      return;
    }
  } catch (err) {
    console.error('Auth check failed:', err);
  }
});
