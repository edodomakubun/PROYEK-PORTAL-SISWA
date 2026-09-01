-- Migration script to add new student attributes: gender, religion, and entry_date
ALTER TABLE students ADD COLUMN gender TEXT;
ALTER TABLE students ADD COLUMN religion TEXT;
ALTER TABLE students ADD COLUMN entry_date TEXT;
