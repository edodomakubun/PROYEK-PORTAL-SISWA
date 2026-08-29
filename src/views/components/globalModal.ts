/**
 * GLOBAL CUSTOM MODAL & DIALOG SYSTEM
 * Portal Siswa SD Inpres Lelingluan
 */

export function renderGlobalModalCSS(): string {
  return `
    /* Global App Modal System */
    .app-modal-backdrop {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.22s ease, visibility 0.22s ease;
    }
    .app-modal-backdrop.show {
      opacity: 1;
      visibility: visible;
    }
    .app-modal-dialog {
      background: #ffffff;
      color: #0f172a;
      border-radius: 1.25rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 20px 50px -10px rgba(15,23,42,0.25), 0 0 0 1px rgba(255,255,255,0.9) inset;
      width: 100%;
      max-width: 460px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.93) translateY(10px);
      transition: transform 0.26s cubic-bezier(0.34, 1.5, 0.64, 1);
      position: relative;
    }
    .app-modal-dialog.size-lg { max-width: 660px; }
    .app-modal-dialog.size-sm { max-width: 360px; }
    .app-modal-backdrop.show .app-modal-dialog {
      transform: scale(1) translateY(0);
    }

    /* Icon */
    .amd-icon {
      width: 4rem; height: 4rem;
      border-radius: 1.1rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem;
      margin: 0 auto 1rem auto;
      box-shadow: 0 8px 20px -5px rgba(0,0,0,0.12);
    }
    .amd-icon.danger  { background: linear-gradient(135deg,#fee2e2,#fecaca); color:#dc2626; border:1px solid rgba(239,68,68,.25); }
    .amd-icon.warning { background: linear-gradient(135deg,#fef3c7,#fde68a); color:#d97706; border:1px solid rgba(245,158,11,.25); }
    .amd-icon.success { background: linear-gradient(135deg,#d1fae5,#a7f3d0); color:#059669; border:1px solid rgba(16,185,129,.25); }
    .amd-icon.info    { background: linear-gradient(135deg,#e0f2fe,#bae6fd); color:#0284c7; border:1px solid rgba(14,165,233,.25); }
    .amd-icon.list    { background: linear-gradient(135deg,#e0e7ff,#c7d2fe); color:#4f46e5; border:1px solid rgba(79,70,229,.25); }
    .amd-icon.prompt  { background: linear-gradient(135deg,#ccfbf1,#99f6e4); color:#0d9488; border:1px solid rgba(13,148,136,.25); }

    /* Header */
    .amd-header { padding: 1.6rem 1.6rem 0.5rem; text-align:center; position:relative; }
    .amd-title  { font-size:1.25rem; font-weight:800; color:#0f172a; margin-bottom:0.3rem; line-height:1.3; }
    .amd-msg    { font-size:0.9rem; color:#475569; margin:0; line-height:1.5; }

    /* Body & Footer */
    .amd-body   { padding:0.75rem 1.6rem 1rem; overflow-y:auto; flex:1; }
    .amd-footer {
      padding: 0.85rem 1.6rem 1.35rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex; align-items:center; justify-content:flex-end; gap:0.6rem;
    }

    /* Close Btn */
    .amd-close {
      position:absolute; top:1rem; right:1rem;
      background:#f1f5f9; border:none; color:#64748b;
      width:2rem; height:2rem; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; transition:all 0.18s ease; font-size:0.95rem;
    }
    .amd-close:hover { background:#e2e8f0; color:#0f172a; }

    /* List Items */
    .amd-list { display:flex; flex-direction:column; gap:0.5rem; max-height:340px; overflow-y:auto; }
    .amd-list-item {
      display:flex; align-items:center; justify-content:space-between;
      padding:0.8rem 1rem; border-radius:0.85rem;
      background:#fff; border:1px solid #cbd5e1;
      cursor:pointer; transition:all 0.18s ease;
    }
    .amd-list-item:hover { background:#f1f5f9; border-color:#94a3b8; transform:translateY(-1px); box-shadow:0 4px 10px rgba(15,23,42,.06); }
    .amd-list-item:active { transform:translateY(0); }

    /* Prompt input inside body */
    .amd-body .form-control, .amd-body .form-select {
      background:#fff !important; color:#0f172a !important;
      border:1.5px solid #94a3b8 !important;
      border-radius:0.7rem !important;
      padding:0.65rem 0.9rem !important;
    }
    .amd-body .form-control:focus, .amd-body .form-select:focus {
      border-color:#4f46e5 !important;
      box-shadow:0 0 0 3px rgba(79,70,229,.15) !important;
    }
    .amd-body .form-control.is-invalid {
      border-color:#dc2626 !important;
    }
  `;
}

