-- Cloudflare D1 Database Schema for Portal Siswa & Portal Guru Integration

-- 1. Table: users (Authentication & Multi-Role)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Contoh: 'G001', 'G002', 'ADMIN01', 'admin'
    pin_hash TEXT NOT NULL, -- SHA-256 hash dari PIN + Salt
    salt TEXT NOT NULL,     -- Salt unik untuk hashing
    role TEXT NOT NULL DEFAULT 'teacher', -- 'admin', 'teacher' (guru), atau 'siswa'
    plain_pin TEXT,         -- PIN teks asli untuk visibilitas admin
    is_document_reviewer INTEGER DEFAULT 0, -- 1 jika Teacher diberikan akses Review
    homeroom_class TEXT NULL, -- Wali kelas untuk kelas tertentu
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: teacher_profiles
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id TEXT PRIMARY KEY, -- UUID
    user_id TEXT UNIQUE NOT NULL, -- Relasi ke users.id
    full_name TEXT NOT NULL,
    nip_nuptk TEXT,
    phone_number TEXT,
    gender TEXT,
    birth_place TEXT,
    birth_date TEXT,
    subjects TEXT, -- JSON array string, e.g., '["Matematika", "Fisika"]'
    avatar_url TEXT, -- Path file di R2 bucket
    cv_url TEXT,     -- Path berkas CV di R2 bucket
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'pending_verification', 'verified', 'rejected'
    bio TEXT,
    custom_fields_json TEXT, -- Menyimpan input form dinamis (JSON object)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Table: students
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nipd TEXT,
    nisn TEXT,
    nik TEXT,
    name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    class_id INTEGER NULL REFERENCES classes(id),
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'graduated'
    graduation_year TEXT NULL,
    graduation_date TEXT NULL,
    graduation_status TEXT NULL,
    photo_url TEXT NULL,
    birth_place TEXT,
    birth_date TEXT,
    gender TEXT, -- 'Laki-Laki' / 'Perempuan'
    religion TEXT, -- 'Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu', 'Lainnya'
    entry_date TEXT, -- Tanggal Masuk Sekolah 'dd/mm/yyyy'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: student_parents
CREATE TABLE IF NOT EXISTS student_parents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL UNIQUE,
    father_name TEXT,
    is_father_alive INTEGER DEFAULT 1,
    mother_name TEXT,
    is_mother_alive INTEGER DEFAULT 1,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 5. Table: student_documents
CREATE TABLE IF NOT EXISTS student_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('akte_kelahiran', 'kartu_keluarga', 'foto')),
    file_path TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
    rejection_note TEXT,
    reviewed_by TEXT,
    reviewed_at DATETIME,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(student_id, doc_type)
);

-- 5B. Table: student_document_permissions
CREATE TABLE IF NOT EXISTS student_document_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  doc_type TEXT NOT NULL CHECK(doc_type IN ('akte_kelahiran','kartu_keluarga','foto')),
  is_allowed INTEGER NOT NULL DEFAULT 0,
  granted_by TEXT,
  granted_at DATETIME,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(student_id, doc_type)
);

-- 6. Table: portal_audit_logs (Audit Log for Admin)
CREATE TABLE IF NOT EXISTS portal_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL, -- 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'UPDATE', etc.
    status TEXT NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'INFO'
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table: active_sessions (Real-time Online Users tracking)
CREATE TABLE IF NOT EXISTS active_sessions (
    user_id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    avatar_url TEXT,
    ip_address TEXT,
    last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_name);
CREATE INDEX IF NOT EXISTS idx_students_nisn ON students(nisn);
CREATE INDEX IF NOT EXISTS idx_student_docs_student ON student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_portal_audit_logs_created ON portal_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_portal_audit_logs_user ON portal_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_seen ON active_sessions(last_seen_at);

-- SEED DATA --
INSERT OR IGNORE INTO users (id, pin_hash, salt, role, plain_pin) VALUES
('ADMIN01', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'salt123', 'admin', 'admin123'),
('admin', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'salt123', 'admin', 'admin123'),
('G001', '0624a0dffbeae3d722d515a8c27a29e47d105260742f1f33f6797a78bc57e0fa', 'salt123', 'teacher', 'guru123'),
('guru_wali10a', '0624a0dffbeae3d722d515a8c27a29e47d105260742f1f33f6797a78bc57e0fa', 'salt123', 'teacher', 'guru123'),
('3123456789', 'f8653229b4e1388147d3d2c88f17544e398d28a38d9fefc77d9c6e395ef39686', 'salt123', 'siswa', 'siswa123'),
('3123456790', 'f8653229b4e1388147d3d2c88f17544e398d28a38d9fefc77d9c6e395ef39686', 'salt123', 'siswa', 'siswa123');

INSERT OR IGNORE INTO teacher_profiles (id, user_id, full_name, nip_nuptk, status) VALUES
('tp-g001', 'G001', 'Budi Harjo, S.Pd', '198501012010011001', 'verified'),
('tp-guru10a', 'guru_wali10a', 'Siti Rahmah, M.Pd', '198802022012012002', 'verified');

