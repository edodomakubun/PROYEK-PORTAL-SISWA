PRAGMA foreign_keys=OFF;

-- 1. Rename existing table
ALTER TABLE student_documents RENAME TO student_documents_old;

-- 2. Create the new table with correct schema (allowing NULL for file_path and file_url)
CREATE TABLE student_documents (
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

-- 3. Copy data from old table to new table
INSERT INTO student_documents (
    id, student_id, doc_type, file_path, file_url, status, 
    rejection_note, reviewed_by, reviewed_at, uploaded_at
)
SELECT 
    id, student_id, doc_type, file_path, file_url, status, 
    rejection_note, reviewed_by, reviewed_at, uploaded_at
FROM student_documents_old;

-- 4. Drop old table
DROP TABLE student_documents_old;

-- 5. Recreate index
CREATE INDEX IF NOT EXISTS idx_student_docs_student ON student_documents(student_id);

PRAGMA foreign_keys=ON;
