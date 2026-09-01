import { DEFAULT_AVATAR } from './helpers';
export function renderDashboardPage(user, totalStudents, totalClasses, students = []) {
    let fatherAlive = 0;
    let fatherAlm = 0;
    let motherAlive = 0;
    let motherAlm = 0;
    let photoUploaded = 0;
    let akteUploaded = 0;
    let kkUploaded = 0;
    const studentIssuesList = [];
    students.forEach(s => {
        // Parent status
        if (s.is_father_alive === 0)
            fatherAlm++;
        else
            fatherAlive++;
        if (s.is_mother_alive === 0)
            motherAlm++;
        else
            motherAlive++;
        // Photo status
        if (s.photo_url)
            photoUploaded++;
        // Docs status
        const docs = s.uploaded_docs ? s.uploaded_docs.split(',') : [];
        if (docs.includes('akte_kelahiran'))
            akteUploaded++;
        if (docs.includes('kartu_keluarga'))
            kkUploaded++;
        // Check issues & categorizations
        const issues = [];
        const categories = [];
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
    // Percentage Calculations for Infographics
    const photoPercent = totalStudents > 0 ? Math.round((photoUploaded / totalStudents) * 100) : 0;
    const aktePercent = totalStudents > 0 ? Math.round((akteUploaded / totalStudents) * 100) : 0;
    const kkPercent = totalStudents > 0 ? Math.round((kkUploaded / totalStudents) * 100) : 0;
    const totalPossibleDocs = totalStudents * 3;
    const totalUploadedDocs = photoUploaded + akteUploaded + kkUploaded;
    const overallPercent = totalPossibleDocs > 0 ? Math.round((totalUploadedDocs / totalPossibleDocs) * 100) : 0;
    // Circular gauge setup (radius = 40, circumference = 251.2)
    const circleRadius = 40;
    const circumference = 2 * Math.PI * circleRadius; // ~251.3
    const strokeDashoffset = circumference - (overallPercent / 100) * circumference;
    return `
  <style>
    /* Bento Grid Layout System */
    .bento-container {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .bento-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 1.25rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      gap: 1rem;
    }
    .bento-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px -8px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04);
      border-color: #cbd5e1;
    }
    
    /* Bento Item Spans */
    .bento-hero {
      grid-column: span 8;
      background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%);
      border: none;
      justify-content: space-between;
    }
    .bento-hero * {
      color: #ffffff !important;
    }
    .bento-hero .glow-effect {
      position: absolute;
      top: -20%;
      right: -10%;
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(255, 255, 255, 0) 70%);
      pointer-events: none;
    }
    
    .bento-stat-total {
      grid-column: span 4;
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      border: none;
      justify-content: space-between;
    }
    .bento-stat-total * {
      color: #ffffff !important;
    }
    .bento-stat-total .stat-icon {
      position: absolute;
      bottom: 10px;
      right: 15px;
      font-size: 5rem;
      opacity: 0.12;
    }
    
    .bento-infographics {
      grid-column: span 8;
    }
    .bento-shortcuts {
      grid-column: span 4;
    }
    .bento-online {
      grid-column: span 4;
    }
    .bento-problems {
      grid-column: span 8;
      justify-content: space-between;
    }
    
    @media (max-width: 992px) {
      .bento-hero, .bento-stat-total, .bento-infographics, .bento-shortcuts, .bento-online, .bento-problems {
        grid-column: span 12;
      }
    }
    
    /* Circular progress style */
    .progress-circle-wrapper {
      position: relative;
      width: 110px;
      height: 110px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .progress-circle-svg {
      transform: rotate(-90deg);
    }
    .progress-circle-text {
      position: absolute;
      font-size: 1.45rem;
      font-weight: 800;
      color: #1e293b;
    }
    
    /* Shortcut button layout */
    .shortcut-btn {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.85rem;
      text-decoration: none;
      color: #1e293b !important;
      font-weight: 600;
      transition: all 0.25s ease;
    }
    .shortcut-btn:hover {
      background: #eff6ff;
      border-color: #93c5fd;
      transform: translateX(4px);
      color: #2563eb !important;
    }
    .shortcut-btn i {
      font-size: 1.25rem;
      transition: transform 0.2s ease;
    }
    .shortcut-btn:hover i {
      transform: scale(1.15);
    }
    
    /* Online list height limit & custom scrollbar */
    .online-scroll-area {
      max-height: 220px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .online-scroll-area::-webkit-scrollbar {
      width: 4px;
    }
    .online-scroll-area::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }
    .online-scroll-area::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    .online-scroll-area::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    /* Hover scale for table items */
    .hover-primary:hover {
      color: #4f46e5 !important;
    }
  </style>

  <!-- BENTO GRID SYSTEM -->
  <div class="bento-container">
    
    <!-- 1. HERO CARD (span 8) -->
    <div class="bento-card bento-hero p-4">
      <div class="glow-effect"></div>
      <div class="d-flex flex-column justify-content-between h-100">
        <div>
          <span class="badge bg-white bg-opacity-20 text-white rounded-pill px-3 py-1 fw-bold small text-uppercase tracking-wider mb-2">
            ROLE: ${user.role.toUpperCase()}
          </span>
          <h3 class="fw-extrabold text-white mt-1 mb-2 fs-2">Selamat Datang, ${user.full_name || user.username}!</h3>
          <p class="text-white text-opacity-80 small mb-0" style="max-width: 520px;">
            Portal Sistem Informasi Data Siswa SD Inpres Lelingluan. Pantau kelengkapan berkas kependudukan, cetak kartu, dan validasi data secara realtime dan terstruktur.
          </p>
        </div>
        <div class="mt-4 pt-2 d-flex align-items-center gap-2">
          <i class="bi bi-shield-check-fill text-warning fs-5"></i>
          <span class="small text-white text-opacity-90 fw-semibold">Tips Hari Ini: Pastikan Anda secara berkala memeriksa menu Siswa Prioritas untuk kelengkapan data mendesak.</span>
        </div>
      </div>
    </div>

    <!-- 2. STAT TOTAL SISWA (span 4) -->
    <div class="bento-card bento-stat-total p-4">
      <i class="bi bi-people-fill stat-icon"></i>
      <div class="d-flex flex-column justify-content-between h-100">
        <div>
          <span class="text-white text-opacity-75 small fw-bold text-uppercase tracking-wider">Total Siswa Terdata</span>
          <h3 class="fw-extrabold text-white mt-2 fs-1">${totalStudents} <span class="fs-6 opacity-75">Siswa</span></h3>
        </div>
        <div class="mt-4 pt-2">
          <a href="/students" class="text-white text-decoration-none small fw-bold d-inline-flex align-items-center gap-1.5 border-bottom border-white border-opacity-20 pb-0.5">
            <span>Buka Data Siswa</span>
            <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- 3. INFOGRAFIS KEREN (span 8) -->
    <div class="bento-card bento-infographics">
      <div>
        <h5 class="fw-bold text-dark mb-1"><i class="bi bi-bar-chart-line-fill text-indigo-500 me-2 text-primary"></i> Infografis Kelengkapan Berkas</h5>
        <p class="text-muted small mb-0">Rasio kemajuan upload data & dokumen kependudukan siswa</p>
      </div>
      
      <div class="row align-items-center g-3 mt-1">
        <!-- Bulatan Progress Utama (Left Side) -->
        <div class="col-sm-4 d-flex flex-column align-items-center justify-content-center border-end py-2">
          <div class="progress-circle-wrapper">
            <svg class="progress-circle-svg" width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="${circleRadius}" fill="none" stroke="#f1f5f9" stroke-width="8"></circle>
              <circle cx="50" cy="50" r="${circleRadius}" fill="none" stroke="#4f46e5" stroke-width="8"
                      stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}"
                      transform="rotate(-90 50 50)"></circle>
            </svg>
            <div class="progress-circle-text">${overallPercent}%</div>
          </div>
          <span class="small fw-bold text-dark mt-2">Total Dokumen Terupload</span>
        </div>

        <!-- Linear Progress (Right Side) -->
        <div class="col-sm-8 px-4">
          <!-- Foto Profil -->
          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="small fw-semibold text-secondary"><i class="bi bi-camera me-1"></i> Foto Profil</span>
              <span class="small fw-bold text-primary">${photoUploaded} / ${totalStudents} (${photoPercent}%)</span>
            </div>
            <div class="progress rounded-pill" style="height: 8px; background-color: #f1f5f9;">
              <div class="progress-bar bg-primary rounded-pill" role="progressbar" style="width: ${photoPercent}%" aria-valuenow="${photoPercent}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>

          <!-- Akte Kelahiran -->
          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="small fw-semibold text-secondary"><i class="bi bi-file-earmark-text me-1"></i> Akte Kelahiran (AK)</span>
              <span class="small fw-bold text-success">${akteUploaded} / ${totalStudents} (${aktePercent}%)</span>
            </div>
            <div class="progress rounded-pill" style="height: 8px; background-color: #f1f5f9;">
              <div class="progress-bar bg-success rounded-pill" role="progressbar" style="width: ${aktePercent}%" aria-valuenow="${aktePercent}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>

          <!-- Kartu Keluarga -->
          <div class="mb-1">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="small fw-semibold text-secondary"><i class="bi bi-file-earmark-pdf me-1"></i> Kartu Keluarga (KK)</span>
              <span class="small fw-bold text-warning-emphasis">${kkUploaded} / ${totalStudents} (${kkPercent}%)</span>
            </div>
            <div class="progress rounded-pill" style="height: 8px; background-color: #f1f5f9;">
              <div class="progress-bar bg-warning rounded-pill" role="progressbar" style="width: ${kkPercent}%" aria-valuenow="${kkPercent}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. SHORTCUTS CARD (span 4) -->
    <div class="bento-card bento-shortcuts">
      <div>
        <h5 class="fw-bold text-dark mb-1"><i class="bi bi-lightning-charge-fill text-warning me-2"></i> Pintasan Cepat</h5>
        <p class="text-muted small mb-3">Navigasi pintasan langsung sesuai hak akses</p>
      </div>
      
      <div class="d-flex flex-column gap-2">
        ${user.role === 'admin' ? `
          <a href="/students" class="shortcut-btn">
            <i class="bi bi-people-fill text-primary"></i>
            <span>Data Siswa</span>
          </a>
          <a href="/document-reviews" class="shortcut-btn">
            <i class="bi bi-file-earmark-check-fill text-success"></i>
            <span>Review Dokumen</span>
          </a>
          <a href="/priority-students" class="shortcut-btn">
            <i class="bi bi-exclamation-triangle-fill text-warning"></i>
            <span>Siswa Prioritas</span>
          </a>
          <a href="/mutations" class="shortcut-btn">
            <i class="bi bi-person-x-fill text-danger"></i>
            <span>Mutasi Siswa</span>
          </a>
          <a href="/admin/settings" class="shortcut-btn">
            <i class="bi bi-sliders text-secondary"></i>
            <span>Setelan Sistem</span>
          </a>
        ` : ''}

        ${user.role === 'guru' ? `
          <a href="/students" class="shortcut-btn">
            <i class="bi bi-people-fill text-primary"></i>
            <span>Data Siswa</span>
          </a>
          <a href="/document-reviews" class="shortcut-btn">
            <i class="bi bi-file-earmark-check-fill text-success"></i>
            <span>Review Dokumen</span>
          </a>
          <a href="/priority-students" class="shortcut-btn">
            <i class="bi bi-exclamation-triangle-fill text-warning"></i>
            <span>Siswa Prioritas</span>
          </a>
          <a href="/mutations" class="shortcut-btn">
            <i class="bi bi-person-x-fill text-danger"></i>
            <span>Mutasi Siswa</span>
          </a>
          <a href="/admin/guide" class="shortcut-btn">
            <i class="bi bi-book-half text-info"></i>
            <span>Panduan Guru</span>
          </a>
        ` : ''}

        ${user.role === 'siswa' ? `
          <a href="/students/my-profile" class="shortcut-btn">
            <i class="bi bi-person-badge-fill text-primary"></i>
            <span>Profil Saya</span>
          </a>
          <a href="/students" class="shortcut-btn">
            <i class="bi bi-people-fill text-info"></i>
            <span>Daftar Siswa</span>
          </a>
        ` : ''}
      </div>
    </div>

    <!-- 5. TEMPAT KHUSUS ONLINE USERS (span 4) -->
    <div class="bento-card bento-online">
      <div>
        <div class="d-flex align-items-center justify-content-between mb-1">
          <h5 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <span class="spinner-grow spinner-grow-sm text-success" role="status" style="width: 10px; height: 10px;"></span>
            <span>Akun Online</span>
          </h5>
          <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2.5 py-1 fw-bold">
            <span id="dashOnlineUsersCount">0</span> Online
          </span>
        </div>
        <p class="text-muted small mb-2">Pengguna yang sedang aktif mengakses portal</p>
      </div>

      <!-- Online users loaded dynamically -->
      <div id="dashOnlineUsersList" class="online-scroll-area d-flex flex-column gap-2 mt-1">
        <div class="text-center py-4 text-muted">
          <div class="spinner-border spinner-border-sm text-success" role="status"></div>
          <span class="ms-2 small">Memuat data pengguna...</span>
        </div>
      </div>
      
      <div class="small text-muted mt-2 text-center" id="lastUpdatedOnlineText" style="font-size: 0.7rem; font-style: italic;"></div>
    </div>

    <!-- 6. DATA BERMASALAH SUMMARY (span 8) -->
    <div class="bento-card bento-problems">
      <div>
        <h5 class="fw-bold text-dark mb-1"><i class="bi bi-exclamation-triangle-fill text-warning me-2"></i> Siswa Data Belum Lengkap</h5>
        <p class="text-muted small mb-0">Tersedia ${totalIncomplete} baris siswa yang data/berkasnya memiliki masalah.</p>
      </div>

      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mt-4 pt-3 border-top w-100">
        <div class="d-flex align-items-center gap-3">
          <div class="fs-1 fw-extrabold text-danger" style="line-height: 1;">${totalIncomplete}</div>
          <div class="small fw-semibold text-secondary">Siswa memerlukan<br>tindakan perbaikan</div>
        </div>
        <div>
          <button type="button" class="btn btn-warning rounded-pill px-4 py-2.5 fw-bold shadow-sm d-inline-flex align-items-center gap-2 text-dark" 
                  data-bs-toggle="collapse" data-bs-target="#issueTableCollapse" aria-expanded="false" aria-controls="issueTableCollapse" id="toggleIssueTableBtn">
            <i class="bi bi-table"></i>
            <span id="toggleIssueBtnText">Tampilkan Tabel Masalah</span>
          </button>
        </div>
      </div>
    </div>

  </div>

  <!-- Collapsible Container for Issues Table -->
  <div class="collapse" id="issueTableCollapse">
    <div class="card p-0 mb-4 shadow-sm border-0 mt-2">
      <div class="card-header bg-transparent border-bottom p-3">
        <div class="d-flex align-items-center justify-content-between w-100 flex-wrap gap-2">
          <div class="d-flex flex-column">
            <h5 class="fw-bold m-0 text-dark d-flex align-items-center gap-2">
              <i class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
              <span>Rincian Siswa Data Belum Lengkap</span>
            </h5>
            <span class="text-muted small mt-1">Gunakan filter atau kolom pencarian untuk mempersempit daftar.</span>
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
  </div>

  <!-- Script Collapsible Table & Filters -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Toggle button text reactive to collapse state
      const collapseEl = document.getElementById('issueTableCollapse');
      const btnText = document.getElementById('toggleIssueBtnText');
      if (collapseEl && btnText) {
        collapseEl.addEventListener('show.bs.collapse', function () {
          btnText.textContent = 'Sembunyikan Tabel Masalah';
        });
        collapseEl.addEventListener('hide.bs.collapse', function () {
          btnText.textContent = 'Tampilkan Tabel Masalah';
        });
      }

      // Filter and Search script
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
