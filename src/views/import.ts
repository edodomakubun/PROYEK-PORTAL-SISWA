import { Role } from '../types';
import { renderLayout } from './layout';

export function renderImportPage(userRole: Role): string {
  return `
    <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

    <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
      <div>
        <h4 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          <a href="/students" class="btn btn-outline-secondary btn-sm rounded-circle p-2 shadow-sm me-1" title="Kembali ke Data Siswa">
            <i class="bi bi-arrow-left fs-5 leading-none"></i>
          </a>
          <i class="bi bi-file-earmark-spreadsheet-fill text-success fs-3"></i>
          <span>Halaman Import & Update Data Excel</span>
        </h4>
        <p class="text-muted small mb-0 ms-5">Unggah file Excel untuk menambah siswa baru atau memperbarui data berdasarkan ID Student.</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <a href="/students" class="btn btn-light rounded-pill px-4 fw-semibold shadow-sm border">
          <i class="bi bi-x-circle me-1"></i> Batal
        </a>
        <button type="button" id="btnValidate" class="btn btn-warning rounded-pill px-4 fw-bold shadow-sm d-inline-flex align-items-center gap-2" disabled>
          <i class="bi bi-shield-check fs-5"></i>
          <span>1. Validasi Data</span>
        </button>
        <button type="button" id="btnSubmit" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm d-inline-flex align-items-center gap-2" disabled>
          <i class="bi bi-send-fill fs-5"></i>
          <span>2. Kirim ke Database</span>
        </button>
      </div>
    </div>

    <!-- Mode Selector Switcher Card -->
    <div class="card p-3 mb-4 rounded-4 shadow-sm border-0 bg-white">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h6 class="fw-bold text-dark mb-1"><i class="bi bi-sliders text-primary me-2"></i>Pilih Mode Operasi Excel:</h6>
          <p class="text-muted small mb-0">Tentukan apakah ingin mengimpor siswa baru atau meng-update data siswa berdasarkan ID Student.</p>
        </div>
        <div class="btn-group p-1 bg-light rounded-pill border" role="group">
          <button type="button" id="btnModeAuto" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm py-2">
            <i class="bi bi-person-plus-fill me-1"></i> Mode 1: Import Baru & Auto-Sync
          </button>
          <button type="button" id="btnModeUpdateId" class="btn btn-outline-secondary rounded-pill px-4 fw-bold py-2 border-0">
            <i class="bi bi-pencil-square me-1"></i> Mode 2: Update Massal via ID Student
          </button>
        </div>
      </div>
    </div>

    <!-- Step 1.5: Field Selection Card for Mode 2 -->
    <div class="card p-4 mb-4 rounded-4 shadow-sm border-0 border-start border-4 border-warning bg-white d-none" id="fieldSelectionCard">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h6 class="fw-bold text-dark mb-1"><i class="bi bi-check2-square text-warning me-2"></i>Pilih Kolom yang Ingin Di-Update (Manual Selection):</h6>
          <p class="text-muted small mb-0">Centang kolom di bawah yang nilainya akan diperbarui dari Excel ke Database. Kolom yang tidak dicentang tidak akan diubah.</p>
        </div>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3" id="btnSelectAllFields">Pilih Semua</button>
          <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btnDeselectAllFields">Kosongkan</button>
        </div>
      </div>
      <div class="row g-2">
        <div class="col-6 col-sm-4 col-md-3">
          <div class="form-check form-switch p-2 bg-light rounded-3 border">
            <input class="form-check-input field-chk ms-0 me-2" type="checkbox" value="nipd" id="chk_nipd" checked>
            <label class="form-check-label fw-semibold text-dark small" for="chk_nipd">NIPD</label>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-md-3">
          <div class="form-check form-switch p-2 bg-light rounded-3 border">
            <input class="form-check-input field-chk ms-0 me-2" type="checkbox" value="nisn" id="chk_nisn" checked>
            <label class="form-check-label fw-semibold text-dark small" for="chk_nisn">NISN</label>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-md-3">
          <div class="form-check form-switch p-2 bg-light rounded-3 border">
            <input class="form-check-input field-chk ms-0 me-2" type="checkbox" value="nik" id="chk_nik" checked>
            <label class="form-check-label fw-semibold text-dark small" for="chk_nik">NIK</label>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-md-3">
          <div class="form-check form-switch p-2 bg-light rounded-3 border">
            <input class="form-check-input field-chk ms-0 me-2" type="checkbox" value="name" id="chk_name" checked>
            <label class="form-check-label fw-semibold text-dark small" for="chk_name">Nama Lengkap</label>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-md-3">
          <div class="form-check form-switch p-2 bg-light rounded-3 border">
            <input class="form-check-input field-chk ms-0 me-2" type="checkbox" value="class_name" id="chk_class_name" checked>
            <label class="form-check-label fw-semibold text-dark small" for="chk_class_name">Kelas</label>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-md-3">
          <div class="form-check form-switch p-2 bg-light rounded-3 border">
            <input class="form-check-input field-chk ms-0 me-2" type="checkbox" value="birth_place" id="chk_birth_place" checked>
            <label class="form-check-label fw-semibold text-dark small" for="chk_birth_place">Tempat Lahir</label>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-md-3">
          <div class="form-check form-switch p-2 bg-light rounded-3 border">
            <input class="form-check-input field-chk ms-0 me-2" type="checkbox" value="birth_date" id="chk_birth_date" checked>
            <label class="form-check-label fw-semibold text-dark small" for="chk_birth_date">Tanggal Lahir</label>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-md-3">
          <div class="form-check form-switch p-2 bg-light rounded-3 border">
            <input class="form-check-input field-chk ms-0 me-2" type="checkbox" value="father_name" id="chk_father_name" checked>
            <label class="form-check-label fw-semibold text-dark small" for="chk_father_name">Nama Ayah</label>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-md-3">
          <div class="form-check form-switch p-2 bg-light rounded-3 border">
            <input class="form-check-input field-chk ms-0 me-2" type="checkbox" value="is_father_alive" id="chk_is_father_alive" checked>
            <label class="form-check-label fw-semibold text-dark small" for="chk_is_father_alive">Status Ayah</label>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-md-3">
          <div class="form-check form-switch p-2 bg-light rounded-3 border">
            <input class="form-check-input field-chk ms-0 me-2" type="checkbox" value="mother_name" id="chk_mother_name" checked>
            <label class="form-check-label fw-semibold text-dark small" for="chk_mother_name">Nama Ibu</label>
          </div>
        </div>
        <div class="col-6 col-sm-4 col-md-3">
          <div class="form-check form-switch p-2 bg-light rounded-3 border">
            <input class="form-check-input field-chk ms-0 me-2" type="checkbox" value="is_mother_alive" id="chk_is_mother_alive" checked>
            <label class="form-check-label fw-semibold text-dark small" for="chk_is_mother_alive">Status Ibu</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Status & Alert Banner Area -->
    <div id="alertArea"></div>

    <!-- Step 1: Upload Dropzone Card -->
    <div class="card p-4 mb-4 rounded-4 shadow-sm border-0 bg-white">
      <div class="border-2 border-dashed rounded-4 p-4 text-center bg-light position-relative" style="border-color: #cbd5e1 !important;" id="dropZone">
        <i class="bi bi-file-earmark-excel-fill text-success mb-2" style="font-size: 3.5rem;"></i>
        <h5 class="fw-bold text-dark mb-1" id="lblDropzoneTitle">Pilih File Data Excel (.xlsx)</h5>
        <p class="text-muted small mb-3" id="lblDropzoneDesc">Drag & drop file Excel Anda di sini, atau klik tombol di bawah untuk memilih file</p>
        <input type="file" id="excelFileInput" accept=".xlsx,.xls" class="d-none" />
        <button type="button" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onclick="document.getElementById('excelFileInput').click()">
          <i class="bi bi-folder2-open me-2"></i> Pilih File Excel...
        </button>

        <div id="fileLoadedBadge" class="mt-3 d-none">
          <div class="d-inline-flex align-items-center gap-2 bg-white rounded-pill px-4 py-2 border shadow-sm">
            <i class="bi bi-check-circle-fill text-success fs-5"></i>
            <span class="fw-bold text-dark" id="lblFileName">filename.xlsx</span>
            <span class="badge bg-secondary rounded-pill ms-2" id="lblRowCount">0 Baris Data</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Excel Preview Table Card -->
    <div class="card p-4 rounded-4 shadow-sm border-0 mb-4 d-none bg-white" id="previewCard">
      <div class="card-header bg-transparent border-0 px-0 pb-3 d-flex align-items-center justify-content-between">
        <h5 class="fw-bold text-dark m-0"><i class="bi bi-table text-primary me-2"></i> Preview Data File Excel</h5>
        <span class="badge bg-primary bg-opacity-10 text-primary border px-3 py-1 rounded-pill small fw-semibold" id="lblValidationStatus">Status: Belum Divalidasi</span>
      </div>
      <div class="card-body px-0 py-0">
        <div class="table-responsive" style="max-height: 450px; overflow-y: auto;">
          <table class="table table-hover align-middle border mb-0" id="previewTable">
            <thead class="bg-light sticky-top" id="previewThead">
              <tr>
                <th style="width: 50px;">No</th>
                <th style="width: 70px;" class="text-center">Aksi</th>
                <th>Status Validasi</th>
                <th>NIPD</th>
                <th>NISN</th>
                <th>NIK</th>
                <th>Nama Lengkap</th>
                <th>Kelas</th>
                <th>Tempat Lahir</th>
                <th>Tanggal Lahir</th>
                <th>Nama Ayah</th>
                <th>Nama Ibu</th>
              </tr>
            </thead>
            <tbody id="previewTbody">
              <tr><td colspan="12" class="text-center text-muted py-4">Pilih file Excel terlebih dahulu.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Edit Baris Preview -->
    <div class="modal fade" id="modalEditRow" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-dark"><i class="bi bi-pencil-square text-warning me-2"></i>Edit Data Siswa di Baris Ini</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form id="formEditRow">
            <div class="modal-body py-3">
              <input type="hidden" id="edit_row_index" />
              
              <div class="row g-3">
                <div class="col-md-6" id="container_edit_id">
                  <label class="form-label small fw-semibold text-dark">ID Student</label>
                  <input type="number" id="edit_row_id" class="form-control rounded-3" placeholder="ID Student" />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Nama Lengkap <span class="text-danger">*</span></label>
                  <input type="text" id="edit_row_name" class="form-control rounded-3" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold text-dark">Kelas</label>
                  <input type="text" id="edit_row_class_name" class="form-control rounded-3" />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold text-dark">NIPD</label>
                  <input type="text" id="edit_row_nipd" class="form-control rounded-3" />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold text-dark">NISN</label>
                  <input type="text" id="edit_row_nisn" class="form-control rounded-3" />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold text-dark">NIK</label>
                  <input type="text" id="edit_row_nik" class="form-control rounded-3" />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold text-dark">Tempat Lahir</label>
                  <input type="text" id="edit_row_birth_place" class="form-control rounded-3" />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold text-dark">Tanggal Lahir (DD-MM-YYYY)</label>
                  <input type="text" id="edit_row_birth_date" class="form-control rounded-3" placeholder="DD-MM-YYYY" />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Nama Ayah</label>
                  <input type="text" id="edit_row_father_name" class="form-control rounded-3" />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Nama Ibu</label>
                  <input type="text" id="edit_row_mother_name" class="form-control rounded-3" />
                </div>
              </div>
            </div>
            <div class="modal-footer border-0 pt-0">
              <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-warning rounded-pill px-4 fw-bold">
                <i class="bi bi-check-lg me-1"></i> Simpan ke Baris Preview
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Client-side Logic -->
    <script>
      document.addEventListener('DOMContentLoaded', function () {
        const fileInput = document.getElementById('excelFileInput');
        const btnValidate = document.getElementById('btnValidate');
        const btnSubmit = document.getElementById('btnSubmit');
        const alertArea = document.getElementById('alertArea');
        const previewCard = document.getElementById('previewCard');
        const previewThead = document.getElementById('previewThead');
        const previewTbody = document.getElementById('previewTbody');
        const fileLoadedBadge = document.getElementById('fileLoadedBadge');
        const lblFileName = document.getElementById('lblFileName');
        const lblRowCount = document.getElementById('lblRowCount');
        const lblValidationStatus = document.getElementById('lblValidationStatus');
        const fieldSelectionCard = document.getElementById('fieldSelectionCard');

        const btnModeAuto = document.getElementById('btnModeAuto');
        const btnModeUpdateId = document.getElementById('btnModeUpdateId');
        const btnSelectAllFields = document.getElementById('btnSelectAllFields');
        const btnDeselectAllFields = document.getElementById('btnDeselectAllFields');

        const modalEditEl = document.getElementById('modalEditRow');
        const modalEdit = new bootstrap.Modal(modalEditEl);
        const formEditRow = document.getElementById('formEditRow');

        let currentMode = 'auto'; // 'auto' | 'update_id'
        let currentFile = null;
        let parsedRows = [];
        let validatedResults = null;
        let isValidated = false;

        btnModeAuto.addEventListener('click', () => setMode('auto'));
        btnModeUpdateId.addEventListener('click', () => setMode('update_id'));

        function setMode(mode) {
          currentMode = mode;
          resetValidationState();

          if (mode === 'auto') {
            btnModeAuto.className = 'btn btn-primary rounded-pill px-4 fw-bold shadow-sm py-2';
            btnModeUpdateId.className = 'btn btn-outline-secondary rounded-pill px-4 fw-bold py-2 border-0';
            fieldSelectionCard.classList.add('d-none');
          } else {
            btnModeUpdateId.className = 'btn btn-warning text-dark rounded-pill px-4 fw-bold shadow-sm py-2';
            btnModeAuto.className = 'btn btn-outline-secondary rounded-pill px-4 fw-bold py-2 border-0';
            fieldSelectionCard.classList.remove('d-none');
          }

          if (currentFile) {
            parseExcelFile(currentFile);
          }
        }

        function resetValidationState() {
          isValidated = false;
          validatedResults = null;
          btnSubmit.disabled = true;
          lblValidationStatus.textContent = 'Status: Belum Divalidasi';
          lblValidationStatus.className = 'badge bg-warning bg-opacity-10 text-dark border border-warning px-3 py-1 rounded-pill small fw-semibold';
        }

        btnSelectAllFields.addEventListener('click', () => {
          document.querySelectorAll('.field-chk').forEach(chk => chk.checked = true);
          if (currentFile) parseExcelFile(currentFile);
        });

        btnDeselectAllFields.addEventListener('click', () => {
          document.querySelectorAll('.field-chk').forEach(chk => chk.checked = false);
          if (currentFile) parseExcelFile(currentFile);
        });

        document.querySelectorAll('.field-chk').forEach(chk => {
          chk.addEventListener('change', () => {
            if (currentFile) parseExcelFile(currentFile);
          });
        });

        function getSelectedFields() {
          const fields = [];
          document.querySelectorAll('.field-chk:checked').forEach(chk => {
            fields.push(chk.value);
          });
          return fields;
        }

        fileInput.addEventListener('change', (e) => {
          const files = e.target.files;
          if (!files || !files[0]) return;
          currentFile = files[0];
          parseExcelFile(currentFile);
        });

        function parseExcelFile(file) {
          lblFileName.textContent = file.name;
          resetValidationState();
          btnValidate.disabled = true;
          alertArea.innerHTML = '';

          const reader = new FileReader();
          reader.onload = function (e) {
            try {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: 'array', cellDates: true, raw: false });

              parsedRows = [];

              workbook.SheetNames.forEach(sheetName => {
                const ws = workbook.Sheets[sheetName];
                const jsonRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

                let headerIdx = -1;
                let colMap = {};

                for (let i = 0; i < Math.min(jsonRows.length, 10); i++) {
                  const r = jsonRows[i];
                  if (!r || !Array.isArray(r)) continue;
                  const rLower = r.map(v => String(v || '').toLowerCase().trim());

                  if (currentMode === 'update_id') {
                    if (rLower.some(v => v === 'id siswa' || v === 'id student' || v === 'id_siswa' || v === 'id')) {
                      headerIdx = i;
                      rLower.forEach((val, idx) => {
                        if (val === 'id siswa' || val === 'id student' || val === 'id_siswa' || val === 'id') colMap['id'] = idx;
                        if (val === 'nipd' || val === 'no. induk' || val === 'no induk') colMap['nipd'] = idx;
                        if (val === 'nisn') colMap['nisn'] = idx;
                        if (val === 'nik') colMap['nik'] = idx;
                        if (val === 'nama' || val === 'nama lengkap' || val === 'nama siswa') colMap['name'] = idx;
                        if (val === 'kelas' || val === 'class' || val === 'rombel') colMap['class_name'] = idx;
                        if (val === 'tempat lahir' || val === 'tmp lahir' || val === 'tmp. lahir') colMap['birth_place'] = idx;
                        if (val === 'tanggal lahir' || val === 'tgl lahir' || val === 'tgl. lahir') colMap['birth_date'] = idx;
                        if (val === 'nama ayah' || val === 'ayah') colMap['father_name'] = idx;
                        if (val === 'status ayah') colMap['is_father_alive'] = idx;
                        if (val === 'nama ibu' || val === 'ibu') colMap['mother_name'] = idx;
                        if (val === 'status ibu') colMap['is_mother_alive'] = idx;
                      });
                      break;
                    }
                  } else {
                    if (rLower.some(v => v === 'nama' || v === 'nama lengkap' || v === 'nama siswa')) {
                      headerIdx = i;
                      rLower.forEach((val, idx) => {
                        if (val === 'nipd' || val === 'no. induk' || val === 'no induk') colMap['nipd'] = idx;
                        if (val === 'nisn') colMap['nisn'] = idx;
                        if (val === 'nik') colMap['nik'] = idx;
                        if (val === 'nama' || val === 'nama lengkap' || val === 'nama siswa') colMap['name'] = idx;
                        if (val === 'kelas' || val === 'class' || val === 'rombel') colMap['class_name'] = idx;
                        if (val === 'tempat lahir' || val === 'tmp lahir' || val === 'tmp. lahir') colMap['birth_place'] = idx;
                        if (val === 'tanggal lahir' || val === 'tgl lahir' || val === 'tgl. lahir') colMap['birth_date'] = idx;
                        if (val === 'nama ayah' || val === 'ayah') colMap['father_name'] = idx;
                        if (val === 'nama ibu' || val === 'ibu') colMap['mother_name'] = idx;
                      });
                      break;
                    }
                  }
                }

                const clean = (row, idx) => {
                  if (idx === undefined) return null;
                  let v = String(row[idx] || '').trim();
                  if (v.includes('E+') || v.includes('e+')) {
                    try { v = BigInt(Math.round(Number(v))).toString(); } catch (err) { }
                  }
                  return (v === '' || v === '-') ? null : v;
                };

                const formatDDMMYYYY = (val) => {
                  if (!val) return null;
                  const str = String(val).trim();
                  if (!str || str === '-') return null;

                  if (/^\\d{2}-\\d{2}-\\d{4}$/.test(str)) return str;

                  const iso = str.match(/^(\\d{4})[-/](\\d{1,2})[-/](\\d{1,2})/);
                  if (iso) return \`\${iso[3].padStart(2, '0')}-\${iso[2].padStart(2, '0')}-\${iso[1]}\`;

                  const slash = str.match(/^(\\d{1,2})[/](\\d{1,2})[/](\\d{4})/);
                  if (slash) return \`\${slash[1].padStart(2, '0')}-\${slash[2].padStart(2, '0')}-\${slash[3]}\`;

                  try {
                    const d = new Date(str);
                    if (!isNaN(d.getTime())) {
                      const day = String(d.getDate()).padStart(2, '0');
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const year = d.getFullYear();
                      return \`\${day}-\${month}-\${year}\`;
                    }
                  } catch(e) {}

                  return str;
                };

                if (headerIdx >= 0) {
                  for (let i = headerIdx + 1; i < jsonRows.length; i++) {
                    const row = jsonRows[i];
                    if (!row || !Array.isArray(row)) continue;

                    if (currentMode === 'update_id') {
                      const idVal = clean(row, colMap['id']);
                      if (!idVal || isNaN(Number(idVal))) continue;

                      parsedRows.push({
                        id: Number(idVal),
                        nipd: clean(row, colMap['nipd']),
                        nisn: clean(row, colMap['nisn']),
                        nik: clean(row, colMap['nik']),
                        name: clean(row, colMap['name']) || '',
                        class_name: clean(row, colMap['class_name']) || '',
                        birth_place: clean(row, colMap['birth_place']),
                        birth_date: formatDDMMYYYY(clean(row, colMap['birth_date'])),
                        father_name: clean(row, colMap['father_name']),
                        is_father_alive: clean(row, colMap['is_father_alive']),
                        mother_name: clean(row, colMap['mother_name']),
                        is_mother_alive: clean(row, colMap['is_mother_alive'])
                      });
                    } else {
                      const name = String(row[colMap['name']] || '').trim();
                      if (!name || name === '-') continue;

                      parsedRows.push({
                        nipd: clean(row, colMap['nipd']),
                        nisn: clean(row, colMap['nisn']),
                        nik: clean(row, colMap['nik']),
                        name: name,
                        class_name: clean(row, colMap['class_name']) || '',
                        birth_place: clean(row, colMap['birth_place']),
                        birth_date: formatDDMMYYYY(clean(row, colMap['birth_date'])),
                        father_name: clean(row, colMap['father_name']),
                        mother_name: clean(row, colMap['mother_name'])
                      });
                    }
                  }
                }
              });

              if (parsedRows.length === 0) {
                const errMsg = currentMode === 'update_id'
                  ? 'Tidak ada baris dengan kolom ID Student yang valid pada file Excel tersebut.'
                  : 'Tidak ada data siswa yang valid ditemukan pada file Excel tersebut.';
                alertArea.innerHTML = \`<div class="alert alert-danger rounded-4">\${errMsg}</div>\`;
                previewCard.classList.add('d-none');
                return;
              }

              fileLoadedBadge.classList.remove('d-none');
              lblRowCount.textContent = parsedRows.length + ' Baris Data';
              previewCard.classList.remove('d-none');
              btnValidate.disabled = false;

              renderPreviewTable(parsedRows);

            } catch(err) {
              alertArea.innerHTML = '<div class="alert alert-danger rounded-4">Gagal membaca file Excel: ' + err.message + '</div>';
            }
          };
          reader.readAsArrayBuffer(file);
        }

        // FUNGSI UTAMA RENDER TABEL: MENYEMBUNYIKAN KETAT DATA TANPA PERUBAHAN
        function renderPreviewTable(rows, validatedItems = null) {
          previewTbody.innerHTML = '';
          let displayedCount = 0;

          if (currentMode === 'update_id') {
            previewThead.innerHTML = \`
              <tr>
                <th style="width: 50px;">No</th>
                <th style="width: 70px;" class="text-center">Aksi</th>
                <th style="width: 100px;">ID Siswa</th>
                <th>Status Matching</th>
                <th>Nama Siswa di DB</th>
                <th>Nama di Excel</th>
                <th>Nilai Kolom yang Akan Di-Update</th>
              </tr>
            \`;

            rows.forEach((r, idx) => {
              let statusBadge = '<span class="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill">Belum Divalidasi</span>';
              let matchedName = '-';
              let updateSummary = '-';

              if (validatedItems) {
                const v = validatedItems[idx];
                
                // FILTER KETAT: Apabila ID tidak cocok ATAU tidak ada perubahan (termasuk huruf kapital), SEMBUNYIKAN DARI TABEL
                if (!v || v.status !== 'found' || !v.changes || v.changes.length === 0) {
                  return;
                }

                statusBadge = '<span class="badge bg-warning bg-opacity-10 text-dark border border-warning rounded-pill"><i class="bi bi-pencil-fill me-1"></i> Ada Perubahan</span>';
                matchedName = v.matchedName + (v.matchedClass ? \` (\${v.matchedClass})\` : '');
                updateSummary = v.changes.map(c => \`<span class="badge bg-light text-dark border me-1 mb-1">\${c.label}: \${c.newValue}</span>\`).join(' ');
              }

              displayedCount++;
              const tr = document.createElement('tr');
              tr.innerHTML = \`
                <td class="text-secondary fw-semibold">\${displayedCount}</td>
                <td class="text-center">
                  <button type="button" class="btn btn-sm btn-outline-warning rounded-pill px-2 py-0 btn-edit-row" data-idx="\${idx}" title="Edit Baris Ini">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                </td>
                <td><span class="badge bg-dark rounded-pill px-3">#\${r.id}</span></td>
                <td>\${statusBadge}</td>
                <td class="fw-bold text-dark">\${matchedName}</td>
                <td>\${r.name || '-'}</td>
                <td>\${updateSummary}</td>
              \`;
              previewTbody.appendChild(tr);
            });

            if (validatedItems && displayedCount === 0) {
              previewTbody.innerHTML = \`
                <tr>
                  <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-shield-check text-success fs-3 d-block mb-2"></i>
                    <strong>Seluruh data pada Excel cocok & sama persis dengan database!</strong><br/>
                    <span class="small">Tidak ada data siswa yang perlu diperbarui. Semua baris yang tidak berubah (termasuk kapitalisasi huruf) telah disembunyikan.</span>
                  </td>
                </tr>
              \`;
            }

          } else {
            previewThead.innerHTML = \`
              <tr>
                <th style="width: 50px;">No</th>
                <th style="width: 70px;" class="text-center">Aksi</th>
                <th>Status Validasi</th>
                <th>NIPD</th>
                <th>NISN</th>
                <th>NIK</th>
                <th>Nama Lengkap</th>
                <th>Kelas</th>
                <th>Tempat Lahir</th>
                <th>Tanggal Lahir</th>
                <th>Nama Ayah</th>
                <th>Nama Ibu</th>
              </tr>
            \`;

            rows.forEach((r, idx) => {
              let statusBadge = '<span class="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill">Belum Divalidasi</span>';
              
              if (validatedItems) {
                const v = validatedItems[idx];

                // FILTER KETAT: Apabila data berstatus 'skip' (sama persis hingga huruf kecil/kapital), SEMBUNYIKAN DARI TABEL
                if (!v || v.status === 'skip' || (v.status !== 'new' && v.status !== 'update')) {
                  return;
                }

                if (v.status === 'new') {
                  statusBadge = '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill"><i class="bi bi-person-plus-fill me-1"></i> Data Baru</span>';
                } else if (v.status === 'update') {
                  statusBadge = \`<span class="badge bg-warning bg-opacity-10 text-dark border border-warning rounded-pill" title="\${v.changes.join(', ')}"><i class="bi bi-pencil-fill me-1"></i> Ada Perubahan (\${v.changes.length})</span>\`;
                }
              }

              displayedCount++;
              const tr = document.createElement('tr');
              tr.innerHTML = \`
                <td class="text-secondary fw-semibold">\${displayedCount}</td>
                <td class="text-center">
                  <button type="button" class="btn btn-sm btn-outline-warning rounded-pill px-2 py-0 btn-edit-row" data-idx="\${idx}" title="Edit Baris Ini">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                </td>
                <td>\${statusBadge}</td>
                <td><code>\${r.nipd || '-'}</code></td>
                <td><code>\${r.nisn || '-'}</code></td>
                <td><code>\${r.nik || '-'}</code></td>
                <td class="fw-bold text-dark">\${r.name}</td>
                <td><span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill">\${r.class_name || '-'}</span></td>
                <td>\${r.birth_place || '-'}</td>
                <td>\${r.birth_date || '-'}</td>
                <td>\${r.father_name || '-'}</td>
                <td>\${r.mother_name || '-'}</td>
              \`;
              previewTbody.appendChild(tr);
            });

            if (validatedItems && displayedCount === 0) {
              previewTbody.innerHTML = \`
                <tr>
                  <td colspan="12" class="text-center text-muted py-4">
                    <i class="bi bi-shield-check text-success fs-3 d-block mb-2"></i>
                    <strong>Seluruh data siswa di Excel sudah terdaftar dan lengkap di database!</strong><br/>
                    <span class="small">Tidak ada siswa baru maupun perubahan data. Data yang tidak mengalami perubahan disembunyikan otomatis.</span>
                  </td>
                </tr>
              \`;
            }
          }

          bindEditRowEvents();
        }

        function bindEditRowEvents() {
          document.querySelectorAll('.btn-edit-row').forEach(btn => {
            btn.addEventListener('click', function () {
              const idx = Number(this.dataset.idx);
              const r = parsedRows[idx];
              if (!r) return;

              document.getElementById('edit_row_index').value = idx;
              
              const containerId = document.getElementById('container_edit_id');
              const inputId = document.getElementById('edit_row_id');

              if (currentMode === 'update_id') {
                containerId.classList.remove('d-none');
                inputId.value = r.id || '';
              } else {
                containerId.classList.add('d-none');
                inputId.value = '';
              }

              document.getElementById('edit_row_name').value = r.name || '';
              document.getElementById('edit_row_class_name').value = r.class_name || '';
              document.getElementById('edit_row_nipd').value = r.nipd || '';
              document.getElementById('edit_row_nisn').value = r.nisn || '';
              document.getElementById('edit_row_nik').value = r.nik || '';
              document.getElementById('edit_row_birth_place').value = r.birth_place || '';
              document.getElementById('edit_row_birth_date').value = r.birth_date || '';
              document.getElementById('edit_row_father_name').value = r.father_name || '';
              document.getElementById('edit_row_mother_name').value = r.mother_name || '';

              modalEdit.show();
            });
          });
        }

        formEditRow.addEventListener('submit', function (e) {
          e.preventDefault();
          const idx = Number(document.getElementById('edit_row_index').value);
          if (isNaN(idx) || !parsedRows[idx]) return;

          const cleanVal = (val) => {
            const str = String(val || '').trim();
            return (str === '' || str === '-') ? null : str;
          };

          if (currentMode === 'update_id') {
            const idVal = Number(document.getElementById('edit_row_id').value);
            if (!idVal || isNaN(idVal)) {
              alert('ID Student wajib berupa angka!');
              return;
            }
            parsedRows[idx].id = idVal;
          }

          parsedRows[idx].name = document.getElementById('edit_row_name').value.trim();
          parsedRows[idx].class_name = cleanVal(document.getElementById('edit_row_class_name').value);
          parsedRows[idx].nipd = cleanVal(document.getElementById('edit_row_nipd').value);
          parsedRows[idx].nisn = cleanVal(document.getElementById('edit_row_nisn').value);
          parsedRows[idx].nik = cleanVal(document.getElementById('edit_row_nik').value);
          parsedRows[idx].birth_place = cleanVal(document.getElementById('edit_row_birth_place').value);
          parsedRows[idx].birth_date = cleanVal(document.getElementById('edit_row_birth_date').value);
          parsedRows[idx].father_name = cleanVal(document.getElementById('edit_row_father_name').value);
          parsedRows[idx].mother_name = cleanVal(document.getElementById('edit_row_mother_name').value);

          resetValidationState();
          modalEdit.hide();
          renderPreviewTable(parsedRows);
        });

        btnValidate.addEventListener('click', async function() {
          if (parsedRows.length === 0) return;

          if (currentMode === 'update_id') {
            const selectedFields = getSelectedFields();
            if (selectedFields.length === 0) {
              alert('Pilih setidaknya satu kolom yang ingin di-update sebelum melakukan validasi!');
              return;
            }
          }

          btnValidate.disabled = true;
          btnValidate.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Memvalidasi...';

          try {
            const endpoint = currentMode === 'update_id' ? '/api/students/validate-update-by-id' : '/api/students/validate-import';
            const payload = currentMode === 'update_id'
              ? { rows: parsedRows, selectedFields: getSelectedFields() }
              : { rows: parsedRows };

            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            const data = await res.json();
            btnValidate.disabled = false;
            btnValidate.innerHTML = '<i class="bi bi-shield-check fs-5 me-1"></i> 1. Validasi Data';

            if (!res.ok || !data.success) {
              alertArea.innerHTML = \`<div class="alert alert-danger rounded-4">Validasi gagal: \${data.message || 'Error'}</div>\`;
              return;
            }

            validatedResults = data.results;
            isValidated = true;

            renderPreviewTable(parsedRows, validatedResults);

            if (currentMode === 'update_id') {
              const { countFound, countNotFound } = data.summary;
              if (countFound > 0) {
                btnSubmit.disabled = false;
                lblValidationStatus.textContent = 'Status: Validasi Sukses';
                lblValidationStatus.className = 'badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1 rounded-pill small fw-semibold';

                alertArea.innerHTML = \`
                  <div class="alert alert-success alert-dismissible fade show rounded-4 shadow-sm border-0 mb-4" style="background: linear-gradient(135deg, #10b98115 0%, #05966908 100%); border-left: 5px solid #10b981 !important;">
                    <div class="d-flex align-items-center gap-3">
                      <i class="bi bi-check-circle-fill text-success fs-2"></i>
                      <div>
                        <h6 class="fw-bold text-dark mb-1">Validasi Selesai! Hanya Menampilkan Baris Berubah.</h6>
                        <p class="mb-0 small text-secondary">
                          Ditemukan <strong class="text-success">\${countFound} ID Siswa yang Mengalami Perubahan Data</strong>. 
                          \${countNotFound > 0 ? \`(\${countNotFound} baris tanpa perubahan disembunyikan otomatis).\` : ''}
                          Silakan klik <strong>"2. Kirim ke Database"</strong> untuk mengeksekusi update.
                        </p>
                      </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                  </div>
                \`;
              } else {
                btnSubmit.disabled = true;
                lblValidationStatus.textContent = 'Status: Tidak Ada Perubahan';
                lblValidationStatus.className = 'badge bg-secondary bg-opacity-10 text-secondary border px-3 py-1 rounded-pill small fw-semibold';

                alertArea.innerHTML = \`
                  <div class="alert alert-warning alert-dismissible fade show rounded-4 shadow-sm border-0 mb-4" style="border-left: 5px solid #f59e0b !important;">
                    <div class="d-flex align-items-center gap-3">
                      <i class="bi bi-info-circle-fill text-warning fs-2"></i>
                      <div>
                        <h6 class="fw-bold text-dark mb-1">Tidak Ada Data yang Perlu Di-Update!</h6>
                        <p class="mb-0 small text-secondary">Seluruh ID Siswa di file ini sudah sama persis dengan database. Tabel disembunyikan.</p>
                      </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                  </div>
                \`;
              }

            } else {
              const { countNew, countUpdate, countSkip } = data.summary;
              if (countNew > 0 || countUpdate > 0) {
                btnSubmit.disabled = false;
                lblValidationStatus.textContent = 'Status: Validasi Sukses (Siap Dikirim)';
                lblValidationStatus.className = 'badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1 rounded-pill small fw-semibold';

                alertArea.innerHTML = \`
                  <div class="alert alert-success alert-dismissible fade show rounded-4 shadow-sm border-0 mb-4" style="background: linear-gradient(135deg, #10b98115 0%, #05966908 100%); border-left: 5px solid #10b981 !important;">
                    <div class="d-flex align-items-center gap-3">
                      <i class="bi bi-check-circle-fill text-success fs-2"></i>
                      <div>
                        <h6 class="fw-bold text-dark mb-1">Validasi Berhasil! Hanya Menampilkan Data Baru/Perubahan.</h6>
                        <p class="mb-0 small text-secondary">
                          Ditemukan <strong class="text-success">\${countNew} Siswa Baru</strong> dan <strong class="text-warning text-dark">\${countUpdate} Data Perubahan</strong>. 
                          \${countSkip > 0 ? \`(\${countSkip} baris data yang sudah lengkap/sama disembunyikan).\` : ''}
                          Silakan klik <strong>"2. Kirim ke Database"</strong> untuk menyimpan.
                        </p>
                      </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                  </div>
                \`;
              } else {
                btnSubmit.disabled = true;
                lblValidationStatus.textContent = 'Status: Tidak Ada Perubahan';
                lblValidationStatus.className = 'badge bg-secondary bg-opacity-10 text-secondary border px-3 py-1 rounded-pill small fw-semibold';

                alertArea.innerHTML = \`
                  <div class="alert alert-warning alert-dismissible fade show rounded-4 shadow-sm border-0 mb-4" style="border-left: 5px solid #f59e0b !important;">
                    <div class="d-flex align-items-center gap-3">
                      <i class="bi bi-exclamation-triangle-fill text-warning fs-2"></i>
                      <div>
                        <h6 class="fw-bold text-dark mb-1">Hasil Validasi: Tidak Ada Data Baru atau Perubahan!</h6>
                        <p class="mb-0 small text-secondary">
                          Seluruh <strong>\${parsedRows.length} data siswa</strong> di file Excel ini sudah ada di database dan datanya sudah lengkap.
                        </p>
                      </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                  </div>
                \`;
              }
            }

          } catch(err) {
            btnValidate.disabled = false;
            btnValidate.innerHTML = '<i class="bi bi-shield-check fs-5 me-1"></i> 1. Validasi Data';
            alertArea.innerHTML = '<div class="alert alert-danger rounded-4">Error saat memvalidasi: ' + err.message + '</div>';
          }
        });

        btnSubmit.addEventListener('click', async function() {
          if (!isValidated || !validatedResults) {
            alert('Anda HARUS melakukan Validasi Data terlebih dahulu sebelum mengirim!');
            return;
          }

          const confirmMsg = currentMode === 'update_id'
            ? 'Apakah Anda yakin ingin memperbarui data siswa berdasarkan ID Student di database D1?'
            : 'Apakah Anda yakin ingin menyimpan hasil validasi data ke database D1?';

          if (!confirm(confirmMsg)) return;

          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Mengirim ke Database...';

          try {
            const endpoint = currentMode === 'update_id' ? '/api/students/execute-update-by-id' : '/api/students/execute-import';
            const payload = currentMode === 'update_id'
              ? { rows: parsedRows, selectedFields: getSelectedFields(), validation: validatedResults }
              : { rows: parsedRows, validation: validatedResults };

            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            const data = await res.json();
            btnSubmit.innerHTML = '<i class="bi bi-send-fill fs-5 me-1"></i> 2. Kirim ke Database';

            if (!res.ok || !data.success) {
              alertArea.innerHTML = \`<div class="alert alert-danger rounded-4">Gagal menyimpan ke database: \${data.message || 'Error'}</div>\`;
              btnSubmit.disabled = false;
              return;
            }

            window.location.href = '/students?flash=' + encodeURIComponent(data.message);

          } catch(err) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<i class="bi bi-send-fill fs-5 me-1"></i> 2. Kirim ke Database';
            alertArea.innerHTML = '<div class="alert alert-danger rounded-4">Error koneksi: ' + err.message + '</div>';
          }
        });
      });
    </script>
  `;
}