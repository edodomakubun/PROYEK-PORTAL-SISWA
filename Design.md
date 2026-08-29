# Document Desain Sistem & Arsitektur - Portal Siswa & Portal Guru Integration

## 1. Ringkasan Eksekutif (Executive Summary)

**Portal Siswa & Portal Guru** adalah aplikasi web manajemen data pendidikan terintegrasi yang dirancang untuk mengelola data siswa, data profil guru/tenaga pendidik, dokumen legal/administrasi siswa, serta menyediakan kontrol penuh untuk Administrator Sekolah.

Sistem ini dibangun di atas infrastruktur serverless berkinerja tinggi **Cloudflare Edge Computing**, memanfaatkan **Cloudflare Workers** sebagai backend runtime, **Cloudflare D1** sebagai database SQL terdistribusi, **Cloudflare R2** sebagai Object Storage untuk berkas/media, serta kerangka kerja **Hono Web Framework** dengan antarmuka **AdminLTE v3** yang disempurnakan dengan Sistem Navigasi Mobile Native Android.

---

## 2. Arsitektur Sistem (High-Level Architecture)

Aplikasi ini menggunakan pola arsitektur serverless terintegrasi penuh pada edge network.

```mermaid
graph TD
    Client["Client / Web Browser (Desktop & Mobile)"]
    
    subgraph Cloudflare Edge Network
        CFWorker["Cloudflare Worker (Hono API & SSR Router)"]
        AuthModule["Auth & Session Engine (SHA-256 + Cookies)"]
        ViewEngine["View Renderer (AdminLTE3 + HTML Templates)"]
        
        subgraph Data & Storage Layer
            D1DB[("Cloudflare D1 Database (SQLite at Edge)")]
            R2Bucket[("Cloudflare R2 Storage (Bucket Documents & Photos)")]
        end
    end

    Client -->|HTTPS Request| CFWorker
    CFWorker --> AuthModule
    CFWorker --> ViewEngine
    CFWorker -->|SQL Queries| D1DB
    CFWorker -->|File Upload / Stream| R2Bucket
    ViewEngine -->|Rendered HTML| Client
```

---

## 3. Teknologi & Spesifikasi Perangkat Lunak (Tech Stack)

| Komponen | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Runtime Engine** | Cloudflare Workers | Serverless V8 JavaScript/TypeScript execution environment pada Edge |
| **Web Framework** | Hono (`^4.7.0`) | Lightweight, ultra-fast web framework untuk Edge Workers |
| **Database** | Cloudflare D1 | Serverless relational SQL database (SQLite-compatible) |
| **Object Storage** | Cloudflare R2 | S3-compatible Object Storage untuk foto & berkas (Akte, KK, CV) |
| **Frontend Layout** | AdminLTE v3, Bootstrap 5 & Custom CSS Engine | Dasbor Admin & Portal responsif dengan navigasi Mobile Tab Bar |
| **Typography & Icons** | Source Sans 3 & Bootstrap Icons (`^1.11.3`) | Font modern dan icon set lengkap |
| **Bahasa Pemrograman** | TypeScript (`^5.7.3`) | Typed JavaScript untuk keamanan kode dan autocompletion |
| **Pengolahan Data** | SheetJS / XLSX (`^0.18.5`) | Library pendukung impor/ekspor data Excel |
| **Tooling & CLI** | Wrangler (`^3.111.0`) | CLI resmi Cloudflare untuk pengujian lokal (`wrangler dev`) dan deployment |

---

## 4. Model Data & Diagram Hubungan Entitas (ERD)

Sistem menggunakan database relasional Cloudflare D1 dengan 8 tabel utama.

