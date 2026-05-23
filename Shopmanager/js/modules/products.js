/**
 * modules/products.js
 * Products listing with pagination, sorting, filtering.
 * Demonstrates: async/await, DOM manipulation, events, data validation.
 */

const Products = (() => {
  const LIMIT = 20;
  let _currentPage = 1;
  let _totalProducts = 0;
  let _allLoaded = [];
  let _filtered = [];
  let _viewMode = Storage.get(STORAGE_KEYS.VIEW_MODE) || 'grid';
  let _activeCategory = '';
  let _sortBy = 'default';
  let _searchTerm = '';

  // ---------- Render helpers ----------

  const _skeletons = (n = 8) => {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = Array.from({ length: n }, () => `
      <div class="skeleton">
        <div class="skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>`).join('');
  };

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

  const _renderGrid = (products) => {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (!products.length) {
      grid.innerHTML = `<div class="error-state"><h3>No products found</h3><p>Try a different filter.</p></div>`;
      return;
    }
    grid.innerHTML = products.map(_cardHTML).join('');
    _applyViewMode();
    _attachCardEvents(grid);
  };

  const _attachCardEvents = (container) => {
    container.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const product = _allLoaded.find(p => p.id === id);
        if (!product) return;
        Cart.add(product);
        btn.textContent = '✓ In Cart';
        btn.classList.add('in-cart');
      });
    });

    container.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-cart')) return;
        Modal.open(parseInt(card.dataset.id));
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') Modal.open(parseInt(card.dataset.id));
      });
    });
  };

  // ---------- Sort & filter ----------

  const _applyFiltersAndSort = () => {
    let data = [..._allLoaded];

    // Filter by search term
    if (_searchTerm) {
      const q = _searchTerm.toLowerCase();
      data = data.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (_activeCategory) {
      data = data.filter(p => p.category === _activeCategory);
    }

    // Sort
    switch (_sortBy) {
      case 'price-asc':  data.sort((a, b) => a.price - b.price); break;
      case 'price-desc': data.sort((a, b) => b.price - a.price); break;
      case 'rating':     data.sort((a, b) => (b.rating||0) - (a.rating||0)); break;
      case 'name':       data.sort((a, b) => a.title.localeCompare(b.title)); break;
    }

    _filtered = data;
    _renderGrid(_filtered);
  };

  // ---------- View mode ----------

  const _applyViewMode = () => {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.classList.toggle('list-view', _viewMode === 'list');
  };

  const _toggleView = (mode) => {
    _viewMode = mode;
    Storage.set(STORAGE_KEYS.VIEW_MODE, mode);
    document.getElementById('gridViewBtn')?.classList.toggle('active', mode === 'grid');
    document.getElementById('listViewBtn')?.classList.toggle('active', mode === 'list');
    _applyViewMode();
  };

  // ---------- Pagination ----------

  const _renderPagination = () => {
    const el = document.getElementById('pagination');
    if (!el) return;
    const totalPages = Math.ceil(_totalProducts / LIMIT);
    if (totalPages <= 1) { el.innerHTML = ''; return; }

    let html = `<button class="page-btn" id="pagePrev" ${_currentPage === 1 ? 'disabled' : ''}>← Prev</button>`;

    const range = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= _currentPage - range && i <= _currentPage + range)) {
        html += `<button class="page-btn ${i === _currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      } else if (i === _currentPage - range - 1 || i === _currentPage + range + 1) {
        html += `<span style="color:var(--text3);padding:0 4px">…</span>`;
      }
    }

    html += `<button class="page-btn" id="pageNext" ${_currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;
    el.innerHTML = html;

    el.querySelectorAll('.page-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => loadPage(parseInt(btn.dataset.page)));
    });
    el.querySelector('#pagePrev')?.addEventListener('click', () => loadPage(_currentPage - 1));
    el.querySelector('#pageNext')?.addEventListener('click', () => loadPage(_currentPage + 1));
  };

  // ---------- Data loading ----------

  const loadPage = async (page = 1) => {
    _currentPage = page;
    Storage.session.set(STORAGE_KEYS.CURRENT_PAGE, page);
    _skeletons();

    try {
      const skip = (page - 1) * LIMIT;
      let data;

      if (_activeCategory) {
        data = await API.getProductsByCategory(_activeCategory, LIMIT, skip);
      } else {
        data = await API.getProducts(LIMIT, skip);
      }

      _allLoaded = data.products;
      if (!_activeCategory) _totalProducts = data.total;
      _applyFiltersAndSort();
      _renderPagination();

      // Update hero stat
      const el = document.getElementById('statTotal');
      if (el) el.textContent = _totalProducts;

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      const grid = document.getElementById('productsGrid');
      if (grid) grid.innerHTML = `
        <div class="error-state">
          <h3>Failed to load products</h3>
          <p>${err.message}</p>
        </div>`;
      Toast.show('Could not load products', 'error');
    }
  };

  // ---------- Init ----------

  const init = async () => {
    const savedPage = Storage.session.get(STORAGE_KEYS.CURRENT_PAGE) || 1;
    _currentPage = savedPage;
    _applyViewMode();
    await loadPage(_currentPage);
    _bindToolbarEvents();
  };

  const _bindToolbarEvents = () => {
    // Category filter
    document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
      _activeCategory = e.target.value;
      _currentPage = 1;
      loadPage(1);
    });

    // Sort filter
    document.getElementById('sortFilter')?.addEventListener('change', (e) => {
      _sortBy = e.target.value;
      _applyFiltersAndSort();
    });

    // Live search in toolbar
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');

    const onSearch = Helpers.debounce((val) => {
      _searchTerm = val.trim();
      Storage.session.set(STORAGE_KEYS.LAST_SEARCH, _searchTerm);
      _applyFiltersAndSort();
      searchClear.style.display = val ? 'block' : 'none';
    }, 320);

    searchInput?.addEventListener('input', (e) => onSearch(e.target.value));
    searchClear?.addEventListener('click', () => {
      searchInput.value = '';
      onSearch('');
    });

    // View mode buttons
    document.getElementById('gridViewBtn')?.addEventListener('click', () => _toggleView('grid'));
    document.getElementById('listViewBtn')?.addEventListener('click', () => _toggleView('list'));
  };

  const populateCategoryFilter = (categories) => {
    const sel = document.getElementById('categoryFilter');
    if (!sel) return;
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.slug || cat;
      opt.textContent = (cat.name || cat).replace(/-/g, ' ');
      sel.appendChild(opt);
    });
  };

  return { init, loadPage, populateCategoryFilter };
})();
