export function renderSetupAccountsPage(students, classesList, selectedClass, flash, teachers = [], isAdmin = false) {
    const classOptions = classesList.map(c => `<option value="${c}" ${c === selectedClass ? 'selected' : ''}>Kelas ${c}</option>`).join('');
    let tableRows = '';
    if (students.length === 0) {
        tableRows = `<tr><td colspan="6" class="text-center text-muted py-4"><i class="bi bi-inbox fs-2 d-block mb-2"></i>Tidak ada data siswa untuk kelas ini.</td></tr>`;
    }
    else {
        tableRows = students.map((s, i) => `
      <tr>
        <td class="text-center fw-semibold text-secondary">${i + 1}</td>
        <td class="fw-bold text-dark">${s.nipd || '-'}</td>
        <td class="text-muted">${s.nisn || '-'}</td>
        <td class="fw-semibold text-primary">${s.name}</td>
        <td>
          ${s.has_account
            ? '<span class="badge bg-success px-2.5 py-1 rounded-pill"><i class="bi bi-check-circle me-1"></i>Aktif</span>'
            : '<span class="badge bg-secondary px-2.5 py-1 rounded-pill"><i class="bi bi-dash-circle me-1"></i>Belum Aktif / Nonaktif</span>'}
        </td>
        <td class="text-center">
          ${!s.has_account && s.nipd ? `
            <form action="/admin/setup-accounts/set-default" method="POST" class="d-inline">
              <input type="hidden" name="student_id" value="${s.id}" />
              <input type="hidden" name="nipd" value="${s.nipd}" />
              <button type="submit" class="btn btn-sm btn-primary rounded-pill px-3 fw-bold shadow-sm" onclick="return confirm('Aktifkan Akun ini dengan Username & Password NIPD (${s.nipd})?');">
                <i class="bi bi-person-check-fill me-1"></i> Aktifkan Akun
              </button>
            </form>
          ` : s.has_account ? `
            <form action="/admin/setup-accounts/deactivate" method="POST" class="d-inline">
              <input type="hidden" name="student_id" value="${s.id}" />
              <input type="hidden" name="nipd" value="${s.nipd}" />
              <button type="submit" class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold shadow-sm" onclick="return confirm('Yakin ingin MENONAKTIFKAN akun siswa (${s.name}) ini? Siswa tidak akan bisa login lagi.');">
                <i class="bi bi-person-x-fill me-1"></i> Nonaktifkan Akun
              </button>
            </form>
          ` : `
            <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold" disabled title="NIPD Kosong, tidak bisa set akun otomatis.">
              <i class="bi bi-exclamation-circle me-1"></i> NIPD Kosong
            </button>
          `}
        </td>
      </tr>
    `).join('');
    }
    const teacherRows = (teachers || []).map((t, i) => {
        const activeBtn = t.is_document_reviewer === 1
            ? `<button type="submit" class="btn btn-sm btn-success rounded-pill px-3 shadow-sm" onclick="return confirm('Cabut akses Reviewer dari Guru ini?');">
           <i class="bi bi-toggle-on fs-5 align-middle me-1"></i> Aktif
         </button>`
            : `<button type="submit" class="btn btn-sm btn-secondary rounded-pill px-3 shadow-sm" onclick="return confirm('Berikan akses Reviewer Dokumen pada Guru ini?');">
           <i class="bi bi-toggle-off fs-5 align-middle me-1"></i> Nonaktif
         </button>`;
        return `
      <tr>
        <td>${i + 1}</td>
        <td class="fw-bold">${t.username}</td>
        <td>${t.full_name || '-'}</td>
        <td class="text-center">
          <form action="/api/admin/teachers/${t.id}/reviewer" method="POST" class="d-inline">
            <input type="hidden" name="is_document_reviewer" value="${t.is_document_reviewer === 1 ? '0' : '1'}" />
            ${activeBtn}
          </form>
        </td>
      </tr>
    `;
    }).join('');
    const teacherSection = (isAdmin && teachers && teachers.length > 0) ? `
    <!-- Tab Guru / Admin Section -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 mt-4">
      <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h5 class="card-title fw-bold text-dark mb-0">
          <i class="bi bi-person-badge text-primary me-2"></i>Pengaturan Akses Guru (Reviewer Dokumen)
        </h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th width="10%">No</th>
                <th width="30%">Username / NIP</th>
                <th width="40%">Nama Lengkap</th>
                <th width="20%" class="text-center">Aksi Reviewer</th>
              </tr>
            </thead>
            <tbody>
              ${teachers.length === 0 ? '<tr><td colspan="4" class="text-center">Belum ada data guru.</td></tr>' : teacherRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ` : '';
    return `
    ${flash ? `<div class="alert alert-info py-2 px-3 rounded-3 shadow-sm mb-4"><i class="bi bi-info-circle me-2"></i>${flash}</div>` : ''}

    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h5 class="card-title fw-bold text-dark mb-0">
          <i class="bi bi-person-gear text-primary me-2"></i>Setup Akun Default Siswa
        </h5>
      </div>
      <div class="card-body">
        <div class="alert alert-warning py-3 px-4 rounded-3 d-flex gap-3 mb-4">
          <i class="bi bi-exclamation-triangle-fill fs-3 text-warning"></i>
          <div>
            <h6 class="fw-bold mb-1">Informasi Penting</h6>
            <p class="mb-0 small text-dark">
              Halaman ini digunakan untuk mengaktifkan akun Login bagi Siswa secara otomatis.
              Jika tombol <strong>"Set Akun Default"</strong> ditekan, maka <strong>Username</strong> dan <strong>Password</strong> siswa akan menggunakan nomor <strong>NIPD</strong> mereka masing-masing.
            </p>
          </div>
        </div>

        <!-- Filter Form -->
        <form action="/admin/setup-accounts" method="GET" class="row g-2 align-items-center mb-4">
          <div class="col-auto">
            <label class="col-form-label fw-bold text-secondary">Filter Kelas:</label>
          </div>
          <div class="col-auto">
            <select name="class_name" class="form-select rounded-pill" onchange="this.form.submit()">
              <option value="">-- Pilih Kelas --</option>
              ${classOptions}
            </select>
          </div>
          ${selectedClass && students.length > 0 && students.some((s) => !s.has_account && s.nipd) ? `
          <div class="col-auto ms-auto">
            <button type="submit" form="setAllClassForm" class="btn btn-primary rounded-pill fw-bold shadow-sm" onclick="return confirm('Aktifkan akun default untuk SELURUH siswa kelas ${selectedClass} yang belum memiliki akun?');">
              <i class="bi bi-magic me-1"></i> Aktifkan Semua (Kelas ${selectedClass})
            </button>
          </div>
          ` : ''}
        </form>

        <!-- Hidden Form for Mass Setup -->
        <form id="setAllClassForm" action="/admin/setup-accounts/set-default-class" method="POST" class="d-none">
          <input type="hidden" name="class_name" value="${selectedClass}" />
        </form>

        <!-- Table -->
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-center" width="5%">No</th>
                <th width="15%">NIPD</th>
                <th width="15%">NISN</th>
                <th width="35%">Nama Siswa</th>
                <th width="15%">Status Akun</th>
                <th class="text-center" width="15%">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    ${teacherSection}
  `;
}
