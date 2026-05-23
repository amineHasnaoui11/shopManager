/**
 * app.js
 * Application entry point.
 * Bootstraps all modules in dependency order.
 * Demonstrates: async/await, Promise.all, DOMContentLoaded.
 */

(async () => {
  // Wait for DOM
  await new Promise(resolve => {
    if (document.readyState !== 'loading') resolve();
    else document.addEventListener('DOMContentLoaded', resolve);
  });

  // Inline Toast (must be first since other modules use it)
  // Toast is already loaded via helpers, no extra step needed.

  // 1. Init router (sets up page switching)
  Router.init();

  // 2. Init cart (loads from localStorage)
  Cart.init();

  // 3. Init modal (attaches close handlers)
  Modal.init();

  // 4. Init search page
  Search.init();

  // 5. Load categories + first page of products in parallel (Promise.all)
  try {
    await Promise.all([
      Categories.init(),   // fetches categories from API
      Products.init(),     // fetches first page of products
    ]);
  } catch (err) {
    console.error('[App] Init failed:', err);
    Toast.show('Failed to initialize. Check your connection.', 'error', 6000);
  }
})();
