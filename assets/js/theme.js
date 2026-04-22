(function () {
  const KEY = 'urbeia-theme';

  function updateBtn(theme) {
    const btn = document.getElementById('btn-theme');
    if (!btn) return;
    btn.setAttribute('aria-label', theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro');
    btn.setAttribute('data-current', theme);
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(KEY, t);
    updateBtn(t);
    document.dispatchEvent(new CustomEvent('urbeia:themechange', { detail: { theme: t } }));
  }

  // Run immediately in <head> to prevent FOUC
  applyTheme(localStorage.getItem(KEY) || 'dark');

  window.urbeiaTheme = {
    toggle() {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    },
    current() {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-theme');
    if (btn) {
      updateBtn(window.urbeiaTheme.current());
      btn.addEventListener('click', window.urbeiaTheme.toggle);
    }
  });
})();
