import { formatIndonesianDate } from './helpers';

export function renderSKMutasiPrintPage(mutation: any): string {
  const m = mutation;
  const studentName = m.student_name || '-';
  const nipd = m.nipd || '-';
  const nisn = m.nisn || '-';
  const nik = m.nik || '-';
  const gender = m.gender || '-';
  const religion = m.religion || '-';
  const className = m.class_name || '-';
  const motherName = m.mother_name || '-';
  const entryDate = m.entry_date || '-';
  
  let birthPlaceDate = '-';
  if (m.birth_place || m.birth_date) {
    const formattedDob = formatIndonesianDate(m.birth_date);
    birthPlaceDate = (m.birth_place ? m.birth_place + ', ' : '') + formattedDob;
  }

  const destinationSchool = m.destination_school || '-';
  const reason = m.reason || '-';
  const requestDate = formatIndonesianDate(m.created_at || m.mutation_date);
  const effectiveDate = formatIndonesianDate(m.mutation_date);
  const letterDate = formatIndonesianDate(m.reviewed_at || m.mutation_date || new Date().toISOString());

  const letterNum = String(m.id || 1).padStart(3, '0');
  const monthNum = new Date(m.mutation_date || Date.now()).getMonth() + 1;
  const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const romanMonth = ROMAN_MONTHS[monthNum - 1] || 'VIII';
  const yearNum = new Date(m.mutation_date || Date.now()).getFullYear();

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SK Mutasi - ${studentName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Times+New+Roman:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 20mm 20mm 20mm 20mm;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      background: #f8fafc;
      padding: 20px;
    }
    .paper {
      background: #fff;
      width: 210mm;
      min-height: 297mm;
      padding: 20mm 20mm 20mm 20mm;
      margin: 0 auto;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      position: relative;
    }
    /* Kop Surat */
    .kop-header {
      text-align: center;
      border-bottom: 3px double #000;
      padding-bottom: 8px;
      margin-bottom: 20px;
    }
    .kop-header h4 { font-size: 13pt; font-weight: bold; text-transform: uppercase; }
    .kop-header h3 { font-size: 14pt; font-weight: bold; text-transform: uppercase; }
    .kop-header h2 { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 2px 0; }
    .kop-header p { font-size: 10pt; font-style: italic; }

    /* Judul Surat */
    .doc-title-box {
      text-align: center;
      margin-bottom: 25px;
    }
    .doc-title {
      font-size: 14pt;
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .doc-number {
      font-size: 11pt;
      margin-top: 3px;
    }

    /* Isi Surat */
    .content-p {
      text-align: justify;
      margin-bottom: 12px;
      text-indent: 30px;
    }
    .detail-table {
      width: 100%;
      margin: 12px 0 16px 20px;
      border-collapse: collapse;
    }
    .detail-table td {
      padding: 3px 4px;
      vertical-align: top;
      font-size: 11pt;
    }
    .detail-table td.lbl { width: 180px; }
    .detail-table td.colon { width: 15px; }

    /* Tanda Tangan */
    .ttd-wrapper {
      margin-top: 40px;
      width: 100%;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .ttd-box {
      width: 45%;
      text-align: center;
    }
    .ttd-space {
      height: 70px;
    }
    .ttd-name {
      font-weight: bold;
      text-decoration: underline;
    }

    /* Print Control Bar */
    .print-bar {
      position: fixed;
      top: 0; left: 0; right: 0;
      background: #1e293b;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999;
    }
    .btn-print-act {
      background: #10b981;
      color: #fff;
      border: none;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: bold;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-docx-act {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: bold;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .paper { box-shadow: none; padding: 0; margin: 0; width: 100%; }
      .print-bar { display: none !important; }
    }
  </style>
</head>
<body>

  <div class="print-bar">
    <div style="font-weight: bold;">Cetak SK Mutasi Siswa &mdash; ${studentName}</div>
    <div style="display: flex; gap: 10px;">
      <a href="/api/mutations/${m.id}/download-sk" class="btn-docx-act" target="_blank">
        📄 Download SK (.docx)
      </a>
      <button onclick="window.print()" class="btn-print-act">
        🖨️ Cetak / Simpan PDF
      </button>
    </div>
  </div>

  <div style="height: 50px;" class="no-print"></div>

  <div class="paper">
    <!-- KOP SURAT -->
    <div class="kop-header">
      <h4>PEMERINTAH KABUPATEN KEPULAUAN TANIMBAR</h4>
      <h3>DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
      <h2>SD INPRES LELINGLUAN</h2>
      <p>Jln. Wearnusmurin Desa Lelingluan Kec. Tanimbar Utara Kab. KKT Maluku - Kode Pos 97463</p>
      <p>Email: mail@sdinpreslelingluan.com | Website: sdinpreslelingluan.com</p>
    </div>

    <!-- JUDUL SURAT -->
    <div class="doc-title-box">
      <div class="doc-title">SURAT KETERANGAN PINDAH SEKOLAH</div>
      <div class="doc-number">Nomor: 4.21.2/ ${letterNum} /SD.I.L/ ${romanMonth} / ${yearNum}</div>
    </div>

    <!-- ISI SURAT -->
    <p class="content-p">
      Yang bertanda tangan di bawah ini, Kepala Sekolah Dasar (SD) Inpres Lelingluan menerangkan dengan sebenarnya bahwa:
    </p>

    <table class="detail-table">
      <tr><td class="lbl">Nama Lengkap Siswa</td><td class="colon">:</td><td><strong>${studentName}</strong></td></tr>
      <tr><td class="lbl">NIPD / NISN</td><td class="colon">:</td><td>${nipd} / ${nisn}</td></tr>
      <tr><td class="lbl">NIK</td><td class="colon">:</td><td>${nik}</td></tr>
      <tr><td class="lbl">Tempat, Tanggal Lahir</td><td class="colon">:</td><td>${birthPlaceDate}</td></tr>
      <tr><td class="lbl">Jenis Kelamin</td><td class="colon">:</td><td>${gender}</td></tr>
      <tr><td class="lbl">Agama</td><td class="colon">:</td><td>${religion}</td></tr>
      <tr><td class="lbl">Nama Ibu Kandung</td><td class="colon">:</td><td>${motherName}</td></tr>
      <tr><td class="lbl">Kelas saat ini</td><td class="colon">:</td><td>Kelas ${className}</td></tr>
      <tr><td class="lbl">Masuk di Sekolah ini</td><td class="colon">:</td><td>${entryDate}</td></tr>
    </table>

    <p class="content-p">
      Berdasarkan permohonan dari orang tua/wali murid tertanggal <strong>${requestDate}</strong>, maka terhitung sejak tanggal <strong>${effectiveDate}</strong> siswa tersebut di atas dinyatakan <strong>PINDAH SEKOLAH</strong> atas permintaan sendiri, untuk melanjutkan pendidikan ke:
    </p>

    <table class="detail-table">
      <tr><td class="lbl">Sekolah Tujuan</td><td class="colon">:</td><td><strong>${destinationSchool}</strong></td></tr>
      <tr><td class="lbl">Alasan Pindah</td><td class="colon">:</td><td>${reason}</td></tr>
    </table>

    <p class="content-p">
      Selama menjadi siswa di SD Inpres Lelingluan, yang bersangkutan berkelakuan <strong>BAIK</strong>. Demikian surat keterangan pindah sekolah ini dibuat agar dapat dipergunakan sebagaimana mestinya oleh pihak-pihak yang berkepentingan.
    </p>

    <!-- TANDA TANGAN -->
    <div class="ttd-wrapper">
      <div class="ttd-box">
        <p>Mengetahui,<br>Orang Tua / Wali Murid</p>
        <div class="ttd-space"></div>
        <p class="ttd-name">( ________________________ )</p>
      </div>

      <div class="ttd-box">
        <p>Lelingluan, ${letterDate}<br>Kepala Sekolah,</p>
        <div class="ttd-space"></div>
        <p class="ttd-name">SOFERET SEFATJA DOMAKUBUN, S.Pd</p>
        <p>NIP. 19680606 199111 1 001</p>
      </div>
    </div>
  </div>

</body>
</html>`;
}
