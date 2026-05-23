/**
 * api/api.js
 * All communication with DummyJSON REST API.
 * Demonstrates: fetch(), async/await, Promise, REST API consumption.
 */

const API = (() => {
  const BASE = 'https://dummyjson.com';
  const DEFAULT_LIMIT = 20;

  /**
   * Core fetch wrapper with error handling.
   * @param {string} endpoint
   * @returns {Promise<any>}
   */
  const request = async (endpoint) => {
    const url = `${BASE}${endpoint}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
    return res.json();
  };

  // ---------- Products ----------

  /** Get paginated products */
  const getProducts = (limit = DEFAULT_LIMIT, skip = 0) =>
    request(`/products?limit=${limit}&skip=${skip}&select=id,title,price,thumbnail,category,rating,discountPercentage,brand,stock`);

  /** Get single product by ID (full data) */
  const getProductById = (id) =>
    request(`/products/${id}`);

  /** Get products by category */
  const getProductsByCategory = (category, limit = DEFAULT_LIMIT, skip = 0) =>
    request(`/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`);

  /** Search products by query */
  const searchProducts = (q, limit = DEFAULT_LIMIT) =>
    request(`/products/search?q=${encodeURIComponent(q)}&limit=${limit}`);

  // ---------- Categories ----------

  /** Get all category slugs */
  const getCategories = () =>
    request('/products/categories');

  // ---------- Aggregated helpers ----------

  /**
   * Loads products + categories in parallel.
   * Demonstrates: Promise.all
   */
  const loadInitialData = (limit = DEFAULT_LIMIT) =>
    Promise.all([
      getProducts(limit, 0),
      getCategories(),
    ]);

  /**
   * Get total product count.
   */
  const getTotalCount = async () => {
    const data = await request('/products?limit=1&skip=0&select=id');
    return data.total;
  };

  return {
    getProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
    getCategories,
    loadInitialData,
    getTotalCount,
  };
})();