export function renderGlobalModalHTML(): string {
  return `
    <!-- Global App Modal Singleton -->
    <div id="amdBackdrop" class="app-modal-backdrop" role="dialog" aria-modal="true" aria-hidden="true">
      <div id="amdDialog" class="app-modal-dialog">
        <button type="button" class="amd-close" id="amdClose" aria-label="Tutup">
          <i class="bi bi-x-lg"></i>
        </button>
        <div class="amd-header">
          <div id="amdIcon" class="amd-icon warning">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h4 id="amdTitle" class="amd-title">Konfirmasi</h4>
          <p id="amdMsg" class="amd-msg"></p>
        </div>
        <div id="amdBody" class="amd-body" style="display:none;"></div>
        <div class="amd-footer" id="amdFooter">
          <button type="button" id="amdBtnCancel" class="btn btn-light border rounded-pill px-4 fw-semibold text-secondary" style="display:none;">Batal</button>
          <button type="button" id="amdBtnOk" class="btn btn-warning text-dark rounded-pill px-4 fw-bold shadow-sm">Ya, Lanjutkan</button>
        </div>
      </div>
    </div>
  `;
}

export function renderGlobalModalJS(): string {
  return [
    '(function() {',
    '  "use strict";',
    '  var _backdrop, _dialog, _icon, _title, _msg, _body, _btnOk, _btnCancel, _closeBtn;',
    '  var _resolver = null;',

    '  var ICONS = {',
    '    danger:  "bi bi-exclamation-triangle-fill",',
    '    warning: "bi bi-exclamation-circle-fill",',
    '    success: "bi bi-check-circle-fill",',
    '    info:    "bi bi-info-circle-fill",',
    '    list:    "bi bi-list-task",',
    '    prompt:  "bi bi-pencil-square"',
    '  };',

    '  var BTN_CLASSES = {',
    '    danger:  "btn btn-danger rounded-pill px-4 fw-bold shadow-sm",',
    '    warning: "btn btn-warning text-dark rounded-pill px-4 fw-bold shadow-sm",',
    '    success: "btn btn-success rounded-pill px-4 fw-bold shadow-sm",',
    '    info:    "btn btn-info text-white rounded-pill px-4 fw-bold shadow-sm",',
    '    list:    "btn btn-primary rounded-pill px-4 fw-bold shadow-sm",',
    '    prompt:  "btn btn-primary rounded-pill px-4 fw-bold shadow-sm"',
    '  };',

    '  function init() {',
    '    _backdrop  = document.getElementById("amdBackdrop");',
    '    _dialog    = document.getElementById("amdDialog");',
    '    _icon      = document.getElementById("amdIcon");',
    '    _title     = document.getElementById("amdTitle");',
    '    _msg       = document.getElementById("amdMsg");',
    '    _body      = document.getElementById("amdBody");',
    '    _btnOk     = document.getElementById("amdBtnOk");',
    '    _btnCancel = document.getElementById("amdBtnCancel");',
    '    _closeBtn  = document.getElementById("amdClose");',

    '    if (!_backdrop) return;',

    '    _closeBtn.addEventListener("click", function() { _resolve(false); });',
    '    _btnCancel.addEventListener("click", function() { _resolve(false); });',
    '    _backdrop.addEventListener("click", function(e) { if (e.target === _backdrop) _resolve(false); });',
    '    document.addEventListener("keydown", function(e) { if (e.key === "Escape" && _isOpen()) _resolve(false); });',

    '    _btnOk.addEventListener("click", function() {',
    '      if (_btnOk._onConfirm) {',
    '        var result = _btnOk._onConfirm();',
    '        if (result === false) return;',
    '        _resolve(result !== undefined ? result : true);',
    '      } else {',
    '        _resolve(true);',
    '      }',
    '    });',

    '    _attachAutoConfirm();',
    '  }',

    '  function _isOpen() { return _backdrop && _backdrop.classList.contains("show"); }',

    '  function _open(opts) {',
    '    return new Promise(function(resolve) {',
    '      _resolver = resolve;',

    '      _dialog.className = "app-modal-dialog" + (opts.size ? " size-" + opts.size : "");',

    '      var t = opts.type || "info";',
    '      _icon.className = "amd-icon " + t;',
    '      _icon.innerHTML = "<i class=\\"" + (opts.iconClass || ICONS[t] || "bi bi-info-circle-fill") + "\\"></i>";',

    '      _title.textContent = opts.title || "Pemberitahuan";',
    '      _msg.innerHTML = opts.message || "";',
    '      _msg.style.display = opts.message ? "block" : "none";',

    '      if (opts.bodyHTML) {',
    '        _body.innerHTML = opts.bodyHTML;',
    '        _body.style.display = "block";',
    '      } else {',
    '        _body.innerHTML = "";',
    '        _body.style.display = "none";',
    '      }',

    '      if (opts.cancelText) {',
    '        _btnCancel.textContent = opts.cancelText;',
    '        _btnCancel.style.display = "inline-flex";',
    '      } else {',
    '        _btnCancel.style.display = "none";',
    '      }',

    '      if (opts.confirmText) {',
    '        _btnOk.textContent = opts.confirmText;',
    '        _btnOk.className = BTN_CLASSES[t] || "btn btn-primary rounded-pill px-4 fw-bold shadow-sm";',
    '        _btnOk.style.display = "inline-flex";',
    '      } else {',
    '        _btnOk.style.display = "none";',
    '      }',

    '      _btnOk._onConfirm = opts.onConfirm || null;',

    '      _backdrop.setAttribute("aria-hidden", "false");',
    '      _backdrop.classList.add("show");',
    '      document.body.style.overflow = "hidden";',
    '    });',
    '  }',

    '  function _resolve(result) {',
    '    if (!_backdrop) return;',
    '    _backdrop.classList.remove("show");',
    '    _backdrop.setAttribute("aria-hidden", "true");',
    '    document.body.style.overflow = "";',
    '    _btnOk._onConfirm = null;',
    '    if (_resolver) {',
    '      var r = _resolver;',
    '      _resolver = null;',
    '      r(result);',
    '    }',
    '  }',

    '  // PUBLIC API',
    '  var AppModal = {',

    '    confirm: function(messageOrOpts, title, confirmText, btnClass) {',
    '      var opts = messageOrOpts;',
    '      if (typeof messageOrOpts === "string") {',
    '        opts = {',
    '          message: messageOrOpts,',
    '          title: title || "Konfirmasi Tindakan",',
    '          confirmText: confirmText || "Ya, Lanjutkan",',
    '          type: btnClass === "btn-danger" ? "danger" : "warning"',
    '        };',
    '      }',
    '      opts = opts || {};',
    '      var noticeHTML = opts.notice ? \'<div class="alert alert-warning border-0 rounded-3 p-3 mt-2 small"><i class="bi bi-info-circle me-1"></i>\' + opts.notice + \'</div>\' : null;',
    '      return _open({',
    '        title: opts.title || "Konfirmasi Tindakan",',
    '        message: opts.message || "Apakah Anda yakin ingin melanjutkan?",',
    '        type: opts.type || "warning",',
    '        iconClass: opts.iconClass,',
    '        confirmText: opts.confirmText || "Ya, Lanjutkan",',
    '        cancelText: opts.cancelText !== undefined ? opts.cancelText : "Batal",',
    '        bodyHTML: noticeHTML',
    '      });',
    '    },',

    '    alert: function(messageOrOpts, title) {',
    '      var opts = messageOrOpts;',
    '      if (typeof messageOrOpts === "string") {',
    '        opts = { message: messageOrOpts, title: title || "Pemberitahuan" };',
    '      }',
    '      opts = opts || {};',
    '      return _open({',
    '        title: opts.title || "Pemberitahuan",',
    '        message: opts.message || "",',
    '        type: opts.type || "info",',
    '        iconClass: opts.iconClass,',
    '        confirmText: opts.confirmText || "Mengerti",',
    '        cancelText: null',
    '      });',
    '    },',

    '    prompt: function(messageOrOpts, title, defaultValue) {',
    '      var opts = messageOrOpts;',
    '      if (typeof messageOrOpts === "string") {',
    '        opts = { message: messageOrOpts, title: title || "Masukkan Keterangan", defaultValue: defaultValue || "" };',
    '      }',
    '      opts = opts || {};',
    '      var inputId = "amdPromptInput_" + Date.now();',
    '      var isTA = opts.inputType === "textarea";',
    '      var inputHTML = \'<div class="mt-1">\' +',
    '        (opts.label ? \'<label class="form-label fw-semibold text-dark mb-1">\' + opts.label + \'</label>\' : "") +',
    '        (opts.message ? \'<p class="small text-muted mb-2">\' + opts.message + \'</p>\' : "") +',
    '        (isTA',
    '          ? \'<textarea id="\' + inputId + \'" class="form-control" rows="3" placeholder="\' + (opts.placeholder || "") + \'">\' + (opts.defaultValue || "") + \'</textarea>\'',
    '          : \'<input type="\' + (opts.inputType || "text") + \'" id="\' + inputId + \'" class="form-control" placeholder="\' + (opts.placeholder || "") + \'" value="\' + (opts.defaultValue || "") + \'">\') +',
    '        \'</div>\';',
    '      return _open({',
    '        title: opts.title || "Masukkan Data",',
    '        message: "",',
    '        type: opts.type || "prompt",',
    '        confirmText: opts.confirmText || "Kirim",',
    '        cancelText: opts.cancelText !== undefined ? opts.cancelText : "Batal",',
    '        bodyHTML: inputHTML,',
    '        onConfirm: function() {',
    '          var el = document.getElementById(inputId);',
    '          if (!el) return "";',
    '          var val = el.value.trim();',
    '          if (opts.required && !val) {',
    '            el.classList.add("is-invalid");',
    '            el.focus();',
    '            return false;',
    '          }',
    '          return val;',
    '        }',
    '      }).then(function(r) { return r === false ? null : r; });',
    '    },',

    '    list: function(opts) {',
    '      opts = opts || {};',
    '      var items = opts.items || [];',
    '      var listId = "amdListBody_" + Date.now();',
    '      var searchId = "amdListSearch_" + Date.now();',

    '      var html = "";',
    '      if (opts.searchable !== false && items.length > 4) {',
    '        html += \'<div class="mb-3"><div class="input-group input-group-sm"><span class="input-group-text bg-light border-end-0 rounded-start-3"><i class="bi bi-search text-muted"></i></span><input type="text" id="\' + searchId + \'" class="form-control border-start-0 ps-0 rounded-end-3" placeholder="\' + (opts.searchPlaceholder || "Cari...") + \'"></div></div>\';',
    '      }',
    '      html += \'<div id="\' + listId + \'" class="amd-list">\';',
    '      if (!items.length) {',
    '        html += \'<div class="text-center text-muted py-4 small">Tidak ada data.</div>\';',
    '      } else {',
    '        items.forEach(function(item, idx) {',
    '          var badgeHTML = item.badge ? \'<span class="badge bg-\' + (item.badgeColor||"primary") + \' rounded-pill px-2">\' + item.badge + \'</span>\' : "";',
    '          html += \'<div class="amd-list-item" data-amd-idx="\' + idx + \'">\' +',
    '            \'<div class="d-flex align-items-center gap-2">\' +',
    '            \'<div class="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary" style="width:2rem;height:2rem;min-width:2rem;">\' +',
    '            \'<i class="\' + (item.icon || "bi bi-dash") + \' small"></i></div>\' +',
    '            \'<div><div class="fw-bold text-dark lh-sm mb-0">\' + (item.title || item.label || "") + \'</div>\' +',
    '            (item.subtitle ? \'<div class="small text-muted">\' + item.subtitle + \'</div>\' : "") +',
    '            \'</div></div>\' + badgeHTML + \'</div>\';',
    '        });',
    '      }',
    '      html += \'</div>\';',

    '      var resolveList;',
    '      var promise = new Promise(function(res) { resolveList = res; });',

    '      _open({',
    '        title: opts.title || "Pilih Opsi",',
    '        message: opts.subtitle || "Pilih salah satu di bawah ini:",',
    '        type: "list",',
    '        size: opts.size || "lg",',
    '        bodyHTML: html,',
    '        confirmText: null,',
    '        cancelText: opts.cancelText !== undefined ? opts.cancelText : "Tutup"',
    '      }).then(function(r) {',
    '        if (r === false) resolveList(null);',
    '      });',

    '      setTimeout(function() {',
    '        var listEl = document.getElementById(listId);',
    '        if (listEl) {',
    '          listEl.addEventListener("click", function(e) {',
    '            var item = e.target.closest("[data-amd-idx]");',
    '            if (!item) return;',
    '            var idx = parseInt(item.getAttribute("data-amd-idx"), 10);',
    '            _resolve(items[idx]);',
    '            resolveList(items[idx]);',
    '          });',
    '        }',
    '        var searchEl = document.getElementById(searchId);',
    '        if (searchEl && listEl) {',
    '          searchEl.addEventListener("input", function() {',
    '            var q = this.value.toLowerCase();',
    '            listEl.querySelectorAll(".amd-list-item").forEach(function(el) {',
    '              el.style.display = el.textContent.toLowerCase().includes(q) ? "flex" : "none";',
    '            });',
    '          });',
    '        }',
    '      }, 60);',

    '      return promise;',
    '    }',
    '  };',

    '  // AUTO INTERCEPT: onclick="return confirm(\'...\')" & data-confirm',
    '  function _attachAutoConfirm() {',
    '    document.addEventListener("click", function(e) {',
    '      var el = e.target;',
    '      while (el && el !== document.body) {',
    '        var dc = el.getAttribute ? el.getAttribute("data-confirm") : null;',
    '        var oc = el.getAttribute ? el.getAttribute("onclick") : null;',

    '        if (dc !== null || (oc && /\\bconfirm\\s*\\(/.test(oc))) {',
    '          if (el._amdConfirmed) { el._amdConfirmed = false; return; }',

    '          e.preventDefault();',
    '          e.stopImmediatePropagation();',

    '          var msg = dc;',
    '          if (!msg && oc) {',
    '            var m = oc.match(/confirm\\s*\\(\\s*[\'"]([\\s\\S]*?)[\'"]\\s*\\)/);',
    '            if (m) { msg = m[1].replace(/\\n/g,"\\n").replace(/\\\'/g,"\'").replace(/\\\"/g,"\""); }',
    '          }',
    '          if (!msg) msg = "Apakah Anda yakin ingin melanjutkan?";',

    '          var confirmTitle = (el.getAttribute && el.getAttribute("data-confirm-title")) || "Konfirmasi Tindakan";',
    '          var confirmType  = (el.getAttribute && el.getAttribute("data-confirm-type"))  || "warning";',
    '          var confirmBtn   = (el.getAttribute && el.getAttribute("data-confirm-btn"))   || "Ya, Lanjutkan";',

    '          var capturedForm = el.form || el.closest("form") || null;',
    '          var capturedEl   = el;',

    '          AppModal.confirm({',
    '            title: confirmTitle,',
    '            message: msg,',
    '            type: confirmType,',
    '            confirmText: confirmBtn',
    '          }).then(function(confirmed) {',
    '            if (!confirmed) return;',
    '            capturedEl._amdConfirmed = true;',
    '            if (capturedEl.tagName === "A" && capturedEl.href) {',
    '              window.location.href = capturedEl.href;',
    '            } else if (capturedForm) {',
    '              if (capturedEl.name && capturedEl.value && capturedEl.tagName === "BUTTON") {',
    '                var h = document.createElement("input");',
    '                h.type = "hidden"; h.name = capturedEl.name; h.value = capturedEl.value;',
    '                capturedForm.appendChild(h);',
    '              }',
    '              capturedForm.submit();',
    '            } else {',
    '              capturedEl.click();',
    '            }',
    '          });',
    '          return false;',
    '        }',
    '        el = el.parentElement;',
    '      }',
    '    }, true);',
    '  }',

    '  // EXPOSE GLOBAL ALIASES & AppModal',
    '  window.AppModal = AppModal;',
    '  window.customAlert = AppModal.alert;',
    '  window.customConfirm = AppModal.confirm;',
    '  window.customPrompt = AppModal.prompt;',
    '  window.customList = AppModal.list;',

    '  function _doInit() { init(); }',
    '  if (document.readyState === "loading") {',
    '    document.addEventListener("DOMContentLoaded", _doInit);',
    '  } else {',
    '    _doInit();',
    '  }',
    '})();'
  ].join('\n');
}