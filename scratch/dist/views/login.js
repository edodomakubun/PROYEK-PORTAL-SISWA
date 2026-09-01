export function renderLoginPage(errorMsg = '') {
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
  <title>LOGIN PORTAL SISWA</title>
  <meta name="description" content="Halaman Login Portal Siswa SD Inpres Lelingluan - Akses Sistem Informasi Data Siswa dan Layanan Akademik." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://portalsiswa.sdinpreslelingluan.com/login" />
  <meta property="og:title" content="Login Portal | SD Inpres Lelingluan" />
  <meta property="og:description" content="Akses Masuk Portal Siswa SD Inpres Lelingluan." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://portalsiswa.sdinpreslelingluan.com/login" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>">
  
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script src="https://sdinpres-sso.pages.dev/sso-client.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  </style>
</head>
<body class="font-sans text-slate-800 bg-slate-900 lg:bg-slate-50 min-h-screen flex items-center justify-center lg:p-6 xl:p-8 antialiased relative overflow-x-hidden">

  <!-- Background Image with Blur & Scale to prevent edge bleeding -->
  <div class="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat blur-[6px] scale-105" style="background-image: url('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh7fRJe9SVBEej0swcVC4DM7hCsCrH-RTrh8f7bjetyGiuwXQ3DV6bvM2f-gEsF67S5Tlh7-VM-zLbuc_nR5X-VRsdqgILF_qUBhC8EG6getFTTbI4xJkPJRxFPf2UbibB2KyYwVt1_nnvNITK3Q3oNfyxU4nxTc7aGiASXRbiUWf31i5nKThNzZTZGQ5P5/s1280/img1.jpeg');"></div>
  <div class="fixed inset-0 -z-10 bg-slate-950/40 backdrop-blur-[1px] lg:bg-transparent lg:backdrop-blur-none"></div>

  <!-- Desktop Background Glows -->
  <div class="hidden lg:block absolute top-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl pointer-events-none -z-10"></div>
  <div class="hidden lg:block absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl pointer-events-none -z-10"></div>

  <!-- Main Container: Full-screen mobile app style on small screens, clean card on desktop -->
  <main class="w-full min-h-screen lg:min-h-0 lg:max-w-4xl bg-white lg:rounded-3xl lg:shadow-xl lg:border lg:border-slate-200 overflow-hidden flex flex-col lg:flex-row relative z-10 justify-between lg:justify-start">
    
    <!-- Left Side / Top Mobile App Header -->
    <div class="lg:w-1/2 bg-gradient-to-br from-indigo-600/90 to-blue-700/90 lg:from-indigo-600 lg:to-blue-700 p-6 sm:p-8 lg:p-12 flex flex-col justify-between text-white relative backdrop-blur-md lg:backdrop-blur-none">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
      
      <div class="relative z-10 flex items-center justify-between lg:justify-start gap-3">
        <div class="flex items-center gap-3">
          <div class="bg-white/15 backdrop-blur-md p-2 rounded-xl lg:rounded-2xl border border-white/20">
            <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhenHq6OURnD7AvF653opXZZezrdyEUgvyummvwupYRpS08JOfJQPQAjwXuwwE46o-HJ1E2mt_3Pceu_RNrT6QvIFvJGl9vX8E5cVI9CIKCI5vSugdKuLndfonqtE_Gz-5F4m7Awyfh4Uqb5oy129eX8tSpT_XGi5FWtmd2fYRacm7PnYEstYuzZW-hK3He/s2348/Logo-Tut-Wuri-Handayani-PNG-Warna.png" 
                 alt="Logo Sekolah" class="w-7 h-7 lg:w-8 lg:h-8 object-contain" />
          </div>
          <span class="font-bold text-sm lg:text-base tracking-wide">PORTAL SISWA<br>SD INPRES LELINGLUAN</span>
        </div>
      </div>

      <div class="relative z-10 my-8 lg:my-0">
        <span class="hidden lg:inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold tracking-wide mb-4 backdrop-blur-sm">PORTAL AKADEMIK RESMI</span>
        <h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-2 lg:mb-3 leading-tight">Mencetak Generasi Berprestasi & Berkarakter</h2>
        <p class="text-indigo-100 text-xs sm:text-sm leading-relaxed">Sistem informasi data siswa, administrasi akademik, dan layanan terpadu sekolah dalam satu genggaman.</p>
      </div>

      <div class="relative z-10 hidden lg:block text-xs text-indigo-200">
        © 2026 SD Inpres Lelingluan. Hak Cipta Dilindungi.
      </div>
    </div>

    <!-- Right Side / Mobile App Form Body -->
    <div class="lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-between lg:justify-center bg-white flex-grow rounded-t-3xl lg:rounded-none shadow-up lg:shadow-none">
      <div class="w-full max-w-sm mx-auto flex flex-col gap-4 sm:gap-5">
        
        <div class="flex flex-col gap-1">
          <h1 class="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">Masuk ke Akun</h1>
          <p class="text-slate-500 text-xs lg:text-sm">Pilih role dan masukkan kredensial Anda.</p>
        </div>

        <!-- SSO Verification Status Card (Hidden by default, shown when verifying SSO) -->
        <div id="sso-status-card" class="hidden bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 text-indigo-900 p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-3 shadow-sm">
          <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
          <div class="flex-grow">
            <p class="font-bold text-indigo-950">Memverifikasi Akun SSO Terpadu...</p>
            <p class="text-[11px] text-indigo-700">Selamat datang, <span id="nama-pengguna" class="font-semibold text-indigo-900"></span> <span id="role-badge" class="ml-1 px-1.5 py-0.5 rounded bg-indigo-200/70 text-[10px] font-bold text-indigo-800" id="role-pengguna"></span></p>
          </div>
        </div>

        <!-- Role Switcher (Android App Segmented Control style) -->
        <div class="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200 shadow-inner" role="tablist">
          <button type="button" class="flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 bg-indigo-600 text-white shadow-sm" id="tab-siswa" onclick="switchRole('siswa')">
            Login Siswa
          </button>
          <button type="button" class="flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 text-slate-600 hover:text-slate-900" id="tab-guru" onclick="switchRole('guru')">
            Guru / Staf
          </button>
        </div>

        ${errorMsg ? `
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 shadow-sm" role="alert">
          <span class="material-symbols-outlined text-red-500 text-lg">error</span>
          <span>${errorMsg}</span>
        </div>` : ''}

        <!-- Form -->
        <form id="login-form" action="/login" method="post" class="flex flex-col gap-3.5 sm:gap-4">
          <input type="hidden" id="loginTypeInput" name="login_type" value="siswa" />

          <div class="flex flex-col gap-1.5">
            <label for="username-input" class="text-xs font-bold text-slate-700 ml-0.5" id="input-label">NIPD (Nomor Induk Peserta Didik)</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <span class="material-symbols-outlined text-xl">person</span>
              </div>
              <input id="username-input" name="username" required class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 text-slate-900 rounded-xl py-3 pl-10 pr-4 text-sm transition-all placeholder:text-slate-400 font-medium" placeholder="Masukkan NIPD Anda" type="text" />
            </div>
            <p class="text-[11px] text-slate-500 ml-0.5" id="input-hint">Masukkan NIPD resmi yang terdaftar.</p>
          </div>

          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center px-0.5">
              <label for="password-input" class="text-xs font-bold text-slate-700">Kata Sandi</label>
              <a href="#" class="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors" id="forgot-password-link">Lupa password?</a>
            </div>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <span class="material-symbols-outlined text-xl">lock</span>
              </div>
              <input id="password-input" name="password" required class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 text-slate-900 rounded-xl py-3 pl-10 pr-10 text-sm transition-all placeholder:text-slate-400 font-medium" placeholder="•••••••••••" type="password" />
              <button type="button" id="toggle-password" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors" aria-label="Tampilkan kata sandi">
                <span class="material-symbols-outlined text-xl" id="pw-icon">visibility</span>
              </button>
            </div>
            <p class="text-[11px] text-slate-500 ml-0.5 italic" id="password-hint">Default Password siswa adalah NIPD Anda.</p>
          </div>

          <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 mt-1 text-sm cursor-pointer" id="submit-button">
            <span id="btn-text">Masuk Sebagai Siswa</span>
            <span class="material-symbols-outlined text-xl">login</span>
          </button>
        </form>

        <!-- Divider 'atau' -->
        <div class="relative flex items-center my-0.5">
          <div class="flex-grow border-t border-slate-200"></div>
          <span class="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">atau</span>
          <div class="flex-grow border-t border-slate-200"></div>
        </div>

        <!-- Tombol Login SSO Terpadu -->
        <button type="button" id="btn-sso" onclick="loginDenganSSO()" class="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-between text-sm border border-slate-800 group cursor-pointer">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <span class="material-symbols-outlined text-base">verified_user</span>
            </div>
            <div class="flex flex-col text-left">
              <span class="text-xs sm:text-sm font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors">Masuk dengan SSO Terpadu</span>
              <span class="text-[10px] text-slate-300 font-normal">Satu akun untuk seluruh portal sekolah</span>
            </div>
          </div>
          <span class="material-symbols-outlined text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all text-lg">arrow_forward</span>
        </button>

      </div>

      <footer class="text-center pt-5 lg:pt-2 border-t border-slate-100 mt-auto">
        <p class="text-slate-400 text-xs">
          © 2026 
          <a href="https://www.sdinpreslelingluan.com" target="_blank" rel="noopener noreferrer" class="hover:text-slate-600 underline transition-colors font-medium">
            SD INPRES LELINGLUAN
          </a>
        </p>
      </footer>
    </div>

  </main>

  <script>
    let currentRole = 'siswa';

    function switchRole(role) {
      currentRole = role;
      const tabSiswa = document.getElementById('tab-siswa');
      const tabGuru = document.getElementById('tab-guru');
      const inputLabel = document.getElementById('input-label');
      const usernameInput = document.getElementById('username-input');
      const inputHint = document.getElementById('input-hint');
      const passwordHint = document.getElementById('password-hint');
      const btnText = document.getElementById('btn-text');
      const loginTypeInput = document.getElementById('loginTypeInput');

      if (role === 'siswa') {
        tabSiswa.className = 'flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 bg-indigo-600 text-white shadow-sm';
        tabGuru.className = 'flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 text-slate-600 hover:text-slate-900';
        
        loginTypeInput.value = 'siswa';
        inputLabel.innerText = "NIPD (Nomor Induk Peserta Didik)";
        usernameInput.placeholder = "Masukkan NIPD Anda";
        inputHint.innerText = "Masukkan NIPD resmi yang terdaftar.";
        passwordHint.innerText = "Default Password siswa adalah NIPD Anda.";
        btnText.innerText = "Masuk Sebagai Siswa";
      } else {
        tabGuru.className = 'flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 bg-indigo-600 text-white shadow-sm';
        tabSiswa.className = 'flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 text-slate-600 hover:text-slate-900';
        
        loginTypeInput.value = 'guru';
        inputLabel.innerText = "ID Guru";
        usernameInput.placeholder = "Contoh: G0XX";
        inputHint.innerText = "Masukkan ID Guru yang terdaftar pada Portal Guru";
        passwordHint.innerText = "Gunakan PIN Portal Guru";
        btnText.innerText = "Masuk Sebagai Guru / Staf";
      }
    }

    const pwToggle = document.getElementById('toggle-password');
    const pwInput = document.getElementById('password-input');
    const pwIcon = document.getElementById('pw-icon');
    pwToggle.addEventListener('click', () => {
      const isPassword = pwInput.type === 'password';
      pwInput.type = isPassword ? 'text' : 'password';
      pwIcon.innerText = isPassword ? 'visibility_off' : 'visibility';
    });

    document.getElementById('forgot-password-link').addEventListener('click', (e) => {
      e.preventDefault();
      const username = document.getElementById('username-input').value.trim();
      if (!username) {
        alert("Silakan masukkan NIPD atau ID Guru terlebih dahulu pada kolom input untuk mereset password.");
        document.getElementById('username-input').focus();
        return;
      }
      window.location.href = '/forgot-password?id=' + encodeURIComponent(username);
    });

    // ----------------------------------------------------
    // SSO TERPADU INTEGRATION LOGIC
    // ----------------------------------------------------

    // 1. Fungsi Tombol Login SSO
    async function loginDenganSSO() {
      const btnSso = document.getElementById('btn-sso');
      if (btnSso) {
        btnSso.disabled = true;
        btnSso.classList.add('opacity-75', 'cursor-wait');
      }

      if (!window.SDINPRESSSO) {
        alert('Modul SSO Client belum siap atau koneksi terputus. Silakan muat ulang halaman.');
        if (btnSso) {
          btnSso.disabled = false;
          btnSso.classList.remove('opacity-75', 'cursor-wait');
        }
        return;
      }

      try {
        // Periksa apakah user sudah memiliki sesi aktif di SSO
        const ssoRes = await window.SDINPRESSSO.getUser();
        if (ssoRes && ssoRes.authenticated && ssoRes.user) {
          await syncSsoUserToPortal(ssoRes.user);
        } else {
          // Redirect ke halaman login SSO jika belum aktif
          window.SDINPRESSSO.redirectToLogin();
        }
      } catch (err) {
        console.warn('[SSO] Redirecting to SSO Login:', err);
        window.SDINPRESSSO.redirectToLogin();
      }
    }

    // 2. Sinkronisasi Akun SSO ke Sesi Portal Siswa
    async function syncSsoUserToPortal(user) {
      const statusCard = document.getElementById('sso-status-card');
      const namaEl = document.getElementById('nama-pengguna');
      const roleEl = document.getElementById('role-pengguna');

      if (statusCard) statusCard.classList.remove('hidden');
      if (namaEl) namaEl.textContent = user.full_name || user.name || user.username || 'Pengguna';
      if (roleEl) roleEl.textContent = (user.role || 'GURU').toUpperCase();

      try {
        const res = await fetch('/api/auth/sso-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ssoUser: user,
            token: window.SDINPRESSSO.getToken()
          })
        });

        const data = await res.json();
        if (data.success) {
          window.location.href = data.redirect || '/dashboard';
        } else {
          if (statusCard) statusCard.classList.add('hidden');
          alert(data.error || 'Gagal menyinkronkan akun SSO ke Portal Siswa.');
          const btnSso = document.getElementById('btn-sso');
          if (btnSso) {
            btnSso.disabled = false;
            btnSso.classList.remove('opacity-75', 'cursor-wait');
          }
        }
      } catch (e) {
        console.error('SSO Sync Error:', e);
        if (statusCard) statusCard.classList.add('hidden');
        alert('Terjadi kesalahan komunikasi saat menghubungkan akun SSO.');
        const btnSso = document.getElementById('btn-sso');
        if (btnSso) {
          btnSso.disabled = false;
          btnSso.classList.remove('opacity-75', 'cursor-wait');
        }
      }
    }

    // 3. Auto-check status login SSO saat halaman dimuat
    document.addEventListener('DOMContentLoaded', async () => {
      if (window.SDINPRESSSO) {
        try {
          const ssoData = await window.SDINPRESSSO.getUser();
          if (ssoData && ssoData.authenticated && ssoData.user) {
            console.log("Selamat datang:", ssoData.user.full_name || ssoData.user.username);
            await syncSsoUserToPortal(ssoData.user);
          }
        } catch (e) {
          console.warn('[SSO Auto-check] Not active or unauthenticated');
        }
      }
    });

    // 4. Fungsi untuk tombol Logout
    function tombolKeluar() {
      if (window.SDINPRESSSO) {
        window.SDINPRESSSO.logout();
      } else {
        window.location.href = '/logout';
      }
    }
  </script>

