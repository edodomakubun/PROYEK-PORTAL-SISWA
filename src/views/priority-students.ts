import { User, PriorityStudent, Student, MasterClass } from '../types';
import { DEFAULT_AVATAR, formatWIT, formatWITDate } from './helpers';
import { renderLayout } from './layout';

export function renderPriorityStudentsPage(
  user: User,
  priorityList: PriorityStudent[],
  allStudents: Student[],
  selectedClassFilter: string = '',
  flashMessage: string = ''
): string {
  const isAdmin = user.role === 'admin';
  const isGuru = user.role === 'guru';

  // Distinct classes from allStudents for filtering
  const distinctClasses = Array.from(new Set(allStudents.map(s => s.class_name).filter(Boolean))).sort();

  // Filter priority list if selectedClassFilter is set
  const filteredPriorityList = selectedClassFilter
    ? priorityList.filter(p => p.class_name === selectedClassFilter)
    : priorityList;

  // Stats calculation
  const totalPriority = priorityList.length;

  let needPhotoCount = 0;
  let needKkCount = 0;
  let needAkteCount = 0;

  priorityList.forEach(p => {
    const docs = (p.uploaded_docs || '').split(',');
    const hasPhoto = !!p.photo_url;
    const hasKk = docs.includes('kartu_keluarga');
    const hasAkte = docs.includes('akte_kelahiran');

    if (p.required_photo && !hasPhoto) needPhotoCount++;
    if (p.required_kk && !hasKk) needKkCount++;
    if (p.required_akte && !hasAkte) needAkteCount++;
  });

  // Map of priority student_ids for easy lookup in admin modal
  const existingPriorityMap = new Map<number, PriorityStudent>();
  priorityList.forEach(p => existingPriorityMap.set(p.student_id, p));

  return `
    <div class="container-fluid px-0">
      <!-- Flash Alert -->
      ${flashMessage ? `
        <div class="alert alert-success alert-dismissible fade show rounded-4 shadow-sm mb-3" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i> ${flashMessage}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      ` : ''}

      <!-- Banner & Stats Header -->
      <div class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);">
        <div class="card-body p-4 text-white">
          <div class="row align-items-center">
            <div class="col-lg-7">
              <div class="d-flex align-items-center gap-3 mb-2">
                <div class="p-3 bg-warning text-dark rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="width: 54px; height: 54px;">
                  <i class="bi bi-exclamation-triangle-fill fs-2"></i>
                </div>
                <div>
                  <h3 class="fw-extrabold mb-1 text-white">Siswa Prioritas & Keperluan Mendesak</h3>
                  <p class="mb-0 text-white-50 small">
                    ${isAdmin
      ? 'Tandai dan kelola daftar siswa yang membutuhkan perhatian khusus atau kelengkapan berkas mendesak.'
      : 'Daftar siswa yang memerlukan tindakan / kelengkapan berkas khusus dari Guru. Klik tombol centang (✔) setelah semua kebutuhan terpenuhi.'}
                  </p>
                </div>
              </div>
            </div>
            <div class="col-lg-5 mt-3 mt-lg-0 text-lg-end">
              <div class="d-flex flex-wrap gap-2 justify-content-lg-end">
                <span class="badge bg-white text-dark fs-6 py-2 px-3 rounded-pill shadow-sm">
                  <i class="bi bi-person-exclamation me-1 text-danger"></i> <span id="statTotalPriority">${totalPriority}</span> Siswa Prioritas
                </span>
                ${needPhotoCount > 0 ? `
                <span class="badge bg-warning text-dark fs-6 py-2 px-3 rounded-pill shadow-sm">
                  <i class="bi bi-camera me-1"></i> ${needPhotoCount} Foto Belum
                </span>` : ''}
                ${needKkCount > 0 ? `
                <span class="badge bg-info text-white fs-6 py-2 px-3 rounded-pill shadow-sm">
                  <i class="bi bi-file-earmark-text me-1"></i> ${needKkCount} KK Belum
                </span>` : ''}
                ${needAkteCount > 0 ? `
                <span class="badge bg-danger text-white fs-6 py-2 px-3 rounded-pill shadow-sm">
                  <i class="bi bi-file-earmark-person me-1"></i> ${needAkteCount} Akte Belum
                </span>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action & Filter Toolbar -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-3">
          <div class="row g-3 align-items-center justify-content-between">
            <div class="col-md-6 col-lg-5">
              <form method="GET" action="/priority-students" class="d-flex gap-2">
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-light border-secondary border-opacity-25 text-secondary">
                    <i class="bi bi-funnel-fill"></i> Filter Kelas:
                  </span>
                  <select name="class_name" class="form-select form-select-sm border-secondary border-opacity-25" onchange="this.form.submit()">
                    <option value="">Semua Kelas (${totalPriority} Siswa)</option>
                    ${distinctClasses.map(c => `
                      <option value="${c}" ${selectedClassFilter === c ? 'selected' : ''}>Kelas ${c}</option>
                    `).join('')}
                  </select>
                </div>
                ${selectedClassFilter ? `
                  <a href="/priority-students" class="btn btn-outline-secondary btn-sm rounded-3 d-flex align-items-center gap-1" title="Reset Filter">
                    <i class="bi bi-x-lg"></i> Reset
                  </a>
                ` : ''}
              </form>
            </div>
            
            <div class="col-md-6 col-lg-5 text-md-end">
              ${isAdmin ? `
                <button type="button" class="btn btn-warning btn-sm rounded-pill px-3 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#addPriorityModal">
                  <i class="bi bi-plus-circle-fill fs-6"></i> Tambah Siswa Prioritas
                </button>
              ` : `
                <div class="badge bg-light text-secondary border px-3 py-2 rounded-pill small">
                  <i class="bi bi-shield-lock me-1"></i> Mode Guru: Read-Only (Verifikasi & Penyelesaian)
                </div>
              `}
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Cards Grid Area -->
      <div class="row g-3" id="priorityCardsGrid">
        ${filteredPriorityList.length === 0 ? `
          <div class="col-12">
            <div class="card border-0 shadow-sm rounded-4 text-center p-5 my-3">
              <div class="card-body">
                <div class="mb-3">
                  <span class="badge bg-success bg-opacity-10 text-success p-3 rounded-circle">
                    <i class="bi bi-check-circle-fill display-4"></i>
                  </span>
                </div>
                <h4 class="fw-bold text-dark mb-2">Tidak Ada Siswa Prioritas saat ini</h4>
                <p class="text-muted max-w-md mx-auto mb-4">
                  ${selectedClassFilter
        ? `Tidak ada siswa prioritas di kelas <strong>${selectedClassFilter}</strong>.`
        : 'Seluruh kebutuhan atau catatan mendesak dari Admin telah selesai diproses oleh Guru.'}
                </p>
                ${isAdmin ? `
                  <button type="button" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#addPriorityModal">
                    <i class="bi bi-plus-lg me-1"></i> Tambah Siswa Prioritas Sekarang
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        ` : filteredPriorityList.map(ps => {
          const docs = (ps.uploaded_docs || '').split(',');
          const hasPhoto = !!ps.photo_url;
          const hasKk = docs.includes('kartu_keluarga');
          const hasAkte = docs.includes('akte_kelahiran');

          // Check if all requested items are satisfied
          const photoOK = !ps.required_photo || hasPhoto;
          const kkOK = !ps.required_kk || hasKk;
          const akteOK = !ps.required_akte || hasAkte;
          const allSatisfied = photoOK && kkOK && akteOK;

          return `
            <div class="col-12 col-md-6 col-xl-4" id="priority-card-${ps.id}">
              <div class="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden card-priority-item">
                <!-- Top Status Stripe -->
                <div class="position-absolute top-0 start-0 end-0" style="height: 5px; background: ${allSatisfied ? 'var(--bs-success)' : 'var(--bs-warning)'};"></div>

                <div class="card-body p-3 p-md-4">
                  <!-- Header: Photo & Name -->
                  <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                    <div class="position-relative">
                      <img src="${ps.photo_url ? (ps.photo_url.startsWith('http') || ps.photo_url.startsWith('/files/') ? ps.photo_url : '/files/' + ps.photo_url.replace(/^\/+/, '')) : DEFAULT_AVATAR}" 
                           class="rounded-circle border border-2 border-primary-subtle shadow-sm object-fit-cover" 
                           style="width: 58px; height: 58px;" 
                           alt="Foto ${ps.name}">
                      ${hasPhoto ? `
                        <span class="position-absolute bottom-0 end-0 bg-success text-white rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; font-size: 10px;" title="Foto Ada">
                          <i class="bi bi-check"></i>
                        </span>
                      ` : `
                        <span class="position-absolute bottom-0 end-0 bg-danger text-white rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; font-size: 10px;" title="Foto Belum Ada">
                          <i class="bi bi-camera-fill"></i>
                        </span>
                      `}
                    </div>

                    <div class="overflow-hidden flex-grow-1">
                      <div class="d-flex align-items-center justify-content-between gap-1 mb-1">
                        <span class="badge bg-primary bg-opacity-10 text-primary fw-bold rounded-pill px-2.5 py-1">
                          Kelas ${ps.class_name || '-'}
                        </span>
                        <small class="text-muted opacity-75" style="font-size: 0.75rem;">
                          <i class="bi bi-clock me-1"></i>${ps.created_at ? formatWITDate(ps.created_at, { day: 'numeric', month: 'short' }) : ''}
                        </small>
                      </div>
                      <h5 class="fw-bold text-dark mb-0 text-truncate" title="${ps.name}">${ps.name}</h5>
                      <small class="text-secondary d-block text-truncate">
                        NISN: ${ps.nisn || '-'} | NIPD: ${ps.nipd || '-'}
                      </small>
                    </div>
                  </div>

                  <!-- Catatan Admin Box -->
                  ${ps.notes ? `
                    <div class="p-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-3 mb-3">
                      <div class="fw-bold text-warning-emphasis mb-1 small d-flex align-items-center gap-1">
                        <i class="bi bi-chat-square-text-fill text-warning"></i> Catatan & Instruksi Admin:
                      </div>
                      <div class="text-dark small fw-medium" style="white-space: pre-line;">${ps.notes}</div>
                    </div>
                  ` : ''}

                  <!-- Checklist Kebutuhan Dokumen -->
                  <div class="mb-3">
                    <div class="small fw-bold text-secondary text-uppercase tracking-wider mb-2" style="font-size: 0.72rem;">
                      <i class="bi bi-check2-square me-1"></i> Status Kelengkapan Berkas:
                    </div>

                    <div class="d-flex flex-column gap-2">
                      <!-- 1. Foto Profil -->
                      ${ps.required_photo ? `
                        <div class="d-flex align-items-center justify-content-between p-2 rounded-3 border ${hasPhoto ? 'bg-success bg-opacity-10 border-success border-opacity-25' : 'bg-danger bg-opacity-10 border-danger border-opacity-25'}">
                          <span class="small fw-semibold d-flex align-items-center gap-2 ${hasPhoto ? 'text-success' : 'text-danger'}">
                            <i class="bi ${hasPhoto ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i> Foto Profil Siswa
                          </span>
                          ${hasPhoto ? `
                            <span class="badge bg-success rounded-pill">✔ Terpenuhi</span>
                          ` : `
                            <button type="button" class="btn btn-outline-danger btn-sm rounded-pill py-0 px-2 small" onclick="openQuickUploadModal(${ps.student_id}, '${ps.name}', 'photo')">
                              <i class="bi bi-upload me-1"></i> Unggah Foto
                            </button>
                          `}
                        </div>
                      ` : ''}

                      <!-- 2. Kartu Keluarga (KK) -->
                      ${ps.required_kk ? `
                        <div class="d-flex align-items-center justify-content-between p-2 rounded-3 border ${hasKk ? 'bg-success bg-opacity-10 border-success border-opacity-25' : 'bg-info bg-opacity-10 border-info border-opacity-25'}">
                          <span class="small fw-semibold d-flex align-items-center gap-2 ${hasKk ? 'text-success' : 'text-info-emphasis'}">
                            <i class="bi ${hasKk ? 'bi-check-circle-fill' : 'bi-file-earmark-x-fill'}"></i> Kartu Keluarga (KK)
                          </span>
                          ${hasKk ? `
                            <span class="badge bg-success rounded-pill">✔ Terpenuhi</span>
                          ` : `
                            <button type="button" class="btn btn-outline-info btn-sm rounded-pill py-0 px-2 small" onclick="openQuickUploadModal(${ps.student_id}, '${ps.name}', 'kartu_keluarga')">
                              <i class="bi bi-upload me-1"></i> Unggah KK
                            </button>
                          `}
                        </div>
                      ` : ''}

                      <!-- 3. Akte Kelahiran -->
                      ${ps.required_akte ? `
                        <div class="d-flex align-items-center justify-content-between p-2 rounded-3 border ${hasAkte ? 'bg-success bg-opacity-10 border-success border-opacity-25' : 'bg-danger bg-opacity-10 border-danger border-opacity-25'}">
                          <span class="small fw-semibold d-flex align-items-center gap-2 ${hasAkte ? 'text-success' : 'text-danger'}">
                            <i class="bi ${hasAkte ? 'bi-check-circle-fill' : 'bi-file-earmark-x-fill'}"></i> Akte Kelahiran
                          </span>
                          ${hasAkte ? `
                            <span class="badge bg-success rounded-pill">✔ Terpenuhi</span>
                          ` : `
                            <button type="button" class="btn btn-outline-danger btn-sm rounded-pill py-0 px-2 small" onclick="openQuickUploadModal(${ps.student_id}, '${ps.name}', 'akte_kelahiran')">
                              <i class="bi bi-upload me-1"></i> Unggah Akte
                            </button>
                          `}
                        </div>
                      ` : ''}

                      ${(!ps.required_photo && !ps.required_kk && !ps.required_akte && !ps.notes) ? `
                        <div class="text-muted small italic p-2 bg-light rounded border text-center">
                          Catatan umum dari Admin. Silakan periksa detail siswa.
                        </div>
                      ` : ''}
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="pt-2 border-top d-flex flex-column gap-2">
                    <a href="/students/${ps.student_id}" class="btn btn-light btn-sm w-100 rounded-3 text-secondary border fw-semibold mb-1">
                      <i class="bi bi-person-lines-fill me-1"></i> Lihat Profil Lengkap Siswa
                    </a>

                    <!-- MAIN TEACHER CHECK BUTTON (✔) -->
                    <button type="button" 
                            class="btn ${allSatisfied ? 'btn-success' : 'btn-outline-success'} btn-md w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 py-2"
                            onclick="completePriorityStudent(${ps.id}, '${(ps.name || '').replace(/'/g, "\\'")}')">
                      <i class="bi bi-check-circle-fill fs-5"></i>
                      <span>Selesai Diproses</span>
                    </button>

                    ${isAdmin ? `
                      <div class="d-flex gap-2 mt-1">
                        <button type="button" class="btn btn-outline-warning btn-sm flex-fill rounded-3" onclick="openEditPriorityModal(${ps.id}, ${ps.student_id}, '${(ps.notes || '').replace(/'/g, "\\'")}', ${ps.required_photo}, ${ps.required_kk}, ${ps.required_akte})">
                          <i class="bi bi-pencil me-1"></i> Edit Catatan
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm flex-fill rounded-3" onclick="deletePriorityStudent(${ps.id}, '${(ps.name || '').replace(/'/g, "\\'")}')">
                          <i class="bi bi-trash me-1"></i> Hapus
                        </button>
                      </div>
                    ` : ''}
                  </div>

                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- =========================================================
         ADMIN MODAL: TAMBAH SISWA PRIORITAS
         ========================================================= -->
    ${isAdmin ? `
      <div class="modal fade" id="addPriorityModal" tabindex="-1" aria-labelledby="addPriorityModalLabel">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header bg-indigo-gradient text-white rounded-top-4 py-3" style="background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%);">
              <h5 class="modal-title fw-bold d-flex align-items-center gap-2" id="addPriorityModalLabel">
                <i class="bi bi-person-plus-fill text-warning fs-4"></i> Tambahkan Siswa ke Daftar Prioritas
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <form id="addPriorityForm" onsubmit="submitAddPriority(event)">
              <div class="modal-body p-4">
                <!-- Search & Filter Controls -->
                <div class="row g-2 mb-3">
                  <div class="col-md-7">
                    <div class="input-group">
                      <span class="input-group-text bg-light"><i class="bi bi-search text-muted"></i></span>
                      <input type="text" id="modalStudentSearch" class="form-control" placeholder="Cari Nama, NISN, NIPD..." oninput="filterModalStudents()">
                    </div>
                  </div>
                  <div class="col-md-5">
                    <select id="modalClassFilterSelect" class="form-select" onchange="filterModalStudents()">
                      <option value="">Semua Kelas </option>
                      ${distinctClasses.map(c => `<option value="${c}">Kelas ${c}</option>`).join('')}
                    </select>
                  </div>
                </div>

                <!-- Student Checkbox Table -->
                <label class="form-label fw-bold text-dark d-flex justify-content-between align-items-center mb-2">
                  <span>Pilih Siswa (<span id="modalSelectedCount">0</span> dipilih):</span>
                  <button type="button" class="btn btn-link btn-sm text-primary p-0 text-decoration-none" onclick="toggleSelectAllModalStudents()">
                    <i class="bi bi-check-all"></i> Pilih Semua Terlihat
                  </button>
                </label>

                <div class="table-responsive border rounded-3 mb-4" style="max-height: 260px; overflow-y: auto;">
                  <table class="table table-hover table-striped align-middle mb-0" id="modalStudentsTable">
                    <thead class="table-light sticky-top">
                      <tr>
                        <th style="width: 40px;" class="text-center">
                          <input type="checkbox" class="form-check-input" id="selectAllCheckbox" onchange="toggleSelectAllModalStudents(this.checked)">
                        </th>
                        <th>Nama Siswa</th>
                        <th>Kelas</th>
                        <th>NISN / NIPD</th>
                        <th>Status Prioritas</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${allStudents.map(st => {
          const isAlreadyPriority = existingPriorityMap.has(st.id);
          return `
                          <tr class="modal-student-row" data-name="${st.name.toLowerCase()}" data-class="${st.class_name}" data-nisn="${st.nisn || ''}" data-nipd="${st.nipd || ''}">
                            <td class="text-center">
                              <input type="checkbox" class="form-check-input modal-student-cb" name="student_ids[]" value="${st.id}" ${isAlreadyPriority ? 'disabled' : ''} onchange="updateModalSelectedCount()">
                            </td>
                            <td class="fw-bold text-dark">
                              ${st.name}
                            </td>
                            <td><span class="badge bg-secondary bg-opacity-10 text-secondary">Kelas ${st.class_name}</span></td>
                            <td class="small text-muted">${st.nisn || st.nipd || '-'}</td>
                            <td>
                              ${isAlreadyPriority ? `
                                <span class="badge bg-warning text-dark"><i class="bi bi-exclamation-triangle-fill"></i> Sudah Prioritas</span>
                              ` : `
                                <span class="badge bg-light text-secondary border">Normal</span>
                              `}
                            </td>
                          </tr>
                        `;
        }).join('')}
                    </tbody>
                  </table>
                </div>

                <!-- Admin Requirements & Notes Section -->
                <div class="p-3 bg-light rounded-4 border">
                  <h6 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <i class="bi bi-card-checklist text-primary"></i> Tentukan Kebutuhan & Catatan Khusus
                  </h6>

                  <div class="row g-3 mb-3">
                    <div class="col-md-4">
                      <div class="form-check card p-2 border shadow-sm">
                        <input class="form-check-input ms-0 me-2" type="checkbox" id="addReqPhoto" name="required_photo" value="1">
                        <label class="form-check-label fw-semibold text-dark cursor-pointer" for="addReqPhoto">
                          ðŸ“· Wajib Foto Profil
                        </label>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-check card p-2 border shadow-sm">
                        <input class="form-check-input ms-0 me-2" type="checkbox" id="addReqKk" name="required_kk" value="1">
                        <label class="form-check-label fw-semibold text-dark cursor-pointer" for="addReqKk">
                          ðŸ“„ Wajib Unggah KK
                        </label>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-check card p-2 border shadow-sm">
                        <input class="form-check-input ms-0 me-2" type="checkbox" id="addReqAkte" name="required_akte" value="1">
                        <label class="form-check-label fw-semibold text-dark cursor-pointer" for="addReqAkte">
                          ðŸ“œ Wajib Unggah Akte
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label for="addNotes" class="form-label fw-semibold text-dark">Catatan / Instruksi Tambahan Admin:</label>
                    <textarea class="form-control" id="addNotes" name="notes" rows="3" placeholder="Contoh: Tolong mintakan Akte Kelahiran asli untuk diverifikasi, atau No HP orang tua belum diisi..."></textarea>
                  </div>
                </div>
              </div>

              <div class="modal-footer bg-light py-3">
                <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-warning rounded-pill px-4 fw-bold shadow-sm" id="btnAddPrioritySubmit">
                  <i class="bi bi-plus-circle me-1"></i> Tambahkan ke Daftar Prioritas
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- EDIT PRIORITY MODAL (ADMIN ONLY) -->
      <div class="modal fade" id="editPriorityModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header bg-warning text-dark rounded-top-4 py-3">
              <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
                <i class="bi bi-pencil-square fs-4"></i> Edit Catatan & Kebutuhan Prioritas
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="editPriorityForm" onsubmit="submitEditPriority(event)">
              <input type="hidden" id="editPriorityId" name="priority_id">
              <div class="modal-body p-4">
                <div class="row g-3 mb-3">
                  <div class="col-4">
                    <div class="form-check card p-2 border">
                      <input class="form-check-input ms-0 me-2" type="checkbox" id="editReqPhoto" name="required_photo" value="1">
                      <label class="form-check-label fw-semibold small" for="editReqPhoto">ðŸ“· Foto Profil</label>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="form-check card p-2 border">
                      <input class="form-check-input ms-0 me-2" type="checkbox" id="editReqKk" name="required_kk" value="1">
                      <label class="form-check-label fw-semibold small" for="editReqKk">ðŸ“„ Unggah KK</label>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="form-check card p-2 border">
                      <input class="form-check-input ms-0 me-2" type="checkbox" id="editReqAkte" name="required_akte" value="1">
                      <label class="form-check-label fw-semibold small" for="editReqAkte">ðŸ“œ Unggah Akte</label>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="editNotes" class="form-label fw-semibold">Catatan Admin:</label>
                  <textarea class="form-control" id="editNotes" name="notes" rows="4"></textarea>
                </div>
              </div>
              <div class="modal-footer bg-light py-3">
                <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- QUICK UPLOAD MODAL FOR TEACHER & ADMIN -->
    <div class="modal fade" id="quickUploadModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-primary text-white rounded-top-4 py-3">
            <h5 class="modal-title fw-bold d-flex align-items-center gap-2" id="quickUploadModalTitle">
              <i class="bi bi-cloud-upload fs-4"></i> Unggah Berkas Siswa
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form id="quickUploadForm" onsubmit="submitQuickUpload(event)">
            <input type="hidden" id="quickUploadStudentId" name="student_id">
            <input type="hidden" id="quickUploadType" name="upload_type">
            <div class="modal-body p-4">
              <div class="mb-3 text-center p-3 bg-light rounded-3 border">
                <div class="fw-bold text-dark fs-5 mb-1" id="quickUploadStudentName">-</div>
                <div class="badge bg-primary rounded-pill" id="quickUploadTypeLabel">-</div>
              </div>

              <div class="mb-3">
                <label for="quickUploadFile" class="form-label fw-bold">Pilih Berkas / Foto dari Perangkat:</label>
                <input class="form-control" type="file" id="quickUploadFile" name="file" required accept="image/*,.pdf">
                <div class="form-text small">Format gambar (JPG, PNG) atau PDF. Maksimal 5MB.</div>
              </div>
            </div>
            <div class="modal-footer bg-light py-3">
              <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm" id="btnQuickUploadSubmit">
                <i class="bi bi-upload me-1"></i> Unggah Berkas
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- CLIENT SIDE INTERACTIVE SCRIPT -->
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        ['editPriorityModal', 'quickUploadModal'].forEach(function(id) {
          const modalEl = document.getElementById(id);
          if (modalEl) {
            modalEl.addEventListener('hide.bs.modal', function() {
              if (modalEl._triggerEl) {
                modalEl._triggerEl.focus();
              } else {
                const active = document.activeElement;
                if (active && modalEl.contains(active)) {
                  active.blur();
                }
              }
            });
          }
        });
      });

      // 1. Complete Priority Student (Centang ✓ dengan Verifikasi Database Server-Side)
      async function completePriorityStudent(priorityId, studentName) {
        const confirmed = await window.showConfirmModal({
          title: 'Verifikasi & Selesaikan Siswa',
          message: 'Proses verifikasi data di database untuk siswa <b>' + studentName + '</b>? Sistem akan mengecek ketersediaan seluruh berkas di database sebelum meloloskan siswa.',
          type: 'info',
          confirmText: 'Ya, Verifikasi'
        });
        if (!confirmed) {
          return;
        }

        try {
          const res = await fetch('/api/priority-students/complete/' + priorityId, {
            method: 'POST'
          });
          const data = await res.json();

          if (data.success) {
            // Animate card removal
            const cardEl = document.getElementById('priority-card-' + priorityId);
            if (cardEl) {
              cardEl.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
              cardEl.style.opacity = '0';
              cardEl.style.transform = 'scale(0.85) translateY(-20px)';
              setTimeout(() => {
                cardEl.remove();
                const grid = document.getElementById('priorityCardsGrid');
                if (grid && grid.querySelectorAll('.card-priority-item').length === 0) {
                  location.reload();
                }
              }, 400);
            }

            // Update stats badge in real-time
            const statTotal = document.getElementById('statTotalPriority');
            if (statTotal) {
              let cur = parseInt(statTotal.innerText, 10) || 0;
              if (cur > 0) statTotal.innerText = cur - 1;
            }

            // Show Floating Toast & Alert
            showToast('Data siswa berhasil diverifikasi dan siswa dinyatakan selesai.', 'success');
          } else {
            // VERIFICATION FAILED: Display missing items list to Teacher
            let errMsg = data.message || 'Siswa belum dapat diselesaikan.';
            if (data.missing_items && Array.isArray(data.missing_items) && data.missing_items.length > 0) {
              errMsg += ' | Rincian berkas yang belum tersimpan: ' + data.missing_items.join(', ');
            }
            showToast('VERIFIKASI DATABASE GAGAL! ' + errMsg, 'danger', 4000);
          }
        } catch (err) {
          console.error(err);
          showToast('Terjadi kesalahan jaringan.', 'danger', 3000);
        }
      }

      // 2. Admin Delete Priority Student
      async function deletePriorityStudent(priorityId, studentName) {
        const confirmed = await window.showConfirmModal({
          title: 'Hapus Dari Prioritas',
          message: 'Apakah Anda yakin ingin menghapus <b>' + studentName + '</b> dari daftar prioritas?',
          type: 'danger',
          confirmText: 'Ya, Hapus'
        });
        if (!confirmed) return;
        try {
          const res = await fetch('/api/priority-students/delete/' + priorityId, { method: 'POST' });
          const data = await res.json();
          if (data.success) {
            const cardEl = document.getElementById('priority-card-' + priorityId);
            if (cardEl) {
              cardEl.remove();
            }
            showToast('info', 'Siswa ' + studentName + ' dihapus dari daftar prioritas.');
            setTimeout(() => location.reload(), 800);
          } else {
            alert(data.message || 'Gagal menghapus');
          }
        } catch (err) {
          alert('Error jaringan');
        }
      }

      // 3. Admin Add Priority Student Form Submit
      async function submitAddPriority(e) {
        e.preventDefault();
        const form = document.getElementById('addPriorityForm');
        const formData = new FormData(form);

        const btn = document.getElementById('btnAddPrioritySubmit');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Menyimpan...';

        try {
          const res = await fetch('/api/priority-students/add', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.success) {
            showToast('success', data.message || 'Siswa berhasil ditambahkan ke daftar prioritas.');
            setTimeout(() => location.reload(), 500);
          } else {
            alert(data.message || 'Gagal menambahkan siswa prioritas.');
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Tambahkan ke Daftar Prioritas';
          }
        } catch (err) {
          alert('Error koneksi server.');
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Tambahkan ke Daftar Prioritas';
        }
      }

      // 4. Admin Edit Priority Modal Open & Submit
      function openEditPriorityModal(priorityId, studentId, notes, reqPhoto, reqKk, reqAkte) {
        const triggerEl = document.activeElement;
        document.getElementById('editPriorityId').value = priorityId;
        document.getElementById('editNotes').value = notes;
        document.getElementById('editReqPhoto').checked = !!reqPhoto;
        document.getElementById('editReqKk').checked = !!reqKk;
        document.getElementById('editReqAkte').checked = !!reqAkte;
        const modalEl = document.getElementById('editPriorityModal');
        if (modalEl) { modalEl._triggerEl = triggerEl; }
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }

      async function submitEditPriority(e) {
        e.preventDefault();
        const form = document.getElementById('editPriorityForm');
        const priorityId = document.getElementById('editPriorityId').value;
        const formData = new FormData(form);

        try {
          const res = await fetch('/api/priority-students/update/' + priorityId, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.success) {
            showToast('success', 'Catatan prioritas berhasil diperbarui.');
            setTimeout(() => location.reload(), 500);
          } else {
            alert(data.message || 'Gagal memperbarui catatan.');
          }
        } catch (err) {
          alert('Error koneksi.');
        }
      }

      // 5. Teacher Quick Upload Modal & Submit
      function openQuickUploadModal(studentId, studentName, uploadType) {
        const triggerEl = document.activeElement;
        document.getElementById('quickUploadStudentId').value = studentId;
        document.getElementById('quickUploadType').value = uploadType;
        document.getElementById('quickUploadStudentName').innerText = studentName;
        
        let typeLabel = 'Berkas';
        if (uploadType === 'photo') typeLabel = '📷 Foto Profil Siswa';
        else if (uploadType === 'kartu_keluarga') typeLabel = '📄 Kartu Keluarga (KK)';
        else if (uploadType === 'akte_kelahiran') typeLabel = '📜 Akte Kelahiran';
        
        document.getElementById('quickUploadTypeLabel').innerText = typeLabel;
        const modalEl = document.getElementById('quickUploadModal');
        if (modalEl) { modalEl._triggerEl = triggerEl; }
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }

      async function submitQuickUpload(e) {
        e.preventDefault();
        const form = document.getElementById('quickUploadForm');
        const formData = new FormData(form);
        const studentId = document.getElementById('quickUploadStudentId').value;

        const btn = document.getElementById('btnQuickUploadSubmit');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Mengunggah...';

        try {
          const res = await fetch('/api/students/' + studentId + '/upload-quick', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.success) {
            showToast('success', 'Berkas berhasil diunggah.');
            setTimeout(() => location.reload(), 600);
          } else {
            alert(data.message || 'Gagal mengunggah berkas.');
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-upload me-1"></i> Unggah Berkas';
          }
        } catch (err) {
          alert('Error koneksi.');
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-upload me-1"></i> Unggah Berkas';
        }
      }

      // 6. Modal Student Filter Helpers
      function filterModalStudents() {
        const search = (document.getElementById('modalStudentSearch')?.value || '').toLowerCase().trim();
        const classFilter = document.getElementById('modalClassFilterSelect')?.value || '';
        const rows = document.querySelectorAll('.modal-student-row');

        rows.forEach(row => {
          const name = row.getAttribute('data-name') || '';
          const cls = row.getAttribute('data-class') || '';
          const nisn = row.getAttribute('data-nisn') || '';
          const nipd = row.getAttribute('data-nipd') || '';

          const matchSearch = !search || name.includes(search) || nisn.includes(search) || nipd.includes(search);
          const matchClass = !classFilter || cls === classFilter;

          if (matchSearch && matchClass) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });

        updateModalSelectedCount();
      }

      function toggleSelectAllModalStudents(checked) {
        const rows = document.querySelectorAll('.modal-student-row');
        const isChecked = checked !== undefined ? checked : !document.getElementById('selectAllCheckbox')?.checked;
        
        rows.forEach(row => {
          if (row.style.display !== 'none') {
            const cb = row.querySelector('.modal-student-cb');
            if (cb) cb.checked = isChecked;
          }
        });
        updateModalSelectedCount();
      }

      function updateModalSelectedCount() {
        const checked = document.querySelectorAll('.modal-student-cb:checked');
        const countSpan = document.getElementById('modalSelectedCount');
        if (countSpan) countSpan.innerText = checked.length;
      }

      // Helper toast function
      function showToast(type, message) {
        const container = document.getElementById('appToastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'app-toast app-toast-' + type;
        toast.innerHTML = '<div class="app-toast-icon"><i class="bi bi-' + (type === 'success' ? 'check-lg' : 'info-circle') + '"></i></div><div>' + message + '</div>';
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 350);
        }, 3000);
      }
    </script>
  `;
}

// ============================================================
// MANAJEMEN KENAIKAN KELAS & KELULUSAN SISWA (ADMIN ONLY)
// ============================================================