```mermaid
erDiagram
    users ||--o| teacher_profiles : "memiliki profile (role: teacher)"
    users ||--o| students : "terhubung ke NISN (role: siswa)"
    students ||--o| student_parents : "memiliki data orang tua"
    students ||--o{ student_documents : "memiliki dokumen"
    users ||--o{ portal_audit_logs : "dicatat aktivitasnya"
    users ||--o| active_sessions : "memiliki sesi aktif"

    users {
        string id PK "User ID / NIP / NISN"
        string pin_hash "SHA-256 Hash"
        string salt "Unik Salt per User"
        string role "admin | teacher | siswa"
        string plain_pin "Visibilitas PIN Admin"
        datetime created_at
        datetime updated_at
    }

    teacher_profiles {
        string id PK "UUID"
        string user_id FK "Relasi ke users.id"
        string full_name "Nama Lengkap & Gelar"
        string nip_nuptk "NIP / NUPTK"
        string phone_number "Nomor Kontak"
        string subjects "JSON Array Mata Pelajaran"
        string avatar_url "URL Foto R2"
        string cv_url "URL Berkas CV R2"
        string status "draft | pending_verification | verified | rejected"
        datetime created_at
    }

    students {
        int id PK "Auto Increment"
        string nipd "NIPD Siswa"
        string nisn "NISN Siswa"
        string nik "NIK Siswa"
        string name "Nama Lengkap Siswa"
        string class_name "Nama Rombel / Kelas"
        string photo_url "URL Foto Profil R2"
        string birth_place "Tempat Lahir"
        string birth_date "Tanggal Lahir"
        datetime created_at
    }

    student_parents {
        int id PK
        int student_id FK "Relasi Unik ke students.id"
        string father_name "Nama Ayah Kandung"
        int is_father_alive "1: Masih Hidup, 0: Meninggal"
        string mother_name "Nama Ibu Kandung"
        int is_mother_alive "1: Masih Hidup, 0: Meninggal"
    }

    student_documents {
        int id PK
        int student_id FK "Relasi ke students.id"
        string doc_type "akte_kelahiran | kartu_keluarga"
        string file_path "Key / Path file R2"
        string file_url "URL Akses Berkas"
        datetime uploaded_at
    }

    portal_audit_logs {
        int id PK
        string user_id "ID Pengguna"
        string user_name "Nama Pengguna"
        string user_role "Role Pengguna"
        string action "LOGIN_SUCCESS | UPDATE | LOGOUT | dsb"
        string status "SUCCESS | FAILED | INFO"
        string ip_address "IP Client"
        string user_agent "User Agent Client"
        string details "Catatan Detail Aktivitas"
        datetime created_at
    }

    active_sessions {
        string user_id PK "User ID Aktif"
        string user_name "Nama User"
        string user_role "Role User"
        string avatar_url "URL Avatar"
        string ip_address "IP Client"
        datetime last_seen_at
    }

    app_settings {
        string key PK "Setting Key"
        string value "Setting Value"
        string description "Keterangan Pengaturan"
        datetime updated_at
    }
```

---

## 5. Matriks Peran & Hak Akses (User Roles & Permissions)

Sistem menerapkan **Role-Based Access Control (RBAC)** untuk 3 tingkatan pengguna:

| Modul / Fitur | Admin (`admin`) | Guru (`teacher`) | Siswa (`siswa`) |
| :--- | :---: | :---: | :---: |
| **Login & Session Management** | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Lihat Dasbor Statistik** | ✅ Semua Data | ✅ Data Kelas / Umum | ✅ Data Pribadi |
| **Kelola Data Siswa (CRUD)** | ✅ Tambah/Edit/Hapus | 👁️ Lihat Data Kelas | 👁️ Lihat Profil Sendiri |
| **Unggah Dokumen (Akte/KK)** | ✅ Bebas Akses | ❌ Dibatasi | ⚡ Sesuai Feature Flag |
| **Kelola Akun Guru (Profil/Status)**| ✅ Verifikasi/Ubah PIN | ✏️ Edit Profil Sendiri | ❌ Tidak Ada Akses |
| **Audit Logs & Online Users Tracker** | ✅ Akses Penuh | ❌ Tidak Ada Akses | ❌ Tidak Ada Akses |
| **Feature Flags & App Settings** | ✅ Konfigurasi Sistem | ❌ Tidak Ada Akses | ❌ Tidak Ada Akses |

