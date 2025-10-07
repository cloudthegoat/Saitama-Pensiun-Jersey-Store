// product_ajax.js (uses PRODUCT_API_ROOT if provided to avoid probes)
// If PRODUCT_API_ROOT is present (injected by base.html), we skip probing and use it directly.

(function (window, document) {
  // candidate list (kept as fallback, but won't be used if PRODUCT_API_ROOT provided)
  const CANDIDATES = [
    '/main/api/products/',
    '/api/products/',
    'api/products/',
    './api/products/'
  ];

  let API = null;
  let _initInProgress = false;
  let _initialized = false;

  function combine(a, b) {
    if (!a) return b;
    let combined = (a + '/' + b).replace(/\/+/g, '/');
    if (!combined.startsWith('/')) combined = '/' + combined;
    return combined;
  }

  // Build API helper object from a known full URL that ends with /api/products/
  function buildApiFromRoot(rootUrl) {
    // ensure it ends with '/api/products/' (but tolerate other variants)
    let test = rootUrl;
    if (!test.endsWith('/')) test += '/';
    // find '/api/products/' marker
    const marker = '/api/products/';
    let baseRoot = '/';
    const pos = test.indexOf(marker);
    if (pos !== -1) {
      baseRoot = test.slice(0, pos + 1); // includes leading slash, ends with '/'
    } else {
      // fallback: if rootUrl looks like '/something/api/products/' just use its dirname
      baseRoot = test.replace(/(\/api\/products\/?).*$/, '/');
    }

    return {
      list: () => combine(baseRoot, 'api/products/'),
      detail: (id) => combine(baseRoot, `api/products/${id}/`),
      create: () => combine(baseRoot, 'api/products/create/'),
      update: (id) => combine(baseRoot, `api/products/${id}/update/`),
      delete: (id) => combine(baseRoot, `api/products/${id}/delete/`),
      rawBase: baseRoot
    };
  }

  // minimal util
  function escapeHtml(s){ if (!s && s !== 0) return ''; return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); }); }
  function formatNumber(n){ if (n===null||n===undefined) return ''; return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
  function $(id){ return document.getElementById(id); }

  const nodes = {
    loading: () => $('productsLoading'),
    error: () => $('productsError'),
    empty: () => $('productsEmpty'),
    grid: () => $('productsGrid'),
    addBtn: () => $('btnAddProduct'),
    refreshBtn: () => $('btnRefreshProducts'),
    logoutBtn: () => $('btnLogout'),
    modalRoot: () => document.getElementById('sp-modals-root'),
    productModal: () => document.getElementById('productModal'),
    confirmModal: () => document.getElementById('confirmModal')
  };

  // Use injected placeholder if provided by base.html
  const PLACEHOLDER_THUMB = (window.PLACEHOLDER_THUMB && window.PLACEHOLDER_THUMB.length) ? window.PLACEHOLDER_THUMB : '/static/image/no-product.png';
  const CURRENT_USER = (typeof window.CURRENT_USER === 'string') ? window.CURRENT_USER : '';

  // helper to get current page filter param (all|my|featured)
  function getCurrentFilter() {
    try {
      const sp = new URLSearchParams(window.location.search);
      const f = sp.get('filter');
      return f ? f : 'all';
    } catch (e) {
      return 'all';
    }
  }

  function buildCardHTML(p){
    const thumb = p.thumbnail || '';
    const featured = p.is_featured ? `<span class="badge-featured">Featured</span>` : '';
    const author = p.user || '';
    // Only render edit/delete if current tab is "my" AND author equals current user
    const currentFilter = getCurrentFilter();
    const isMyTab = (currentFilter === 'my');
    const isOwner = (author && CURRENT_USER && author === CURRENT_USER);

    // Read button — navigates to product detail page (same-site)
    const readBtn = `<a href="/product/${encodeURIComponent(p.id)}/" class="btn-card btn-read" role="button">Read</a>`;

    let actionsHTML = '';

    if (isMyTab && isOwner) {
      // in My Products tab, owner sees Read + Edit + Delete
      actionsHTML = `
      <div>
        ${readBtn}
        <button class="btn-card btn-edit" data-action="edit" data-id="${p.id}">Edit</button>
        <button class="btn-card btn-delete" data-action="delete" data-id="${p.id}">Delete</button>
      </div>
      `;
    } else {
      // in All/Featured (or non-owner in My tab) show only Read
      actionsHTML = `
      <div>
        ${readBtn}
      </div>
      `;
    }

    return `
      <div class="product-card" data-id="${p.id}">
        <img class="card-thumb" src="${thumb || PLACEHOLDER_THUMB}" alt="${escapeHtml(p.name)}" />
        <div class="card-title">${escapeHtml(p.name)}</div>
        <div class="card-meta">${escapeHtml(p.category_display || p.category)} ${featured}</div>
        <div class="card-author small-muted">By: ${escapeHtml(author || 'Unknown')}</div>
        <div class="card-actions">
          <div class="price">Rp ${formatNumber(p.price)}</div>
          ${actionsHTML}
        </div>
      </div>
    `;
  }

  // CSRF getter
  function getCSRF(){
    const v = document.cookie.match('(^|;)\\s*' + 'csrftoken' + '\\s*=\\s*([^;]+)');
    return v ? v.pop() : '';
  }

  // Helper to join API.list() and current location.search safely
  function buildListEndpoint(apiListUrl) {
    const qs = window.location.search || '';
    if (!qs) return apiListUrl;
    // if apiListUrl already contains '?', append with '&', otherwise with '?'
    return apiListUrl + (apiListUrl.indexOf('?') === -1 ? qs : '&' + qs.slice(1));
  }

  // load products via resolved API
  async function loadProductsResolved(api) {
    if (!nodes.loading()) return;
    nodes.loading().style.display = '';
    nodes.error().style.display = 'none';
    nodes.empty().style.display = 'none';
    nodes.grid().innerHTML = '';

    try {
      // Build endpoint, preserving any query params from page URL (e.g. ?filter=my)
      const endpoint = buildListEndpoint(api.list());
      const resp = await fetch(endpoint, { credentials: 'same-origin' });
      if (!resp.ok) throw new Error('Gagal memuat produk (kode ' + resp.status + ')');
      const data = await resp.json();
      if (!data || data.status !== 'success') throw new Error(data && data.message ? data.message : 'Invalid response');

      const products = data.products || [];
      if (!products.length) {
        nodes.empty().style.display = '';
        nodes.grid().innerHTML = '';
      } else {
        nodes.grid().innerHTML = products.map(buildCardHTML).join('');
        nodes.empty().style.display = 'none';
      }
    } catch (err) {
      nodes.error().style.display = '';
      nodes.error().textContent = 'Error: ' + (err.message || err);
      if (window.ToastManager) window.ToastManager.error('Gagal memuat produk', 'Error');
      console.error('[ProductAjax] loadProducts error:', err);
    } finally {
      nodes.loading().style.display = 'none';
    }
  }

  // If template provided PRODUCT_API_ROOT, use it directly and skip probes
  function tryUseInjectedRoot() {
    try {
      if (window.PRODUCT_API_ROOT && typeof window.PRODUCT_API_ROOT === 'string' && window.PRODUCT_API_ROOT.length) {
        API = buildApiFromRoot(window.PRODUCT_API_ROOT);
        console.info('[ProductAjax] using injected API root:', window.PRODUCT_API_ROOT);
        return true;
      }
    } catch (e) {
      // ignore and fallback to probing
    }
    return false;
  }

  // fallback probing (kept but we avoid it if injected root exists)
  async function tryGet(url) {
    try {
      const r = await fetch(url, { method: 'GET', credentials: 'same-origin' });
      if (r.ok) return r;
      if (r.status === 401 || r.status === 403) return r;
      return null;
    } catch (e) {
      return null;
    }
  }

  async function resolveApiBaseByProbe() {
    for (const candidate of CANDIDATES) {
      let testUrl = candidate;
      if (!candidate.startsWith('/')) {
        testUrl = (window.location.pathname.replace(/\/+$/, '') || '/') + '/' + candidate;
        testUrl = testUrl.replace(/([^:]\/)\/+/g, '$1');
      }
      if (!testUrl.startsWith('http') && !testUrl.startsWith('/')) testUrl = '/' + testUrl;
      const res = await tryGet(testUrl);
      if (res) {
        const marker = '/api/products/';
        let baseRoot = '/';
        const pos = testUrl.indexOf(marker);
        if (pos !== -1) baseRoot = testUrl.slice(0, pos + 1);
        API = {
          list: () => combine(baseRoot, 'api/products/'),
          detail: (id) => combine(baseRoot, `api/products/${id}/`),
          create: () => combine(baseRoot, 'api/products/create/'),
          update: (id) => combine(baseRoot, `api/products/${id}/update/`),
          delete: (id) => combine(baseRoot, `api/products/${id}/delete/`),
          rawBase: baseRoot
        };
        console.info('[ProductAjax] resolved API base to:', API.rawBase);
        return API;
      }
    }
    return null;
  }

  // rest of logic (attach handlers, create/update/delete)
  function attachDelegation(){
    const grid = nodes.grid();
    grid && grid.addEventListener('click', function(ev){
      const btn = ev.target.closest('button[data-action]');
      if(!btn) return;
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      if(action === 'edit') openEdit(id);
      if(action === 'delete') openDelete(id);
    });

    const addBtn = nodes.addBtn();
    addBtn && addBtn.addEventListener('click', openCreate);

    const refreshBtn = nodes.refreshBtn();
    refreshBtn && refreshBtn.addEventListener('click', function(){ if(API) loadProductsResolved(API); else init(); });

    const logoutBtn = nodes.logoutBtn();
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(){
        if (window.AuthAjax && typeof window.AuthAjax.logout === 'function') window.AuthAjax.logout();
        else window.location.href = '/logout/';
      });
    }

    const root = nodes.modalRoot();
    if (root) {
      root.addEventListener('click', function(ev){
        if (ev.target.matches('[data-close], .sp-modal__backdrop, .sp-modal__close')) {
          const modal = ev.target.closest('.sp-modal');
          if (modal) modal.setAttribute('aria-hidden','true');
        }
      });
    }

    const submitBtn = document.getElementById('productFormSubmit');
    if (submitBtn) submitBtn.addEventListener('click', submitProductForm);

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) confirmBtn.addEventListener('click', confirmDeleteConfirmed);
  }

  function openCreate(){
    fillProductForm(null);
    const m = nodes.productModal();
    if (m) m.setAttribute('aria-hidden','false');
  }

  async function openEdit(id){
    if (!API) return init();
    try {
      const resp = await fetch(API.detail(id), { credentials: 'same-origin' });
      const data = await resp.json();
      if (data && data.status === 'success') {
        fillProductForm(data.product);
        const m = nodes.productModal();
        if (m) m.setAttribute('aria-hidden','false');
      } else {
        if (window.ToastManager) window.ToastManager.error(data.message || 'Gagal ambil produk', 'Error');
      }
    } catch (e) {
      if (window.ToastManager) window.ToastManager.error('Gagal ambil produk', 'Error');
    }
  }

  function openDelete(id){
    const btn = document.getElementById('confirmDeleteBtn');
    if (btn) btn.setAttribute('data-id', id);
    const m = nodes.confirmModal();
    if (m) m.setAttribute('aria-hidden','false');
  }

  function fillProductForm(data){
    const form = document.getElementById('productForm');
    if (!form) return;
    form.reset();
    form.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    if (!data) {
      document.getElementById('product-id').value = '';
      document.getElementById('product-name').value = '';
      document.getElementById('product-description').value = '';
      document.getElementById('product-price').value = '';
      document.getElementById('product-category').value = 'jersey premier league';
      document.getElementById('product-thumbnail').value = '';
      document.getElementById('product-featured').checked = false;
      document.getElementById('productModalTitle').textContent = 'Create Product';
      return;
    }
    document.getElementById('product-id').value = data.id || '';
    document.getElementById('product-name').value = data.name || '';
    document.getElementById('product-description').value = data.description || '';
    document.getElementById('product-price').value = data.price || '';
    document.getElementById('product-category').value = data.category || 'jersey premier league';
    document.getElementById('product-thumbnail').value = data.thumbnail || '';
    document.getElementById('product-featured').checked = !!data.is_featured;
    document.getElementById('productModalTitle').textContent = data.id ? 'Update Product' : 'Create Product';
  }

  // submitProductForm (fixed to use nodes.productModal())
  async function submitProductForm(){
    if (!API) {
      if (window.ToastManager) window.ToastManager.error('API belum siap', 'Error');
      return;
    }
    const submitBtn = document.getElementById('productFormSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    const form = document.getElementById('productForm');
    const fd = new FormData(form);
    const id = (document.getElementById('product-id').value || '').trim();
    const url = id ? API.update(id) : API.create();
    try {
      const resp = await fetch(url, {
        method: 'POST',
        body: fd,
        credentials: 'same-origin',
        headers: { 'X-CSRFToken': getCSRF() }
      });

      const respClone = resp.clone();

      let data = null;
      try {
        data = await resp.json(); // try parse JSON
      } catch (parseErr) {
        const txt = await respClone.text();
        console.error('[ProductAjax] non-JSON response (create/update):', txt);
        if (resp.status >= 500) {
          if (window.ToastManager) window.ToastManager.error('Server error saat membuat/menyimpan produk. Lihat console (Network response).', 'Error');
        } else {
          if (window.ToastManager) window.ToastManager.error('Response tidak valid dari server', 'Error');
        }
        return;
      }

      if (resp.ok && data && data.status === 'success') {
        const pm = nodes.productModal();
        if (pm) pm.setAttribute('aria-hidden', 'true');
        if (window.ToastManager) window.ToastManager.success(data.message || 'Berhasil', id ? 'Update Product' : 'Create Product');
        await loadProductsResolved(API);
      } else {
        if (data && data.errors) showFieldErrors(data.errors);
        const m = (data && (data.message || data.exception)) ? (data.message || data.exception) : 'Gagal';
        if (window.ToastManager) window.ToastManager.error(m, id ? 'Update Product' : 'Create Product');
        if (data && data.traceback) console.error('[ProductAjax] server traceback:\n', data.traceback);
      }

    } catch (e) {
      console.error('[ProductAjax] submitProductForm error:', e);
      if (window.ToastManager) window.ToastManager.error('Gagal melakukan request', 'Error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save';
    }
  }

  // confirmDeleteConfirmed (fixed to use nodes.confirmModal())
  async function confirmDeleteConfirmed(){
    const id = this.getAttribute('data-id');
    if (!id) return;
    const btn = this;
    btn.disabled = true; btn.textContent = 'Deleting...';
    try {
      const resp = await fetch(API.delete(id), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-CSRFToken': getCSRF() }
      });

      const respClone = resp.clone();

      let data = null;
      try {
        data = await resp.json();
      } catch (parseErr) {
        const txt = await respClone.text();
        console.error('[ProductAjax] non-JSON response (delete):', txt);
        if (window.ToastManager) window.ToastManager.error('Server error saat menghapus produk. Lihat console.', 'Error');
        return;
      }

      if (resp.ok && data && data.status === 'success') {
        if (window.ToastManager) window.ToastManager.success(data.message || 'Terhapus', 'Delete Product');
        const cm = nodes.confirmModal(); if (cm) cm.setAttribute('aria-hidden','true');
        await loadProductsResolved(API);
      } else {
        if (window.ToastManager) window.ToastManager.error(data.message || 'Gagal hapus', 'Delete Product');
        if (data && data.traceback) console.error('[ProductAjax] server traceback (delete):\n', data.traceback);
      }
    } catch (e) {
      console.error('[ProductAjax] confirmDeleteConfirmed error:', e);
      if (window.ToastManager) window.ToastManager.error('Gagal melakukan request', 'Error');
    } finally {
      btn.disabled = false; btn.textContent = 'Hapus';
    }
  }


  // main init - prefer injected root, otherwise probe
  async function init() {
    if (_initialized || _initInProgress) return;
    _initInProgress = true;

    // first try injected root from template
    if (tryUseInjectedRoot()) {
      attachDelegation();
      await loadProductsResolved(API);
      _initialized = true;
      _initInProgress = false;
      return;
    }

    // fallback: probe candidates
    const resolved = await resolveApiBaseByProbe();
    if (!resolved) {
      console.error('[ProductAjax] Could not resolve API base. Tried candidates:', CANDIDATES);
      if (nodes.error()) {
        nodes.error().style.display = '';
        nodes.error().textContent = 'Gagal memuat produk: endpoint API tidak ditemukan.';
      }
      if (window.ToastManager) window.ToastManager.error('Endpoint API tidak ditemukan', 'Error');
      _initInProgress = false;
      return;
    }

    API = resolved;
    attachDelegation();
    await loadProductsResolved(API);
    _initialized = true;
    _initInProgress = false;
  }

  window.ProductAjax = { init };

  // auto-init safe
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
      if (document.getElementById('productsGrid')) {
        window.ProductAjax.init();
      }
    }, 30);
  });

})(window, document);
