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

-- Seed existing documents from student_documents table
INSERT INTO student_document_submissions (student_id, doc_type, file_path, file_url, status, rejection_note, reviewed_by, reviewed_at, uploaded_at)
SELECT student_id, doc_type, file_path, file_url, status, rejection_note, reviewed_by, reviewed_at, uploaded_at
FROM student_documents;