---

## 6. Alur Kerja Utama Sistem (System Workflows)

### 6.1 Alur Autentikasi & Keamanan Sesi

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (Admin/Guru/Siswa)
    participant Client as Browser
    participant Hono as Hono Router (Auth Middleware)
    participant D1 as Cloudflare D1 Database
    participant Audit as Audit Logger

    User->>Client: Input Username / ID & PIN
    Client->>Hono: POST /api/login { username, password }
    Hono->>D1: SELECT * FROM users WHERE id = ?
    D1-->>Hono: Data User (pin_hash, salt, role)
    
    alt User Tidak Ditemukan / PIN Salah
        Hono->>Audit: Catat Log (LOGIN_FAILED)
        Hono-->>Client: Response Error (Invalid Credentials)
    else Authenticated
        Hono->>Hono: Hash Input PIN + Salt (SHA-256) & Verify
        Hono->>D1: UPSERT INTO active_sessions
        Hono->>Audit: Catat Log (LOGIN_SUCCESS)
        Hono->>Client: Set HTTP-Only Cookie (portal_session)
        Hono-->>Client: Redirect ke /dashboard
    end
```

### 6.2 Alur Pengunggahan Dokumen Siswa ke Cloudflare R2

```mermaid
sequenceDiagram
    autonumber
    actor Student as Siswa / Guru
    participant Form as Web UI Form Upload
    participant Worker as Worker API (/api/student/upload)
    participant D1 as D1 Database
    participant R2 as R2 Object Storage

    Student->>Form: Pilih Berkas (Akte / KK / Foto)
    Form->>Worker: POST Multipart Form Data
    Worker->>D1: Check Feature Flag (app_settings: allow_*_upload)
    
    alt Upload Dinonaktifkan oleh Admin
        Worker-->>Form: HTTP 403 Forbidden (Fitur Di-lock Admin)
    else Fitur Aktif
        Worker->>R2: Put File (Key: student_docs/{student_id}/{type}_{filename})
        R2-->>Worker: Storage Confirm URL / Key
        Worker->>D1: INSERT / UPDATE student_documents (file_path, file_url)
        Worker->>D1: INSERT INTO portal_audit_logs
        Worker-->>Form: Response 200 Success & Refresh View
    end
```

---

## 7. Desain & Arsitektur Antarmuka Frontend (Frontend UI/UX Architecture)

### 7.1 Sistem Desain & Token Warna (Design System & Color Tokens)

Frontend menggunakan skema warna **High-Contrast Light Mode** dengan gradien modern yang konsisten, kontras tinggi, dan ramah pembaca pada berbagai resolusi layar.

```mermaid
graph LR
    subgraph Color Tokens
        Primary["Primary Indigo (#4f46e5 → #3730a3)"]
        Success["Success Emerald (#10b981 → #059669)"]
        Warning["Warning Amber (#f59e0b → #d97706)"]
        Danger["Danger Crimson (#ef4444 → #dc2626)"]
        Background["App Canvas (#f1f5f9)"]
        Surface["Card Surface (#ffffff)"]
        TextPrimary["Header & Text (#0f172a)"]
    end
```

* **Canvas & Surface**: Background aplikasi menggunakan slate `#f1f5f9`, dengan kontainer kartu `#ffffff` berlatar batas tegas `#cbd5e1` dan bayangan lembut `0 4px 16px rgba(15, 23, 42, 0.05)`.
* **Tipografi**: Font family **Source Sans 3**, diatur dengan aturan kontras tinggi `color-scheme: light !important` untuk mencegah warna teks memudar saat perangkat menggunakan mode gelap otomatis OS.
* **Badges & Tombol Status**:
  - `Primary` (`#4f46e5`): Tombol utama & indikator aktif.
  - `Success` (`#059669`): Status verifikasi `verified` & modal online real-time.
  - `Warning` (`#d97706`): Status `pending_verification` & peringatan system flags.
  - `Danger` (`#dc2626`): Tombol logout, penghapusan data & status `rejected`.

