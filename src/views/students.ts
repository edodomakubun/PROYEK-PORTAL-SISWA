import { Student, Role, StudentClassHistory, StudentDocument, User } from '../types';
import { DEFAULT_AVATAR, formatWIT, formatWITDate, formatIsoDate } from './helpers';
import { renderLayout } from './layout';

function renderDocStatusBox(type: 'AK' | 'KK', status: 'pending' | 'approved' | 'rejected' | null | undefined): string {
  let borderColor = '#e2e8f0';
  let bgColor = '#f8fafc';
  let badgeColor = '#64748b';
  let statusText = 'Belum Diupload';

  if (status === 'approved') {
    borderColor = '#a7f3d0';
    bgColor = '#ecfdf5';
    badgeColor = '#10b981';
    statusText = 'Disetujui';
  } else if (status === 'pending') {
    borderColor = '#fde68a';
    bgColor = '#fffbeb';
    badgeColor = '#f59e0b';
    statusText = 'Menunggu Review';
  } else if (status === 'rejected') {
    borderColor = '#fca5a5';
    bgColor = '#fef2f2';
    badgeColor = '#ef4444';
    statusText = 'Ditolak';
  }

  return `
    <div class="d-flex flex-column align-items-center justify-content-center p-2 rounded-3 text-center shadow-sm" 
         style="width: 90px; min-height: 72px; border: 1px solid ${borderColor}; background-color: ${bgColor};">
      <span class="badge rounded-pill fw-bold mb-1.5" style="background-color: ${badgeColor}; color: white; font-size: 0.72rem; padding: 0.25rem 0.55rem; min-width: 32px;">${type}</span>
      <span class="fw-bold text-secondary" style="font-size: 0.65rem; line-height: 1.1;">${statusText}</span>
    </div>
  `;
}

