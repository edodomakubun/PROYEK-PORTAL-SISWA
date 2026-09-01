import { renderLayout } from './layout';
export function renderDocumentReviewPage(user, pendingDocs) {
    const isReviewer = user.role === 'admin' || user.is_document_reviewer === 1;
    const content = `
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h5 class="card-title fw-bold text-dark mb-0">
          <i class="bi bi-file-earmark-check-fill text-primary me-2"></i>Review & Status Dokumen Siswa
        </h5>
        ${(pendingDocs.length > 0 && isReviewer) ? `
        <form id="massApproveForm" action="/api/reviewer/documents/approve-mass" method="POST" class="d-inline">
          <button type="button" class="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm btn-action" data-action="mass-approve">
            <i class="bi bi-check-all me-1"></i> Approve Semua Dokumen
          </button>
        </form>
        ` : ''}
      </div>
      <div class="card-body">
        <!-- Toolbar Filter & Pencarian Interaktif -->
        <div class="bg-light p-3 rounded-4 mb-4 border d-flex flex-column gap-3">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center flex-wrap gap-1.5">
              <span class="fw-semibold text-secondary small me-2">
                <i class="bi bi-funnel-fill text-primary me-1"></i> Filter Dokumen:
              </span>
              <button type="button" class="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-semibold filter-btn active" data-filter="all">
                Semua
              </button>
              <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 fw-semibold filter-btn" data-filter="pending">
                Pending
              </button>
              <button type="button" class="btn btn-sm btn-outline-success rounded-pill px-3 py-1 fw-semibold filter-btn" data-filter="akte_approved">
                Akte Disetujui
              </button>
              <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 fw-semibold filter-btn" data-filter="akte_rejected">
                Akte Ditolak
              </button>
              <button type="button" class="btn btn-sm btn-outline-success rounded-pill px-3 py-1 fw-semibold filter-btn" data-filter="kk_approved">
                KK Disetujui
              </button>
              <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 fw-semibold filter-btn" data-filter="kk_rejected">
                KK Ditolak
              </button>
            </div>

            <div class="input-group input-group-sm" style="width: 260px;">
              <span class="input-group-text bg-white border-end-0 rounded-start-pill ps-3"><i class="bi bi-search text-muted"></i></span>
              <input type="text" id="reviewSearchInput" class="form-control border-start-0 rounded-end-pill pe-3" placeholder="Cari nama siswa / kelas..." />
            </div>
          </div>
        </div>

        ${pendingDocs.length === 0 ? `
          <div class="text-center py-5">
            <i class="bi bi-check2-circle text-success" style="font-size: 3rem;"></i>
            <h5 class="fw-bold mt-3">Semua Dokumen Telah Direview</h5>
            <p class="text-muted">Silahkan Periksa Kembali Di Halaman Review Pengajuan.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 border">
              <thead class="table-light">
                <tr>
                  <th class="text-center" width="5%">No</th>
                  <th width="20%">Siswa</th>
                  <th width="15%">Foto Profil</th>
                  <th width="20%">Akte Kelahiran</th>
                  <th width="20%">Kartu Keluarga</th>
                  <th class="text-center" width="20%">Aksi Cepat (Semua Dokumen)</th>
                </tr>
              </thead>
              <tbody id="reviewTableBody">
                ${pendingDocs.map((doc, i) => {
        // Helper tombol/badge dokumen
        const getCellHtml = (url, status, note, id, label, type) => {
            let out = '';
            if (url && status !== 'rejected') {
                out += `<button type="button" class="btn btn-sm btn-outline-info rounded-pill px-3 text-nowrap mb-1 w-100 btn-action" data-action="view-doc" data-url="${url}" data-label="${label}" data-name="${encodeURIComponent(doc.student_name)}" data-id="${id || ''}"><i class="bi bi-eye-fill me-1"></i> Lihat ${label}</button>`;
            }
            if (status === 'pending') {
                out += '<span class="badge bg-warning text-dark d-block py-1 mb-1"><i class="bi bi-clock-history me-1"></i> Menunggu Review</span>';
            }
            else if (status === 'approved') {
                out += '<span class="badge bg-success d-block py-1 mb-1"><i class="bi bi-check-circle-fill me-1"></i> Disetujui</span>';
            }
            else if (status === 'rejected') {
                out += '<span class="badge bg-danger d-block py-1 mb-1"><i class="bi bi-x-circle-fill me-1"></i> Ditolak</span>';
                if (note) {
                    out += `<div class="text-danger small mb-1" style="font-size:0.72rem;"><i class="bi bi-info-circle me-1"></i>Sebab: <em>${note}</em></div>`;
                }
                out += `<form action="/api/students/${doc.student_id}/upload-doc" method="post" enctype="multipart/form-data" class="mt-1">` +
                    `<input type="hidden" name="doc_type" value="${type}">` +
                    '<div class="input-group input-group-sm">' +
                    '<input type="file" name="document" class="form-control form-control-sm rounded-start-3" accept="image/*,.pdf" required>' +
                    '<button type="submit" class="btn btn-sm btn-warning fw-semibold text-dark"><i class="bi bi-arrow-repeat"></i> Upload Ulang</button>' +
                    '</div></form>';
            }
            else if (!url && !status) {
                out += '<span class="text-muted small"><i class="bi bi-dash"></i> Belum ada</span>';
            }
            return out;
        };
        let fotoHtml = '';
        if (doc.profile_photo_url) {
            fotoHtml += `<button type="button" class="btn btn-sm btn-outline-info rounded-pill px-3 text-nowrap mb-1 w-100 btn-action" data-action="view-doc" data-url="${doc.profile_photo_url}" data-label="Foto Profil" data-name="${encodeURIComponent(doc.student_name)}" data-id=""><i class="bi bi-eye-fill me-1"></i> Lihat Foto</button>`;
            fotoHtml += '<span class="badge bg-success d-block py-1"><i class="bi bi-check-circle-fill me-1"></i> Sudah Diupload</span>';
        }
        else if (doc.foto_status === 'rejected') {
            fotoHtml += '<span class="badge bg-danger d-block py-1 mb-1"><i class="bi bi-x-circle-fill me-1"></i> Ditolak</span>';
            if (doc.foto_rejection_note) {
                fotoHtml += `<div class="text-danger small mb-1" style="font-size:0.72rem;"><i class="bi bi-info-circle me-1"></i>Sebab: <em>${doc.foto_rejection_note}</em></div>`;
            }
            fotoHtml += `<form action="/api/students/${doc.student_id}/upload-photo" method="post" enctype="multipart/form-data" class="mt-1">` +
                '<div class="input-group input-group-sm">' +
                '<input type="file" name="photo" class="form-control form-control-sm rounded-start-3" accept="image/*" required>' +
                '<button type="submit" class="btn btn-sm btn-warning fw-semibold text-dark"><i class="bi bi-arrow-repeat"></i> Upload Ulang</button>' +
                '</div></form>';
        }
        else if (doc.foto_status === 'pending') {
            fotoHtml += '<span class="badge bg-warning text-dark d-block py-1"><i class="bi bi-clock-history me-1"></i> Menunggu Review</span>';
        }
        else {
            fotoHtml += '<span class="text-muted small"><i class="bi bi-dash"></i> Belum ada</span>';
        }
        const akteCellHtml = getCellHtml(doc.akte_url, doc.akte_status, doc.akte_rejection_note, doc.akte_id, 'Akte Kelahiran', 'akte_kelahiran');
        const kkCellHtml = getCellHtml(doc.kk_url, doc.kk_status, doc.kk_rejection_note, doc.kk_id, 'Kartu Keluarga', 'kartu_keluarga');
        return `
                <tr class="review-row" 
                    data-akte-status="${doc.akte_status || ''}" 
                    data-kk-status="${doc.kk_status || ''}" 
                    data-foto-status="${doc.foto_status || ''}" 
                    data-search="${(doc.student_name + ' ' + doc.class_name).toLowerCase()}">
                  <td class="text-center fw-semibold text-secondary">${i + 1}</td>
                  <td>
                    <div class="fw-bold text-dark">${doc.student_name}</div>
                    <div class="small text-muted">Kelas ${doc.class_name}</div>
                  </td>
                  <td>${fotoHtml}</td>
                  <td>${akteCellHtml}</td>
                  <td>${kkCellHtml}</td>
                  <td class="text-center">
                    ${isReviewer ? `
                      <div class="d-flex justify-content-center gap-2 flex-wrap">
                        <form id="approve-student-${doc.student_id}" action="/api/reviewer/documents/approve-student/${doc.student_id}" method="POST" class="d-inline">
                          <button type="button" class="btn btn-sm btn-success rounded-pill px-3 shadow-sm text-nowrap btn-action" data-action="approve-student" data-id="${doc.student_id}">
                            <i class="bi bi-check-lg"></i> Approve Semua
                          </button>
                        </form>
                        <button type="button" class="btn btn-sm btn-danger rounded-pill px-3 shadow-sm text-nowrap btn-action" data-action="reject-student" data-id="${doc.student_id}" data-name="${encodeURIComponent(doc.student_name)}">
                          <i class="bi bi-x-lg"></i> Tolak Semua
                        </button>
                        <form id="reject-form-${doc.student_id}" action="/api/reviewer/documents/reject-student/${doc.student_id}" method="POST" class="d-none">
                          <input type="hidden" name="rejection_note" id="reject-note-${doc.student_id}">
                        </form>
                      </div>
                    ` : `
                      <span class="badge bg-light text-secondary border px-3 py-1.5 rounded-pill small">
                        <i class="bi bi-shield-lock me-1"></i> Read-Only Mode
                      </span>
                    `}
                  </td>
                </tr>
                `;
    }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>

    <script id="initial-review-data" type="application/json">
      ${JSON.stringify(pendingDocs.map(d => ({
        student_id: d.student_id,
        student_name: d.student_name,
        class_name: d.class_name,
        profile_photo_url: d.profile_photo_url,
        akte_id: d.akte_id,
        akte_url: d.akte_url,
        akte_status: d.akte_status,
        akte_rejection_note: d.akte_rejection_note,
        kk_id: d.kk_id,
        kk_url: d.kk_url,
        kk_status: d.kk_status,
        kk_rejection_note: d.kk_rejection_note,
        foto_id: d.foto_id,
        foto_url: d.foto_url,
        foto_status: d.foto_status,
        foto_rejection_note: d.foto_rejection_note
    }))).replace(/</g, '\\u003c')}
    </script>

    <!-- Script Client-Side Filter & Search untuk Review Dokumen -->
    <script>
      let applyReviewFilters = null;
      let lastReviewDataStr = '';

      function renderReviewTable(pendingDocs) {
        const isReviewer = ${isReviewer};
        const tableBody = document.getElementById('reviewTableBody');
        const tableContainer = document.querySelector('.table-responsive');
        const cardBody = document.querySelector('.card-body');
        
        if (pendingDocs.length === 0) {
          if (tableContainer) tableContainer.remove();
          let noDocsEl = document.getElementById('no-docs-message');
          if (!noDocsEl) {
            noDocsEl = document.createElement('div');
            noDocsEl.id = 'no-docs-message';
            noDocsEl.className = 'text-center py-5';
            noDocsEl.innerHTML = '<i class="bi bi-check2-circle text-success" style="font-size: 3rem;"></i>' +
              '<h5 class="fw-bold mt-3">Semua Dokumen Sudah Direview</h5>' +
              '<p class="text-muted">Tidak ada dokumen yang menunggu review atau perlu perbaikan saat ini.</p>';
            if (cardBody) cardBody.appendChild(noDocsEl);
          }
          const massApproveForm = document.getElementById('massApproveForm');
          if (massApproveForm) massApproveForm.remove();
          return;
        }

        const noDocsEl = document.getElementById('no-docs-message');
        if (noDocsEl) noDocsEl.remove();

        if (!tableBody) {
          location.reload();
          return;
        }

        const getCellHtml = (url, status, note, id, label, type, studentId, studentName) => {
          let out = '';
          if (url && status !== 'rejected') {
            out += '<button type="button" class="btn btn-sm btn-outline-info rounded-pill px-3 text-nowrap mb-1 w-100 btn-action" data-action="view-doc" data-url="' + url + '" data-label="' + label + '" data-name="' + encodeURIComponent(studentName) + '" data-id="' + (id || '') + '"><i class="bi bi-eye-fill me-1"></i> Lihat ' + label + '</button>';
          }
          if (status === 'pending') {
            out += '<span class="badge bg-warning text-dark d-block py-1 mb-1"><i class="bi bi-clock-history me-1"></i> Menunggu Review</span>';
          } else if (status === 'approved') {
            out += '<span class="badge bg-success d-block py-1 mb-1"><i class="bi bi-check-circle-fill me-1"></i> Disetujui</span>';
          } else if (status === 'rejected') {
            out += '<span class="badge bg-danger d-block py-1 mb-1"><i class="bi bi-x-circle-fill me-1"></i> Ditolak</span>';
            if (note) {
              out += '<div class="text-danger small mb-1" style="font-size:0.72rem;"><i class="bi bi-info-circle me-1"></i>Sebab: <em>' + note + '</em></div>';
            }
            out += '<form action="/api/students/' + studentId + '/upload-doc" method="post" enctype="multipart/form-data" class="mt-1">' +
              '<input type="hidden" name="doc_type" value="' + type + '">' +
              '<div class="input-group input-group-sm">' +
              '<input type="file" name="document" class="form-control form-control-sm rounded-start-3" accept="image/*,.pdf" required>' +
              '<button type="submit" class="btn btn-sm btn-warning fw-semibold text-dark"><i class="bi bi-arrow-repeat"></i> Upload Ulang</button>' +
              '</div></form>';
          } else if (!url && !status) {
            out += '<span class="text-muted small"><i class="bi bi-dash"></i> Belum ada</span>';
          }
          return out;
        };

        let rowsHtml = pendingDocs.map((doc, i) => {
          let fotoHtml = '';
          if (doc.profile_photo_url) {
            fotoHtml += '<button type="button" class="btn btn-sm btn-outline-info rounded-pill px-3 text-nowrap mb-1 w-100 btn-action" data-action="view-doc" data-url="' + doc.profile_photo_url + '" data-label="Foto Profil" data-name="' + encodeURIComponent(doc.student_name) + '" data-id=""><i class="bi bi-eye-fill me-1"></i> Lihat Foto</button>';
            fotoHtml += '<span class="badge bg-success d-block py-1"><i class="bi bi-check-circle-fill me-1"></i> Sudah Diupload</span>';
          } else if (doc.foto_status === 'rejected') {
            fotoHtml += '<span class="badge bg-danger d-block py-1 mb-1"><i class="bi bi-x-circle-fill me-1"></i> Ditolak</span>';
            if (doc.foto_rejection_note) {
              fotoHtml += '<div class="text-danger small mb-1" style="font-size:0.72rem;"><i class="bi bi-info-circle me-1"></i>Sebab: <em>' + doc.foto_rejection_note + '</em></div>';
            }
            fotoHtml += '<form action="/api/students/' + doc.student_id + '/upload-photo" method="post" enctype="multipart/form-data" class="mt-1">' +
              '<div class="input-group input-group-sm">' +
              '<input type="file" name="photo" class="form-control form-control-sm rounded-start-3" accept="image/*" required>' +
              '<button type="submit" class="btn btn-sm btn-warning fw-semibold text-dark"><i class="bi bi-arrow-repeat"></i> Upload Ulang</button>' +
              '</div></form>';
          } else if (doc.foto_status === 'pending') {
            fotoHtml += '<span class="badge bg-warning text-dark d-block py-1"><i class="bi bi-clock-history me-1"></i> Menunggu Review</span>';
          } else {
            fotoHtml += '<span class="text-muted small"><i class="bi bi-dash"></i> Belum ada</span>';
          }

          const akteCellHtml = getCellHtml(doc.akte_url, doc.akte_status, doc.akte_rejection_note, doc.akte_id, 'Akte Kelahiran', 'akte_kelahiran', doc.student_id, doc.student_name);
          const kkCellHtml = getCellHtml(doc.kk_url, doc.kk_status, doc.kk_rejection_note, doc.kk_id, 'Kartu Keluarga', 'kartu_keluarga', doc.student_id, doc.student_name);

          let actionHtml = '';
          if (isReviewer) {
            actionHtml = '<div class="d-flex justify-content-center gap-2 flex-wrap">' +
              '<form id="approve-student-' + doc.student_id + '" action="/api/reviewer/documents/approve-student/' + doc.student_id + '" method="POST" class="d-inline">' +
              '<button type="button" class="btn btn-sm btn-success rounded-pill px-3 shadow-sm text-nowrap btn-action" data-action="approve-student" data-id="' + doc.student_id + '">' +
              '<i class="bi bi-check-lg"></i> Approve Semua' +
              '</button>' +
              '</form>' +
              '<button type="button" class="btn btn-sm btn-danger rounded-pill px-3 shadow-sm text-nowrap btn-action" data-action="reject-student" data-id="' + doc.student_id + '" data-name="' + encodeURIComponent(doc.student_name) + '">' +
              '<i class="bi bi-x-lg"></i> Tolak Semua' +
              '</button>' +
              '<form id="reject-form-' + doc.student_id + '" action="/api/reviewer/documents/reject-student/' + doc.student_id + '" method="POST" class="d-none">' +
              '<input type="hidden" name="rejection_note" id="reject-note-' + doc.student_id + '">' +
              '</form>' +
              '</div>';
          } else {
            actionHtml = '<span class="badge bg-light text-secondary border px-3 py-1.5 rounded-pill small">' +
              '<i class="bi bi-shield-lock me-1"></i> Read-Only Mode' +
              '</span>';
          }

          const searchVal = (doc.student_name + ' ' + doc.class_name).toLowerCase();
          return '<tr class="review-row" ' +
            'data-akte-status="' + (doc.akte_status || '') + '" ' +
            'data-kk-status="' + (doc.kk_status || '') + '" ' +
            'data-foto-status="' + (doc.foto_status || '') + '" ' +
            'data-search="' + searchVal + '">' +
            '<td class="text-center fw-semibold text-secondary">' + (i + 1) + '</td>' +
            '<td>' +
            '<div class="fw-bold text-dark">' + doc.student_name + '</div>' +
            '<div class="small text-muted">Kelas ' + doc.class_name + '</div>' +
            '</td>' +
            '<td>' + fotoHtml + '</td>' +
            '<td>' + akteCellHtml + '</td>' +
            '<td>' + kkCellHtml + '</td>' +
            '<td class="text-center">' + actionHtml + '</td>' +
            '</tr>';
        }).join('');

        tableBody.innerHTML = rowsHtml;
      }

      async function pollReviewList() {
        try {
          const res = await fetch('/api/document-reviews/list');
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              const currentDataStr = JSON.stringify(data.results);
              if (currentDataStr !== lastReviewDataStr) {
                lastReviewDataStr = currentDataStr;
                renderReviewTable(data.results);
                if (typeof applyReviewFilters === 'function') {
                  applyReviewFilters();
                }
              }
            }
          }
        } catch (e) {
          console.error('Error polling review list:', e);
        }
      }

      document.addEventListener('DOMContentLoaded', function() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const searchInput = document.getElementById('reviewSearchInput');

        applyReviewFilters = function() {
          const activeBtn = document.querySelector('.filter-btn.active');
          const filter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
          const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
          const tableRows = document.querySelectorAll('#reviewTableBody tr.review-row');

          tableRows.forEach(row => {
            const akteStatus = row.getAttribute('data-akte-status') || '';
            const kkStatus = row.getAttribute('data-kk-status') || '';
            const fotoStatus = row.getAttribute('data-foto-status') || '';
            const rowSearchText = row.getAttribute('data-search') || '';

            const matchesSearch = !searchVal || rowSearchText.includes(searchVal);
            
            let matchesFilter = true;
            if (filter === 'pending') {
              matchesFilter = (akteStatus === 'pending' || kkStatus === 'pending' || fotoStatus === 'pending');
            } else if (filter === 'akte_approved') {
              matchesFilter = (akteStatus === 'approved');
            } else if (filter === 'akte_rejected') {
              matchesFilter = (akteStatus === 'rejected');
            } else if (filter === 'kk_approved') {
              matchesFilter = (kkStatus === 'approved');
            } else if (filter === 'kk_rejected') {
              matchesFilter = (kkStatus === 'rejected');
            }

            if (matchesSearch && matchesFilter) {
              row.style.display = '';
            } else {
              row.style.display = 'none';
            }
          });
        };

        filterBtns.forEach(btn => {
          btn.addEventListener('click', function() {
            filterBtns.forEach(b => {
              b.classList.remove('btn-primary', 'active');
              b.classList.add('btn-outline-secondary');
            });
            this.classList.remove('btn-outline-secondary');
            this.classList.add('btn-primary', 'active');
            applyReviewFilters();
          });
        });

        if (searchInput) {
          searchInput.addEventListener('keyup', applyReviewFilters);
        }

        // Parse state awal yang aman
        const initialDataEl = document.getElementById('initial-review-data');
        if (initialDataEl) {
          try {
            lastReviewDataStr = JSON.stringify(JSON.parse(initialDataEl.textContent || '[]'));
          } catch(e) {
            console.error('Error parsing initial review data:', e);
            lastReviewDataStr = '';
          }
        }

        setInterval(pollReviewList, 5000);

        // ====================================================================
        // EVENT DELEGATION: Menghilangkan error quote string pada onclick inline
        // ====================================================================
        document.addEventListener('click', function(e) {
          const btn = e.target.closest('.btn-action');
          if (!btn) return;
          
          const action = btn.getAttribute('data-action');

          if (action === 'mass-approve') {
            e.preventDefault();
            window.showConfirmModal({
              title: 'Konfirmasi Mass Approve',
              message: 'Anda yakin ingin meng-approve semua dokumen pending dari semua siswa?',
              type: 'success',
              confirmText: 'Ya, Approve Semua'
            }).then(function(confirmed) {
              if (confirmed) document.getElementById('massApproveForm').submit();
            });
          } 
          else if (action === 'approve-student') {
            e.preventDefault();
            const studentId = btn.getAttribute('data-id');
            window.showConfirmModal({
              title: 'Konfirmasi Persetujuan',
              message: 'Approve semua dokumen siswa ini?',
              type: 'success',
              confirmText: 'Ya, Approve'
            }).then(function(confirmed) {
              if (confirmed) document.getElementById('approve-student-' + studentId).submit();
            });
          }
          else if (action === 'reject-student') {
            e.preventDefault();
            const studentId = btn.getAttribute('data-id');
            const studentName = decodeURIComponent(btn.getAttribute('data-name') || '');
            window.showPromptModal({
              title: 'Alasan Penolakan Dokumen',
              message: 'Masukkan alasan penolakan dokumen untuk siswa <b>' + studentName + '</b> (berlaku untuk semua dokumen pending siswa ini):',
              placeholder: 'Tuliskan alasan penolakan...',
              confirmText: 'Tolak Berkas',
              btnClass: 'btn-danger',
              required: true
            }).then(function(note) {
              if (note) {
                document.getElementById('reject-note-' + studentId).value = note;
                document.getElementById('reject-form-' + studentId).submit();
              }
            });
          }
          else if (action === 'approve-specific') {
            e.preventDefault();
            window.showConfirmModal({
              title: 'Konfirmasi Persetujuan',
              message: 'Approve dokumen spesifik ini?',
              type: 'success',
              confirmText: 'Ya, Approve'
            }).then(function(confirmed) {
              if (confirmed) document.getElementById('docApproveForm').submit();
            });
          }
          else if (action === 'reject-specific') {
            e.preventDefault();
            if (!currentDocId) return;
            window.showPromptModal({
              title: 'Alasan Penolakan Dokumen',
              message: 'Masukkan alasan penolakan untuk dokumen spesifik ini:',
              placeholder: 'Tuliskan alasan penolakan...',
              confirmText: 'Tolak Berkas',
              btnClass: 'btn-danger',
              required: true
            }).then(function(note) {
              if (note) {
                document.getElementById('docRejectionNote').value = note;
                document.getElementById('docRejectForm').submit();
              }
            });
          }
          else if (action === 'view-doc') {
            e.preventDefault();
            const url = btn.getAttribute('data-url');
            const label = btn.getAttribute('data-label');
            const name = decodeURIComponent(btn.getAttribute('data-name') || '');
            const docIdStr = btn.getAttribute('data-id');
            const docId = docIdStr ? parseInt(docIdStr, 10) : null;
            
            showDocModal(url, label, name, docId);
          }
        });
      });
    </script>

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
          <div class="modal-footer border-top-0 d-flex justify-content-between align-items-center bg-white">
            ${isReviewer ? `
            <div>
              <form id="docApproveForm" method="POST" action="" class="d-inline">
                <button type="button" class="btn btn-success rounded-pill px-4 fw-semibold btn-action" data-action="approve-specific">
                  <i class="bi bi-check-lg me-1"></i> Approve Dokumen Ini
                </button>
              </form>
              <button type="button" class="btn btn-danger rounded-pill px-4 fw-semibold ms-2 btn-action" data-action="reject-specific">
                <i class="bi bi-x-lg me-1"></i> Reject Dokumen Ini
              </button>
              <form id="docRejectForm" method="POST" action="" class="d-none">
                <input type="hidden" name="rejection_note" id="docRejectionNote">
              </form>
            </div>
            ` : '<div class="text-muted small italic"><i class="bi bi-info-circle me-1"></i> Anda hanya dapat melihat pratinjau dokumen ini.</div>'}
            <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Tutup</button>
          </div>
        </div>
      </div>
    </div>

    <script>
      let currentDocId = null;

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

      function showDocModal(url, docType, studentName, docId) {
        const triggerEl = document.activeElement;
        currentDocId = docId;
        document.getElementById('docPreviewTitle').textContent = docType;
        document.getElementById('docPreviewSubtitle').textContent = studentName;
        document.getElementById('docPreviewLoader').style.display = 'block';
        
        const approveForm = document.getElementById('docApproveForm');
        const rejectForm = document.getElementById('docRejectForm');
        if (approveForm) approveForm.action = '/api/reviewer/documents/' + docId + '/approve';
        if (rejectForm) rejectForm.action = '/api/reviewer/documents/' + docId + '/reject';
        
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
    return renderLayout('Review Dokumen', user, content, 'document_reviews');
}
