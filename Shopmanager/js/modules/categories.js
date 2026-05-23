/**
 * modules/categories.js
 * Category grid rendering.
 */

const Categories = (() => {
  let _categories = [];

  const _renderGrid = (cats) => {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;

    if (!cats.length) {
      grid.innerHTML = '<p style="color:var(--text3)">No categories found.</p>';
      return;
    }

    grid.innerHTML = cats.map(cat => {
      const slug = cat.slug || cat;
      const name = (cat.name || cat).replace(/-/g, ' ');
      const emoji = Helpers.categoryEmoji(slug);
      return `
        <div class="category-card" data-slug="${slug}" tabindex="0" role="button">
          <div class="cat-icon">${emoji}</div>
          <div>
            <div class="cat-name">${name}</div>
            <div class="cat-slug">${slug}</div>
          </div>
        </div>`;
    }).join('');

    // Click → switch to products filtered by this category
    grid.querySelectorAll('.category-card').forEach(card => {
      const go = () => {
        const slug = card.dataset.slug;
        // Navigate to products tab, apply filter
        Router.navigate('products');
        const sel = document.getElementById('categoryFilter');
        if (sel) {
          sel.value = slug;
          sel.dispatchEvent(new Event('change'));
        }
      };
      card.addEventListener('click', go);
      card.addEventListener('keydown', e => e.key === 'Enter' && go());
    });
  };

  const init = async () => {
    try {
      _categories = await API.getCategories();
      _renderGrid(_categories);

      // Update hero stat
      const el = document.getElementById('statCats');
      if (el) el.textContent = _categories.length;

      // Pass to products filter
      Products.populateCategoryFilter(_categories);
    } catch (err) {
      console.error('[Categories.init]', err);
      Toast.show('Could not load categories', 'error');
    }
  };

  return { init };
})();
