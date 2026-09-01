import { DEFAULT_AVATAR, formatIndonesianDate } from './helpers';

export function renderPrintCardsPage(
  students: any[],
  classesList: string[],
  selectedClass: string
): string {
  const pageTitle = selectedClass
    ? `Kartu Siswa 2 Sisi - Kelas ${selectedClass}`
    : 'Kartu Siswa 2 Sisi - Semua Kelas';

  // Chunk siswa per 4 pasang kartu per halaman A4 (4 baris x 2 sisi berdampingan)
  const PAIRS_PER_PAGE = 4;
  const pageChunks: string[] = [];

  for (let i = 0; i < students.length; i += PAIRS_PER_PAGE) {
    const chunk = students.slice(i, i + PAIRS_PER_PAGE);
    const pairsInPage = chunk.map(s => {
      const photoHtml = s.photo_url
        ? `<img src="${s.photo_url}" alt="Foto ${s.name}" class="student-photo" crossorigin="anonymous" onerror="this.onerror=null;this.style.display='none';this.parentNode.querySelector('.photo-placeholder').style.display='flex'">
           <div class="photo-placeholder" style="display:none">👤</div>`
        : `<div class="photo-placeholder">👤</div>`;

      const formattedDob = formatIndonesianDate(s.birth_date);
      const birthPlace = (s.birth_place || '').trim();
      let ttlText = '-';
      if (birthPlace && formattedDob !== '-') {
        ttlText = `${birthPlace}, ${formattedDob}`;
      } else if (birthPlace) {
        ttlText = birthPlace;
      } else if (formattedDob !== '-') {
        ttlText = formattedDob;
      }

      const fatherName = (s.father_name || '').trim() || '-';
      const motherName = (s.mother_name || '').trim() || '-';

      let genderVal = (s.gender || '').trim();
      if (/^l(aki)?/i.test(genderVal)) genderVal = 'Laki-Laki';
      else if (/^p(erempuan)?/i.test(genderVal)) genderVal = 'Perempuan';
      else genderVal = genderVal || '-';

      return `
      <div class="card-pair">
        <!-- TAMPAK DEPAN (DESAIN LAMA - SAMA PERSIS) -->
        <div class="student-card student-card-front">
          <div class="card-header-strip">
            <span class="school-logo">🎓</span>
            <div class="school-info">
              <div class="school-name">SD INPRES LELINGLUAN</div>
              <div class="school-subtitle">KARTU IDENTITAS SISWA</div>
            </div>
          </div>
          <div class="card-body-content">
            <div class="photo-section">${photoHtml}</div>
            <div class="info-section">
              <div class="student-name" title="${s.name || '-'}">${s.name || '-'}</div>
              <div class="student-class-badge">Kelas ${s.class_name || '-'}</div>
              <div class="info-rows">
                <div class="info-row"><span class="lbl">NIPD</span><span class="sep">:</span><span class="val">${s.nipd || '-'}</span></div>
                <div class="info-row"><span class="lbl">NISN</span><span class="sep">:</span><span class="val">${s.nisn || '-'}</span></div>
                <div class="info-row"><span class="lbl">NIK</span><span class="sep">:</span><span class="val">${s.nik || '-'}</span></div>
                <div class="info-row"><span class="lbl">JK</span><span class="sep">:</span><span class="val">${genderVal}</span></div>
              </div>
            </div>
          </div>
          <div class="card-footer-strip"><div class="strip-line"></div></div>
        </div>

        <!-- TAMPAK BELAKANG (DESAIN BARU - SISI BELAKANG BERDAMPINGAN) -->
        <div class="student-card student-card-back">
          <div class="card-header-strip">
            <span class="school-logo">🎓</span>
            <div class="school-info">
              <div class="school-name">SD INPRES LELINGLUAN</div>
              <div class="school-subtitle">KARTU IDENTITAS SISWA</div>
            </div>
          </div>
          <div class="card-body-content-back">
            <div class="back-details">
              <!-- A. TEMPAT, TANGGAL LAHIR & JK -->
              <div class="back-section">
                <div class="back-section-title">TEMPAT, TGL LAHIR / JK</div>
                <div class="back-section-val" title="${ttlText} (${genderVal})">${ttlText} (${genderVal})</div>
              </div>

              <div class="back-divider"></div>

              <!-- B. DATA ORANG TUA -->
              <div class="back-section">
                <div class="back-section-title">DATA ORANG TUA</div>
                <div class="parent-rows">
                  <div class="parent-row"><span class="plbl">Nama Ayah</span><span class="psep">:</span><span class="pval" title="${fatherName}">${fatherName}</span></div>
                  <div class="parent-row"><span class="plbl">Nama Ibu</span><span class="psep">:</span><span class="pval" title="${motherName}">${motherName}</span></div>
                </div>
              </div>
            </div>

            <!-- C. QR CODE -->
            <div class="qr-section">
              <div class="qr-code-box" data-student-id="${s.id}" data-qrurl="https://portalsiswa.sdinpreslelingluan.com">
                <div class="qr-placeholder">QR</div>
              </div>
              <div class="qr-url-text">Portal Siswa</div>
            </div>
          </div>
          <div class="card-footer-strip"><div class="strip-line"></div></div>
        </div>
      </div>`;
    }).join('\n');

    pageChunks.push(`<div class="pdf-page">${pairsInPage}</div>`);
  }

  const pagesHtml = pageChunks.join('\n');

  const classOptions = classesList.map(cls =>
    `<option value="${cls}" ${selectedClass === cls ? 'selected' : ''}>${cls}</option>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <!-- html2pdf.js CDN untuk Generate PDF Presisi -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <!-- QRCode.js Library untuk QR Code Presisi -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#f1f5f9;color:#1e293b;min-height:100vh}

    /* â”€â”€ CONTROL BAR â”€â”€ */
    .ctrl-bar{
      background:linear-gradient(135deg,#1e293b 0%,#312e81 100%);
      color:#fff;padding:0.85rem 1.25rem;
      display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;
      position:sticky;top:0;z-index:100;
      box-shadow:0 4px 20px rgba(0,0,0,0.25);
    }
    .ctrl-bar h1{font-size:0.95rem;font-weight:800;flex:1;min-width:240px}
    .ctrl-bar h1 span{color:#fbbf24}
    .ctrl-grp{display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap}
    .ctrl-lbl{font-size:0.75rem;color:#94a3b8;font-weight:600;white-space:nowrap}
    .ctrl-sel{
      background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);
      color:#fff;border-radius:8px;padding:0.35rem 0.65rem;
      font-size:0.82rem;font-family:inherit;cursor:pointer;outline:none
    }
    .ctrl-sel option{background:#1e293b;color:#fff}
    .btn-c{
      display:inline-flex;align-items:center;gap:0.35rem;
      padding:0.4rem 0.85rem;border-radius:8px;font-size:0.8rem;font-weight:700;
      font-family:inherit;cursor:pointer;border:none;text-decoration:none;
      transition:all 0.2s;white-space:nowrap
    }
    .btn-pdf{background:linear-gradient(135deg,#10b981,#059669);color:#fff;box-shadow:0 4px 12px rgba(16,185,129,0.3)}
    .btn-pdf:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(16,185,129,0.4)}
    .btn-print{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 4px 12px rgba(79,70,229,0.3)}
    .btn-print:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(79,70,229,0.4)}
    .btn-back{background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2)}
    .btn-back:hover{background:rgba(255,255,255,0.2)}
    .badge-count{background:rgba(251,191,36,0.18);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);border-radius:20px;padding:0.25rem 0.7rem;font-size:0.78rem;font-weight:700}

    /* â”€â”€ CONTAINER PRINT AREA â”€â”€ */
    .print-area{padding:1.5rem;max-width:1150px;margin:0 auto}

    /* â”€â”€ HALAMAN PDF (4 PASANG KARTU 2-SISI PER HALAMAN A4 PORTRAIT) â”€â”€ */
    .pdf-page {
      display: flex;
      flex-direction: column;
      gap: 5mm;
      justify-content: flex-start;
      align-items: center;
      margin: 0 auto 12mm auto;
      padding: 6mm 4mm;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      page-break-after: always !important;
      break-after: page !important;
      break-after: always !important;
    }
    .pdf-page:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
      margin-bottom: 0;
    }

    /* â”€â”€ CARD PAIR (BERDAMPINGAN: TAMPAK DEPAN | TAMPAK BELAKANG) â”€â”€ */
    .card-pair {
      display: flex;
      flex-direction: row;
      gap: 6mm;
      align-items: center;
      justify-content: center;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* â”€â”€ UKURAN PRESISI KARTU SISWA (CR80: 85.6mm x 54mm) â”€â”€ */
    .student-card{
      width:85.6mm !important;
      height:54mm !important;
      min-width:85.6mm !important;
      min-height:54mm !important;
      max-width:85.6mm !important;
      max-height:54mm !important;
      background:#ffffff;
      border-radius:3.5mm;
      overflow:hidden;
      box-shadow:0 4px 14px rgba(0,0,0,0.08);
      border:1px solid #cbd5e1;
      display:flex;
      flex-direction:column;
      position:relative;
      box-sizing:border-box !important;
      page-break-inside:avoid !important;
      break-inside:avoid !important;
    }

    /* Header Kartu */
    .card-header-strip{
      height:12mm;
      background:linear-gradient(135deg,#1e3a8a 0%,#312e81 60%,#4c1d95 100%);
      padding:1.2mm 2.5mm;
      display:flex;
      align-items:center;
      gap:2mm;
      -webkit-print-color-adjust:exact;
      print-color-adjust:exact;
    }
    .school-logo{font-size:4.5mm;line-height:1;flex-shrink:0}
    .school-info{flex:1;min-width:0}
    .school-name{color:#ffffff;font-size:2.7mm;font-weight:800;letter-spacing:0.03em;line-height:1.1;white-space:nowrap}
    .school-subtitle{color:#93c5fd;font-size:1.7mm;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-top:0.3mm;white-space:nowrap}

    /* Isi Badan Kartu Depan */
    .card-body-content{
      height:38mm;
      padding:2mm 2.5mm;
      display:flex;
      gap:2.5mm;
      align-items:center;
    }

    .photo-section{flex-shrink:0}
    .student-photo{
      width:22mm;
      height:28mm;
      object-fit:cover;
      border-radius:1.5mm;
      border:0.8mm solid #cbd5e1;
      box-shadow:0 2px 6px rgba(0,0,0,0.1);
      display:block;
    }
    .photo-placeholder{
      width:22mm;
      height:28mm;
      background:linear-gradient(135deg,#dbeafe,#ede9fe);
      border-radius:1.5mm;
      border:0.8mm solid #cbd5e1;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:6mm;
      color:#93c5fd;
    }

    .info-section{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center}
    .student-name{
      font-size:3.1mm;
      font-weight:800;
      color:#0f172a;
      line-height:1.15;
      margin-bottom:1mm;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }
    .student-class-badge{
      display:inline-block;
      background:#e0e7ff;
      color:#3730a3;
      font-size:2.1mm;
      font-weight:700;
      padding:0.4mm 1.8mm;
      border-radius:2mm;
      margin-bottom:1.2mm;
      width:fit-content;
      -webkit-print-color-adjust:exact;
      print-color-adjust:exact;
    }
    .info-rows{display:flex;flex-direction:column;gap:0.7mm}
    .info-row{display:flex;align-items:center;gap:1mm;font-size:2.1mm}
    .lbl{color:#64748b;font-weight:700;width:9mm;flex-shrink:0;font-size:2.0mm}
    .sep{color:#94a3b8;flex-shrink:0}
    .val{color:#0f172a;font-weight:700;font-size:2.1mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

    /* Isi Badan Kartu Belakang */
    .card-body-content-back{
      height:38mm;
      padding:2mm 2.5mm;
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:2mm;
    }
    .back-details{
      flex:1;
      min-width:0;
      display:flex;
      flex-direction:column;
      justify-content:center;
      gap:1.2mm;
    }
    .back-section{display:flex;flex-direction:column}
    .back-section-title{
      font-size:1.9mm;
      font-weight:800;
      color:#1e3a8a;
      letter-spacing:0.03em;
      margin-bottom:0.4mm;
      display:flex;
      align-items:center;
      gap:0.8mm;
    }
    .bicon{font-size:2.2mm;line-height:1}
    .back-section-val{
      font-size:2.1mm;
      font-weight:700;
      color:#0f172a;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
      padding-left:0.5mm;
    }
    .back-divider{
      height:0.4mm;
      background:#e2e8f0;
      margin:0.6mm 0;
      border-radius:1mm;
    }
    .parent-rows{display:flex;flex-direction:column;gap:0.5mm;padding-left:0.5mm}
    .parent-row{display:flex;align-items:center;gap:1mm;font-size:2.0mm}
    .plbl{color:#64748b;font-weight:700;width:14mm;flex-shrink:0;font-size:1.9mm}
    .psep{color:#94a3b8;flex-shrink:0}
    .pval{color:#0f172a;font-weight:700;font-size:2.0mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

    /* QR Section */
    .qr-section{
      width:22mm;
      flex-shrink:0;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
    }
    .qr-code-box{
      width:19mm;
      height:19mm;
      background:#ffffff;
      border:0.5mm solid #cbd5e1;
      border-radius:1mm;
      padding:0.6mm;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 1px 3px rgba(0,0,0,0.05);
    }
    .qr-code-box img, .qr-code-box canvas{
      width:100% !important;
      height:100% !important;
      display:block;
    }
    .qr-url-text{
      font-size:1.35mm;
      font-weight:700;
      color:#475569;
      margin-top:0.8mm;
      line-height:1.1;
      word-break:break-all;
      text-align:center;
    }

    /* Footer Kartu */
    .card-footer-strip{height:4mm;padding:0 2.5mm 1mm}
    .strip-line{
      height:1.2mm;
      background:linear-gradient(90deg,#1e3a8a,#4f46e5,#7c3aed,#4f46e5,#1e3a8a);
      border-radius:1mm;
      -webkit-print-color-adjust:exact;
      print-color-adjust:exact;
    }

    /* â”€â”€ EMPTY STATE â”€â”€ */
    .empty-state{text-align:center;padding:4rem 2rem;color:#64748b}
    .empty-state .ei{font-size:4rem;display:block;margin-bottom:1rem}
    .empty-state h3{font-size:1.1rem;font-weight:700;margin-bottom:0.5rem}

    /* â”€â”€ CSS PRINT BROWSER â”€â”€ */
    @media print {
      @page {
        size: A4 portrait;
        margin: 8mm 6mm;
      }
      html, body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .ctrl-bar { display: none !important; }
      .print-area {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
      }
      .pdf-page {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 0 8mm 0 !important;
        gap: 5mm !important;
      }
      .student-card {
        box-shadow: none !important;
        border: 1px solid #94a3b8 !important;
      }
    }
  </style>
</head>
<body>
  <div class="ctrl-bar">
    <h1>Cetak <span>Kartu Siswa 2 Sisi (Berdampingan)</span></h1>
    <div class="ctrl-grp">
      <span class="ctrl-lbl">Filter Kelas:</span>
      <form method="GET" action="/admin/print-cards" style="display:flex;gap:0.4rem;align-items:center">
        <select name="class_name" class="ctrl-sel" onchange="this.form.submit()">
          <option value="">Semua Kelas</option>
          ${classOptions}
        </select>
      </form>
    </div>
    <span class="badge-count">${students.length} Siswa (2 Sisi)</span>
    <div class="ctrl-grp">
      <button onclick="generatePDF()" class="btn-c btn-pdf" id="btnPdf">
        Download File PDF
      </button>
      <button onclick="window.print()" class="btn-c btn-print">
        Cetak Browser
      </button>
      <a href="/students" class="btn-c btn-back">Kembali</a>
    </div>
  </div>

  <div class="print-area">
    ${students.length === 0
      ? '<div class="empty-state"><span class="ei">🎓</span><h3>Tidak ada siswa</h3><p>Pilih kelas lain atau pastikan data siswa sudah tersedia.</p></div>'
      : '<div id="cardsContainer">' + pagesHtml + '</div>'
    }
  </div>

  <script>
    function renderQRCodes() {
      document.querySelectorAll('.qr-code-box').forEach(function(box) {
        const url = box.getAttribute('data-qrurl') || 'https://portalsiswa.sdinpreslelingluan.com';
        box.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
          try {
            new QRCode(box, {
              text: url,
              width: 100,
              height: 100,
              colorDark: "#0f172a",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H
            });
          } catch(e) {
            console.error('QRCode render error:', e);
          }
        }
      });
    }

    document.addEventListener('DOMContentLoaded', renderQRCodes);
    window.addEventListener('load', renderQRCodes);

    function generatePDF() {
      renderQRCodes();
      const element = document.getElementById('cardsContainer');
      if (!element) return;

      const btn = document.getElementById('btnPdf');
      const originalText = btn.innerHTML;
      btn.innerText = 'â³ Memproses PDF...';
      btn.disabled = true;

      const opt = {
        margin:       [8, 6, 8, 6],
        filename:     'Kartu_Siswa_2Sisi_SD_INPRES_LELINGLUAN.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, scrollX: 0, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'], after: '.pdf-page' }
      };

      html2pdf().set(opt).from(element).save().then(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }).catch(err => {
        console.error('PDF generation error:', err);
        alert('Gagal membuat PDF: ' + err.message);
        btn.innerHTML = originalText;
        btn.disabled = false;
      });
    }
  </script>
</body>
</html>`;
}

// ----------------------------------------------------
// Siswa Prioritas / Keperluan Mendesak Page Template
// ----------------------------------------------------


