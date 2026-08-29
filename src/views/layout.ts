import { User } from '../types';
import { DEFAULT_AVATAR } from './helpers';
import { renderGlobalModalCSS, renderGlobalModalHTML, renderGlobalModalJS } from './components/globalModal';

export function renderLayout(title: string, user: User, content: string, activeNav: string = 'dashboard'): string {
  const isGuru = user.role === 'guru';
  const isSiswa = user.role === 'siswa';
  const isAdmin = user.role === 'admin';

  return `<!doctype html>
<html lang="id" data-bs-theme="light">
  <head>
    <meta charset="utf-8">
    <script>
      (function(){
        const savedWidth = localStorage.getItem('sidebarWidth');
        if (savedWidth) {
          const w = parseInt(savedWidth, 10);
          if (!isNaN(w) && w >= 180 && w <= 450) {
            document.documentElement.style.setProperty('--sidebar-width', w + 'px');
            document.documentElement.style.setProperty('--lte-sidebar-width', w + 'px');
          }
        }
      })();
    </script>

    
    <script>
      document.documentElement.setAttribute('data-bs-theme', 'light');
      try { localStorage.setItem('theme', 'light'); } catch(e) {}
      
      // Forcefully prevent AdminLTE or any script from changing the theme to dark
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'data-bs-theme') {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            if (currentTheme !== 'light') {
              document.documentElement.setAttribute('data-bs-theme', 'light');
            }
          }
        });
      });
      observer.observe(document.documentElement, { attributes: true });
    </script>

    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>${title} | PORTAL SISWA SD INPRES LELINGLUAN</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Portal Siswa SD Inpres Lelingluan - Sistem Informasi Data Siswa, Administrasi Akademik, dan Portal Informasi Sekolah." />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://portalsiswa.sdinpreslelingluan.com/" />
    <!-- Open Graph Metadata -->
    <meta property="og:title" content="${title} | PORTAL SISWA SD INPRES LELINGLUAN" />
    <meta property="og:description" content="Portal Resmi Siswa SD Inpres Lelingluan. Sistem Informasi Data dan Akademik Siswa." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://portalsiswa.sdinpreslelingluan.com/" />
    <!-- Favicon -->
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>">
    <!-- Fonts & Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/source-sans-3@5.0.12/index.css" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/overlayscrollbars@2.11.0/styles/overlayscrollbars.min.css" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" crossorigin="anonymous" />
    <!-- AdminLTE CSS -->
    <link rel="stylesheet" href="/css/adminlte.css" />
    
    <!-- Custom Modern UI Styling Enhancements -->
    <style>
      ${renderGlobalModalCSS()}

      :root, [data-bs-theme="light"], html, body {
        color-scheme: light !important;
        --primary-gradient: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
        --success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
        --info-gradient: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        --warning-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      }

      /* Comprehensive Light Mode High-Contrast System */
      body, html {
        background-color: #f1f5f9 !important;
        color: #0f172a !important;
      }

      /* Cards, Modals & Panel Contrast */
      .card, .modal-content {
        background-color: #ffffff !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05) !important;
      }
      .card-header, .modal-header {
        background-color: #ffffff !important;
        border-bottom: 1px solid #e2e8f0 !important;
        color: #0f172a !important;
      }
      .card-footer, .modal-footer {
        background-color: #f8fafc !important;
        border-top: 1px solid #e2e8f0 !important;
        color: #1e293b !important;
      }
      .bg-light {
        background-color: #f8fafc !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
      }

      /* Typography & Text Contrast Standardized */
      h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6, .card-title, .modal-title {
        color: #0f172a !important;
        font-weight: 700 !important;
      }
      .text-dark, .text-black, strong, b {
        color: #0f172a !important;
      }
      .text-muted, .text-secondary {
        color: #475569 !important;
      }
      small, .small {
        color: #475569 !important;
      }

      /* Inputs, Selects & Form Controls High-Contrast */
      .form-control, .form-select, .input-group-text {
        background-color: #ffffff !important;
        color: #0f172a !important;
        border: 1px solid #94a3b8 !important;
        font-weight: 500 !important;
      }
      .form-control:focus, .form-select:focus {
        background-color: #ffffff !important;
        color: #0f172a !important;
        border-color: #4f46e5 !important;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2) !important;
      }
      .form-control::placeholder {
        color: #64748b !important;
        opacity: 1 !important;
      }
      .form-control[readonly], .form-control[disabled], .form-select[disabled] {
        background-color: #f1f5f9 !important;
        color: #334155 !important;
        border-color: #cbd5e1 !important;
      }
      label, .form-label, .col-form-label {
        color: #1e293b !important;
        font-weight: 600 !important;
      }
      .form-text {
        color: #475569 !important;
      }

      /* Tables High-Contrast Rules */
      .table {
        background-color: #ffffff !important;
        color: #0f172a !important;
        --bs-table-bg: #ffffff !important;
        --bs-table-color: #0f172a !important;
      }
      .table thead, .table thead tr, .table thead th, .table-light, .table-light th {
        background-color: #f8fafc !important;
        color: #0f172a !important;
        border-bottom: 2px solid #cbd5e1 !important;
        font-weight: 700 !important;
      }
      .table tbody, .table tbody tr, .table tbody td {
        background-color: #ffffff !important;
        color: #0f172a !important;
        border-bottom: 1px solid #e2e8f0 !important;
      }
      .table-hover tbody tr:hover td {
        background-color: #f1f5f9 !important;
        color: #000000 !important;
      }
      .table-striped > tbody > tr:nth-of-type(odd) > * {
        background-color: #f8fafc !important;
        color: #0f172a !important;
      }

      /* Dropdowns High-Contrast */
      .dropdown-menu {
        background-color: #ffffff !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1) !important;
      }
      .dropdown-item {
        color: #1e293b !important;
        font-weight: 500;
      }
      .dropdown-item:hover, .dropdown-item:focus {
        background-color: #f1f5f9 !important;
        color: #4f46e5 !important;
      }

      /* Badges High-Contrast Enforcement */
      .badge {
        font-weight: 700 !important;
        padding: 0.35em 0.7em !important;
        letter-spacing: 0.2px;
      }
      .badge.bg-primary, .badge.text-bg-primary { background-color: #4f46e5 !important; color: #ffffff !important; }
      .badge.bg-secondary, .badge.text-bg-secondary { background-color: #475569 !important; color: #ffffff !important; }
      .badge.bg-success, .badge.text-bg-success { background-color: #059669 !important; color: #ffffff !important; }
      .badge.bg-info, .badge.text-bg-info { background-color: #0284c7 !important; color: #ffffff !important; }
      .badge.bg-warning, .badge.text-bg-warning { background-color: #d97706 !important; color: #ffffff !important; }
      .badge.bg-danger, .badge.text-bg-danger { background-color: #dc2626 !important; color: #ffffff !important; }
      .badge.bg-light, .badge.text-bg-light { background-color: #f1f5f9 !important; color: #0f172a !important; border: 1px solid #cbd5e1 !important; }
      .badge.bg-dark, .badge.text-bg-dark { background-color: #0f172a !important; color: #ffffff !important; }

      /* Alert Components Balanced High Contrast */
      .alert {
        border-radius: 12px !important;
        font-weight: 600 !important;
      }
      .alert-primary { background-color: #e0e7ff !important; border: 1px solid #a5b4fc !important; color: #312e81 !important; }
      .alert-success { background-color: #d1fae5 !important; border: 1px solid #6ee7b7 !important; color: #064e3b !important; }
      .alert-warning { background-color: #fef3c7 !important; border: 1px solid #fcd34d !important; color: #78350f !important; }
      .alert-danger { background-color: #fee2e2 !important; border: 1px solid #fca5a5 !important; color: #7f1d1d !important; }
      .alert-info { background-color: #e0f2fe !important; border: 1px solid #7dd3fc !important; color: #0c4a6e !important; }

      /* Buttons High Contrast Standards */
      .btn-primary { background: #4f46e5 !important; border-color: #4f46e5 !important; color: #ffffff !important; font-weight: 600; }
      .btn-primary:hover { background: #4338ca !important; border-color: #4338ca !important; color: #ffffff !important; }
      .btn-secondary { background: #475569 !important; border-color: #475569 !important; color: #ffffff !important; font-weight: 600; }
      .btn-secondary:hover { background: #334155 !important; border-color: #334155 !important; color: #ffffff !important; }
      .btn-success { background: #059669 !important; border-color: #059669 !important; color: #ffffff !important; font-weight: 600; }
      .btn-success:hover { background: #047857 !important; border-color: #047857 !important; color: #ffffff !important; }
      .btn-info { background: #0284c7 !important; border-color: #0284c7 !important; color: #ffffff !important; font-weight: 600; }
      .btn-info:hover { background: #0369a1 !important; border-color: #0369a1 !important; color: #ffffff !important; }
      .btn-warning { background: #d97706 !important; border-color: #d97706 !important; color: #ffffff !important; font-weight: 600; }
      .btn-warning:hover { background: #b45309 !important; border-color: #b45309 !important; color: #ffffff !important; }
      .btn-danger { background: #dc2626 !important; border-color: #dc2626 !important; color: #ffffff !important; font-weight: 600; }
      .btn-danger:hover { background: #b91c1c !important; border-color: #b91c1c !important; color: #ffffff !important; }
      .btn-light { background: #ffffff !important; border: 1px solid #cbd5e1 !important; color: #0f172a !important; font-weight: 600; }
      .btn-light:hover { background: #f1f5f9 !important; border-color: #94a3b8 !important; color: #0f172a !important; }

      html, body {
        min-height: 100vh;
        height: 100%;
        margin: 0;
        padding: 0;
        font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #f1f5f9;
        color: #334155;
      }

      .app-wrapper {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      /* Fixed / Auto-Hide Sticky Header Adjustments for Sidebar Collapse */
      :root {
        --sidebar-width: 250px;
        --lte-sidebar-width: 250px;
      }

      .app-header {
        position: sticky;
        top: 0;
        z-index: 1030;
        background: #ffffff !important;
        border-bottom: 1px solid #e2e8f0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        margin-left: ${isSiswa ? '0 !important' : 'var(--sidebar-width, 250px)'};
        transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out, margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      body.sidebar-collapse .app-header {
        margin-left: 0 !important;
      }
      .app-header.header-hidden {
        transform: translateY(-100%);
        opacity: 0;
        pointer-events: none;
      }

      /* Full Height Light / Cream Fixed Sidebar & Realtime Dynamic Resizing */
      .app-sidebar {
        position: fixed !important;
        top: 0;
        bottom: 0;
        left: 0;
        width: var(--sidebar-width, 250px) !important;
        min-width: var(--sidebar-width, 250px) !important;
        max-width: var(--sidebar-width, 250px) !important;
        height: 100vh !important;
        z-index: 1035;
        overflow-y: auto;
        overflow-x: hidden;
        background: #ffffff !important;
        border-right: 1px solid #cbd5e1 !important;
        box-shadow: 2px 0 16px rgba(15, 23, 42, 0.05) !important;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .app-sidebar .sidebar-wrapper,
      .app-sidebar .sidebar-brand {
        width: 100% !important;
        min-width: 100% !important;
        max-width: 100% !important;
      }

      .sidebar-brand {
        background: #ffffff !important;
        border-bottom: 1px solid #e2e8f0 !important;
        position: sticky;
        top: 0;
        z-index: 1040;
      }
      .sidebar-brand .brand-text {
        font-weight: 700 !important;
        letter-spacing: 0.5px;
        color: #0f172a !important;
      }
      .nav-sidebar .nav-link {
        border-radius: 10px;
        margin: 4px 10px;
        padding: 9px 14px;
        color: #334155 !important;
        font-weight: 600;
        transition: all 0.2s ease;
      }
      .nav-sidebar .nav-link:hover {
        background: #f1f5f9 !important;
        color: #4f46e5 !important;
      }
      .nav-sidebar .nav-link.active {
        background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
      }
      .nav-sidebar .nav-link.active p,
      .nav-sidebar .nav-link.active i {
        color: #ffffff !important;
      }
      .nav-sidebar .nav-link p {
        margin: 0;
        color: inherit;
      }

      /* Real-time Resizable Drag Handle - Positioned Fixed on Sidebar Right Border */
      .sidebar-resizer {
        position: fixed;
        top: 0;
        bottom: 0;
        left: calc(var(--sidebar-width, 250px) - 3px);
        width: 6px;
        cursor: col-resize;
        z-index: 1060;
        background: transparent;
        transition: background-color 0.2s ease;
      }
      body.sidebar-collapse .sidebar-resizer {
        display: none !important;
      }
      .sidebar-resizer:hover,
      body.is-resizing .sidebar-resizer {
        background-color: #4f46e5;
      }
      body.is-resizing {
        user-select: none !important;
        cursor: col-resize !important;
      }
      body.is-resizing .app-sidebar,
      body.is-resizing .app-header,
      body.is-resizing .app-main,
      body.is-resizing .app-footer,
      body.is-resizing .sidebar-resizer {
        transition: none !important;
      }

      /* Desktop Collapsed Sidebar State */
      body.sidebar-collapse .app-sidebar {
        transform: translateX(calc(-1 * var(--sidebar-width, 250px)));
      }

      /* Content & Footer Layout app-main grows to fill remaining viewport */
      .app-main {
        flex: 1 1 auto;
        margin-left: ${isSiswa ? '0 !important' : 'var(--sidebar-width, 250px)'};
        transition: margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      body.sidebar-collapse .app-main {
        margin-left: 0 !important;
      }

      .app-footer {
        flex-shrink: 0;
        margin-left: ${isSiswa ? '0 !important' : 'var(--sidebar-width, 250px)'};
        background: #ffffff !important;
        border-top: 1px solid #e2e8f0;
        z-index: 1020;
        transition: margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      body.sidebar-collapse .app-footer {
        margin-left: 0 !important;
      }

      /* Toast Notification - Floating Bottom Right (Auto-hide 2 sec) */
      .app-toast-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
        max-width: 380px;
        width: calc(100% - 48px);
      }
      .app-toast {
        pointer-events: auto;
        background: #ffffff;
        color: #0f172a;
        border-radius: 16px;
        padding: 14px 18px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(226, 232, 240, 0.8);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.9rem;
        font-weight: 600;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
      }
      .app-toast.show {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .app-toast.hide {
        opacity: 0;
        transform: translateY(15px) scale(0.95);
      }
      .app-toast-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        flex-shrink: 0;
      }
      .app-toast-info .app-toast-icon { background: rgba(79, 70, 229, 0.12); color: #4f46e5; }
      .app-toast-success .app-toast-icon { background: rgba(16, 185, 129, 0.12); color: #10b981; }
      .app-toast-warning .app-toast-icon { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
      .app-toast-danger .app-toast-icon { background: rgba(239, 68, 68, 0.12); color: #ef4444; }

      /* =========================================================
         ANDROID MOBILE NATIVE STYLING & BOTTOM TAB BAR ENGINE
         ========================================================= */
      @media (max-width: 991.98px) {
        /* 1. Tampilkan Tombol Toggle di Mobile Navbar & Off-Canvas Mobile Sidebar Drawer */
        .btn-sidebar-toggle {
          display: flex !important;
        }

        .app-sidebar {
          display: block !important;
          position: fixed !important;
          top: 0 !important;
          bottom: 0 !important;
          left: 0 !important;
          width: 280px !important;
          min-width: 280px !important;
          max-width: 85vw !important;
          z-index: 1070 !important;
          transform: translateX(-100%) !important;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          box-shadow: 4px 0 25px rgba(15, 23, 42, 0.15) !important;
        }

        body.sidebar-open .app-sidebar {
          transform: translateX(0) !important;
        }

        /* Mobile backdrop overlay when sidebar is open */
        body.sidebar-open::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(2px);
          z-index: 1065;
        }

        /* 2. Header & Main Content Penuh (0 Margin Left) */
        .app-header {
          margin-left: 0 !important;
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
        .app-main {
          margin-left: 0 !important;
          padding: 0.75rem !important;
          /* Tambah padding bottom agar konten tidak tertutup Bottom Nav Bar jika bukan siswa */
          padding-bottom: ${isSiswa ? '24px' : '72px'} !important;
        }
        .app-footer {
          margin-left: 0 !important;
          /* Footer di mobile disembunyikan agar tidak bertumpuk dengan Bottom Nav Bar */
          display: none !important;
        }

        /* 3. Teks Ringkas & Minimalis ala Android App */
        body, html {
          font-size: 0.85rem !important;
        }
        h1, .h1 { font-size: 1.3rem !important; }
        h2, .h2 { font-size: 1.2rem !important; }
        h3, .h3 { font-size: 1.1rem !important; }
        h4, .h4 { font-size: 1.0rem !important; }
        h5, .h5 { font-size: 0.95rem !important; }
        h6, .h6 { font-size: 0.88rem !important; }
        .small, small { font-size: 0.75rem !important; }

        /* 4. Minimalist Compact Cards untuk Perangkat Seluler */
        .card {
          border-radius: 14px !important;
          padding: 0.75rem !important;
          margin-bottom: 0.75rem !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
        }
        .card-header {
          padding: 0.5rem 0.75rem !important;
        }
        .card-body {
          padding: 0.5rem !important;
        }
        .small-box-custom {
          padding: 0.85rem !important;
          border-radius: 14px !important;
        }
        .small-box-custom h3 {
          font-size: 1.4rem !important;
        }

        /* 5. Sempurnakan Tabel Sesuai Layar Mobile (Responsive Horizontal Scroll) */
        .table-responsive {
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }
        .table {
          font-size: 0.8rem !important;
          margin-bottom: 0 !important;
        }
        .table th, .table td {
          padding: 0.5rem 0.6rem !important;
          white-space: nowrap;
        }
        .btn-sm {
          padding: 0.25rem 0.6rem !important;
          font-size: 0.75rem !important;
          border-radius: 50px !important;
        }

        /* Toast Container di Mobile */
        .app-toast-container {
          bottom: 75px !important; /* Di atas Bottom Nav */
          right: 12px !important;
          left: 12px !important;
          width: auto !important;
          max-width: none !important;
        }
      }

      /* Android Bottom Navigation Bar (Tabs Bar) */
      .mobile-bottom-nav {
        display: none;
      }

      @media (max-width: 991.98px) {
        .mobile-bottom-nav {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 62px;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
          z-index: 1050;
          justify-content: space-around;
          align-items: center;
          padding: 0 4px;
        }
        .mobile-bottom-nav .nav-item-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          text-decoration: none;
          font-size: 0.68rem;
          font-weight: 600;
          flex: 1;
          height: 100%;
          transition: all 0.2s ease;
          border-radius: 12px;
          margin: 2px;
        }
        .mobile-bottom-nav .nav-item-tab i {
          font-size: 1.25rem;
          margin-bottom: 2px;
          transition: transform 0.2s ease;
        }
        .mobile-bottom-nav .nav-item-tab.active {
          color: #4f46e5;
          font-weight: 700;
        }
        .mobile-bottom-nav .nav-item-tab.active i {
          transform: translateY(-2px);
          color: #4f46e5;
        }
      }

      .app-footer.footer-hidden {
        transform: translateY(100%);
        opacity: 0;
        pointer-events: none;
      }

      /* Touch-friendly Mobile Sidebar & Backdrop Styling */
      .sidebar-backdrop {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 1039;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      @media (max-width: 991.98px) {
        body.sidebar-open .sidebar-backdrop {
          display: block;
          opacity: 1;
        }
        .app-sidebar {
          position: fixed !important;
          top: 0;
          left: 0;
          bottom: 0;
          width: 270px !important;
          height: 100vh !important;
          z-index: 1045 !important;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          touch-action: manipulation;
          -webkit-overflow-scrolling: touch;
        }
        body.sidebar-open .app-sidebar {
          transform: translateX(0) !important;
          box-shadow: 8px 0 30px rgba(0, 0, 0, 0.3) !important;
        }
        .app-main, .app-footer {
          margin-left: 0 !important;
        }
        
        /* Make Hamburger Button Touch Friendly */
        .btn-sidebar-toggle {
          padding: 8px 12px;
          border-radius: 8px;
          touch-action: manipulation;
        }
        .btn-sidebar-toggle:active {
          background-color: #f1f5f9;
        }
      }

      /* Modern Cards & Stat boxes */
      .card {
        border: none;
        border-radius: 14px;
        box-shadow: 0 4px 18px rgba(0,0,0,0.04);
        background: #ffffff;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .card-header {
        background: transparent;
        border-bottom: 1px solid #f1f5f9;
        padding: 1rem 1.25rem;
      }
      .small-box-custom {
        border-radius: 14px;
        padding: 0.85rem 1.15rem;
        color: #ffffff;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 14px rgba(0,0,0,0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .small-box-custom:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0,0,0,0.09);
      }
      .small-box-custom .inner h3 {
        font-size: 1.45rem;
        font-weight: 800;
        margin-bottom: 0.15rem;
        line-height: 1.15;
      }
      .small-box-custom .inner p {
        font-size: 0.82rem;
        margin-bottom: 0;
      }
      .small-box-custom .icon-bg {
        position: absolute;
        right: 12px;
        bottom: 2px;
        font-size: 2.8rem;
        opacity: 0.18;
      }

      /* Avatar and Thumbnails */
      .avatar-thumb {
        width: 44px;
        height: 44px;
        object-fit: cover;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 2px solid #e2e8f0;
      }
      .avatar-lg {
        width: 130px;
        height: 130px;
        object-fit: cover;
        border-radius: 50%;
        border: 4px solid #4f46e5;
        box-shadow: 0 8px 24px rgba(79, 70, 229, 0.25);
      }
      .badge-alm {
        background-color: #ef4444;
        color: white;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 9999px;
        margin-left: 6px;
        display: inline-block;
      }

      /* Force Clean Light Table Styling */
      .table {
        background-color: #ffffff !important;
        color: #1e293b !important;
        --bs-table-bg: #ffffff !important;
        --bs-table-color: #1e293b !important;
      }
      .table thead, .table thead tr, .table thead th {
        background-color: #f8fafc !important;
        color: #475569 !important;
        border-bottom: 2px solid #e2e8f0 !important;
        font-weight: 700;
      }
      .table tbody, .table tbody tr, .table tbody td {
        background-color: #ffffff !important;
        color: #1e293b !important;
        border-bottom: 1px solid #f1f5f9 !important;
      }
      .table-hover tbody tr:hover td {
        background-color: #f8fafc !important;
        color: #0f172a !important;
      }

      /* Clean Subtitle & Text Contrast */
      .text-muted {
        color: #64748b !important;
      }

      /* Clean Breadcrumb */
      .breadcrumb {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
      .breadcrumb-item, .breadcrumb-item a {
        color: #64748b !important;
        text-decoration: none;
      }
      .breadcrumb-item.active {
        color: #0f172a !important;
        font-weight: 600;
      }

      /* Tabs & Forms */
      .nav-tabs .nav-link {
        border: none;
        color: #64748b;
        font-weight: 600;
        padding: 0.75rem 1.25rem;
        border-radius: 10px 10px 0 0;
      }
      .nav-tabs .nav-link.active {
        color: #4f46e5;
        border-bottom: 3px solid #4f46e5;
        background: transparent;
      }
      .doc-card {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        background: #f8fafc;
        transition: all 0.2s ease;
      }
      .doc-card:hover {
        border-color: #cbd5e1;
        background: #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      }

      /* Explicit Logout Button Styling */
      .btn-logout-header {
        background-color: #fee2e2;
        color: #dc2626;
        border: 1px solid #fca5a5;
        font-weight: 600;
        padding: 0.4rem 1rem;
        border-radius: 50px;
        transition: all 0.2s ease;
      }
      .btn-logout-header:hover {
        background-color: #dc2626;
        color: #ffffff;
        border-color: #dc2626;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      }
    </style>
  </head>
  <body class="layout-fixed sidebar-expand-lg">
    <div class="app-wrapper">
      <!-- Header / Navbar -->
      <nav class="app-header navbar navbar-expand">
        <div class="container-fluid px-3">
          <ul class="navbar-nav align-items-center gap-2">
            ${!isSiswa ? `
            <li class="nav-item">
              <a class="nav-link text-dark btn-sidebar-toggle d-flex align-items-center justify-content-center p-2 rounded-3 bg-light border shadow-sm" data-lte-toggle="sidebar" href="#" role="button" id="sidebarToggleBtn" aria-label="Toggle Sidebar" title="Sembunyikan / Tampilkan Sidebar Navigation" style="cursor: pointer; width: 40px; height: 40px;">
                <i class="bi bi-list fs-3 text-primary"></i>
              </a>
            </li>
            <li class="nav-item d-none d-md-block ms-1">
              <a href="/dashboard" class="nav-link fw-semibold text-secondary">
                <i class="bi bi-house-door me-1"></i> Home
              </a>
            </li>
            ` : ''}
          </ul>

          ${isSiswa ? `
          <!-- Siswa Navbar Brand / Logo -->
          <a href="/students/my-profile" class="navbar-brand d-flex align-items-center gap-2 text-decoration-none text-dark fw-bold ms-1" style="font-family: 'Plus Jakarta Sans', sans-serif;">
            <div class="bg-primary bg-opacity-10 p-1.5 rounded-3 d-flex align-items-center justify-content-center" style="width: 34px; height: 34px;">
              <i class="bi bi-mortarboard-fill text-primary fs-5"></i>
            </div>
            <span class="fs-5 fw-bold text-dark tracking-tight">PORTAL SISWA</span>
          </a>
          ` : ''}

          <!-- User controls aligned to the right -->
          <ul class="navbar-nav ms-auto align-items-center gap-2">
            <!-- REAL-TIME ONLINE USERS BADGE -->
            <li class="nav-item me-1">
              <button type="button" class="btn btn-outline-success btn-sm rounded-pill d-flex align-items-center gap-2 px-3 py-1 shadow-sm" data-bs-toggle="modal" data-bs-target="#onlineUsersModal" title="Lihat Siapa Saja Yang Sedang Online">
                <span class="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true" style="width: 10px; height: 10px;"></span>
                <span class="fw-bold text-dark" id="onlineUsersCountNav">1 Online</span>
              </button>
            </li>

            <!-- User Info Pill -->
            <li class="nav-item dropdown user-menu me-2">
              <a href="#" class="nav-link dropdown-toggle text-dark d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                <img src="${user.avatar_url || DEFAULT_AVATAR}" 
                     class="rounded-circle border" 
                     style="width: 36px; height: 36px; object-fit: cover;" 
                     alt="Foto ${user.full_name || user.username}" />
                <span class="d-none d-md-inline fw-semibold text-dark">${user.full_name || user.username} <small class="text-muted">(${user.role.toUpperCase()})</small></span>
              </a>
              <ul class="dropdown-menu dropdown-menu-lg dropdown-menu-end shadow border-0 rounded-4 mt-2">
                <li class="user-header bg-primary text-white p-3 text-center rounded-top-4" style="background: var(--primary-gradient) !important;">
                  <img src="${user.avatar_url || DEFAULT_AVATAR}" 
                       class="rounded-circle border border-2 border-white mb-2 shadow-sm" 
                       style="width: 70px; height: 70px; object-fit: cover;" 
                       alt="Foto ${user.full_name || user.username}" />
                  <p class="mb-0 fw-bold fs-5">${user.full_name || user.username}</p>
                  <small class="badge bg-white text-primary fw-bold mt-1">${user.role.toUpperCase()}</small>
                </li>
                <li class="user-footer p-3 text-center">
                  <a href="/logout" class="btn btn-outline-danger btn-sm w-100 rounded-pill fw-semibold">
                    <i class="bi bi-box-arrow-right me-1"></i> Logout / Keluar
                  </a>
                </li>
              </ul>
            </li>

            <!-- DIRECT EXPLICIT LOGOUT BUTTON IN NAVBAR -->
            <li class="nav-item">
              <a href="/logout" class="btn btn-logout-header btn-sm d-flex align-items-center gap-1 shadow-sm" title="Keluar dari Sistem">
                <i class="bi bi-box-arrow-right fs-6"></i>
                <span class="d-none d-sm-inline">Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      ${!isSiswa ? `
      <!-- Main Sidebar Container -->
      <aside class="app-sidebar bg-white shadow-sm" data-bs-theme="light">
        <div id="sidebarResizeHandle" class="sidebar-resizer" title="Tahan & geser untuk meresize lebar navigasi"></div>
        <div class="sidebar-brand d-flex align-items-center justify-content-between px-3 py-3">
          <a href="/dashboard" class="brand-link text-decoration-none d-flex align-items-center gap-2 m-0 p-0">
            <i class="bi bi-mortarboard-fill text-warning fs-4"></i>
            <span class="brand-text">PORTAL SISWA</span>
          </a>
          <button type="button" class="btn btn-sm btn-outline-secondary border-0 btn-sidebar-toggle d-flex align-items-center justify-content-center p-1" data-lte-toggle="sidebar" title="Sembunyikan Sidebar">
            <i class="bi bi-layout-sidebar-reverse fs-5 text-secondary"></i>
          </button>
        </div>
        <div class="sidebar-wrapper d-flex flex-column justify-content-between h-100 pb-3">
          <nav class="mt-3">
            <ul class="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="menu">
              <li class="nav-item">
                <a href="/dashboard" class="nav-link ${activeNav === 'dashboard' ? 'active' : ''}">
                  <i class="nav-icon bi bi-speedometer2 me-2"></i>
                  <p>Dashboard</p>
                </a>
              </li>
              <li class="nav-item">
                <a href="/students" class="nav-link ${activeNav === 'students' ? 'active' : ''}">
                  <i class="nav-icon bi bi-people-fill me-2"></i>
                  <p>Data Siswa</p>
                </a>
              </li>
              ${(isAdmin || isGuru) ? `
              <li class="nav-item">
                <a href="/document-reviews" class="nav-link ${activeNav === 'document_reviews' ? 'active' : ''}">
                  <i class="nav-icon bi bi-file-earmark-check-fill me-2 text-primary"></i>
                  <p>
                    Review Dokumen
                    <span id="sidebar-review-badge" class="float-end d-flex gap-1 align-items-center"></span>
                  </p>
                </a>
              </li>
              <li class="nav-item">
                <a href="/document-submissions" class="nav-link ${activeNav === 'document_submissions' ? 'active' : ''}">
                  <i class="nav-icon bi bi-list-check me-2 text-info"></i>
                  <p>Riwayat Pengajuan</p>
                </a>
              </li>
              ` : ''}
              ${(isAdmin || isGuru) ? `
              <li class="nav-item">
                <a href="/priority-students" class="nav-link ${activeNav === 'priority_students' ? 'active' : ''}">
                  <i class="nav-icon bi bi-exclamation-triangle-fill me-2 text-warning"></i>
                  <p>Siswa Prioritas</p>
                </a>
              </li>
              <li class="nav-item">
                <a href="/mutations" class="nav-link ${activeNav === 'mutations' ? 'active' : ''}">
                  <i class="nav-icon bi bi-person-x-fill me-2 text-danger"></i>
                  <p>Mutasi Siswa</p>
                </a>
              </li>
              ` : ''}
              ${isAdmin ? `
              <li class="nav-item">
                <a href="/admin/naik-kelas" class="nav-link ${activeNav === 'naik_kelas' ? 'active' : ''}">
                  <i class="nav-icon bi bi-graph-up-arrow me-2 text-primary"></i>
                  <p>Kenaikan Kelas (Admin)</p>
                </a>
              </li>
              <li class="nav-item">
                <a href="/admin/graduated-students" class="nav-link ${activeNav === 'graduated_students' ? 'active' : ''}">
                  <i class="nav-icon bi bi-mortarboard-fill me-2 text-success"></i>
                  <p>Siswa Lulusan</p>
                </a>
              </li>
              <li class="nav-item">
                <a href="/audit-log" class="nav-link ${activeNav === 'audit_log' ? 'active' : ''}">
                  <i class="nav-icon bi bi-shield-check me-2 text-info"></i>
                  <p>Audit Log (Admin)</p>
                </a>
              </li>
              ` : ''}
              ${(isAdmin || isGuru) ? `
              <li class="nav-item">
                <a href="/admin/print-cards" class="nav-link ${activeNav === 'print_cards' ? 'active' : ''}" target="_blank">
                  <i class="nav-icon bi bi-printer-fill me-2 text-success"></i>
                  <p>Cetak Kartu Siswa</p>
                </a>
              </li>
              <li class="nav-item">
                <a href="/admin/setup-accounts" class="nav-link ${activeNav === 'setup_accounts' ? 'active' : ''}">
                  <i class="nav-icon bi bi-person-gear me-2 text-warning"></i>
                  <p>Setup Akun Siswa</p>
                </a>
              </li>
              <li class="nav-item">
                <a href="/admin/guide" class="nav-link ${activeNav === 'guide' ? 'active' : ''}">
                  <i class="nav-icon bi bi-book-half me-2 text-success"></i>
                  <p>Panduan Guru</p>
                </a>
              </li>
              ` : ''}
              ${isAdmin ? `
              <li class="nav-item">
                <a href="/admin/wali-kelas" class="nav-link ${activeNav === 'wali_kelas' ? 'active' : ''}">
                  <i class="nav-icon bi bi-person-workspace me-2 text-primary"></i>
                  <p>Manajemen Wali Kelas</p>
                </a>
              </li>
              <li class="nav-item">
                <a href="/admin/settings" class="nav-link ${activeNav === 'settings' ? 'active' : ''}">
                  <i class="nav-icon bi bi-sliders me-2 text-danger"></i>
                  <p>Setelan Sistem (Admin)</p>
                </a>
              </li>
              ` : ''}
            </ul>
          </nav>

        </div>
      </aside>
      ` : ''}

      <!-- Content Wrapper -->
      <main class="app-main ${isSiswa ? 'p-2 p-md-3' : 'p-3 p-md-4'}">
        ${!isSiswa ? `
        <div class="app-content-header mb-2 mb-md-3 d-none d-md-block">
          <div class="container-fluid px-0">
            <div class="row align-items-center">
              <div class="col-sm-6">
                <h3 class="mb-0 fw-bold text-dark fs-4">${title}</h3>
              </div>
              <div class="col-sm-6">
                <ol class="breadcrumb float-sm-end bg-white px-3 py-1.5 rounded-pill shadow-sm mb-0 border small">
                  <li class="breadcrumb-item"><a href="/dashboard" class="text-decoration-none">Home</a></li>
                  <li class="breadcrumb-item active text-secondary" aria-current="page">${title}</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        ` : ''}
        <div class="app-content">
          <div class="container-fluid px-0">
            ${content}
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="app-footer bg-white border-top py-3 text-muted">
        <div class="container-fluid d-flex justify-content-between align-items-center">
          <span><strong>Copyright &copy; 2026 Portal Siswa.</strong> All rights reserved.</span>
          <span class="badge bg-secondary opacity-75">Portal Siswa System</span>
        </div>
      </footer>
    </div>

    ${!isSiswa ? `
    <!-- Android Native-Style Bottom Navigation Bar (Tabs Bar) -->
    <nav class="mobile-bottom-nav">
      <a href="/dashboard" class="nav-item-tab ${activeNav === 'dashboard' ? 'active' : ''}">
        <i class="bi ${activeNav === 'dashboard' ? 'bi-speedometer2' : 'bi-speedometer'}"></i>
        <span>Dashboard</span>
      </a>
      <a href="/students" class="nav-item-tab ${activeNav === 'students' ? 'active' : ''}">
        <i class="bi ${activeNav === 'students' ? 'bi-people-fill' : 'bi-people'}"></i>
        <span>Data Siswa</span>
      </a>
      ${(isAdmin || isGuru) ? `
      <a href="/priority-students" class="nav-item-tab ${activeNav === 'priority_students' ? 'active' : ''}">
        <i class="bi ${activeNav === 'priority_students' ? 'bi-exclamation-triangle-fill' : 'bi-exclamation-triangle'} text-warning"></i>
        <span>Prioritas</span>
      </a>
      ` : ''}
      ${isAdmin ? `
      <a href="/audit-log" class="nav-item-tab ${activeNav === 'audit_log' ? 'active' : ''}">
        <i class="bi ${activeNav === 'audit_log' ? 'bi-shield-check' : 'bi-shield'}"></i>
        <span>Audit Log</span>
      </a>
      ` : ''}
      ${(isAdmin || isGuru) ? `
      <a href="/admin/print-cards" class="nav-item-tab ${activeNav === 'print_cards' ? 'active' : ''}" target="_blank">
        <i class="bi bi-printer-fill"></i>
        <span>Cetak Kartu</span>
      </a>
      <a href="/admin/setup-accounts" class="nav-item-tab ${activeNav === 'setup_accounts' ? 'active' : ''}">
        <i class="bi ${activeNav === 'setup_accounts' ? 'bi-person-gear' : 'bi-person-gear-fill'}"></i>
        <span>Setup Akun</span>
      </a>
      ` : ''}
      ${isAdmin ? `
      <a href="/admin/settings" class="nav-item-tab ${activeNav === 'settings' ? 'active' : ''}">
        <i class="bi ${activeNav === 'settings' ? 'bi-sliders' : 'bi-sliders2'}"></i>
        <span>Setelan</span>
      </a>
      ` : ''}
    </nav>
    ` : ''}

    <!-- Floating Toast Container (Bottom Right 2 Seconds Auto-Hide) -->
    <div id="appToastContainer" class="app-toast-container"></div>

    <!-- Modal Real-time Online Users -->
    <div class="modal fade" id="onlineUsersModal" tabindex="-1" aria-labelledby="onlineUsersModalLabel">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-success text-white rounded-top-4 py-3">
            <h5 class="modal-title fw-bold d-flex align-items-center gap-2" id="onlineUsersModalLabel">
              <i class="bi bi-broadcast fs-4"></i> Pengguna Online Realtime
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-3">
            <div class="text-muted small mb-3 text-center bg-light py-2 px-3 rounded-3 border">
              <i class="bi bi-info-circle text-primary me-1"></i> Menampilkan seluruh pengguna yang sedang aktif di sistem secara realtime.
            </div>
            <div id="onlineUsersListContainer" class="list-group list-group-flush gap-2">
              <div class="text-center py-4">
                <div class="spinner-border text-success spinner-border-sm" role="status"></div>
                <p class="mt-2 text-muted small mb-0">Memuat data pengguna online...</p>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light py-2 rounded-bottom-4 justify-content-between">
            <small class="text-muted" id="lastUpdatedOnlineText">Status: Realtime Connected</small>
            <button type="button" class="btn btn-secondary btn-sm rounded-pill px-3" data-bs-dismiss="modal">Tutup</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/overlayscrollbars@2.11.0/browser/overlayscrollbars.browser.es6.min.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
    <script src="/js/adminlte.js"></script>

    <!-- Global Toast Notification Engine (Auto-hide in 2 seconds) -->
    <script>
      function showToast(message, type = 'success', duration = 2000) {
        const container = document.getElementById('appToastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'app-toast app-toast-' + type;

        let iconClass = 'bi-check-circle-fill';
        if (type === 'danger') iconClass = 'bi-exclamation-octagon-fill';
        if (type === 'warning') iconClass = 'bi-exclamation-triangle-fill';
        if (type === 'info') iconClass = 'bi-info-circle-fill';

        toast.innerHTML = '<div class="app-toast-icon"><i class="bi ' + iconClass + '"></i></div><div>' + message + '</div>';
        container.appendChild(toast);

        // Trigger animation entry
        setTimeout(() => toast.classList.add('show'), 50);

        // Auto remove after 2 seconds
        setTimeout(() => {
          toast.classList.remove('show');
          toast.classList.add('hide');
          setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
          }, 350);
        }, duration);
      }

      // Tampilkan Flash Toast HANYA jika URL mengandung ?flash= (aksi nyata, bukan login otomatis)
      document.addEventListener('DOMContentLoaded', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const flashParam = urlParams.get('flash');

        if (flashParam && flashParam.trim()) {
          // Tentukan tipe berdasarkan isi pesan
          let msgType = 'success';
          const lowerMsg = flashParam.toLowerCase();
          if (lowerMsg.includes('gagal') || lowerMsg.includes('error') || lowerMsg.includes('ditolak')) msgType = 'danger';
          else if (lowerMsg.includes('perhatian') || lowerMsg.includes('pilih') || lowerMsg.includes('tidak ditemukan')) msgType = 'warning';
          else if (lowerMsg.includes('info')) msgType = 'info';

          showToast(flashParam, msgType, 2500);

          // Bersihkan ?flash= dari URL bar agar tidak muncul lagi saat refresh
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        }

        // Sembunyikan semua alert statis Bootstrap yang mungkin masih muncul
        const alerts = document.querySelectorAll('.alert-dismissible');
        alerts.forEach(alert => alert.remove());
      });

      // Global Helper: Hapus Dokumen Siswa dari Cloudflare R2 + Cloudflare D1 (Menggunakan Custom Confirm & Alert)
      async function deleteStudentDocument(studentId, docType, docLabel) {
        const confirmed = await window.customConfirm(
          'Apakah Anda yakin ingin menghapus ' + docLabel + '? Berkas akan dihapus secara permanen dari Cloudflare R2 Object Storage dan database Cloudflare D1.',
          'Konfirmasi Hapus Dokumen',
          'Ya, Hapus',
          'btn-danger'
        );
        if (!confirmed) {
          return;
        }

        try {
          const res = await fetch('/api/students/' + studentId + '/documents/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ doc_type: docType })
          });
          const data = await res.json();

          if (data.success) {
            showToast(data.message || 'Dokumen berhasil dihapus dari Cloudflare R2 & D1.', 'success', 2500);
            setTimeout(() => location.reload(), 600);
          } else {
            await window.customAlert('Gagal Menghapus: ' + (data.message || 'Terjadi kesalahan.'), 'Kesalahan');
            showToast(data.message || 'Gagal menghapus.', 'danger', 3000);
          }
        } catch (err) {
          console.error(err);
          await window.customAlert('Terjadi kesalahan jaringan saat menghapus dokumen.', 'Kesalahan Jaringan');
        }
      }
    </script>

    <!-- Mobile & Desktop Sidebar Toggle & Auto-State Handler -->
    <script>
      (function() {
        document.addEventListener('DOMContentLoaded', function() {
          const body = document.body;
          const toggleBtns = document.querySelectorAll('[data-lte-toggle="sidebar"], #sidebarToggleBtn');
          
          // Load stored sidebar preference for desktop
          const savedState = localStorage.getItem('portal_sidebar_collapsed');
          if (savedState === 'true' && window.innerWidth > 991) {
            body.classList.add('sidebar-collapse');
          }

          let backdrop = document.getElementById('sidebarBackdrop');
          if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'sidebarBackdrop';
            backdrop.className = 'sidebar-backdrop';
            document.body.appendChild(backdrop);
          }

          function toggleSidebar(e) {
            if (e) {
              e.preventDefault();
              e.stopPropagation();
            }

            if (window.innerWidth <= 991) {
              // Mobile drawer mode
              body.classList.toggle('sidebar-open');
            } else {
              // Desktop collapse mode
              body.classList.toggle('sidebar-collapse');
              const isCollapsed = body.classList.contains('sidebar-collapse');
              localStorage.setItem('portal_sidebar_collapsed', isCollapsed);
            }
          }

          function closeSidebar() {
            body.classList.remove('sidebar-open');
          }

          toggleBtns.forEach(function(btn) {
            btn.addEventListener('click', toggleSidebar);
            btn.addEventListener('touchstart', function(e) {
              toggleSidebar(e);
            }, { passive: false });
          });

          if (backdrop) {
            backdrop.addEventListener('click', closeSidebar);
            backdrop.addEventListener('touchstart', function(e) {
              closeSidebar();
            }, { passive: false });
          }

          // Close sidebar on mobile when navigating links
          const sidebarLinks = document.querySelectorAll('.app-sidebar .nav-link');
          sidebarLinks.forEach(function(link) {
            link.addEventListener('click', function() {
              if (window.innerWidth <= 991) {
                closeSidebar();
              }
            });
          });

          // Auto-Hide Header & Footer on Scroll Down & Show on Scroll Up
          let lastScrollY = window.scrollY;
          const header = document.querySelector('.app-header');
          const footer = document.querySelector('.app-footer');

          window.addEventListener('scroll', function() {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
              if (header) header.classList.add('header-hidden');
              if (footer) footer.classList.add('footer-hidden');
            } else {
              if (header) header.classList.remove('header-hidden');
              if (footer) footer.classList.remove('footer-hidden');
            }
            lastScrollY = currentScrollY;
          }, { passive: true });
        });
      })();

      /**
       * Smart Photo & Image Compression Engine
       * Otomatis mendeteksi foto/gambar dengan ukuran > 1 MB (1,048,576 byte)
       * dan mengompresnya secara iteratif hingga di bawah ~500 KB (512,000 byte)
       * dengan tetap menjaga ketajaman dan rasio gambar.
       */
      async function compressPhotoFile(file, maxSizeBytes = 500 * 1024) {
        if (!file || !file.type || !file.type.startsWith('image/')) return file;
        
        const ONE_MB = 1024 * 1024;
        if (file.size <= ONE_MB) {
          // File di bawah atau sama dengan 1 MB sudah aman
          return file;
        }

        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = async () => {
              let width = img.width;
              let height = img.height;

              // Batas resolusi maks 1600px
              const maxDim = 1600;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }

              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);

              let quality = 0.85;
              let compressedBlob = null;
              let attempts = 0;

              while (attempts < 6) {
                compressedBlob = await new Promise((resBlob) => {
                  canvas.toBlob(resBlob, 'image/jpeg', quality);
                });

                if (!compressedBlob) break;

                if (compressedBlob.size <= maxSizeBytes || quality <= 0.40) {
                  break;
                }

                quality -= 0.12;
                if (quality < 0.55) {
                  width = Math.round(width * 0.85);
                  height = Math.round(height * 0.85);
                  canvas.width = width;
                  canvas.height = height;
                  ctx.drawImage(img, 0, 0, width, height);
                }
                attempts++;
              }

              if (!compressedBlob) {
                resolve(file);
                return;
              }

              const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            };
            img.onerror = () => resolve(file);
          };
          reader.onerror = () => resolve(file);
        });
      }

      // Alias kompatibilitas
      async function compressImageFile(file, maxWidth = 1600, maxHeight = 1600, quality = 0.75) {
        return await compressPhotoFile(file, 500 * 1024);
      }

      // Handler Otomatis Kompresi saat Pemilihan File & Pengiriman Form
      document.addEventListener('DOMContentLoaded', function() {
        // Event Listener saat user memilih file pada input ber-type file
        document.addEventListener('change', async function(e) {
          const input = e.target;
          if (input && input.type === 'file' && input.files && input.files[0]) {
            const file = input.files[0];
            if (file.type && file.type.startsWith('image/') && file.size > 1024 * 1024) {
              const originalMb = (file.size / (1024 * 1024)).toFixed(2);
              
              if (typeof showToast === 'function') {
                showToast('Foto (' + originalMb + ' MB > 1MB) sedang dikompresi ke < 500KB...', 'info', 2500);
              }

              try {
                const compressed = await compressPhotoFile(file, 500 * 1024);
                const compressedKb = Math.round(compressed.size / 1024);
                
                const dt = new DataTransfer();
                dt.items.add(compressed);
                input.files = dt.files;

                if (typeof showToast === 'function') {
                  showToast('Foto berhasil dikompresi: ' + originalMb + ' MB,'+ compressedKb + ' KB', 'success', 3500);
                }
              } catch(err) {
                console.error('Auto compression failed:', err);
              }
            }
          }
        });

        // Intercept Form Submissions dengan class auto-compress-form atau upload photo
        document.querySelectorAll('form.auto-compress-form, form[action*="upload-photo"]').forEach(function(form) {
          form.addEventListener('submit', async function(e) {
            const fileInputs = form.querySelectorAll('input[type="file"]');
            let hasBigFile = false;

            fileInputs.forEach(input => {
              if (input.files && input.files[0] && input.files[0].type && input.files[0].type.startsWith('image/') && input.files[0].size > 1024 * 1024) {
                hasBigFile = true;
              }
            });

            if (hasBigFile) {
              e.preventDefault();
              const statusDiv = form.querySelector('.upload-compress-status');
              const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');

              if (statusDiv) statusDiv.classList.remove('d-none');
              if (submitBtn) submitBtn.disabled = true;

              try {
                for (const input of fileInputs) {
                  if (input.files && input.files[0] && input.files[0].type && input.files[0].type.startsWith('image/') && input.files[0].size > 1024 * 1024) {
                    const compressed = await compressPhotoFile(input.files[0], 500 * 1024);
                    const dt = new DataTransfer();
                    dt.items.add(compressed);
                    input.files = dt.files;
                  }
                }
              } catch(err) {
                console.error('Submit compression error:', err);
              }

              form.submit();
            }
          });
        });
      });
    </script>

    <!-- Real-time Heartbeat & Online Tracker Script -->
    <script>
      (function() {
        let isFetching = false;
        async function sendHeartbeat() {
          try {
            await fetch('/api/heartbeat', { method: 'POST' });
          } catch (e) {}
        }

        async function fetchOnlineUsers() {
          if (isFetching) return;
          isFetching = true;
          try {
            const res = await fetch('/api/online-users');
            if (res.ok) {
              const data = await res.json();
              const count = data.count || 0;
              const users = data.users || [];

              const navCountEl = document.getElementById('onlineUsersCountNav');
              if (navCountEl) navCountEl.textContent = count + ' Online';

              const containerEl = document.getElementById('onlineUsersListContainer');
              if (containerEl) {
                if (users.length === 0) {
                  containerEl.innerHTML = '<div class="text-center py-4 text-muted"><i class="bi bi-person-x fs-2 d-block mb-1"></i>Tidak ada pengguna online</div>';
                } else {
                  let html = '';
                  users.forEach(function(u) {
                    let badgeColor = u.user_role === 'admin' ? 'bg-danger' : (u.user_role === 'guru' ? 'bg-primary' : 'bg-success');
                    let defaultSvg = "${DEFAULT_AVATAR}";
                    let avatar = u.avatar_url || defaultSvg;
                    html += '<div class="list-group-item border rounded-3 p-2 d-flex align-items-center justify-content-between shadow-sm">' +
                              '<div class="d-flex align-items-center gap-3">' +
                                '<div class="position-relative">' +
                                  '<img src="' + avatar + '" class="rounded-circle border" style="width: 42px; height: 42px; object-fit: cover;" alt="Avatar ' + u.user_name + '" />' +
                                  '<span class="position-absolute bottom-0 end-0 p-1 bg-success border border-light rounded-circle">' +
                                    '<span class="visually-hidden">Online</span>' +
                                  '</span>' +
                                '</div>' +
                                '<div>' +
                                  '<h6 class="mb-0 fw-bold text-dark">' + u.user_name + '</h6>' +
                                  '<small class="text-muted">ID: ' + u.user_id + '</small>' +
                                '</div>' +
                              '</div>' +
                              '<div class="text-end">' +
                                '<span class="badge ' + badgeColor + ' fw-semibold rounded-pill px-2.5 py-1">' + u.user_role.toUpperCase() + '</span>' +
                                '<div class="small text-success mt-1 fw-semibold" style="font-size: 11px;">' +
                                  '<i class="bi bi-circle-fill me-1" style="font-size: 7px;"></i>Online Now' +
                                '</div>' +
                              '</div>' +
                            '</div>';
                  });
                  containerEl.innerHTML = html;
                }
              }

              const dashWidgetCount = document.getElementById('dashOnlineUsersCount');
              if (dashWidgetCount) dashWidgetCount.textContent = count;

              const dashWidgetList = document.getElementById('dashOnlineUsersList');
              if (dashWidgetList && containerEl) {
                dashWidgetList.innerHTML = containerEl.innerHTML;
              }

              const lastUpdatedText = document.getElementById('lastUpdatedOnlineText');
              if (lastUpdatedText) {
                const now = new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jayapura', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                lastUpdatedText.textContent = 'Diperbarui otomatis: ' + now;
              }
            }
          } catch(e) {
            console.error('Error updating online users:', e);
          } finally {
            isFetching = false;
          }
        }

        sendHeartbeat();
        fetchOnlineUsers();
        setInterval(sendHeartbeat, 15000);
        setInterval(fetchOnlineUsers, 8000);

        async function fetchReviewStats() {
          try {
            const res = await fetch('/api/document-reviews/stats');
            if (res.ok) {
              const data = await res.json();
              const badgeContainer = document.getElementById('sidebar-review-badge');
              if (badgeContainer) {
                let html = '';
                if (data.role === 'admin') {
                  if (data.pending_count > 0) {
                    html = '<span class="badge bg-warning text-dark px-2 rounded-pill font-monospace" style="font-size: 11px;" title="Ada ' + data.pending_count + ' dokumen menunggu review">' + data.pending_count + ' Baru</span>';
                  }
                } else if (data.role === 'guru') {
                  if (data.approved_count > 0) {
                    html += '<span class="badge bg-success px-1.5 py-0.5 rounded-pill font-monospace" style="font-size: 10px;" title="' + data.approved_count + ' dokumen disetujui">' + data.approved_count + '</span>';
                  }
                  if (data.rejected_count > 0) {
                    html += '<span class="badge bg-danger px-1.5 py-0.5 rounded-pill font-monospace" style="font-size: 10px;" title="' + data.rejected_count + ' dokumen ditolak">' + data.rejected_count + '</span>';
                  }
                }
                badgeContainer.innerHTML = html;
              }
            }
          } catch (e) {
            console.error('Error fetching review stats:', e);
          }
        }

        fetchReviewStats();
        setInterval(fetchReviewStats, 5000);

        // --------------------------------------------------
        // Client-side Inactivity & Tab Visibility Monitor (5 Min Timeout)
        // --------------------------------------------------
        (function() {
          const TIMEOUT_MS = 5 * 60 * 1000; // 5 Menit = 300.000 ms
          let inactivityTimer = null;
          let lastInteractionTime = Date.now();

          function triggerAutoLogout() {
            const msg = encodeURIComponent('Sesi Anda telah berakhir karena tidak aktif selama 5 menit.');
            window.location.href = '/logout?flash=' + msg;
          }

          function resetInactivityTimer() {
            lastInteractionTime = Date.now();
            if (inactivityTimer) clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(triggerAutoLogout, TIMEOUT_MS);
          }

          // Reset timer saat pengguna melakukan interaksi fisik
          ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(function(evt) {
            window.addEventListener(evt, resetInactivityTimer, { passive: true });
          });

          // Cek durasi inaktivitas saat tab browser dibuka kembali
          document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
              const elapsed = Date.now() - lastInteractionTime;
              if (elapsed >= TIMEOUT_MS) {
                triggerAutoLogout();
              } else {
                resetInactivityTimer();
              }
            }
          });

          resetInactivityTimer();
        })();
      })();
    </script>
  
    <!-- Real-time Sidebar Resizer & Mobile Toggle Engine -->
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // Mobile Sidebar Toggle Listener
        document.addEventListener('click', function(e) {
          const toggleBtn = e.target.closest('[data-lte-toggle="sidebar"], .btn-sidebar-toggle');
          if (toggleBtn) {
            e.preventDefault();
            if (window.innerWidth < 992) {
              document.body.classList.toggle('sidebar-open');
            } else {
              document.body.classList.toggle('sidebar-collapse');
            }
          } else if (document.body.classList.contains('sidebar-open') && !e.target.closest('.app-sidebar')) {
            // Close mobile sidebar if clicked outside
            document.body.classList.remove('sidebar-open');
          }
        });
      });
    </script>
    <!-- Real-time Sidebar Resizer Engine -->
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const resizer = document.getElementById('sidebarResizeHandle');
        if (!resizer) return;

        let isResizing = false;

        resizer.addEventListener('mousedown', function(e) {
          isResizing = true;
          document.body.classList.add('is-resizing');
          e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
          if (!isResizing) return;
          let newWidth = e.clientX;
          if (newWidth < 180) newWidth = 180;
          if (newWidth > 450) newWidth = 450;
          document.documentElement.style.setProperty('--sidebar-width', newWidth + 'px');
          document.documentElement.style.setProperty('--lte-sidebar-width', newWidth + 'px');
        });

        document.addEventListener('mouseup', function(e) {
          if (isResizing) {
            isResizing = false;
            document.body.classList.remove('is-resizing');
            const currentWidth = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width').trim();
            const parsed = parseInt(currentWidth, 10);
            if (!isNaN(parsed)) {
              localStorage.setItem('sidebarWidth', parsed);
            }
          }
        });
      });
    </script>

    ${renderGlobalModalHTML()}

    <script>
      ${renderGlobalModalJS()}
    </script>

  </body>
</html>`;
}