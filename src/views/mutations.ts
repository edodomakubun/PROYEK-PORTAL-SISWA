import { StudentMutation, Student, User } from '../types';
import { formatWITDate } from './helpers';

export function renderMutationsPage(
  mutations: StudentMutation[],
  activeStudents: Student[],
  user: User,
  flashMessage: string = ''
): string {
  const userRole = user.role;
  const homeroomClass = user.homeroom_class;
  
  let countPindah = 0;
  let countTidakBersekolah = 0;
  let countPending = 0;
  let countApproved = 0;
  let countRejected = 0;
  let countCancelled = 0;

  const pendingMutations: StudentMutation[] = [];
  const historyMutations: StudentMutation[] = [];

  mutations.forEach(m => {
    if (m.status === 'pending') {
      countPending++;
      pendingMutations.push(m);
    } else {
      historyMutations.push(m);
    }

    if (m.status === 'approved') countApproved++;
    else if (m.status === 'rejected') countRejected++;
    else if (m.status === 'cancelled') countCancelled++;

    if (m.mutation_type === 'pindah_sekolah') countPindah++;
    else if (m.mutation_type === 'tidak_bersekolah') countTidakBersekolah++;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return `
  <style>
    /* Bento Grid Modern Layout */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1rem;
      margin-bottom: 1.75rem;
    }
    .bento-card {
      border-radius: 20px;
      padding: 1.35rem 1.5rem;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(226, 232, 240, 0.8);
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .bento-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
    }
    
    .bento-hero {
      grid-column: span 4;
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
      color: #ffffff;
    }
    .bento-hero .bento-icon-bg {
      position: absolute;
      right: -10px;
      bottom: -15px;
      font-size: 6.5rem;
      opacity: 0.15;
      color: #ffffff;
      pointer-events: none;
    }
    
    .bento-pending {
      grid-column: span 3;
      background: linear-gradient(135deg, #fffbe6 0%, #fef3c7 100%);
      border: 1px solid #fde68a !important;
      color: #78350f;
    }
    .bento-pending .bento-icon-bg {
      position: absolute;
      right: -8px;
      bottom: -10px;
      font-size: 5.5rem;
      opacity: 0.18;
      color: #d97706;
      pointer-events: none;
    }
    
    .bento-pindah {
      grid-column: span 3;
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
      border: 1px solid #7dd3fc !important;
      color: #0c4a6e;
    }
    .bento-pindah .bento-icon-bg {
      position: absolute;
      right: -8px;
      bottom: -10px;
      font-size: 5.5rem;
      opacity: 0.20;
      color: #0284c7;
      pointer-events: none;
    }

    .bento-tidak {
      grid-column: span 2;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid #334155 !important;
      color: #ffffff;
    }
    .bento-tidak .bento-icon-bg {
      position: absolute;
      right: -8px;
      bottom: -10px;
      font-size: 5rem;
      opacity: 0.20;
      color: #ffffff;
      pointer-events: none;
    }

    @media (max-width: 1199.98px) {
      .bento-hero { grid-column: span 6; }
      .bento-pending { grid-column: span 6; }
      .bento-pindah { grid-column: span 6; }
      .bento-tidak { grid-column: span 6; }
    }
    @media (max-width: 767.98px) {
      .bento-hero, .bento-pending, .bento-pindah, .bento-tidak {
        grid-column: span 12;
      }
    }

    /* Filter Nav Pills */
    .filter-pill-btn {
      border: 1px solid #cbd5e1;
      background-color: #ffffff;
      color: #475569;
      font-weight: 600;
      font-size: 0.85rem;
      padding: 0.4rem 0.9rem;
      border-radius: 50px;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .filter-pill-btn:hover {
      background-color: #f1f5f9;
      color: #0f172a;
    }
    .filter-pill-btn.active {
      background-color: #4f46e5;
      border-color: #4f46e5;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
    }
  </style>

  ${flashMessage ? `
  <div class="alert alert-success alert-dismissible fade show rounded-4 shadow-sm border-0 mb-3" role="alert" style="background: linear-gradient(135deg, #10b98115 0%, #05966908 100%); border-left: 4px solid #10b981 !important;">
    <div class="d-flex align-items-center gap-2">
      <i class="bi bi-check-circle-fill text-success fs-5"></i>
      <span class="fw-semibold text-dark">${flashMessage}</span>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>` : ''}

  <!-- Bento Grid Header Statistics -->
  <div class="bento-grid">
    <!-- Hero Card: Total Mutasi -->
    <div class="bento-card bento-hero">
      <i class="bi bi-person-x-fill bento-icon-bg"></i>
      <div>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="badge bg-white bg-opacity-20 text-white rounded-pill px-3 py-1 fw-bold fs-7">
            <i class="bi bi-bar-chart-fill me-1"></i> Total Rekapitulasi
          </span>
          <span class="small opacity-75">Statistik Mutasi</span>
        </div>
        <h2 class="display-6 fw-extrabold m-0 text-white">${mutations.length}</h2>
        <p class="mb-0 opacity-90 fw-semibold small">Total Pengajuan Mutasi Siswa</p>
      </div>
      <div class="mt-3 pt-2 border-top border-white border-opacity-25 d-flex align-items-center justify-content-between small">
        <span class="opacity-80"><i class="bi bi-check2-all me-1"></i>Selesai: ${countApproved}</span>
        <span class="opacity-80"><i class="bi bi-x-lg me-1"></i>Ditolak: ${countRejected}</span>
      </div>
    </div>

    <!-- Card 2: Menunggu Persetujuan (Pending) -->
    <div class="bento-card bento-pending">
      <i class="bi bi-clock-history bento-icon-bg"></i>
      <div>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="badge bg-warning text-dark border border-warning border-opacity-50 rounded-pill px-2.5 py-1 fw-bold fs-7">
            <i class="bi bi-hourglass-split me-1"></i> Pending
          </span>
          ${countPending > 0 ? '<span class="spinner-grow spinner-grow-sm text-warning" role="status"></span>' : ''}
        </div>
        <h2 class="display-6 fw-extrabold m-0" style="color: #78350f;">${countPending}</h2>
        <p class="mb-0 fw-semibold small" style="color: #92400e;">Menunggu Persetujuan Admin</p>
      </div>
      <div class="mt-3 pt-2 border-top border-warning border-opacity-50 small fw-semibold" style="color: #78350f;">
        ${countPending > 0 ? '<i class="bi bi-exclamation-circle-fill text-warning me-1"></i> Memerlukan Verifikasi' : '<i class="bi bi-check-circle-fill text-success me-1"></i> Semua Pengajuan Diproses'}
      </div>
    </div>

    <!-- Card 3: Pindah Sekolah -->
    <div class="bento-card bento-pindah">
      <i class="bi bi-box-arrow-right bento-icon-bg"></i>
      <div>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="badge bg-info text-white rounded-pill px-2.5 py-1 fw-bold fs-7">
            <i class="bi bi-building me-1"></i> Pindah
          </span>
        </div>
        <h2 class="display-6 fw-extrabold m-0" style="color: #0c4a6e;">${countPindah}</h2>
        <p class="mb-0 fw-semibold small" style="color: #0369a1;">Mutasi Pindah Sekolah</p>
      </div>
      <div class="mt-3 pt-2 border-top border-info border-opacity-50 small fw-semibold" style="color: #0c4a6e;">
        <i class="bi bi-arrow-right-short me-1"></i>Ke Sekolah Lain
      </div>
    </div>

    <!-- Card 4: Tidak Bersekolah -->
    <div class="bento-card bento-tidak">
      <i class="bi bi-dash-circle-fill bento-icon-bg"></i>
      <div>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="badge bg-secondary text-white rounded-pill px-2.5 py-1 fw-bold fs-7">
            <i class="bi bi-x-circle me-1"></i> Putus Sekolah
          </span>
        </div>
        <h2 class="display-6 fw-extrabold m-0 text-white">${countTidakBersekolah}</h2>
        <p class="mb-0 opacity-80 fw-semibold small text-white-50">Tidak Bersekolah</p>
      </div>
      <div class="mt-3 pt-2 border-top border-secondary border-opacity-50 small text-white-50">
        <i class="bi bi-person-dash me-1"></i>Non-Aktif Permanen
      </div>
    </div>
  </div>

  <!-- TABEL 1: MUTASI MENUNGGU PERSETUJUAN (PENDING) -->
  <div class="card border-0 rounded-4 shadow-sm mb-4" style="border-top: 4px solid #f59e0b !important;">
    <div class="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
      <div class="d-flex align-items-center gap-2.5">
        <div class="p-2 rounded-3 bg-warning bg-opacity-15 text-warning d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
          <i class="bi bi-hourglass-split fs-5" style="color: #d97706;"></i>
        </div>
        <div>
          <h5 class="fw-bold m-0 text-dark">Pengajuan Mutasi Menunggu Persetujuan</h5>
          <p class="text-muted mb-0 small">Daftar pengajuan mutasi siswa dari Guru yang membutuhkan verifikasi Admin</p>
        </div>
      </div>
      <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold border border-warning border-opacity-50">
        <i class="bi bi-clock-history me-1"></i> ${pendingMutations.length} Pending
      </span>
    </div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-dark fw-bold">
            <tr>
              <th class="text-center" style="width: 50px;">No</th>
              <th style="width: 120px;">Tgl Pengajuan</th>
              <th>Nama Siswa</th>
              <th style="width: 90px;">Kelas</th>
              <th>NISN / NIK</th>
              <th>Jenis Mutasi</th>
              <th>Sekolah Tujuan / Alasan</th>
              <th class="text-center" style="width: 220px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${pendingMutations.length === 0 ? `
            <tr>
              <td colspan="8" class="text-center py-5">
                <div class="py-3">
                  <i class="bi bi-check-circle-fill text-success display-6 d-block mb-2 opacity-75"></i>
                  <p class="fw-semibold text-dark mb-0">Tidak Ada Pengajuan Pending</p>
                  <span class="text-muted small">Semua pengajuan mutasi siswa telah diverifikasi atau diproses.</span>
                </div>
              </td>
            </tr>
            ` : ''}

            ${pendingMutations.map((m, i) => `
            <tr>
              <td class="text-center fw-bold text-muted">${i + 1}</td>
              <td><span class="fw-semibold text-dark">${formatWITDate(m.mutation_date)}</span></td>
              <td>
                <div class="fw-bold text-dark fs-6">${m.student_name || '-'}</div>
                <div class="small text-muted">NIPD: ${m.nipd || '-'}</div>
              </td>
              <td><span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 rounded-pill">${m.class_name || '-'}</span></td>
              <td>
                <div class="small fw-semibold text-dark">NISN: ${m.nisn || '-'}</div>
                <div class="small text-muted">NIK: ${m.nik || '-'}</div>
              </td>
              <td>
                ${m.mutation_type === 'pindah_sekolah' ? 
                  '<span class="badge bg-info text-white border border-info px-2.5 py-1"><i class="bi bi-box-arrow-right me-1"></i>Pindah Sekolah</span>' : 
                  '<span class="badge bg-dark text-white border border-secondary px-2.5 py-1"><i class="bi bi-x-circle-fill me-1"></i>Tidak Bersekolah</span>'
                }
              </td>
              <td>
                ${m.destination_school ? `<div class="fw-semibold text-dark"><i class="bi bi-building me-1 text-primary"></i>${m.destination_school}</div>` : ''}
                <div class="small text-secondary text-truncate" style="max-width: 250px;">${m.reason}</div>
              </td>
              <td class="text-center">
                <div class="d-flex align-items-center justify-content-center gap-1.5">
                  <button type="button" class="btn btn-sm btn-outline-info rounded-pill px-2.5 py-1 fw-bold" onclick="openDetailMutationModal(${m.id})">
                    <i class="bi bi-eye-fill me-1"></i>Detail
                  </button>

                  ${userRole === 'admin' ? `
                  <form action="/api/admin/mutations/${m.id}/approve" method="post" class="d-inline">
                    <button type="submit" class="btn btn-sm btn-success rounded-pill px-2.5 py-1 fw-bold" onclick="return confirm('Setujui pengajuan mutasi siswa ${m.student_name || ''}? Status siswa akan diubah menjadi mutasi.');">
                      <i class="bi bi-check-lg me-1"></i>Setujui
                    </button>
                  </form>
                  <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1 fw-bold" onclick="openRejectMutationModal('${m.id}', '${(m.student_name || '').replace(/'/g, "\\'")}')">
                    <i class="bi bi-x-lg me-1"></i>Tolak
                  </button>
                  ` : ''}
                </div>
              </td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- TABEL 2: RIWAYAT MUTASI SISWA (APPROVED / REJECTED / CANCELLED) -->
  <div class="card border-0 rounded-4 shadow-sm mb-4">
    <div class="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div class="d-flex align-items-center gap-2.5">
        <div class="p-2 rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
          <i class="bi bi-journal-text fs-5"></i>
        </div>
        <div>
          <h5 class="fw-bold m-0 text-dark">Riwayat Mutasi Siswa</h5>
          <p class="text-muted mb-0 small">Arsip data mutasi siswa yang telah selesai diproses (Disetujui, Ditolak, atau Dikembalikan)</p>
        </div>
      </div>

      ${userRole !== 'siswa' ? `
      <button class="btn btn-primary rounded-pill px-3 py-2 shadow-sm fw-bold d-inline-flex align-items-center gap-2 text-nowrap" data-bs-toggle="modal" data-bs-target="#addMutationModal">
        <i class="bi bi-person-x-fill fs-6"></i>
        <span>+ Tambah Mutasi Siswa</span>
      </button>` : ''}
    </div>
    
    <div class="card-body p-3">
      <!-- Toolbar Filters & Search Header Bar -->
      <div class="bg-light p-3 rounded-4 mb-3 border d-flex align-items-center justify-content-between flex-wrap gap-3">
        <!-- Filter Tabs Pills -->
        <div class="d-flex align-items-center gap-2 flex-wrap" id="statusFilterContainer">
          <button type="button" class="filter-pill-btn active" data-filter="all">
            Semua (${historyMutations.length})
          </button>
          <button type="button" class="filter-pill-btn" data-filter="approved">
            <i class="bi bi-check-circle-fill text-success me-1"></i>Disetujui (${countApproved})
          </button>
          <button type="button" class="filter-pill-btn" data-filter="rejected">
            <i class="bi bi-x-circle-fill text-danger me-1"></i>Ditolak (${countRejected})
          </button>
          <button type="button" class="filter-pill-btn" data-filter="cancelled">
            <i class="bi bi-arrow-counterclockwise text-secondary me-1"></i>Dikembalikan (${countCancelled})
          </button>
        </div>

        <!-- Search Field -->
        <div class="input-group input-group-sm" style="width: 280px;">
          <span class="input-group-text bg-white border-end-0 rounded-start-pill ps-3"><i class="bi bi-search text-muted"></i></span>
          <input type="text" id="mutationSearchInput" class="form-control border-start-0 rounded-end-pill pe-3" placeholder="Cari nama, NISN, NIK, alasan..." />
        </div>
      </div>

      <!-- History Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-dark fw-bold">
            <tr>
              <th class="text-center" style="width: 50px;">No</th>
              <th style="width: 110px;">Tanggal</th>
              <th>Nama Siswa</th>
              <th style="width: 90px;">Kelas</th>
              <th>NISN / NIK</th>
              <th>Jenis & Status</th>
              <th>Sekolah Tujuan</th>
              <th>Alasan & Catatan</th>
              <th class="text-center" style="width: 170px;">Aksi</th>
            </tr>
          </thead>
          <tbody id="historyTableBody">
            ${historyMutations.length === 0 ? `
            <tr>
              <td colspan="9" class="text-center py-4 text-muted">Belum ada riwayat mutasi siswa.</td>
            </tr>
            ` : ''}

            ${historyMutations.map((m, i) => `
            <tr class="history-row" data-status="${m.status || 'approved'}">
              <td class="text-center fw-bold text-muted">${i + 1}</td>
              <td><span class="fw-semibold text-dark">${formatWITDate(m.mutation_date)}</span></td>
              <td>
                <div class="fw-bold text-dark fs-6">${m.student_name || '-'}</div>
                <div class="small text-muted">NIPD: ${m.nipd || '-'}</div>
              </td>
              <td><span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 rounded-pill">${m.class_name || '-'}</span></td>
              <td>
                <div class="small fw-semibold text-dark">NISN: ${m.nisn || '-'}</div>
                <div class="small text-muted">NIK: ${m.nik || '-'}</div>
              </td>
              <td>
                <div class="d-flex flex-column gap-1">
                  ${m.mutation_type === 'pindah_sekolah' ? 
                    '<span class="badge bg-info text-white border border-info"><i class="bi bi-box-arrow-right me-1"></i>Pindah Sekolah</span>' : 
                    '<span class="badge bg-dark text-white border border-secondary"><i class="bi bi-x-circle-fill me-1"></i>Tidak Bersekolah</span>'
                  }
                  
                  ${m.status === 'approved' ? '<span class="badge bg-success bg-opacity-15 text-success border border-success"><i class="bi bi-check-circle-fill me-1"></i>Disetujui</span>' : ''}
                  ${m.status === 'rejected' ? '<span class="badge bg-danger bg-opacity-15 text-danger border border-danger"><i class="bi bi-x-circle-fill me-1"></i>Ditolak</span>' : ''}
                  ${m.status === 'cancelled' ? '<span class="badge bg-secondary bg-opacity-15 text-secondary border border-secondary"><i class="bi bi-arrow-counterclockwise me-1"></i>Dikembalikan</span>' : ''}
                </div>
              </td>
              <td class="fw-semibold text-dark">
                ${m.mutation_type === 'pindah_sekolah' ? (m.destination_school || '-') : '-'}
              </td>
              <td>
                <div class="small text-dark mb-1">${m.reason}</div>
                ${m.rejection_note ? `<div class="small text-danger fw-semibold"><i class="bi bi-info-circle me-1"></i>Catatan: ${m.rejection_note}</div>` : ''}
              </td>
              <td class="text-center">
                <div class="d-flex align-items-center justify-content-center gap-1">
                  <button type="button" class="btn btn-sm btn-outline-info rounded-pill px-2.5 py-1 fw-bold" onclick="openDetailMutationModal(${m.id})">
                    <i class="bi bi-eye-fill me-1"></i>Detail
                  </button>

                  ${m.status === 'approved' || !m.status ? `
                  <a href="/api/mutations/${m.id}/download-sk" target="_blank" class="btn btn-sm btn-success rounded-pill px-2.5 py-1 fw-bold" title="Download SK Mutasi (.docx)">
                    <i class="bi bi-file-earmark-word-fill me-1"></i>SK (.docx)
                  </a>
                  <a href="/mutations/${m.id}/print-sk" target="_blank" class="btn btn-sm btn-outline-secondary rounded-pill px-2 py-1 fw-bold" title="Cetak SK Mutasi">
                    <i class="bi bi-printer-fill"></i>
                  </a>
                  ` : ''}

                  ${(userRole === 'admin' && (m.status === 'approved' || m.status === 'cancelled' || !m.status)) ? `
                  <form action="/api/admin/mutations/${m.id}/restore" method="post" class="d-inline">
                    <button type="submit" class="btn btn-sm btn-outline-primary rounded-pill px-2 py-1 fw-bold" title="Kembalikan Siswa ke Aktif" onclick="return confirm('Kembalikan siswa ini ke daftar siswa aktif? Status mutasi akan dibatalkan.');">
                      <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                  </form>
                  ` : ''}
                </div>
              </td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- MODAL DETAIL MUTASI SISWA (FULL DATA SISWA, ORTU & DOKUMEN LEGAL) -->
  <div class="modal fade" id="detailMutationModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <div class="modal-header p-4 border-bottom bg-light rounded-top-4 d-flex flex-column align-items-start gap-3">
          <div class="d-flex align-items-center justify-content-between w-100">
            <div class="d-flex align-items-center gap-3">
              <div class="avatar-icon bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                <i class="bi bi-person-badge fs-3"></i>
              </div>
              <div>
                <h5 class="modal-title fw-bold text-dark m-0" id="detailStudentName">-</h5>
                <div class="d-flex align-items-center gap-2 mt-1" id="detailHeaderBadges"></div>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <!-- Nav Tabs Header -->
          <ul class="nav nav-tabs border-bottom-0 w-100 mt-2" id="detailModalTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active fw-bold text-dark rounded-top-3" id="tab-mutasi-btn" data-bs-toggle="tab" data-bs-target="#tab-mutasi" type="button" role="tab">
                <i class="bi bi-card-checklist me-1 text-warning"></i> Info Mutasi
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link fw-bold text-dark rounded-top-3" id="tab-dasar-btn" data-bs-toggle="tab" data-bs-target="#tab-dasar" type="button" role="tab">
                <i class="bi bi-person-lines-fill me-1 text-primary"></i> Data Dasar Siswa
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link fw-bold text-dark rounded-top-3" id="tab-ortu-btn" data-bs-toggle="tab" data-bs-target="#tab-ortu" type="button" role="tab">
                <i class="bi bi-people-fill me-1 text-success"></i> Data Orang Tua
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link fw-bold text-dark rounded-top-3" id="tab-dokumen-btn" data-bs-toggle="tab" data-bs-target="#tab-dokumen" type="button" role="tab">
                <i class="bi bi-file-earmark-check-fill me-1 text-danger"></i> Dokumen Legal
              </button>
            </li>
          </ul>
        </div>

        <div class="modal-body p-4">
          <div class="tab-content" id="detailModalTabContent">
            <!-- TAB 1: INFORMASI MUTASI -->
            <div class="tab-pane fade show active" id="tab-mutasi" role="tabpanel">
              <div class="row g-3">
                <div class="col-12">
                  <div class="p-3 rounded-3 bg-light border">
                    <h6 class="fw-bold text-primary mb-3"><i class="bi bi-arrow-right-left me-2"></i>Rincian Pengajuan Mutasi</h6>
                    <table class="table table-borderless table-sm mb-0">
                      <tr><td class="text-muted ps-0" style="width: 130px;">Jenis Mutasi</td><td>: <span id="detailMutationType" class="fw-semibold text-dark">-</span></td></tr>
                      <tr><td class="text-muted ps-0">Tanggal Mutasi</td><td>: <span id="detailMutationDate" class="fw-semibold text-dark">-</span></td></tr>
                      <tr id="detailDestSchoolRow"><td class="text-muted ps-0">Sekolah Tujuan</td><td>: <span id="detailDestSchool" class="fw-semibold text-dark">-</span></td></tr>
                      <tr><td class="text-muted ps-0">Status Pengajuan</td><td>: <span id="detailStatus" class="fw-semibold">-</span></td></tr>
                    </table>
                  </div>
                </div>

                <div class="col-12">
                  <div class="p-3 rounded-3 bg-light border">
                    <h6 class="fw-bold text-dark mb-2"><i class="bi bi-chat-left-text-fill me-2 text-secondary"></i>Alasan Pengajuan Mutasi</h6>
                    <p class="mb-0 text-dark bg-white p-3 rounded-3 border fw-medium" id="detailReason" style="white-space: pre-line;">-</p>
                  </div>
                </div>

                <div class="col-12" id="detailRejectionContainer" style="display: none;">
                  <div class="p-3 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25">
                    <h6 class="fw-bold text-danger mb-2"><i class="bi bi-exclamation-triangle-fill me-2"></i>Catatan Penolakan Admin</h6>
                    <p class="mb-0 text-danger bg-white p-3 rounded-3 border border-danger border-opacity-25 fw-medium" id="detailRejectionNote" style="white-space: pre-line;">-</p>
                  </div>
                </div>

                <div class="col-12">
                  <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 text-muted small pt-2 border-top">
                    <div><i class="bi bi-person-circle me-1"></i>Diajukan oleh: <span id="detailCreatedBy" class="fw-semibold text-dark">-</span></div>
                    <div id="detailReviewedByContainer" style="display:none;"><i class="bi bi-check2-circle me-1"></i>Diproses oleh: <span id="detailReviewedBy" class="fw-semibold text-dark">-</span></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 2: DATA DASAR SISWA -->
            <div class="tab-pane fade" id="tab-dasar" role="tabpanel">
              <div class="row g-3 align-items-center mb-3 p-3 bg-light rounded-3 border">
                <div class="col-auto">
                  <img id="detailStudentPhoto" src="" class="rounded-circle border shadow-sm" style="width: 70px; height: 70px; object-fit: cover;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" />
                </div>
                <div class="col">
                  <h6 class="fw-bold text-dark mb-1" id="detailStudentNameSub">-</h6>
                  <p class="text-muted mb-0 small"><i class="bi bi-mortarboard-fill me-1 text-primary"></i>Siswa SD Inpres Lelingluan</p>
                </div>
              </div>

              <div class="p-3 rounded-3 bg-light border">
                <h6 class="fw-bold text-primary mb-3"><i class="bi bi-card-heading me-2"></i>Identitas Lengkap Siswa</h6>
                <div class="row g-2">
                  <div class="col-md-6">
                    <div class="p-2 bg-white rounded border">
                      <span class="text-muted small d-block">NISN</span>
                      <strong class="text-dark" id="detailNisn">-</strong>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-2 bg-white rounded border">
                      <span class="text-muted small d-block">NIK (Nomor Induk Kependudukan)</span>
                      <strong class="text-dark" id="detailNik">-</strong>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-2 bg-white rounded border">
                      <span class="text-muted small d-block">NIPD</span>
                      <strong class="text-dark" id="detailNipd">-</strong>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-2 bg-white rounded border">
                      <span class="text-muted small d-block">Kelas Binaan</span>
                      <strong class="text-dark" id="detailClass">-</strong>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="p-2 bg-white rounded border">
                      <span class="text-muted small d-block">Jenis Kelamin</span>
                      <strong class="text-dark" id="detailGender">-</strong>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="p-2 bg-white rounded border">
                      <span class="text-muted small d-block">Agama</span>
                      <strong class="text-dark" id="detailReligion">-</strong>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="p-2 bg-white rounded border">
                      <span class="text-muted small d-block">Tanggal Masuk Sekolah</span>
                      <strong class="text-dark" id="detailEntryDate">-</strong>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="p-2 bg-white rounded border">
                      <span class="text-muted small d-block">Tempat, Tanggal Lahir</span>
                      <strong class="text-dark" id="detailBirthInfo">-</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 3: DATA ORANG TUA -->
            <div class="tab-pane fade" id="tab-ortu" role="tabpanel">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="p-3 rounded-3 bg-light border h-100">
                    <div class="d-flex align-items-center gap-2 mb-3">
                      <div class="p-2 rounded-circle bg-primary bg-opacity-10 text-primary"><i class="bi bi-person-fill fs-5"></i></div>
                      <h6 class="fw-bold text-dark m-0">Data Ayah Kandung</h6>
                    </div>
                    <div class="mb-2">
                      <span class="text-muted small d-block">Nama Ayah</span>
                      <strong class="text-dark fs-6" id="detailFatherName">-</strong>
                    </div>
                    <div>
                      <span class="text-muted small d-block mb-1">Status Keberadaan</span>
                      <div id="detailFatherStatus">-</div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="p-3 rounded-3 bg-light border h-100">
                    <div class="d-flex align-items-center gap-2 mb-3">
                      <div class="p-2 rounded-circle bg-danger bg-opacity-10 text-danger"><i class="bi bi-person-fill-dash fs-5"></i></div>
                      <h6 class="fw-bold text-dark m-0">Data Ibu Kandung</h6>
                    </div>
                    <div class="mb-2">
                      <span class="text-muted small d-block">Nama Ibu</span>
                      <strong class="text-dark fs-6" id="detailMotherName">-</strong>
                    </div>
                    <div>
                      <span class="text-muted small d-block mb-1">Status Keberadaan</span>
                      <div id="detailMotherStatus">-</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 4: DOKUMEN LEGAL SISWA & DOWNLOAD -->
            <div class="tab-pane fade" id="tab-dokumen" role="tabpanel">
              <div class="alert alert-info border-0 rounded-3 p-3 mb-3 small d-flex align-items-center gap-2">
                <i class="bi bi-info-circle-fill text-info fs-5 flex-shrink-0"></i>
                <div>
                  <strong>Dokumen Legalitas Siswa:</strong> Anda dapat melihat atau mengunduh berkas dokumen legal siswa (Akte Kelahiran, Kartu Keluarga, dan Pas Foto) langsung dari sistem.
                </div>
              </div>

              <div class="d-flex flex-column gap-3">
                <!-- Akte Kelahiran Box -->
                <div id="detailAkteContainer"></div>

                <!-- Kartu Keluarga Box -->
                <div id="detailKkContainer"></div>

                <!-- Pas Foto Box -->
                <div id="detailFotoContainer"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer p-3 bg-light border-top rounded-bottom-4 d-flex justify-content-between">
          <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Tutup</button>
          <div id="detailActionButtons" class="d-flex align-items-center gap-2"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL TAMBAH MUTASI SISWA -->
  ${userRole !== 'siswa' ? `
  <div class="modal fade" id="addMutationModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <form action="/api/students/mutate" method="post">
          <div class="modal-header border-bottom p-4">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-person-x-fill text-danger me-2"></i> Form Mutasi Siswa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            ${userRole === 'guru' ? `
            <div class="alert alert-info border-0 rounded-3 p-3 mb-3 small">
              <i class="bi bi-info-circle-fill me-1"></i> <strong>Akses Kelas Binaan:</strong> Anda hanya dapat mengajukan mutasi untuk siswa dari kelas binaan Anda <strong>(${homeroomClass || 'Belum di-set'})</strong>. Pengajuan akan masuk status <strong>Menunggu Persetujuan Admin</strong>.
            </div>` : ''}

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold">
                  Pilih Siswa <span class="text-danger">*</span>
                  ${(userRole === 'guru' && homeroomClass) ? `<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-0.5 rounded-pill small ms-1"><i class="bi bi-person-workspace me-1"></i>Kelas ${homeroomClass}</span>` : ''}
                </label>
                <select name="student_id" class="form-select rounded-3" required>
                  <option value="">-- ${(userRole === 'guru' && homeroomClass) ? `Pilih Siswa Kelas ${homeroomClass}` : 'Pilih Siswa Active'} --</option>
                  ${activeStudents.map(s => `
                    <option value="${s.id}">${s.name} (${s.class_name}) - NIK: ${s.nik || '-'}</option>
                  `).join('')}
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold">Jenis Mutasi <span class="text-danger">*</span></label>
                <select name="mutation_type" id="mutationTypeSelect" class="form-select rounded-3" required>
                  <option value="pindah_sekolah">1. Pindah Sekolah</option>
                  <option value="tidak_bersekolah">2. Tidak Bersekolah</option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label fw-semibold">Tanggal Mutasi <span class="text-danger">*</span></label>
                <input type="date" name="mutation_date" class="form-control rounded-3" value="${todayStr}" required />
              </div>

              <div class="col-md-6 mb-3" id="destinationSchoolContainer">
                <label class="form-label fw-semibold">Sekolah Tujuan <span class="text-danger">*</span></label>
                <input type="text" name="destination_school" id="destinationSchoolInput" class="form-control rounded-3" placeholder="Contoh: SD Negeri 1 Ambon..." required />
              </div>

              <div class="col-12 mb-3">
                <label class="form-label fw-semibold">Alasan Mutasi <span class="text-danger">*</span></label>
                <textarea name="reason" class="form-control rounded-3" rows="3" placeholder="Ketikkan alasan mengapa siswa dimutasi..." required></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer border-top p-3 bg-light rounded-bottom-4">
            <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-danger rounded-pill px-4 fw-bold">
              <i class="bi bi-check-lg me-1"></i> Simpan Mutasi
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- MODAL TOLAK MUTASI (ADMIN) -->
  ${userRole === 'admin' ? `
  <div class="modal fade" id="rejectMutationModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <form id="rejectMutationForm" action="" method="post">
          <div class="modal-header border-bottom p-4">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-x-circle-fill text-danger me-2"></i> Tolak Pengajuan Mutasi</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <p class="mb-3 small text-secondary">Tolak pengajuan mutasi untuk siswa: <strong id="rejectStudentName" class="text-dark"></strong></p>
            <div class="mb-3">
              <label class="form-label fw-semibold">Alasan Penolakan <span class="text-danger">*</span></label>
              <textarea name="rejection_note" class="form-control rounded-3" rows="3" placeholder="Ketik alasan mengapa mutasi ditolak..." required></textarea>
            </div>
          </div>
          <div class="modal-footer border-top p-3 bg-light rounded-bottom-4">
            <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-danger rounded-pill px-4 fw-bold">Tolak Mutasi</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- Data Script & Client-side Scripting -->
  <script>
    window.ALL_MUTATIONS_DATA = ${JSON.stringify(mutations)};
    window.CURRENT_USER_ROLE = "${userRole}";

    function openRejectMutationModal(mutationId, studentName) {
      const form = document.getElementById('rejectMutationForm');
      const nameEl = document.getElementById('rejectStudentName');
      if (form && nameEl) {
        form.action = '/api/admin/mutations/' + mutationId + '/reject';
        nameEl.textContent = studentName;
        const modal = new bootstrap.Modal(document.getElementById('rejectMutationModal'));
        modal.show();
      }
    }

    function openDetailMutationModal(mutationId) {
      const m = window.ALL_MUTATIONS_DATA.find(item => item.id == mutationId);
      if (!m) return;

      const studentName = m.student_name || '-';
      document.getElementById('detailStudentName').textContent = studentName;
      document.getElementById('detailStudentNameSub').textContent = studentName;

      // Tab 1: Mutation Info
      document.getElementById('detailReason').textContent = m.reason || '-';
      document.getElementById('detailCreatedBy').textContent = m.created_by || 'Sistem';

      // Format Mutation Date
      let formattedDate = m.mutation_date || '-';
      try {
        if (m.mutation_date) {
          const d = new Date(m.mutation_date);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          }
        }
      } catch(e) {}
      document.getElementById('detailMutationDate').textContent = formattedDate;

      // Header Badges
      const headerBadges = document.getElementById('detailHeaderBadges');
      let statusBadge = '';
      if (m.status === 'pending') statusBadge = '<span class="badge bg-warning text-dark border border-warning"><i class="bi bi-clock-history me-1"></i>Menunggu Admin</span>';
      else if (m.status === 'approved') statusBadge = '<span class="badge bg-success bg-opacity-15 text-success border border-success"><i class="bi bi-check-circle-fill me-1"></i>Disetujui</span>';
      else if (m.status === 'rejected') statusBadge = '<span class="badge bg-danger bg-opacity-15 text-danger border border-danger"><i class="bi bi-x-circle-fill me-1"></i>Ditolak</span>';
      else if (m.status === 'cancelled') statusBadge = '<span class="badge bg-secondary bg-opacity-15 text-secondary border border-secondary"><i class="bi bi-arrow-counterclockwise me-1"></i>Dikembalikan</span>';

      headerBadges.innerHTML = '<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-0.5 rounded-pill">Kelas ' + (m.class_name || '-') + '</span> ' + statusBadge;

      // Mutation type & school
      const typeEl = document.getElementById('detailMutationType');
      const destRow = document.getElementById('detailDestSchoolRow');
      const destEl = document.getElementById('detailDestSchool');
      
      if (m.mutation_type === 'pindah_sekolah') {
        typeEl.innerHTML = '<span class="badge bg-info text-white"><i class="bi bi-box-arrow-right me-1"></i>Pindah Sekolah</span>';
        destRow.style.display = '';
        destEl.textContent = m.destination_school || '-';
      } else {
        typeEl.innerHTML = '<span class="badge bg-dark text-white"><i class="bi bi-x-circle-fill me-1"></i>Tidak Bersekolah</span>';
        destRow.style.display = 'none';
      }

      document.getElementById('detailStatus').innerHTML = statusBadge;

      // Rejection Note
      const rejContainer = document.getElementById('detailRejectionContainer');
      const rejNote = document.getElementById('detailRejectionNote');
      if (m.rejection_note) {
        rejContainer.style.display = 'block';
        rejNote.textContent = m.rejection_note;
      } else {
        rejContainer.style.display = 'none';
      }

      // Reviewed By
      const revContainer = document.getElementById('detailReviewedByContainer');
      const revEl = document.getElementById('detailReviewedBy');
      if (m.reviewed_by) {
        revContainer.style.display = 'block';
        revEl.textContent = m.reviewed_by + (m.reviewed_at ? ' (' + m.reviewed_at + ')' : '');
      } else {
        revContainer.style.display = 'none';
      }

      // Tab 2: Data Dasar Siswa
      document.getElementById('detailNisn').textContent = m.nisn || '-';
      document.getElementById('detailNik').textContent = m.nik || '-';
      document.getElementById('detailNipd').textContent = m.nipd || '-';
      document.getElementById('detailClass').textContent = m.class_name || '-';

      let birthStr = '-';
      if (m.birth_place || m.birth_date) {
        let formattedBirthDate = m.birth_date || '';
        try {
          if (m.birth_date) {
            const bd = new Date(m.birth_date);
            if (!isNaN(bd.getTime())) {
              formattedBirthDate = bd.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            }
          }
        } catch(e) {}
        birthStr = (m.birth_place ? m.birth_place + ', ' : '') + formattedBirthDate;
      }
      document.getElementById('detailBirthInfo').textContent = birthStr;
      document.getElementById('detailGender').textContent = m.gender || '-';
      document.getElementById('detailReligion').textContent = m.religion || '-';
      document.getElementById('detailEntryDate').textContent = m.entry_date || '-';

      const photoImg = document.getElementById('detailStudentPhoto');
      const photoUrl = m.photo_url || m.doc_photo_url || m.doc_photo_path;
      if (photoUrl) {
        photoImg.src = photoUrl;
      } else {
        photoImg.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
      }

      // Tab 3: Data Orang Tua
      document.getElementById('detailFatherName').textContent = m.father_name || '-';
      const fatherStatusEl = document.getElementById('detailFatherStatus');
      if (m.is_father_alive === 1 || m.is_father_alive === undefined || m.is_father_alive === null) {
        fatherStatusEl.innerHTML = '<span class="badge bg-success bg-opacity-15 text-success border border-success"><i class="bi bi-heart-fill me-1"></i>Masih Hidup</span>';
      } else {
        fatherStatusEl.innerHTML = '<span class="badge bg-secondary bg-opacity-15 text-secondary border border-secondary"><i class="bi bi-dash-circle me-1"></i>Meninggal Dunia</span>';
      }

      document.getElementById('detailMotherName').textContent = m.mother_name || '-';
      const motherStatusEl = document.getElementById('detailMotherStatus');
      if (m.is_mother_alive === 1 || m.is_mother_alive === undefined || m.is_mother_alive === null) {
        motherStatusEl.innerHTML = '<span class="badge bg-success bg-opacity-15 text-success border border-success"><i class="bi bi-heart-fill me-1"></i>Masih Hidup</span>';
      } else {
        motherStatusEl.innerHTML = '<span class="badge bg-secondary bg-opacity-15 text-secondary border border-secondary"><i class="bi bi-dash-circle me-1"></i>Meninggal Dunia</span>';
      }

      // Tab 4: Dokumen Legal Siswa & Download Buttons
      // 1. Akte Kelahiran
      const akteContainer = document.getElementById('detailAkteContainer');
      const akteUrl = m.akte_url || m.akte_path;
      if (akteUrl) {
        akteContainer.innerHTML = \`
          <div class="d-flex align-items-center justify-content-between p-3 rounded-3 bg-white border shadow-sm">
            <div class="d-flex align-items-center gap-3">
              <div class="p-2.5 rounded-3 bg-danger bg-opacity-10 text-danger fs-4"><i class="bi bi-file-earmark-pdf-fill"></i></div>
              <div>
                <div class="fw-bold text-dark mb-0">Akte Kelahiran</div>
                <span class="badge \${m.akte_status === 'approved' ? 'bg-success' : m.akte_status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'} small">
                  \${m.akte_status === 'approved' ? 'Disetujui' : m.akte_status === 'rejected' ? 'Ditolak' : 'Menunggu Verifikasi'}
                </span>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <a href="\${akteUrl}" target="_blank" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold"><i class="bi bi-eye me-1"></i>Lihat</a>
              <a href="\${akteUrl}" download target="_blank" class="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-bold"><i class="bi bi-download me-1"></i>Unduh</a>
            </div>
          </div>
        \`;
      } else {
        akteContainer.innerHTML = \`
          <div class="p-3 rounded-3 bg-light border text-muted d-flex align-items-center justify-content-between">
            <span><i class="bi bi-file-earmark-x me-2 text-secondary"></i>Akte Kelahiran belum diunggah</span>
            <span class="badge bg-secondary bg-opacity-20 text-secondary">Belum ada file</span>
          </div>
        \`;
      }

      // 2. Kartu Keluarga (KK)
      const kkContainer = document.getElementById('detailKkContainer');
      const kkUrl = m.kk_url || m.kk_path;
      if (kkUrl) {
        kkContainer.innerHTML = \`
          <div class="d-flex align-items-center justify-content-between p-3 rounded-3 bg-white border shadow-sm">
            <div class="d-flex align-items-center gap-3">
              <div class="p-2.5 rounded-3 bg-info bg-opacity-10 text-info fs-4"><i class="bi bi-file-earmark-text-fill"></i></div>
              <div>
                <div class="fw-bold text-dark mb-0">Kartu Keluarga (KK)</div>
                <span class="badge \${m.kk_status === 'approved' ? 'bg-success' : m.kk_status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'} small">
                  \${m.kk_status === 'approved' ? 'Disetujui' : m.kk_status === 'rejected' ? 'Ditolak' : 'Menunggu Verifikasi'}
                </span>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <a href="\${kkUrl}" target="_blank" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold"><i class="bi bi-eye me-1"></i>Lihat</a>
              <a href="\${kkUrl}" download target="_blank" class="btn btn-sm btn-info text-white rounded-pill px-3 py-1.5 fw-bold"><i class="bi bi-download me-1"></i>Unduh</a>
            </div>
          </div>
        \`;
      } else {
        kkContainer.innerHTML = \`
          <div class="p-3 rounded-3 bg-light border text-muted d-flex align-items-center justify-content-between">
            <span><i class="bi bi-file-earmark-x me-2 text-secondary"></i>Kartu Keluarga belum diunggah</span>
            <span class="badge bg-secondary bg-opacity-20 text-secondary">Belum ada file</span>
          </div>
        \`;
      }

      // 3. Pas Foto
      const fotoContainer = document.getElementById('detailFotoContainer');
      const fotoDocUrl = m.photo_url || m.doc_photo_url || m.doc_photo_path;
      if (fotoDocUrl) {
        fotoContainer.innerHTML = \`
          <div class="d-flex align-items-center justify-content-between p-3 rounded-3 bg-white border shadow-sm">
            <div class="d-flex align-items-center gap-3">
              <img src="\${fotoDocUrl}" class="rounded-3 border" style="width: 44px; height: 44px; object-fit: cover;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" />
              <div>
                <div class="fw-bold text-dark mb-0">Pas Foto Siswa</div>
                <span class="badge bg-success small">Tersedia</span>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <a href="\${fotoDocUrl}" target="_blank" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold"><i class="bi bi-eye me-1"></i>Lihat</a>
              <a href="\${fotoDocUrl}" download target="_blank" class="btn btn-sm btn-success rounded-pill px-3 py-1.5 fw-bold"><i class="bi bi-download me-1"></i>Unduh</a>
            </div>
          </div>
        \`;
      } else {
        fotoContainer.innerHTML = \`
          <div class="p-3 rounded-3 bg-light border text-muted d-flex align-items-center justify-content-between">
            <span><i class="bi bi-image me-2 text-secondary"></i>Pas Foto Siswa belum diunggah</span>
            <span class="badge bg-secondary bg-opacity-20 text-secondary">Belum ada foto</span>
          </div>
        \`;
      }

      // Reset Active Tab to Tab 1
      const tabMutasiBtn = document.getElementById('tab-mutasi-btn');
      if (tabMutasiBtn && window.bootstrap && window.bootstrap.Tab) {
        const bsTab = new bootstrap.Tab(tabMutasiBtn);
        bsTab.show();
      }

      // Dynamic Action Buttons
      const actionsDiv = document.getElementById('detailActionButtons');
      actionsDiv.innerHTML = '';

      let skButtonsHtml = '';
      if (m.status === 'approved' || !m.status) {
        skButtonsHtml = \`
          <a href="/api/mutations/\${m.id}/download-sk" target="_blank" class="btn btn-success rounded-pill px-3 py-1.5 fw-bold">
            <i class="bi bi-file-earmark-word-fill me-1"></i>Download SK (.docx)
          </a>
          <a href="/mutations/\${m.id}/print-sk" target="_blank" class="btn btn-outline-dark rounded-pill px-3 py-1.5 fw-bold">
            <i class="bi bi-printer-fill me-1"></i>Cetak SK
          </a>
        \`;
      }

      if (window.CURRENT_USER_ROLE === 'admin') {
        if (m.status === 'pending') {
          actionsDiv.innerHTML = \`
            <form action="/api/admin/mutations/\${m.id}/approve" method="post" class="d-inline">
              <button type="submit" class="btn btn-success rounded-pill px-4 fw-bold" onclick="return confirm('Setujui pengajuan mutasi ini?');">
                <i class="bi bi-check-lg me-1"></i>Setujui Mutasi
              </button>
            </form>
            <button type="button" class="btn btn-outline-danger rounded-pill px-4 fw-bold" onclick="bootstrap.Modal.getInstance(document.getElementById('detailMutationModal')).hide(); openRejectMutationModal('\${m.id}', '\${(m.student_name || '').replace(/'/g, "\\\\'")}')">
              <i class="bi bi-x-lg me-1"></i>Tolak Pengajuan
            </button>
          \`;
        } else if (m.status === 'approved' || m.status === 'cancelled' || !m.status) {
          actionsDiv.innerHTML = \`
            \${skButtonsHtml}
            <form action="/api/admin/mutations/\${m.id}/restore" method="post" class="d-inline">
              <button type="submit" class="btn btn-outline-primary rounded-pill px-4 fw-bold" onclick="return confirm('Kembalikan siswa ini ke daftar siswa aktif? Status mutasi akan dibatalkan.');">
                <i class="bi bi-arrow-counterclockwise me-1"></i>Kembalikan Siswa Aktif
              </button>
            </form>
          \`;
        }
      } else {
        actionsDiv.innerHTML = skButtonsHtml;
      }

      const modal = new bootstrap.Modal(document.getElementById('detailMutationModal'));
      modal.show();
    }

    document.addEventListener('DOMContentLoaded', function() {
      // History table search & tab filter
      const searchInput = document.getElementById('mutationSearchInput');
      const filterBtns = document.querySelectorAll('#statusFilterContainer .filter-pill-btn');
      const historyRows = document.querySelectorAll('#historyTableBody tr.history-row');

      let currentFilter = 'all';

      function applyFilters() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        historyRows.forEach(row => {
          const rowStatus = row.getAttribute('data-status') || '';
          const rowText = row.textContent.toLowerCase();

          const matchesFilter = (currentFilter === 'all') || (rowStatus === currentFilter);
          const matchesQuery = !query || rowText.includes(query);

          row.style.display = (matchesFilter && matchesQuery) ? '' : 'none';
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
        searchInput.addEventListener('keyup', applyFilters);
      }

      filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          filterBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          currentFilter = this.getAttribute('data-filter') || 'all';
          applyFilters();
        });
      });

      // Add Mutation Form Type Toggle
      const typeSelect = document.getElementById('mutationTypeSelect');
      const destContainer = document.getElementById('destinationSchoolContainer');
      const destInput = document.getElementById('destinationSchoolInput');

      if (typeSelect && destContainer && destInput) {
        typeSelect.addEventListener('change', function() {
          if (this.value === 'pindah_sekolah') {
            destContainer.style.display = 'block';
            destInput.required = true;
          } else {
            destContainer.style.display = 'none';
            destInput.required = false;
            destInput.value = '';
          }
        });
      }
    });
  </script>
  `;
}


