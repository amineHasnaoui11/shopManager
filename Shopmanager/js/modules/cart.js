/**
 * modules/cart.js
 * Cart state management with localStorage persistence.
 * Demonstrates: localStorage, DOM manipulation, event handling, data structures.
 */

const Cart = (() => {
  // Internal cart state: Map<id, {product, qty}>
  let _items = new Map();

  // DOM refs
  const $sidebar = () => document.getElementById('cartSidebar');
  const $overlay = () => document.getElementById('cartOverlay');
  const $count   = () => document.getElementById('cartCount');
  const $items   = () => document.getElementById('cartItems');
  const $footer  = () => document.getElementById('cartFooter');
  const $total   = () => document.getElementById('cartTotal');
  const $subtotal= () => document.getElementById('cartSubtotal');
  const $statCart= () => document.getElementById('statCart');

  // ---------- Persistence ----------

  const _save = () => {
    const plain = [];
    _items.forEach((val) => plain.push(val));
    Storage.set(STORAGE_KEYS.CART, plain);
  };

  const _load = () => {
    const saved = Storage.get(STORAGE_KEYS.CART);
    if (Array.isArray(saved)) {
      saved.forEach(({ product, qty }) => {
        if (product && qty) _items.set(product.id, { product, qty });
      });
    }
  };

  // ---------- Actions ----------

  const add = (product) => {
    if (_items.has(product.id)) {
      _items.get(product.id).qty++;
    } else {
      _items.set(product.id, { product, qty: 1 });
    }
    _save();
    _render();
    _updateCount();
    Toast.show(`"${Helpers.truncate(product.title, 30)}" added to cart`, 'success');
  };

  const remove = (id) => {
    _items.delete(id);
    _save();
    _render();
    _updateCount();
  };

  const setQty = (id, qty) => {
    if (!_items.has(id)) return;
    if (qty <= 0) { remove(id); return; }
    _items.get(id).qty = qty;
    _save();
    _render();
    _updateCount();
  };

  const clearAll = () => {
    _items.clear();
    _save();
    _render();
    _updateCount();
    Toast.show('Cart cleared', 'error');
  };

  const has = (id) => _items.has(id);

  const count = () => {
    let n = 0;
    _items.forEach(({ qty }) => n += qty);
    return n;
  };

  const getTotal = () => {
    let total = 0;
    _items.forEach(({ product, qty }) => {
      const price = parseFloat(
        Helpers.discountedPrice(product.price, product.discountPercentage || 0)
      );
      total += price * qty;
    });
    return total;
  };

  // ---------- Render ----------

  const _updateCount = () => {
    const n = count();
    const el = $count();
    if (el) {
      el.textContent = n;
      el.classList.remove('bump');
      void el.offsetWidth; // force reflow
      el.classList.add('bump');
    }
    const sc = $statCart();
    if (sc) sc.textContent = n;
  };

  const _render = () => {
    const container = $items();
    const footer    = $footer();
    if (!container) return;

    if (_items.size === 0) {
      container.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = 'block';

    let html = '';
    _items.forEach(({ product, qty }) => {
      const price = parseFloat(
        Helpers.discountedPrice(product.price, product.discountPercentage || 0)
      );
      html += `
        <div class="cart-item" data-id="${product.id}">
          <img class="ci-img" src="${product.thumbnail}" alt="${product.title}" loading="lazy"
               onerror="this.src='https://dummyjson.com/image/64x64'" />
          <div class="ci-info">
            <div class="ci-title">${Helpers.truncate(product.title, 36)}</div>
            <div class="ci-price">${Helpers.formatPrice(price)}</div>
            <div class="ci-controls">
              <button class="qty-btn" data-action="dec" data-id="${product.id}">−</button>
              <span class="qty-num">${qty}</span>
              <button class="qty-btn" data-action="inc" data-id="${product.id}">+</button>
            </div>
          </div>
          <button class="ci-remove" data-id="${product.id}" title="Remove">✕</button>
        </div>`;
    });

    container.innerHTML = html;

    // Totals
    const total = getTotal();
    if ($subtotal()) $subtotal().textContent = Helpers.formatPrice(total);
    if ($total())    $total().textContent    = Helpers.formatPrice(total);

    // Attach events
    container.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id  = parseInt(e.currentTarget.dataset.id);
        const act = e.currentTarget.dataset.action;
        const cur = _items.get(id)?.qty || 0;
        setQty(id, act === 'inc' ? cur + 1 : cur - 1);
      });
    });
    container.querySelectorAll('.ci-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        remove(parseInt(e.currentTarget.dataset.id));
      });
    });
  };

  // ---------- Sidebar Toggle ----------

  const open  = () => { $sidebar()?.classList.add('open'); $overlay()?.classList.add('active'); };
  const close = () => { $sidebar()?.classList.remove('open'); $overlay()?.classList.remove('active'); };

  // ---------- Init ----------

  const init = () => {
    _load();
    _render();
    _updateCount();

    document.getElementById('cartBtn')?.addEventListener('click', open);
    document.getElementById('cartClose')?.addEventListener('click', close);
    document.getElementById('cartOverlay')?.addEventListener('click', close);
    document.getElementById('clearCartBtn')?.addEventListener('click', clearAll);

    document.getElementById('checkoutBtn')?.addEventListener('click', () => {
      if (_items.size === 0) { Toast.show('Your cart is empty!', 'error'); return; }
      Toast.show(`✓ Order placed! Total: ${Helpers.formatPrice(getTotal())}`, 'success');
      clearAll();
      close();
    });
  };

  return { init, add, remove, setQty, clearAll, has, count, open, close };
})();