---

### 7.2 Struktur Tata Letak Responsif & Adaptif (Adaptive Layout System)

Tampilan frontend menyesuaikan diri secara otomatis berdasarkan perangkat yang digunakan:

```mermaid
graph TD
    Device{Tipe Perangkat User}
    
    Device -->|Desktop / Tablet >= 992px| DesktopView["Desktop Responsive Layout"]
    Device -->|Smartphone < 992px| MobileView["Android Native Mobile Layout"]

    subgraph Desktop Layout Architecture
        DesktopView --> DHeader["Sticky Top Header (User Info, Online Badge, Logout)"]
        DesktopView --> DSidebar["Fixed Collapsible Left Sidebar (250px)"]
        DesktopView --> DMain["Main Content Canvas (Auto Margin Left)"]
        DesktopView --> DFooter["Sticky Footer Information"]
    end

    subgraph Mobile Layout Architecture
        MobileView --> MHeader["Compact Mobile Top Bar"]
        MobileView --> MMain["Full Width Content Canvas (Padding Bottom 72px)"]
        MobileView --> MBottomNav["Android Bottom Navigation Bar (Tabs: Home, Data, Profil, Logout)"]
    end
```

#### A. Layout Desktop (>= 992px)
* **Sidebar Kiri Terpaku (Fixed Sidebar 250px)**: Warna `#0f172a` dengan efek *smooth collapse* saat tombol ☰ diklik.
* **Sticky Top Navbar**: Menyediakan informasi pengguna aktif, indikator status online real-time (*pulse indicator*), avatar profil, dan tombol eksplisit **Logout**.

#### B. Layout Mobile Android Native (< 992px)
* **Penyembunyian Sidebar Kiri**: Sidebar kiri disembunyikan secara otomatis agar tidak memakan ruang layar ponsel yang terbatas.
* **Android Bottom Navigation Bar (Tabs Bar)**: Menggantikan navigasi sidebar dengan 4-5 tab utama di bagian bawah layar (Home, Data Siswa/Guru, Profil, & Logout) dengan icon intuitif dan efek transisi haptik visual.
* **Tabel & Kartu Ringkas**: Tabel otomatis mendukung *touch horizontal scroll*, ukuran font disesuaikan menjadi `0.85rem`, dan kartu dibuat lebih compact dengan sudut membulat 14px.

---

### 7.3 Komponen Antarmuka Utama (Key UI Components)

```mermaid
classDiagram
    class LayoutTemplate {
        +renderLayout(title, user, content, activeNav) String
        +renderHeader()
        +renderSidebar()
        +renderBottomNav()
        +renderToastContainer()
    }
    class ToastNotificationSystem {
        +showToast(message, type)
        +autoDismiss(2000ms)
    }
    class RealtimeOnlineModal {
        +fetchOnlineUsers()
        +renderUserList()
    }
    class StudentManagementView {
        +renderStudentTable()
        +renderUploadDocumentModal()
        +renderParentInfoSection()
    }
    class TeacherProfileView {
        +renderProfileCard()
        +renderStatusBadge()
        +renderCustomFormFields()
    }

    LayoutTemplate --> ToastNotificationSystem
    LayoutTemplate --> RealtimeOnlineModal
    LayoutTemplate --> StudentManagementView
    LayoutTemplate --> TeacherProfileView
```

#### 1. Floating Toast Notification Engine
* Terletak di pojok kanan bawah (`.app-toast-container`).
* Mendukung 4 varian pesan: `info`, `success`, `warning`, `danger`.
* Dilengkapi efek animasi *scale-in* (`translateY(0) scale(1)`) dan *auto-dismiss* otomatis dalam waktu 2 detik tanpa mengganggu navigasi pengguna.