</body>
</html>`;
}
export function renderForgotPasswordPage(id = '') {
    const whatsappUrl = `https://wa.me/6282238128216?text=${encodeURIComponent(`Pak OPS tolong reset akun saya dengan ID ${id}`)}`;
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Lupa Password | SD INPRES LELINGLUAN</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
          }
        }
      }
    }
  </script>
</head>
<body class="font-sans text-slate-100 bg-[#090f1d] min-h-screen flex items-center justify-center p-4 sm:p-6 antialiased relative overflow-hidden">
  <!-- Soft Background Glow -->
  <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
  <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

  <div class="w-full max-w-[420px] relative z-10 flex flex-col gap-6 sm:gap-7 bg-[#070c14]/80 backdrop-blur-xl border border-slate-700/50 p-6 sm:p-10 rounded-3xl shadow-2xl">
    
    <div class="flex flex-col items-center text-center gap-3">
      <div class="p-3.5 rounded-full bg-slate-800/80 border border-slate-700/60 shadow-xl shadow-indigo-500/10">
        <span class="material-symbols-outlined text-4xl text-indigo-400">lock_reset</span>
      </div>
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-white tracking-tight">Lupa Password?</h1>
        <p class="text-slate-400 text-sm mt-2">Silakan minta bantuan ke ADMIN (Pak OPS) melalui WhatsApp untuk alasan keamanan.</p>
      </div>
    </div>

    <div class="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-center flex justify-center">
      <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-[#25D366]/30 transition-all active:scale-95 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
        <span>Hubungi via WhatsApp</span>
      </a>
    </div>

    <div class="text-center mt-2">
      <a href="/login" class="text-sm font-semibold text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        Kembali ke Halaman Login
      </a>
    </div>

  </div>
</body>
</html>`;
}
