// auth_ajax.js
// Handles AJAX login/register/logout; shows toast messages and redirects when appropriate.

(function (window, document) {
  // Build API mapping: prefer server-injected window.AUTH_API, otherwise use safe fallback.
  const API = (function(){
    const FALLBACK = {
      login: '/api/auth/login/',
      register: '/api/auth/register/',
      logout: '/api/auth/logout/'
    };

    try {
      if (window && window.AUTH_API) {
        return {
          login: window.AUTH_API.login || FALLBACK.login,
          register: window.AUTH_API.register || FALLBACK.register,
          logout: window.AUTH_API.logout || FALLBACK.logout
        };
      }
    } catch (e) {
      // ignore
    }
    return FALLBACK;
  })();

  function getCSRF() {
    const v = document.cookie.match('(^|;)\\s*' + 'csrftoken' + '\\s*=\\s*([^;]+)');
    return v ? v.pop() : '';
  }

  async function ajaxLogin(formEl) {
    const fd = new FormData(formEl);
    try {
      const resp = await fetch(API.login, {
        method: 'POST',
        body: fd,
        credentials: 'same-origin',
        headers: { 'X-CSRFToken': getCSRF() }
      });
      const data = await resp.json();
      if (resp.ok && data.status === 'success') {
        if (window.ToastManager) window.ToastManager.success(data.message || 'Login berhasil', 'Login');
        // redirect if provided
        if (data.redirect) {
          setTimeout(function(){ window.location.href = data.redirect; }, 350);
        } else { window.location.reload(); }
      } else {
        // show errors
        if (data.errors) {
          // optional: show field errors inline, but keep it simple: show toast with first error
          const msgs = [];
          for (const k in data.errors) {
            const arr = data.errors[k];
            arr.forEach(function(e) { msgs.push(e.message || JSON.stringify(e)); });
          }
          if (msgs.length && window.ToastManager) window.ToastManager.error(msgs.join(' '), 'Login');
        } else {
          if (window.ToastManager) window.ToastManager.error(data.message || 'Login gagal', 'Login');
        }
      }
    } catch (e) {
      if (window.ToastManager) window.ToastManager.error('Gagal melakukan request', 'Error');
    }
  }

  async function ajaxRegister(formEl) {
    const fd = new FormData(formEl);
    try {
      const resp = await fetch(API.register, {
        method: 'POST',
        body: fd,
        credentials: 'same-origin',
        headers: { 'X-CSRFToken': getCSRF() }
      });
      const data = await resp.json();
      if (resp.ok && data.status === 'success') {
        if (window.ToastManager) window.ToastManager.success(data.message || 'Register berhasil', 'Register');
        if (data.redirect) {
          setTimeout(function(){ window.location.href = data.redirect; }, 350);
        }
      } else {
        if (data.errors) {
          const msgs = [];
          for (const k in data.errors) {
            const arr = data.errors[k];
            arr.forEach(function(e) { msgs.push(e.message || JSON.stringify(e)); });
          }
          if (msgs.length && window.ToastManager) window.ToastManager.error(msgs.join(' '), 'Register');
        } else {
          if (window.ToastManager) window.ToastManager.error(data.message || 'Register gagal', 'Register');
        }
      }
    } catch (e) {
      if (window.ToastManager) window.ToastManager.error('Gagal melakukan request', 'Error');
    }
  }

  // Modified logout: do NOT show immediate toast on success.
  // Instead, rely on server-side Django messages (we set them in api_logout) so that
  // after redirect the toast is shown by the existing message-to-toast pipeline.
  async function logout() {
    try {
      const resp = await fetch(API.logout, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-CSRFToken': getCSRF() }
      });

      // we still try to parse JSON to check redirect or error
      let data = null;
      try {
        data = await resp.json();
      } catch (parseErr) {
        // non-JSON response fallback
        if (resp.ok) {
          // best-effort redirect to homepage/login
          window.location.href = '/';
        } else {
          if (window.ToastManager) window.ToastManager.error('Logout gagal (response tidak valid)', 'Logout');
        }
        return;
      }

      if (resp.ok && data && data.status === 'success') {
        // Do not show toast here; server already queued a Django message which will
        // be displayed after we redirect to the login page.
        if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          // fallback: reload
          window.location.reload();
        }
      } else {
        // show error toast
        if (window.ToastManager) window.ToastManager.error(data && (data.message || 'Logout gagal') || 'Logout gagal', 'Logout');
      }
    } catch (e) {
      if (window.ToastManager) window.ToastManager.error('Gagal melakukan request', 'Error');
    }
  }

  // Automatic attach for forms on pages
  function init() {
    // login form (if present)
    const formEls = document.querySelectorAll('form');
    formEls.forEach(function(f) {
      // login form guess: has input[name="username"] and input[type="password"]
      const hasUser = f.querySelector('input[name="username"]');
      const hasPass = f.querySelector('input[name="password"]');
      if (hasUser && hasPass) {
        f.addEventListener('submit', function (ev) {
          ev.preventDefault();
          ajaxLogin(f);
        });
      }

      // register form guess: has input[name="password1"] etc
      const pass1 = f.querySelector('input[name="password1"]');
      const pass2 = f.querySelector('input[name="password2"]');
      if (pass1 && pass2) {
        f.addEventListener('submit', function (ev) {
          ev.preventDefault();
          ajaxRegister(f);
        });
      }
    });

    // attach logout button if present elsewhere (ProductAjax sets btnLogout to call AuthAjax.logout)
    window.AuthAjax = { logout };
  }

  window.AuthAjax = { init, ajaxLogin, ajaxRegister, logout };
})(window, document);