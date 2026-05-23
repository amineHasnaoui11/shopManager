/**
 * modules/router.js
 * Simple SPA page router using sessionStorage.
 */

const Router = (() => {
  const pages = ['products', 'categories', 'search'];

  const navigate = (page) => {
    if (!pages.includes(page)) return;
    Storage.session.set('current_page_tab', page);

    // Hide all pages
    pages.forEach(p => {
      document.getElementById(`page${capitalize(p)}`)?.classList.remove('active');
    });

    // Show target
    document.getElementById(`page${capitalize(page)}`)?.classList.add('active');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    // Hide/show toolbar (only for products)
    document.getElementById('toolbar').style.display = page === 'products' ? '' : 'none';
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const init = () => {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => navigate(btn.dataset.page));
    });

    // Restore last tab
    const last = Storage.session.get('current_page_tab') || 'products';
    navigate(last);
  };

  return { init, navigate };
})();