#### 2. Modal Real-Time User Tracker
* Menampilkan daftar seluruh pengguna (Admin, Guru, Siswa) yang sedang online secara langsung.
* Dilengkapi *pulse animation spinner* hijau pada navbar sebagai penanda aktivitas real-time.

#### 3. Modul Formulir & Unggah Dokumen Siswa
* Kartu unggah terpisah untuk **Foto Profil**, **Akte Kelahiran**, dan **Kartu Keluarga**.
* Menyediakan indikator berkas terunggah (*preview link* & tanggal unggah) serta penanganan validasi *feature flag* (apabila Admin mematikan opsi unggah).

#### 4. Kartu Profil & Verifikasi Guru
* Menampilkan informasi lengkap NIP/NUPTK, bidang studi (mata pelajaran), nomor kontak, berkas CV, serta badge status verifikasi (`draft`, `pending_verification`, `verified`, `rejected`).

---

### 7.4 Alur Renderer Frontend (Server-Side Rendering + Dynamic Hydration)

```mermaid
sequenceDiagram
    autonumber
    actor User as Web Browser
    participant Worker as Cloudflare Worker (Hono Router)
    participant View as Template Engine (renderLayout)
    participant ClientJS as Client-Side JS & Modals

    User->>Worker: Request Page GET /students
    Worker->>View: Call renderLayout("Data Siswa", user, content)
    View->>View: Inject CSS Tokens, AdminLTE, Icon Sets & Modals
    View-->>Worker: Return Complete HTML Document
    Worker-->>User: Stream Response HTTP 200 (Instant Paint)
    
    Note over User,ClientJS: Client-side Interactive Hydration
    User->>ClientJS: User Click "Tambah Siswa" / "Upload Akte"
    ClientJS->>User: Open Bootstrap Modal instantly
    ClientJS->>Worker: Submit Form via AJAX Fetch API
    Worker-->>ClientJS: JSON Response { success: true }
    ClientJS->>User: Trigger Floating Toast (2s Auto-hide) & Refresh Table
```

---

## 8. Keamanan & Kepatuhan Data (Security Design)

1. **Enkripsi Kredensial**:
   - Kata sandi/PIN disimpan dalam bentuk Hashing **SHA-256** ditambah **Salt** unik per pengguna.
   - Menyediakan visibilitas `plain_pin` khusus untuk keperluan pemulihan cepat oleh Administrator Sekolah.
2. **Keamanan Cookie Sesi**:
   - Cookie sesi `portal_session` dienkripsi dengan standar Safe Base64 Encoding.
   - Ditandai dengan atribut `HttpOnly` untuk mencegah serangan Cross-Site Scripting (XSS).
3. **Auditability (Jejak Audit)**:
   - Setiap tindakan penting (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `UPDATE_DATA`, `UPLOAD_DOC`) dicatat secara otomatis ke dalam `portal_audit_logs` bersama alamat IP dan User-Agent client.
4. **Real-time Session Monitoring**:
   - Pelacakan aktif pengguna secara *real-time* via tabel `active_sessions` untuk memantau pengguna yang sedang aktif di portal.
5. **Feature Flagging (Pengontrol Fitur)**:
   - Pengaturan fitur unggah foto, Akte, dan KK dapat dikunci atau dibuka secara dinamis melalui tabel `app_settings` oleh Admin.

---

## 9. Panduan Pengembangan & Deployment (Operations Guide)

### 9.1 Lingkungan Pengujian Lokal (Development)
```bash
# 1. Jalankan server pengembang lokal
npm run dev

# 2. Inisialisasi Database D1 Lokal dengan schema.sql
npm run db:init
```

### 9.2 Deployment ke Produksi (Production Deployment)
```bash
# 1. Inisialisasi / Migrasi Database D1 di Cloudflare Remote
npm run db:init:prod

# 2. Deploy Cloudflare Worker ke Edge Network
npm run deploy
```

