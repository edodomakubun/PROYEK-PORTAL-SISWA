import { renderLayout } from './layout';
export function renderErrorPage(statusCode, title, message, errorDetails, user) {
    const isServer = statusCode >= 500;
    const isAuth = statusCode === 403 || statusCode === 401;
    let iconClass = 'bi-exclamation-triangle-fill text-danger';
    if (statusCode === 404) {
        iconClass = 'bi-file-earmark-x-fill text-warning';
    }
    else if (isAuth) {
        iconClass = 'bi-shield-lock-fill text-danger';
    }
    const detailsHtml = errorDetails ? `
    <div class="text-start mt-3">
      <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" type="button" data-bs-toggle="collapse" data-bs-target="#errorCollapse" aria-expanded="false" aria-controls="errorCollapse">
        <i class="bi bi-code-slash me-1"></i> Rincian Teknis
      </button>
      <div class="collapse mt-2" id="errorCollapse">
        <div class="alert alert-danger text-start font-monospace small bg-danger bg-opacity-10 border-danger border-opacity-25 p-3 rounded-3 mb-0 overflow-auto" style="max-height: 250px; white-space: pre-wrap; word-break: break-all;">
          ${errorDetails.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </div>
      </div>
    </div>
  ` : '';
    const backUrl = user ? (user.role === 'siswa' ? '/students/my-profile' : '/dashboard') : '/login';
    const backText = user ? 'Kembali ke Dashboard' : 'Kembali ke Login';
    const content = `
    <div class="container py-5 d-flex align-items-center justify-content-center" style="min-height: calc(100vh - 200px);">
      <div class="w-100" style="max-width: 580px;">
        <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
          <!-- Decorative Top Bar -->
          <div class="p-1" style="background: ${isServer ? 'var(--danger-gradient)' : (isAuth ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'var(--primary-gradient)')};"></div>
          
          <div class="card-body p-5 text-center">
            <!-- Icon -->
            <div class="mb-4">
              <span class="d-inline-flex align-items-center justify-content-center bg-light rounded-circle p-4 border border-light-subtle shadow-sm" style="width: 100px; height: 100px;">
                <i class="bi ${iconClass}" style="font-size: 3rem;"></i>
              </span>
            </div>

            <!-- Error Code Badge -->
            <span class="badge bg-secondary-subtle text-secondary px-3 py-1.5 rounded-pill fw-bold mb-3 border border-secondary-subtle">
              ERROR ${statusCode}
            </span>

            <!-- Title & Message -->
            <h3 class="fw-bold text-dark mb-3">${title}</h3>
            <p class="text-secondary mb-4 leading-relaxed">${message}</p>

            ${detailsHtml}

            <!-- Action Button -->
            <div class="mt-4 pt-2">
              <a href="${backUrl}" class="btn btn-primary rounded-pill px-4 py-2.5 fw-bold shadow-sm d-inline-flex align-items-center gap-2">
                <i class="bi bi-house-door-fill"></i> ${backText}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
    if (user) {
        return renderLayout(title, user, content, 'dashboard');
    }
    // Self-contained page for users who are not logged in / anonymous
    return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} | PORTAL SISWA</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>">
    <!-- Fonts & Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/source-sans-3@5.0.12/index.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
    <!-- AdminLTE (includes Bootstrap) -->
    <link rel="stylesheet" href="/css/adminlte.css" />
    <style>
      :root {
        --primary-gradient: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
        --danger-gradient: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      }
      body {
        background-color: #f1f5f9;
        font-family: 'Source Sans 3', sans-serif;
        color: #0f172a;
      }
      .card {
        background-color: #ffffff;
        border: 1px solid #cbd5e1;
      }
    </style>
  </head>
  <body>
    ${content}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  </body>
</html>`;
}
