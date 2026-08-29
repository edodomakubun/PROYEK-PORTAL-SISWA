import { User } from '../types';
import { renderLayout } from './layout';

export function renderAdminSettingsPage(
  settings: Record<string, string>,
  flash: string
): string {
  const allowPhoto = settings.allow_photo_upload !== '0';
  const allowAkte = settings.allow_akte_upload !== '0';
  const allowKK = settings.allow_kk_upload !== '0';

  const teacherDeletePhoto = settings.teacher_delete_photo === '1';
  const teacherDeleteKk = settings.teacher_delete_kk === '1';
  const teacherDeleteAkte = settings.teacher_delete_akte === '1';

  return `
    ${flash ? `<div class="alert alert-info py-2.5 px-3 rounded-3 shadow-sm mb-4"><i class="bi bi-info-circle-fill me-2"></i>${flash}</div>` : ''}

    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="card border-0 shadow-sm rounded-4 mb-4">
          <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <h5 class="card-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-sliders text-danger fs-4"></i> Setelan & Kontrol Fitur Portal
            </h5>
            <span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1.5 rounded-pill fw-semibold">
              <i class="bi bi-shield-lock me-1"></i> Khusus Admin
            </span>
          </div>

          <div class="card-body p-4">
            <!-- Section 1: Pembatasan Upload -->
            <div class="alert alert-primary bg-primary bg-opacity-10 border border-primary border-opacity-25 py-3 px-4 rounded-4 mb-4">
              <div class="d-flex gap-3 align-items-center">
                <i class="bi bi-info-circle-fill fs-2 text-primary"></i>
                <div>
                  <h6 class="fw-bold mb-1 text-primary">Pengaturan Pembatasan Fitur Upload</h6>
                  <p class="mb-0 small text-secondary">
                    Gunakan sakelar di bawah ini untuk mengontrol atau membatasi akses pengunggahan berkas oleh Siswa secara global.
                    Jika status dinonaktifkan (Dibatasi), siswa biasa tidak akan bisa mengunggah berkas tersebut <strong>KECUALI</strong> siswa yang bersangkutan telah dipilih secara khusus oleh Admin melalui menu Siswa Prioritas. (Guru/Admin tetap bebas mengunggah kapan saja).
                  </p>
                </div>
              </div>
            </div>

            <form action="/admin/settings/update" method="POST">
              <!-- Grid Fitur Upload -->
              <div class="row g-4 mb-4">
                <!-- 1. SAKELAR UPLOAD FOTO PROFIL -->
                <div class="col-md-4">
                  <div class="card h-100 border rounded-4 p-3 shadow-sm bg-body text-start position-relative">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <div class="p-2.5 rounded-3 bg-primary bg-opacity-10 text-primary">
                        <i class="bi bi-camera-fill fs-3"></i>
                      </div>
                      <div class="form-check form-switch fs-4 mb-0">
                        <input class="form-check-input" type="checkbox" name="allow_photo_upload" id="switchPhoto" value="1" ${allowPhoto ? 'checked' : ''} />
                      </div>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">Upload Foto Profil</h6>
                    <p class="small text-muted mb-3">Mengizinkan Siswa untuk mengunggah atau memperbarui Foto Profil secara mandiri.</p>
                    <div class="mt-auto">
                      ${allowPhoto
      ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1"><i class="bi bi-check-circle-fill me-1"></i>Status: DIIZINKAN</span>'
      : '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-1"><i class="bi bi-slash-circle-fill me-1"></i>Status: DIBATASI</span>'}
                    </div>
                  </div>
                </div>

                <!-- 2. SAKELAR UPLOAD AKTE KELAHIRAN -->
                <div class="col-md-4">
                  <div class="card h-100 border rounded-4 p-3 shadow-sm bg-body text-start position-relative">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <div class="p-2.5 rounded-3 bg-danger bg-opacity-10 text-danger">
                        <i class="bi bi-file-earmark-pdf-fill fs-3"></i>
                      </div>
                      <div class="form-check form-switch fs-4 mb-0">
                        <input class="form-check-input" type="checkbox" name="allow_akte_upload" id="switchAkte" value="1" ${allowAkte ? 'checked' : ''} />
                      </div>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">Upload File Akte Kelahiran</h6>
                    <p class="small text-muted mb-3">Mengizinkan Siswa untuk mengunggah berkas Akte Kelahiran secara mandiri.</p>
                    <div class="mt-auto">
                      ${allowAkte
      ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1"><i class="bi bi-check-circle-fill me-1"></i>Status: DIIZINKAN</span>'
      : '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-1"><i class="bi bi-slash-circle-fill me-1"></i>Status: DIBATASI</span>'}
                    </div>
                  </div>
                </div>

                <!-- 3. SAKELAR UPLOAD KARTU KELUARGA (KK) -->
                <div class="col-md-4">
                  <div class="card h-100 border rounded-4 p-3 shadow-sm bg-body text-start position-relative">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <div class="p-2.5 rounded-3 bg-warning bg-opacity-10 text-warning">
                        <i class="bi bi-file-earmark-text-fill fs-3"></i>
                      </div>
                      <div class="form-check form-switch fs-4 mb-0">
                        <input class="form-check-input" type="checkbox" name="allow_kk_upload" id="switchKK" value="1" ${allowKK ? 'checked' : ''} />
                      </div>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">Upload File Kartu Keluarga</h6>
                    <p class="small text-muted mb-3">Mengizinkan Siswa untuk mengunggah berkas Kartu Keluarga (KK) secara mandiri.</p>
                    <div class="mt-auto">
                      ${allowKK
      ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1"><i class="bi bi-check-circle-fill me-1"></i>Status: DIIZINKAN</span>'
      : '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-1"><i class="bi bi-slash-circle-fill me-1"></i>Status: DIBATASI</span>'}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 2: Hak Akses Penghapusan Dokumen oleh Guru (Teacher) -->
              <div class="alert alert-danger bg-danger bg-opacity-10 border border-danger border-opacity-25 py-3 px-4 rounded-4 mb-4 mt-5">
                <div class="d-flex gap-3 align-items-center">
                  <i class="bi bi-shield-lock-fill fs-2 text-danger"></i>
                  <div>
                    <h6 class="fw-bold mb-1 text-danger">Pengaturan Hak Akses Penghapusan Dokumen oleh Guru (Teacher)</h6>
                    <p class="mb-0 small text-secondary">
                      Secara default, hanya Admin yang dapat menghapus berkas siswa dari Cloudflare R2 & D1.
                      Gunakan sakelar di bawah ini jika ingin memberikan wewenang kepada <strong>Teacher (Guru)</strong> untuk menghapus dokumen tertentu.
                    </p>
                  </div>
                </div>
              </div>

              <div class="row g-4 mb-4">
                <!-- 1. Teacher Delete Photo -->
                <div class="col-md-4">
                  <div class="card h-100 border rounded-4 p-3 shadow-sm bg-body text-start position-relative">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <div class="p-2.5 rounded-3 bg-danger bg-opacity-10 text-danger">
                        <i class="bi bi-person-bounding-box fs-3"></i>
                      </div>
                      <div class="form-check form-switch fs-4 mb-0">
                        <input class="form-check-input" type="checkbox" name="teacher_delete_photo" id="switchTeacherDeletePhoto" value="1" ${teacherDeletePhoto ? 'checked' : ''} />
                      </div>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">Guru Hapus Foto Siswa</h6>
                    <p class="small text-muted mb-3">Mengizinkan Guru (Teacher) untuk menghapus Foto Profil siswa secara permanen dari Cloudflare R2 & D1.</p>
                    <div class="mt-auto">
                      ${teacherDeletePhoto
      ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1"><i class="bi bi-check-circle-fill me-1"></i>Hak Akses: DIIZINKAN</span>'
      : '<span class="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill px-3 py-1"><i class="bi bi-lock-fill me-1"></i>Hak Akses: TERKUNCI</span>'}
                    </div>
                  </div>
                </div>

                <!-- 2. Teacher Delete KK -->
                <div class="col-md-4">
                  <div class="card h-100 border rounded-4 p-3 shadow-sm bg-body text-start position-relative">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <div class="p-2.5 rounded-3 bg-warning bg-opacity-10 text-warning">
                        <i class="bi bi-file-earmark-x-fill fs-3"></i>
                      </div>
                      <div class="form-check form-switch fs-4 mb-0">
                        <input class="form-check-input" type="checkbox" name="teacher_delete_kk" id="switchTeacherDeleteKk" value="1" ${teacherDeleteKk ? 'checked' : ''} />
                      </div>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">Guru Hapus Kartu Keluarga</h6>
                    <p class="small text-muted mb-3">Mengizinkan Guru (Teacher) untuk menghapus berkas Kartu Keluarga (KK) siswa secara permanen dari Cloudflare R2 & D1.</p>
                    <div class="mt-auto">
                      ${teacherDeleteKk
      ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1"><i class="bi bi-check-circle-fill me-1"></i>Hak Akses: DIIZINKAN</span>'
      : '<span class="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill px-3 py-1"><i class="bi bi-lock-fill me-1"></i>Hak Akses: TERKUNCI</span>'}
                    </div>
                  </div>
                </div>

                <!-- 3. Teacher Delete Akte -->
                <div class="col-md-4">
                  <div class="card h-100 border rounded-4 p-3 shadow-sm bg-body text-start position-relative">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <div class="p-2.5 rounded-3 bg-danger bg-opacity-10 text-danger">
                        <i class="bi bi-file-earmark-person-fill fs-3"></i>
                      </div>
                      <div class="form-check form-switch fs-4 mb-0">
                        <input class="form-check-input" type="checkbox" name="teacher_delete_akte" id="switchTeacherDeleteAkte" value="1" ${teacherDeleteAkte ? 'checked' : ''} />
                      </div>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">Guru Hapus Akte Kelahiran</h6>
                    <p class="small text-muted mb-3">Mengizinkan Guru (Teacher) untuk menghapus berkas Akte Kelahiran siswa secara permanen dari Cloudflare R2 & D1.</p>
                    <div class="mt-auto">
                      ${teacherDeleteAkte
      ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1"><i class="bi bi-check-circle-fill me-1"></i>Hak Akses: DIIZINKAN</span>'
      : '<span class="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill px-3 py-1"><i class="bi bi-lock-fill me-1"></i>Hak Akses: TERKUNCI</span>'}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tombol Simpan Setelan -->
              <div class="border-top pt-3 text-end">
                <button type="submit" class="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-sm">
                  <i class="bi bi-save2-fill me-2"></i> Simpan Perubahan Setelan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Helper function for Indonesian date formatting (dd mmmm yyyy)
function formatIndonesianDate(dateStr: string | null | undefined): string {
  if (!dateStr || !dateStr.trim()) return '-';
  const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const str = dateStr.trim();

  // If already contains Indonesian month name, return as is
  if (MONTHS.some(m => str.toLowerCase().includes(m.toLowerCase()))) {
    return str;
  }

  // ISO Format YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIdx = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${MONTHS[monthIdx]} ${year}`;
    }
  }

  // Format DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const monthIdx = parseInt(ddmmyyyyMatch[2], 10) - 1;
    const year = ddmmyyyyMatch[3];
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${MONTHS[monthIdx]} ${year}`;
    }
  }

  return str;
}

// ============================================================
// CETAK KARTU SISWA 2 SISI Standalone Print & PDF Page (Admin / Guru)
// ============================================================