export function renderStudentListPage(
  students: Student[],
  classes: string[],
  selectedClass: string,
  userRole: Role,
  flashMessage: string = ''
): string {
  let fatherAlive = 0;
  let fatherAlm = 0;
  let motherAlive = 0;
  let motherAlm = 0;

  students.forEach(s => {
    if (s.is_father_alive === 0) fatherAlm++; else if (s.father_name) fatherAlive++;
    if (s.is_mother_alive === 0) motherAlm++; else if (s.mother_name) motherAlive++;
  });

  return `
  ${flashMessage ? `
  <div class="alert alert-success alert-dismissible fade show rounded-4 shadow-sm border-0 mb-3" role="alert" style="background: linear-gradient(135deg, #10b98115 0%, #05966908 100%); border-left: 4px solid #10b981 !important;">
    <div class="d-flex align-items-center gap-2">
      <i class="bi bi-check-circle-fill text-success fs-5"></i>
      <span class="fw-semibold text-dark">${flashMessage}</span>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>` : ''}

  <!-- Stat Summary Cards Row (Compact Space-Saving Layout) -->
  <div class="row g-2 mb-3">
    <div class="col-md-4">
      <div class="small-box-custom" style="background: var(--primary-gradient);">
        <div class="inner">
          <h3 class="m-0">${students.length}</h3>
          <p class="mb-0 opacity-90 fw-semibold small">Total Siswa Terdata</p>
        </div>
        <i class="bi bi-people-fill icon-bg"></i>
      </div>
    </div>
    <div class="col-md-4">
      <div class="small-box-custom" style="background: var(--success-gradient);">
        <div class="inner">
          <h3 class="m-0">${fatherAlive} <small class="fs-6 opacity-75">Hidup</small> / ${fatherAlm} <small class="fs-6 opacity-75">Alm.</small></h3>
          <p class="mb-0 opacity-90 fw-semibold small">Status Ayah Kandung</p>
        </div>
        <i class="bi bi-person-fill icon-bg"></i>
      </div>
    </div>
    <div class="col-md-4">
      <div class="small-box-custom" style="background: var(--info-gradient);">
        <div class="inner">
          <h3 class="m-0">${motherAlive} <small class="fs-6 opacity-75">Hidup</small> / ${motherAlm} <small class="fs-6 opacity-75">Alm.</small></h3>
          <p class="mb-0 opacity-90 fw-semibold small">Status Ibu Kandung</p>
        </div>
        <i class="bi bi-person-heart icon-bg"></i>
      </div>
    </div>
  </div>

  <div class="card p-3 mb-4">
    <div class="card-header">
      <h5 class="card-title fw-bold m-0"><i class="bi bi-people-fill text-primary me-2"></i> Data Siswa Portal</h5>
    </div>
    <div class="card-body px-0">
      <!-- Toolbar Filter & Action Header Bar -->
      <div class="bg-light p-3 rounded-4 mb-4 mx-3 border d-flex align-items-center justify-content-between flex-wrap gap-3">
        <!-- Left: Class Filter Pills -->
        <div class="d-flex align-items-center flex-wrap gap-2">
          <span class="fw-semibold text-secondary small me-1">
            <i class="bi bi-funnel-fill text-primary me-1"></i> Filter Kelas:
          </span>
          <a href="/students" class="btn btn-sm ${!selectedClass ? 'btn-primary shadow-sm fw-bold' : 'btn-outline-secondary'} rounded-pill px-3 py-1.5 fw-semibold">
            <i class="bi bi-grid-fill me-1"></i> Semua Kelas
          </a>
          ${classes.map(c => `
          <a href="/students?class_name=${encodeURIComponent(c)}"
             class="btn btn-sm ${selectedClass === c ? 'btn-primary shadow-sm fw-bold' : 'btn-outline-primary'} rounded-pill px-3 py-1.5 fw-semibold">
            <i class="bi bi-building me-1"></i> Kelas ${c}
          </a>
          `).join('')}
        </div>

        <!-- Right: Live Search & Action Buttons -->
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <div class="input-group input-group-sm" style="width: 310px;">
            <span class="input-group-text bg-white border-end-0 rounded-start-pill ps-3"><i class="bi bi-search text-muted"></i></span>
            <input type="text" id="studentSearchInput" class="form-control border-start-0 rounded-end-pill pe-3" placeholder="Cari nama / NISN / tempat lahir / ortu..." />
          </div>

          ${userRole !== 'siswa' ? `
          <!-- Cetak Kartu Button -->
          <a href="/admin/print-cards${selectedClass ? `?class_name=${encodeURIComponent(selectedClass)}` : ''}" target="_blank" class="btn btn-sm btn-info text-white rounded-pill px-3 py-2 shadow-sm fw-bold d-inline-flex align-items-center gap-1.5 text-nowrap" title="Cetak Kartu Siswa (PDF / Print)">
            <i class="bi bi-printer-fill fs-6"></i>
            <span>Cetak Kartu</span>
          </a>

          <!-- Export Button -->
          <a href="/api/students/export" class="btn btn-sm btn-success rounded-pill px-3 py-2 shadow-sm fw-bold d-inline-flex align-items-center gap-1.5 text-nowrap" title="Ekspor Data PD ke Excel">
            <i class="bi bi-file-earmark-arrow-down-fill fs-6"></i>
            <span>Ekspor Excel</span>
          </a>

          <!-- Import Button (Directs to Full Import Page) -->
          <a href="/students/import-page" class="btn btn-sm btn-warning rounded-pill px-3 py-2 shadow-sm fw-bold d-inline-flex align-items-center gap-1.5 text-nowrap" title="Halaman Validasi & Import Excel">
            <i class="bi bi-file-earmark-arrow-up-fill fs-6"></i>
            <span>Import Excel</span>
          </a>

          <!-- Add Student Button -->
          <button class="btn btn-sm btn-primary rounded-pill px-3 py-2 shadow-sm fw-bold d-inline-flex align-items-center gap-1.5 text-nowrap" data-bs-toggle="modal" data-bs-target="#addStudentModal">
            <i class="bi bi-person-plus-fill fs-6"></i>
            <span>Tambah Siswa</span>
          </button>` : ''}
        </div>
      </div>

      <!-- Student Table -->
      <div class="table-responsive">
        <table class="table table-bordered table-hover align-middle mb-0">
          <thead class="table-light text-dark fw-bold">
            <tr>
              <th class="text-center" style="width: 50px;">No</th>
              <th class="text-center" style="width: 60px;">Foto</th>
              <th>Nama Siswa & NIK</th>
              <th>NISN & NIPD</th>
              <th>Tempat Lahir</th>
              <th>Data Orang Tua</th>
              <th class="text-center" style="width: 210px;">Status Dokumen</th>
              <th style="width: 170px;" class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody id="studentTableBody">
            ${students.length === 0 ? `<tr><td colspan="8" class="text-center text-muted py-4">Tidak ada data siswa.</td></tr>` : ''}
            ${students.map((s, i) => `
            <tr class="student-row" data-birth-place="${s.birth_place || ''}">
              <td class="text-center fw-semibold text-secondary">${i + 1}</td>
              <td class="text-center">
                <img src="${s.photo_url || DEFAULT_AVATAR}"
                     class="avatar-thumb"
                     alt="Foto ${s.name}" />
              </td>
              <td>
                <div class="fw-bold ${s.status === 'mutation_pending' ? 'text-danger' : 'text-dark'}">
                  ${s.name} 
                  <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-0.5 rounded-pill small ms-1">${s.class_name}</span>
                  ${s.status === 'mutation_pending' ? '<span class="badge bg-warning text-dark border border-warning ms-1" title="Menunggu Persetujuan Admin"><i class="bi bi-clock-history me-1"></i>Mutasi Pending</span>' : ''}
                  ${s.status === 'tidak_bersekolah' ? '<span class="badge bg-dark text-white border border-secondary ms-1"><i class="bi bi-x-circle-fill me-1"></i>Tidak Bersekolah</span>' : ''}
                  ${s.status === 'pindah_sekolah' ? '<span class="badge bg-secondary text-white ms-1"><i class="bi bi-box-arrow-right me-1"></i>Pindah Sekolah</span>' : ''}
                </div>
                <div class="small text-muted mt-0.5">NIK: ${s.nik || '-'}</div>
              </td>
              <td>
                <div class="fw-semibold text-dark">NISN: ${s.nisn || '-'}</div>
                <div class="small text-muted mt-0.5">NIPD: ${s.nipd || '-'}</div>
              </td>
              <td>
                <span class="text-dark">${s.birth_place || '-'}</span>
              </td>
              <td>
                <div class="small"><span class="fw-semibold text-dark">Ayah:</span> ${s.father_name || '-'}${s.is_father_alive === 0 ? ' <span class="text-danger">(Alm.)</span>' : ''}</div>
                <div class="small mt-0.5"><span class="fw-semibold text-dark">Ibu:</span> ${s.mother_name || '-'}${s.is_mother_alive === 0 ? ' <span class="text-danger">(Alm.)</span>' : ''}</div>
              </td>
              <td>
                <div class="d-flex align-items-center gap-2 justify-content-center">
                  ${renderDocStatusBox('AK', s.akte_status)}
                  ${renderDocStatusBox('KK', s.kk_status)}
                </div>
              </td>
              <td class="text-center">
                <div class="d-flex align-items-center justify-content-center gap-1">
                  <a href="/students/${s.id}" class="btn btn-sm btn-outline-primary px-2.5 py-1 fw-semibold" title="Lihat Detail Siswa">
                    Detail
                  </a>
                  ${userRole === 'admin' ? `
                  <button type="button" class="btn btn-sm btn-outline-secondary px-2.5 py-1 fw-semibold" onclick="openPermissionModal('${s.id}', '${s.name.replace(/'/g, "\\'")}')" title="Kelola Izin Dokumen">
                    Izin
                  </button>
                  ` : ''}
                  ${userRole !== 'siswa' ? `
                  <a href="/admin/print-cards/student/${s.id}" target="_blank" class="btn btn-sm btn-outline-dark px-2.5 py-1 fw-semibold" title="Cetak Kartu Siswa">
                    Cetak
                  </a>` : ''}
                  ${(userRole === 'admin' && (s.status === 'pindah_sekolah' || s.status === 'tidak_bersekolah' || s.status === 'mutation_pending')) ? `
                  <form action="/api/admin/students/${s.id}/restore-mutation" method="post" class="d-inline">
                    <button type="submit" class="btn btn-sm btn-outline-success px-2.5 py-1 fw-semibold" title="Kembalikan siswa ini ke data siswa aktif" onclick="return confirm('Batalkan mutasi dan kembalikan siswa ${s.name.replace(/'/g, "\\'")} menjadi siswa aktif?');">
                      Kembalikan
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

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const searchInput = document.getElementById('studentSearchInput');
      const tableRows = document.querySelectorAll('#studentTableBody tr.student-row');

      if (searchInput) {
        const filterStudents = function() {
          const searchVal = searchInput.value.toLowerCase().trim();
          tableRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const birthPlace = (row.getAttribute('data-birth-place') || '').toLowerCase();
            row.style.display = (!searchVal || text.includes(searchVal) || birthPlace.includes(searchVal)) ? '' : 'none';
          });
        };
        searchInput.addEventListener('input', filterStudents);
        searchInput.addEventListener('keyup', filterStudents);
      }
    });
  </script>

  <!-- Modal Tambah Siswa (Admin & Guru) -->
  ${userRole !== 'siswa' ? `
  <div class="modal fade" id="addStudentModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <form action="/api/students" method="post">
          <div class="modal-header border-bottom p-4">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-person-plus-fill text-primary me-2"></i> Tambah Data Siswa Baru</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <h6 class="fw-bold text-primary mb-3"><i class="bi bi-person-vcard me-1"></i> Data Dasar Siswa</h6>
            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="form-label fw-semibold">NIPD</label>
                <input type="text" name="nipd" class="form-control rounded-3" placeholder="Ketik NIPD..." />
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label fw-semibold">NISN</label>
                <input type="text" name="nisn" class="form-control rounded-3" placeholder="Ketik NISN..." />
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label fw-semibold">NIK</label>
                <input type="text" name="nik" class="form-control rounded-3" placeholder="Ketik NIK..." />
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Nama Lengkap *</label>
              <input type="text" name="name" class="form-control rounded-3" placeholder="Nama lengkap siswa..." required />
            </div>
            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="form-label fw-semibold">Kelas *</label>
                <input type="text" name="class_name" class="form-control rounded-3" placeholder="Contoh: 10-A" required />
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label fw-semibold">Tempat Lahir</label>
                <input type="text" name="birth_place" class="form-control rounded-3" placeholder="Kota lahir..." />
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label fw-semibold">Tanggal Lahir</label>
                <input type="date" name="birth_date" class="form-control rounded-3" />
              </div>
            </div>

            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="form-label fw-semibold">Jenis Kelamin</label>
                <select name="gender" class="form-select rounded-3">
                  <option value="">-- Pilih --</option>
                  <option value="Laki-Laki">Laki-Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label fw-semibold">Agama</label>
                <select name="religion" class="form-select rounded-3">
                  <option value="">-- Pilih --</option>
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Khonghucu">Khonghucu</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label fw-semibold">Tanggal Masuk Sekolah</label>
                <input type="text" name="entry_date" class="form-control rounded-3" placeholder="DD/MM/YYYY" />
              </div>
            </div>

            <hr class="my-4 text-muted" />

            <h6 class="fw-bold text-primary mb-3"><i class="bi bi-people me-1"></i> Data Orang Tua</h6>
            <div class="row">
              <!-- Ayah -->
              <div class="col-md-6 mb-3">
                <div class="p-3 bg-light rounded-3 border">
                  <label class="form-label fw-semibold text-dark">Nama Ayah Kandung</label>
                  <input type="text" name="father_name" class="form-control rounded-3 mb-2" placeholder="Nama ayah..." />
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" name="is_father_alive" id="addFatherCheck" value="1" checked />
                    <label class="form-check-label small fw-semibold text-secondary" for="addFatherCheck">
                      Masih Hidup (Uncheck jika Alm.)
                    </label>
                  </div>
                </div>
              </div>

              <!-- Ibu -->
              <div class="col-md-6 mb-3">
                <div class="p-3 bg-light rounded-3 border">
                  <label class="form-label fw-semibold text-dark">Nama Ibu Kandung</label>
                  <input type="text" name="mother_name" class="form-control rounded-3 mb-2" placeholder="Nama ibu..." />
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" name="is_mother_alive" id="addMotherCheck" value="1" checked />
                    <label class="form-check-label small fw-semibold text-secondary" for="addMotherCheck">
                      Masih Hidup (Uncheck jika Alm.)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-top p-3">
            <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm">
              <i class="bi bi-save me-1"></i> Simpan Data Siswa
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>` : ''}

  <!-- Modal Import Excel Data Siswa -->
  ${userRole !== 'siswa' ? `
  <div class="modal fade" id="importStudentModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <form action="/api/students/import" method="post" enctype="multipart/form-data">
          <div class="modal-header border-bottom p-4" style="background: linear-gradient(135deg, #f59e0b15 0%, #f59e0b08 100%);">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-file-earmark-arrow-up-fill text-warning me-2"></i> Import Data Peserta Didik dari Excel</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <!-- Upload Area -->
            <div class="mb-4">
              <div class="border-2 border-dashed rounded-4 p-4 text-center bg-light position-relative" style="border-color: #d4a843 !important; cursor: pointer;" id="importDropZone">
                <div class="py-3">
                  <i class="bi bi-cloud-arrow-up-fill text-warning" style="font-size: 3rem;"></i>
                  <h6 class="fw-bold text-dark mt-3 mb-1">Pilih File Excel (.xlsx)</h6>
                  <p class="text-muted small mb-3">Drag & drop file atau klik tombol di bawah untuk memilih file</p>
                  <input type="file" name="excel_file" accept=".xlsx,.xls" required class="form-control d-none" id="importFileInput" />
                  <button type="button" class="btn btn-warning rounded-pill px-4 fw-semibold shadow-sm" onclick="document.getElementById('importFileInput').click();">
                    <i class="bi bi-folder2-open me-1"></i> Pilih File Excel
                  </button>
                  <div class="mt-3 d-none" id="importFileInfo">
                    <div class="d-inline-flex align-items-center gap-2 bg-white rounded-pill px-4 py-2 border shadow-sm">
                      <i class="bi bi-file-earmark-excel-fill text-success fs-5"></i>
                      <span class="fw-semibold text-dark" id="importFileName">-</span>
                      <span class="badge bg-secondary rounded-pill" id="importFileSize">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Info Panel -->
            <div class="alert alert-info bg-info bg-opacity-10 border-0 rounded-4 p-3">
              <h6 class="fw-bold text-primary mb-2"><i class="bi bi-info-circle-fill me-1"></i> Panduan Format Excel</h6>
              <ul class="small text-secondary mb-0 ps-3">
                <li>File harus berformat <strong>.xlsx</strong> (Microsoft Excel)</li>
                <li>Baris header harus berisi kolom: <code>Nama</code> (wajib), <code>NIPD</code>, <code>NISN</code>, <code>NIK</code>, <code>Kelas</code>, <code>Tempat Lahir</code>, <code>Tanggal Lahir</code>, <code>Nama Ayah</code>, <code>Nama Ibu</code></li>
                <li>Kolom dengan tanda <strong>-</strong> akan dibaca sebagai kosong</li>
                <li>Semua sheet pada file akan diproses</li>
                <li>Data akan <strong>ditambahkan</strong> ke database (bukan menimpa)</li>
              </ul>
            </div>
          </div>
          <div class="modal-footer border-top p-3 d-flex justify-content-between">
            <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-warning rounded-pill px-4 fw-semibold shadow-sm text-dark">
              <i class="bi bi-cloud-arrow-up me-1"></i> Import Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Import File Picker Script -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const fileInput = document.getElementById('importFileInput');
      const fileInfo = document.getElementById('importFileInfo');
      const fileName = document.getElementById('importFileName');
      const fileSize = document.getElementById('importFileSize');

      if (fileInput) {
        fileInput.addEventListener('change', function() {
          if (this.files && this.files[0]) {
            const f = this.files[0];
            fileInfo.classList.remove('d-none');
            fileName.textContent = f.name;
            const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
            fileSize.textContent = sizeMB + ' MB';
          } else {
            fileInfo.classList.add('d-none');
          }
        });
      }
    });
  </script>` : ''}
 
  <!-- Modal Permission -->
  <div class="modal fade" id="permissionModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 border-0 shadow">
        <form id="permissionForm" method="POST" action="">
          <div class="modal-header border-bottom-0">
            <h5 class="modal-title fw-bold text-dark">Kelola Izin Dokumen</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body bg-light">
            <p class="mb-3 text-muted">Siswa: <strong id="permStudentName" class="text-dark"></strong></p>
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="permAkte" name="allow_akte" value="1">
              <label class="form-check-label" for="permAkte">Izinkan Upload Akte Kelahiran</label>
            </div>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="permKK" name="allow_kk" value="1">
              <label class="form-check-label" for="permKK">Izinkan Upload Kartu Keluarga</label>
            </div>
          </div>
          <div class="modal-footer border-top-0">
            <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm">
              <i class="bi bi-save me-1"></i> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const modalEl = document.getElementById('permissionModal');
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

    function openPermissionModal(studentId, studentName) {
      const triggerEl = document.activeElement;
      document.getElementById('permStudentName').textContent = studentName;
      document.getElementById('permissionForm').action = '/api/admin/students/' + studentId + '/permissions';
      
      // Reset switch state before fetching
      document.getElementById('permAkte').checked = false;
      document.getElementById('permKK').checked = false;

      // Fetch current permissions
      fetch('/api/admin/students/' + studentId + '/permissions')
        .then(res => res.json())
        .then(data => {
          document.getElementById('permAkte').checked = data.allow_akte;
          document.getElementById('permKK').checked = data.allow_kk;
          
          const modalEl = document.getElementById('permissionModal');
          if (modalEl) {
            modalEl._triggerEl = triggerEl;
          }
          const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
          modal.show();
        })
        .catch(err => {
          console.error('Error fetching permissions', err);
          alert('Gagal mengambil data izin.');
        });
    }
  </script>
`;
}

