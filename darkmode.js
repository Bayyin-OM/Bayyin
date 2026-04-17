(function() {
  var STORAGE_KEY = 'bayyin-dark-mode';

  function applyMode(isDark) {
    var html = document.documentElement;
    if (isDark) { html.classList.add('dark-mode'); }
    else         { html.classList.remove('dark-mode'); }
    updateBtn(isDark);
    updateFooter(isDark);
  }

  function updateBtn(isDark) {
    var btn = document.getElementById('dm-toggle');
    if (!btn) return;
    var moon  = btn.querySelector('.dm-moon');
    var sun   = btn.querySelector('.dm-sun');
    var label = btn.querySelector('.dm-label');
    if (moon)  moon.style.display  = isDark ? 'none'         : 'block';
    if (sun)   sun.style.display   = isDark ? 'block'        : 'none';
    if (label) label.textContent   = isDark ? 'فاتح'         : 'داكن';
    btn.title = isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن';
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }

  function updateFooter(isDark) {
    var footer = document.getElementById('sticky-credit');
    if (footer) {
      footer.style.background    = isDark ? '#1A2230' : '#f0f4f7';
      footer.style.borderTopColor = isDark ? 'rgba(26,143,168,0.3)' : 'rgba(26,143,168,0.2)';
    }
    // bayyin-footer uses CSS variables — handled automatically
  }

  /* تعريف الدالة على window حتى يصلها onclick */
  window.toggleDarkMode = function() {
    var isDark = document.documentElement.classList.toggle('dark-mode');
    try { localStorage.setItem(STORAGE_KEY, isDark ? '1' : '0'); } catch(e){}
    updateBtn(isDark);
    updateFooter(isDark);
  };

  /* استعادة التفضيل المحفوظ فوراً (قبل رسم الصفحة) لمنع الوميض */
  var saved = '';
  try { saved = localStorage.getItem(STORAGE_KEY); } catch(e){}
  if (saved === '1') { document.documentElement.classList.add('dark-mode'); }

  /* تحديث الزر بعد تحميل DOM */
  document.addEventListener('DOMContentLoaded', function() {
    var isDark = document.documentElement.classList.contains('dark-mode');
    updateBtn(isDark);
    updateFooter(isDark);
  });
})();
