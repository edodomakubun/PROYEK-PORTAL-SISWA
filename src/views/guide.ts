import { User } from '../types';
import { renderLayout } from './layout';

export function renderGuidePage(user: User): string {
  const content = `
    <!-- Header Banner Panduan -->
    <div class="card border-0 shadow-sm rounded-4 mb-4" style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);">
      <div class="card-body p-4 text-white">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <span class="badge bg-white text-primary px-3 py-1.5 rounded-pill fw-bold mb-2 shadow-sm">
              <i class="bi bi-bookmark-star-fill me-1"></i> Dokumentasi Resmi Guru
            </span>
            <h3 class="fw-bold mb-1 text-white">Pusat Panduan &amp; Tata Cara Penggunaan Portal</h3>
            <p class="mb-0 opacity-90 small">Panduan lengkap langkah demi langkah untuk mengoptimalkan seluruh fitur portal bagi Guru dan Wali Kelas.</p>
          </div>
          <div class="p-3 bg-white bg-opacity-10 rounded-4 border border-white border-opacity-10 d-none d-sm-block">
            <i class="bi bi-journal-check" style="font-size: 3.5rem; opacity: 0.9;"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation Tabs & Guide Content -->
    <div class="row">
      <!-- Left Column: Navigation Tabs Control -->
      <div class="col-md-3 mb-4">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
          <div class="fw-bold text-dark mb-3 px-2 border-bottom pb-2">
            <i class="bi bi-list-stars text-primary me-2"></i> Daftar Materi
          </div>
          <div class="nav flex-column nav-pills gap-2" id="guideTabs" role="tablist">
            <button class="nav-link active text-start py-2.5 px-3 rounded-3 d-flex align-items-center gap-2 fw-semibold" id="tab-intro-btn" data-bs-toggle="pill" data-bs-target="#tab-intro" type="button" role="tab">
              <i class="bi bi-speedometer2"></i> 1. Dashboard &amp; Profil
            </button>
            <button class="nav-link text-start py-2.5 px-3 rounded-3 d-flex align-items-center gap-2 fw-semibold" id="tab-siswa-btn" data-bs-toggle="pill" data-bs-target="#tab-siswa" type="button" role="tab">
              <i class="bi bi-people-fill"></i> 2. Data Siswa &amp; NIK
            </button>
            <button class="nav-link text-start py-2.5 px-3 rounded-3 d-flex align-items-center gap-2 fw-semibold" id="tab-upload-btn" data-bs-toggle="pill" data-bs-target="#tab-upload" type="button" role="tab">
              <i class="bi bi-file-earmark-arrow-up-fill"></i> 3. Upload &amp; Auto-Approve
            </button>
            <button class="nav-link text-start py-2.5 px-3 rounded-3 d-flex align-items-center gap-2 fw-semibold" id="tab-review-btn" data-bs-toggle="pill" data-bs-target="#tab-review" type="button" role="tab">
              <i class="bi bi-shield-check"></i> 4. Review &amp; Riwayat
            </button>
            <button class="nav-link text-start py-2.5 px-3 rounded-3 d-flex align-items-center gap-2 fw-semibold" id="tab-fitur-btn" data-bs-toggle="pill" data-bs-target="#tab-fitur" type="button" role="tab">
              <i class="bi bi-cpu-fill"></i> 5. Fitur Tambahan Portal
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Materi Detail Cards -->
      <div class="col-md-9 mb-4">
        <div class="tab-content" id="guideTabsContent">
          
          <!-- TAB 1: DASHBOARD & PROFIL -->
          <div class="tab-pane fade show active" id="tab-intro" role="tabpanel">
            <div class="card border-0 shadow-sm rounded-4 p-4">
              <h5 class="fw-bold text-dark border-bottom pb-3 mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-speedometer2 text-primary fs-4"></i> Memulai: Dashboard &amp; Profil Guru
              </h5>
              
              <p class="text-secondary leading-relaxed">
                Halaman utama (Dashboard) dirancang untuk memberikan informasi ringkas mengenai status data siswa di kelas yang Anda ampu secara real-time.
              </p>

              <div class="row g-3 my-2">
                <div class="col-md-6">
                  <div class="p-3 border rounded-4 bg-light">
                    <h6 class="fw-bold text-dark mb-2"><i class="bi bi-bar-chart-fill text-primary me-2"></i>Statistik Ringkas</h6>
                    <ul class="small text-secondary mb-0 ps-3">
                      <li class="mb-1.5"><strong>Total Siswa Terdata</strong>: Jumlah total peserta didik aktif di sekolah/kelas Anda.</li>
                      <li class="mb-1.5"><strong>Status Ayah &amp; Ibu Kandung</strong>: Menghitung persentase orang tua siswa yang masih hidup atau telah meninggal dunia (Alm.) untuk keperluan administrasi sosial.</li>
                    </ul>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="p-3 border rounded-4 bg-light">
                    <h6 class="fw-bold text-dark mb-2"><i class="bi bi-person-badge-fill text-success me-2"></i>Identitas &amp; Wali Kelas</h6>
                    <p class="small text-secondary mb-0">
                      Di sidebar atas dan dashboard, Anda dapat melihat kelas wali yang Anda ampu (misal: <em>Kelas 10-A</em>). Informasi ini disematkan langsung di bawah foto profil Anda untuk memverifikasi hak akses filter Anda.
                    </p>
                  </div>
                </div>
              </div>

              <div class="alert alert-info bg-info bg-opacity-10 border border-info border-opacity-25 rounded-4 mt-3 mb-0">
                <div class="d-flex gap-3 align-items-start">
                  <i class="bi bi-info-circle-fill fs-4 text-info mt-0.5"></i>
                  <div>
                    <h6 class="fw-bold mb-1 text-info">Catatan Akses Khusus Guru</h6>
                    <p class="mb-0 small text-secondary">
                      Guru yang ditugaskan sebagai Wali Kelas secara otomatis hanya akan dapat melihat, mengunggah, mencetak, dan mereview data siswa yang berada di dalam <strong>kelas wali (homeroom_class)</strong> yang dipetakan oleh Admin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: DATA SISWA & NIK -->
          <div class="tab-pane fade" id="tab-siswa" role="tabpanel">
            <div class="card border-0 shadow-sm rounded-4 p-4">
              <h5 class="fw-bold text-dark border-bottom pb-3 mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-people-fill text-primary fs-4"></i> Pengelolaan Data Siswa &amp; Validasi NIK
              </h5>

              <p class="text-secondary">
                Menu <strong>Data Siswa</strong> adalah menu pusat informasi seluruh murid. Guru dapat menyaring data per kelas dan melakukan pencarian cepat.
              </p>

              <!-- Sub-section: Badges Dokumen -->
              <h6 class="fw-bold text-dark mt-4 mb-2"><i class="bi bi-tags-fill text-primary me-2"></i>1. Indikator Badge Status Dokumen (AK &amp; KK)</h6>
              <p class="small text-secondary">
                Setiap baris siswa menampilkan badge inisial <strong>AK</strong> (Akte Kelahiran) dan <strong>KK</strong> (Kartu Keluarga) dengan warna yang menunjukkan status review dokumen tersebut:
              </p>
              <div class="row g-2 mb-3">
                <div class="col-6 col-sm-3">
                  <div class="p-2 border rounded-3 text-center bg-success bg-opacity-10 border-success border-opacity-25">
                    <span class="badge bg-success rounded-pill mb-1">AK</span>
                    <div class="small fw-bold text-success">Disetujui</div>
                  </div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="p-2 border rounded-3 text-center bg-warning bg-opacity-10 border-warning border-opacity-25">
                    <span class="badge bg-warning text-dark rounded-pill mb-1">AK</span>
                    <div class="small fw-bold text-warning">Menunggu Review</div>
                  </div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="p-2 border rounded-3 text-center bg-danger bg-opacity-10 border-danger border-opacity-25">
                    <span class="badge bg-danger rounded-pill mb-1">AK</span>
                    <div class="small fw-bold text-danger">Ditolak</div>
                  </div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="p-2 border rounded-3 text-center bg-secondary bg-opacity-10 border-secondary border-opacity-25">
                    <span class="badge bg-secondary rounded-pill mb-1">AK</span>
                    <div class="small fw-bold text-secondary">Belum Diupload</div>
                  </div>
                </div>
              </div>

              <!-- Sub-section: Validasi NIK -->
              <h6 class="fw-bold text-dark mt-4 mb-2"><i class="bi bi-shield-check text-primary me-2"></i>2. Fitur Validasi NIK Instan</h6>
              <p class="small text-secondary">
                Pada halaman **Detail Siswa** (klik tombol **Detail** pada baris siswa), terdapat tombol **Validasi NIK Instan** di sebelah kolom input NIK. Fitur ini berguna untuk memvalidasi nomor NIK secara otomatis berdasarkan database Dukcapil terintegrasi:
              </p>
              <ul class="small text-secondary ps-3 mb-0">
                <li class="mb-1.5">Mengecek panjang digit NIK (wajib 16 digit).</li>
                <li class="mb-1.5">Mengecek kode provinsi, kabupaten/kota, kecamatan, tanggal lahir, dan jenis kelamin yang terenkripsi di dalam deretan NIK.</li>
                <li class="mb-1.5">Jika format NIK valid, sistem akan menampilkan rincian wilayah asal dan tanggal lahir sesuai kode NIK tersebut untuk dicocokkan dengan dokumen fisik siswa.</li>
              </ul>
            </div>
          </div>

          <!-- TAB 3: UPLOAD & AUTO-APPROVE -->
          <div class="tab-pane fade" id="tab-upload" role="tabpanel">
            <div class="card border-0 shadow-sm rounded-4 p-4">
              <h5 class="fw-bold text-dark border-bottom pb-3 mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-file-earmark-arrow-up-fill text-primary fs-4"></i> Pengunggahan Berkas &amp; Fitur Persetujuan Otomatis
              </h5>

              <p class="text-secondary">
                Guru dapat mengunggah berkas siswa (Foto Profil, Akte Kelahiran, dan Kartu Keluarga) secara langsung dari halaman Detail Siswa.
              </p>

              <div class="alert alert-success bg-success bg-opacity-10 border border-success border-opacity-25 rounded-4 mb-4">
                <div class="d-flex gap-3 align-items-start">
                  <i class="bi bi-lightning-charge-fill fs-3 text-success mt-0.5"></i>
                  <div>
                    <h6 class="fw-bold mb-1 text-success">Persetujuan Otomatis (Auto-Approve) oleh Guru</h6>
                    <p class="mb-0 small text-secondary">
                      Apabila **Guru** atau **Admin** yang mengunggah foto profil siswa, berkas tersebut akan **langsung disetujui secara otomatis (Status: Approved)** dan langsung aktif sebagai foto profil utama siswa. Berkas ini tidak perlu masuk antrean review admin lagi.
                    </p>
                  </div>
                </div>
              </div>

              <div class="alert alert-warning bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-4 mb-0">
                <div class="d-flex gap-3 align-items-start">
                  <i class="bi bi-clock-history fs-3 text-warning mt-0.5"></i>
                  <div>
                    <h6 class="fw-bold mb-1 text-warning">Logika Pengunggahan Mandiri oleh Siswa</h6>
                    <p class="mb-0 small text-secondary">
                      Jika pengunggahan dilakukan secara mandiri oleh **Siswa** melalui akun mereka, status dokumen tersebut akan diset sebagai **Pending (Menunggu Review)**. Berkas tidak akan langsung aktif sampai disetujui secara resmi oleh Guru Wali Kelas atau Admin di halaman review.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 4: REVIEW & RIWAYAT -->
          <div class="tab-pane fade" id="tab-review" role="tabpanel">
            <div class="card border-0 shadow-sm rounded-4 p-4">
              <h5 class="fw-bold text-dark border-bottom pb-3 mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-shield-check text-primary fs-4"></i> Antrean Review &amp; Riwayat Pengajuan
              </h5>

              <p class="text-secondary">
                Guru Wali Kelas yang diberikan hak akses Reviewer dapat memverifikasi berkas yang diajukan oleh siswa di kelasnya masing-masing.
              </p>

              <h6 class="fw-bold text-dark mt-4 mb-2"><i class="bi bi-inbox-fill text-primary me-2"></i>1. Halaman Antrean Review (Real-time &amp; Bersih)</h6>
              <ul class="small text-secondary ps-3 mb-3">
                <li class="mb-1.5"><strong>Filter Otomatis</strong>: Hanya siswa dengan setidaknya 1 berkas berstatus **Pending (Menunggu Review)** yang akan muncul di daftar antrean.</li>
                <li class="mb-1.5"><strong>Sistem Inbox Zero</strong>: Begitu berkas disetujui atau ditolak, siswa bersangkutan langsung keluar dari daftar antrean secara otomatis tanpa reload halaman.</li>
                <li class="mb-1.5"><strong>Tolak Berkas</strong>: Saat menolak berkas, Anda wajib memasukkan alasan penolakan (misal: <em>Akte terpotong</em>). Alasan ini akan tampil di dashboard siswa sehingga mereka tahu apa yang harus diperbaiki sebelum mengunggah ulang.</li>
              </ul>

              <h6 class="fw-bold text-dark mt-4 mb-2"><i class="bi bi-clock-history text-primary me-2"></i>2. Halaman Riwayat Pengajuan (Submissions History)</h6>
              <p class="small text-secondary">
                Untuk melacak berkas yang sudah pernah Anda setujui atau ditolak sebelumnya, gunakan menu **Riwayat Pengajuan**. Di sini Anda dapat melihat log lengkap pengunggahan berkas, nama pengunggah, tanggal, nama reviewer, serta alasan penolakannya jika ada.
              </p>
            </div>
          </div>

          <!-- TAB 5: FITUR TAMBAHAN PORTAL -->
          <div class="tab-pane fade" id="tab-fitur" role="tabpanel">
            <div class="card border-0 shadow-sm rounded-4 p-4">
              <h5 class="fw-bold text-dark border-bottom pb-3 mb-3 d-flex align-items-center gap-2">
                <i class="bi bi-cpu-fill text-primary fs-4"></i> Fitur Tambahan &amp; Kontrol Portal
              </h5>

              <div class="row g-3">
                <!-- Siswa Prioritas -->
                <div class="col-md-6">
                  <div class="p-3 border rounded-4 bg-light h-100">
                    <h6 class="fw-bold text-dark mb-2"><i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>Siswa Prioritas</h6>
                    <p class="small text-secondary mb-0">
                      Jika fitur pengunggahan ditutup secara global oleh Admin, Guru Wali Kelas dapat mendaftarkan siswa tertentu ke dalam daftar **Siswa Prioritas** agar siswa tersebut tetap mendapatkan hak akses khusus untuk mengunggah berkas mandiri.
                    </p>
                  </div>
                </div>

                <!-- Setup Akun -->
                <div class="col-md-6">
                  <div class="p-3 border rounded-4 bg-light h-100">
                    <h6 class="fw-bold text-dark mb-2"><i class="bi bi-person-gear text-primary me-2"></i>Setup Akun Siswa</h6>
                    <p class="small text-secondary mb-0">
                      Gunakan menu ini untuk mengaktifkan akun masuk bagi peserta didik yang belum memiliki akun. Sistem secara otomatis akan mengeset **Username** menggunakan NIPD dan **Kata Sandi (PIN)** default yang sesuai dengan NIPD siswa tersebut.
                    </p>
                  </div>
                </div>

                <!-- Cetak Kartu -->
                <div class="col-md-12">
                  <div class="p-3 border rounded-4 bg-light">
                    <h6 class="fw-bold text-dark mb-2"><i class="bi bi-printer-fill text-success me-2"></i>Cetak Kartu Siswa Instan</h6>
                    <p class="small text-secondary mb-0">
                      Guru dapat mencetak Kartu Identitas Siswa secara kolektif per kelas atau satuan. Kartu dicetak lengkap dengan foto profil siswa yang sudah disetujui, identitas utama, serta **QR Code dinamis** yang terintegrasi dengan URL profil verifikasi siswa bersangkutan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  return renderLayout('Panduan Guru', user, content, 'guide')
    ;
}