export function renderStudentDetailPage(
  student: Student,
  documents: StudentDocument[],
  userRole: Role,
  flashMessage: string = '',
  appSettings: Record<string, string> = {},
  permissions: Record<string, boolean> = {}
): string {
  const isAkteUploaded = documents.some(d => d.doc_type === 'akte_kelahiran');
  const isKKUploaded = documents.some(d => d.doc_type === 'kartu_keluarga');
  const akteDoc = documents.find(d => d.doc_type === 'akte_kelahiran');
  const kkDoc = documents.find(d => d.doc_type === 'kartu_keluarga');

  const isStaff = userRole === 'admin' || userRole === 'guru';
  const allowPhoto = isStaff || appSettings.allow_photo_upload !== '0' || student.required_photo === 1 || permissions['foto'] === true;
  const allowAkte = isStaff || appSettings.allow_akte_upload !== '0' || student.required_akte === 1 || permissions['akte_kelahiran'] === true;
  const allowKK = isStaff || appSettings.allow_kk_upload !== '0' || student.required_kk === 1 || permissions['kartu_keluarga'] === true;

  const canDeletePhoto = userRole === 'admin' || (userRole === 'guru' && appSettings.teacher_delete_photo === '1');
  const canDeleteAkte = userRole === 'admin' || (userRole === 'guru' && appSettings.teacher_delete_akte === '1');
  const canDeleteKK = userRole === 'admin' || (userRole === 'guru' && appSettings.teacher_delete_kk === '1');

  const safeStudentName = (student.name || '').replace(/'/g, "\\'");

  return `
  <!-- Top Navigation & Action Bar -->
  <div class="mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
    ${userRole !== 'siswa' ? `
      <a href="/students" class="btn btn-light rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow-xs border text-secondary">
        <i class="bi bi-arrow-left fs-5"></i>
        <span>Kembali ke Daftar Siswa</span>
      </a>
    ` : '<div></div>'}
    
    ${(userRole === 'admin' || userRole === 'guru') ? `
      <a href="/admin/print-cards/student/${student.id}" target="_blank"
         class="btn btn-success rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow-xs">
        <i class="bi bi-printer-fill fs-5"></i>
        <span>Cetak Kartu Siswa</span>
      </a>` : ''}
  </div>

  ${flashMessage ? `<div class="alert alert-success alert-dismissible fade show rounded-4 shadow-sm py-3 px-4 mb-4 border-0" role="alert" style="background: #d1fae5; color: #064e3b;">
    <div class="d-flex align-items-center gap-2">
      <i class="bi bi-check-circle-fill fs-5"></i>
      <span class="fw-semibold">${flashMessage}</span>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>` : ''}

  <!-- HEADER PROFIL UTAMA (HERO BANNER) -->
  <div class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-white">
    <div class="card-body p-4 p-md-5">
      <div class="row align-items-center g-4">
        <!-- Foto Profil & Quick Upload -->
        <div class="col-12 col-md-auto text-center">
          <div class="position-relative d-inline-block">
            <img src="${student.photo_url || DEFAULT_AVATAR}"
                 class="shadow border border-4 border-white object-fit-cover"
                 style="width: 110px; height: 110px; border-radius: 50%;"
                 alt="Foto Profil ${student.name}" />
          </div>
          <div class="mt-2">
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 rounded-pill fw-bold">
              Kelas ${student.class_name}
            </span>
          </div>
        </div>

        <div class="col-12 col-md text-center text-md-start">
          <h3 class="fw-extrabold ${student.status === 'mutation_pending' ? 'text-danger' : 'text-dark'} mb-2">
            ${student.name}
            ${student.status === 'mutation_pending' ? '<span class="badge bg-warning text-dark border border-warning fs-6 ms-2"><i class="bi bi-clock-history me-1"></i>Mutasi Pending</span>' : ''}
            ${student.status === 'tidak_bersekolah' ? '<span class="badge bg-dark text-white border border-secondary fs-6 ms-2"><i class="bi bi-x-circle-fill me-1"></i>Tidak Bersekolah</span>' : ''}
            ${student.status === 'pindah_sekolah' ? '<span class="badge bg-secondary text-white fs-6 ms-2"><i class="bi bi-box-arrow-right me-1"></i>Pindah Sekolah</span>' : ''}
            ${(userRole === 'admin' && (student.status === 'pindah_sekolah' || student.status === 'tidak_bersekolah' || student.status === 'mutation_pending')) ? `
            <form action="/api/admin/students/${student.id}/restore-mutation" method="post" class="d-inline ms-2">
              <button type="submit" class="btn btn-sm btn-success rounded-pill px-3 py-1 fw-bold shadow-sm" onclick="return confirm('Kembalikan siswa ini ke data siswa aktif? Status mutasi akan dibatalkan.');">
                <i class="bi bi-arrow-counterclockwise me-1"></i> Kembalikan Siswa Aktif
              </button>
            </form>
            ` : ''}
          </h3>
          <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2 flex-wrap mb-3">
            <span class="badge bg-light text-dark border px-3 py-1.5 rounded-pill">NIPD: <strong class="text-primary">${student.nipd || '-'}</strong></span>
            <span class="badge bg-light text-dark border px-3 py-1.5 rounded-pill">NISN: <strong>${student.nisn || '-'}</strong></span>
            <span class="badge bg-light text-dark border px-3 py-1.5 rounded-pill">NIK: <strong>${student.nik || '-'}</strong></span>
          </div>
          <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2 flex-wrap">
            <span class="small text-muted fw-semibold me-1">Status Dokumen:</span>
            ${isAkteUploaded
      ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill small"><i class="bi bi-check-circle-fill me-1"></i>Akte Kelahiran</span>'
      : '<span class="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25 px-2.5 py-1 rounded-pill small"><i class="bi bi-exclamation-circle me-1"></i>Belum Akte</span>'}
            ${isKKUploaded
      ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill small"><i class="bi bi-check-circle-fill me-1"></i>Kartu Keluarga</span>'
      : '<span class="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25 px-2.5 py-1 rounded-pill small"><i class="bi bi-exclamation-circle me-1"></i>Belum KK</span>'}
          </div>
        </div>

        <!-- Aksi Cepat Foto Profil -->
        ${allowPhoto ? `
        <div class="col-12 col-lg-auto border-top border-lg-0 pt-3 pt-lg-0 text-center text-lg-end">
          <form action="/api/students/${student.id}/upload-photo" method="post" enctype="multipart/form-data" class="auto-compress-form d-inline-block text-start">
            <label class="small fw-bold text-dark mb-1.5 d-block"><i class="bi bi-camera-fill text-primary me-1"></i> Perbarui Foto Profil:</label>
            <div class="input-group input-group-sm mb-2" style="max-width: 280px;">
              <input type="file" name="photo" class="form-control rounded-start-3" accept="image/*" required />
              <button class="btn btn-primary rounded-end-3 px-3 fw-semibold" type="submit">Upload</button>
            </div>
            ${student.photo_url && canDeletePhoto ? `
              <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold w-100" onclick="deleteStudentDocument(${student.id}, 'photo', 'Foto Profil Siswa')">
                <i class="bi bi-trash3-fill me-1"></i> Hapus Foto
              </button>
            ` : ''}
            <div class="upload-compress-status small text-primary fw-semibold mt-1 d-none">
              <span class="spinner-border spinner-border-sm me-1"></span> Mengompres Gambar...
            </div>
          </form>
        </div>` : ''}
      </div>
    </div>
  </div>

  <!-- TATA LETAK GRID KARTU MODERN (MULTI-CARD DASHBOARD VIEW) -->
  <div class="row g-4">
    
    <!-- KOLOM KIRI: DATA DASAR & ORANG TUA -->
    <div class="col-lg-6 d-flex flex-column gap-4">
      
      <!-- 1. KARTU DATA DASAR SISWA -->
      <div class="card border-0 shadow-sm rounded-4 p-4 bg-white flex-grow-1">
        <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
          <h5 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <i class="bi bi-person-vcard text-primary fs-4"></i> Data Dasar Siswa
          </h5>
          <button type="button" class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold d-inline-flex align-items-center gap-1 shadow-xs" data-bs-toggle="modal" data-bs-target="#modalVerifyNik">
            <i class="bi bi-shield-check"></i> Verifikasi NIK
          </button>
        </div>

        <form action="/api/students/${student.id}/update" method="post">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-semibold text-secondary">NIPD</label>
              <input type="text" name="nipd" class="form-control rounded-3" value="${student.nipd || ''}" placeholder="Nomor NIPD..." ${userRole === 'siswa' ? 'readonly' : ''} />
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold text-secondary">NISN</label>
              <input type="text" name="nisn" class="form-control rounded-3" value="${student.nisn || ''}" placeholder="Nomor NISN..." ${userRole === 'siswa' ? 'readonly' : ''} />
            </div>
            <div class="col-md-12">
              <label class="form-label small fw-semibold text-secondary">NIK (Nomor Induk Kependudukan)</label>
              <input type="text" name="nik" id="studentNikInput" class="form-control rounded-3" value="${student.nik || ''}" placeholder="16 digit NIK..." ${userRole === 'siswa' ? 'readonly' : ''} />
            </div>
            <div class="col-md-8">
              <label class="form-label small fw-semibold text-secondary">Nama Lengkap Siswa</label>
              <input type="text" name="name" class="form-control rounded-3" value="${student.name}" required ${userRole === 'siswa' ? 'readonly' : ''} />
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold text-secondary">Kelas</label>
              <input type="text" name="class_name" class="form-control rounded-3" value="${student.class_name}" required ${userRole === 'siswa' ? 'readonly' : ''} />
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold text-secondary">Tempat Lahir</label>
              <input type="text" name="birth_place" class="form-control rounded-3" value="${student.birth_place || ''}" ${userRole === 'siswa' ? 'readonly' : ''} />
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold text-secondary">Tanggal Lahir</label>
              <input type="date" name="birth_date" class="form-control rounded-3" value="${formatIsoDate(student.birth_date)}" ${userRole === 'siswa' ? 'readonly' : ''} />
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold text-secondary">Jenis Kelamin</label>
              <select name="gender" class="form-select rounded-3" ${userRole === 'siswa' ? 'disabled' : ''}>
                <option value="">-- Pilih --</option>
                <option value="Laki-Laki" ${student.gender === 'Laki-Laki' ? 'selected' : ''}>Laki-Laki</option>
                <option value="Perempuan" ${student.gender === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold text-secondary">Agama</label>
              <select name="religion" class="form-select rounded-3" ${userRole === 'siswa' ? 'disabled' : ''}>
                <option value="">-- Pilih --</option>
                <option value="Islam" ${student.religion === 'Islam' ? 'selected' : ''}>Islam</option>
                <option value="Kristen" ${student.religion === 'Kristen' ? 'selected' : ''}>Kristen</option>
                <option value="Katolik" ${student.religion === 'Katolik' ? 'selected' : ''}>Katolik</option>
                <option value="Hindu" ${student.religion === 'Hindu' ? 'selected' : ''}>Hindu</option>
                <option value="Buddha" ${student.religion === 'Buddha' ? 'selected' : ''}>Buddha</option>
                <option value="Khonghucu" ${student.religion === 'Khonghucu' ? 'selected' : ''}>Khonghucu</option>
                <option value="Lainnya" ${student.religion === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold text-secondary">Tanggal Masuk Sekolah</label>
              <input type="text" name="entry_date" class="form-control rounded-3" value="${student.entry_date || ''}" placeholder="DD/MM/YYYY" ${userRole === 'siswa' ? 'readonly' : ''} />
            </div>
          </div>

          ${userRole !== 'siswa' ? `
          <div class="mt-4 pt-3 border-top text-end">
            <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
              <i class="bi bi-save me-1"></i> Simpan Data Dasar
            </button>
          </div>` : ''}
        </form>
      </div>

      <!-- 2. KARTU DATA ORANG TUA -->
      <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
          <h5 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <i class="bi bi-people text-success fs-4"></i> Data Orang Tua
          </h5>
        </div>

        <form action="/api/students/${student.id}/parents" method="post">
          <div class="row g-3">
            <!-- Ayah -->
            <div class="col-12">
              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label class="form-label fw-bold text-dark m-0">Nama Ayah Kandung</label>
                  ${student.is_father_alive === 0 ? '<span class="badge bg-secondary">(Alm.)</span>' : '<span class="badge bg-success bg-opacity-10 text-success">Masih Hidup</span>'}
                </div>
                <input type="text" name="father_name" class="form-control rounded-3 mb-2" value="${student.father_name || ''}" placeholder="Nama ayah..." ${userRole === 'siswa' ? 'readonly' : ''} />
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" name="is_father_alive" id="fatherCheck" value="1" ${student.is_father_alive !== 0 ? 'checked' : ''} ${userRole === 'siswa' ? 'disabled' : ''} />
                  <label class="form-check-label small fw-semibold text-secondary" for="fatherCheck">Ayah Masih Hidup (Uncheck jika Alm.)</label>
                </div>
              </div>
            </div>

            <!-- Ibu -->
            <div class="col-12">
              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label class="form-label fw-bold text-dark m-0">Nama Ibu Kandung</label>
                  ${student.is_mother_alive === 0 ? '<span class="badge bg-secondary">(Alm.)</span>' : '<span class="badge bg-success bg-opacity-10 text-success">Masih Hidup</span>'}
                </div>
                <input type="text" name="mother_name" class="form-control rounded-3 mb-2" value="${student.mother_name || ''}" placeholder="Nama ibu..." ${userRole === 'siswa' ? 'readonly' : ''} />
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" name="is_mother_alive" id="motherCheck" value="1" ${student.is_mother_alive !== 0 ? 'checked' : ''} ${userRole === 'siswa' ? 'disabled' : ''} />
                  <label class="form-check-label small fw-semibold text-secondary" for="motherCheck">Ibu Masih Hidup (Uncheck jika Alm.)</label>
                </div>
              </div>
            </div>
          </div>

          ${userRole !== 'siswa' ? `
          <div class="mt-4 pt-3 border-top text-end">
            <button type="submit" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm">
              <i class="bi bi-save me-1"></i> Simpan Data Orang Tua
            </button>
          </div>` : ''}
        </form>
      </div>

    </div>

    <!-- KOLOM KANAN: DOKUMEN LEGAL & TOMBOL MODAL PRATINJAU -->
    <div class="col-lg-6">
      <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
        <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
          <h5 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <i class="bi bi-cloud-upload text-danger fs-4"></i> Dokumen Legal Siswa
          </h5>
        </div>

        <form action="/api/students/${student.id}/upload-dual-docs" method="post" enctype="multipart/form-data" id="dualDocsForm" class="auto-compress-form">
          <div class="d-flex flex-column gap-4">
            
            <!-- Akte Kelahiran Section -->
            <div class="p-3 bg-light rounded-3 border">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <h6 class="fw-bold text-dark m-0"><i class="bi bi-file-earmark-pdf-fill text-danger me-1"></i> Akte Kelahiran</h6>
                ${akteDoc ? `
                  ${akteDoc.status === 'pending' ? '<span class="badge bg-warning text-dark"><i class="bi bi-clock-history"></i> Pending</span>' : ''}
                  ${akteDoc.status === 'approved' ? '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Disetujui</span>' : ''}
                  ${akteDoc.status === 'rejected' ? '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Ditolak</span>' : ''}
                ` : '<span class="badge bg-secondary">Belum Diupload</span>'}
              </div>

              ${akteDoc && akteDoc.file_path ? `
                <div class="d-flex align-items-center justify-content-between bg-white p-2 rounded-2 border mb-2 small">
                  <span class="text-truncate me-2"><code>${akteDoc.file_path}</code></span>
                  <div class="d-flex gap-1">
                    <button type="button" class="btn btn-sm btn-outline-info rounded-pill px-3 py-0.5 fw-semibold shadow-xs" onclick="showStudentDocModal('${akteDoc.file_url || ''}', 'Akte Kelahiran', '${safeStudentName}')">
                      <i class="bi bi-eye-fill me-1"></i> Pratinjau Dokumen
                    </button>
                    ${canDeleteAkte ? `<button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-2 py-0.5" onclick="deleteStudentDocument(${student.id}, 'akte_kelahiran', 'Akte Kelahiran')">Hapus</button>` : ''}
                  </div>
                </div>
              ` : ''}

              ${akteDoc && akteDoc.status === 'rejected' && akteDoc.rejection_note ? `
                <div class="alert alert-danger mb-2 py-1 px-2 small rounded-2"><strong>Ditolak:</strong> ${akteDoc.rejection_note}</div>
              ` : ''}

              ${(!akteDoc || akteDoc.status === 'rejected') && allowAkte ? `
                <div class="input-group input-group-sm">
                  <input type="file" id="akteFileInput" name="akte_document" class="form-control rounded-start-3" accept="image/*,application/pdf" />
                  <button class="btn btn-primary rounded-end-3 px-3" type="submit" name="upload_single" value="akte">Upload Akte</button>
                </div>
              ` : ''}
            </div>

            <!-- Kartu Keluarga Section -->
            <div class="p-3 bg-light rounded-3 border">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <h6 class="fw-bold text-dark m-0"><i class="bi bi-file-earmark-pdf-fill text-danger me-1"></i> Kartu Keluarga</h6>
                ${kkDoc ? `
                  ${kkDoc.status === 'pending' ? '<span class="badge bg-warning text-dark"><i class="bi bi-clock-history"></i> Pending</span>' : ''}
                  ${kkDoc.status === 'approved' ? '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Disetujui</span>' : ''}
                  ${kkDoc.status === 'rejected' ? '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Ditolak</span>' : ''}
                ` : '<span class="badge bg-secondary">Belum Diupload</span>'}
              </div>

              ${kkDoc && kkDoc.file_path ? `
                <div class="d-flex align-items-center justify-content-between bg-white p-2 rounded-2 border mb-2 small">
                  <span class="text-truncate me-2"><code>${kkDoc.file_path}</code></span>
                  <div class="d-flex gap-1">
                    <button type="button" class="btn btn-sm btn-outline-info rounded-pill px-3 py-0.5 fw-semibold shadow-xs" onclick="showStudentDocModal('${kkDoc.file_url || ''}', 'Kartu Keluarga', '${safeStudentName}')">
                      <i class="bi bi-eye-fill me-1"></i> Pratinjau Dokumen
                    </button>
                    ${canDeleteKK ? `<button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-2 py-0.5" onclick="deleteStudentDocument(${student.id}, 'kartu_keluarga', 'Kartu Keluarga')">Hapus</button>` : ''}
                  </div>
                </div>
              ` : ''}

              ${kkDoc && kkDoc.status === 'rejected' && kkDoc.rejection_note ? `
                <div class="alert alert-danger mb-2 py-1 px-2 small rounded-2"><strong>Ditolak:</strong> ${kkDoc.rejection_note}</div>
              ` : ''}

              ${(!kkDoc || kkDoc.status === 'rejected') && allowKK ? `
                <div class="input-group input-group-sm">
                  <input type="file" id="kkFileInput" name="kk_document" class="form-control rounded-start-3" accept="image/*,application/pdf" />
                  <button class="btn btn-primary rounded-end-3 px-3" type="submit" name="upload_single" value="kk">Upload KK</button>
                </div>
              ` : ''}
            </div>

            <div class="text-muted small italic bg-light p-3 rounded-3 border text-center">
              <i class="bi bi-info-circle me-1 text-primary"></i> Klik tombol <strong>Pratinjau Dokumen</strong> di atas untuk membuka dokumen dalam bentuk Modal Pop-Up.
            </div>

          </div>
        </form>
      </div>
    </div>

  </div>

  <!-- MODAL POP-UP PRATINJAU DOKUMEN KHUSUS DETAIL SISWA -->
  <div class="modal fade" id="studentDocPreviewModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <div class="modal-header border-bottom-0 bg-light py-3 rounded-top-4">
          <div>
            <h5 class="modal-title fw-bold text-dark mb-0" id="studentDocPreviewTitle">Pratinjau Dokumen</h5>
            <div class="small text-muted" id="studentDocPreviewSubtitle">Siswa</div>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-0 bg-light" style="height: 72vh; position: relative;">
          <div id="studentDocLoader" class="position-absolute top-50 start-50 translate-middle">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <iframe id="studentDocFrame" src="" style="width:100%; height:100%; border:none; display:none;" onload="document.getElementById('studentDocLoader').style.display='none'; this.style.display='block';"></iframe>
        </div>
        <div class="modal-footer border-top-0 d-flex justify-content-end align-items-center bg-white py-3 rounded-bottom-4">
          <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Tutup</button>
        </div>
      </div>
    </div>
  </div>

<!-- MODAL INTERAKTIF: VERIFIKASI & VALIDASI NIK LENGKAP -->
  <div class="modal fade" id="modalVerifyNik" tabindex="-1" aria-labelledby="modalVerifyNikLabel">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        <div class="modal-header bg-primary text-white py-3 px-4">
          <div class="d-flex align-items-center gap-2">
            <div class="bg-white bg-opacity-20 p-2 rounded-circle d-flex align-items-center justify-content-center">
              <i class="bi bi-shield-check text-white fs-4"></i>
            </div>
            <div>
              <h5 class="modal-title fw-bold text-white mb-0" id="modalVerifyNikLabel">Verifikasi & Analisis NIK Siswa</h5>
              <span class="small text-white-50">Portal Validasi Data Kependudukan Siswa Indonesia</span>
            </div>
          </div>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body p-4">
          <!-- Info Data Siswa Yang Akan Diverifikasi -->
          <div class="card bg-light border-0 rounded-3 p-3 mb-3">
            <div class="row g-2 small">
              <div class="col-6 col-md-3">
                <span class="text-muted d-block">Nama Siswa:</span>
                <strong class="text-dark">${student.name}</strong>
              </div>
              <div class="col-6 col-md-3">
                <span class="text-muted d-block">Nomor NIK:</span>
                <strong class="text-primary font-monospace" id="modalNikText">${student.nik || '<span class="text-danger">Belum diisi</span>'}</strong>
              </div>
              <div class="col-6 col-md-3">
                <span class="text-muted d-block">Tgl Lahir di DB:</span>
                <strong class="text-dark font-monospace">${student.birth_date || '<span class="text-danger">Belum diisi</span>'}</strong>
              </div>
              <div class="col-6 col-md-3">
                <span class="text-muted d-block">Kelas:</span>
                <strong class="text-dark">${student.class_name}</strong>
              </div>
            </div>
          </div>

          <!-- Informasi Validasi Struktur NIK (Instan) -->
          <div class="alert alert-primary bg-primary bg-opacity-10 border-0 rounded-3 p-3 mb-3 small">
            <div class="d-flex align-items-start gap-2">
              <i class="bi bi-info-circle-fill text-primary fs-5 mt-0.5"></i>
              <div>
                <strong>Validasi Struktur 16-Digit Kependudukan:</strong>
                <div class="text-muted">
                  Memverifikasi keaslian format NIK 16 digit, mengurai kode provinsi, tanggal lahir, dan jenis kelamin kependudukan secara otomatis secara instan tanpa berkas.
                </div>
              </div>
            </div>
          </div>

          <!-- Loading Spinner & State -->
          <div id="nikVerifyLoading" class="alert alert-info border-0 rounded-3 py-3 px-4 d-none text-center shadow-sm">
            <div class="spinner-border text-primary mb-2" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div class="fw-bold text-dark" id="nikVerifyLoadingTitle">Sedang Menganalisis Data NIK...</div>
            <div class="small text-muted" id="nikVerifyLoadingSub">Mohon tunggu beberapa saat.</div>
          </div>

          <!-- Result Box -->
          <div id="nikVerifyResultBox" class="d-none"></div>

          <!-- Modal Action Buttons -->
          <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <button type="button" class="btn btn-light rounded-pill px-4 fw-semibold border" data-bs-dismiss="modal">
              Tutup
            </button>
            <button type="button" id="btnExecuteVerifyNik" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
              <i class="bi bi-lightning-charge-fill fs-5 text-warning"></i>
              <span id="btnVerifyText">Mulai Validasi NIK Instan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- SCRIPT LOGIKA VERIFIKASI NIK INSTAN CLIENT-SIDE & PRATINJAU DOKUMEN -->
  <script>
    function showStudentDocModal(url, docType, studentName) {
      const triggerEl = document.activeElement;
      document.getElementById('studentDocPreviewTitle').textContent = docType;
      document.getElementById('studentDocPreviewSubtitle').textContent = studentName;
      document.getElementById('studentDocLoader').style.display = 'block';
      
      const frame = document.getElementById('studentDocFrame');
      frame.style.display = 'none';
      
      if (url.toLowerCase().endsWith('.pdf')) {
        frame.src = url;
        frame.removeAttribute('srcdoc');
      } else {
        frame.src = '';
        frame.srcdoc = '<html><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#f8f9fa;"><img src="' + url + '" style="max-width:100%;max-height:100%;object-fit:contain;"></body></html>';
      }
      
      const modalEl = document.getElementById('studentDocPreviewModal');
      if (modalEl) {
        modalEl._triggerEl = triggerEl;
      }
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }

    document.addEventListener('DOMContentLoaded', function() {
      const docModalEl = document.getElementById('studentDocPreviewModal');
      if (docModalEl) {
        docModalEl.addEventListener('hide.bs.modal', function() {
          if (docModalEl._triggerEl) {
            docModalEl._triggerEl.focus();
          } else {
            const active = document.activeElement;
            if (active && docModalEl.contains(active)) {
              active.blur();
            }
          }
        });
      }

      const btnExecute = document.getElementById('btnExecuteVerifyNik');
      const loadingDiv = document.getElementById('nikVerifyLoading');
      const loadingTitle = document.getElementById('nikVerifyLoadingTitle');
      const loadingSub = document.getElementById('nikVerifyLoadingSub');
      const resultBox = document.getElementById('nikVerifyResultBox');

      if (btnExecute) {
        btnExecute.addEventListener('click', async function() {
          const studentId = ${student.id};
          const nikValue = '${student.nik || ''}';
          const dobValue = '${student.birth_date || ''}';

          if (!nikValue || nikValue.length < 16) {
            alert('Nomor NIK siswa (' + (nikValue || 'Kosong') + ') belum valid 16 digit. Silakan lengkapi data dasar siswa terlebih dahulu.');
            return;
          }

          // Show Loading
          btnExecute.disabled = true;
          if (loadingDiv) loadingDiv.classList.remove('d-none');
          if (resultBox) {
            resultBox.classList.add('d-none');
            resultBox.innerHTML = '';
          }

          if (loadingTitle) loadingTitle.textContent = 'Menganalisis Struktur 16 Digit NIK...';
          if (loadingSub) loadingSub.textContent = 'Mengekstrak tanggal lahir, jenis kelamin, dan wilayah provinsi.';

          try {
            const resp = await fetch('/api/students/' + studentId + '/parse-nik', {
              method: 'POST'
            });
            const res = await resp.json();

            if (loadingDiv) loadingDiv.classList.add('d-none');
            btnExecute.disabled = false;
            if (resultBox) resultBox.classList.remove('d-none');

            const d = res.data;
            if (d && d.isValid) {
              const isMatch = d.isDobMatch;
              const matchBadge = isMatch === true
                ? '<span class="badge bg-success rounded-pill px-3 py-1">✅ Cocok 100% dengan DB</span>'
                : (isMatch === false ? '<span class="badge bg-warning text-dark rounded-pill px-3 py-1">⚠️ Beda dengan DB</span>' : '<span class="badge bg-secondary rounded-pill px-3 py-1">DB Belum Terisi</span>');

              let discHTML = d.discrepancyMessage ? ('<div class="alert alert-warning border-0 rounded-3 p-2.5 small mb-2"><i class="bi bi-exclamation-triangle-fill me-1"></i> ' + d.discrepancyMessage + '</div>') : '';
              
              // PERBAIKAN: Menggunakan HTML Entities (&quot;) untuk tanda kutip di dalam onclick
              let fixBtnHTML = (isMatch === false && d.birthDateFormatted) ? ('<button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold" onclick="document.querySelector(&quot;input[name=birth_date]&quot;).value=&quot;' + d.birthDateFormatted + '&quot;; showToast(&quot;Tanggal lahir di form diperbarui menjadi ' + d.birthDateFormatted + '. Silakan klik tombol Simpan Perubahan.&quot;, &quot;info&quot;, 3000);"><i class="bi bi-magic me-1"></i> Terapkan Tgl Lahir NIK ke Form</button>') : '';

              resultBox.innerHTML = '<div class="card border-' + (isMatch === false ? 'warning' : 'success') + ' border-opacity-50 rounded-4 shadow-sm overflow-hidden mb-0">' +
                  '<div class="card-header bg-' + (isMatch === false ? 'warning bg-opacity-10' : 'success bg-opacity-10') + ' py-3 px-3 border-0 d-flex align-items-center justify-content-between flex-wrap gap-2">' +
                    '<div class="d-flex align-items-center gap-2">' +
                      '<i class="bi bi-check-circle-fill text-' + (isMatch === false ? 'warning' : 'success') + ' fs-4"></i>' +
                      '<div>' +
                        '<h6 class="fw-bold mb-0 text-dark">Struktur NIK Valid (16 Digit Terverifikasi)</h6>' +
                        '<span class="small text-muted">Hasil Penguraian Algoritma Kependudukan RI</span>' +
                      '</div>' +
                    '</div>' + matchBadge +
                  '</div>' +
                  '<div class="card-body p-3">' +
                    '<div class="row g-2 mb-3">' +
                      '<div class="col-12 col-sm-6">' +
                        '<div class="bg-light p-2.5 rounded-3">' +
                          '<span class="text-muted d-block small">Provinsi Asal:</span>' +
                          '<strong class="text-dark fs-6"><i class="bi bi-geo-alt-fill text-danger me-1"></i>' + (d.provinceName || '-') + '</strong>' +
                          '<div class="small text-muted">Kode Wilayah: <code>' + (d.provinceCode || '-') + '</code></div>' +
                        '</div>' +
                      '</div>' +
                      '<div class="col-12 col-sm-6">' +
                        '<div class="bg-light p-2.5 rounded-3">' +
                          '<span class="text-muted d-block small">Jenis Kelamin dari NIK:</span>' +
                          '<strong class="text-dark fs-6">' +
                            '<i class="bi ' + (d.gender === 'Laki-laki' ? 'bi-gender-male text-primary' : 'bi-gender-female text-danger') + ' me-1"></i>' +
                            (d.gender || '-') +
                          '</strong>' +
                          '<div class="small text-muted">Kode Tanggal NIK: <code>' + (d.birthDateRaw || '-') + '</code></div>' +
                        '</div>' +
                      '</div>' +
                      '<div class="col-12 col-sm-6">' +
                        '<div class="bg-light p-2.5 rounded-3">' +
                          '<span class="text-muted d-block small">Tanggal Lahir (dari NIK):</span>' +
                          '<strong class="text-primary fs-6"><i class="bi bi-calendar-event text-primary me-1"></i>' + (d.birthDateDisplay || '-') + '</strong>' +
                          '<div class="small text-muted">Format ISO: <code>' + (d.birthDateFormatted || '-') + '</code></div>' +
                        '</div>' +
                      '</div>' +
                      '<div class="col-12 col-sm-6">' +
                        '<div class="bg-light p-2.5 rounded-3">' +
                          '<span class="text-muted d-block small">Tanggal Lahir (Tersimpan di DB):</span>' +
                          '<strong class="text-dark fs-6"><i class="bi bi-database text-secondary me-1"></i>' + (dobValue || '<span class="text-danger">Kosong</span>') + '</strong>' +
                          '<div class="small text-muted">Status: ' + (isMatch === true ? '<span class="text-success fw-bold">Sesuai</span>' : '<span class="text-danger fw-bold">Perlu Penyesuaian</span>') + '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>' + discHTML +
                    '<div class="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2 border-top">' +
                      '<span class="small text-muted">No. Urut Kependudukan: <code>' + (d.sequenceNumber || '-') + '</code></span>' + fixBtnHTML +
                    '</div>' +
                  '</div>' +
                '</div>';
            } else {
              const errorMsg = (d && d.errors && d.errors.length > 0) ? d.errors.join('<br>') : (res.message || 'Struktur NIK tidak valid');
              resultBox.innerHTML = '<div class="alert alert-danger border-danger border-opacity-25 rounded-4 p-3 shadow-sm">' +
                  '<div class="d-flex align-items-start gap-2">' +
                    '<i class="bi bi-x-circle-fill text-danger fs-4"></i>' +
                    '<div>' +
                      '<h6 class="fw-bold text-danger mb-1">Struktur NIK Tidak Valid</h6>' +
                      '<div class="small text-dark mb-0">' + errorMsg + '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>';
            }
          } catch (err) {
            if (loadingDiv) loadingDiv.classList.add('d-none');
            btnExecute.disabled = false;
            if (resultBox) {
              resultBox.classList.remove('d-none');
              resultBox.innerHTML = '<div class="alert alert-danger rounded-4 p-3"><i class="bi bi-exclamation-triangle-fill me-1"></i> Gagal menghubungi server lokal.</div>';
            }
          }
        });
      }
    });
  </script>
`;
}