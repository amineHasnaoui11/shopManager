/**
 * modules/modal.js
 * Product detail modal with full API data + image gallery.
 * Demonstrates: async/await, DOM manipulation, event handling.
 */

const Modal = (() => {
  const $overlay = () => document.getElementById('modalOverlay');
  const $modal   = () => document.getElementById('productModal');
  const $body    = () => document.getElementById('modalBody');
  const $close   = () => document.getElementById('modalClose');

  let _currentProduct = null;

  // ---------- Open / Close ----------

  const open = async (id) => {
    const overlay = $overlay();
    const modal   = $modal();
    const body    = $body();
    if (!overlay || !modal || !body) return;

    overlay.classList.add('active');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Show loading state
    body.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px 20px;">
        <div style="font-size:32px;margin-bottom:16px;animation:spin 1s linear infinite;display:inline-block">◈</div>
        <p style="color:var(--text3)">Loading product…</p>
      </div>`;

    try {
      const product = await API.getProductById(id);
      _currentProduct = product;
      _render(product);
    } catch (err) {
      body.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px">
          <h3 style="color:var(--text2)">Failed to load product</h3>
          <p style="color:var(--text3)">${err.message}</p>
        </div>`;
    }
  };

  const close = () => {
    $overlay()?.classList.remove('active');
    $modal()?.classList.remove('open');
    document.body.style.overflow = '';
    _currentProduct = null;
  };

  // ---------- Render ----------

  const _render = (p) => {
    const body = $body();
    if (!body) return;

    const images   = p.images?.length ? p.images : [p.thumbnail];
    const price    = Helpers.discountedPrice(p.price, p.discountPercentage || 0);
    const inCart   = Cart.has(p.id);
    const stars    = Helpers.renderStars(p.rating || 0);
    const stockCls = p.stock > 20 ? '' : p.stock > 0 ? 'low' : 'out';
    const stockTxt = p.stock > 20 ? 'In Stock' : p.stock > 0 ? `Only ${p.stock} left` : 'Out of Stock';

    body.innerHTML = `
      <div class="modal-img-section">
        <img class="modal-main-img" id="modalMainImg" src="${images[0]}" alt="${p.title}"
             onerror="this.src='https://dummyjson.com/image/400x400'" />
        <div class="modal-thumbs" id="modalThumbs">
          ${images.map((src, i) => `
            <img class="modal-thumb ${i === 0 ? 'active' : ''}" data-src="${src}" src="${src}"
                 alt="thumb ${i+1}" onerror="this.style.display='none'" />`).join('')}
        </div>
      </div>

      <div class="modal-info">
        <div class="modal-category">${p.category || ''}</div>
        <h2 class="modal-title">${p.title}</h2>
        ${p.brand ? `<div class="modal-brand">by <strong>${p.brand}</strong></div>` : ''}

        <div class="modal-rating">
          <span class="star" style="font-size:16px">${stars}</span>
          <span style="color:var(--text2)">${(p.rating||0).toFixed(1)} rating</span>
          <span style="color:var(--text3)">·</span>
          <span style="color:var(--text3)">${p.reviews?.length || 0} review${(p.reviews?.length||0) !== 1 ? 's' : ''}</span>
        </div>

        <div class="modal-price-row">
          <span class="modal-price">${Helpers.formatPrice(price)}</span>
          ${p.discountPercentage > 0 ? `
            <span class="modal-discount">−${Math.round(p.discountPercentage)}%</span>
            <span style="color:var(--text3);text-decoration:line-through;font-size:14px">$${p.price}</span>` : ''}
        </div>

        ${p.description ? `<p class="modal-description">${p.description}</p>` : ''}

        ${p.tags?.length ? `
          <div class="modal-tags">
            ${p.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
          </div>` : ''}

        <div class="modal-stock">
          <span class="stock-dot ${stockCls}"></span>
          <span>${stockTxt}</span>
          ${p.warrantyInformation ? `<span style="color:var(--text3)">·</span><span style="color:var(--text3)">${p.warrantyInformation}</span>` : ''}
        </div>

        ${p.shippingInformation ? `
          <div style="font-size:12px;color:var(--text3)">📦 ${p.shippingInformation}</div>` : ''}

        <button class="modal-add-btn ${inCart ? 'in-cart' : ''}" id="modalAddBtn">
          ${inCart ? '✓ Already in Cart' : '⊕ Add to Cart'}
        </button>
      </div>`;

    // Thumbnail click
    body.querySelectorAll('.modal-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        document.getElementById('modalMainImg').src = thumb.dataset.src;
        body.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    // Add to cart
    const addBtn = document.getElementById('modalAddBtn');
    addBtn?.addEventListener('click', () => {
      Cart.add(p);
      addBtn.textContent = '✓ Already in Cart';
      addBtn.classList.add('in-cart');
    });
  };

  // ---------- Init ----------

  const init = () => {
    $close()?.addEventListener('click', close);
    $overlay()?.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  };

  // add spin animation inline
  const style = document.createElement('style');
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);

  return { init, open, close };
})();
