/**
 * utils/helpers.js
 * Pure utility functions — no DOM, no state
 */

const Helpers = (() => {

  /** Format price to USD string */
  const formatPrice = (num) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

  /** Truncate text to maxLen chars */
  const truncate = (str, maxLen = 80) =>
    str.length > maxLen ? str.slice(0, maxLen).trimEnd() + '…' : str;

  /** Generate star HTML from rating */
  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      '★'.repeat(full) +
      (half ? '½' : '') +
      '☆'.repeat(empty)
    );
  };

  /** Debounce function */
  const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  /** Category → emoji map */
  const categoryEmoji = (slug) => {
    const map = {
      smartphones: '📱', laptops: '💻', tablets: '📟',
      'mobile-accessories': '🔌', 'laptops-accessories': '🖥️',
      fragrances: '🌸', skincare: '🧴', 'hair-care': '💆',
      beauty: '💄',
      shirts: '👕', tops: '👚', 'womens-tops': '👚', 'womens-dresses': '👗',
      'womens-shoes': '👠', 'mens-shoes': '👟', 'mens-watches': '⌚',
      'womens-watches': '⌚', 'womens-bags': '👜', 'womens-jewellery': '💍',
      sunglasses: '🕶️',
      furniture: '🛋️', 'home-decoration': '🏠', 'kitchen-accessories': '🍳',
      groceries: '🛒',
      'sports-accessories': '⚽', motorcycle: '🏍️', vehicle: '🚗',
    };
    return map[slug] || '📦';
  };

  /** Compute discounted price */
  const discountedPrice = (price, pct) =>
    (price * (1 - pct / 100)).toFixed(2);

  /** Generate badge label from discount */
  const badgeLabel = (pct) => {
    if (!pct) return null;
    if (pct >= 20) return { text: `−${Math.round(pct)}%`, cls: 'sale' };
    return { text: `−${Math.round(pct)}%`, cls: 'hot' };
  };

  return { formatPrice, truncate, renderStars, debounce, categoryEmoji, discountedPrice, badgeLabel };
})();