---

## 10. Kesimpulan & Pengembangan Selanjutnya

Dokumen desain ini menjadi panduan arsitektur utama untuk pengemasan, pemeliharaan, serta skalabilitas **Portal Siswa & Portal Guru Integration**, baik di sisi backend serverless maupun antarmuka frontend yang adaptif. Dengan kombinasi infrastruktur terdistribusi Cloudflare Edge dan desain antarmuka responsif seluler Android Native, sistem menjamin latensi rendah, ketersediaan tinggi, pengalaman pengguna yang intuitif, serta keamanan data pendidikan yang terjamin.

---

# Adendum: Granular Document Permission & Approval Workflow
### Portal Siswa & Portal Guru Integration

> Dokumen ini adalah **adendum** dari `Design.md` (Document Desain Sistem & Arsitektur - Portal Siswa & Portal Guru Integration). Adendum ini memperluas §5 (Matriks Peran & Hak Akses), §6.2 (Alur Pengunggahan Dokumen), dan §4 (Model Data / ERD) pada dokumen utama untuk mendukung kontrol izin dokumen yang lebih granular.

---

## 1. Latar Belakang & Tujuan

Desain awal sistem (`Design.md` §5) menggunakan **feature flag global** (`app_settings: allow_*_upload`) untuk membuka/menutup fitur unggah dokumen bagi seluruh siswa sekaligus. Adendum ini mengubah pendekatan tersebut menjadi kontrol **per-siswa dan per-jenis-dokumen**, ditambah alur **approval wajib** sebelum dokumen dianggap sah, serta kemampuan **Admin mendelegasikan wewenang approval ke Teacher tertentu**.

Ringkasan keputusan desain:
| Aspek | Keputusan |
|---|---|
| Granularitas izin upload | Per siswa **dan** per jenis dokumen (bukan satu izin untuk semua) |
| Approval dokumen | Wajib — dokumen berstatus `pending` sampai direview |
| Siapa yang bisa approve | Admin selalu bisa; Teacher hanya bisa jika ditetapkan sebagai *Document Reviewer* oleh Admin |
| Dokumen yang di-*reject* | File dihapus permanen dari R2; siswa upload ulang dari awal |
| Batas waktu approval (SLA) | Tidak ada — dokumen bisa menunggu di `pending` tanpa batas waktu |
| Audit trail | Tetap tersimpan di `portal_audit_logs` meski file fisik sudah dihapus |

---

## 2. Peran Pengguna (Diperluas dari §5)

1. **Admin** — kontrol mutlak:
   - Menetapkan role pengguna (`admin` / `teacher` / `siswa`)
   - Mencentang izin upload per siswa **per jenis dokumen** (Kartu Keluarga / Akte Kelahiran / Foto)
   - Menetapkan Teacher mana yang menjadi **Document Reviewer**
   - Approve/reject dokumen kapan saja
2. **Teacher** —
   - **Reviewer = false** (default): tidak punya akses ke dashboard approval sama sekali
   - **Reviewer = true** (di-set Admin): dapat approve/reject dokumen siswa yang berstatus `pending`
3. **Siswa** — hanya dapat mengunggah dokumen untuk jenis yang izinnya aktif (`is_allowed = 1`); status dokumen terlihat sebagai `Pending` / `Approved` / `Rejected`

---

## 3. Perubahan Skema Database (D1)

### 3.1 Tabel Baru: `student_document_permissions`

Menggantikan pendekatan flag global dengan kontrol granular per baris siswa × jenis dokumen.

```sql
CREATE TABLE student_document_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id),
  doc_type TEXT NOT NULL CHECK(doc_type IN ('akte_kelahiran','kartu_keluarga','foto')),
  is_allowed INTEGER NOT NULL DEFAULT 0,       -- 0 = tidak diizinkan, 1 = diizinkan
  granted_by TEXT REFERENCES users(id),        -- admin id yang mencentang
  granted_at DATETIME,
  UNIQUE(student_id, doc_type)
);
```

