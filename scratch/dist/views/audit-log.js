import { formatWIT } from './helpers';
export function renderAuditLogPage(user, stats, logs, filters = {}) {
    const isSearch = filters.search || '';
    const isAction = filters.action || 'ALL';
    const isRole = filters.role || 'ALL';
    let logRowsHtml = '';
    if (logs.length === 0) {
        logRowsHtml = `
      <tr>
        <td colspan="8" class="text-center py-5 text-muted">
          <i class="bi bi-journal-x fs-1 text-secondary mb-2 d-block opacity-50"></i>
          <h6 class="fw-bold">Tidak ada data audit log</h6>
          <p class="small mb-0">Belum ada riwayat aktivitas yang sesuai dengan filter pencarian Anda.</p>
        </td>
      </tr>
    `;
    }
    else {
        logs.forEach((log, idx) => {
            let statusBadge = '';
            if (log.status === 'SUCCESS') {
                statusBadge = `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2.5 py-1 fw-bold"><i class="bi bi-check-circle-fill me-1"></i>BERHASIL</span>`;
            }
            else if (log.status === 'FAILED') {
                statusBadge = `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-2.5 py-1 fw-bold"><i class="bi bi-x-circle-fill me-1"></i>GAGAL</span>`;
            }
            else {
                statusBadge = `<span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-2.5 py-1 fw-bold"><i class="bi bi-info-circle-fill me-1"></i>INFO</span>`;
            }
            let roleBadge = '';
            const r = (log.user_role || '').toLowerCase();
            if (r === 'admin') {
                roleBadge = `<span class="badge bg-danger text-white rounded-pill px-2.5 py-1 fw-semibold">ADMIN</span>`;
            }
            else if (r === 'guru' || r === 'teacher') {
                roleBadge = `<span class="badge bg-primary text-white rounded-pill px-2.5 py-1 fw-semibold">GURU</span>`;
            }
            else if (r === 'siswa') {
                roleBadge = `<span class="badge bg-success text-white rounded-pill px-2.5 py-1 fw-semibold">SISWA</span>`;
            }
            else {
                roleBadge = `<span class="badge bg-secondary text-white rounded-pill px-2.5 py-1 fw-semibold">${(log.user_role || 'SYSTEM').toUpperCase()}</span>`;
            }
            let actionBadge = '';
            if (log.action === 'LOGIN_SUCCESS') {
                actionBadge = `<span class="fw-bold text-success"><i class="bi bi-box-arrow-in-right me-1"></i>Login Berhasil</span>`;
            }
            else if (log.action === 'LOGIN_FAILED') {
                actionBadge = `<span class="fw-bold text-danger"><i class="bi bi-shield-exclamation me-1"></i>Gagal Login</span>`;
            }
            else if (log.action === 'LOGOUT') {
                actionBadge = `<span class="fw-bold text-secondary"><i class="bi bi-box-arrow-right me-1"></i>Logout</span>`;
            }
            else {
                actionBadge = `<span class="fw-bold text-dark"><i class="bi bi-gear me-1"></i>${log.action}</span>`;
            }
            let formattedDate = log.created_at;
            try {
                const d = new Date(log.created_at + 'Z');
                formattedDate = formatWIT(d);
            }
            catch (e) { }
            logRowsHtml += `
        <tr>
          <td class="text-center fw-bold text-muted" style="width: 50px;">${idx + 1}</td>
          <td>
            <div class="fw-semibold text-dark">${formattedDate}</div>
            <small class="text-muted" style="font-size: 11px;">WIT (UTC+9)</small>
          </td>
          <td>
            <div class="fw-bold text-dark">${log.user_name || log.user_id || 'System'}</div>
            <small class="text-muted">ID: ${log.user_id || '-'}</small>
          </td>
          <td>${roleBadge}</td>
          <td>${actionBadge}</td>
          <td>${statusBadge}</td>
          <td>
            <div class="small fw-semibold text-dark"><i class="bi bi-globe me-1 text-primary"></i>${log.ip_address || '127.0.0.1'}</div>
            <small class="text-muted text-truncate d-inline-block" style="max-width: 180px;" title="${log.user_agent || '-'}">${log.user_agent || '-'}</small>
          </td>
          <td class="small text-secondary">${log.details || '-'}</td>
        </tr>
      `;
        });
    }
    return `
  <!-- Stat Boxes Row -->
  <div class="row g-3 mb-4">
    <div class="col-xl-3 col-md-6">
      <div class="small-box-custom" style="background: var(--primary-gradient);">
        <div class="inner">
          <h3>${stats.totalToday}</h3>
          <p class="mb-0 opacity-90 fw-semibold">Login Hari Ini</p>
        </div>
        <i class="bi bi-box-arrow-in-right icon-bg"></i>
      </div>
    </div>
    <div class="col-xl-3 col-md-6">
      <div class="small-box-custom" style="background: var(--warning-gradient);">
        <div class="inner">
          <h3>${stats.failedToday}</h3>
          <p class="mb-0 opacity-90 fw-semibold">Gagal Login Hari Ini</p>
        </div>
        <i class="bi bi-shield-slash icon-bg"></i>
      </div>
    </div>
    <div class="col-xl-3 col-md-6">
      <div class="small-box-custom" style="background: var(--success-gradient);">
        <div class="inner">
          <h3>${stats.onlineCount}</h3>
          <p class="mb-0 opacity-90 fw-semibold">User Online Saat Ini</p>
        </div>
        <i class="bi bi-broadcast icon-bg"></i>
      </div>
    </div>
    <div class="col-xl-3 col-md-6">
      <div class="small-box-custom" style="background: var(--info-gradient);">
        <div class="inner">
          <h3>${stats.totalLogs}</h3>
          <p class="mb-0 opacity-90 fw-semibold">Total Log Tercatat</p>
        </div>
        <i class="bi bi-journal-text icon-bg"></i>
      </div>
    </div>
  </div>

  <!-- Audit Log Filter Card -->
  <div class="card mb-4 border-0 shadow-sm">
    <div class="card-header bg-transparent py-3">
      <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
        <i class="bi bi-filter-circle text-primary"></i> Filter Log Aktivitas
      </h5>
    </div>
    <div class="card-body bg-light rounded-bottom-4">
      <form method="get" action="/audit-log" class="row g-3">
        <div class="col-md-4">
          <label class="form-label fw-semibold small text-secondary">Cari Pengguna / Detail</label>
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
            <input type="text" name="search" class="form-control border-start-0" placeholder="Ketik ID, Nama, atau IP..." value="${isSearch}" />
          </div>
        </div>
        <div class="col-md-3">
          <label class="form-label fw-semibold small text-secondary">Jenis Aksi / Event</label>
          <select name="action" class="form-select">
            <option value="ALL" ${isAction === 'ALL' ? 'selected' : ''}>-- Semua Aksi --</option>
            <option value="LOGIN_SUCCESS" ${isAction === 'LOGIN_SUCCESS' ? 'selected' : ''}>LOGIN SUCCESS</option>
            <option value="LOGIN_FAILED" ${isAction === 'LOGIN_FAILED' ? 'selected' : ''}>LOGIN FAILED</option>
            <option value="LOGOUT" ${isAction === 'LOGOUT' ? 'selected' : ''}>LOGOUT</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label fw-semibold small text-secondary">Filter Role</label>
          <select name="role" class="form-select">
            <option value="ALL" ${isRole === 'ALL' ? 'selected' : ''}>-- Semua Role --</option>
            <option value="admin" ${isRole === 'admin' ? 'selected' : ''}>ADMIN</option>
            <option value="guru" ${isRole === 'guru' ? 'selected' : ''}>GURU</option>
            <option value="siswa" ${isRole === 'siswa' ? 'selected' : ''}>SISWA</option>
          </select>
        </div>
        <div class="col-md-2 d-flex align-items-end gap-2">
          <button type="submit" class="btn btn-primary w-100 fw-semibold rounded-3">
            <i class="bi bi-search me-1"></i> Filter
          </button>
          <a href="/audit-log" class="btn btn-outline-secondary fw-semibold rounded-3" title="Reset Filter">
            <i class="bi bi-arrow-counterclockwise"></i>
          </a>
        </div>
      </form>
    </div>
  </div>

  <!-- Audit Log Table Card -->
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-transparent py-3 d-flex justify-content-between align-items-center">
      <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
        <i class="bi bi-shield-check text-info"></i> Riwayat Audit Log & Status Login
      </h5>
      <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1 fw-bold">
        ${logs.length} Data Ditampilkan
      </span>
    </div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th class="text-center">#</th>
              <th>Waktu</th>
              <th>Pengguna</th>
              <th>Role</th>
              <th>Aksi / Event</th>
              <th>Status</th>
              <th>IP & Browser</th>
              <th>Detail Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${logRowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `;
}
