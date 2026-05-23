/**
 * modules/search.js
 * Dedicated search page with API-backed search.
 * Demonstrates: fetch, async/await, DOM events, data validation.
 */

const Search = (() => {
  const _cardHTML = (p) => {
    const price  = Helpers.discountedPrice(p.price, p.discountPercentage || 0);
    const badge  = Helpers.badgeLabel(p.discountPercentage);
    const inCart = Cart.has(p.id);
    const stars  = Helpers.renderStars(p.rating || 0);
    return `
      <div class="product-card" data-id="${p.id}" tabindex="0" role="button" aria-label="${p.title}">
        <div class="card-img-wrap">
          <img class="card-img" src="${p.thumbnail}" alt="${p.title}" loading="lazy"
               onerror="this.src='https://dummyjson.com/image/200x200'" />
          ${badge ? `<span class="card-badge ${badge.cls}">${badge.text}</span>` : ''}
        </div>
        <div class="card-body">
          <span class="card-category">${p.category || ''}</span>
          <h3 class="card-title">${p.title}</h3>
          <div class="card-meta">
            <div>
              <span class="card-price">${Helpers.formatPrice(price)}</span>
              ${p.discountPercentage ? `<span class="card-price-orig">$${p.price}</span>` : ''}
            </div>
            <span class="card-rating">
              <span class="star">${stars.slice(0,1)}</span>${(p.rating||0).toFixed(1)}
            </span>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-add-cart ${inCart ? 'in-cart' : ''}" data-id="${p.id}">
            ${inCart ? '✓ In Cart' : '+ Add to Cart'}
          </button>
        </div>
      </div>`;
  };

  const _validate = (q) => {
    if (!q || typeof q !== 'string') return 'Please enter a search term.';
    if (q.trim().length < 2)         return 'Search query must be at least 2 characters.';
    if (q.trim().length > 100)       return 'Search query is too long.';
    return null;
  };

  const doSearch = async (query) => {
    const err = _validate(query);
    if (err) { Toast.show(err, 'error'); return; }

    const grid = document.getElementById('searchResultsGrid');
    const info = document.getElementById('searchInfo');
    if (!grid) return;

    // Save last search to sessionStorage
    Storage.session.set(STORAGE_KEYS.LAST_SEARCH, query.trim());

    // Show loading skeleton
    grid.innerHTML = Array.from({ length: 4 }, () => `
      <div class="skeleton">
        <div class="skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line medium"></div>
        </div>
      </div>`).join('');
    if (info) info.textContent = 'Searching…';

    try {
      const data = await API.searchProducts(query.trim(), 30);
      const products = data.products || [];

      if (!products.length) {
        grid.innerHTML = `<div class="error-state"><h3>No results for "${query}"</h3><p>Try a different keyword.</p></div>`;
        if (info) info.textContent = '';
        return;
      }

      grid.innerHTML = products.map(_cardHTML).join('');
      if (info) info.textContent = `${products.length} result${products.length !== 1 ? 's' : ''} for "${query}"`;

      // Cart buttons
      grid.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.dataset.id);
          const product = products.find(p => p.id === id);
          if (!product) return;
          Cart.add(product);
          btn.textContent = '✓ In Cart';
          btn.classList.add('in-cart');
        });
      });

      // Open modal on card click
      grid.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.classList.contains('btn-add-cart')) return;
          Modal.open(parseInt(card.dataset.id));
        });
      });

    } catch (err2) {
      console.error(err2);
      grid.innerHTML = `<div class="error-state"><h3>Search failed</h3><p>${err2.message}</p></div>`;
      if (info) info.textContent = '';
      Toast.show('Search request failed', 'error');
    }
  };

  const init = () => {
    const input = document.getElementById('searchPageInput');
    const btn   = document.getElementById('searchPageBtn');

    // Restore last search
    const last = Storage.session.get(STORAGE_KEYS.LAST_SEARCH);
    if (last && input) input.value = last;

    btn?.addEventListener('click', () => {
      doSearch(input?.value || '');
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch(input.value);
    });
  };

  return { init, doSearch };
})();
