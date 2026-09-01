import { formatWIT } from './helpers';
import { renderLayout } from './layout';
export function renderDocumentSubmissionsPage(user, submissions, filters, classes, pagination) {
    const statusBadges = {
        pending: '<span class="badge bg-warning text-dark"><i class="bi bi-clock-history me-1"></i> Menunggu Review</span>',
        approved: '<span class="badge bg-success"><i class="bi bi-check-circle-fill me-1"></i> Disetujui</span>',
        rejected: '<span class="badge bg-danger"><i class="bi bi-x-circle-fill me-1"></i> Ditolak</span>'
    };
    const buildQuery = (page) => {
        const params = new URLSearchParams();
        if (filters.status)
            params.set('status', filters.status);
        if (filters.doc_type)
            params.set('doc_type', filters.doc_type);
        if (filters.class_name)
            params.set('class_name', filters.class_name);
        if (filters.search)
            params.set('search', filters.search);
        params.set('page', page.toString());
        return '?' + params.toString();
    };
    // 1. Build Class Options
    const classOptionsHtml = classes.map(c => {
        const selected = filters.class_name === c ? 'selected' : '';
        return `<option value="${c}" ${selected}>${c}</option>`;
    }).join('\n');
    // Helper to render a document cell - flat layout (no card/border/shadow)
    const renderDocCell = (docId, fileUrl, status, rejectionNote, uploadedAt, submitterName, submitterUsername, reviewerName, reviewedAt, studentName, docTypeName, fallbackPhotoUrl = null) => {
        const effectiveUrl = fileUrl || fallbackPhotoUrl;
        if (!effectiveUrl && !status) {
            return `<span class="text-muted small"><i class="bi bi-dash text-muted"></i> Belum Diupload</span>`;
        }
        const effectiveStatus = status || (effectiveUrl ? 'uploaded' : null);
        const cleanStudentName = studentName.replace(/'/g, "\\'");
        // Badge status (inline pill, not full-width)
        let statusBadge = '';
        if (effectiveStatus === 'pending') {
            statusBadge = '<span class="badge bg-warning text-dark rounded-pill px-2 py-1"><i class="bi bi-clock-history me-1"></i>Menunggu Review</span>';
        }
        else if (effectiveStatus === 'approved') {
            statusBadge = '<span class="badge bg-success rounded-pill px-2 py-1"><i class="bi bi-check-circle-fill me-1"></i>Disetujui</span>';
        }
        else if (effectiveStatus === 'rejected') {
            statusBadge = '<span class="badge bg-danger rounded-pill px-2 py-1"><i class="bi bi-x-circle-fill me-1"></i>Ditolak</span>';
        }
        else {
            statusBadge = '<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2 py-1"><i class="bi bi-check me-1"></i>Sudah Diupload</span>';
        }
        // Tombol Lihat TIDAK ditampilkan jika dokumen ditolak (file sudah dihapus dari R2)
        const fileButton = (effectiveUrl && effectiveStatus !== 'rejected')
            ? `<button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-2 py-0 ms-1" style="font-size:0.72rem;" onclick="showDocModal('${effectiveUrl}', '${docTypeName}', '${cleanStudentName}')"><i class="bi bi-eye-fill"></i> Lihat</button>`
            : '';
        const rows = [];
        // Baris 1: badge status + tombol lihat
        rows.push(`<div class="d-flex align-items-center gap-1 mb-1">${statusBadge}${fileButton}</div>`);
        // Baris 2: nama pengunggah (hanya nama lengkap, bukan username/ID) + tanggal upload
        if (uploadedAt) {
            if (submitterName) {
                rows.push(`<div class="text-muted" style="font-size:0.72rem;"><i class="bi bi-person-fill me-1"></i>${submitterName}</div>`);
            }
            rows.push(`<div class="text-muted" style="font-size:0.68rem;"><i class="bi bi-clock me-1"></i>${formatWIT(uploadedAt)}</div>`);
        }
        // Baris 3: info reviewer (hanya jika sudah direview)
        if (reviewerName || reviewedAt) {
            rows.push(`<div class="mt-1 pt-1 border-top" style="font-size:0.7rem;">`);
            if (reviewerName) {
                rows.push(`<div class="text-muted"><i class="bi bi-shield-check text-success me-1"></i><strong>Reviewer:</strong> ${reviewerName}</div>`);
            }
            if (reviewedAt) {
                rows.push(`<div class="text-muted" style="font-size:0.68rem;"><i class="bi bi-clock me-1"></i>${formatWIT(reviewedAt)}</div>`);
            }
            if (rejectionNote) {
                rows.push(`<div class="text-danger mt-1" style="font-size:0.7rem;"><i class="bi bi-exclamation-triangle-fill me-1"></i><strong>Ditolak:</strong> <em>${rejectionNote}</em></div>`);
            }
            rows.push(`</div>`);
        }
        else if (rejectionNote) {
            rows.push(`<div class="text-danger mt-1" style="font-size:0.7rem;"><i class="bi bi-exclamation-triangle-fill me-1"></i><strong>Ditolak:</strong> <em>${rejectionNote}</em></div>`);
        }
        return rows.join('\n');
    };
    // 2. Build Submissions Table or Empty State
    let submissionsHtml = '';
    if (submissions.length === 0) {
        submissionsHtml = `
      <div class="text-center py-5">
        <i class="bi bi-file-earmark-excel text-secondary" style="font-size: 3rem;"></i>
        <h5 class="fw-bold mt-3">Tidak Ada Data Pengajuan</h5>
        <p class="text-muted">Gunakan filter di atas atau upload dokumen untuk memunculkan riwayat pengajuan.</p>
      </div>
    `;
    }
    else {
        const rows = submissions.map((sub, i) => {
            const number = (pagination.currentPage - 1) * 15 + i + 1;
            const akteCell = renderDocCell(sub.akte_id, sub.akte_url, sub.akte_status, sub.akte_rejection_note, sub.akte_uploaded_at, sub.akte_submitter_name, sub.akte_submitter_username || sub.akte_submitted_by, sub.akte_reviewer_name, sub.akte_reviewed_at, sub.student_name, 'Akte Kelahiran');
            const kkCell = renderDocCell(sub.kk_id, sub.kk_url, sub.kk_status, sub.kk_rejection_note, sub.kk_uploaded_at, sub.kk_submitter_name, sub.kk_submitter_username || sub.kk_submitted_by, sub.kk_reviewer_name, sub.kk_reviewed_at, sub.student_name, 'Kartu Keluarga');
            const fotoCell = renderDocCell(sub.foto_id, sub.foto_url, sub.foto_status, sub.foto_rejection_note, sub.foto_uploaded_at, sub.foto_submitter_name, sub.foto_submitter_username || sub.foto_submitted_by, sub.foto_reviewer_name, sub.foto_reviewed_at, sub.student_name, 'Foto Profil', sub.profile_photo_url // fallback: ambil langsung dari students.photo_url
            );
            return `
        <tr>
          <td class="text-center fw-semibold text-secondary">${number}</td>
          <td>
            <div class="fw-bold text-dark">${sub.student_name}</div>
            <div class="small text-muted">Kelas ${sub.class_name}</div>
          </td>
          <td>${akteCell}</td>
          <td>${kkCell}</td>
          <td>${fotoCell}</td>
        </tr>
      `;
        }).join('');
        submissionsHtml = `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 border">
          <thead class="table-light">
            <tr>
              <th class="text-center" width="5%">No</th>
              <th width="20%">Siswa</th>
              <th width="25%">Akte Kelahiran</th>
              <th width="25%">Kartu Keluarga</th>
              <th width="25%">Foto Profil</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
    }
    // 3. Build Pagination
    let paginationHtml = '';
    if (pagination.totalPages > 1) {
        const pageItems = Array.from({ length: pagination.totalPages }, (_, index) => {
            const p = index + 1;
            const active = pagination.currentPage === p ? 'active' : '';
            return `
        <li class="page-item ${active}">
          <a class="page-link" href="${buildQuery(p)}">${p}</a>
        </li>
      `;
        }).join('');
        paginationHtml = `
      <nav class="d-flex justify-content-between align-items-center mt-4">
        <div class="small text-muted">
          Menampilkan halaman <strong>${pagination.currentPage}</strong> dari <strong>${pagination.totalPages}</strong> halaman (${pagination.totalItems} total data)
        </div>
        <ul class="pagination pagination-sm m-0">
          <li class="page-item ${pagination.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-item-link page-link" href="${pagination.currentPage === 1 ? '#' : buildQuery(pagination.currentPage - 1)}"><i class="bi bi-chevron-left"></i> Sebelumnya</a>
          </li>
          ${pageItems}
          <li class="page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}">
            <a class="page-item-link page-link" href="${pagination.currentPage === pagination.totalPages ? '#' : buildQuery(pagination.currentPage + 1)}">Berikutnya <i class="bi bi-chevron-right"></i></a>
          </li>
        </ul>
      </nav>
    `;
    }
    const content = `
    <!-- Filters and Search Card -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white border-bottom py-3">
        <h5 class="card-title fw-bold text-dark mb-0">
          <i class="bi bi-funnel-fill text-primary me-2"></i>Filter & Cari Pengajuan
        </h5>
      </div>
      <div class="card-body">
        <form method="GET" action="/document-submissions">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label small fw-bold text-secondary">Cari Nama Siswa</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input type="text" name="search" class="form-control bg-light border-start-0" placeholder="Ketik nama siswa..." value="${filters.search || ''}">
              </div>
            </div>
            
            <div class="col-md-3">
              <label class="form-label small fw-bold text-secondary">Status Pengajuan</label>
              <select name="status" class="form-select bg-light">
                <option value="">Semua Status</option>
                <option value="pending" ${filters.status === 'pending' ? 'selected' : ''}>Menunggu Review (Pending)</option>
                <option value="approved" ${filters.status === 'approved' ? 'selected' : ''}>Disetujui</option>
                <option value="rejected" ${filters.status === 'rejected' ? 'selected' : ''}>Ditolak</option>
              </select>
            </div>
            
            <div class="col-md-2">
              <label class="form-label small fw-bold text-secondary">Jenis Dokumen</label>
              <select name="doc_type" class="form-select bg-light">
                <option value="">Semua Jenis</option>
                <option value="akte_kelahiran" ${filters.doc_type === 'akte_kelahiran' ? 'selected' : ''}>Akte Kelahiran</option>
                <option value="kartu_keluarga" ${filters.doc_type === 'kartu_keluarga' ? 'selected' : ''}>Kartu Keluarga</option>
                <option value="foto" ${filters.doc_type === 'foto' ? 'selected' : ''}>Foto Profil</option>
              </select>
            </div>
            
            <div class="col-md-2">
              <label class="form-label small fw-bold text-secondary">Kelas</label>
              <select name="class_name" class="form-select bg-light">
                <option value="">Semua Kelas</option>
                ${classOptionsHtml}
              </select>
            </div>
            
            <div class="col-md-2 d-flex align-items-end gap-2">
              <button type="submit" class="btn btn-primary rounded-pill px-3 w-100 fw-semibold shadow-sm">
                <i class="bi bi-filter me-1"></i> Terapkan
              </button>
              <a href="/document-submissions" class="btn btn-outline-secondary rounded-pill px-3 w-100 fw-semibold">
                Reset
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Submissions History Card -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h5 class="card-title fw-bold text-dark mb-0">
          <i class="bi bi-list-check text-primary me-2"></i>Riwayat Pengajuan Dokumen
        </h5>
        <span class="badge bg-primary rounded-pill px-3 py-2 fw-semibold">Total: ${pagination.totalItems} Data</span>
      </div>
      <div class="card-body">
        ${submissionsHtml}
        ${paginationHtml}
      </div>
    </div>

    <!-- Modal Pratinjau Dokumen -->
    <div class="modal fade" id="docPreviewModal" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0">
            <div>
              <h5 class="modal-title fw-bold text-dark mb-0" id="docPreviewTitle">Pratinjau Dokumen</h5>
              <div class="small text-muted" id="docPreviewSubtitle">Siswa</div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-0 bg-light" style="height: 70vh; position: relative;">
            <div id="docPreviewLoader" class="position-absolute top-50 start-50 translate-middle">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <iframe id="docPreviewFrame" src="" style="width:100%; height:100%; border:none; display:none;" onload="document.getElementById('docPreviewLoader').style.display='none'; this.style.display='block';"></iframe>
          </div>
          <div class="modal-footer border-top-0 d-flex justify-content-end align-items-center bg-white">
            <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Tutup</button>
          </div>
        </div>
      </div>
    </div>

    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const modalEl = document.getElementById('docPreviewModal');
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

      function showDocModal(url, docType, studentName) {
        const triggerEl = document.activeElement;
        document.getElementById('docPreviewTitle').textContent = docType;
        document.getElementById('docPreviewSubtitle').textContent = studentName;
        document.getElementById('docPreviewLoader').style.display = 'block';
        
        const frame = document.getElementById('docPreviewFrame');
        frame.style.display = 'none';
        
        if (url.toLowerCase().endsWith('.pdf')) {
          frame.src = url;
        } else {
          frame.srcdoc = '<html><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#f8f9fa;"><img src="' + url + '" style="max-width:100%;max-height:100%;object-fit:contain;"></body></html>';
        }
        
        const modalEl = document.getElementById('docPreviewModal');
        if (modalEl) {
          modalEl._triggerEl = triggerEl;
        }
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }
    </script>
  `;
    return renderLayout('Riwayat Pengajuan Dokumen', user, content, 'document_submissions');
}