### 3.2 Perluasan Tabel `users` (delegasi reviewer)

```sql
ALTER TABLE users ADD COLUMN is_document_reviewer INTEGER DEFAULT 0;
-- Hanya relevan untuk role = 'teacher'; di-set oleh Admin
```

### 3.3 Perluasan Tabel `student_documents` (status approval)

```sql
ALTER TABLE student_documents ADD COLUMN status TEXT DEFAULT 'pending'
  CHECK(status IN ('pending','approved','rejected'));
ALTER TABLE student_documents ADD COLUMN rejection_note TEXT;
ALTER TABLE student_documents ADD COLUMN reviewed_by TEXT REFERENCES users(id);
ALTER TABLE student_documents ADD COLUMN reviewed_at DATETIME;
```

> Saat `status = 'rejected'`: `file_path` dan `file_url` di-set `NULL`, file fisik dihapus dari R2 (`R2.delete()`). Riwayat aksi tetap tersimpan di `portal_audit_logs`, bukan di tabel dokumen itu sendiri.

### 3.4 ERD Tambahan (pelengkap §4 di Design.md)

```mermaid
erDiagram
    students ||--o{ student_document_permissions : "punya izin per jenis dokumen"
    users ||--o{ student_document_permissions : "granted_by (admin)"
    users ||--o{ student_documents : "reviewed_by (admin/teacher-reviewer)"

    student_document_permissions {
        int id PK
        int student_id FK
        string doc_type "akte_kelahiran | kartu_keluarga | foto"
        int is_allowed "0 | 1"
        string granted_by FK "admin id"
        datetime granted_at
    }

    student_documents {
        int id PK
        int student_id FK
        string doc_type
        string file_path "NULL jika status=rejected"
        string file_url "NULL jika status=rejected"
        string status "pending | approved | rejected"
        string rejection_note
        string reviewed_by FK
        datetime reviewed_at
        datetime uploaded_at
    }
```

---

## 4. Alur Kerja (Menggantikan §6.2 di Design.md)

```mermaid
sequenceDiagram
    autonumber
    actor Student as Siswa
    participant Worker as Worker API (/api/student/upload)
    participant D1 as D1 Database
    participant R2 as R2 Storage
    participant Reviewer as Admin / Teacher-Reviewer

    Student->>Worker: POST Upload {doc_type, file}
    Worker->>D1: SELECT is_allowed FROM student_document_permissions WHERE student_id=? AND doc_type=?

    alt is_allowed = 0
        Worker-->>Student: 403 Forbidden ("Belum diizinkan Admin untuk dokumen ini")
    else is_allowed = 1
        Worker->>R2: Put File (Key: student_docs/{student_id}/{doc_type}_{filename})
        Worker->>D1: INSERT student_documents (status='pending')
        Worker->>D1: INSERT portal_audit_logs (action='UPLOAD_PENDING')
        Worker-->>Student: 200 OK { status: "pending" }
    end

    Reviewer->>Worker: GET /api/reviewer/documents/pending
    Worker->>D1: SELECT * WHERE status='pending'
    Worker-->>Reviewer: Daftar dokumen pending

    Reviewer->>Worker: POST /api/reviewer/documents/:id/approve
    Worker->>D1: UPDATE status='approved', reviewed_by, reviewed_at
    Worker->>D1: INSERT portal_audit_logs (action='APPROVE_DOC')
    Worker-->>Reviewer: 200 OK

    Reviewer->>Worker: POST /api/reviewer/documents/:id/reject {note}
    Worker->>R2: Delete File
    Worker->>D1: UPDATE status='rejected', file_url=NULL, rejection_note=note
    Worker->>D1: INSERT portal_audit_logs (action='REJECT_DOC')
    Worker-->>Reviewer: 200 OK, siswa harus upload ulang
```

---

