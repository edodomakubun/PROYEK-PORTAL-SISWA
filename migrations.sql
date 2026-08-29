ALTER TABLE users ADD COLUMN is_document_reviewer INTEGER DEFAULT 0;
ALTER TABLE student_documents ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE student_documents ADD COLUMN rejection_note TEXT;
ALTER TABLE student_documents ADD COLUMN reviewed_by TEXT;
ALTER TABLE student_documents ADD COLUMN reviewed_at DATETIME;

CREATE TABLE IF NOT EXISTS student_document_permissions (
    student_id INTEGER NOT NULL,
    document_type TEXT NOT NULL,
    is_allowed INTEGER NOT NULL DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, document_type),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
