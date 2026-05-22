// ═══════════════════════════════════════════════════════════
// بيّن — i18n Engine (i18n.js)
// Centralized multilingual system. Add new languages by
// creating a new translation file and registering it here.
// ═══════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ── Constants ──────────────────────────────────────────
  var STORAGE_KEY = 'bayyin-language';
  var DEFAULT_LANG = 'ar';

  // ── Language Registry ──────────────────────────────────
  // To add a new language: add its translations file in /js/i18n/
  // then register it here.
  var _registry = {
    ar: null, // populated from _TRANSLATIONS_AR (ar.js)
    en: null, // populated from _TRANSLATIONS_EN (en.js)
    // fr: null, // French — future
    // tr: null, // Turkish — future
    // ur: null, // Urdu — future
  };

  var _currentLang = DEFAULT_LANG;
  var _listeners = [];

  // ── Initialize registry from global translation objects ──
  function _initRegistry() {
    if (typeof _TRANSLATIONS_AR !== 'undefined') _registry.ar = _TRANSLATIONS_AR;
    if (typeof _TRANSLATIONS_EN !== 'undefined') _registry.en = _TRANSLATIONS_EN;
    // Future: if (typeof _TRANSLATIONS_FR !== 'undefined') _registry.fr = _TRANSLATIONS_FR;
  }

  // ── Core: translate a key ──────────────────────────────
  function translate(key, lang) {
    lang = lang || _currentLang;
    var dict = _registry[lang];
    if (!dict) {
      console.warn('[i18n] No dictionary for language:', lang);
      return key;
    }
    var val = dict[key];
    if (val === undefined) {
      // Fallback to Arabic
      if (lang !== 'ar' && _registry.ar) {
        val = _registry.ar[key];
      }
      if (val === undefined) {
        // Key not found — return key as-is (developer sees the missing key)
        console.warn('[i18n] Missing key:', key, 'for lang:', lang);
        return key;
      }
    }
    return val;
  }

  // ── Set active language ────────────────────────────────
  function setLanguage(lang) {
    if (!_registry[lang] && lang !== 'ar' && lang !== 'en') {
      console.warn('[i18n] Unknown language:', lang);
      lang = DEFAULT_LANG;
    }
    _currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch(e) {}
    applyDirection(lang);
    applyFontFamily(lang);
    updateDocumentLang(lang);
    _notifyListeners(lang);
    _applyDataI18n();
    _applyTitle();
  }

  // ── Get current language ───────────────────────────────
  function getCurrentLanguage() {
    return _currentLang;
  }

  // ── Apply RTL/LTR direction ────────────────────────────
  function applyDirection(lang) {
    var dict = _registry[lang] || _registry[DEFAULT_LANG];
    var dir = dict ? (dict['meta.dir'] || 'rtl') : 'rtl';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    document.body && (document.body.style.direction = dir);
  }

  // ── Apply font-family for language ────────────────────
  function applyFontFamily(lang) {
    var root = document.documentElement;
    if (lang === 'en') {
      root.classList.add('lang-en');
      root.classList.remove('lang-ar');
    } else {
      root.classList.add('lang-ar');
      root.classList.remove('lang-en');
    }
  }

  // ── Update <html lang="..."> ───────────────────────────
  function updateDocumentLang(lang) {
    document.documentElement.lang = lang;
    var metaLang = document.querySelector('meta[name="language"]');
    if (metaLang) metaLang.content = lang;
  }

  // ── Apply translations to DOM elements with data-i18n ──
  // Elements: data-i18n="key" → sets textContent
  //           data-i18n-placeholder="key" → sets placeholder
  //           data-i18n-title="key" → sets title attr
  //           data-i18n-html="key" → sets innerHTML
  function _applyDataI18n() {
    // Text content
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var key = el.getAttribute('data-i18n');
      if (key) el.textContent = translate(key);
    }
    // Placeholder
    var phEls = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < phEls.length; j++) {
      var phEl = phEls[j];
      var phKey = phEl.getAttribute('data-i18n-placeholder');
      if (phKey) phEl.placeholder = translate(phKey);
    }
    // Title attribute
    var titleEls = document.querySelectorAll('[data-i18n-title]');
    for (var k = 0; k < titleEls.length; k++) {
      var tEl = titleEls[k];
      var tKey = tEl.getAttribute('data-i18n-title');
      if (tKey) tEl.title = translate(tKey);
    }
    // HTML content
    var htmlEls = document.querySelectorAll('[data-i18n-html]');
    for (var m = 0; m < htmlEls.length; m++) {
      var hEl = htmlEls[m];
      var hKey = hEl.getAttribute('data-i18n-html');
      if (hKey) hEl.innerHTML = translate(hKey);
    }
  }

  // ── Update page title ─────────────────────────────────
  function _applyTitle() {
    document.title = translate('meta.title');
  }

  // ── Observer pattern for language changes ──────────────
  function onLanguageChange(fn) {
    if (typeof fn === 'function') _listeners.push(fn);
  }

  function _notifyListeners(lang) {
    for (var i = 0; i < _listeners.length; i++) {
      try { _listeners[i](lang); } catch(e) { console.warn('[i18n] Listener error:', e); }
    }
  }

  // ── Detect and restore saved preference ───────────────
  function init() {
    _initRegistry();
    var saved = '';
    try { saved = localStorage.getItem(STORAGE_KEY) || ''; } catch(e) {}
    var lang = (saved && _registry[saved]) ? saved : DEFAULT_LANG;
    _currentLang = lang;
    applyDirection(lang);
    applyFontFamily(lang);
    updateDocumentLang(lang);
    // Apply data-i18n after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        _applyDataI18n();
        _applyTitle();
        _notifyListeners(lang);
      });
    } else {
      _applyDataI18n();
      _applyTitle();
      _notifyListeners(lang);
    }
  }

  // ── Toggle helper (for the toggle button) ─────────────
  function toggleLanguage() {
    var next = _currentLang === 'ar' ? 'en' : 'ar';
    setLanguage(next);
    _updateLangToggleBtn();
    return next;
  }

  function _updateLangToggleBtn() {
    var btn = document.getElementById('lang-toggle-btn');
    if (btn) {
      btn.textContent = translate('lang.toggle');
      btn.title = translate('lang.toggle.title');
    }
  }

  // ── Register new language (extensibility) ─────────────
  function registerLanguage(code, translationObj) {
    if (typeof code === 'string' && typeof translationObj === 'object') {
      _registry[code] = translationObj;
    }
  }

  // ── Expose public API on window ────────────────────────
  window.i18n = {
    t: translate,
    translate: translate,
    setLanguage: setLanguage,
    getCurrentLanguage: getCurrentLanguage,
    applyDirection: applyDirection,
    toggleLanguage: toggleLanguage,
    onLanguageChange: onLanguageChange,
    registerLanguage: registerLanguage,
    init: init,
    apply: _applyDataI18n,
  };

  // ── Convenience shorthand ──────────────────────────────
  window.t = translate;

  // ── Auto-initialize ────────────────────────────────────
  // Called after translation files are loaded (they are loaded first via <script> tags)
  init();

})();
