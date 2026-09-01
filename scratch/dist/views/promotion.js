export function renderPromotionPage(masterClasses, fromClass, selectedToId, toClass, isGraduationMode, students, historyLogs, flash = '') {
    const fromSelectOptions = masterClasses.map(c => `<option value="${c.id}" ${c.id === fromClass.id ? 'selected' : ''}>${c.name} (Tingkat ${c.level})</option>`).join('');
    const toSelectOptions = [
        `<option value="graduated" ${selectedToId === 'graduated' ? 'selected' : ''}>SISWA LULUSAN (LULUS)</option>`,
        ...masterClasses.map(c => `<option value="${c.id}" ${selectedToId === c.id ? 'selected' : ''}>${c.name} (Tingkat ${c.level})</option>`)
    ].join('');
    let studentRows = '';
    if (students.length === 0) {
        studentRows = `<tr><td colspan="6" class="text-center text-muted py-4"><i class="bi bi-inbox fs-2 d-block mb-2"></i>Tidak ada siswa aktif di ${fromClass.name}.</td></tr>`;
    }
    else {
        studentRows = students.map((s, i) => `
      <tr class="student-promote-row" data-id="${s.id}" data-name="${s.name}">
        <td class="text-center">
          <input type="checkbox" class="form-check-input promote-cb" value="${s.id}" onchange="updatePromoteSelectedCount()" />
        </td>
        <td class="text-center fw-semibold text-secondary">${i + 1}</td>
        <td class="fw-bold text-dark">${s.nipd || '-'}</td>
        <td class="text-muted">${s.nisn || '-'}</td>
        <td class="fw-semibold text-primary">${s.name}</td>
        <td class="small text-secondary">${s.birth_place ? `${s.birth_place}, ` : ''}${s.birth_date || '-'}</td>
      </tr>
    `).join('');
    }
    let historyRows = '';
    if (historyLogs.length === 0) {
        historyRows = `<tr><td colspan="6" class="text-center text-muted py-3">Belum ada riwayat proses kenaikan kelas.</td></tr>`;
    }
    else {
        historyRows = historyLogs.map((h, i) => `
      <tr>
        <td class="text-center text-secondary">${i + 1}</td>
        <td class="fw-bold text-dark">${h.student_name || `Siswa ID ${h.student_id}`}</td>
        <td><span class="badge bg-secondary bg-opacity-10 text-dark border px-2.5 py-1 rounded-pill">${h.from_class_name || '-'}</span></td>
        <td>
          ${h.status === 'graduated'
            ? '<span class="badge bg-success px-2.5 py-1 rounded-pill"><i class="bi bi-mortarboard-fill me-1"></i>LULUS</span>'
            : (h.status === 'reverted'
                ? `<span class="badge bg-warning text-dark px-2.5 py-1 rounded-pill"><i class="bi bi-arrow-counterclockwise me-1"></i>Dikembalikan ke ${h.to_class_name || '-'}</span>`
                : `<span class="badge bg-primary px-2.5 py-1 rounded-pill"><i class="bi bi-arrow-right me-1"></i>${h.to_class_name || '-'}</span>`)}
        </td>
        <td class="small text-muted">${h.academic_year || '-'}</td>
        <td class="small text-secondary">${h.processed_by || '-'} <br/><span class="text-muted" style="font-size: 11px;">${h.processed_at}</span></td>
      </tr>
    `).join('');
    }
    return `
    ${flash ? `<div class="alert alert-info py-2.5 px-3 rounded-3 shadow-sm mb-4"><i class="bi bi-info-circle-fill me-2"></i>${flash}</div>` : ''}

    <!-- Header Panel -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h5 class="card-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
          <i class="bi bi-graph-up-arrow text-primary fs-4"></i> Manajemen Kenaikan Kelas & Kelulusan Siswa
        </h5>
        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1.5 rounded-pill fw-semibold">
          <i class="bi bi-shield-lock me-1"></i> Khusus Admin
        </span>
      </div>

      <div class="card-body p-4">
        <!-- Banner Mode Indicator -->
        <div id="promotionBanner" class="alert ${isGraduationMode ? 'alert-success bg-success bg-opacity-10 border-success border-opacity-25' : 'alert-primary bg-primary bg-opacity-10 border-primary border-opacity-25'} py-3 px-4 rounded-4 mb-4">
          <div class="d-flex gap-3 align-items-center">
            <i id="bannerIcon" class="bi ${isGraduationMode ? 'bi-mortarboard-fill text-success fs-2' : 'bi-info-circle-fill text-primary fs-2'}"></i>
            <div>
              <h6 id="bannerTitle" class="fw-bold mb-1 ${isGraduationMode ? 'text-success' : 'text-primary'}">
                ${isGraduationMode ? 'Mode Kelulusan Siswa (Tingkat Akhir)' : 'Mode Kenaikan Kelas Berkelanjutan'}
              </h6>
              <p id="bannerDesc" class="mb-0 small text-secondary">
                ${isGraduationMode
        ? `Siswa dari <strong>${fromClass.name}</strong> akan diproses kelulusannya. Status siswa akan diperbarui menjadi <strong>LULUS (graduated)</strong> dan dipindahkan ke daftar Siswa Lulusan.`
        : `Proses kenaikan kelas dari <strong>${fromClass.name}</strong> ke <strong>${toClass?.name || 'Kelas Tujuan'}</strong>. Anda bebas memilih Kelas Asal dan Kelas Tujuan.`}
              </p>
            </div>
          </div>
        </div>

        <!-- Filter Kelas Asal & Tujuan Form (Dual Flexible Selection) -->
        <form id="classSelectionForm" action="/admin/naik-kelas" method="GET" class="row g-3 align-items-end mb-4 bg-light p-3.5 rounded-4 border">
          <div class="col-md-4">
            <label class="form-label fw-bold text-dark small"><i class="bi bi-box-arrow-right text-primary me-1"></i> Pilih Kelas Asal:</label>
            <select name="from_class_id" class="form-select rounded-pill fw-semibold" onchange="this.form.submit()">
              ${fromSelectOptions}
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-bold text-dark small"><i class="bi bi-box-arrow-in-right text-success me-1"></i> Pilih Kelas Tujuan:</label>
            <select name="to_class_id" id="toClassSelect" class="form-select rounded-pill fw-semibold" onchange="onTargetClassChange(this.value)">
              ${toSelectOptions}
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-bold text-dark small">Tahun Ajaran / Tahun Lulus:</label>
            <input type="text" id="promotionAcademicYear" class="form-control rounded-pill" value="2025/2026" placeholder="Contoh: 2025/2026" />
          </div>
        </form>

        <!-- Bar Kontrol Pilihan Siswa -->
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-secondary bg-opacity-10 text-dark border px-3 py-1.5 rounded-pill fw-semibold small">
              Total Siswa: <strong>${students.length}</strong>
            </span>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1.5 rounded-pill fw-bold small">
              Terpilih: <span id="promoteSelectedCount">0</span> Siswa
            </span>
          </div>

          ${students.length > 0 ? `
          <button type="button" id="btnTriggerPromotion" class="btn ${isGraduationMode ? 'btn-success' : 'btn-primary'} rounded-pill px-4 fw-bold shadow-sm" onclick="openConfirmPromotionModal()">
            <i id="btnTriggerIcon" class="bi ${isGraduationMode ? 'bi-mortarboard-fill' : 'bi-graph-up-arrow'} me-1.5"></i>
            <span id="btnTriggerText">${isGraduationMode ? 'Proses Kelulusan Siswa' : 'Proses Naik Kelas'}</span>
          </button>
          ` : ''}
        </div>

        <!-- Tabel Daftar Siswa -->
        <div class="table-responsive mb-4">
          <table class="table table-hover align-middle mb-0 border rounded-4 overflow-hidden">
            <thead class="table-light">
              <tr>
                <th class="text-center" width="5%">
                  <input type="checkbox" class="form-check-input" id="selectAllPromoteCb" onchange="toggleSelectAllPromote(this.checked)" />
                </th>
                <th class="text-center" width="5%">No</th>
                <th width="15%">NIPD</th>
                <th width="15%">NISN</th>
                <th width="35%">Nama Lengkap Siswa</th>
                <th width="25%">Tempat, Tanggal Lahir</th>
              </tr>
            </thead>
            <tbody>
              ${studentRows}
            </tbody>
          </table>
        </div>

        <!-- Riwayat Kenaikan Kelas Terbaru -->
        <div class="border-top pt-4 mt-4">
          <h6 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-clock-history text-primary"></i> Riwayat Proses Kenaikan Kelas & Kelulusan Terbaru
          </h6>
          <div class="table-responsive">
            <table class="table table-sm table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="text-center" width="5%">No</th>
                  <th width="25%">Nama Siswa</th>
                  <th width="15%">Kelas Asal</th>
                  <th width="20%">Kelas Tujuan / Status</th>
                  <th width="15%">Tahun Ajaran</th>
                  <th width="20%">Diproses Oleh & Waktu</th>
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

    <!-- MODAL KONFIRMASI KENAIKAN KELAS / KELULUSAN -->
    <div class="modal fade" id="confirmPromotionModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header ${isGraduationMode ? 'bg-success text-white' : 'bg-primary text-white'}" id="modalHeader">
            <h5 class="modal-title fw-bold d-flex align-items-center gap-2" id="modalTitle">
              <i class="bi ${isGraduationMode ? 'bi-mortarboard-fill fs-4' : 'bi-graph-up-arrow fs-4'}"></i>
              ${isGraduationMode ? 'Konfirmasi Kelulusan Siswa' : 'Konfirmasi Kenaikan Kelas'}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <div class="alert ${isGraduationMode ? 'alert-success bg-success bg-opacity-10 border-success' : 'alert-primary bg-primary bg-opacity-10 border-primary'}" id="modalAlertBox">
              <p class="mb-0 text-dark font-medium" id="confirmModalText">-</p>
            </div>
            <p class="small text-muted mb-0">
              <i class="bi bi-info-circle me-1"></i> Data kelas siswa akan diperbarui dan perubahan akan secara otomatis dicatat dalam riwayat siswa (history log).
            </p>
          </div>
          <div class="modal-footer bg-light py-3">
            <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn ${isGraduationMode ? 'btn-success' : 'btn-primary'} rounded-pill px-4 fw-bold shadow-sm" id="btnSubmitPromotion" onclick="executePromotion()">
              ${isGraduationMode ? 'Ya, Luluskan Siswa' : 'Ya, Naikkan Kelas'}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CLIENT SCRIPT UNTUK MANAJEMEN KENAIKAN KELAS -->
    <script>
      const FROM_CLASS_ID = ${fromClass.id};
      const FROM_CLASS_NAME = ${JSON.stringify(fromClass.name)};

      document.addEventListener('DOMContentLoaded', function() {
        const modalEl = document.getElementById('confirmPromotionModal');
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

      function updatePromoteSelectedCount() {
        const checked = document.querySelectorAll('.promote-cb:checked');
        const countSpan = document.getElementById('promoteSelectedCount');
        if (countSpan) countSpan.innerText = checked.length;
      }

      function toggleSelectAllPromote(checked) {
        const checkboxes = document.querySelectorAll('.promote-cb');
        checkboxes.forEach(cb => cb.checked = checked);
        updatePromoteSelectedCount();
      }

      function onTargetClassChange(targetVal) {
        const isGrad = (targetVal === 'graduated');
        const triggerBtn = document.getElementById('btnTriggerPromotion');
        const triggerIcon = document.getElementById('btnTriggerIcon');
        const triggerText = document.getElementById('btnTriggerText');

        if (triggerBtn && triggerText) {
          if (isGrad) {
            triggerBtn.className = 'btn btn-success rounded-pill px-4 fw-bold shadow-sm';
            if (triggerIcon) triggerIcon.className = 'bi bi-mortarboard-fill me-1.5';
            triggerText.innerText = 'Proses Kelulusan Siswa';
          } else {
            triggerBtn.className = 'btn btn-primary rounded-pill px-4 fw-bold shadow-sm';
            if (triggerIcon) triggerIcon.className = 'bi bi-graph-up-arrow me-1.5';
            triggerText.innerText = 'Proses Naik Kelas';
          }
        }
      }

      function openConfirmPromotionModal() {
        const checked = document.querySelectorAll('.promote-cb:checked');
        if (checked.length === 0) {
          alert("Silakan pilih minimal 1 siswa untuk diproses.");
          return;
        }

        const count = checked.length;
        const targetVal = document.getElementById('toClassSelect')?.value || 'graduated';
        const isGrad = (targetVal === 'graduated');

        const toSelect = document.getElementById('toClassSelect');
        const targetText = toSelect ? toSelect.options[toSelect.selectedIndex].text.replace(/^â†—\s*/, '') : 'Kelas Tujuan';

        const confirmTextEl = document.getElementById('confirmModalText');
        const submitBtn = document.getElementById('btnSubmitPromotion');
        const modalHeader = document.getElementById('modalHeader');
        const modalTitle = document.getElementById('modalTitle');

        if (isGrad) {
          if (modalHeader) modalHeader.className = 'modal-header bg-success text-white py-3';
          if (modalTitle) modalTitle.innerHTML = '<i class="bi bi-mortarboard-fill fs-4 me-2"></i> Konfirmasi Kelulusan Siswa';
          if (confirmTextEl) confirmTextEl.innerText = "Anda akan meluluskan " + count + " siswa dari " + FROM_CLASS_NAME + ". Status siswa akan diperbarui menjadi LULUS dan dipindahkan ke daftar Siswa Lulusan.";
          if (submitBtn) {
            submitBtn.className = 'btn btn-success rounded-pill px-4 fw-bold shadow-sm';
            submitBtn.innerText = 'Ya, Luluskan Siswa';
          }
        } else {
          if (modalHeader) modalHeader.className = 'modal-header bg-primary text-white py-3';
          if (modalTitle) modalTitle.innerHTML = '<i class="bi bi-graph-up-arrow fs-4 me-2"></i> Konfirmasi Kenaikan Kelas';
          if (confirmTextEl) confirmTextEl.innerText = "Anda akan memindahkan " + count + " siswa dari " + FROM_CLASS_NAME + " ke " + targetText + ". Data kelas siswa akan diperbarui.";
          if (submitBtn) {
            submitBtn.className = 'btn btn-primary rounded-pill px-4 fw-bold shadow-sm';
            submitBtn.innerText = 'Ya, Naikkan Kelas';
          }
        }

        const modalEl = document.getElementById('confirmPromotionModal');
        if (modalEl) {
          modalEl._triggerEl = document.activeElement;
        }
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }

      async function executePromotion() {
        const checked = document.querySelectorAll('.promote-cb:checked');
        const studentIds = Array.from(checked).map(cb => parseInt(cb.value, 10));
        const academicYear = document.getElementById('promotionAcademicYear')?.value || '2025/2026';
        const targetVal = document.getElementById('toClassSelect')?.value || 'graduated';

        const btn = document.getElementById('btnSubmitPromotion');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Memproses...';

        try {
          const res = await fetch('/api/students/promote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              from_class_id: FROM_CLASS_ID,
              to_class_id: targetVal,
              academic_year: academicYear,
              student_ids: studentIds.join(',')
            })
          });

          const data = await res.json();
          if (data.success) {
            showToast(data.message || 'Proses berhasil dilakukan.', 'success', 2500);
            setTimeout(() => location.reload(), 600);
          } else {
            alert('âŒ Gagal Memproses: ' + (data.message || 'Terjadi kesalahan.'));
            btn.disabled = false;
            btn.innerText = (targetVal === 'graduated') ? 'Ya, Luluskan Siswa' : 'Ya, Naikkan Kelas';
          }
        } catch (err) {
          console.error(err);
          alert('Terjadi kesalahan jaringan.');
          btn.disabled = false;
          btn.innerText = (targetVal === 'graduated') ? 'Ya, Luluskan Siswa' : 'Ya, Naikkan Kelas';
        }
      }
    </script>
  `;
}
// ============================================================
// HALAMAN SISWA LULUSAN (RINGKAS & DILENGKAPI PEMBATALAN LULUS)
// ============================================================
