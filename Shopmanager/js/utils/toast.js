/**
 * Toast - simple notification system
 * Placed here as it's shared by all modules.
 * @type {{show: function(msg: string, type?: string, duration?: number): void}}
 */
const Toast = (() => {
  const show = (msg, type = 'info', duration = 3000) => {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('out');
      setTimeout(() => toast.remove(), 350);
    }, duration);
  };

  return { show };
})();
