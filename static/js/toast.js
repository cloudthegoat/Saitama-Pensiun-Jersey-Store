/* toast.js
   ToastManager global API for Saitama Pensiun - Jersey Store
   Usage:
     ToastManager.show({ title, message, type, duration, actionText, onAction, dismissible })
     or use convenience: ToastManager.success(...), .error(...), .info(...), .warn(...)
*/

(function (window, document) {
  const DEFAULTS = {
    duration: 4500,      // ms
    type: 'info',        // success | info | warn | error
    dismissible: true,
    maxVisible: 5,       // maximum toasts shown; older ones removed
    pauseOnHover: true
  };

  // Ensure root container exists
  function ensureRoot() {
    let root = document.getElementById('sp-toast-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'sp-toast-root';
      root.className = 'sp-toast-root';
      root.setAttribute('aria-live', 'polite');
      root.setAttribute('aria-atomic', 'true');
      document.body.appendChild(root);
    } else {
      root.hidden = false;
    }
    return root;
  }

  // SVG icons for types
  const ICONS = {
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    error:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    info:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 8h.01M11 12h1v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.2" /></svg>`,
    warn:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  };

  // Utility to create nodes with classes/attrs
  function el(tag, opts = {}) {
    const node = document.createElement(tag);
    if (opts.class) node.className = opts.class;
    if (opts.html) node.innerHTML = opts.html;
    if (opts.attrs) {
      for (const k in opts.attrs) node.setAttribute(k, opts.attrs[k]);
    }
    return node;
  }

  // Manage active toasts
  const activeToasts = [];

  // Show toast
  function show(options = {}) {
    const cfg = Object.assign({}, DEFAULTS, options);
    const root = ensureRoot();

    // If too many toasts, remove oldest
    if (activeToasts.length >= cfg.maxVisible) {
      const oldest = activeToasts.shift();
      if (oldest && oldest.dom) removeToast(oldest.dom, 180);
    }

    const toast = el('div', { class: `sp-toast sp-toast--${cfg.type}` });
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    // icon
    const iconWrap = el('div', { class: 'sp-toast__icon', html: ICONS[cfg.type] || ICONS.info });
    // content
    const content = el('div', { class: 'sp-toast__content' });
    const title = el('div', { class: 'sp-toast__title', html: cfg.title || '' });
    const message = el('div', { class: 'sp-toast__message', html: cfg.message || '' });

    content.appendChild(title);
    if (cfg.message) content.appendChild(message);

    // action button (optional)
    if (cfg.actionText) {
      const actionBtn = el('button', { class: 'sp-toast__action', html: cfg.actionText });
      actionBtn.type = 'button';
      actionBtn.addEventListener('click', (ev) => {
        try { if (typeof cfg.onAction === 'function') cfg.onAction(ev); } catch (e) { console.error(e); }
        // default: dismiss after action
        removeToast(toast);
      });
      content.appendChild(actionBtn);
    }

    // controls (close)
    const controls = el('div', { class: 'sp-toast__controls' });
    if (cfg.dismissible) {
      const close = el('button', { class: 'sp-toast__close', html: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` });
      close.setAttribute('aria-label', 'Close notification');
      close.addEventListener('click', () => removeToast(toast));
      controls.appendChild(close);
    }

    // progress bar
    const progress = el('div', { class: 'sp-toast__progress' });
    const progressInner = el('div', { class: 'sp-toast__progress-inner' });
    progress.appendChild(progressInner);

    // build toast
    toast.appendChild(iconWrap);
    toast.appendChild(content);
    toast.appendChild(controls);
    toast.appendChild(progress);

    // insert at top (newest on top)
    root.insertBefore(toast, root.firstChild);

    // animate in
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // track for removal & pause/resume
    const createdAt = performance.now();
    const duration = Math.max(500, Number(cfg.duration) || DEFAULTS.duration);
    let remaining = duration;
    let start = performance.now();
    let rafId = null;
    let dismissed = false;

    function frame() {
      const elapsed = performance.now() - start;
      const pct = Math.max(0, 1 - (elapsed / remaining));
      // set transform scaleX for progress (using transform for better perf)
      progressInner.style.transform = `scaleX(${pct})`;
      if (elapsed >= remaining) {
        removeToast(toast);
        return;
      }
      rafId = requestAnimationFrame(frame);
    }

    // start timer
    start = performance.now();
    rafId = requestAnimationFrame(frame);

    // pause/resume on hover
    function pause() {
      if (!cfg.pauseOnHover) return;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      // recompute remaining
      const elapsed = performance.now() - start;
      remaining = Math.max(0, remaining - elapsed);
    }
    function resume() {
      if (!cfg.pauseOnHover) return;
      start = performance.now();
      if (!rafId) rafId = requestAnimationFrame(frame);
    }
    if (cfg.pauseOnHover) {
      toast.addEventListener('mouseenter', pause);
      toast.addEventListener('focusin', pause);
      toast.addEventListener('mouseleave', resume);
      toast.addEventListener('focusout', resume);
    }

    // remove function
    function removeToast(node, speed = 240) {
      if (dismissed) return;
      dismissed = true;
      // cleanup RAF
      if (rafId) cancelAnimationFrame(rafId);
      // animate out
      node.classList.remove('show');
      node.classList.add('hide');
      // accessibility: mark removed
      node.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        try { node.remove(); } catch (e) { if (node && node.parentNode) node.parentNode.removeChild(node); }
      }, speed);
      // remove from tracking
      const idx = activeToasts.findIndex(t => t.dom === node);
      if (idx !== -1) activeToasts.splice(idx, 1);
    }

    // store active
    activeToasts.push({ dom: toast, createdAt, cfg });

    // return handle
    return {
      dom: toast,
      dismiss: () => removeToast(toast)
    };
  }

  // Convenience API
  const ToastManager = {
    show(opts) { return show(opts); },
    success(message = '', title = 'Berhasil', opts = {}) {
      return show(Object.assign({}, opts, { message, title, type: 'success' }));
    },
    error(message = '', title = 'Gagal', opts = {}) {
      return show(Object.assign({}, opts, { message, title, type: 'error' }));
    },
    info(message = '', title = 'Info', opts = {}) {
      return show(Object.assign({}, opts, { message, title, type: 'info' }));
    },
    warn(message = '', title = 'Peringatan', opts = {}) {
      return show(Object.assign({}, opts, { message, title, type: 'warn' }));
    },
    clearAll() {
      // remove all
      const copy = activeToasts.slice();
      copy.forEach(t => {
        try { if (t.dom) t.dom.remove(); } catch (e) { /* ignore */ }
      });
      activeToasts.length = 0;
    },
    _active: activeToasts
  };

  // expose globally
  window.ToastManager = ToastManager;

  // Auto-initialize root on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureRoot, { once: true });
  } else {
    ensureRoot();
  }

})(window, document);