export function renderHomeroomManagementPage(teachers, classesList, flash = '') {
    const flashAlert = flash
        ? `<div class="alert alert-success alert-dismissible fade show rounded-4 shadow-xs border-0 py-3 mb-4" role="alert">
        <i class="bi bi-check-circle-fill me-2 fs-5"></i> ${flash}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
       </div>`
        : '';
    const rows = teachers.map((teacher, i) => {
        const number = i + 1;
        const currentClass = teacher.homeroom_class;
        const badge = currentClass
            ? `<span class="badge bg-primary rounded-pill px-3 py-1.5"><i class="bi bi-house-door-fill me-1"></i> Wali Kelas: ${currentClass}</span>`
            : `<span class="badge bg-secondary rounded-pill px-3 py-1.5"><i class="bi bi-x-circle me-1"></i> Bukan Wali Kelas</span>`;
        const selectOptions = classesList.map(c => {
            const selected = c === currentClass ? 'selected' : '';
            return `<option value="${c}" ${selected}>Kelas ${c}</option>`;
        }).join('\n');
        return `
      <tr>
        <td class="text-center fw-semibold text-secondary align-middle">${number}</td>
        <td class="align-middle fw-bold text-dark">${teacher.id}</td>
        <td class="align-middle fw-semibold text-secondary">${teacher.full_name || 'Guru ' + teacher.id}</td>
        <td class="align-middle text-center">${badge}</td>
        <td class="align-middle">
          <form method="POST" action="/admin/wali-kelas/assign" class="row g-2 align-items-center">
            <input type="hidden" name="teacher_id" value="${teacher.id}">
            <div class="col-auto">
              <div class="input-group input-group-sm">
                <select class="form-select border-end-0 bg-light" style="max-width: 160px;" onchange="
                  const input = this.nextElementSibling;
                  if (this.value === '__custom__') {
                    input.value = '';
                    input.classList.remove('d-none');
                    input.focus();
                  } else {
                    input.value = this.value;
                    input.classList.add('d-none');
                  }
                ">
                  <option value="">-- Bukan Wali Kelas --</option>
                  ${selectOptions}
                  <option value="__custom__" ${currentClass && !classesList.includes(currentClass) ? 'selected' : ''}>Ketik Kustom...</option>
                </select>
                <input type="text" name="class_name" class="form-control bg-light ${currentClass && !classesList.includes(currentClass) ? '' : 'd-none'}" placeholder="Nama kelas..." value="${currentClass || ''}" style="max-width: 140px;">
              </div>
            </div>
            <div class="col-auto">
              <button type="submit" class="btn btn-sm btn-success rounded-pill px-3 fw-semibold">
                <i class="bi bi-save me-1"></i> Simpan
              </button>
            </div>
          </form>
        </td>
      </tr>
    `;
    }).join('');
    return `
    ${flashAlert}
    
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white border-bottom py-3">
        <h5 class="card-title fw-bold text-dark mb-0">
          <i class="bi bi-person-workspace text-primary me-2"></i>Pengaturan Wali Kelas (Homeroom Assignment)
        </h5>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light border-bottom">
              <tr>
                <th class="text-center" width="5%">No</th>
                <th width="15%">ID Guru</th>
                <th width="25%">Nama Guru</th>
                <th class="text-center" width="20%">Status Saat Ini</th>
                <th width="35%">Tentukan Kelas</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length === 0 ? '<tr><td colspan="5" class="text-center py-4 text-muted">Tidak ada data guru.</td></tr>' : rows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
