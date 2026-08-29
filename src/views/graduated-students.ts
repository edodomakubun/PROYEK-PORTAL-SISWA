import { Student, MasterClass, StudentClassHistory, StudentDocument, Role, User } from '../types';
import { DEFAULT_AVATAR, formatWIT, formatWITDate } from './helpers';
import { renderLayout } from './layout';

export function renderGraduatedStudentsPage(
  students: Student[],
  masterClasses: MasterClass[],
  yearsList: string[],
  search: string,
  yearFilter: string,
  userRole: Role
): string {
  const yearSelectOptions = yearsList.map(y =>
    `<option value="${y}" ${y === yearFilter ? 'selected' : ''}>Tahun Lulus ${y}</option>`
  ).join('');

  const activeClassOptions = masterClasses.map(c =>
    `<option value="${c.id}">${c.name} (Tingkat ${c.level})</option>`
  ).join('');

  let tableRows = '';
  if (students.length === 0) {
    tableRows = `<tr><td colspan="7" class="text-center text-muted py-5"><i class="bi bi-mortarboard fs-1 d-block mb-2 text-secondary opacity-50"></i>Tidak ada data siswa lulusan yang ditemukan.</td></tr>`;
  } else {
    tableRows = students.map((s, i) => `
      <tr>
        <td class="text-center fw-semibold text-secondary">${i + 1}</td>
        <td class="fw-bold text-dark">${s.nipd || '-'}</td>
        <td class="fw-semibold text-secondary">${s.nisn || '-'}</td>
        <td class="fw-bold text-primary">${s.name}</td>
        <td class="small text-dark">${s.birth_place ? `${s.birth_place}, ` : ''}${s.birth_date || '-'}</td>
        <td><span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1 fw-bold">${s.graduation_year || '-'}</span></td>
        <td class="text-center">
          <div class="d-flex align-items-center justify-content-center gap-1">
            <a href="/admin/graduated-students/${s.id}" class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold shadow-sm">
              <i class="bi bi-eye-fill me-1"></i> Detail
            </a>
            ${userRole === 'admin' ? `
            <button type="button" class="btn btn-sm btn-outline-warning rounded-pill px-2.5 fw-bold shadow-sm" onclick="openRestoreModal(${s.id}, '${s.name}', '${s.class_name || 'Kelas 6'}')">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Batalkan Lulus
            </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  return `
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h5 class="card-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
          <i class="bi bi-mortarboard-fill text-success fs-4"></i> Daftar Siswa Lulusan
        </h5>
        <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1.5 rounded-pill fw-bold">
          Total Lulusan: ${students.length} Siswa
        </span>
      </div>

      <div class="card-body p-4">
        <!-- Filter Bar -->
        <form method="GET" action="/admin/graduated-students" class="row g-3 align-items-end mb-4 bg-light p-3 rounded-4 border">
          <div class="col-md-5">
            <label class="form-label small fw-bold text-dark">Cari Nama Siswa / NIPD / NISN:</label>
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input type="text" name="search" class="form-control border-start-0" placeholder="Ketik kata kunci pencarian..." value="${search}" />
            </div>
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-bold text-dark">Filter Tahun Lulus:</label>
            <select name="year" class="form-select rounded-pill">
              <option value="">-- Semua Tahun Lulus --</option>
              ${yearSelectOptions}
            </select>
          </div>
          <div class="col-md-3 d-flex gap-2">
            <button type="submit" class="btn btn-primary w-100 rounded-pill fw-bold shadow-sm">
              <i class="bi bi-filter me-1"></i> Filter
            </button>
            <a href="/admin/graduated-students" class="btn btn-outline-secondary rounded-pill px-3" title="Reset Filter">
              <i class="bi bi-arrow-counterclockwise"></i>
            </a>
          </div>
        </form>

        <!-- Tabel Ringkas Utama (NIPD & NISN Dipisah) -->
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 border rounded-4 overflow-hidden">
            <thead class="table-light">
              <tr>
                <th class="text-center" width="5%">No</th>
                <th width="15%">NIPD</th>
                <th width="15%">NISN</th>
                <th width="25%">Nama Siswa</th>
                <th width="18%">Tempat, Tgl Lahir</th>
                <th width="10%">Tahun Lulus</th>
                <th class="text-center" width="17%">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL PEMBATALAN KELULUSAN / RESTORE SISWA -->
    <div class="modal fade" id="restoreStudentModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-warning text-dark py-3">
            <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
              <i class="bi bi-arrow-counterclockwise fs-4"></i> Batalkan Kelulusan Siswa
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <div class="alert alert-warning bg-warning bg-opacity-10 border-warning rounded-4 p-3 mb-3">
              <p class="mb-0 text-dark" id="restoreModalText">
                Kembalikan status siswa menjadi <strong>Aktif</strong>?
              </p>
            </div>

            <input type="hidden" id="restoreStudentId" value="" />

            <div class="mb-3">
              <label class="form-label fw-bold text-dark small">Pilih Kelas Aktif Tujuan Pengembalian:</label>
              <select id="restoreClassSelect" class="form-select rounded-pill fw-semibold">
                ${activeClassOptions}
              </select>
            </div>
            <p class="small text-muted mb-0">
              <i class="bi bi-info-circle me-1"></i> Status kelulusan siswa akan dihapus dan siswa akan dikembalikan ke daftar Siswa Aktif pada kelas yang Anda pilih.
            </p>
          </div>
          <div class="modal-footer bg-light py-3">
            <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-warning rounded-pill px-4 fw-bold shadow-sm text-dark" id="btnSubmitRestore" onclick="executeRestoreStudent()">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Ya, Kembalikan Siswa
            </button>
          </div>
        </div>
      </div>
    </div>

    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const modalEl = document.getElementById('restoreStudentModal');
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

      function openRestoreModal(studentId, studentName, currentClassName) {
        const triggerEl = document.activeElement;
        document.getElementById('restoreStudentId').value = studentId;
        document.getElementById('restoreModalText').innerHTML = "Apakah Anda yakin ingin membatalkan kelulusan <strong>" + studentName + "</strong> dan mengembalikannya ke status Siswa Aktif?";
        
        const modalEl = document.getElementById('restoreStudentModal');
        if (modalEl) {
          modalEl._triggerEl = triggerEl;
        }
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }

      async function executeRestoreStudent() {
        const studentId = document.getElementById('restoreStudentId').value;
        const targetClassId = document.getElementById('restoreClassSelect').value;

        if (!studentId || !targetClassId) return;

        const btn = document.getElementById('btnSubmitRestore');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Memproses...';

        try {
          const res = await fetch('/api/students/restore-graduated', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              student_id: studentId,
              target_class_id: targetClassId
            })
          });

          const data = await res.json();
          if (data.success) {
            showToast(data.message || 'Kelulusan berhasil dibatalkan.', 'success', 2500);
            setTimeout(() => location.reload(), 600);
          } else {
            alert('Gagal Memproses: ' + (data.message || 'Terjadi kesalahan.'));
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-arrow-counterclockwise me-1"></i> Ya, Kembalikan Siswa';
          }
        } catch (err) {
          console.error(err);
          alert('Terjadi kesalahan jaringan.');
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-arrow-counterclockwise me-1"></i> Ya, Kembalikan Siswa';
        }
      }
    </script>
  `;
}

// ============================================================
// HALAMAN DETAIL SISWA LULUSAN (DOKUMEN & RIWAYAT LENGKAP + BATAL LULUS)
// ============================================================
export function renderGraduatedStudentDetailPage(
  student: Student,
  documents: StudentDocument[],
  classHistory: StudentClassHistory[],
  masterClasses: MasterClass[],
  userRole: Role
): string {
  const akteDoc = documents.find(d => d.doc_type === 'akte_kelahiran');
  const kkDoc = documents.find(d => d.doc_type === 'kartu_keluarga');

  const activeClassOptions = masterClasses.map(c =>
    `<option value="${c.id}">${c.name} (Tingkat ${c.level})</option>`
  ).join('');

  let historyRows = '';
  if (classHistory.length === 0) {
    historyRows = `<tr><td colspan="5" class="text-center text-muted py-3">Tidak ada catatan riwayat kenaikan kelas.</td></tr>`;
  } else {
    historyRows = classHistory.map((h, i) => `
      <tr>
        <td class="text-center text-secondary">${i + 1}</td>
        <td class="fw-semibold text-dark">${h.from_class_name || 'Awal Masuk'}</td>
        <td>
          ${h.status === 'graduated'
        ? '<span class="badge bg-success px-2.5 py-1 rounded-pill"><i class="bi bi-mortarboard-fill me-1"></i>LULUS</span>'
        : (h.status === 'reverted'
          ? `<span class="badge bg-warning text-dark px-2.5 py-1 rounded-pill"><i class="bi bi-arrow-counterclockwise me-1"></i>Dikembalikan ke ${h.to_class_name || '-'}</span>`
          : `<span class="badge bg-primary px-2.5 py-1 rounded-pill"><i class="bi bi-arrow-right me-1"></i>${h.to_class_name || '-'}</span>`)}
        </td>
        <td class="small text-muted">${h.academic_year || '-'}</td>
        <td class="small text-secondary">${h.processed_at || '-'}</td>
      </tr>
    `).join('');
  }

  return `
    <!-- Navigation Back -->
    <div class="mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
      <a href="/admin/graduated-students" class="btn btn-secondary bg-secondary bg-opacity-10 text-dark border-0 rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-2 small">
        <i class="bi bi-arrow-left fs-6"></i>
        <span>Kembali ke Daftar Siswa Lulusan</span>
      </a>

      ${userRole === 'admin' ? `
      <button type="button" class="btn btn-warning rounded-pill px-3.5 py-1.5 fw-bold shadow-sm text-dark d-inline-flex align-items-center gap-2 small" onclick="openRestoreModal(${student.id}, '${student.name}', '${student.class_name}')">
        <i class="bi bi-arrow-counterclockwise fs-6"></i>
        <span>Batalkan Kelulusan & Kembalikan ke Kelas</span>
      </button>
      ` : ''}
    </div>

    <!-- Banner Header Detail Lulusan -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-white">
      <div class="card-body p-4">
        <div class="row align-items-center g-3">
          <div class="col-auto text-center mx-auto mx-md-0">
            <img src="${student.photo_url || DEFAULT_AVATAR}" 
                 class="avatar-lg shadow-sm border border-3 border-success" 
                 style="width: 100px; height: 100px; object-fit: cover; border-radius: 50%;"
                 alt="Foto ${student.name}" />
          </div>

          <div class="col-12 col-md text-center text-md-start">
            <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2 flex-wrap mb-1">
              <h4 class="fw-bold text-dark m-0 fs-4">${student.name}</h4>
              <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1 fw-bold fs-6">
               STATUS: LULUS
              </span>
            </div>
            <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2 flex-wrap text-muted small mt-2">
              <span class="badge bg-light text-dark border px-3 py-1 rounded-pill">NIPD: <strong class="text-primary">${student.nipd || '-'}</strong></span>
              <span class="badge bg-light text-dark border px-3 py-1 rounded-pill">NISN: <strong>${student.nisn || '-'}</strong></span>
              <span class="badge bg-light text-dark border px-3 py-1 rounded-pill">NIK: <strong>${student.nik || '-'}</strong></span>
              <span class="badge bg-light text-dark border px-3 py-1 rounded-pill">Tahun Lulus: <strong class="text-success">${student.graduation_year || '-'}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid Detail Lulusan -->
    <div class="row g-4 mb-4">
      <!-- 1. DATA IDENTITAS SISWA -->
      <div class="col-lg-6">
        <div class="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white">
          <h6 class="fw-bold text-primary mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
            <i class="bi bi-person-vcard fs-5"></i> 1. Data Identitas Siswa
          </h6>
          <div class="row g-3 small">
            <div class="col-6"><span class="text-muted d-block">NIPD</span><strong class="text-dark fs-6">${student.nipd || '-'}</strong></div>
            <div class="col-6"><span class="text-muted d-block">NISN</span><strong class="text-dark fs-6">${student.nisn || '-'}</strong></div>
            <div class="col-12"><span class="text-muted d-block">NIK</span><strong class="text-dark">${student.nik || '-'}</strong></div>
            <div class="col-12"><span class="text-muted d-block">Nama Lengkap</span><strong class="text-dark fs-6">${student.name}</strong></div>
            <div class="col-6"><span class="text-muted d-block">Tempat Lahir</span><strong class="text-dark">${student.birth_place || '-'}</strong></div>
            <div class="col-6"><span class="text-muted d-block">Tanggal Lahir</span><strong class="text-dark">${student.birth_date || '-'}</strong></div>
          </div>
        </div>
      </div>

      <!-- 2. DATA ORANG TUA -->
      <div class="col-lg-6">
        <div class="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white">
          <h6 class="fw-bold text-success mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
            <i class="bi bi-people fs-5"></i> 2. Data Orang Tua
          </h6>
          <div class="row g-3 small">
            <div class="col-12">
              <span class="text-muted d-block">Nama Ayah Kandung</span>
              <strong class="text-dark fs-6">${student.father_name || '-'}</strong>
              ${student.is_father_alive === 0 ? '<span class="badge bg-secondary ms-2">(Alm.)</span>' : '<span class="badge bg-success bg-opacity-10 text-success ms-2">Masih Hidup</span>'}
            </div>
            <div class="col-12 mt-3">
              <span class="text-muted d-block">Nama Ibu Kandung</span>
              <strong class="text-dark fs-6">${student.mother_name || '-'}</strong>
              ${student.is_mother_alive === 0 ? '<span class="badge bg-secondary ms-2">(Alm.)</span>' : '<span class="badge bg-success bg-opacity-10 text-success ms-2">Masih Hidup</span>'}
            </div>
          </div>
        </div>
      </div>

      <!-- 3. DOKUMEN LEGAL SISWA -->
      <div class="col-lg-6">
        <div class="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white">
          <h6 class="fw-bold text-danger mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
            <i class="bi bi-folder-check fs-5"></i> 3. Dokumen Legal Siswa
          </h6>
          <div class="d-flex flex-column gap-3">
            <!-- Foto Profil -->
            <div class="d-flex align-items-center justify-content-between p-2.5 border rounded-3 bg-light">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-camera-fill text-primary fs-5"></i>
                <span class="fw-semibold text-dark small">Foto Profil Siswa</span>
              </div>
              ${student.photo_url
      ? `<a href="${student.photo_url}" target="_blank" class="btn btn-sm btn-outline-primary rounded-pill px-3">Lihat Foto</a>`
      : '<span class="badge bg-secondary">Belum ada</span>'}
            </div>

            <!-- Akte Kelahiran -->
            <div class="d-flex align-items-center justify-content-between p-2.5 border rounded-3 bg-light">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-file-earmark-pdf-fill text-danger fs-5"></i>
                <span class="fw-semibold text-dark small">Akte Kelahiran</span>
              </div>
              ${akteDoc
      ? `<a href="${akteDoc?.file_url || ""}" target="_blank" class="btn btn-sm btn-outline-danger rounded-pill px-3">Lihat Akte</a>`
      : '<span class="badge bg-secondary">Belum ada</span>'}
            </div>

            <!-- Kartu Keluarga -->
            <div class="d-flex align-items-center justify-content-between p-2.5 border rounded-3 bg-light">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-file-earmark-text-fill text-warning fs-5"></i>
                <span class="fw-semibold text-dark small">Kartu Keluarga (KK)</span>
              </div>
              ${kkDoc
      ? `<a href="${kkDoc?.file_url || ""}" target="_blank" class="btn btn-sm btn-outline-warning rounded-pill px-3 text-dark">Lihat KK</a>`
      : '<span class="badge bg-secondary">Belum ada</span>'}
            </div>
          </div>
        </div>
      </div>

      <!-- 4. DATA AKADEMIK & KELULUSAN -->
      <div class="col-lg-6">
        <div class="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white">
          <h6 class="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
            <i class="bi bi-award-fill text-warning fs-5"></i> 4. Data Akademik & Kelulusan
          </h6>
          <div class="row g-3 small">
            <div class="col-6"><span class="text-muted d-block">Kelas Terakhir</span><strong class="text-dark fs-6">${student.class_name || 'Kelas 6'}</strong></div>
            <div class="col-6"><span class="text-muted d-block">Status Akademik</span><span class="badge bg-success px-3 py-1 rounded-pill fw-bold">LULUS</span></div>
            <div class="col-6"><span class="text-muted d-block">Tahun Lulus</span><strong class="text-dark fs-6">${student.graduation_year || '-'}</strong></div>
            <div class="col-6"><span class="text-muted d-block">Tanggal Kelulusan</span><strong class="text-dark">${student.graduation_date || '-'}</strong></div>
          </div>
        </div>
      </div>

      <!-- 5. TIMELINE RIWAYAT KENAIKAN KELAS -->
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <h6 class="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
            <i class="bi bi-clock-history text-primary fs-5"></i> Riwayat Kenaikan Kelas & Kelulusan Siswa
          </h6>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="text-center" width="5%">No</th>
                  <th width="25%">Kelas Asal</th>
                  <th width="30%">Kelas Tujuan / Status</th>
                  <th width="20%">Tahun Ajaran</th>
                  <th width="20%">Waktu Diproses</th>
                </tr>
              </thead>
              <tbody>
                ${historyRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL PEMBATALAN KELULUSAN / RESTORE SISWA -->
    <div class="modal fade" id="restoreStudentModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-warning text-dark py-3">
            <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
              <i class="bi bi-arrow-counterclockwise fs-4"></i> Batalkan Kelulusan Siswa
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <div class="alert alert-warning bg-warning bg-opacity-10 border-warning rounded-4 p-3 mb-3">
              <p class="mb-0 text-dark" id="restoreModalText">
                Kembalikan status siswa <strong>${student.name}</strong> menjadi Aktif?
              </p>
            </div>

            <input type="hidden" id="restoreStudentId" value="${student.id}" />

            <div class="mb-3">
              <label class="form-label fw-bold text-dark small">Pilih Kelas Aktif Tujuan Pengembalian:</label>
              <select id="restoreClassSelect" class="form-select rounded-pill fw-semibold">
                ${activeClassOptions}
              </select>
            </div>
            <p class="small text-muted mb-0">
              <i class="bi bi-info-circle me-1"></i> Status kelulusan siswa akan dihapus dan siswa akan dikembalikan ke daftar Siswa Aktif pada kelas yang Anda pilih.
            </p>
          </div>
          <div class="modal-footer bg-light py-3">
            <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-warning rounded-pill px-4 fw-bold shadow-sm text-dark" id="btnSubmitRestore" onclick="executeRestoreStudent()">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Ya, Kembalikan Siswa
            </button>
          </div>
        </div>
      </div>
    </div>

    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const modalEl = document.getElementById('restoreStudentModal');
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

      function openRestoreModal(studentId, studentName, currentClassName) {
        const triggerEl = document.activeElement;
        document.getElementById('restoreStudentId').value = studentId;
        document.getElementById('restoreModalText').innerHTML = "Apakah Anda yakin ingin membatalkan kelulusan <strong>" + studentName + "</strong> dan mengembalikannya ke status Siswa Aktif?";
        
        const modalEl = document.getElementById('restoreStudentModal');
        if (modalEl) {
          modalEl._triggerEl = triggerEl;
        }
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }

      async function executeRestoreStudent() {
        const studentId = document.getElementById('restoreStudentId').value;
        const targetClassId = document.getElementById('restoreClassSelect').value;

        if (!studentId || !targetClassId) return;

        const btn = document.getElementById('btnSubmitRestore');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Memproses...';

        try {
          const res = await fetch('/api/students/restore-graduated', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              student_id: studentId,
              target_class_id: targetClassId
            })
          });

          const data = await res.json();
          if (data.success) {
            showToast(data.message || 'Kelulusan berhasil dibatalkan.', 'success', 2500);
            setTimeout(() => {
              window.location.href = '/admin/graduated-students';
            }, 600);
          } else {
            alert('Gagal Memproses: ' + (data.message || 'Terjadi kesalahan.'));
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-arrow-counterclockwise me-1"></i> Ya, Kembalikan Siswa';
          }
        } catch (err) {
          console.error(err);
          alert('Terjadi kesalahan jaringan.');
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-arrow-counterclockwise me-1"></i> Ya, Kembalikan Siswa';
        }
      }
    </script>
  `;
}






