import { User, OnlineUser, Student } from '../types';
import { DEFAULT_AVATAR, formatWIT, formatWITDate } from './helpers';
import { renderLayout } from './layout';

export function renderDashboardPage(
  user: User,
  totalStudents: number,
  totalClasses: number,
  students: Student[] = []
): string {
  let fatherAlive = 0;
  let fatherAlm = 0;
  let motherAlive = 0;
  let motherAlm = 0;

  let photoUploaded = 0;
  let akteUploaded = 0;
  let kkUploaded = 0;

  const studentIssuesList: { student: Student; issues: string[]; categories: string[] }[] = [];

  students.forEach(s => {
    // Parent status
    if (s.is_father_alive === 0) fatherAlm++; else fatherAlive++;
    if (s.is_mother_alive === 0) motherAlm++; else motherAlive++;

    // Photo status
    if (s.photo_url) photoUploaded++;

    // Docs status
    const docs = s.uploaded_docs ? s.uploaded_docs.split(',') : [];
    if (docs.includes('akte_kelahiran')) akteUploaded++;
    if (docs.includes('kartu_keluarga')) kkUploaded++;

    // Check issues & categorizations
    const issues: string[] = [];
    const categories: string[] = [];

    if (!s.photo_url) {
      issues.push('Belum Upload Foto');
      categories.push('foto');
    }
    if (!docs.includes('akte_kelahiran')) {
      issues.push('Belum Upload Akte');
      categories.push('akte');
    }
    if (!docs.includes('kartu_keluarga')) {
      issues.push('Belum Upload KK');
      categories.push('kk');
    }
    if (!s.father_name || s.father_name.trim() === '') {
      issues.push('Nama Ayah Kosong');
      categories.push('ortu');
    }
    if (!s.mother_name || s.mother_name.trim() === '') {
      issues.push('Nama Ibu Kosong');
      categories.push('ortu');
    }
    if (!s.birth_place || !s.birth_date) {
      issues.push('Tempat/Tgl Lahir Kosong');
      categories.push('bio');
    }

    if (issues.length > 0) {
      studentIssuesList.push({ student: s, issues, categories });
    }
  });

  const totalIncomplete = studentIssuesList.length;

  return `
  <!-- Welcome Banner Atas -->
  <div class="card border-0 shadow-sm rounded-4 mb-4 text-white overflow-hidden" style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);">
    <div class="card-body p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div>
        <h4 class="fw-bold mb-1 text-white">Selamat Datang, ${user.full_name || user.username}!</h4>
        <p class="mb-0 text-white-50 small">Portal Sistem Informasi Data Siswa SD Inpres Lelingluan • Role: <span class="badge bg-white text-primary px-2 py-0.5 fw-bold">${user.role.toUpperCase()}</span></p>
      </div>
      <div class="d-flex gap-2">
        <a href="/students" class="btn btn-light rounded-pill px-4 fw-semibold shadow-sm text-primary">
          <i class="bi bi-people-fill me-1"></i> Data Siswa
        </a>
        ${(user.role === 'admin' || user.role === 'guru') ? `
        <a href="/document-reviews" class="btn btn-outline-light rounded-pill px-4 fw-semibold shadow-sm">
          <i class="bi bi-file-earmark-check me-1"></i> Review Dokumen
        </a>` : ''}
      </div>
    </div>
  </div>

  <!-- Stat Box Cards Row -->
  <div class="row g-3 mb-4">
    <!-- Stat Box 1: Total Siswa -->
    <div class="col-xl-3 col-md-6">
      <div class="small-box-custom" style="background: var(--primary-gradient);">
        <div class="inner">
          <h3>${totalStudents}</h3>
          <p class="mb-0 opacity-90 fw-semibold">Total Siswa Terdaftar</p>
        </div>
        <i class="bi bi-people-fill icon-bg"></i>
        <div class="mt-3 pt-2 border-top border-white border-opacity-25">
          <a href="/students" class="text-white text-decoration-none small fw-bold d-inline-flex align-items-center gap-1">
            <span>Lihat Semua Siswa</span> <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- Stat Box 2: Data Belum Lengkap / Bermasalah -->
    <div class="col-xl-3 col-md-6">
      <div class="small-box-custom" style="background: var(--warning-gradient);">
        <div class="inner">
          <h3>${totalIncomplete}</h3>
          <p class="mb-0 opacity-90 fw-semibold">Siswa Data Belum Lengkap</p>
        </div>
        <i class="bi bi-exclamation-triangle-fill icon-bg"></i>
        <div class="mt-3 pt-2 border-top border-white border-opacity-25">
          <a href="#perlu-perhatian" class="text-white text-decoration-none small fw-bold d-inline-flex align-items-center gap-1">
            <span>Lihat Daftar Masalah</span> <i class="bi bi-arrow-down"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- Stat Box 3: Status Orang Tua (Ayah & Ibu) -->
    <div class="col-xl-3 col-md-6">
      <div class="small-box-custom" style="background: var(--success-gradient);">
        <div class="inner">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="small opacity-95">Ayah: <strong>${fatherAlive}</strong> (${fatherAlm} Alm.)</span>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small opacity-95">Ibu: <strong>${motherAlive}</strong> (${motherAlm} Alm.)</span>
          </div>
          <p class="mb-0 opacity-90 fw-semibold">Status Orang Tua</p>
        </div>
        <i class="bi bi-person-heart icon-bg"></i>
        <div class="mt-3 pt-2 border-top border-white border-opacity-25">
          <span class="text-white small fw-bold"><i class="bi bi-check-circle-fill me-1"></i> Data Terverifikasi</span>
        </div>
      </div>
    </div>

    <!-- Stat Box 4: Rekap Upload Dokumen -->
    <div class="col-xl-3 col-md-6">
      <div class="small-box-custom" style="background: var(--info-gradient);">
        <div class="inner">
          <h3 class="fs-5 mb-1 text-white">
            <i class="bi bi-camera me-1"></i> Foto: ${photoUploaded}/${totalStudents}
          </h3>
          <p class="mb-0 opacity-90 small fw-semibold">
            <i class="bi bi-file-earmark-text me-1"></i> Akte: ${akteUploaded}/${totalStudents} | KK: ${kkUploaded}/${totalStudents}
          </p>
        </div>
        <i class="bi bi-cloud-upload-fill icon-bg"></i>
        <div class="mt-3 pt-2 border-top border-white border-opacity-25">
          <span class="text-white small fw-bold"><i class="bi bi-check-all me-1"></i> Status Upload Realtime</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Realtime Online Users Dashboard Card -->
  <div class="card p-0 mb-4 shadow-sm border-0">
    <div class="card-header bg-transparent border-bottom p-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
      <div class="d-flex align-items-center gap-2">
        <span class="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true"></span>
        <h5 class="fw-bold m-0 text-dark">Pengguna Online Realtime</h5>
      </div>
      <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1.5 fw-bold">
        <i class="bi bi-broadcast me-1"></i> <span id="dashOnlineUsersCount">1</span> Online Saat Ini
      </span>
    </div>
    <div class="card-body p-3">
      <div id="dashOnlineUsersList" class="d-grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
        <div class="text-center py-3 text-muted col-span-full">
          <div class="spinner-border spinner-border-sm text-success" role="status"></div>
          <span class="ms-2 small">Memuat daftar pengguna online...</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive Section: Data Siswa Perlu Perhatian / Belum Lengkap -->
  <div class="card p-0 mb-4 shadow-sm border-0" id="perlu-perhatian">
    <div class="card-header bg-transparent border-bottom p-3">
      <div class="d-flex align-items-center justify-content-between w-100 flex-wrap gap-2">
        <div class="d-flex flex-column">
          <h5 class="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
            <span>Data Siswa Perlu Perhatian</span>
          </h5>
          <span class="text-muted small mt-1">Daftar siswa dengan kelengkapan data atau dokumen yang belum diisi / diupload.</span>
        </div>
        <div class="ms-auto text-end">
          <span class="badge bg-warning bg-opacity-20 text-dark border border-warning border-opacity-50 rounded-pill px-3 py-2 fw-bold">
            <i class="bi bi-exclamation-circle-fill me-1 text-warning"></i> ${totalIncomplete} Siswa Bermasalah
          </span>
        </div>
      </div>
    </div>

    <!-- Compact Filter Bar & Search -->
    <div class="px-3 py-3 bg-light border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
      <div class="d-flex flex-wrap align-items-center gap-2">
        <span class="fw-semibold text-secondary small me-1"><i class="bi bi-funnel-fill text-primary me-1"></i> Filter Masalah:</span>
        <button type="button" class="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-semibold filter-btn active" data-filter="all">
          Semua (${totalIncomplete})
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 fw-semibold filter-btn" data-filter="foto">
          <i class="bi bi-camera me-1"></i> Belum Foto
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 fw-semibold filter-btn" data-filter="akte">
          <i class="bi bi-file-earmark-text me-1"></i> Belum Akte
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 fw-semibold filter-btn" data-filter="kk">
          <i class="bi bi-file-earmark-pdf me-1"></i> Belum KK
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 fw-semibold filter-btn" data-filter="ortu">
          <i class="bi bi-people me-1"></i> Ortu Kosong
        </button>
      </div>

      <div class="input-group input-group-sm" style="max-width: 260px;">
        <span class="input-group-text bg-white border-end-0 rounded-start-pill ps-3"><i class="bi bi-search text-muted"></i></span>
        <input type="text" id="dashboardSearchInput" class="form-control border-start-0 rounded-end-pill pe-3" placeholder="Cari nama / NISN..." />
      </div>
    </div>

    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0" style="min-width: 900px;">
          <thead class="bg-light text-secondary small">
            <tr>
              <th class="ps-3" style="width: 70px;">Foto</th>
              <th style="width: 28%;">Siswa & Kelas</th>
              <th style="width: 25%;">Status Orang Tua</th>
              <th>Rincian Data / Dokumen Belum Lengkap</th>
              <th style="width: 130px;" class="text-center pe-3">Aksi Direct</th>
            </tr>
          </thead>
          <tbody id="issueTableBody">
            ${studentIssuesList.length === 0 ? `
            <tr>
              <td colspan="5" class="text-center text-success py-5">
                <i class="bi bi-check-circle-fill fs-1 text-success d-block mb-2"></i>
                <span class="fw-bold fs-5 d-block">Semua Data Siswa Sudah Lengkap!</span>
                <span class="text-muted small">Tidak ada data atau dokumen siswa yang kosong.</span>
              </td>
            </tr>` : ''}

            ${studentIssuesList.map(item => `
            <tr class="issue-row" data-category="${item.categories.join(' ')}">
              <td class="ps-3">
                <img src="${item.student.photo_url || DEFAULT_AVATAR}" class="avatar-thumb" alt="Foto ${item.student.name}" style="width: 40px; height: 40px;" />
              </td>
              <td>
                <div class="fw-bold text-dark mb-0">
                  <a href="/students/${item.student.id}" class="text-decoration-none text-dark hover-primary">
                    ${item.student.name}
                  </a>
                </div>
                <div class="small text-muted d-flex align-items-center gap-2 mt-0.5">
                  <span>NISN: ${item.student.nisn || '-'}</span>
                  <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-0.5 rounded-pill">${item.student.class_name}</span>
                  ${item.student.status === 'tidak_bersekolah' ? '<span class="badge bg-dark text-white border border-secondary px-2 py-0.5 rounded-pill"><i class="bi bi-x-circle-fill me-1"></i>Tidak Bersekolah</span>' : ''}
                </div>
              </td>
              <td>
                <div class="small">
                  <div><span class="text-muted">Ayah:</span> <strong>${item.student.father_name || '-'}</strong> ${item.student.is_father_alive === 0 ? '<span class="badge-alm">(Alm.)</span>' : ''}</div>
                  <div><span class="text-muted">Ibu:</span> <strong>${item.student.mother_name || '-'}</strong> ${item.student.is_mother_alive === 0 ? '<span class="badge-alm">(Alm.)</span>' : ''}</div>
                </div>
              </td>
              <td>
                <div class="d-flex flex-wrap gap-1 align-items-center">
                  ${item.issues.map(iss => `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2.5 py-1 rounded-pill small fw-semibold"><i class="bi bi-x-circle-fill me-1"></i> ${iss}</span>`).join('')}
                </div>
              </td>
              <td class="text-center pe-3">
                <a href="/students/${item.student.id}" class="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1 shadow-sm">
                  <i class="bi bi-pencil-square"></i>
                  <span>Lengkapi</span>
                </a>
              </td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Vanilla JS Client-Side Filter & Search Script -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const filterBtns = document.querySelectorAll('.filter-btn');
      const searchInput = document.getElementById('dashboardSearchInput');
      const tableRows = document.querySelectorAll('#issueTableBody tr.issue-row');

      function applyFilters() {
        const activeBtn = document.querySelector('.filter-btn.active');
        const filter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
        const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

        tableRows.forEach(row => {
          const rowText = row.textContent.toLowerCase();
          const rowCategory = row.getAttribute('data-category') || '';

          const matchesSearch = !searchVal || rowText.includes(searchVal);
          const matchesFilter = filter === 'all' || rowCategory.includes(filter);

          if (matchesSearch && matchesFilter) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      }

      filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          filterBtns.forEach(b => {
            b.classList.remove('btn-primary', 'active');
            b.classList.add('btn-outline-secondary');
          });
          this.classList.remove('btn-outline-secondary');
          this.classList.add('btn-primary', 'active');
          applyFilters();
        });
      });

      if (searchInput) {
        searchInput.addEventListener('keyup', applyFilters);
      }
    });
  </script>

  <!-- User Role Info Card -->
  <div class="card p-3 mb-4 border-0 shadow-sm rounded-4">
    <div class="card-header bg-transparent border-bottom py-3">
      <h5 class="card-title fw-bold m-0"><i class="bi bi-shield-check text-primary me-2"></i> Informasi Hak Akses & Pengguna</h5>
    </div>
    <div class="card-body">
      <div class="alert alert-primary bg-primary bg-opacity-10 border-0 p-3 rounded-4 mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-primary text-white p-3 rounded-circle fs-4">
            <i class="bi bi-person-circle"></i>
          </div>
          <div>
            <h6 class="fw-bold mb-1">Halo, ${user.full_name || user.username}!</h6>
            <p class="mb-0 small text-secondary">Anda login sebagai <span class="badge bg-primary px-3 py-1 rounded-pill">${user.role.toUpperCase()}</span>.</p>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-4">
          <div class="p-3 border rounded-3 bg-light h-100">
            <h6 class="fw-bold text-dark mb-2"><i class="bi bi-key-fill text-warning me-1"></i> Akses Admin</h6>
            <p class="small text-muted mb-0">Full akses kelola data siswa, data orang tua, upload foto & dokumen legal.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 border rounded-3 bg-light h-100">
            <h6 class="fw-bold text-dark mb-2"><i class="bi bi-person-badge-fill text-info me-1"></i> Akses Guru</h6>
            <p class="small text-muted mb-0">Dapat melihat dan mengedit data siswa pada kelas walinya.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 border rounded-3 bg-light h-100">
            <h6 class="fw-bold text-dark mb-2"><i class="bi bi-person-fill text-success me-1"></i> Akses Siswa</h6>
            <p class="small text-muted mb-0">Dapat memantau data diri dan kelengkapan dokumen Akte Kelahiran & Kartu Keluarga.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}