INSERT OR IGNORE INTO students (id, nisn, name, class_name, photo_url, birth_place, birth_date) VALUES
(1, '3123456789', 'Ahmad Rizky Pratama', '10-A', NULL, 'Jakarta', '2008-05-14'),
(2, '3123456790', 'Siti Nurhaliza', '10-A', NULL, 'Bandung', '2008-08-20'),
(3, '3123456791', 'Budi Santoso', '10-B', NULL, 'Surabaya', '2008-01-10');


-- 8. Table: app_settings (Sistem Pengaturan / Feature Flags Admin)
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Settings jika belum ada
INSERT OR IGNORE INTO app_settings (key, value, description) VALUES
('allow_photo_upload', '1', 'Izinkan pengunggahan foto profil siswa (1 = Ya, 0 = Nonaktif/Dibatasi)'),
('allow_akte_upload', '1', 'Izinkan pengunggahan berkas Akte Kelahiran siswa (1 = Ya, 0 = Nonaktif/Dibatasi)'),
('allow_kk_upload', '1', 'Izinkan pengunggahan berkas Kartu Keluarga siswa (1 = Ya, 0 = Nonaktif/Dibatasi)'),
('teacher_delete_photo', '0', 'Izinkan Guru (Teacher) menghapus foto profil siswa (1 = Ya, 0 = Tidak/Terlarang)'),
('teacher_delete_kk', '0', 'Izinkan Guru (Teacher) menghapus berkas Kartu Keluarga (1 = Ya, 0 = Tidak/Terlarang)'),
('teacher_delete_akte', '0', 'Izinkan Guru (Teacher) menghapus berkas Akte Kelahiran (1 = Ya, 0 = Tidak/Terlarang)');


-- 9. Table: priority_students (Siswa Prioritas / Keperluan Mendesak)
CREATE TABLE IF NOT EXISTS priority_students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL UNIQUE,
    notes TEXT,                        -- Catatan / Instruksi dari Admin
    required_photo INTEGER DEFAULT 0,  -- 1 jika foto profil wajib dilengkapi
    required_kk INTEGER DEFAULT 0,     -- 1 jika Kartu Keluarga wajib diunggah
    required_akte INTEGER DEFAULT 0,   -- 1 jika Akte Kelahiran wajib diunggah
    created_by TEXT,                   -- User ID Admin yang menambahkan
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 10. Table: classes (Master Data Kelas & Kenaikan Kelas)
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    level INTEGER NOT NULL,
    next_class_id INTEGER NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (next_class_id) REFERENCES classes(id)
);

-- Seed Data Kelas 1 s/d Kelas 6
INSERT OR IGNORE INTO classes (id, name, level, next_class_id, description) VALUES
(1, 'Kelas 1', 1, 2, 'Tingkat 1 SD'),
(2, 'Kelas 2', 2, 3, 'Tingkat 2 SD'),
(3, 'Kelas 3', 3, 4, 'Tingkat 3 SD'),
(4, 'Kelas 4', 4, 5, 'Tingkat 4 SD'),
(5, 'Kelas 5', 5, 6, 'Tingkat 5 SD'),
(6, 'Kelas 6', 6, NULL, 'Tingkat 6 SD (Tingkat Akhir)');

-- 11. Table: student_class_history (Riwayat Kenaikan Kelas & Kelulusan)
CREATE TABLE IF NOT EXISTS student_class_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    from_class_id INTEGER NULL,
    to_class_id INTEGER NULL,
    academic_year TEXT NULL,
    status TEXT NOT NULL, -- 'promoted', 'graduated'
    processed_by TEXT NOT NULL,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (from_class_id) REFERENCES classes(id),
    FOREIGN KEY (to_class_id) REFERENCES classes(id)
);

CREATE INDEX IF NOT EXISTS idx_class_history_student ON student_class_history(student_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- 12. Table: student_document_submissions (History/log of document uploads)
CREATE TABLE IF NOT EXISTS student_document_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    doc_type TEXT NOT NULL CHECK(doc_type IN ('akte_kelahiran', 'kartu_keluarga', 'foto')),
    file_path TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    rejection_note TEXT,
    submitted_by TEXT,
    reviewed_by TEXT,
    reviewed_at DATETIME,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_doc_subs_student ON student_document_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_doc_subs_status ON student_document_submissions(status);

-- 13. Table: student_mutations (Pendataan Mutasi Siswa: Pindah Sekolah / Tidak Bersekolah)
CREATE TABLE IF NOT EXISTS student_mutations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    mutation_type TEXT NOT NULL CHECK (mutation_type IN ('pindah_sekolah', 'tidak_bersekolah')),
    mutation_date TEXT NOT NULL,
    reason TEXT NOT NULL,
    destination_school TEXT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_note TEXT NULL,
    reviewed_by TEXT NULL,
    reviewed_at DATETIME NULL,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_student_mutations_student ON student_mutations(student_id);
CREATE INDEX IF NOT EXISTS idx_student_mutations_status ON student_mutations(status);