## 5. Matriks Peran & Hak Akses (Perluasan §5 di Design.md)

| Modul / Fitur | Admin | Teacher (Reviewer = false) | Teacher (Reviewer = true) | Siswa |
| :--- | :---: | :---: | :---: | :---: |
| Set izin upload per jenis dokumen per siswa | ✅ | ❌ | ❌ | ❌ |
| Set status `is_document_reviewer` pada Teacher | ✅ | ❌ | ❌ | ❌ |
| Lihat dashboard dokumen `pending` | ✅ Semua | ❌ | ✅ | ❌ |
| Approve / Reject dokumen | ✅ | ❌ | ✅ | ❌ |
| Upload dokumen (sesuai izin aktif) | ➖ | ➖ | ➖ | ⚡ |
| Lihat status dokumen sendiri (`Pending`/`Approved`/`Rejected`) | ➖ | ➖ | ➖ | ✅ |

---

## 6. Endpoint API Baru (pola Hono, melengkapi Worker API)

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/api/admin/students/:id/permissions` | Lihat status izin per jenis dokumen untuk 1 siswa | Admin |
| `PUT` | `/api/admin/students/:id/permissions` | Set/ubah izin per jenis dokumen (checkbox) | Admin |
| `PUT` | `/api/admin/teachers/:id/reviewer` | Toggle `is_document_reviewer` pada Teacher | Admin |
| `GET` | `/api/reviewer/documents/pending` | Daftar dokumen berstatus `pending` | Admin, Teacher-Reviewer |
| `POST` | `/api/reviewer/documents/:id/approve` | Setujui dokumen | Admin, Teacher-Reviewer |
| `POST` | `/api/reviewer/documents/:id/reject` | Tolak dokumen (hapus file R2 + catat alasan) | Admin, Teacher-Reviewer |
| `POST` | `/api/student/upload` | Upload dokumen (dicek terhadap `student_document_permissions`) | Siswa |

Semua endpoint di atas wajib menulis ke `portal_audit_logs` (mengikuti pola audit yang sudah ada di §8 Design.md), dengan `action` baru: `SET_PERMISSION`, `SET_REVIEWER`, `UPLOAD_PENDING`, `APPROVE_DOC`, `REJECT_DOC`.

---

## 7. Perubahan Komponen UI (melengkapi §7.3 di Design.md)

- **`StudentManagementView`** — tambah `renderDocumentPermissionCheckboxes()`: 3 checkbox (KK / Akte / Foto) per baris siswa di tabel manajemen.
- **Komponen baru: `DocumentReviewDashboard`**
  - `renderPendingDocumentsQueue()` — daftar dokumen `pending`, terlihat oleh Admin (semua) dan Teacher-Reviewer.
  - `renderApproveRejectModal()` — modal aksi approve/reject, dengan field `rejectionNote` wajib diisi saat reject.
- **`TeacherProfileView`** (khusus tampilan Admin) — tambah toggle switch **"Jadikan Document Reviewer"** pada kartu profil guru.
- Status dokumen di sisi siswa memakai badge warna sesuai token desain yang sudah ada (§7.1): `Pending` → Warning (`#d97706`), `Approved` → Success (`#059669`), `Rejected` → Danger (`#dc2626`).

---

## 8. Catatan Implementasi

- Query permission harus dicek di **setiap** request upload (bukan hanya di render UI), untuk mencegah bypass lewat API langsung.
- Reject harus bersifat atomik: hapus file R2 dan update baris DB dalam satu alur — jika penghapusan R2 gagal, status jangan berubah jadi `rejected` agar tidak terjadi data yatim (`file_url` menunjuk file yang masih ada padahal status sudah rejected, atau sebaliknya).
- Karena tidak ada SLA, pertimbangkan indikator visual "sudah menunggu berapa lama" di dashboard reviewer (opsional, tidak fungsional wajib) agar dokumen lama tidak terlupakan — tanpa memaksakan batas waktu otomatis.
