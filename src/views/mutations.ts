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

  mutations.forEach(m => {
    if (m.status === 'pending') countPending++;
    if (m.mutation_type === 'pindah_sekolah') countPindah++;
    else if (m.mutation_type === 'tidak_bersekolah') countTidakBersekolah++;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return `
  ${flashMessage ? `
  <div class="alert alert-success alert-dismissible fade show rounded-4 shadow-sm border-0 mb-3" role="alert" style="background: linear-gradient(135deg, #10b98115 0%, #05966908 100%); border-left: 4px solid #10b981 !important;">
    <div class="d-flex align-items-center gap-2">
      <i class="bi bi-check-circle-fill text-success fs-5"></i>
      <span class="fw-semibold text-dark">${flashMessage}</span>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>` : ''}

  <!-- Stat Summary Cards Row -->
  <div class="row g-2 mb-3">
    <div class="col-md-3">
      <div class="small-box-custom" style="background: var(--primary-gradient);">
        <div class="inner">
          <h3 class="m-0">${mutations.length}</h3>
          <p class="mb-0 opacity-90 fw-semibold small">Total Mutasi Siswa</p>
        </div>
        <i class="bi bi-person-x-fill icon-bg"></i>
      </div>
    </div>
    <div class="col-md-3">
      <div class="small-box-custom" style="background: var(--warning-gradient);">
        <div class="inner">
          <h3 class="m-0">${countPending}</h3>
          <p class="mb-0 opacity-90 fw-semibold small">Menunggu Persetujuan</p>
        </div>
        <i class="bi bi-clock-history icon-bg"></i>
      </div>
    </div>
    <div class="col-md-3">
      <div class="small-box-custom" style="background: var(--info-gradient);">
        <div class="inner">
          <h3 class="m-0">${countPindah}</h3>
          <p class="mb-0 opacity-90 fw-semibold small">Pindah Sekolah</p>
        </div>
        <i class="bi bi-box-arrow-right icon-bg"></i>
      </div>
    </div>
    <div class="col-md-3">
      <div class="small-box-custom" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
        <div class="inner">
          <h3 class="m-0 text-white">${countTidakBersekolah}</h3>
          <p class="mb-0 opacity-90 fw-semibold small text-white-50">Tidak Bersekolah</p>
        </div>
        <i class="bi bi-dash-circle-fill icon-bg"></i>
      </div>
    </div>
  </div>

  <div class="card p-3 mb-4">
    <div class="card-header">
      <h5 class="card-title fw-bold m-0"><i class="bi bi-person-lines-fill text-primary me-2"></i> Data Mutasi Siswa</h5>
    </div>
    <div class="card-body px-0">
      <!-- Toolbar Search & Add Button Header Bar -->
      <div class="bg-light p-3 rounded-4 mb-4 mx-3 border d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div class="input-group input-group-sm" style="width: 300px;">
          <span class="input-group-text bg-white border-end-0 rounded-start-pill ps-3"><i class="bi bi-search text-muted"></i></span>
          <input type="text" id="mutationSearchInput" class="form-control border-start-0 rounded-end-pill pe-3" placeholder="Cari nama / NISN / NIK / alasan..." />
        </div>

        ${userRole !== 'siswa' ? `
        <button class="btn btn-sm btn-primary rounded-pill px-3 py-2 shadow-sm fw-bold d-inline-flex align-items-center gap-1.5 text-nowrap" data-bs-toggle="modal" data-bs-target="#addMutationModal">
          <i class="bi bi-person-dash-fill fs-6"></i>
          <span>Tambah Mutasi Siswa</span>
        </button>` : ''}
      </div>

      <!-- Mutation Table -->
      <div class="table-responsive">
        <table class="table table-bordered table-hover align-middle mb-0">
          <thead class="table-light text-dark fw-bold">
            <tr>
              <th class="text-center" style="width: 50px;">No</th>
              <th style="width: 110px;">Tanggal</th>
              <th>Nama Siswa</th>
              <th style="width: 90px;">Kelas</th>
              <th>NIK</th>
              <th>NIPD</th>
              <th>NISN</th>
              <th>Alasan & Status Mutasi</th>
              <th>Sekolah Tujuan</th>
            </tr>
          </thead>
          <tbody id="mutationTableBody">
            ${mutations.length === 0 ? `<tr><td colspan="9" class="text-center text-muted py-4">Belum ada data mutasi siswa.</td></tr>` : ''}
            ${mutations.map((m, i) => `
            <tr class="mutation-row">
              <td class="text-center fw-semibold text-secondary">${i + 1}</td>
              <td>${formatWITDate(m.mutation_date)}</td>
              <td class="fw-bold text-dark">${m.student_name || '-'}</td>
              <td><span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-0.5 rounded-pill">${m.class_name || '-'}</span></td>
              <td>${m.nik || '-'}</td>
              <td>${m.nipd || '-'}</td>
              <td>${m.nisn || '-'}</td>
              <td>
                <div class="d-flex align-items-center flex-wrap gap-1 mb-1">
                  ${m.mutation_type === 'pindah_sekolah' ? 
                    '<span class="badge bg-warning text-dark border border-warning border-opacity-50"><i class="bi bi-box-arrow-right me-1"></i>Pindah Sekolah</span>' : 
                    '<span class="badge bg-dark text-white border border-secondary"><i class="bi bi-x-circle-fill me-1"></i>Tidak Bersekolah</span>'
                  }
                  
                  ${m.status === 'pending' ? '<span class="badge bg-warning bg-opacity-20 text-dark border border-warning"><i class="bi bi-clock-history me-1"></i>Menunggu Admin</span>' : ''}
                  ${m.status === 'approved' ? '<span class="badge bg-success bg-opacity-15 text-success border border-success"><i class="bi bi-check-circle-fill me-1"></i>Disetujui</span>' : ''}
                  ${m.status === 'rejected' ? '<span class="badge bg-danger bg-opacity-15 text-danger border border-danger"><i class="bi bi-x-circle-fill me-1"></i>Ditolak</span>' : ''}
                  ${m.status === 'cancelled' ? '<span class="badge bg-secondary bg-opacity-15 text-secondary border border-secondary"><i class="bi bi-arrow-counterclockwise me-1"></i>Dikembalikan / Dibatalkan</span>' : ''}
                </div>
                <div class="small text-secondary mb-1">${m.reason}</div>
                ${m.rejection_note ? `<div class="small text-danger fw-semibold"><i class="bi bi-info-circle me-1"></i>Catatan: ${m.rejection_note}</div>` : ''}

                ${(userRole === 'admin' && m.status === 'pending') ? `
                <div class="mt-2 pt-2 border-top d-flex align-items-center gap-1.5">
                  <form action="/api/admin/mutations/${m.id}/approve" method="post" class="d-inline">
                    <button type="submit" class="btn btn-sm btn-success rounded-pill px-2.5 py-0.5 fw-bold" onclick="return confirm('Setujui pengajuan mutasi siswa ini? Siswa akan dimutasi.');">
                      <i class="bi bi-check-lg me-1"></i>Setujui
                    </button>
                  </form>
                  <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-0.5 fw-bold" onclick="openRejectMutationModal('${m.id}', '${(m.student_name || '').replace(/'/g, "\\'")}')">
                    <i class="bi bi-x-lg me-1"></i>Tolak
                  </button>
                </div>
                ` : ''}

                ${(userRole === 'admin' && (m.status === 'approved' || !m.status)) ? `
                <div class="mt-2 pt-2 border-top">
                  <form action="/api/admin/mutations/${m.id}/restore" method="post" class="d-inline">
                    <button type="submit" class="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-0.5 fw-bold" onclick="return confirm('Kembalikan siswa ini ke daftar siswa aktif? Status mutasi akan dibatalkan.');">
                      <i class="bi bi-arrow-counterclockwise me-1"></i>Kembalikan Siswa Aktif
                    </button>
                  </form>
                </div>
                ` : ''}
              </td>
              <td class="fw-semibold text-dark">
                ${m.mutation_type === 'pindah_sekolah' ? (m.destination_school || '-') : '-'}
              </td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal Tambah Mutasi Siswa -->
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

  <!-- Modal Tolak Mutasi (Admin) -->
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

  <script>
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

    document.addEventListener('DOMContentLoaded', function() {
      const searchInput = document.getElementById('mutationSearchInput');
      const tableRows = document.querySelectorAll('#mutationTableBody tr.mutation-row');

      if (searchInput) {
        const filterMutations = function() {
          const searchVal = searchInput.value.toLowerCase().trim();
          tableRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = (!searchVal || text.includes(searchVal)) ? '' : 'none';
          });
        };
        searchInput.addEventListener('input', filterMutations);
        searchInput.addEventListener('keyup', filterMutations);
      }

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
