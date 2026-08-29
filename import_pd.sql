-- SQL Import Script generated from DataPD.xlsx
DROP TABLE IF EXISTS student_documents;
DROP TABLE IF EXISTS student_parents;
DROP TABLE IF EXISTS students;
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nipd TEXT,
    nisn TEXT,
    nik TEXT,
    name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    photo_url TEXT NULL,
    birth_place TEXT,
    birth_date TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE student_parents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL UNIQUE,
    father_name TEXT,
    is_father_alive INTEGER DEFAULT 1,
    mother_name TEXT,
    is_mother_alive INTEGER DEFAULT 1,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
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
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (1, '262001', NULL, '9109016704200002', 'Aprilia Erni Reinhard', 'KELAS 1', NULL, 'Timika', '2020-04-27', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (1, 'Ferdy A C. Reinhard', 1, 'Lusiana Novita Urath', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (2, '262002', NULL, '8103057012200001', 'Arentina Theresya Saiselar', 'KELAS 1', NULL, 'Lelingluan', '2020-12-30', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (2, 'Pelpianus Saiselar', 1, 'Ice Trisnawati Masrikat', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (3, '261003', NULL, '8171011608200001', 'Ayres Grey Wermasubun', 'KELAS 1', NULL, 'Ambon', '2020-08-16', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (3, 'Septhuyanus Wolter Wermasubun', 1, 'Lidia Sarah Sambono', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (4, '261004', NULL, '8103052003200002', 'BILLY JESSY HALURUK', 'KELAS 1', NULL, 'Larat', '2020-03-20', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (4, 'BENDRIKS HALURUK', 1, 'SULCE  WESSY', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (5, '261005', NULL, '8103052601200001', 'Bendiktus Elath', 'KELAS 1', NULL, 'Lelingluan', '2020-01-26', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (5, 'Izak Elath', 1, 'Yosinta Ngobut', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (6, '262006', NULL, '8103054207200001', 'Berlinda juliet Ibur', 'KELAS 1', NULL, 'Larat', '2020-07-02', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (6, 'Jefry Ibur', 1, 'Serly Urath', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (7, '262007', NULL, '8103056706200001', 'Ceyferlin Callysta Belwawin', 'KELAS 1', NULL, 'Saumlaki', '2020-06-27', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (7, 'Yakob Belwawin', 1, 'Miryam Yuliyana Lololuan', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (8, '262008', NULL, '8103055511200002', 'DEFTIKA MENTARI RATILA', 'KELAS 1', NULL, 'Lelingluan', '2020-11-15', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (8, 'DEFRANGKO RATILA', 1, 'NOVITA ITRANDULAN', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (9, '261009', NULL, '8103051303200001', 'Lodicwillzon Elath', 'KELAS 1', NULL, 'Lelingluan', '2020-03-13', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (9, 'Yunus Elath', 1, 'Theodora Masela', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (10, '262010', NULL, '8103086505200001', 'MELTHINA ITRANDULAN', 'KELAS 1', NULL, 'Lelingluan', '2020-05-25', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (10, 'ALBERTHUS ITRANDULAN', 1, 'NOVIANTI MASTIKAT', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (11, '262011', NULL, '8103055906200002', 'Maria Kristin Kormasela', 'KELAS 1', NULL, 'Lelingluan', '2020-06-19', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (11, 'Korneles Nandito Kormasela', 1, 'Fransiska Seralurin', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (12, '262012', NULL, '8103054408200001', 'ONA VIA ORATMAMGUN', 'KELAS 1', NULL, 'waturu', '2020-08-04', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (12, 'DARMA DARLING ORATMANGUN', 1, 'GULYEN RUMLELY', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (13, '262013', NULL, '8103056406200001', 'Rina Metaloy', 'KELAS 1', NULL, 'Lelingluan', '2020-05-24', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (13, 'Silyanus Metaloy', 1, 'Paulina Ratissa', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (14, '262014', NULL, '8103056802200001', 'SELPISINA LEASA', 'KELAS 1', NULL, 'Larat', '2020-02-28', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (14, 'SIMSON LEASA', 1, 'ERTI YULIANA LEHA', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (15, '261015', NULL, '8103010410200001', 'THIO KENZO POLIBU', 'KELAS 1', NULL, 'Saumlaki', '2020-10-04', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (15, 'VICTOOR EDYSON POLIBU', 1, 'GRESTY HAURISSA', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (16, '262016', NULL, '8103054301200002', 'Yosepina Sanaty', 'KELAS 1', NULL, 'Saumlaki', '2020-01-03', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (16, 'Lewi Sanaty', 1, 'Yosefina Sanaty', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (17, '251001', '3193145920', '8103056010970004', 'Adeniram Serang', 'KELAS 2', NULL, 'Lelingluan', '2019-02-19', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (17, 'Agustinus Petrus Serang', 1, 'Serli Endangsari Lodarmase', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (18, '251002', '3197150936', '8103054305800002', 'Agustinus Ismael Saiselar', 'KELAS 2', NULL, 'Lelingluan', '2019-05-22', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (18, 'Jonisius Abraham Saiselar', 1, 'MERLIN YUDITH PAUNO', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (19, '251003', '3191641200', '8103055506840001', 'Alexanders Arnaldo Masrikat', 'KELAS 2', NULL, 'Lelingluan', '2019-09-17', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (19, 'Frans Daniel Masrikat', 1, 'Rachel Martina Refualu', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (20, '251004', '3184709189', '8108074504920001', 'Brian Yosep Ongirwalu', 'KELAS 2', NULL, 'Lelingluan', '2018-07-29', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (20, 'Nicolaus Ongirwalu', 1, 'Delcy Saununu', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (21, '252005', '3194896378', '8103055808780001', 'Costavina Vania Batkormbawa', 'KELAS 2', NULL, 'Saumlaki', '2019-02-09', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (21, 'Kalfein Slamet Batkormbawa', 1, 'Korlina Rangkoratat', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (22, '252006', '3196334109', '8103054606040001', 'Dina Maselarenan Elath', 'KELAS 2', NULL, 'Lelingluan', '2019-03-11', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (22, 'Petrus Elath', 1, 'Britny Susana Nifmassa', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (23, '252007', '3190790193', '8103074107000002', 'Ester Filimditi', 'KELAS 2', NULL, 'Lelingluan', '2019-10-05', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (23, 'Anthony Filimditi', 1, 'Yulita Wuarlela', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (24, '252008', '3195967171', '8103055109690001', 'Fania Fien Walun', 'KELAS 2', NULL, 'Ambon', '2019-03-13', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (24, 'Alexander Walun', 1, 'Antoneta Raatburu', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (25, '251009', '3198839496', '8103055208880001', 'Ferly Philipus Metaloy', 'KELAS 2', NULL, 'Larat', '2019-01-25', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (25, 'Yudo Prakoso Metaloy', 1, 'Deriana Yobelina Titioka', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (26, '252010', '3196612806', '8103056505980001', 'Henrika Kawarnidi', 'KELAS 2', NULL, 'Lelingluan', '2019-09-10', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (26, 'Davit Kawarnidi', 1, 'Wehelmina Kormasela', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (27, '251011', '3194371687', '8103056402960001', 'Herman Amarduan', 'KELAS 2', NULL, 'Larat', '2019-02-05', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (27, 'Yordan Amarduan', 1, 'Florida Hayati Wessy', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (28, '251012', '3191051609', '8103055009810001', 'Herry Walun', 'KELAS 2', NULL, 'Lelingluan', '2019-05-12', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (28, 'Kristofol Walun', 1, 'Rahel Masela', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (29, '251013', '3199519130', '8103055711940001', 'Jems Pablo Lodarmase', 'KELAS 2', NULL, 'Lelingluan', '2019-07-13', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (29, 'Yordan Lodarmase', 1, 'Orpa Metiaman', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (30, '251014', '3195581229', '8103055402910004', 'Joel Aprilio Metiaman', 'KELAS 2', NULL, 'Larat', '2019-04-25', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (30, 'Leo Matias Metiaman', 1, 'Welmince Bilmaskosu', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (31, '251015', '3198109479', '8171014403880005', 'Jonas Glodwyq Metiaman', 'KELAS 2', NULL, 'Kepulauan Tanimbar', '2019-09-19', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (31, 'Aleksander Metiaman', 1, 'Yokbeth Yolina Wisye Wessy', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (32, '251016', '3198478510', '8103055109770001', 'Jonathan Metiaman', 'KELAS 2', NULL, 'Lelingluan', '2019-04-16', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (32, 'Paulus Metiaman', 1, 'Dina Metiaman', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (33, '252017', '3182529473', '8103056608780001', 'Kasandra Jelia Ibur', 'KELAS 2', NULL, 'Lelingluan', '2018-12-22', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (33, 'Joksan Ibur', 1, 'Alida Beljaky', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (34, '251018', '3188164255', NULL, 'Lorens Urath', 'KELAS 2', NULL, 'Yahukimo', '2018-11-07', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (34, 'Steven Urath', 1, 'Regina Ohoiwutun', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (35, '252019', '3198876120', '8103055107660002', 'Margarita Shiren Raatburu', 'KELAS 2', NULL, 'Lelingluan', '2019-02-11', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (35, 'Yakob Raatburu', 1, 'Yulita Somalay', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (36, '252020', '3194019342', '8103055705900004', 'Maxiana Juniati Ratila', 'KELAS 2', NULL, 'Lelingluan', '2019-06-29', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (36, 'Yunus Thomas Ratila', 1, 'Jois Josefina Metiaman', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (37, '252021', '3182090086', '8103066306940001', 'Olifia Termutis Batlayar', 'KELAS 2', NULL, 'Timika', '2018-11-07', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (37, 'Yustinus. TH. A.E Batlayar', 1, 'Imelda Susy Santy Lodar', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (38, '251022', '3199794236', NULL, 'Petrus Maswekan Urath', 'KELAS 2', NULL, 'Yahukimo', '2019-09-25', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (38, 'Steven Urath', 1, 'Regina Ohoiwutun', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (39, '251023', '3194519197', '8103044608020002', 'Petrus Rian Metiaman', 'KELAS 2', NULL, 'Lelingluan', '2019-03-13', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (39, 'Alexsander Ever Benhur Metiaman', 1, 'Susanti Seralurin', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (40, '252024', '3180068970', '8103054505840001', 'Ripka Batserin', 'KELAS 2', NULL, 'Lelingluan', '2018-12-31', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (40, 'Apner Batserin', 1, 'Yohana Yulita Manutilaa', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (41, '252025', '3193969905', '8103055205890001', 'Sipora Walun', 'KELAS 2', NULL, 'Lelingluan', '2019-06-18', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (41, 'Fredik D.Walun', 1, 'Salomina Martafina Batkunda', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (42, '252026', '3193937782', '8103055303990001', 'Yosina Kormasela', 'KELAS 2', NULL, 'Larat', '2019-02-07', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (42, 'Korneles Nandito Kormasela', 1, 'Fransiska Seralurin', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (43, '252027', '3198691301', '8103054611900003', 'Yuliana Urath', 'KELAS 2', NULL, 'Larat', '2019-12-09', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (43, 'Yanes Urath', 1, 'Elsy Baranyanan', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (44, '241001', '3172184200', '8103056910850001', 'ALEXSUS ELATH', 'KELAS 3', NULL, 'Lelingluan', '2017-06-18', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (44, 'YABES ELATH', 1, 'DEVROSA RAHANKEY', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (45, '241002', '3186011412', NULL, 'ALJON BOY SAISELAR', 'KELAS 3', NULL, 'LELINGLUAN', '2018-10-25', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (45, NULL, 1, 'BARBALINA WALUN', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (46, '242003', '3188190792', NULL, 'CHRISTINA URATH', 'KELAS 3', NULL, 'NIKI -NIKI', '2018-07-29', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (46, NULL, 1, 'NOFRIANTI TITI TAEK', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (47, '242004', '3181313859', NULL, 'ENGGELINA SANATY', 'KELAS 3', NULL, 'LARAT', '2018-10-24', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (47, NULL, 1, 'JULIANA MANUTILAA', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (48, '241005', '3187436597', NULL, 'FROBEL ARISON ELATH', 'KELAS 3', NULL, 'AMBON', '2018-05-04', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (48, NULL, 1, 'THEODORA MASELA', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (49, '241006', '3180015300', NULL, 'GREDHY YOHANES POLIBU', 'KELAS 3', NULL, 'SAUMLAKI', '2018-04-08', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (49, NULL, 1, 'GRESTY HAURISSA', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (50, '241007', '3173322683', '8103056607820001', 'Gilberth D. Resimaran', 'KELAS 3', NULL, 'Lelingluan', '2017-09-13', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (50, 'Petrus Resimaran', 1, 'KALASINA LUTURMAS', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (51, '242008', '3172408116', NULL, 'JULEHA ORATMANGUN', 'KELAS 3', NULL, 'LELINGLUAN', '2017-05-18', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (51, NULL, 1, 'MARTENCI ORATMANGUN', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (52, '241009', '3169782744', NULL, 'Jusuf Nikolas Ratissa', 'KELAS 3', NULL, 'SAUMLAKI', '2016-05-12', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (52, NULL, 1, 'Naomi Londin', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (53, '241010', '3180519248', NULL, 'KRISTIAN ROMAN URATH', 'KELAS 3', NULL, 'LELINGLUAN', '2018-03-04', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (53, NULL, 1, 'MARTENCI SINDENENA MASRIKAT', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (54, '242011', '3183335017', NULL, 'LEVINA YOSINA RESIMANUK', 'KELAS 3', NULL, 'LELINGLUAN', '2018-01-07', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (54, NULL, 1, 'BLANDINA ORAILE', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (55, '242012', '3181766571', NULL, 'LILY ANDOLIN SARUNING', 'KELAS 3', NULL, 'OHOIRA', '2018-11-08', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (55, NULL, 1, 'ADELHEID RENJAAN', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (56, '242013', '3175266198', NULL, 'MARIA PUTRI RESIMARIN', 'KELAS 3', NULL, 'LELINGLUAN', '2017-07-16', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (56, NULL, 1, 'DOLFINA RATISSA', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (57, '242014', '3185015896', NULL, 'MARTINA CHRISMENDA REINHARD', 'KELAS 3', NULL, 'TIMIKA', '2018-07-26', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (57, NULL, 1, 'LUSIANA NOVITA URATH', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (58, '241015', '3189303209', NULL, 'MELKIANUS RATILA', 'KELAS 3', NULL, 'SAUMLAKI', '2018-05-28', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (58, NULL, 1, 'MARITA YONETA SAIKMATA', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (59, '242016', '3183680411', NULL, 'NANCY TAMATA', 'KELAS 3', NULL, 'KAINARA', '2018-01-31', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (59, NULL, 1, 'MARYANTI PENINA SALOY', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (60, '242017', '3184186806', NULL, 'NIFELIN NENI ERUBUN', 'KELAS 3', NULL, 'LELINGLUAN', '2018-05-31', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (60, NULL, 1, 'ROSANA MELABESSY', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (61, '241018', '3153531596', '8103064207780001', 'ONISIMUS RATISA', 'KELAS 3', NULL, 'Saumlaki', '2015-12-08', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (61, 'LASARUS RATISA', 1, 'NAOMI LONDIN', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (62, '241019', '3179996572', NULL, 'PETRUS YUSUPH MATRUTY', 'KELAS 3', NULL, 'LELINGLUAN', '2017-03-09', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (62, NULL, 1, NULL, 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (63, '242020', '3182786025', NULL, 'Putri Fina Yambormias', 'KELAS 3', NULL, 'LELINGLUAN', '2018-03-11', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (63, NULL, 1, 'Wehelmina Manutilaa', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (64, '242021', '3174030417', '8103066207990001', 'Rosalia Metaloy', 'KELAS 3', NULL, 'Lelingluan', '2017-11-21', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (64, 'Silyanus Metaloy', 1, 'Paulina Ratissa', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (65, '242022', '3188762046', NULL, 'SARAH FILIMDITI', 'KELAS 3', NULL, 'LELINGLUAN', '2018-12-11', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (65, NULL, 1, 'ANGGANITA ORATMANGUN', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (66, '242023', '3181731973', NULL, 'TITI JESIKA ELATH', 'KELAS 3', NULL, 'LELINGLUAN', '2018-02-02', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (66, NULL, 1, 'Yosinta Ngobut', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (67, '231001', '3171914497', '8103090912940002', 'Aliando Mesak Hendra Walun', 'KELAS 4A', NULL, 'Arma', '2017-06-21', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (67, 'Menase Walun', 1, 'Merap Jambormias', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (68, '231002', '3161577169', NULL, 'Alvaro Gavrielly Anandito Susu', 'KELAS 4A', NULL, 'BATAM', '2016-09-26', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (68, NULL, 1, 'Jomima Ratissa', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (69, '231003', '3168832435', '8103055808780002', 'Denies Metanfanuan', 'KELAS 4A', NULL, 'Lelingluan', '2016-12-03', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (69, 'Negara Metanfanuan', 1, 'Adonia Lalin', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (70, '231004', '3179925848', '8103056402960002', 'ELISA ELYANDO AMARDUAN', 'KELAS 4A', NULL, 'BENJINA', '2017-02-08', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (70, 'YORDAN AMARDUAN', 1, 'FLORIDA HAYATI WESSY', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (71, '231005', '3170974829', '8103054808790001', 'Enos Dodie Lololuan', 'KELAS 4A', NULL, 'Lelingluan', '2017-12-15', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (71, 'Daniel Lololuan', 1, 'Welmince Rahakbau', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (72, '232006', '3173033493', '8103056903940002', 'GABRIELA MIEN WALUN', 'KELAS 4A', NULL, 'SAUMLAKI', '2017-03-27', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (72, 'BRUCE BRENS WALUN', 1, 'KAROLINA BELYAKY', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (73, '232007', '3173819560', '8103056505980001', 'Imel Marsya Kawarnidi', 'KELAS 4A', NULL, 'Lelingluan', '2017-05-17', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (73, 'Dafid Kawardini', 1, 'WEHELMINA KORMASELA', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (74, '232008', '3169334238', NULL, 'LEONORA REVA TAMATA', 'KELAS 4A', NULL, 'LELINGLUAN', '2016-06-21', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (74, NULL, 1, 'Barbara Weridity', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (75, '232009', '3169900555', '8103055004880003', 'Naomi Wewu', 'KELAS 4A', NULL, 'Lelingluan', '2016-07-16', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (75, 'Samuel Wewu', 1, 'Dina Diana Yambormias', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (76, '231010', '3169799936', NULL, 'Nikolas Ratissa', 'KELAS 4A', NULL, 'Lelingluan', '2016-12-25', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (76, 'Rein Reson Ratissa', 1, 'Theresia Manutilaa', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (77, '231011', '3173886291', '8103054407900002', 'PAULUS ANDERSON YAMBORMIAS', 'KELAS 4A', NULL, 'LELINGLUAN', '2017-11-16', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (77, 'HENRIKUS YAMBORMIAS', 1, 'SANCE WERMASUBUN', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (78, '232012', '3170575891', '8103055612870001', 'Sintia Vilona Kormasela', 'KELAS 4A', NULL, 'Lelingluan', '2017-06-30', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (78, 'Jefri Kormasela', 1, 'Desiana Hukunala', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (79, '231013', '3173397347', NULL, 'YAMBRES SABONO', 'KELAS 4A', NULL, 'LELINGLUAN', '2017-09-16', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (79, NULL, 1, 'MESKE TAMATA', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (80, '232014', '3175025632', '8103054107990004', 'YULIANA ELATH', 'KELAS 4A', NULL, 'LAMDESAR TIMUR', '2017-05-12', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (80, 'NELSON ELATH', 1, 'YOSEFA NGOBUT', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (81, '232015', '3170907334', '8103054605800005', 'Yermina Nesya Saiselar', 'KELAS 4A', NULL, 'Lelingluan', '2017-08-17', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (81, 'Hengki Saiselar', 1, 'AMELIA MARIA SINGERIN', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (82, '232016', '3171631659', '8103056711870001', 'Yos Gloria Urath', 'KELAS 4A', NULL, 'Lelingluan', '2017-04-01', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (82, 'Samuel Urath', 1, 'Nova Naraha', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (83, '231017', '3178219771', '8103064608020001', 'Albertus Romi Sanaty', 'KELAS 4B', NULL, 'ROMEAN', '2017-04-12', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (83, 'Yustus Titioka Sanaty', 1, 'Antina Talutu', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (84, '232018', '3179706598', '8103055002910001', 'Alisya Norisa Wununara', 'KELAS 4B', NULL, 'Lelingluan', '2017-08-25', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (84, 'Anat Nang Wununara', 1, 'Penina Walun', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (85, '232019', '3176401731', '8103055808840001', 'Clara Martha Resimaran', 'KELAS 4B', NULL, 'Lelingluan', '2017-11-27', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (85, 'Jony Resimaran', 1, 'Hulda Metaloy', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (86, '231020', '3184928267', NULL, 'EKARDO F.KAFROLY', 'KELAS 4B', NULL, 'LARAT', '2018-05-15', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (86, NULL, 1, 'LUDIA METALOY', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (87, '232021', '3170770806', '8103027101970002', 'Enjel Erna Rena Urath', 'KELAS 4B', NULL, 'Lelingluan', '2017-04-11', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (87, 'Yoel Oktafyo Urath', 1, 'Martenci Sindenena Masrikat', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (88, '231022', '3176532029', '8103056010970004', 'Gabriel Serang', 'KELAS 4B', NULL, 'Lelingluan', '2017-04-03', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (88, 'Agustinus Petrus Serang', 1, 'Serli Endangsari Lodarmase', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (89, '232023', '3171631256', '8103054906120001', 'IMANUEL GASPAR ELATH', 'KELAS 4B', NULL, 'LELINGLUAN', '2017-04-27', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (89, 'IZAK ELATH', 1, 'Yosinta Ngobut', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (90, '231024', '3174044996', '8103055102820001', 'KAKA DIERESTA SOMALAY', 'KELAS 4B', NULL, 'LELINGLUAN', '2017-07-02', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (90, 'KRISTIAN SOMALAY', 1, 'BERTHA RANGKOW', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (91, '232025', '3169536073', '8103054208910001', 'Lourens Matruty', 'KELAS 4B', NULL, 'Lelingluan', '2016-01-21', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (91, 'Frangki Matruty', 1, 'DERINA MATRUTY', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (92, '232026', '3179449724', '8103055006850001', 'Nelci Urath', 'KELAS 4B', NULL, 'Lelingluan', '2017-06-09', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (92, 'Fiktor Urath', 1, 'Salomina Martha Tamata', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (93, '231027', '3164956087', '8103056408940002', 'Nikolas Yunus Ibur', 'KELAS 4B', NULL, 'Lelingluan', '2016-06-27', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (93, 'Yansen Ibur', 1, 'ROSA DELIMA MATRUTY', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (94, '231028', '3171583318', '8103012002990001', 'RENO THECALNO MASRIAT', 'KELAS 4B', NULL, 'SAUMLAKI', '2017-11-14', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (94, 'RAFAEL SALEMBUN', 1, 'NELVIN MASRIAT', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (95, '231029', '3161902257', '8103056010920002', 'Welson Metaloy', 'KELAS 4B', NULL, 'Lelingluan', '2016-07-18', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (95, 'Yulyanus Metaloy', 1, 'Maryam Wuarlela', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (96, '231030', '3169032095', '8103056006860001', 'YANCE ANDITO RESIMARAN', 'KELAS 4B', NULL, 'Lelingluan', '2016-11-16', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (96, 'Yusup Resimaran', 1, 'ARYATI MELTIDA LAIYAN', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (97, '232031', '3172634029', '8103056401910001', 'YOHANA RATILA', 'KELAS 4B', NULL, 'LELINGLUAN', '2017-03-26', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (97, 'ERWIN RATILA', 1, 'MARITA YONETA SAIKMATA', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (98, '222001', '3160302602', NULL, 'Bunga Meitty Reinhard', 'KELAS 5', NULL, 'TUAL', '2016-06-11', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (98, NULL, 1, 'Lusiana Novita Urath', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (99, '221002', '3167276036', '8102094408900001', 'Dani Yusup Titirloloby', 'KELAS 5', NULL, 'LELINGLUAN', '2016-03-30', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (99, 'RIKARLY TITIRLOLOBY', 1, 'DORCI MODESTA OHOILULIN', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (100, '221003', '3163791368', '8103055305640001', 'Geraldo R. Lambiombir', 'KELAS 5', NULL, 'Lelingluan', '2016-03-26', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (100, 'Daniel Lambiombir', 1, 'RAHEL YULITA RATILA', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (101, '221004', '3168487252', '8103055808870002', 'Hendrik Belyaky', 'KELAS 5', NULL, 'Lelingluan', '2016-04-24', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (101, 'Dandels Beljaky', 1, 'Kristina Saiselar', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (102, '221005', '3169337505', '8103054305900002', 'Henrik Saiselar', 'KELAS 5', NULL, 'Lelingluan', '2016-03-24', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (102, 'Jonisius Abraham Saiselar', 1, 'Merlin Yudith Pauno', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (103, '221006', '3175046545', '8103054111910003', 'IGNATIUS MASMASIHIN SAISELAR', 'KELAS 5', NULL, 'Lelingluan', '2016-11-05', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (103, 'ROKY NIKODEMUS SAISELAR', 1, 'Barbalina Walun', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (104, '221007', '3166636531', '8103056008960001', 'Nimbrot Putra Mosse', 'KELAS 5', NULL, 'Larat', '2016-10-05', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (104, 'Yulius Mosse', 1, 'Marthina Waturu', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (105, '222008', '3168896968', '8103055007870001', 'Sarlina Fika Resimaran', 'KELAS 5', NULL, 'Lelingluan', '2016-04-13', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (105, 'Jakop Josep Resimaran', 1, 'Dolfina Ratissa', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (106, '221009', '3161601326', NULL, 'YOHANES YAMBORMIAS', 'KELAS 5', NULL, 'LELINGLUAN', '2016-04-30', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (106, NULL, 1, 'SANCE WERMASUBUN', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (107, '222010', '3156831507', '8103056404780001', 'YOSINA ANACI NARMO', 'KELAS 5', NULL, 'TUAL', '2015-07-02', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (107, 'YONAS NARMO', 1, 'SUSANA NARMO', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (108, '211001', '3158593344', NULL, 'ANDI BELWAWIN', 'KELAS 6', NULL, 'Lelingluan', '2015-05-16', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (108, NULL, 1, 'WISYE REFWALU', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (109, '212002', '3144118517', NULL, 'DINCE SABONO', 'KELAS 6', NULL, 'Lelingluan', '2014-11-30', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (109, NULL, 1, 'MESKE TAMATA', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (110, '211003', '3155061182', NULL, 'DOMINGGUS GONTY BELJAKY', 'KELAS 6', NULL, 'Lelingluan', '2015-07-24', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (110, NULL, 1, 'Naomi Hayer', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (111, '211004', '3145944148', '8103055109770001', 'Dandri Metiaman', 'KELAS 6', NULL, 'Lelingluan', '2014-09-19', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (111, 'Paulus Metiaman', 1, 'Dina Metiaman', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (112, '211005', '3158025494', '8103056607820001', 'Frets Resimaran', 'KELAS 6', NULL, 'Lelingluan', '2015-06-16', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (112, 'Petrus Resimaran', 1, 'Kalasina Luturmas', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (113, '212006', '3139291788', '8103054103940002', 'LOISA TABITA TAMATA', 'KELAS 6', NULL, 'KAINARA', '2014-08-20', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (113, 'Alex Tamata', 1, 'MARYANTI PENINA SALOY', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (114, '212007', '3158481861', NULL, 'Livia Lorina  Itrandulan', 'KELAS 6', NULL, 'Lelingluan', '2015-09-05', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (114, NULL, 1, 'NOVIANTI MASRIKAT', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (115, '212008', '3151407894', NULL, 'MARLENI MASRIKAT', 'KELAS 6', NULL, 'Lelingluan', '2015-02-24', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (115, NULL, 1, 'FEBIOLA FILIMDITI', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (116, '212009', '3156753602', '8103090912940002', 'NATALIA SELVI WALUN', 'KELAS 6', NULL, 'Larat', '2015-12-25', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (116, 'Menase Walun', 1, 'Merap Jambormias', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (117, '211010', '3141382009', NULL, 'NIKOLAS ANGORMAS', 'KELAS 6', NULL, 'Lelingluan', '2016-01-12', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (117, NULL, 1, 'HERLINCE LEMAN', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (118, '211011', '3147967708', NULL, 'RESHA FRANGKY WUNUNARA', 'KELAS 6', NULL, 'Seira', '2014-03-28', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (118, NULL, 1, 'PENINA WALUN', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (119, '211012', '3157308734', NULL, 'SARLY YOSIAS SANATY', 'KELAS 6', NULL, 'Lelingluan', '2015-10-15', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (119, NULL, 1, 'BATSEBA NIFMASA', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (120, '212013', '3158215801', '8103057005790001', 'SELVI KORMASELA', 'KELAS 6', NULL, 'LELINGLUAN', '2015-05-19', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (120, 'SIMRAM KORMASELA', 1, 'IMELDA LAMERE', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (121, '211014', '3144337216', '8103056505790001', 'Soferet Domakubun', 'KELAS 6', NULL, 'Lelingluan', '2014-11-15', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (121, 'Petrus Domakubun', 1, 'Lenora Domakubun', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (122, '211015', '0153538211', '8103054108840002', 'Soferet Jofan Wuarlela', 'KELAS 6', NULL, 'Lelingluan', '2015-03-21', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (122, 'Naheson Wuarlela', 1, 'Leni Fransina Walun', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (123, '211016', '3143229644', '8103054810830002', 'YAKOBUS KAREL BATKUNDA', 'KELAS 6', NULL, 'Lelingluan', '2014-10-25', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (123, 'Yakonias Batkunda', 1, 'Karolina Angormas', 1);
INSERT INTO students (id, nipd, nisn, nik, name, class_name, photo_url, birth_place, birth_date, address) VALUES (124, '212017', '3149098853', '8103054810830002', 'YESI BATKUNDA', 'KELAS 6', NULL, 'Lelingluan', '2014-10-25', NULL);
INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive) VALUES (124, 'Yakonias Batkunda', 1, 'Karolina Angormas', 1);