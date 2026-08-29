import { Hono } from 'hono';
import { AuditLog, Env, HonoVariables, MasterClass, OnlineUser, PriorityStudent, Student, StudentClassHistory, StudentDocument, StudentMutation, User } from './types';
import { authMiddleware, getClientIp, getCurrentUser, getUserAgent, logAudit, loginUser, logoutUser, updateActiveSession, hashPin } from './auth';
import { renderAuditLogPage, renderDashboardPage, renderImportPage, renderLayout, renderLoginPage, renderStudentDetailPage, renderStudentListPage, renderSetupAccountsPage, renderAdminSettingsPage, renderPrintCardsPage, renderForgotPasswordPage, renderPriorityStudentsPage, renderMutationsPage, renderPromotionPage, renderGraduatedStudentsPage, renderGraduatedStudentDetailPage, renderDocumentReviewPage, renderDocumentSubmissionsPage, renderHomeroomManagementPage, renderGuidePage, renderErrorPage } from './views/templates';
import * as XLSX from 'xlsx';

const app = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

// Global Error Handler for Detailed Server Error Debugging
app.onError((err, c) => {
  console.error('Unhandled Application Error:', err);
  const user = c.get('user');
  const errorDetails = err instanceof Error ? err.stack || err.message : String(err);
  return c.html(renderErrorPage(500, 'Terjadi Kesalahan Server', 'Sistem mengalami kendala saat memproses permintaan Anda.', errorDetails, user), 500);
});

app.notFound((c) => {
  const user = c.get('user');
  return c.html(renderErrorPage(404, 'Halaman Tidak Ditemukan', 'Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.', undefined, user), 404);
});


// ----------------------------------------------------
// Static Assets Route (Serving AdminLTE template files from dist/)
// ----------------------------------------------------
app.get('/favicon.ico', (c) => {
  c.header('Content-Type', 'image/svg+xml');
  return c.body(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#4f46e5"/><text y=".72em" x=".1em" font-size="65">🎓</text></svg>`);
});
app.get('/css/*', async (c) => {
  if (c.env.ASSETS) return c.env.ASSETS.fetch(c.req.raw);
  return c.notFound();
});
app.get('/js/*', async (c) => {
  if (c.env.ASSETS) return c.env.ASSETS.fetch(c.req.raw);
  return c.notFound();
});
app.get('/assets/*', async (c) => {
  if (c.env.ASSETS) return c.env.ASSETS.fetch(c.req.raw);
  return c.notFound();
});

// ----------------------------------------------------
// SEO & Search Engine Indexing Routes
// ----------------------------------------------------
app.get('/sitemap.xml', async (c) => {
  if (c.env.ASSETS) {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    if (res.status === 200) {
      const headers = new Headers(res.headers);
      headers.set('Content-Type', 'application/xml; charset=utf-8');
      return new Response(res.body, { status: 200, headers });
    }
  }
  const today = new Date().toISOString().split('T')[0];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://portalsiswa.sdinpreslelingluan.com/</loc>
    <lastmod>\${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://portalsiswa.sdinpreslelingluan.com/login</loc>
    <lastmod>\${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  c.header('Content-Type', 'application/xml; charset=utf-8');
  return c.body(sitemapXml);
});

app.get('/robots.txt', async (c) => {
  if (c.env.ASSETS) {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    if (res.status === 200) {
      const headers = new Headers(res.headers);
      headers.set('Content-Type', 'text/plain; charset=utf-8');
      return new Response(res.body, { status: 200, headers });
    }
  }
  const robotsTxt = `User-agent: *
Allow: /
Allow: /login
Allow: /sitemap.xml

# Privacy protection for administrative & private student data
Disallow: /dashboard
Disallow: /students
Disallow: /audit-log
Disallow: /api/

Sitemap: https://portalsiswa.sdinpreslelingluan.com/sitemap.xml`;
  c.header('Content-Type', 'text/plain; charset=utf-8');
  return c.body(robotsTxt);
});


// ----------------------------------------------------
// Authentication Routes
// ----------------------------------------------------
app.get('/forgot-password', (c) => {
  const id = c.req.query('id') || '';
  return c.html(renderForgotPasswordPage(id));
});

app.get('/login', (c) => {
  const currentUser = getCurrentUser(c);
  if (currentUser) return c.redirect('/dashboard');
  const flashMsg = c.req.query('flash') || '';
  return c.html(renderLoginPage(flashMsg));
});

app.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const username = String(body.username || '').trim();
  const password = String(body.password || '').trim();

  const user = await loginUser(c, username, password);
  if (!user) {
    return c.html(renderLoginPage('Username atau password tidak valid!'));
  }

  return c.redirect('/dashboard');
});

app.get('/logout', async (c) => {
  await logoutUser(c);
  const flash = c.req.query('flash') || '';
  if (flash) {
    return c.redirect(`/login?flash=${encodeURIComponent(flash)}`);
  }
  return c.redirect('/login');
});

// Protected routes middleware
app.use('*', authMiddleware);

// ----------------------------------------------------
// Realtime API & Heartbeat Routes
// ----------------------------------------------------
app.post('/api/heartbeat', async (c) => {
  const user = c.get('user');
  if (user && c.env.DB) {
    const ip = getClientIp(c);
    await updateActiveSession(c.env.DB, {
      userId: user.id,
      userName: user.full_name || user.username,
      userRole: user.role,
      avatarUrl: user.avatar_url,
      ipAddress: ip
    });
  }
  return c.json({ success: true });
});

app.get('/api/online-users', async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ count: 0, users: [] });

  try {
    const res = await db
      .prepare(`
        SELECT user_id, user_name, user_role, avatar_url, ip_address, last_seen_at
        FROM active_sessions
        WHERE last_seen_at >= datetime('now', '-2 minutes')
        ORDER BY last_seen_at DESC
      `)
      .all<OnlineUser>();

    const users = res.results || [];
    return c.json({ count: users.length, users });
  } catch (err) {
    console.error('Error fetching online users:', err);
    return c.json({ count: 0, users: [] });
  }
});

// ----------------------------------------------------
// Audit Log Route (Admin Only)
// ----------------------------------------------------
app.get('/audit-log', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  // Enforce ADMIN role access restriction
  if (user.role !== 'admin') {
    return c.html(renderErrorPage(403, 'Akses Ditolak', 'Halaman Audit Log hanya dapat diakses oleh administrator sistem.', undefined, user), 403);
  }

  const queryParams = c.req.query();
  const search = (queryParams.search || '').trim();
  const action = (queryParams.action || 'ALL').trim();
  const role = (queryParams.role || 'ALL').trim();

  // Fetch stats
  const totalTodayRes = await db.prepare("SELECT COUNT(*) as cnt FROM portal_audit_logs WHERE action = 'LOGIN_SUCCESS' AND date(created_at) = date('now')").first<{ cnt: number }>();
  const failedTodayRes = await db.prepare("SELECT COUNT(*) as cnt FROM portal_audit_logs WHERE action = 'LOGIN_FAILED' AND date(created_at) = date('now')").first<{ cnt: number }>();
  const onlineCountRes = await db.prepare("SELECT COUNT(*) as cnt FROM active_sessions WHERE last_seen_at >= datetime('now', '-2 minutes')").first<{ cnt: number }>();
  const totalLogsRes = await db.prepare("SELECT COUNT(*) as cnt FROM portal_audit_logs").first<{ cnt: number }>();

  const stats = {
    totalToday: totalTodayRes?.cnt || 0,
    failedToday: failedTodayRes?.cnt || 0,
    onlineCount: onlineCountRes?.cnt || 0,
    totalLogs: totalLogsRes?.cnt || 0
  };

  // Build SQL for audit logs
  let sql = 'SELECT * FROM portal_audit_logs WHERE 1=1';
  const bindings: any[] = [];

  if (search) {
    sql += ' AND (user_id LIKE ? OR user_name LIKE ? OR ip_address LIKE ? OR details LIKE ?)';
    const term = `%${search}%`;
    bindings.push(term, term, term, term);
  }

  if (action && action !== 'ALL') {
    sql += ' AND action = ?';
    bindings.push(action);
  }

  if (role && role !== 'ALL') {
    sql += ' AND LOWER(user_role) = LOWER(?)';
    bindings.push(role);
  }

  sql += ' ORDER BY id DESC LIMIT 100';

  let logs: AuditLog[] = [];
  try {
    let stmt = db.prepare(sql);
    if (bindings.length > 0) {
      stmt = stmt.bind(...bindings);
    }
    const res = await stmt.all<AuditLog>();
    logs = res.results || [];
  } catch (err) {
    console.error('Error fetching audit logs:', err);
  }

  const content = renderAuditLogPage(user, stats, logs, { search, action, role });
  return c.html(renderLayout('Audit Log', user, content, 'audit_log'));
});

// ----------------------------------------------------
// Dashboard Route
// ----------------------------------------------------
app.get('/', (c) => c.redirect('/dashboard'));

app.get('/dashboard', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.redirect('/students/my-profile');
  }
  const db = c.env.DB;

  let totalStudents = 0;
  let totalClasses = 0;
  let students: Student[] = [];

  const restrictClass = (user.role === 'guru' && user.homeroom_class) ? user.homeroom_class : null;

  // Try query with status column filter
  try {
    let studentCountSql = "SELECT COUNT(*) as cnt FROM students WHERE (status IS NULL OR status = 'active')";
    let classCountSql = "SELECT COUNT(DISTINCT class_name) as cnt FROM students WHERE (status IS NULL OR status = 'active')";
    const countParams: any[] = [];
    if (restrictClass) {
      studentCountSql += " AND class_name = ?";
      classCountSql += " AND class_name = ?";
      countParams.push(restrictClass);
    }
    const totalStudentsRes = await db.prepare(studentCountSql).bind(...countParams).first<{ cnt: number }>();
    const totalClassesRes = await db.prepare(classCountSql).bind(...countParams).first<{ cnt: number }>();

    let studentsSql = `
      SELECT 
        s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.photo_url, s.birth_place, s.birth_date,
        p.father_name, p.is_father_alive, p.mother_name, p.is_mother_alive,
        GROUP_CONCAT(d.doc_type) as uploaded_docs
      FROM students s
      LEFT JOIN student_parents p ON s.id = p.student_id
      LEFT JOIN student_documents d ON s.id = d.student_id
      WHERE (s.status IS NULL OR s.status = 'active')
    `;
    const studentParams: any[] = [];
    if (restrictClass) {
      studentsSql += " AND s.class_name = ?";
      studentParams.push(restrictClass);
    }
    studentsSql += `
      GROUP BY s.id
      ORDER BY s.class_name ASC, s.name ASC
    `;
    const studentsRes = await db.prepare(studentsSql).bind(...studentParams).all<Student>();

    totalStudents = totalStudentsRes?.cnt || 0;
    totalClasses = totalClassesRes?.cnt || 0;
    students = studentsRes.results || [];
  } catch (e) {
    console.warn('Dashboard query with status filter failed, executing schema fallback:', e);
    let studentCountSql = 'SELECT COUNT(*) as cnt FROM students';
    let classCountSql = 'SELECT COUNT(DISTINCT class_name) as cnt FROM students';
    const countParams: any[] = [];
    if (restrictClass) {
      studentCountSql += " WHERE class_name = ?";
      classCountSql += " WHERE class_name = ?";
      countParams.push(restrictClass);
    }
    const totalStudentsRes = await db.prepare(studentCountSql).bind(...countParams).first<{ cnt: number }>();
    const totalClassesRes = await db.prepare(classCountSql).bind(...countParams).first<{ cnt: number }>();

    let studentsSql = `
      SELECT 
        s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.photo_url, s.birth_place, s.birth_date,
        p.father_name, p.is_father_alive, p.mother_name, p.is_mother_alive,
        GROUP_CONCAT(d.doc_type) as uploaded_docs
      FROM students s
      LEFT JOIN student_parents p ON s.id = p.student_id
      LEFT JOIN student_documents d ON s.id = d.student_id
    `;
    const studentParams: any[] = [];
    if (restrictClass) {
      studentsSql += " WHERE s.class_name = ?";
      studentParams.push(restrictClass);
    }
    studentsSql += `
      GROUP BY s.id
      ORDER BY s.class_name ASC, s.name ASC
    `;
    const studentsRes = await db.prepare(studentsSql).bind(...studentParams).all<Student>();

    totalStudents = totalStudentsRes?.cnt || 0;
    totalClasses = totalClassesRes?.cnt || 0;
    students = studentsRes.results || [];
  }

  const content = renderDashboardPage(user, totalStudents, totalClasses, students);
  return c.html(renderLayout('Dashboard', user, content, 'dashboard'));
});

// ----------------------------------------------------
// Students List & Filter Route (Active Students Only)
// ----------------------------------------------------
app.get('/students', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.redirect('/students/my-profile');
  }

  const db = c.env.DB;
  let selectedClass = c.req.query('class_name') || '';
  const flash = c.req.query('flash') || '';

  const restrictClass = (user.role === 'guru' && user.homeroom_class) ? user.homeroom_class : null;
  if (restrictClass) {
    selectedClass = restrictClass;
  }

  let classesList: string[] = [];
  let students: Student[] = [];

  try {
    if (restrictClass) {
      classesList = [restrictClass];
    } else {
      const classesRes = await db.prepare("SELECT DISTINCT class_name FROM students WHERE (status IS NULL OR status = 'active') ORDER BY class_name ASC").all<{ class_name: string }>();
      classesList = (classesRes.results || []).map(r => r.class_name);
    }

    let sql = `
      SELECT 
        s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.photo_url, s.birth_place, s.birth_date, s.status,
        p.father_name, p.is_father_alive, p.mother_name, p.is_mother_alive,
        akte.status as akte_status,
        kk.status as kk_status
      FROM students s
      LEFT JOIN student_parents p ON s.id = p.student_id
      LEFT JOIN student_documents akte ON s.id = akte.student_id AND akte.doc_type = 'akte_kelahiran'
      LEFT JOIN student_documents kk ON s.id = kk.student_id AND kk.doc_type = 'kartu_keluarga'
      WHERE ${user.role === 'admin' ? "(s.status IS NULL OR s.status = 'active' OR s.status = 'mutation_pending' OR s.status = 'pindah_sekolah' OR s.status = 'tidak_bersekolah')" : "(s.status IS NULL OR s.status = 'active' OR s.status = 'mutation_pending')"}
    `;
    const params: any[] = [];

    if (selectedClass) {
      sql += ` AND s.class_name = ?`;
      params.push(selectedClass);
    }

    sql += ` ORDER BY s.class_name ASC, s.name ASC`;

    const stmt = db.prepare(sql);
    const result = params.length > 0 ? await stmt.bind(...params).all<Student>() : await stmt.all<Student>();
    students = result.results || [];
  } catch (e) {
    console.warn('GET /students status filter query failed, executing fallback:', e);
    if (restrictClass) {
      classesList = [restrictClass];
    } else {
      const classesRes = await db.prepare('SELECT DISTINCT class_name FROM students ORDER BY class_name ASC').all<{ class_name: string }>();
      classesList = (classesRes.results || []).map(r => r.class_name);
    }

    let sql = `
      SELECT 
        s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.photo_url, s.birth_place, s.birth_date,
        p.father_name, p.is_father_alive, p.mother_name, p.is_mother_alive,
        akte.status as akte_status,
        kk.status as kk_status
      FROM students s
      LEFT JOIN student_parents p ON s.id = p.student_id
      LEFT JOIN student_documents akte ON s.id = akte.student_id AND akte.doc_type = 'akte_kelahiran'
      LEFT JOIN student_documents kk ON s.id = kk.student_id AND kk.doc_type = 'kartu_keluarga'
    `;
    const params: any[] = [];

    if (selectedClass) {
      sql += ` WHERE s.class_name = ?`;
      params.push(selectedClass);
    }

    sql += ` ORDER BY s.class_name ASC, s.name ASC`;

    const stmt = db.prepare(sql);
    const result = params.length > 0 ? await stmt.bind(...params).all<Student>() : await stmt.all<Student>();
    students = result.results || [];
  }

  const content = renderStudentListPage(students, classesList, selectedClass, user.role, flash);
  return c.html(renderLayout('Data Siswa', user, content, 'students'));
});

app.get('/students/my-profile', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  if (user.linked_id) {
    return c.redirect(`/students/${user.linked_id}`);
  }
  try {
    const st = await db.prepare('SELECT id FROM students WHERE nipd = ?').bind(user.id).first<{ id: number }>();
    if (st?.id) {
      return c.redirect(`/students/${st.id}`);
    }
  } catch (e) { }

  const content = `<div class="card border-warning border-opacity-25 shadow-sm p-4 text-center">
    <div class="card-body">
      <i class="bi bi-exclamation-triangle-fill text-warning fs-1 mb-3 d-block"></i>
      <h4 class="fw-bold text-dark mb-2">Data Diri Tidak Ditemukan</h4>
      <p class="text-secondary mb-0">NIPD Anda (<strong>${user.id}</strong>) belum terhubung dengan data siswa di database. Silakan hubungi Administrator sekolah.</p>
    </div>
  </div>`;
  return c.html(renderLayout('Data Diri Siswa', user, content, 'students'));
});

// ----------------------------------------------------
// Fitur Pemilihan Siswa untuk Keperluan Mendesak / Penting (Priority Students)
// ----------------------------------------------------
app.get('/priority-students', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.redirect('/students/my-profile');
  }

  const db = c.env.DB;
  const selectedClass = (c.req.query('class_name') || '').trim();
  const flash = (c.req.query('flash') || '').trim();

  const restrictClass = (user.role === 'guru' && user.homeroom_class) ? user.homeroom_class : null;

  // Query priority_students joined with students and uploaded student_documents
  let priorityStudents: PriorityStudent[] = [];
  try {
    let sql = `
      SELECT 
        p.id, p.student_id, p.notes, p.required_photo, p.required_kk, p.required_akte, p.created_by, p.created_at, p.updated_at,
        s.nipd, s.nisn, s.nik, s.name, s.class_name, s.photo_url,
        GROUP_CONCAT(d.doc_type) as uploaded_docs
      FROM priority_students p
      JOIN students s ON p.student_id = s.id
      LEFT JOIN student_documents d ON s.id = d.student_id
    `;
    const params: any[] = [];
    if (restrictClass) {
      sql += " WHERE s.class_name = ?";
      params.push(restrictClass);
    }
    sql += `
      GROUP BY p.id
      ORDER BY s.class_name ASC, s.name ASC
    `;
    const res = params.length > 0 ? await db.prepare(sql).bind(...params).all<PriorityStudent>() : await db.prepare(sql).all<PriorityStudent>();

    priorityStudents = res.results || [];
  } catch (err) {
    console.error('Error fetching priority students:', err);
  }

  // Query all system students (for Admin selection modal)
  let allStudents: Student[] = [];
  try {
    let sql = `
      SELECT id, nipd, nisn, nik, name, class_name, photo_url
      FROM students
    `;
    const params: any[] = [];
    if (restrictClass) {
      sql += " WHERE class_name = ?";
      params.push(restrictClass);
    }
    sql += " ORDER BY class_name ASC, name ASC";
    const resAll = params.length > 0 ? await db.prepare(sql).bind(...params).all<Student>() : await db.prepare(sql).all<Student>();
    allStudents = resAll.results || [];
  } catch (err) {
    console.error('Error fetching all students for priority modal:', err);
  }

  const content = renderPriorityStudentsPage(user, priorityStudents, allStudents, selectedClass, flash);
  return c.html(renderLayout('Siswa Prioritas / Keperluan Mendesak', user, content, 'priority_students'));
});

// ----------------------------------------------------
// Fitur Mutasi Siswa (Pindah Sekolah & Tidak Bersekolah)
// ----------------------------------------------------
app.get('/mutations', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.redirect('/students/my-profile');
  }

  const db = c.env.DB;
  const flash = (c.req.query('flash') || '').trim();
  const restrictClass = (user.role === 'guru' && user.homeroom_class) ? user.homeroom_class : null;

  let mutations: StudentMutation[] = [];
  try {
    let sql = `
      SELECT 
        m.id, m.student_id, m.mutation_type, m.mutation_date, m.reason, m.destination_school,
        COALESCE(m.status, 'approved') as status, m.rejection_note, m.reviewed_by, m.reviewed_at, m.created_by, m.created_at,
        s.name as student_name, s.class_name, s.nik, s.nipd, s.nisn, s.status as student_status
      FROM student_mutations m
      JOIN students s ON m.student_id = s.id
    `;
    const params: any[] = [];
    if (restrictClass) {
      sql += ` WHERE s.class_name = ?`;
      params.push(restrictClass);
    }
    sql += ` ORDER BY m.created_at DESC`;

    const res = params.length > 0 ? await db.prepare(sql).bind(...params).all<StudentMutation>() : await db.prepare(sql).all<StudentMutation>();
    mutations = res.results || [];
  } catch (e) {
    console.error('Error fetching mutations:', e);
  }

  let activeStudents: Student[] = [];
  try {
    let sql = `
      SELECT id, name, class_name, nik, nipd, nisn
      FROM students
      WHERE (status IS NULL OR status = 'active')
    `;
    const params: any[] = [];
    if (restrictClass) {
      sql += ` AND class_name = ?`;
      params.push(restrictClass);
    }
    sql += ` ORDER BY class_name ASC, name ASC`;

    const res = params.length > 0 ? await db.prepare(sql).bind(...params).all<Student>() : await db.prepare(sql).all<Student>();
    activeStudents = res.results || [];
  } catch (e) {
    console.error('Error fetching active students:', e);
  }

  const content = renderMutationsPage(mutations, activeStudents, user, flash);
  return c.html(renderLayout('Mutasi Siswa', user, content, 'mutations'));
});

// API: POST /api/students/mutate
app.post('/api/students/mutate', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.json({ success: false, message: 'Akses Ditolak: Siswa tidak diizinkan memproses mutasi.' }, 403);
  }

  const db = c.env.DB;
  const ip = getClientIp(c);
  const ua = getUserAgent(c);

  let body: any;
  try {
    body = await c.req.parseBody();
  } catch {
    body = await c.req.json().catch(() => ({}));
  }

  const studentId = parseInt(String(body.student_id || ''), 10);
  const mutationType = String(body.mutation_type || '').trim();
  const mutationDate = String(body.mutation_date || '').trim() || new Date().toISOString().split('T')[0];
  const reason = String(body.reason || '').trim();
  const destinationSchool = String(body.destination_school || '').trim();

  if (isNaN(studentId) || studentId <= 0) {
    return c.json({ success: false, message: 'Pilih siswa yang valid.' }, 400);
  }

  // Security check: Teacher can ONLY mutate students from their assigned homeroom class
  if (user.role === 'guru' && user.homeroom_class) {
    const targetStudent = await db.prepare('SELECT class_name FROM students WHERE id = ?').bind(studentId).first<{ class_name: string }>();
    if (targetStudent && targetStudent.class_name !== user.homeroom_class) {
      return c.json({ success: false, message: `Akses Ditolak: Anda hanya dapat memutasi siswa dari kelas binaan Anda (Kelas ${user.homeroom_class}).` }, 403);
    }
  }

  if (mutationType !== 'pindah_sekolah' && mutationType !== 'tidak_bersekolah') {
    return c.json({ success: false, message: 'Jenis mutasi tidak valid.' }, 400);
  }

  if (!reason) {
    return c.json({ success: false, message: 'Alasan mutasi wajib diisi.' }, 400);
  }

  if (mutationType === 'pindah_sekolah' && !destinationSchool) {
    return c.json({ success: false, message: 'Sekolah tujuan wajib diisi untuk siswa pindah sekolah.' }, 400);
  }

  try {
    const isAutoApproved = user.role === 'admin';
    const mutationStatus = isAutoApproved ? 'approved' : 'pending';
    const studentNewStatus = isAutoApproved ? mutationType : 'mutation_pending';

    // 1. Insert mutation record
    await db.prepare(`
      INSERT INTO student_mutations (student_id, mutation_type, mutation_date, reason, destination_school, status, reviewed_by, reviewed_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      studentId, 
      mutationType, 
      mutationDate, 
      reason, 
      mutationType === 'pindah_sekolah' ? destinationSchool : null, 
      mutationStatus, 
      isAutoApproved ? user.id : null, 
      isAutoApproved ? new Date().toISOString() : null, 
      user.id
    ).run();

    // 2. Update student status in students table
    await db.prepare(`
      UPDATE students SET status = ? WHERE id = ?
    `).bind(studentNewStatus, studentId).run();

    // 3. Log audit
    await logAudit(db, {
      userId: user.id,
      userName: user.full_name || user.username,
      userRole: user.role,
      action: 'STUDENT_MUTATION_SUBMITTED',
      status: 'SUCCESS',
      ipAddress: ip,
      userAgent: ua,
      details: `Mutasi siswa ID ${studentId} diajukan (${mutationType}, status: ${mutationStatus})`
    });

    const isJson = c.req.header('Accept')?.includes('application/json') || c.req.header('Content-Type')?.includes('application/json');
    const msg = isAutoApproved ? 'Data mutasi siswa berhasil disimpan dan disetujui.' : 'Pengajuan mutasi siswa berhasil dikirim. Menunggu persetujuan Admin.';
    if (isJson) {
      return c.json({ success: true, message: msg });
    }
    return c.redirect('/mutations?flash=' + encodeURIComponent(msg));
  } catch (e: any) {
    console.error('Error saving student mutation:', e);
    return c.json({ success: false, message: 'Gagal menyimpan mutasi: ' + (e?.message || e) }, 500);
  }
});

// API: POST /api/admin/mutations/:id/approve (Admin Only)
app.post('/api/admin/mutations/:id/approve', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'Akses Ditolak: Hanya Admin yang dapat menyetujui mutasi.' }, 403);
  }

  const db = c.env.DB;
  const ip = getClientIp(c);
  const ua = getUserAgent(c);
  const mutationId = parseInt(c.req.param('id'), 10);

  if (isNaN(mutationId) || mutationId <= 0) {
    return c.json({ success: false, message: 'ID Mutasi tidak valid.' }, 400);
  }

  try {
    const mutation = await db.prepare(`SELECT * FROM student_mutations WHERE id = ?`).bind(mutationId).first<StudentMutation>();
    if (!mutation) {
      return c.json({ success: false, message: 'Data mutasi tidak ditemukan.' }, 404);
    }

    // Update mutation record
    await db.prepare(`
      UPDATE student_mutations SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(user.id, mutationId).run();

    // Update student status
    await db.prepare(`
      UPDATE students SET status = ? WHERE id = ?
    `).bind(mutation.mutation_type, mutation.student_id).run();

    await logAudit(db, {
      userId: user.id,
      userName: user.full_name || user.username,
      userRole: user.role,
      action: 'MUTATION_APPROVED',
      status: 'SUCCESS',
      ipAddress: ip,
      userAgent: ua,
      details: `Persetujuan mutasi ID ${mutationId} (Siswa ID ${mutation.student_id})`
    });

    return c.redirect('/mutations?flash=' + encodeURIComponent('Pengajuan mutasi siswa berhasil disetujui.'));
  } catch (e: any) {
    return c.json({ success: false, message: 'Gagal menyetujui mutasi: ' + (e?.message || e) }, 500);
  }
});

// API: POST /api/admin/mutations/:id/reject (Admin Only)
app.post('/api/admin/mutations/:id/reject', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'Akses Ditolak: Hanya Admin yang dapat menolak mutasi.' }, 403);
  }

  const db = c.env.DB;
  const ip = getClientIp(c);
  const ua = getUserAgent(c);
  const mutationId = parseInt(c.req.param('id'), 10);

  let body: any;
  try { body = await c.req.parseBody(); } catch { body = await c.req.json().catch(() => ({})); }
  const rejectionNote = String(body.rejection_note || '').trim();

  if (isNaN(mutationId) || mutationId <= 0) {
    return c.json({ success: false, message: 'ID Mutasi tidak valid.' }, 400);
  }

  if (!rejectionNote) {
    return c.json({ success: false, message: 'Alasan penolakan mutasi wajib diisi.' }, 400);
  }

  try {
    const mutation = await db.prepare(`SELECT * FROM student_mutations WHERE id = ?`).bind(mutationId).first<StudentMutation>();
    if (!mutation) {
      return c.json({ success: false, message: 'Data mutasi tidak ditemukan.' }, 404);
    }

    // Update mutation record
    await db.prepare(`
      UPDATE student_mutations SET status = 'rejected', rejection_note = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(rejectionNote, user.id, mutationId).run();

    // Restore student status to active
    await db.prepare(`
      UPDATE students SET status = 'active' WHERE id = ?
    `).bind(mutation.student_id).run();

    await logAudit(db, {
      userId: user.id,
      userName: user.full_name || user.username,
      userRole: user.role,
      action: 'MUTATION_REJECTED',
      status: 'SUCCESS',
      ipAddress: ip,
      userAgent: ua,
      details: `Penolakan mutasi ID ${mutationId} (Siswa ID ${mutation.student_id})`
    });

    return c.redirect('/mutations?flash=' + encodeURIComponent('Pengajuan mutasi siswa telah ditolak.'));
  } catch (e: any) {
    return c.json({ success: false, message: 'Gagal menolak mutasi: ' + (e?.message || e) }, 500);
  }
});

// API: POST /api/admin/mutations/:id/restore (Admin Only - Revert Mutated Student Back to Active)
app.post('/api/admin/mutations/:id/restore', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'Akses Ditolak: Hanya Admin yang dapat mengembalikan siswa mutasi.' }, 403);
  }

  const db = c.env.DB;
  const ip = getClientIp(c);
  const ua = getUserAgent(c);
  const mutationId = parseInt(c.req.param('id'), 10);

  if (isNaN(mutationId) || mutationId <= 0) {
    return c.json({ success: false, message: 'ID Mutasi tidak valid.' }, 400);
  }

  try {
    const mutation = await db.prepare(`SELECT * FROM student_mutations WHERE id = ?`).bind(mutationId).first<StudentMutation>();
    if (!mutation) {
      return c.json({ success: false, message: 'Data mutasi tidak ditemukan.' }, 404);
    }

    // Update mutation record to cancelled
    await db.prepare(`
      UPDATE student_mutations SET status = 'cancelled', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(user.id, mutationId).run();

    // Restore student status to active
    await db.prepare(`
      UPDATE students SET status = 'active' WHERE id = ?
    `).bind(mutation.student_id).run();

    await logAudit(db, {
      userId: user.id,
      userName: user.full_name || user.username,
      userRole: user.role,
      action: 'MUTATION_RESTORED',
      status: 'SUCCESS',
      ipAddress: ip,
      userAgent: ua,
      details: `Pengembalian siswa mutasi ID ${mutationId} (Siswa ID ${mutation.student_id}) menjadi aktif kembali`
    });

    return c.redirect('/mutations?flash=' + encodeURIComponent('Mutasi dibatalkan. Siswa telah dikembalikan menjadi siswa aktif.'));
  } catch (e: any) {
    return c.json({ success: false, message: 'Gagal mengembalikan siswa: ' + (e?.message || e) }, 500);
  }
});

// API: POST /api/admin/students/:id/restore-mutation (Admin Only - Revert student to active from student list or detail)
app.post('/api/admin/students/:id/restore-mutation', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'Akses Ditolak: Hanya Admin yang dapat mengembalikan siswa.' }, 403);
  }

  const db = c.env.DB;
  const ip = getClientIp(c);
  const ua = getUserAgent(c);
  const studentId = parseInt(c.req.param('id'), 10);

  if (isNaN(studentId) || studentId <= 0) {
    return c.json({ success: false, message: 'ID Siswa tidak valid.' }, 400);
  }

  try {
    // 1. Update any pending/approved mutation records for this student to 'cancelled'
    await db.prepare(`
      UPDATE student_mutations SET status = 'cancelled', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP 
      WHERE student_id = ? AND (status IS NULL OR status = 'pending' OR status = 'approved')
    `).bind(user.id, studentId).run();

    // 2. Restore student status to 'active'
    await db.prepare(`
      UPDATE students SET status = 'active' WHERE id = ?
    `).bind(studentId).run();

    await logAudit(db, {
      userId: user.id,
      userName: user.full_name || user.username,
      userRole: user.role,
      action: 'STUDENT_RESTORED_TO_ACTIVE',
      status: 'SUCCESS',
      ipAddress: ip,
      userAgent: ua,
      details: `Admin mengembalikan siswa ID ${studentId} menjadi siswa aktif`
    });

    const isJson = c.req.header('Accept')?.includes('application/json');
    if (isJson) {
      return c.json({ success: true, message: 'Siswa berhasil dikembalikan menjadi siswa aktif.' });
    }
    return c.redirect('/students?flash=' + encodeURIComponent('Siswa berhasil dikembalikan menjadi siswa aktif.'));
  } catch (e: any) {
    return c.json({ success: false, message: 'Gagal mengembalikan siswa: ' + (e?.message || e) }, 500);
  }
});

// API: POST /api/priority-students/add (Admin Only)
app.post('/api/priority-students/add', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'Akses Ditolak: Hanya Admin yang dapat menambahkan siswa ke daftar prioritas.' }, 403);
  }

  const db = c.env.DB;
  const ip = getClientIp(c);
  const ua = getUserAgent(c);

  let body: any;
  try {
    body = await c.req.parseBody({ all: true });
  } catch {
    body = await c.req.json().catch(() => ({}));
  }

  let studentIdsRaw = body['student_ids[]'] || body['student_ids'] || [];
  if (!Array.isArray(studentIdsRaw)) {
    studentIdsRaw = [studentIdsRaw];
  }

  const studentIds = studentIdsRaw
    .map((v: any) => parseInt(String(v), 10))
    .filter((v: number) => !isNaN(v) && v > 0);

  if (studentIds.length === 0) {
    return c.json({ success: false, message: 'Pilih minimal satu siswa dari daftar.' }, 400);
  }

  const notes = String(body['notes'] || '').trim() || null;
  const requiredPhoto = (body['required_photo'] === '1' || body['required_photo'] === 1 || body['required_photo'] === true) ? 1 : 0;
  const requiredKk = (body['required_kk'] === '1' || body['required_kk'] === 1 || body['required_kk'] === true) ? 1 : 0;
  const requiredAkte = (body['required_akte'] === '1' || body['required_akte'] === 1 || body['required_akte'] === true) ? 1 : 0;

  try {
    const stmt = db.prepare(`
      INSERT INTO priority_students (student_id, notes, required_photo, required_kk, required_akte, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(student_id) DO NOTHING
    `);

    const batch = studentIds.map((id: number) => stmt.bind(id, notes, requiredPhoto, requiredKk, requiredAkte, String(user.id)));
    await db.batch(batch);

    await logAudit(db, {
      userId: user.id,
      userName: user.full_name || user.username,
      userRole: user.role,
      action: 'ADD_PRIORITY_STUDENTS',
      status: 'SUCCESS',
      ipAddress: ip,
      userAgent: ua,
      details: `Admin menambahkan ${studentIds.length} siswa ke daftar prioritas`
    });

    return c.json({ success: true, message: `Berhasil menambahkan ${studentIds.length} siswa ke daftar prioritas.` });
  } catch (err: any) {
    console.error('Error adding priority students:', err);
    return c.json({ success: false, message: err.message || 'Gagal menambahkan siswa ke daftar prioritas.' }, 500);
  }
});

// API: POST /api/priority-students/update/:id (Admin Only)
app.post('/api/priority-students/update/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'Akses Ditolak.' }, 403);
  }

  const priorityId = parseInt(c.req.param('id'), 10);
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.parseBody();
  } catch {
    body = await c.req.json().catch(() => ({}));
  }

  const notes = String(body['notes'] || '').trim() || null;
  const requiredPhoto = (body['required_photo'] === '1' || body['required_photo'] === 1) ? 1 : 0;
  const requiredKk = (body['required_kk'] === '1' || body['required_kk'] === 1) ? 1 : 0;
  const requiredAkte = (body['required_akte'] === '1' || body['required_akte'] === 1) ? 1 : 0;

  try {
    await db.prepare(`
      UPDATE priority_students
      SET notes = ?, required_photo = ?, required_kk = ?, required_akte = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(notes, requiredPhoto, requiredKk, requiredAkte, priorityId).run();

    return c.json({ success: true, message: 'Catatan prioritas berhasil diperbarui.' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal memperbarui data.' }, 500);
  }
});

// API: POST /api/priority-students/delete/:id (Admin Only)
app.post('/api/priority-students/delete/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'Akses Ditolak.' }, 403);
  }

  const priorityId = parseInt(c.req.param('id'), 10);
  const db = c.env.DB;
  const ip = getClientIp(c);
  const ua = getUserAgent(c);

  try {
    await db.prepare('DELETE FROM priority_students WHERE id = ?').bind(priorityId).run();

    await logAudit(db, {
      userId: user.id,
      userName: user.full_name || user.username,
      userRole: user.role,
      action: 'DELETE_PRIORITY_STUDENT',
      status: 'SUCCESS',
      ipAddress: ip,
      userAgent: ua,
      details: `Admin menghapus data siswa dari daftar prioritas (ID: ${priorityId})`
    });

    return c.json({ success: true, message: 'Siswa berhasil dihapus dari daftar prioritas.' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal menghapus.' }, 500);
  }
});

// API: POST /api/priority-students/complete/:id (Teacher & Admin Database Verification)
app.post('/api/priority-students/complete/:id', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.json({ success: false, message: 'Akses Ditolak.' }, 403);
  }

  const priorityId = parseInt(c.req.param('id'), 10);
  const db = c.env.DB;
  const ip = getClientIp(c);
  const ua = getUserAgent(c);

  try {
    // 1. Fetch priority record joined with student details and document uploads from D1 database
    const ps = await db.prepare(`
      SELECT 
        p.id, p.student_id, p.notes, p.required_photo, p.required_kk, p.required_akte,
        s.name, s.photo_url,
        GROUP_CONCAT(d.doc_type) as uploaded_docs
      FROM priority_students p 
      JOIN students s ON p.student_id = s.id 
      LEFT JOIN student_documents d ON s.id = d.student_id
      WHERE p.id = ?
      GROUP BY p.id
    `).bind(priorityId).first<{
      id: number;
      student_id: number;
      notes: string | null;
      required_photo: number;
      required_kk: number;
      required_akte: number;
      name: string;
      photo_url: string | null;
      uploaded_docs: string | null;
    }>();

    if (!ps) {
      return c.json({ success: false, message: 'Data siswa prioritas tidak ditemukan.' }, 404);
    }

    const studentName = ps.name || `ID ${priorityId}`;
    const docs = (ps.uploaded_docs || '').split(',');
    const hasPhoto = !!(ps.photo_url && ps.photo_url.trim().length > 0);
    const hasKk = docs.includes('kartu_keluarga');
    const hasAkte = docs.includes('akte_kelahiran');

    // 2. Perform Database Verification for each requirement
    const missingItems: string[] = [];

    if (ps.required_photo && !hasPhoto) {
      missingItems.push('Foto Profil Siswa belum tersimpan di database');
    }
    if (ps.required_kk && !hasKk) {
      missingItems.push('Kartu Keluarga (KK) belum ter-upload di database');
    }
    if (ps.required_akte && !hasAkte) {
      missingItems.push('Akte Kelahiran belum ter-upload di database');
    }

    // 3. If there are missing requirements in the database, reject completion
    if (missingItems.length > 0) {
      await logAudit(db, {
        userId: user.id,
        userName: user.full_name || user.username,
        userRole: user.role,
        action: 'COMPLETE_PRIORITY_STUDENT_FAILED',
        status: 'FAILED',
        ipAddress: ip,
        userAgent: ua,
        details: `Verifikasi gagal untuk ${studentName}: Masih ada ${missingItems.length} kebutuhan yang belum tersimpan di DB (${missingItems.join(', ')})`
      });

      return c.json({
        success: false,
        message: `Siswa belum dapat diselesaikan. Masih terdapat ${missingItems.length} data yang belum tersimpan di database.`,
        missing_count: missingItems.length,
        missing_items: missingItems
      }, 400);
    }

    // 4. All requirements verified in database! Delete from priority list & mark completed
    await db.prepare('DELETE FROM priority_students WHERE id = ?').bind(priorityId).run();

    await logAudit(db, {
      userId: user.id,
      userName: user.full_name || user.username,
      userRole: user.role,
      action: 'COMPLETE_PRIORITY_STUDENT_SUCCESS',
      status: 'SUCCESS',
      ipAddress: ip,
      userAgent: ua,
      details: `${user.role.toUpperCase()} ${user.full_name || user.username} memverifikasi & menyelesaikan siswa prioritas: ${studentName}`
    });

    return c.json({
      success: true,
      message: 'Data siswa berhasil diverifikasi dan siswa dinyatakan selesai.'
    });
  } catch (err: any) {
    console.error('Error completing priority student:', err);
    return c.json({ success: false, message: err.message || 'Gagal memproses verifikasi.' }, 500);
  }
});

// API: POST /api/students/:id/upload-quick (Teacher & Admin Quick Upload)
app.post('/api/students/:id/upload-quick', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.json({ success: false, message: 'Akses Ditolak.' }, 403);
  }

  const studentId = parseInt(c.req.param('id'), 10);
  const body = await c.req.parseBody();
  const uploadType = String(body['upload_type'] || '');
  const file = body['file'] as File | undefined;

  if (!file || !(file instanceof File) || file.size === 0) {
    return c.json({ success: false, message: 'File tidak boleh kosong.' }, 400);
  }

  const db = c.env.DB;
  const bucket = c.env.PORTAL_SISWA_BUCKET;

  try {
    const ext = file.name.split('.').pop() || (uploadType === 'photo' ? 'jpg' : 'pdf');
    const fileArrayBuffer = await file.arrayBuffer();

    if (uploadType === 'photo') {
      const r1Key = `profile-photos/student_${studentId}_${Date.now()}.${ext}`;
      if (bucket) {
        await bucket.put(r1Key, fileArrayBuffer, {
          httpMetadata: { contentType: file.type || 'image/jpeg' }
        });
      }
      const photoUrl = `/files/${r1Key}`;
      await db.prepare('UPDATE students SET photo_url = ? WHERE id = ?').bind(photoUrl, studentId).run();

      const reviewedBy = user.id.toString();
      const reviewedAt = new Date().toISOString();

      await db.prepare(`
        INSERT INTO student_documents (student_id, doc_type, file_path, file_url, status, reviewed_by, reviewed_at)
        VALUES (?, 'foto', ?, ?, 'approved', ?, ?)
        ON CONFLICT(student_id, doc_type) DO UPDATE SET
          file_path = excluded.file_path,
          file_url = excluded.file_url,
          status = 'approved',
          reviewed_by = excluded.reviewed_by,
          reviewed_at = excluded.reviewed_at,
          uploaded_at = CURRENT_TIMESTAMP
      `).bind(studentId, r1Key, photoUrl, reviewedBy, reviewedAt).run();

      await db.prepare(`
        INSERT INTO student_document_submissions (student_id, doc_type, file_path, file_url, status, submitted_by, reviewed_by, reviewed_at)
        VALUES (?, 'foto', ?, ?, 'approved', ?, ?, ?)
      `).bind(studentId, r1Key, photoUrl, user.id.toString(), reviewedBy, reviewedAt).run();
    } else if (['kartu_keluarga', 'akte_kelahiran'].includes(uploadType)) {
      const r1Key = `student-documents/student_${studentId}/${uploadType}_${Date.now()}.${ext}`;
      if (bucket) {
        await bucket.put(r1Key, fileArrayBuffer, {
          httpMetadata: { contentType: file.type || 'application/octet-stream' }
        });
      }
      const fileUrl = `/files/${r1Key}`;
      await db.prepare(`
        INSERT INTO student_documents (student_id, doc_type, file_path, file_url)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(student_id, doc_type) DO UPDATE SET
          file_path = excluded.file_path,
          file_url = excluded.file_url,
          uploaded_at = CURRENT_TIMESTAMP
      `).bind(studentId, uploadType, r1Key, fileUrl).run();

      await db.prepare(`
        INSERT INTO student_document_submissions (student_id, doc_type, file_path, file_url, status, submitted_by)
        VALUES (?, ?, ?, ?, 'pending', ?)
      `).bind(studentId, uploadType, r1Key, fileUrl, user.id.toString()).run();
    } else {
      return c.json({ success: false, message: 'Jenis berkas tidak valid.' }, 400);
    }

    return c.json({ success: true, message: 'Berkas berhasil diunggah.' });
  } catch (err: any) {
    console.error('Error in upload-quick:', err);
    return c.json({ success: false, message: err.message || 'Gagal mengunggah berkas.' }, 500);
  }
});

// ----------------------------------------------------
// Dedicated Full-Page Import & Validation Route
// ----------------------------------------------------
app.get('/students/import-page', (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.html(renderErrorPage(403, 'Akses Ditolak', 'Halaman Import & Validasi Excel hanya dapat diakses oleh Admin atau Guru.', undefined, user), 403);
  }

  const content = renderImportPage(user.role);
  // Pass activeNav = 'students' agar tidak menambah menu baru di sidebar
  return c.html(renderLayout('Import & Validasi Excel', user, content, 'students'));
});

// Helper to get application settings from D1
async function getAppSettings(db: D1Database): Promise<Record<string, string>> {
  try {
    const res = await db.prepare('SELECT key, value FROM app_settings').all<{ key: string; value: string }>();
    const map: Record<string, string> = {
      allow_photo_upload: '1',
      allow_akte_upload: '1',
      allow_kk_upload: '1',
      teacher_delete_photo: '0',
      teacher_delete_kk: '0',
      teacher_delete_akte: '0'
    };
    (res.results || []).forEach(r => {
      map[r.key] = r.value;
    });
    return map;
  } catch (e) {
    return {
      allow_photo_upload: '1',
      allow_akte_upload: '1',
      allow_kk_upload: '1',
      teacher_delete_photo: '0',
      teacher_delete_kk: '0',
      teacher_delete_akte: '0'
    };
  }
}

async function checkStudentAccess(c: any, studentId: number): Promise<{ allowed: boolean; student?: Student; message?: string }> {
  const user = c.get('user');
  if (!user) return { allowed: false, message: 'Autentikasi diperlukan.' };

  const db = c.env.DB;
  const student = (await db.prepare('SELECT * FROM students WHERE id = ?').bind(studentId).first()) as Student | null;
  if (!student) {
    return { allowed: false, message: 'Siswa tidak ditemukan.' };
  }

  // Siswa role check
  if (user.role === 'siswa') {
    if (user.linked_id !== studentId && user.id !== student.nipd) {
      return { allowed: false, message: 'Akses Ditolak: Anda hanya dapat mengakses data diri sendiri.' };
    }
  }

  // Guru role check (Homeroom assignment)
  if (user.role === 'guru' && user.homeroom_class) {
    if (student.class_name !== user.homeroom_class) {
      return { allowed: false, message: `Akses Ditolak: Anda hanya dapat mengakses siswa di kelas ${user.homeroom_class}.` };
    }
  }

  return { allowed: true, student };
}

// ----------------------------------------------------
// Student Detail & Edit Route
// ----------------------------------------------------
app.get('/students/:id', async (c) => {
  const user = c.get('user');
  const studentId = parseInt(c.req.param('id'), 10);
  const flash = c.req.query('flash') || '';

  // Siswa restriction: can only view own profile
  if (user.role === 'siswa') {
    const db = c.env.DB;
    const stCheck = await db.prepare('SELECT id FROM students WHERE id = ? AND nipd = ?').bind(studentId, user.id).first();
    if (!stCheck && user.linked_id !== studentId) {
      return c.html(renderErrorPage(403, 'Akses Ditolak', 'Anda hanya dapat melihat data diri sendiri.', undefined, user), 403);
    }
  }

  // Guru restriction: can only view students in their homeroom class
  if (user.role === 'guru' && user.homeroom_class) {
    const db = c.env.DB;
    const classCheck = await db.prepare('SELECT class_name FROM students WHERE id = ?').bind(studentId).first<{ class_name: string }>();
    if (classCheck && classCheck.class_name !== user.homeroom_class) {
      return c.html(renderErrorPage(403, 'Akses Ditolak', `Anda hanya dapat melihat siswa di kelas ${user.homeroom_class}.`, undefined, user), 403);
    }
  }

  const db = c.env.DB;

  // Fetch student & parent data
  const student = await db.prepare(`
    SELECT 
      s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.photo_url, s.birth_place, s.birth_date,
      p.father_name, p.is_father_alive, p.mother_name, p.is_mother_alive,
      ps.required_photo, ps.required_kk, ps.required_akte
    FROM students s
    LEFT JOIN student_parents p ON s.id = p.student_id
    LEFT JOIN priority_students ps ON s.id = ps.student_id
    WHERE s.id = ?
  `).bind(studentId).first<Student>();

  if (!student) {
    return c.html(renderErrorPage(404, 'Siswa Tidak Ditemukan', 'Data siswa dengan ID tersebut tidak ditemukan di database.', undefined, user), 404);
  }

  // Fetch student documents
  const docsRes = await db.prepare(`
    SELECT id, student_id, doc_type, file_path, file_url, status, rejection_note, reviewed_by, reviewed_at, uploaded_at
    FROM student_documents
    WHERE student_id = ?
  `).bind(studentId).all<StudentDocument>();

  const documents = docsRes.results || [];
  const appSettings = await getAppSettings(db);

  const permsRes = await db.prepare('SELECT document_type, is_allowed FROM student_document_permissions WHERE student_id = ?').bind(studentId).all<any>();
  const studentPermissions: Record<string, boolean> = {};
  if (permsRes.results) {
    permsRes.results.forEach(p => {
      studentPermissions[p.document_type] = p.is_allowed === 1;
    });
  }

  const content = renderStudentDetailPage(student, documents, user.role, flash, appSettings, studentPermissions);
  return c.html(renderLayout(`Detail Siswa - ${student.name}`, user, content, 'students'));
});

// Create new student API (Admin & Guru)
app.post('/api/students', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.text('Akses Ditolak: Siswa tidak diperkenankan menambah data.', 403);
  }

  const body = await c.req.parseBody();
  const db = c.env.DB;

  const nipd = String(body.nipd || '').trim() || null;
  const nisn = String(body.nisn || '').trim() || null;
  const nik = String(body.nik || '').trim() || null;
  const name = String(body.name || '').trim();
  const class_name = String(body.class_name || '').trim();
  const birth_place = String(body.birth_place || '').trim();
  const birth_date = String(body.birth_date || '').trim();

  const father_name = String(body.father_name || '').trim();
  const is_father_alive = body.is_father_alive === '0' ? 0 : 1;
  const mother_name = String(body.mother_name || '').trim();
  const is_mother_alive = body.is_mother_alive === '0' ? 0 : 1;

  // Insert into students table
  const insertStudent = await db.prepare(`
    INSERT INTO students (nipd, nisn, nik, name, class_name, birth_place, birth_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `).bind(nipd, nisn, nik, name, class_name, birth_place, birth_date).first<{ id: number }>();

  if (insertStudent?.id) {
    // Create initial student_parents record
    await db.prepare(`
      INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(student_id) DO UPDATE SET
        father_name = excluded.father_name,
        is_father_alive = excluded.is_father_alive,
        mother_name = excluded.mother_name,
        is_mother_alive = excluded.is_mother_alive
    `).bind(insertStudent.id, father_name, is_father_alive, mother_name, is_mother_alive).run();
  }

  return c.redirect('/students');
});

app.post('/api/students/:id/update', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.text('Akses Ditolak', 403);
  }

  const studentId = parseInt(c.req.param('id'), 10);

  const access = await checkStudentAccess(c, studentId);
  if (!access.allowed) {
    return c.text(access.message || 'Akses Ditolak', 403);
  }

  const body = await c.req.parseBody();
  const db = c.env.DB;

  const nipd = String(body.nipd || '').trim() || null;
  const nisn = String(body.nisn || '').trim() || null;
  const nik = String(body.nik || '').trim() || null;
  const name = String(body.name || '').trim();
  const class_name = String(body.class_name || '').trim();
  const birth_place = String(body.birth_place || '').trim();
  const birth_date = String(body.birth_date || '').trim();

  await db.prepare(`
    UPDATE students 
    SET nipd = ?, nisn = ?, nik = ?, name = ?, class_name = ?, birth_place = ?, birth_date = ?
    WHERE id = ?
  `).bind(nipd, nisn, nik, name, class_name, birth_place, birth_date, studentId).run();

  return c.redirect(`/students/${studentId}?flash=Data+dasar+berhasil+perbarui.`);
});

app.post('/api/students/:id/parents', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.text('Akses Ditolak', 403);
  }

  const studentId = parseInt(c.req.param('id'), 10);

  const access = await checkStudentAccess(c, studentId);
  if (!access.allowed) {
    return c.text(access.message || 'Akses Ditolak', 403);
  }

  const body = await c.req.parseBody();
  const db = c.env.DB;

  const father_name = String(body.father_name || '').trim();
  const mother_name = String(body.mother_name || '').trim();

  // If checkbox parameter is unchecked, browser omits it -> evaluates to 0
  const is_father_alive = body.is_father_alive === '1' ? 1 : 0;
  const is_mother_alive = body.is_mother_alive === '1' ? 1 : 0;

  // UPSERT parent record
  await db.prepare(`
    INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(student_id) DO UPDATE SET
      father_name = excluded.father_name,
      is_father_alive = excluded.is_father_alive,
      mother_name = excluded.mother_name,
      is_mother_alive = excluded.is_mother_alive
  `).bind(studentId, father_name, is_father_alive, mother_name, is_mother_alive).run();

  return c.redirect(`/students/${studentId}?flash=Data+orang+tua+berhasil+diperbarui.`);
});

// ----------------------------------------------------
// EXPORT DATA SISWA KE EXCEL (XLSX) - Sheet Per Kelas
// ----------------------------------------------------
app.get('/api/students/export', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.text('Akses Ditolak', 403);
  }

  const db = c.env.DB;

  // Fetch all students with parent data
  const studentsRes = await db.prepare(`
    SELECT 
      s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.birth_place, s.birth_date,
      p.father_name, p.is_father_alive, p.mother_name, p.is_mother_alive
    FROM students s
    LEFT JOIN student_parents p ON s.id = p.student_id
    ORDER BY s.class_name ASC, s.name ASC
  `).all<Student>();

  const students = studentsRes.results || [];

  // Group students by class
  const classMap: Record<string, Student[]> = {};
  students.forEach(s => {
    const cls = s.class_name || 'Tanpa Kelas';
    if (!classMap[cls]) classMap[cls] = [];
    classMap[cls].push(s);
  });

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Create a sheet for each class
  const sortedClasses = Object.keys(classMap).sort();
  sortedClasses.forEach(className => {
    const classStudents = classMap[className];

    // Build data rows with header
    const sheetData: any[][] = [
      ['DATA PESERTA DIDIK - KELAS ' + className],
      ['SD INPRES LELINGLUAN'],
      [],
      ['ID Siswa', 'No', 'NIPD', 'NISN', 'NIK', 'Nama Lengkap', 'Kelas', 'Tempat Lahir', 'Tanggal Lahir', 'Nama Ayah', 'Status Ayah', 'Nama Ibu', 'Status Ibu']
    ];

    // Helper untuk konversi format tanggal apapun ke dd-mm-yyyy
    function formatDateDDMMYYYY(dateStr: string | null | undefined): string {
      if (!dateStr || dateStr.trim() === '' || dateStr.trim() === '-') return '';
      const clean = dateStr.trim();

      // Jika sudah format dd-mm-yyyy (2 digit-2 digit-4 digit)
      if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) return clean;

      // Jika format yyyy-mm-dd atau yyyy/mm/dd
      const isoMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (isoMatch) {
        const [_, y, m, d] = isoMatch;
        return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
      }

      // Jika format dd/mm/yyyy
      const slashMatch = clean.match(/^(\d{1,2})[/](\d{1,2})[/](\d{4})/);
      if (slashMatch) {
        const [_, d, m, y] = slashMatch;
        return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
      }

      // Fallback via Date object
      try {
        const dt = new Date(clean);
        if (!isNaN(dt.getTime())) {
          const d = String(dt.getDate()).padStart(2, '0');
          const m = String(dt.getMonth() + 1).padStart(2, '0');
          const y = dt.getFullYear();
          return `${d}-${m}-${y}`;
        }
      } catch (e) { }

      return clean;
    }

    classStudents.forEach((s, idx) => {
      sheetData.push([
        s.id,
        idx + 1,
        s.nipd ? String(s.nipd) : '',
        s.nisn ? String(s.nisn) : '',
        s.nik ? String(s.nik) : '',
        s.name,
        s.class_name,
        s.birth_place || '',
        formatDateDDMMYYYY(s.birth_date),
        s.father_name || '',
        s.is_father_alive === 0 ? 'Almarhum' : 'Hidup',
        s.mother_name || '',
        s.is_mother_alive === 0 ? 'Almarhum' : 'Hidup'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Format NIPD, NISN, NIK (kolom C, D, E) sebagai Teks murni agar tidak jadi scientific notation (9.109E+15)
    Object.keys(ws).forEach(cellKey => {
      if (cellKey.startsWith('!') || !cellKey.match(/^[C-E]/)) return;
      const cell = ws[cellKey];
      if (cell && typeof cell.v !== 'undefined') {
        cell.t = 's'; // Force type String
        cell.z = '@'; // Format text
      }
    });

    // Set column widths for print-readiness
    ws['!cols'] = [
      { wch: 10 },  // ID Siswa
      { wch: 4 },   // No
      { wch: 12 },  // NIPD
      { wch: 14 },  // NISN
      { wch: 18 },  // NIK
      { wch: 28 },  // Nama Lengkap
      { wch: 8 },   // Kelas
      { wch: 16 },  // Tempat Lahir
      { wch: 14 },  // Tanggal Lahir
      { wch: 24 },  // Nama Ayah
      { wch: 12 },  // Status Ayah
      { wch: 24 },  // Nama Ibu
      { wch: 12 },  // Status Ibu
    ];

    // Merge title rows
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
    ];

    // Safe sheet name (max 31 chars, no special chars)
    const safeSheetName = ('Kelas ' + className).substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  });

  // If no data, create empty sheet
  if (sortedClasses.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([['Tidak ada data siswa.']]);
    XLSX.utils.book_append_sheet(wb, ws, 'Kosong');
  }

  // Generate buffer
  const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  const filename = `Data_PD_SD_Inpres_Lelingluan_${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new Response(xlsxBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
    },
  });
});

// ----------------------------------------------------
// 1. API VALIDASI IMPORT EXCEL (Tanpa Mengubah DB)
// ----------------------------------------------------
app.post('/api/students/validate-import', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.json({ success: false, message: 'Akses Ditolak' }, 403);
  }

  try {
    const { rows } = await c.req.json<{ rows: any[] }>();
    if (!rows || !Array.isArray(rows)) {
      return c.json({ success: false, message: 'Data rows tidak valid' }, 400);
    }

    const db = c.env.DB;

    // Ambil data siswa & orang tua yang sudah ada dari D1 DB
    const existingRes = await db.prepare(`
      SELECT 
        s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.birth_place, s.birth_date,
        p.father_name, p.mother_name
      FROM students s
      LEFT JOIN student_parents p ON s.id = p.student_id
    `).all<any>();
    const existingStudents = existingRes.results || [];

    // Buat lookup maps
    const byNisn = new Map<string, any>();
    const byNipd = new Map<string, any>();
    const byNameClass = new Map<string, any>();

    existingStudents.forEach((s: any) => {
      if (s.nisn) byNisn.set(String(s.nisn).trim().toLowerCase(), s);
      if (s.nipd) byNipd.set(String(s.nipd).trim().toLowerCase(), s);
      const nameKey = `${String(s.name).trim().toLowerCase()}|${String(s.class_name).trim().toLowerCase()}`;
      byNameClass.set(nameKey, s);
    });

    let countNew = 0;
    let countUpdate = 0;
    let countSkip = 0;

    const results = rows.map((r) => {
      const nameKey = `${String(r.name || '').trim().toLowerCase()}|${String(r.class_name || '').trim().toLowerCase()}`;
      let matched = null;

      if (r.nisn) matched = byNisn.get(String(r.nisn).trim().toLowerCase());
      if (!matched && r.nipd) matched = byNipd.get(String(r.nipd).trim().toLowerCase());
      if (!matched) matched = byNameClass.get(nameKey);

      if (matched) {
        // Cek perubahan kolom kosong
        const isEmpty = (v: any) => v === null || v === undefined || String(v).trim() === '';
        const changes: string[] = [];

        if (isEmpty(matched.nipd) && r.nipd) changes.push('NIPD');
        if (isEmpty(matched.nisn) && r.nisn) changes.push('NISN');
        if (isEmpty(matched.nik) && r.nik) changes.push('NIK');
        if (isEmpty(matched.class_name) && r.class_name) changes.push('Kelas');
        if (isEmpty(matched.birth_place) && r.birth_place) changes.push('Tempat Lahir');
        if (isEmpty(matched.birth_date) && r.birth_date) changes.push('Tanggal Lahir');
        if (isEmpty(matched.father_name) && r.father_name) changes.push('Nama Ayah');
        if (isEmpty(matched.mother_name) && r.mother_name) changes.push('Nama Ibu');

        if (changes.length > 0) {
          countUpdate++;
          return { status: 'update', matchedId: matched.id, changes };
        } else {
          countSkip++;
          return { status: 'skip', matchedId: matched.id, changes: [] };
        }
      } else {
        countNew++;
        return { status: 'new', matchedId: null, changes: [] };
      }
    });

    return c.json({
      success: true,
      summary: { countNew, countUpdate, countSkip, total: rows.length },
      results
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ----------------------------------------------------
// 2. API EKSEKUSI KIRIM IMPORT EXCEL KE DATABASE
// ----------------------------------------------------
app.post('/api/students/execute-import', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.json({ success: false, message: 'Akses Ditolak' }, 403);
  }

  try {
    const { rows, validation } = await c.req.json<{ rows: any[]; validation: any[] }>();
    if (!rows || !validation || rows.length !== validation.length) {
      return c.json({ success: false, message: 'Data validasi tidak sesuai dengan baris Excel' }, 400);
    }

    const db = c.env.DB;
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Array penampung prepared statement D1 untuk dieksekusi secara batch sekaligus
    const batchStatements: D1PreparedStatement[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const val = validation[i];

      if (val.status === 'new') {
        // Insert Siswa Baru via Statement Batch
        batchStatements.push(
          db.prepare(`
            INSERT INTO students (nipd, nisn, nik, name, class_name, birth_place, birth_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(r.nipd || null, r.nisn || null, r.nik || null, r.name, r.class_name || '', r.birth_place || null, r.birth_date || null)
        );

        if (r.father_name || r.mother_name) {
          batchStatements.push(
            db.prepare(`
              INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive)
              VALUES ((SELECT last_insert_rowid()), ?, 1, ?, 1)
            `).bind(r.father_name || '', r.mother_name || '')
          );
        }
        addedCount++;

      } else if (val.status === 'update' && val.matchedId) {
        // Update Kolom Kosong
        const studentId = val.matchedId;
        const studentUpdates: string[] = [];
        const studentBinds: any[] = [];

        if (val.changes.includes('NIPD')) { studentUpdates.push('nipd = ?'); studentBinds.push(r.nipd); }
        if (val.changes.includes('NISN')) { studentUpdates.push('nisn = ?'); studentBinds.push(r.nisn); }
        if (val.changes.includes('NIK')) { studentUpdates.push('nik = ?'); studentBinds.push(r.nik); }
        if (val.changes.includes('Kelas')) { studentUpdates.push('class_name = ?'); studentBinds.push(r.class_name); }
        if (val.changes.includes('Tempat Lahir')) { studentUpdates.push('birth_place = ?'); studentBinds.push(r.birth_place); }
        if (val.changes.includes('Tanggal Lahir')) { studentUpdates.push('birth_date = ?'); studentBinds.push(r.birth_date); }

        if (studentUpdates.length > 0) {
          studentBinds.push(studentId);
          batchStatements.push(
            db.prepare(`UPDATE students SET ${studentUpdates.join(', ')} WHERE id = ?`).bind(...studentBinds)
          );
        }

        // Update Parent via Upsert
        const parentUpdates: string[] = [];
        const parentBinds: any[] = [];

        if (val.changes.includes('Nama Ayah')) { parentUpdates.push('father_name = ?'); parentBinds.push(r.father_name); }
        if (val.changes.includes('Nama Ibu')) { parentUpdates.push('mother_name = ?'); parentBinds.push(r.mother_name); }

        if (parentUpdates.length > 0) {
          batchStatements.push(
            db.prepare(`
              INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive)
              VALUES (?, ?, 1, ?, 1)
              ON CONFLICT(student_id) DO UPDATE SET ${parentUpdates.join(', ')}
            `).bind(studentId, r.father_name || '', r.mother_name || '', ...parentBinds)
          );
        }
        updatedCount++;

      } else {
        skippedCount++;
      }
    }

    // Eksekusi seluruh transaksi secara instan dalam 1 batch tunggal ke Cloudflare D1
    if (batchStatements.length > 0) {
      // Chunk per 100 statements jika data sangat banyak untuk keamanan batas D1
      const CHUNK_SIZE = 100;
      for (let i = 0; i < batchStatements.length; i += CHUNK_SIZE) {
        const chunk = batchStatements.slice(i, i + CHUNK_SIZE);
        await db.batch(chunk);
      }
    }

    const parts: string[] = [];
    if (addedCount > 0) parts.push(`${addedCount} siswa baru ditambahkan`);
    if (updatedCount > 0) parts.push(`${updatedCount} data diperbarui`);
    if (skippedCount > 0) parts.push(`${skippedCount} dilewati`);

    const message = `Import Berhasil! ${parts.join(', ')}.`;
    return c.json({ success: true, message });

  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ----------------------------------------------------
// 3. API VALIDASI BATCH UPDATE BERBASIS ID STUDENT
// ----------------------------------------------------
app.post('/api/students/validate-update-by-id', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.json({ success: false, message: 'Akses Ditolak' }, 403);
  }

  try {
    const { rows, selectedFields } = await c.req.json<{ rows: any[]; selectedFields: string[] }>();
    if (!rows || !Array.isArray(rows) || !selectedFields || !Array.isArray(selectedFields)) {
      return c.json({ success: false, message: 'Data rows atau selectedFields tidak valid' }, 400);
    }

    if (selectedFields.length === 0) {
      return c.json({ success: false, message: 'Pilih setidaknya satu kolom yang ingin di-update' }, 400);
    }

    const db = c.env.DB;

    // Fetch existing students & parents by ID
    const existingRes = await db.prepare(`
      SELECT 
        s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.birth_place, s.birth_date,
        p.father_name, p.is_father_alive, p.mother_name, p.is_mother_alive
      FROM students s
      LEFT JOIN student_parents p ON s.id = p.student_id
    `).all<any>();
    const existingStudents = existingRes.results || [];

    const byId = new Map<number, any>();
    existingStudents.forEach((s: any) => {
      byId.set(Number(s.id), s);
    });

    let countFound = 0;
    let countNotFound = 0;

    const fieldLabels: Record<string, string> = {
      nipd: 'NIPD',
      nisn: 'NISN',
      nik: 'NIK',
      name: 'Nama Lengkap',
      class_name: 'Kelas',
      birth_place: 'Tempat Lahir',
      birth_date: 'Tanggal Lahir',
      father_name: 'Nama Ayah',
      is_father_alive: 'Status Ayah',
      mother_name: 'Nama Ibu',
      is_mother_alive: 'Status Ibu'
    };

    const results = rows.map((r) => {
      const studentId = Number(r.id);
      if (!studentId || isNaN(studentId)) {
        countNotFound++;
        return { status: 'not_found', matchedId: null, message: 'ID Siswa Kosong / Tidak Valid', changes: [] };
      }

      const matched = byId.get(studentId);
      if (!matched) {
        countNotFound++;
        return { status: 'not_found', matchedId: studentId, message: `ID ${studentId} Tidak Ditemukan di DB`, changes: [] };
      }

      countFound++;

      // Field comparison for selectedFields
      const fieldDiffs: Array<{ field: string; label: string; oldValue: any; newValue: any }> = [];

      selectedFields.forEach((f) => {
        let oldVal = matched[f];
        let newVal = r[f];

        if (f === 'is_father_alive' || f === 'is_mother_alive') {
          if (typeof newVal === 'string') {
            const lower = newVal.trim().toLowerCase();
            newVal = (lower === '0' || lower === 'almarhum' || lower === 'meninggal') ? 'Almarhum' : 'Hidup';
          } else if (newVal === 0) {
            newVal = 'Almarhum';
          } else {
            newVal = 'Hidup';
          }
          oldVal = oldVal === 0 ? 'Almarhum' : 'Hidup';
        }

        const strOld = oldVal === null || oldVal === undefined ? '' : String(oldVal).trim();
        const strNew = newVal === null || newVal === undefined ? '' : String(newVal).trim();

        fieldDiffs.push({
          field: f,
          label: fieldLabels[f] || f,
          oldValue: strOld || '(Kosong)',
          newValue: strNew || '(Kosong)'
        });
      });

      return {
        status: 'found',
        matchedId: matched.id,
        matchedName: matched.name,
        matchedClass: matched.class_name,
        changes: fieldDiffs
      };
    });

    return c.json({
      success: true,
      summary: { countFound, countNotFound, total: rows.length },
      results
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ----------------------------------------------------
// 4. API EKSEKUSI BATCH UPDATE BERBASIS ID STUDENT
// ----------------------------------------------------
app.post('/api/students/execute-update-by-id', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.json({ success: false, message: 'Akses Ditolak' }, 403);
  }

  try {
    const { rows, selectedFields, validation } = await c.req.json<{ rows: any[]; selectedFields: string[]; validation: any[] }>();
    if (!rows || !selectedFields || !validation || rows.length !== validation.length) {
      return c.json({ success: false, message: 'Data validasi tidak sesuai' }, 400);
    }

    if (selectedFields.length === 0) {
      return c.json({ success: false, message: 'Tidak ada kolom yang dipilih untuk di-update' }, 400);
    }

    const db = c.env.DB;
    let updatedCount = 0;
    let skippedCount = 0;

    const studentTableFields = ['nipd', 'nisn', 'nik', 'name', 'class_name', 'birth_place', 'birth_date'];
    const parentTableFields = ['father_name', 'is_father_alive', 'mother_name', 'is_mother_alive'];

    const activeStudentFields = selectedFields.filter(f => studentTableFields.includes(f));
    const activeParentFields = selectedFields.filter(f => parentTableFields.includes(f));

    const batchStatements: D1PreparedStatement[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const val = validation[i];

      if (val.status !== 'found' || !val.matchedId) {
        skippedCount++;
        continue;
      }

      const studentId = Number(val.matchedId);

      // Update students table
      if (activeStudentFields.length > 0) {
        const setClauses: string[] = [];
        const binds: any[] = [];

        activeStudentFields.forEach(f => {
          setClauses.push(`${f} = ?`);
          let val = r[f];
          if (val === undefined || val === null || String(val).trim() === '') {
            binds.push(null);
          } else {
            binds.push(String(val).trim());
          }
        });

        binds.push(studentId);
        batchStatements.push(
          db.prepare(`UPDATE students SET ${setClauses.join(', ')} WHERE id = ?`).bind(...binds)
        );
      }

      // Update student_parents table (UPSERT)
      if (activeParentFields.length > 0) {
        const getParentVal = (f: string) => {
          let v = r[f];
          if (f === 'is_father_alive' || f === 'is_mother_alive') {
            if (typeof v === 'string') {
              const lower = v.trim().toLowerCase();
              return (lower === '0' || lower === 'almarhum' || lower === 'meninggal') ? 0 : 1;
            }
            return v === 0 ? 0 : 1;
          }
          return v === undefined || v === null || String(v).trim() === '' ? null : String(v).trim();
        };

        const updateClauses: string[] = [];
        activeParentFields.forEach(f => {
          updateClauses.push(`${f} = excluded.${f}`);
        });

        batchStatements.push(
          db.prepare(`
            INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(student_id) DO UPDATE SET ${updateClauses.join(', ')}
          `).bind(
            studentId,
            getParentVal('father_name') ?? '',
            getParentVal('is_father_alive') ?? 1,
            getParentVal('mother_name') ?? '',
            getParentVal('is_mother_alive') ?? 1
          )
        );
      }

      updatedCount++;
    }

    if (batchStatements.length > 0) {
      const CHUNK_SIZE = 100;
      for (let i = 0; i < batchStatements.length; i += CHUNK_SIZE) {
        const chunk = batchStatements.slice(i, i + CHUNK_SIZE);
        await db.batch(chunk);
      }
    }

    const message = `Update Batch Berhasil! ${updatedCount} data siswa diperbarui berbasis ID Student${skippedCount > 0 ? ` (${skippedCount} baris dilewati karena ID tidak ditemukan)` : ''}.`;
    return c.json({ success: true, message });

  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});
app.post('/api/students/import', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.text('Akses Ditolak', 403);
  }

  try {
    const body = await c.req.parseBody();
    const file = body['excel_file'] as File | undefined;

    if (!file || !(file instanceof File)) {
      return c.redirect('/students?flash=File+Excel+tidak+ditemukan.+Pilih+file+.xlsx+terlebih+dahulu.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

    const db = c.env.DB;
    let updatedCount = 0;  // Siswa yang datanya di-update (kolom kosong diisi)
    let addedCount = 0;    // Siswa baru yang ditambahkan
    let skippedCount = 0;  // Baris yang dilewati (tidak ada perubahan / error)

    // 1. Ambil semua data siswa + orang tua yang sudah ada di database
    const existingRes = await db.prepare(`
      SELECT 
        s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.birth_place, s.birth_date,
        p.father_name, p.mother_name
      FROM students s
      LEFT JOIN student_parents p ON s.id = p.student_id
      ORDER BY s.id
    `).all<any>();
    const existingStudents = existingRes.results || [];

    // 2. Buat lookup maps untuk pencocokan cepat
    const byNisn = new Map<string, any>();
    const byNipd = new Map<string, any>();
    const byNameClass = new Map<string, any>();

    existingStudents.forEach((s: any) => {
      if (s.nisn) byNisn.set(String(s.nisn).trim().toLowerCase(), s);
      if (s.nipd) byNipd.set(String(s.nipd).trim().toLowerCase(), s);
      const nameKey = `${String(s.name).trim().toLowerCase()}|${String(s.class_name).trim().toLowerCase()}`;
      byNameClass.set(nameKey, s);
    });

    // Process each sheet
    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      // Find header row - look for 'Nama' or 'Nama Lengkap' column
      let headerIdx = -1;
      let colMap: Record<string, number> = {};

      for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const row = rows[i];
        if (!row || !Array.isArray(row)) continue;

        const rowLower = row.map((v: any) => String(v || '').toLowerCase().trim());

        const hasName = rowLower.some((v: string) => v === 'nama' || v === 'nama lengkap' || v === 'nama siswa');
        if (hasName) {
          headerIdx = i;
          rowLower.forEach((val: string, idx: number) => {
            if (val === 'nipd' || val === 'no. induk' || val === 'no induk') colMap['nipd'] = idx;
            if (val === 'nisn') colMap['nisn'] = idx;
            if (val === 'nik') colMap['nik'] = idx;
            if (val === 'nama' || val === 'nama lengkap' || val === 'nama siswa') colMap['name'] = idx;
            if (val === 'kelas' || val === 'class' || val === 'rombel') colMap['class_name'] = idx;
            if (val === 'tempat lahir' || val === 'tmp lahir' || val === 'tmp. lahir') colMap['birth_place'] = idx;
            if (val === 'tanggal lahir' || val === 'tgl lahir' || val === 'tgl. lahir') colMap['birth_date'] = idx;
            if (val === 'nama ayah' || val === 'ayah') colMap['father_name'] = idx;
            if (val === 'nama ibu' || val === 'ibu') colMap['mother_name'] = idx;
          });
          break;
        }
      }

      if (headerIdx < 0 || !colMap['name']) continue;

      // Process data rows
      for (let i = headerIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !Array.isArray(row)) continue;

        const name = String(row[colMap['name']] || '').trim();
        if (!name || name === '-') continue;

        const cleanVal = (idx: number | undefined): string | null => {
          if (idx === undefined) return null;
          const v = String(row[idx] || '').trim();
          return (v === '' || v === '-') ? null : v;
        };

        const excelNipd = cleanVal(colMap['nipd']);
        const excelNisn = cleanVal(colMap['nisn']);
        const excelNik = cleanVal(colMap['nik']);
        const excelClassName = cleanVal(colMap['class_name']) || '';
        const excelBirthPlace = cleanVal(colMap['birth_place']);
        const excelBirthDate = cleanVal(colMap['birth_date']);
        const excelFatherName = cleanVal(colMap['father_name']);
        const excelMotherName = cleanVal(colMap['mother_name']);

        try {
          // 3. Cari siswa yang cocok di database (prioritas: NISN > NIPD > Nama+Kelas)
          let matchedStudent: any = null;

          if (excelNisn) {
            matchedStudent = byNisn.get(excelNisn.toLowerCase());
          }
          if (!matchedStudent && excelNipd) {
            matchedStudent = byNipd.get(excelNipd.toLowerCase());
          }
          if (!matchedStudent) {
            const nameKey = `${name.toLowerCase()}|${excelClassName.toLowerCase()}`;
            matchedStudent = byNameClass.get(nameKey);
          }

          if (matchedStudent) {
            // ====== SISWA SUDAH ADA DI DATABASE ======
            // Cek kolom mana saja yang masih kosong di DB tapi sudah terisi di Excel
            const fieldsToUpdate: string[] = [];
            const valuesToBind: any[] = [];

            // Helper: jika kolom DB kosong DAN Excel punya data, maka update
            const isEmpty = (v: any) => v === null || v === undefined || String(v).trim() === '';

            if (isEmpty(matchedStudent.nipd) && excelNipd) {
              fieldsToUpdate.push('nipd = ?');
              valuesToBind.push(excelNipd);
            }
            if (isEmpty(matchedStudent.nisn) && excelNisn) {
              fieldsToUpdate.push('nisn = ?');
              valuesToBind.push(excelNisn);
            }
            if (isEmpty(matchedStudent.nik) && excelNik) {
              fieldsToUpdate.push('nik = ?');
              valuesToBind.push(excelNik);
            }
            if (isEmpty(matchedStudent.class_name) && excelClassName) {
              fieldsToUpdate.push('class_name = ?');
              valuesToBind.push(excelClassName);
            }
            if (isEmpty(matchedStudent.birth_place) && excelBirthPlace) {
              fieldsToUpdate.push('birth_place = ?');
              valuesToBind.push(excelBirthPlace);
            }
            if (isEmpty(matchedStudent.birth_date) && excelBirthDate) {
              fieldsToUpdate.push('birth_date = ?');
              valuesToBind.push(excelBirthDate);
            }

            // Update student fields jika ada yang perlu diisi
            if (fieldsToUpdate.length > 0) {
              valuesToBind.push(matchedStudent.id);
              await db.prepare(`
                UPDATE students SET ${fieldsToUpdate.join(', ')} WHERE id = ?
              `).bind(...valuesToBind).run();
            }

            // Cek data orang tua — update jika kosong di DB tapi ada di Excel
            let parentChanged = false;
            const parentUpdates: string[] = [];
            const parentValues: any[] = [];

            if (isEmpty(matchedStudent.father_name) && excelFatherName) {
              parentUpdates.push('father_name = ?');
              parentValues.push(excelFatherName);
              parentChanged = true;
            }
            if (isEmpty(matchedStudent.mother_name) && excelMotherName) {
              parentUpdates.push('mother_name = ?');
              parentValues.push(excelMotherName);
              parentChanged = true;
            }

            if (parentChanged) {
              // Cek apakah record parent sudah ada
              const existingParent = await db.prepare(
                'SELECT id FROM student_parents WHERE student_id = ?'
              ).bind(matchedStudent.id).first<{ id: number }>();

              if (existingParent) {
                parentValues.push(matchedStudent.id);
                await db.prepare(`
                  UPDATE student_parents SET ${parentUpdates.join(', ')} WHERE student_id = ?
                `).bind(...parentValues).run();
              } else {
                // Belum ada record parent, buat baru
                await db.prepare(`
                  INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive)
                  VALUES (?, ?, 1, ?, 1)
                `).bind(matchedStudent.id, excelFatherName || '', excelMotherName || '').run();
              }
            }

            if (fieldsToUpdate.length > 0 || parentChanged) {
              updatedCount++;
              // Update lookup data supaya baris berikutnya pakai data terbaru
              if (excelNipd && isEmpty(matchedStudent.nipd)) matchedStudent.nipd = excelNipd;
              if (excelNisn && isEmpty(matchedStudent.nisn)) matchedStudent.nisn = excelNisn;
              if (excelNik && isEmpty(matchedStudent.nik)) matchedStudent.nik = excelNik;
              if (excelBirthPlace && isEmpty(matchedStudent.birth_place)) matchedStudent.birth_place = excelBirthPlace;
              if (excelBirthDate && isEmpty(matchedStudent.birth_date)) matchedStudent.birth_date = excelBirthDate;
              if (excelFatherName && isEmpty(matchedStudent.father_name)) matchedStudent.father_name = excelFatherName;
              if (excelMotherName && isEmpty(matchedStudent.mother_name)) matchedStudent.mother_name = excelMotherName;
            } else {
              skippedCount++; // Semua data sudah lengkap, tidak ada yang perlu diisi
            }
          } else {
            // ====== SISWA BARU — BELUM ADA DI DATABASE ======
            const insertResult = await db.prepare(`
              INSERT INTO students (nipd, nisn, nik, name, class_name, birth_place, birth_date)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              RETURNING id
            `).bind(excelNipd, excelNisn, excelNik, name, excelClassName, excelBirthPlace, excelBirthDate).first<{ id: number }>();

            if (insertResult?.id) {
              if (excelFatherName || excelMotherName) {
                await db.prepare(`
                  INSERT INTO student_parents (student_id, father_name, is_father_alive, mother_name, is_mother_alive)
                  VALUES (?, ?, 1, ?, 1)
                `).bind(insertResult.id, excelFatherName || '', excelMotherName || '').run();
              }

              // Tambahkan ke lookup maps supaya tidak duplikat di sheet berikutnya
              const newStudent = {
                id: insertResult.id, nipd: excelNipd, nisn: excelNisn, nik: excelNik,
                name, class_name: excelClassName, birth_place: excelBirthPlace, birth_date: excelBirthDate,
                father_name: excelFatherName, mother_name: excelMotherName
              };
              if (excelNisn) byNisn.set(excelNisn.toLowerCase(), newStudent);
              if (excelNipd) byNipd.set(excelNipd.toLowerCase(), newStudent);
              byNameClass.set(`${name.toLowerCase()}|${excelClassName.toLowerCase()}`, newStudent);

              addedCount++;
            }
          }
        } catch (err) {
          skippedCount++;
        }
      }
    }

    // Build detailed flash message
    const parts: string[] = [];
    if (updatedCount > 0) parts.push(`${updatedCount} data diperbarui`);
    if (addedCount > 0) parts.push(`${addedCount} siswa baru ditambahkan`);
    if (skippedCount > 0) parts.push(`${skippedCount} data sudah lengkap/dilewati`);
    const summary = parts.length > 0 ? parts.join(', ') : 'Tidak ada perubahan';

    return c.redirect(`/students?flash=Import+selesai!+${encodeURIComponent(summary)}.`);
  } catch (err: any) {
    return c.redirect(`/students?flash=Gagal+import:+${encodeURIComponent(err.message || 'Error tidak diketahui')}`);
  }
});

// ----------------------------------------------------
// Cloudflare R1 Upload Routes (Photo & Legal Documents)
// ----------------------------------------------------


async function isStudentUploadAllowed(db: any, studentId: number, docType: string, settings: Record<string, string>): Promise<boolean> {
  let globalKey = '';
  if (docType === 'foto') globalKey = 'allow_photo_upload';
  if (docType === 'akte_kelahiran') globalKey = 'allow_akte_upload';
  if (docType === 'kartu_keluarga') globalKey = 'allow_kk_upload';

  // Global setting check (enabled if not '0')
  if (globalKey && settings[globalKey] !== '0') {
    return true;
  }

  // Priority student check
  const priority = await db.prepare('SELECT id FROM priority_students WHERE student_id = ?').bind(studentId).first();
  if (priority) {
    return true;
  }

  // Granular per-student permission check (fixed column name: document_type)
  const perm = (await db.prepare('SELECT is_allowed FROM student_document_permissions WHERE student_id = ? AND document_type = ?')
    .bind(studentId, docType)
    .first()) as any;

  if (perm && perm.is_allowed === 1) {
    return true;
  }

  return false;
}

app.post('/api/students/:id/upload-photo', async (c) => {
  const studentId = parseInt(c.req.param('id'), 10);
  const access = await checkStudentAccess(c, studentId);
  if (!access.allowed) {
    return c.text(access.message || 'Akses Ditolak', 403);
  }

  const db = c.env.DB;
  const settings = await getAppSettings(db);
  const user = c.get('user');
  const isStaff = user.role === 'admin' || user.role === 'guru';

  if (!isStaff) {
    const allowed = await isStudentUploadAllowed(db, studentId, 'foto', settings);
    if (!allowed) {
      return c.text('Belum diizinkan Admin untuk dokumen ini (foto).', 403);
    }
  }

  const body = await c.req.parseBody();
  const photoFile = body['photo'] as File | undefined;

  if (!photoFile || !(photoFile instanceof File)) {
    return c.text('File foto tidak ditemukan.', 400);
  }

  const ext = photoFile.name.split('.').pop() || 'jpg';
  const r1Key = `profile-photos/student_${studentId}_${Date.now()}.${ext}`;
  const fileArrayBuffer = await photoFile.arrayBuffer();

  // Stream upload directly to Cloudflare R1 Bucket
  await c.env.PORTAL_SISWA_BUCKET.put(r1Key, fileArrayBuffer, {
    httpMetadata: { contentType: photoFile.type || 'image/jpeg' }
  });

  const photoUrl = `/files/${r1Key}`;

  const isAutoApproved = user.role === 'admin' || user.role === 'guru';
  const initialStatus = isAutoApproved ? 'approved' : 'pending';
  const reviewedBy = isAutoApproved ? user.id.toString() : null;
  const reviewedAt = isAutoApproved ? new Date().toISOString() : null;

  if (isAutoApproved) {
    // Update photo_url in D1 Database immediately
    await db.prepare('UPDATE students SET photo_url = ? WHERE id = ?')
      .bind(photoUrl, studentId)
      .run();
  }

  // Also record a submission log so it appears in Riwayat Pengajuan Dokumen
  await db.prepare(`
    INSERT INTO student_document_submissions (student_id, doc_type, file_path, file_url, status, submitted_by, reviewed_by, reviewed_at)
    VALUES (?, 'foto', ?, ?, ?, ?, ?, ?)
  `).bind(studentId, r1Key, photoUrl, initialStatus, user.id.toString(), reviewedBy, reviewedAt).run();

  // Also upsert into student_documents for review tracking
  await db.prepare(`
    INSERT INTO student_documents (student_id, doc_type, file_path, file_url, status, reviewed_by, reviewed_at, rejection_note)
    VALUES (?, 'foto', ?, ?, ?, ?, ?, NULL)
    ON CONFLICT(student_id, doc_type) DO UPDATE SET
      file_path = excluded.file_path,
      file_url = excluded.file_url,
      status = excluded.status,
      reviewed_by = excluded.reviewed_by,
      reviewed_at = excluded.reviewed_at,
      rejection_note = NULL,
      uploaded_at = CURRENT_TIMESTAMP
  `).bind(studentId, r1Key, photoUrl, initialStatus, reviewedBy, reviewedAt).run();

  const flashMessage = isAutoApproved
    ? 'Foto+profil+berhasil+diupload+dan+langsung+disetujui.'
    : 'Foto+profil+berhasil+diupload+dan+menunggu+review+admin.';
  return c.redirect(`/students/${studentId}?flash=${flashMessage}`);
});

app.post('/api/students/:id/upload-doc', async (c) => {
  const studentId = parseInt(c.req.param('id'), 10);
  const access = await checkStudentAccess(c, studentId);
  if (!access.allowed) {
    return c.text(access.message || 'Akses Ditolak', 403);
  }

  const db = c.env.DB;
  const settings = await getAppSettings(db);
  const body = await c.req.parseBody();
  const docType = String(body['doc_type'] || '');
  const docFile = body['document'] as File | undefined;
  const user = c.get('user');
  const isStaff = user.role === 'admin' || user.role === 'guru';

  if (!isStaff) {
    const allowed = await isStudentUploadAllowed(db, studentId, docType, settings);
    if (!allowed) {
      return c.text(`Belum diizinkan Admin untuk dokumen ini (${docType}).`, 403);
    }
  }

  if (!['akte_kelahiran', 'kartu_keluarga'].includes(docType)) {
    return c.text('Jenis dokumen tidak valid.', 400);
  }

  if (!docFile || !(docFile instanceof File)) {
    return c.text('File dokumen tidak ditemukan.', 400);
  }

  const ext = docFile.name.split('.').pop() || 'pdf';
  const r1Key = `student-documents/student_${studentId}/${docType}_${Date.now()}.${ext}`;
  const fileArrayBuffer = await docFile.arrayBuffer();

  // Save to Cloudflare R1 Storage
  await c.env.PORTAL_SISWA_BUCKET.put(r1Key, fileArrayBuffer, {
    httpMetadata: { contentType: docFile.type || 'application/octet-stream' }
  });

  const fileUrl = `/files/${r1Key}`;

  // Upsert record into student_documents table in D1 Database with status='pending'
  await c.env.DB.prepare(`
    INSERT INTO student_documents (student_id, doc_type, file_path, file_url, status)
    VALUES (?, ?, ?, ?, 'pending')
    ON CONFLICT(student_id, doc_type) DO UPDATE SET
      file_path = excluded.file_path,
      file_url = excluded.file_url,
      status = 'pending',
      uploaded_at = CURRENT_TIMESTAMP
  `).bind(studentId, docType, r1Key, fileUrl).run();

  // Also record submission log
  await c.env.DB.prepare(`
    INSERT INTO student_document_submissions (student_id, doc_type, file_path, file_url, status, submitted_by)
    VALUES (?, ?, ?, ?, 'pending', ?)
  `).bind(studentId, docType, r1Key, fileUrl, user.id.toString()).run();

  await logAudit(c.env.DB, {
    userId: user.id.toString(),
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'UPLOAD_PENDING',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    userAgent: getUserAgent(c),
    details: `Siswa ID ${studentId} upload ${docType}`
  });

  return c.redirect(`/students/${studentId}?flash=Dokumen+${docType}+berhasil+diupload+dan+menunggu+review.`);
});

app.post('/api/students/:id/upload-dual-docs', async (c) => {
  const studentId = parseInt(c.req.param('id'), 10);
  const access = await checkStudentAccess(c, studentId);
  if (!access.allowed) {
    return c.text(access.message || 'Akses Ditolak', 403);
  }

  const body = await c.req.parseBody();
  const akteFile = body['akte_document'] as File | undefined;
  const kkFile = body['kk_document'] as File | undefined;

  let uploadedCount = 0;
  const db = c.env.DB;
  const bucket = c.env.PORTAL_SISWA_BUCKET;
  const settings = await getAppSettings(db);
  const user = c.get('user');
  const isStaff = user.role === 'admin' || user.role === 'guru';

  // Process Akte File if present
  if (akteFile && akteFile instanceof File && akteFile.size > 0) {
    if (!isStaff) {
      const allowed = await isStudentUploadAllowed(db, studentId, 'akte_kelahiran', settings);
      if (!allowed) {
        return c.text('Belum diizinkan Admin untuk dokumen ini (akte_kelahiran).', 403);
      }
    }

    const ext = akteFile.name.split('.').pop() || 'pdf';
    const r1Key = `student-documents/student_${studentId}/akte_kelahiran_${Date.now()}.${ext}`;
    const fileArrayBuffer = await akteFile.arrayBuffer();

    await bucket.put(r1Key, fileArrayBuffer, {
      httpMetadata: { contentType: akteFile.type || 'application/octet-stream' }
    });

    const fileUrl = `/files/${r1Key}`;

    await db.prepare(`
      INSERT INTO student_documents (student_id, doc_type, file_path, file_url, status)
      VALUES (?, 'akte_kelahiran', ?, ?, 'pending')
      ON CONFLICT(student_id, doc_type) DO UPDATE SET
        file_path = excluded.file_path,
        file_url = excluded.file_url,
        status = 'pending',
        uploaded_at = CURRENT_TIMESTAMP
    `).bind(studentId, r1Key, fileUrl).run();

    await db.prepare(`
      INSERT INTO student_document_submissions (student_id, doc_type, file_path, file_url, status, submitted_by)
      VALUES (?, 'akte_kelahiran', ?, ?, 'pending', ?)
    `).bind(studentId, r1Key, fileUrl, user.id.toString()).run();

    uploadedCount++;
  }

  // Process KK File if present
  if (kkFile && kkFile instanceof File && kkFile.size > 0) {
    if (!isStaff) {
      const allowed = await isStudentUploadAllowed(db, studentId, 'kartu_keluarga', settings);
      if (!allowed) {
        return c.text('Belum diizinkan Admin untuk dokumen ini (kartu_keluarga).', 403);
      }
    }

    const ext = kkFile.name.split('.').pop() || 'pdf';
    const r1Key = `student-documents/student_${studentId}/kartu_keluarga_${Date.now()}.${ext}`;
    const fileArrayBuffer = await kkFile.arrayBuffer();

    await bucket.put(r1Key, fileArrayBuffer, {
      httpMetadata: { contentType: kkFile.type || 'application/octet-stream' }
    });

    const fileUrl = `/files/${r1Key}`;

    await db.prepare(`
      INSERT INTO student_documents (student_id, doc_type, file_path, file_url, status)
      VALUES (?, 'kartu_keluarga', ?, ?, 'pending')
      ON CONFLICT(student_id, doc_type) DO UPDATE SET
        file_path = excluded.file_path,
        file_url = excluded.file_url,
        status = 'pending',
        uploaded_at = CURRENT_TIMESTAMP
    `).bind(studentId, r1Key, fileUrl).run();

    await db.prepare(`
      INSERT INTO student_document_submissions (student_id, doc_type, file_path, file_url, status, submitted_by)
      VALUES (?, 'kartu_keluarga', ?, ?, 'pending', ?)
    `).bind(studentId, r1Key, fileUrl, user.id.toString()).run();

    uploadedCount++;
  }

  if (uploadedCount === 0) {
    return c.redirect(`/students/${studentId}?flash=Pilih+minimal+1+file+dokumen+terlebih+dahulu.`);
  }

  return c.redirect(`/students/${studentId}?flash=Berhasil+mengunggah+${uploadedCount}+dokumen+legal.`);
});

// Helper function to fetch R2 Object from available buckets (PORTAL_SISWA_BUCKET & PORTAL_GURU_STORAGE)
async function fetchR2Object(env: Env, key: string): Promise<R2ObjectBody | null> {
  const cleanKey = key.replace(/^\/+/, '');
  const possibleKeys = [
    cleanKey,
    `avatars/${cleanKey}`,
    `profile-photos/${cleanKey}`,
    `uploads/${cleanKey}`
  ];

  // 1. Check PORTAL_SISWA_BUCKET
  if (env.PORTAL_SISWA_BUCKET) {
    for (const k of possibleKeys) {
      try {
        const obj = await env.PORTAL_SISWA_BUCKET.get(k);
        if (obj) return obj;
      } catch (e) { }
    }
  }

  // 2. Check PORTAL_GURU_STORAGE
  if (env.PORTAL_GURU_STORAGE) {
    for (const k of possibleKeys) {
      try {
        const obj = await env.PORTAL_GURU_STORAGE.get(k);
        if (obj) return obj;
      } catch (e) { }
    }
  }

  return null;
}

async function serveR2File(c: any, key: string) {
  const object = await fetchR2Object(c.env, key);
  if (!object) return c.notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000');

  // Infer Content-Type if missing
  if (!headers.get('content-type')) {
    if (key.endsWith('.png')) headers.set('content-type', 'image/png');
    else if (key.endsWith('.jpg') || key.endsWith('.jpeg')) headers.set('content-type', 'image/jpeg');
    else if (key.endsWith('.webp')) headers.set('content-type', 'image/webp');
    else if (key.endsWith('.pdf')) headers.set('content-type', 'application/pdf');
  }

  return c.body(object.body, 200, Object.fromEntries(headers.entries()));
}

// ----------------------------------------------------
// Cloudflare R2 File Delivery Stream Endpoints
// ----------------------------------------------------
app.get('/files/*', async (c) => {
  const r1Key = c.req.path.replace('/files/', '');
  if (!r1Key) return c.notFound();
  return serveR2File(c, r1Key);
});

// Direct Avatar / Image Fallback Handler (e.g., /avatar_1784742072378.png)
app.get('/:filename{.+\\.(?:png|jpg|jpeg|webp|gif|svg|pdf)$}', async (c) => {
  const filename = c.req.param('filename');
  return serveR2File(c, filename);
});

// ----------------------------------------------------
// Setup Accounts Route (Admin & Guru)
// ----------------------------------------------------
app.get('/admin/setup-accounts', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.role !== 'guru') {
    return c.text('Akses Ditolak: Hanya Guru dan Administrator yang dapat mengakses halaman ini.', 403);
  }

  const db = c.env.DB;
  let selectedClass = c.req.query('class_name') || '';
  const flash = c.req.query('flash') || '';

  const restrictClass = (user.role === 'guru' && user.homeroom_class) ? user.homeroom_class : null;
  if (restrictClass) {
    selectedClass = restrictClass;
  }

  let classesList: string[] = [];
  if (restrictClass) {
    classesList = [restrictClass];
  } else {
    const classesRes = await db.prepare('SELECT DISTINCT class_name FROM students ORDER BY class_name ASC').all<{ class_name: string }>();
    classesList = (classesRes.results || []).map(r => r.class_name);
  }

  let sql = `
    SELECT 
      s.id, s.nipd, s.nisn, s.name, s.class_name,
      CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END as has_account
    FROM students s
    LEFT JOIN users u ON u.id = s.nipd
  `;
  const params: any[] = [];

  if (selectedClass) {
    sql += ` WHERE s.class_name = ?`;
    params.push(selectedClass);
  }

  sql += ` ORDER BY s.class_name ASC, s.name ASC`;

  const stmt = db.prepare(sql);
  const result = params.length > 0 ? await stmt.bind(...params).all<any>() : await stmt.all<any>();
  const students = result.results || [];

  const teachersRes = await db.prepare('SELECT u.id, u.id as username, t.full_name, u.is_document_reviewer FROM users u LEFT JOIN teacher_profiles t ON u.id = t.user_id WHERE u.role = ?').bind('teacher').all<any>();
  const teachers = teachersRes.results || [];

  const content = renderSetupAccountsPage(students, classesList, selectedClass, flash, teachers, user.role === 'admin');
  return c.html(renderLayout('Setup Akun Siswa', user, content, 'setup_accounts'));
});

app.post('/api/admin/teachers/:id/reviewer', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.text('Akses Ditolak: Hanya Administrator yang dapat mengubah hak akses guru.', 403);
  }

  const db = c.env.DB;
  const teacherId = c.req.param('id');
  const body = await c.req.parseBody();
  const isReviewer = body.is_document_reviewer === '1' ? 1 : 0;

  await db.prepare('UPDATE users SET is_document_reviewer = ? WHERE id = ?').bind(isReviewer, teacherId).run();

  await logAudit(db, {
    userId: user.id,
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'UPDATE_TEACHER_REVIEWER',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    details: `Ubah status reviewer dokumen guru ${teacherId} menjadi ${isReviewer === 1 ? 'Aktif' : 'Nonaktif'}`
  });

  return c.redirect('/admin/setup-accounts?flash=Status+reviewer+guru+berhasil+diperbarui.');
});

app.post('/admin/setup-accounts/set-default', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.role !== 'guru') {
    return c.text('Akses Ditolak', 403);
  }

  const db = c.env.DB;
  const body = await c.req.parseBody();
  const nipd = String(body.nipd || '').trim();
  const studentId = parseInt(String(body.student_id), 10);

  if (!nipd || isNaN(studentId)) {
    return c.redirect('/admin/setup-accounts?flash=Data+tidak+valid');
  }

  const access = await checkStudentAccess(c, studentId);
  if (!access.allowed) {
    return c.text(access.message || 'Akses Ditolak', 403);
  }

  const salt = 'salt123';
  const pinHash = await hashPin(nipd, salt);

  await db.prepare(`
    INSERT INTO users (id, pin_hash, salt, role, plain_pin)
    VALUES (?, ?, ?, 'siswa', ?)
    ON CONFLICT(id) DO UPDATE SET
      pin_hash = excluded.pin_hash,
      salt = excluded.salt,
      role = 'siswa',
      plain_pin = excluded.plain_pin
  `).bind(nipd, pinHash, salt, nipd).run();

  await logAudit(db, {
    userId: user.id,
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'SETUP_ACCOUNT',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    details: 'Set default account for NIPD ' + nipd
  });

  return c.redirect('/admin/setup-accounts?flash=Akun+Siswa+Berhasil+Diaktifkan');
});

// Nonaktifkan Akun Siswa (Admin & Guru)
app.post('/admin/setup-accounts/deactivate', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.role !== 'guru') {
    return c.text('Akses Ditolak', 403);
  }

  const db = c.env.DB;
  const body = await c.req.parseBody();
  const nipd = String(body.nipd || '').trim();

  if (!nipd) {
    return c.redirect('/admin/setup-accounts?flash=NIPD+tidak+valid');
  }

  if (user.role === 'guru' && user.homeroom_class) {
    const classCheck = await db.prepare('SELECT class_name FROM students WHERE nipd = ?').bind(nipd).first<{ class_name: string }>();
    if (classCheck && classCheck.class_name !== user.homeroom_class) {
      return c.text(`Akses Ditolak: Anda hanya dapat menonaktifkan siswa di kelas ${user.homeroom_class}.`, 403);
    }
  }

  // Hapus dari tabel users agar tidak bisa login lagi
  await db.prepare('DELETE FROM users WHERE id = ?').bind(nipd).run();

  // Putus sesi aktif jika siswa sedang online
  await db.prepare('DELETE FROM active_sessions WHERE user_id = ?').bind(nipd).run();

  await logAudit(db, {
    userId: user.id,
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'DEACTIVATE_ACCOUNT',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    details: 'Menonaktifkan akun siswa NIPD ' + nipd
  });

  return c.redirect('/admin/setup-accounts?flash=Akun+Siswa+(' + encodeURIComponent(nipd) + ')+Berhasil+Dinonaktifkan');
});

app.post('/admin/setup-accounts/set-default-class', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.role !== 'guru') {
    return c.text('Akses Ditolak', 403);
  }

  const db = c.env.DB;
  const body = await c.req.parseBody();
  let className = String(body.class_name || '').trim();

  if (user.role === 'guru' && user.homeroom_class) {
    className = user.homeroom_class;
  }

  if (!className) {
    return c.redirect('/admin/setup-accounts?flash=Kelas+tidak+valid');
  }

  const studentsRes = await db.prepare(`
    SELECT s.id, s.nipd 
    FROM students s
    LEFT JOIN users u ON u.id = s.nipd
    WHERE s.class_name = ? AND u.id IS NULL AND s.nipd IS NOT NULL AND s.nipd != ''
  `).bind(className).all<{ id: number; nipd: string }>();

  const studentsToActivate = studentsRes.results || [];
  if (studentsToActivate.length === 0) {
    return c.redirect('/admin/setup-accounts?class_name=' + encodeURIComponent(className) + '&flash=Semua+siswa+di+kelas+ini+sudah+memiliki+akun+atau+NIPD+kosong');
  }

  const salt = 'salt123';
  const batchStatements = [];

  for (const s of studentsToActivate) {
    const pinHash = await hashPin(s.nipd, salt);
    batchStatements.push(
      db.prepare(`
        INSERT INTO users (id, pin_hash, salt, role, plain_pin)
        VALUES (?, ?, ?, 'siswa', ?)
        ON CONFLICT(id) DO UPDATE SET
          pin_hash = excluded.pin_hash,
          salt = excluded.salt,
          role = 'siswa',
          plain_pin = excluded.plain_pin
      `).bind(s.nipd, pinHash, salt, s.nipd)
    );
  }

  await db.batch(batchStatements);

  await logAudit(db, {
    userId: user.id,
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'SETUP_ACCOUNT_MASS',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    details: 'Set default accounts for class ' + className + ' (' + studentsToActivate.length + ' students)'
  });

  return c.redirect('/admin/setup-accounts?class_name=' + encodeURIComponent(className) + '&flash=' + studentsToActivate.length + '+Akun+Siswa+Berhasil+Diaktifkan');
});

// ----------------------------------------------------
// Panduan Guru Route (Admin & Guru)
// ----------------------------------------------------
app.get('/admin/guide', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.role !== 'guru') {
    return c.html(renderErrorPage(403, 'Akses Ditolak', 'Hanya Guru dan Administrator yang dapat mengakses Panduan Guru.', undefined, user), 403);
  }
  return c.html(renderGuidePage(user));
});

// ----------------------------------------------------
// Admin Settings Route (Fitur Sakelar & Pembatasan Upload)
// ----------------------------------------------------
app.get('/admin/settings', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.html(renderErrorPage(403, 'Akses Ditolak', 'Hanya Administrator yang dapat mengakses Setelan Sistem.', undefined, user), 403);
  }

  const db = c.env.DB;
  const flash = c.req.query('flash') || '';
  const settings = await getAppSettings(db);

  const content = renderAdminSettingsPage(settings, flash);
  return c.html(renderLayout('Setelan Sistem (Admin)', user, content, 'settings'));
});

app.post('/admin/settings/update', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.html(renderErrorPage(403, 'Akses Ditolak', 'Hanya Administrator yang dapat memperbarui Setelan Sistem.', undefined, user), 403);
  }

  const db = c.env.DB;
  const body = await c.req.parseBody();

  const allowPhoto = body.allow_photo_upload === '1' ? '1' : '0';
  const allowAkte = body.allow_akte_upload === '1' ? '1' : '0';
  const allowKK = body.allow_kk_upload === '1' ? '1' : '0';

  const teacherDeletePhoto = body.teacher_delete_photo === '1' ? '1' : '0';
  const teacherDeleteKk = body.teacher_delete_kk === '1' ? '1' : '0';
  const teacherDeleteAkte = body.teacher_delete_akte === '1' ? '1' : '0';

  await db.batch([
    db.prepare("INSERT INTO app_settings (key, value) VALUES ('allow_photo_upload', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP").bind(allowPhoto),
    db.prepare("INSERT INTO app_settings (key, value) VALUES ('allow_akte_upload', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP").bind(allowAkte),
    db.prepare("INSERT INTO app_settings (key, value) VALUES ('allow_kk_upload', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP").bind(allowKK),
    db.prepare("INSERT INTO app_settings (key, value) VALUES ('teacher_delete_photo', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP").bind(teacherDeletePhoto),
    db.prepare("INSERT INTO app_settings (key, value) VALUES ('teacher_delete_kk', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP").bind(teacherDeleteKk),
    db.prepare("INSERT INTO app_settings (key, value) VALUES ('teacher_delete_akte', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP").bind(teacherDeleteAkte)
  ]);

  await logAudit(db, {
    userId: user.id,
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'UPDATE_SETTINGS',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    details: `Update Setelan: Upload(Foto=${allowPhoto}, Akte=${allowAkte}, KK=${allowKK}) | Delete Guru(Foto=${teacherDeletePhoto}, KK=${teacherDeleteKk}, Akte=${teacherDeleteAkte})`
  });

  return c.redirect('/admin/settings?flash=Perubahan+setelan+berhasil+disimpan.');
});

// ----------------------------------------------------
// Homeroom Assignments Management (Admin Only)
// ----------------------------------------------------
app.get('/admin/wali-kelas', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.text('Akses Ditolak: Hanya Administrator yang dapat mengakses halaman ini.', 403);
  }
  const db = c.env.DB;
  const flash = c.req.query('flash') || '';

  // Fetch unique classes list for dropdown from students table
  const classesRes = await db.prepare("SELECT DISTINCT class_name FROM students WHERE class_name IS NOT NULL AND class_name != '' AND (status IS NULL OR status = 'active') ORDER BY class_name ASC").all<{ class_name: string }>();
  const classesList = (classesRes.results || []).map(r => r.class_name);

  // Fetch all teachers (users with role = 'teacher')
  const teachersRes = await db.prepare(`
    SELECT u.id, u.id as username, t.full_name, u.homeroom_class
    FROM users u
    LEFT JOIN teacher_profiles t ON u.id = t.user_id
    WHERE u.role = 'teacher'
    ORDER BY t.full_name ASC, u.id ASC
  `).all<any>();
  const teachers = teachersRes.results || [];

  const content = renderHomeroomManagementPage(teachers, classesList, flash);
  return c.html(renderLayout('Manajemen Wali Kelas', user, content, 'wali_kelas'));
});

app.post('/admin/wali-kelas/assign', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.text('Akses Ditolak', 403);
  }
  const db = c.env.DB;
  const body = await c.req.parseBody();
  const teacherId = String(body.teacher_id || '').trim();
  let className = String(body.class_name || '').trim();

  if (!teacherId) {
    return c.redirect('/admin/wali-kelas?flash=Data+tidak+valid');
  }

  if (className === '') {
    // Set to NULL to remove homeroom class assignment
    await db.prepare('UPDATE users SET homeroom_class = NULL WHERE id = ?').bind(teacherId).run();
  } else {
    await db.prepare('UPDATE users SET homeroom_class = ? WHERE id = ?').bind(className, teacherId).run();
  }

  await logAudit(db, {
    userId: user.id,
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'ASSIGN_HOMEROOM',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    details: `Assign homeroom class "${className || 'NULL'}" to teacher ${teacherId}`
  });

  return c.redirect('/admin/wali-kelas?flash=Wali+kelas+berhasil+diatur');
});

// ----------------------------------------------------
// API Penghapusan Dokumen Siswa (Cloudflare R2 + Cloudflare D1 Integration)
// ----------------------------------------------------
app.post('/api/students/:id/documents/delete', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, message: 'Autentikasi diperlukan.' }, 401);
    }
    if (user.role === 'siswa') {
      return c.json({ success: false, message: 'Akses Ditolak: Siswa tidak diizinkan menghapus dokumen.' }, 403);
    }

    const studentId = parseInt(c.req.param('id'), 10);
    const db = c.env.DB;
    const bucket = c.env.PORTAL_SISWA_BUCKET;

    const access = await checkStudentAccess(c, studentId);
    if (!access.allowed) {
      return c.json({ success: false, message: access.message || 'Akses Ditolak' }, 403);
    }

    let body: any = {};
    try {
      body = await c.req.parseBody();
    } catch {
      body = await c.req.json().catch(() => ({}));
    }

    const docType = String(body.doc_type || body.document_type || '').trim();
    if (!['photo', 'kartu_keluarga', 'akte_kelahiran'].includes(docType)) {
      return c.json({ success: false, message: 'Jenis dokumen tidak valid.' }, 400);
    }

    // 1. Teacher permission check from D1 app_settings
    const settings = await getAppSettings(db);
    if (user.role === 'guru') {
      let permitted = false;
      if (docType === 'photo' && settings.teacher_delete_photo === '1') permitted = true;
      if (docType === 'kartu_keluarga' && settings.teacher_delete_kk === '1') permitted = true;
      if (docType === 'akte_kelahiran' && settings.teacher_delete_akte === '1') permitted = true;

      if (!permitted) {
        await logAudit(db, {
          userId: user.id,
          userName: user.full_name || user.username,
          userRole: user.role,
          action: 'DELETE_STUDENT_DOCUMENT_FORBIDDEN',
          status: 'FAILED',
          ipAddress: getClientIp(c),
          userAgent: getUserAgent(c),
          details: `Guru ${user.full_name || user.username} mencoba menghapus ${docType} siswa ID ${studentId} tanpa izin Admin.`
        });
        return c.json({
          success: false,
          message: 'Akses Ditolak: Guru tidak memiliki izin dari Administrator untuk menghapus dokumen ini.'
        }, 403);
      }
    }

    // 2. Fetch document metadata from D1 Database
    let r2Key: string | null = null;
    let studentName = `Siswa ID ${studentId}`;

    const student = await db.prepare('SELECT id, name, photo_url FROM students WHERE id = ?').bind(studentId).first<{ id: number; name: string; photo_url: string | null }>();
    if (!student) {
      return c.json({ success: false, message: 'Data siswa tidak ditemukan di database.' }, 404);
    }
    studentName = student.name;

    if (docType === 'photo') {
      if (!student.photo_url) {
        return c.json({ success: false, message: 'Foto profil siswa tidak ditemukan atau sudah dihapus.' }, 404);
      }
      r2Key = student.photo_url.replace(/^\/files\//, '').replace(/^\/+/, '');
    } else {
      const docRecord = await db.prepare(`
        SELECT id, file_path, file_url 
        FROM student_documents 
        WHERE student_id = ? AND doc_type = ?
      `).bind(studentId, docType).first<{ id: number; file_path: string | null; file_url: string | null }>();

      if (!docRecord) {
        return c.json({ success: false, message: `Dokumen ${docType} tidak ditemukan atau sudah dihapus di database.` }, 404);
      }
      if (docRecord.file_path) {
        r2Key = docRecord.file_path.replace(/^\/files\//, '').replace(/^\/+/, '');
      }
    }

    // 3. Delete Object from Cloudflare R2 Bucket
    if (r2Key && bucket) {
      try {
        await bucket.delete(r2Key);
      } catch (r2Err: any) {
        console.error('Cloudflare R2 Delete Warning:', r2Err);
        // Continue database operation even if R2 deletion fails, to ensure DB can be synced/cleaned.
      }
    }

    // 4. Update / Delete metadata in Cloudflare D1 Database
    if (docType === 'photo') {
      await db.prepare('UPDATE students SET photo_url = NULL WHERE id = ?').bind(studentId).run();
    } else {
      await db.prepare('DELETE FROM student_documents WHERE student_id = ? AND doc_type = ?').bind(studentId, docType).run();
    }

    // 5. Log Audit Log
    await logAudit(db, {
      userId: user.id,
      userName: user.full_name || user.username,
      userRole: user.role,
      action: 'DELETE_STUDENT_DOCUMENT',
      status: 'SUCCESS',
      ipAddress: getClientIp(c),
      userAgent: getUserAgent(c),
      details: `${user.role.toUpperCase()} ${user.full_name || user.username} menghapus dokumen ${docType} (${r2Key || 'tanpa file'}) milik ${studentName}`
    });

    const docLabel = docType === 'photo' ? 'Foto Profil' : docType === 'kartu_keluarga' ? 'Kartu Keluarga (KK)' : 'Akte Kelahiran';
    return c.json({
      success: true,
      message: `${docLabel} berhasil dihapus dari Cloudflare R2 dan database.`
    });
  } catch (err: any) {
    console.error('Delete Document General Error:', err);
    return c.json({
      success: false,
      message: 'Terjadi kesalahan server: ' + (err.message || String(err))
    }, 500);
  }
});

// ----------------------------------------------------
// Cetak Kartu Siswa 2 Sisi — Massal & Per Siswa (Admin & Guru)
// ----------------------------------------------------
app.get('/admin/print-cards', async (c) => {
  const user = c.get('user');
  if (!user || (user.role !== 'admin' && user.role !== 'guru')) {
    return c.text('Akses Ditolak: Hanya Admin/Guru yang dapat mencetak kartu siswa.', 403);
  }

  const db = c.env.DB;
  const restrictClass = (user.role === 'guru' && user.homeroom_class) ? user.homeroom_class : null;
  let classNameFilter = (c.req.query('class_name') || '').trim();
  if (restrictClass) {
    classNameFilter = restrictClass;
  }
  const studentIdsQuery = (c.req.query('student_ids') || '').trim();

  let query = `
    SELECT 
      s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.photo_url, s.birth_place, s.birth_date, s.status,
      p.father_name, p.mother_name
    FROM students s
    LEFT JOIN student_parents p ON s.id = p.student_id
    WHERE (s.status IS NULL OR s.status = 'active')
  `;
  const params: any[] = [];

  if (studentIdsQuery) {
    const ids = studentIdsQuery.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
    if (ids.length > 0) {
      query += ` AND s.id IN (${ids.map(() => '?').join(',')})`;
      params.push(...ids);
      if (restrictClass) {
        query += ` AND s.class_name = ?`;
        params.push(restrictClass);
      }
    }
  } else if (classNameFilter) {
    query += ` AND UPPER(TRIM(s.class_name)) = UPPER(TRIM(?))`;
    params.push(classNameFilter);
  }

  query += ` ORDER BY s.class_name ASC, s.name ASC`;

  const stmt = db.prepare(query);
  const res = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
  const students = res.results || [];

  let classesList: string[] = [];
  if (restrictClass) {
    classesList = [restrictClass];
  } else {
    const classesRes = await db.prepare("SELECT DISTINCT class_name FROM students WHERE class_name IS NOT NULL AND class_name != '' AND (status IS NULL OR status = 'active') ORDER BY class_name ASC").all<{ class_name: string }>();
    classesList = (classesRes.results || []).map(r => r.class_name);
  }

  return c.html(renderPrintCardsPage(students, classesList, classNameFilter));
});

app.get('/admin/print-cards/student/:id', async (c) => {
  const user = c.get('user');
  if (!user || (user.role !== 'admin' && user.role !== 'guru')) {
    return c.text('Akses Ditolak', 403);
  }

  const db = c.env.DB;
  const studentId = parseInt(c.req.param('id'), 10);
  if (isNaN(studentId)) return c.text('ID Siswa tidak valid', 400);

  const student = await db.prepare(`
    SELECT 
      s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.photo_url, s.birth_place, s.birth_date, s.status,
      p.father_name, p.mother_name
    FROM students s
    LEFT JOIN student_parents p ON s.id = p.student_id
    WHERE s.id = ?
  `).bind(studentId).first();

  if (!student) return c.text('Data siswa tidak ditemukan.', 404);

  if (user.role === 'guru' && user.homeroom_class) {
    if ((student as any).class_name !== user.homeroom_class) {
      return c.text(`Akses Ditolak: Anda hanya dapat mencetak kartu siswa di kelas ${user.homeroom_class}.`, 403);
    }
  }

  const classesRes = await db.prepare("SELECT DISTINCT class_name FROM students WHERE class_name IS NOT NULL AND class_name != '' AND (status IS NULL OR status = 'active') ORDER BY class_name ASC").all<{ class_name: string }>();
  const classesList = (classesRes.results || []).map(r => r.class_name);

  return c.html(renderPrintCardsPage([student], classesList, (student as any).class_name || ''));
});

// ----------------------------------------------------
// NIK Verification & Validation Routes (Instant structure validation)
// ----------------------------------------------------

export const INDONESIA_PROVINCES: Record<string, string> = {
  "11": "Aceh",
  "12": "Sumatera Utara",
  "13": "Sumatera Barat",
  "14": "Riau",
  "15": "Jambi",
  "16": "Sumatera Selatan",
  "17": "Bengkulu",
  "18": "Lampung",
  "19": "Kepulauan Bangka Belitung",
  "21": "Kepulauan Riau",
  "31": "DKI Jakarta",
  "32": "Jawa Barat",
  "33": "Jawa Tengah",
  "34": "DI Yogyakarta",
  "35": "Jawa Timur",
  "36": "Banten",
  "51": "Bali",
  "52": "Nusa Tenggara Barat",
  "53": "Nusa Tenggara Timur",
  "61": "Kalimantan Barat",
  "62": "Kalimantan Tengah",
  "63": "Kalimantan Selatan",
  "64": "Kalimantan Timur",
  "65": "Kalimantan Utara",
  "71": "Sulawesi Utara",
  "72": "Sulawesi Tengah",
  "73": "Sulawesi Selatan",
  "74": "Sulawesi Tenggara",
  "75": "Gorontalo",
  "76": "Sulawesi Barat",
  "81": "Maluku",
  "82": "Maluku Utara",
  "91": "Papua Barat",
  "92": "Papua",
  "93": "Papua Selatan",
  "94": "Papua Tengah",
  "95": "Papua Pegunungan"
};

export function parseAndValidateNik(nik: string, birthDateDb?: string | null, genderDb?: string | null) {
  const errors: string[] = [];
  const cleanNik = String(nik || '').trim();

  if (!cleanNik) {
    return { isValid: false, errors: ['NIK tidak boleh kosong'] };
  }

  if (cleanNik.length !== 16) {
    return { isValid: false, errors: ['NIK harus terdiri dari 16 digit'] };
  }

  if (!/^\d+$/.test(cleanNik)) {
    return { isValid: false, errors: ['NIK hanya boleh berisi angka'] };
  }

  const provinceCode = cleanNik.slice(0, 2);
  const provinceName = INDONESIA_PROVINCES[provinceCode] || 'Provinsi Tidak Dikenal';
  if (provinceName === 'Provinsi Tidak Dikenal') {
    errors.push('Kode provinsi (' + provinceCode + ') tidak terdaftar');
  }

  const kabCode = cleanNik.slice(2, 4);
  const kecCode = cleanNik.slice(4, 6);

  let rawDay = parseInt(cleanNik.slice(6, 8), 10);
  const rawMonth = parseInt(cleanNik.slice(8, 10), 10);
  let rawYear2Digit = parseInt(cleanNik.slice(10, 12), 10);

  let gender = 'Laki-laki';
  if (rawDay > 40) {
    gender = 'Perempuan';
    rawDay = rawDay - 40;
  }

  if (rawDay < 1 || rawDay > 31) {
    errors.push('Tanggal lahir (' + rawDay + ') pada NIK tidak valid');
  }

  if (rawMonth < 1 || rawMonth > 12) {
    errors.push('Bulan lahir (' + rawMonth + ') pada NIK tidak valid');
  }

  const currentYear2Digit = new Date().getFullYear() % 100;
  let fullYear = 1900 + rawYear2Digit;
  if (rawYear2Digit <= currentYear2Digit + 5) {
    fullYear = 2000 + rawYear2Digit;
  }

  const birthDateFormatted = fullYear + '-' + String(rawMonth).padStart(2, '0') + '-' + String(rawDay).padStart(2, '0');
  const birthDateDisplay = String(rawDay).padStart(2, '0') + '-' + String(rawMonth).padStart(2, '0') + '-' + fullYear;

  const parsedDate = new Date(fullYear, rawMonth - 1, rawDay);
  if (parsedDate.getFullYear() !== fullYear || parsedDate.getMonth() !== (rawMonth - 1) || parsedDate.getDate() !== rawDay) {
    errors.push('Tanggal lahir (' + birthDateDisplay + ') tidak valid secara kalender');
  }

  const sequenceNumber = cleanNik.slice(12, 16);

  let isDobMatch: boolean | null = null;
  let discrepancyMessage = '';

  if (birthDateDb) {
    const normalizeToISO = (str: string) => {
      const clean = str.trim();
      const iso = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (iso) return iso[1] + '-' + iso[2].padStart(2, '0') + '-' + iso[3].padStart(2, '0');
      
      const dmy = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (dmy) return dmy[3] + '-' + dmy[2].padStart(2, '0') + '-' + dmy[1].padStart(2, '0');

      try {
        const d = new Date(clean);
        if (!isNaN(d.getTime())) {
          return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }
      } catch (e) {}
      return clean;
    };

    const normalizedDb = normalizeToISO(birthDateDb);
    const normalizedNik = birthDateFormatted;
    isDobMatch = (normalizedDb === normalizedNik);
    if (!isDobMatch) {
      discrepancyMessage = 'Tanggal lahir pada NIK (' + birthDateDisplay + ') berbeda dengan data di database (' + birthDateDb + ')';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    provinceCode,
    provinceName,
    kabCode,
    kecCode,
    birthDateRaw: cleanNik.slice(6, 12),
    birthDateFormatted,
    birthDateDisplay,
    gender,
    sequenceNumber,
    isDobMatch,
    discrepancyMessage
  };
}

/**
 * Route: POST /api/parse-nik
 * Validasi Struktur & Ekstraksi Data NIK Indonesia (100% Offline, Bebas Error 502, Tanpa Upload)
 */
app.post('/api/parse-nik', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const contentType = c.req.header('content-type') || '';
    let nik = '';
    let birthDate = '';
    let gender = '';

    if (contentType.includes('application/json')) {
      const body = await c.req.json<any>();
      nik = String(body.nik || '').trim();
      birthDate = String(body.birth_date || body.date_of_birth || body.dob || '').trim();
      gender = String(body.gender || body.sex || '').trim();
    } else {
      const body = await c.req.parseBody();
      nik = String(body['nik'] || '').trim();
      birthDate = String(body['birth_date'] || body['date_of_birth'] || body['dob'] || '').trim();
      gender = String(body['gender'] || body['sex'] || '').trim();
    }

    const parseResult = parseAndValidateNik(nik, birthDate, gender);

    if (db) {
      await logAudit(db, {
        userId: user?.id,
        userName: user?.full_name || user?.username,
        userRole: user?.role,
        action: 'VALIDATE_NIK_STRUCTURE',
        status: parseResult.isValid ? 'SUCCESS' : 'INFO',
        ipAddress: getClientIp(c),
        userAgent: c.req.header('user-agent') || null,
        details: `Validasi Struktur NIK (${nik ? nik.slice(0, 6) + '******' : '-'}) - Hasil: ${parseResult.isValid ? 'VALID' : 'INVALID'} (${parseResult.provinceName || '-'})`
      });
    }

    return c.json({
      is_success: true,
      message: parseResult.isValid ? 'Struktur NIK valid' : 'Terdapat ketidaksesuaian pada struktur NIK',
      data: parseResult
    });
  } catch (err: any) {
    return c.json({
      is_success: false,
      message: err.message || 'Gagal memproses validasi struktur NIK',
      statusCode: 500
    }, 500);
  }
});

/**
 * Route: POST /api/students/:id/parse-nik
 * Validasi Struktur NIK Siswa dengan data yang tersimpan di database
 */
app.post('/api/students/:id/parse-nik', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const studentId = parseInt(c.req.param('id'), 10);

  if (user.role === 'siswa' && user.linked_id !== studentId) {
    return c.json({ is_success: false, message: 'Akses Ditolak', statusCode: 403 }, 403);
  }

  const student = await db.prepare(
    'SELECT id, nipd, nisn, nik, name, class_name, birth_place, birth_date FROM students WHERE id = ?'
  ).bind(studentId).first<Student>();

  if (!student) {
    return c.json({ is_success: false, message: 'Data siswa tidak ditemukan', statusCode: 404 }, 404);
  }

  const nikToParse = student.nik || '';
  if (!nikToParse) {
    return c.json({
      is_success: false,
      message: 'Nomor NIK siswa belum terisi di database',
      statusCode: 422
    }, 422);
  }

  const parseResult = parseAndValidateNik(nikToParse, student.birth_date, null);

  await logAudit(db, {
    userId: user.id,
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'VALIDATE_STUDENT_NIK',
    status: parseResult.isValid ? 'SUCCESS' : 'INFO',
    ipAddress: getClientIp(c),
    userAgent: c.req.header('user-agent') || null,
    details: `Validasi NIK Siswa ${student.name} (ID: ${student.id}) - Status: ${parseResult.isValid ? 'VALID' : 'INVALID'} - Provinsi: ${parseResult.provinceName}`
  });

  return c.json({
    is_success: true,
    message: parseResult.isValid ? 'Struktur NIK siswa valid' : 'Terdapat ketidaksesuaian pada struktur NIK',
    data: parseResult,
    student: {
      id: student.id,
      name: student.name,
      nik: student.nik,
      birth_date: student.birth_date,
      class_name: student.class_name
    }
  });
});



// Helper functions to parse class names and handle parallel classes (e.g. KELAS 4A -> KELAS 5A, KELAS 4B -> KELAS 5B)
export function parseClassName(className: string): { level: number; suffix: string; prefix: string; fullName: string } {
  const trimmed = (className || '').trim();
  const match = trimmed.match(/^(?:(kelas|class)\s*)?([1-6])\s*([a-z0-9\-\_]*)$/i);
  if (match) {
    const prefix = match[1] ? (match[1] === match[1].toUpperCase() ? 'KELAS' : 'Kelas') : 'Kelas';
    const level = parseInt(match[2], 10);
    const suffix = (match[3] || '').trim().toUpperCase();
    const fullName = suffix ? `${prefix} ${level}${suffix}` : `${prefix} ${level}`;
    return { level, suffix, prefix, fullName };
  }

  return { level: 0, suffix: '', prefix: 'Kelas', fullName: trimmed };
}

export function computeNextClassName(className: string): { nextLevel: number; nextClassName: string; isGraduation: boolean } {
  const parsed = parseClassName(className);
  if (parsed.level === 0 || parsed.level >= 6) {
    return { nextLevel: 6, nextClassName: 'SISWA LULUSAN', isGraduation: true };
  }

  const nextLevel = parsed.level + 1;
  const nextClassName = parsed.suffix ? `${parsed.prefix} ${nextLevel}${parsed.suffix}` : `${parsed.prefix} ${nextLevel}`;

  return { nextLevel, nextClassName, isGraduation: false };
}

async function syncMasterClasses(db: D1Database): Promise<MasterClass[]> {
  try {
    const existingRes = await db.prepare('SELECT id, name, level, next_class_id FROM classes ORDER BY level ASC, name ASC').all<MasterClass>();
    const existingClasses = existingRes.results || [];
    const existingNames = new Set(existingClasses.map(c => c.name.toUpperCase().trim()));

    const studentClassesRes = await db.prepare("SELECT DISTINCT class_name FROM students WHERE class_name IS NOT NULL AND class_name != ''").all<{ class_name: string }>();
    const studentClasses = (studentClassesRes.results || []).map(r => r.class_name.trim());

    for (const stClass of studentClasses) {
      if (stClass && !existingNames.has(stClass.toUpperCase())) {
        const parsed = parseClassName(stClass);
        const lvl = parsed.level || 1;
        await db.prepare(`
          INSERT OR IGNORE INTO classes (name, level, description)
          VALUES (?, ?, ?)
        `).bind(stClass, lvl, `Tingkat ${lvl} SD`).run();
        existingNames.add(stClass.toUpperCase());
      }
    }

    const refreshedRes = await db.prepare('SELECT id, name, level, next_class_id FROM classes ORDER BY level ASC, name ASC').all<MasterClass>();
    return refreshedRes.results || [];
  } catch (e) {
    console.error('Error syncing master classes:', e);
    return [];
  }
}

// ============================================================
// FITUR MANAJEMEN KENAIKAN KELAS & SISWA LULUSAN (ADMIN ONLY)
// ============================================================

/**
 * Route 1: GET /admin/naik-kelas (Halaman Manajemen Kenaikan Kelas Pararel dengan Dual Selection)
 */
app.get('/admin/naik-kelas', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.html(renderErrorPage(403, 'Akses Ditolak', 'Hanya Administrator yang dapat mengakses Halaman Manajemen Kenaikan Kelas.', undefined, user), 403);
  }

  const db = c.env.DB;
  const flash = c.req.query('flash') || '';

  // 1. Sync & fetch master classes from database
  const masterClasses = await syncMasterClasses(db);

  if (masterClasses.length === 0) {
    return c.html(renderErrorPage(500, 'Data Kelas Kosong', 'Master data kelas tidak ditemukan di database.', undefined, user), 500);
  }

  // 2. Determine selected source class (default: first master class)
  const selectedFromId = parseInt(c.req.query('from_class_id') || String(masterClasses[0].id), 10);
  const fromClass = masterClasses.find(m => m.id === selectedFromId) || masterClasses[0];

  // 3. Determine selected target class (Dual Flexible Selection)
  const queryTo = c.req.query('to_class_id');
  let selectedToId: number | 'graduated';
  let toClass: MasterClass | null = null;
  let isGraduationMode = false;

  if (queryTo === 'graduated') {
    selectedToId = 'graduated';
    isGraduationMode = true;
  } else if (queryTo && !isNaN(parseInt(queryTo, 10)) && parseInt(queryTo, 10) > 0) {
    const toIdNum = parseInt(queryTo, 10);
    toClass = masterClasses.find(m => m.id === toIdNum) || null;
    selectedToId = toClass ? toClass.id : toIdNum;
  } else {
    // Default auto-calculation based on suffix matching (e.g. KELAS 4A -> KELAS 5A, KELAS 6 -> SISWA LULUSAN)
    const nextInfo = computeNextClassName(fromClass.name);
    if (nextInfo.isGraduation || fromClass.level >= 6) {
      selectedToId = 'graduated';
      isGraduationMode = true;
    } else {
      toClass = masterClasses.find(m => m.name.toUpperCase().trim() === nextInfo.nextClassName.toUpperCase().trim()) || null;
      if (toClass) {
        selectedToId = toClass.id;
      } else {
        selectedToId = 0; // Will be created automatically on submit if chosen
        toClass = {
          id: 0,
          name: nextInfo.nextClassName,
          level: nextInfo.nextLevel,
          next_class_id: null,
          description: 'Akan Dibuat Otomatis di Database'
        };
      }
    }
  }

  // 4. Fetch active students in source class
  const studentsRes = await db.prepare(`
    SELECT s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.photo_url, s.birth_place, s.birth_date
    FROM students s
    WHERE (s.class_id = ? OR UPPER(TRIM(s.class_name)) = UPPER(TRIM(?))) AND (s.status IS NULL OR s.status = 'active')
    ORDER BY s.name ASC
  `).bind(fromClass.id, fromClass.name).all<Student>();

  const students = studentsRes.results || [];

  // 5. Fetch recent class history logs
  const historyRes = await db.prepare(`
    SELECT 
      h.id, h.student_id, h.academic_year, h.status, h.processed_by, h.processed_at,
      fc.name as from_class_name, tc.name as to_class_name, s.name as student_name
    FROM student_class_history h
    JOIN students s ON h.student_id = s.id
    LEFT JOIN classes fc ON h.from_class_id = fc.id
    LEFT JOIN classes tc ON h.to_class_id = tc.id
    ORDER BY h.id DESC LIMIT 20
  `).all<StudentClassHistory>();

  const historyLogs = historyRes.results || [];

  const content = renderPromotionPage(masterClasses, fromClass, selectedToId, toClass, isGraduationMode, students, historyLogs, flash);
  return c.html(renderLayout('Manajemen Kenaikan Kelas', user, content, 'naik_kelas'));
});

/**
 * Route 2: POST /api/students/promote (API Kenaikan Kelas & Kelulusan Massal dengan Target Fleksibel)
 */
app.post('/api/students/promote', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'Akses Ditolak: Hanya Admin yang dapat memproses kenaikan kelas.' }, 403);
  }

  const db = c.env.DB;
  const ip = getClientIp(c);
  const ua = getUserAgent(c);

  let body: any;
  try {
    body = await c.req.parseBody({ all: true });
  } catch {
    body = await c.req.json().catch(() => ({}));
  }

  const fromClassId = parseInt(String(body['from_class_id'] || ''), 10);
  const toClassIdRaw = String(body['to_class_id'] || '').trim();

  let studentIdsRaw = body['student_ids[]'] || body['student_ids'] || [];
  if (typeof studentIdsRaw === 'string' && studentIdsRaw.includes(',')) {
    studentIdsRaw = studentIdsRaw.split(',');
  }
  if (!Array.isArray(studentIdsRaw)) {
    studentIdsRaw = [studentIdsRaw];
  }
  const studentIds = studentIdsRaw.map((v: any) => parseInt(String(v), 10)).filter((v: number) => !isNaN(v) && v > 0);

  if (!fromClassId || isNaN(fromClassId)) {
    return c.json({ success: false, message: 'Kelas asal tidak valid.' }, 400);
  }

  if (studentIds.length === 0) {
    return c.json({ success: false, message: 'Pilih minimal satu siswa untuk diproses.' }, 400);
  }

  const academicYear = String(body['academic_year'] || '2025/2026').trim();

  // 1. Fetch source class from DB master
  let fromClass = await db.prepare('SELECT id, name, level, next_class_id FROM classes WHERE id = ?').bind(fromClassId).first<MasterClass>();
  if (!fromClass) {
    return c.json({ success: false, message: 'Data kelas asal tidak ditemukan di database.' }, 404);
  }

  // 2. Determine target class & mode (Explicit Target Selection / Auto Suffix Fallback)
  let isGraduationMode = (toClassIdRaw === 'graduated');
  let toClass: MasterClass | null = null;

  if (!isGraduationMode) {
    if (toClassIdRaw && !isNaN(parseInt(toClassIdRaw, 10)) && parseInt(toClassIdRaw, 10) > 0) {
      const targetId = parseInt(toClassIdRaw, 10);
      toClass = await db.prepare('SELECT id, name, level, next_class_id FROM classes WHERE id = ?').bind(targetId).first<MasterClass>();
    }

    if (!toClass) {
      const nextInfo = computeNextClassName(fromClass.name);
      if (nextInfo.isGraduation) {
        isGraduationMode = true;
      } else {
        toClass = await db.prepare('SELECT id, name, level, next_class_id FROM classes WHERE UPPER(TRIM(name)) = UPPER(TRIM(?))').bind(nextInfo.nextClassName).first<MasterClass>();

        if (!toClass) {
          await db.prepare(`
            INSERT INTO classes (name, level, description)
            VALUES (?, ?, ?)
          `).bind(nextInfo.nextClassName, nextInfo.nextLevel, `Tingkat ${nextInfo.nextLevel} SD`).run();

          toClass = await db.prepare('SELECT id, name, level, next_class_id FROM classes WHERE UPPER(TRIM(name)) = UPPER(TRIM(?))').bind(nextInfo.nextClassName).first<MasterClass>();
        }
      }
    }

    if (!isGraduationMode && !toClass) {
      return c.json({ success: false, message: 'Gagal membuat atau menemukan kelas tujuan di database.' }, 500);
    }
  }

  // 3. Batch DB Execution
  const nowYear = new Date().getFullYear().toString();
  const nowIsoDate = new Date().toISOString().split('T')[0];
  const statements: D1PreparedStatement[] = [];

  if (isGraduationMode) {
    for (const sid of studentIds) {
      statements.push(
        db.prepare(`
          UPDATE students 
          SET status = 'graduated', graduation_year = ?, graduation_date = ?, graduation_status = 'LULUS'
          WHERE id = ? AND (status IS NULL OR status = 'active')
        `).bind(nowYear, nowIsoDate, sid)
      );

      statements.push(
        db.prepare(`
          INSERT INTO student_class_history (student_id, from_class_id, to_class_id, academic_year, status, processed_by)
          VALUES (?, ?, NULL, ?, 'graduated', ?)
        `).bind(sid, fromClass.id, academicYear, user.username || String(user.id))
      );
    }
  } else {
    for (const sid of studentIds) {
      statements.push(
        db.prepare(`
          UPDATE students 
          SET class_id = ?, class_name = ?
          WHERE id = ? AND (status IS NULL OR status = 'active')
        `).bind(toClass!.id, toClass!.name, sid)
      );

      statements.push(
        db.prepare(`
          INSERT INTO student_class_history (student_id, from_class_id, to_class_id, academic_year, status, processed_by)
          VALUES (?, ?, ?, ?, 'promoted', ?)
        `).bind(sid, fromClass.id, toClass!.id, academicYear, user.username || String(user.id))
      );
    }
  }

  await db.batch(statements);

  // 4. Audit Log
  const actionName = isGraduationMode ? 'GRADUATE_STUDENTS' : 'PROMOTE_STUDENTS';
  const detailMsg = isGraduationMode
    ? `Admin meluluskan ${studentIds.length} siswa dari ${fromClass.name} (Tahun Lulus: ${nowYear})`
    : `Admin memindahkan/menaikkan ${studentIds.length} siswa dari ${fromClass.name} ke ${toClass!.name} (Tahun Ajaran: ${academicYear})`;

  await logAudit(db, {
    userId: user.id,
    userName: user.full_name || user.username,
    userRole: user.role,
    action: actionName,
    status: 'SUCCESS',
    ipAddress: ip,
    userAgent: ua,
    details: detailMsg
  });

  return c.json({
    success: true,
    message: isGraduationMode
      ? `Berhasil meluluskan ${studentIds.length} siswa dari ${fromClass.name}.`
      : `Berhasil memindahkan ${studentIds.length} siswa dari ${fromClass.name} ke ${toClass!.name}.`
  });
});

/**
 * Route 3: GET /admin/graduated-students (Halaman Siswa Lulusan)
 */
app.get('/admin/graduated-students', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.text('Akses Ditolak', 403);
  }

  const db = c.env.DB;
  const search = (c.req.query('search') || '').trim();
  const yearFilter = (c.req.query('year') || '').trim();

  const masterClasses = await syncMasterClasses(db);

  // Distinct graduation years for dropdown
  const yearsRes = await db.prepare("SELECT DISTINCT graduation_year FROM students WHERE status = 'graduated' AND graduation_year IS NOT NULL ORDER BY graduation_year DESC").all<{ graduation_year: string }>();
  const yearsList = (yearsRes.results || []).map(r => r.graduation_year);

  const restrictClass = (user.role === 'guru' && user.homeroom_class) ? user.homeroom_class : null;
  let sql = `
    SELECT 
      s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.class_id, s.status, s.graduation_year, s.graduation_date, s.graduation_status, s.birth_place, s.birth_date, s.photo_url
    FROM students s
    WHERE s.status = 'graduated'
  `;
  const params: any[] = [];

  if (restrictClass) {
    sql += ` AND s.class_name = ?`;
    params.push(restrictClass);
  }

  if (search) {
    sql += ` AND (s.name LIKE ? OR s.nipd LIKE ? OR s.nisn LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (yearFilter) {
    sql += ` AND s.graduation_year = ?`;
    params.push(yearFilter);
  }

  sql += ` ORDER BY s.graduation_year DESC, s.name ASC`;

  const stmt = db.prepare(sql);
  const res = params.length > 0 ? await stmt.bind(...params).all<Student>() : await stmt.all<Student>();
  const graduatedStudents = res.results || [];

  const content = renderGraduatedStudentsPage(graduatedStudents, masterClasses, yearsList, search, yearFilter, user.role);
  return c.html(renderLayout('Daftar Siswa Lulusan', user, content, 'graduated_students'));
});

/**
 * Route 4: GET /admin/graduated-students/:id (Halaman Detail Siswa Lulusan)
 */
app.get('/admin/graduated-students/:id', async (c) => {
  const user = c.get('user');
  if (user.role === 'siswa') {
    return c.text('Akses Ditolak', 403);
  }

  const studentId = parseInt(c.req.param('id'), 10);
  const db = c.env.DB;

  const masterClasses = await syncMasterClasses(db);

  const student = await db.prepare(`
    SELECT 
      s.id, s.nipd, s.nisn, s.nik, s.name, s.class_name, s.class_id, s.status, s.graduation_year, s.graduation_date, s.graduation_status, s.photo_url, s.birth_place, s.birth_date,
      p.father_name, p.is_father_alive, p.mother_name, p.is_mother_alive
    FROM students s
    LEFT JOIN student_parents p ON s.id = p.student_id
    WHERE s.id = ? AND s.status = 'graduated'
  `).bind(studentId).first<Student>();

  if (!student) {
    return c.html(renderLayout('Error', user, '<div class="alert alert-danger">Data siswa lulusan tidak ditemukan.</div>', 'graduated_students'));
  }

  if (user.role === 'guru' && user.homeroom_class) {
    if (student.class_name !== user.homeroom_class) {
      return c.text(`Akses Ditolak: Anda hanya dapat melihat siswa lulusan di kelas ${user.homeroom_class}.`, 403);
    }
  }

  // Fetch documents
  const docsRes = await db.prepare(`
    SELECT id, student_id, doc_type, file_path, file_url, uploaded_at
    FROM student_documents
    WHERE student_id = ?
  `).bind(studentId).all<StudentDocument>();
  const documents = docsRes.results || [];

  // Fetch class history
  const historyRes = await db.prepare(`
    SELECT 
      h.id, h.student_id, h.academic_year, h.status, h.processed_by, h.processed_at,
      fc.name as from_class_name, tc.name as to_class_name
    FROM student_class_history h
    LEFT JOIN classes fc ON h.from_class_id = fc.id
    LEFT JOIN classes tc ON h.to_class_id = tc.id
    WHERE h.student_id = ?
    ORDER BY h.id ASC
  `).bind(studentId).all<StudentClassHistory>();
  const classHistory = historyRes.results || [];

  const content = renderGraduatedStudentDetailPage(student, documents, classHistory, masterClasses, user.role);
  return c.html(renderLayout(`Detail Siswa Lulusan - ${student.name}`, user, content, 'graduated_students'));
});

/**
 * Route 5: POST /api/students/restore-graduated (API Pembatalan Kelulusan & Pengembalian Siswa Lulusan)
 */
app.post('/api/students/restore-graduated', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'Akses Ditolak: Hanya Admin yang dapat membatalkan kelulusan.' }, 403);
  }

  const db = c.env.DB;
  const ip = getClientIp(c);
  const ua = getUserAgent(c);

  let body: any;
  try {
    body = await c.req.parseBody({ all: true });
  } catch {
    body = await c.req.json().catch(() => ({}));
  }

  const studentId = parseInt(String(body['student_id'] || ''), 10);
  const targetClassId = parseInt(String(body['target_class_id'] || ''), 10);

  if (isNaN(studentId) || studentId <= 0) {
    return c.json({ success: false, message: 'ID Siswa tidak valid.' }, 400);
  }

  if (isNaN(targetClassId) || targetClassId <= 0) {
    return c.json({ success: false, message: 'Kelas tujuan tidak valid.' }, 400);
  }

  // 1. Fetch student
  const student = await db.prepare("SELECT id, name, class_id, class_name, status FROM students WHERE id = ? AND status = 'graduated'").bind(studentId).first<Student>();
  if (!student) {
    return c.json({ success: false, message: 'Data siswa lulusan tidak ditemukan.' }, 404);
  }

  // 2. Fetch target class
  const targetClass = await db.prepare('SELECT id, name, level FROM classes WHERE id = ?').bind(targetClassId).first<MasterClass>();
  if (!targetClass) {
    return c.json({ success: false, message: 'Kelas tujuan tidak ditemukan di database.' }, 404);
  }

  // 3. Batch DB Execution: restore status to 'active', update class_id & class_name, clear graduation fields
  const nowAcademicYear = '2025/2026';
  await db.batch([
    db.prepare(`
      UPDATE students 
      SET status = 'active', class_id = ?, class_name = ?, graduation_year = NULL, graduation_date = NULL, graduation_status = NULL
      WHERE id = ?
    `).bind(targetClass.id, targetClass.name, studentId),

    db.prepare(`
      INSERT INTO student_class_history (student_id, from_class_id, to_class_id, academic_year, status, processed_by)
      VALUES (?, NULL, ?, ?, 'reverted', ?)
    `).bind(studentId, targetClass.id, nowAcademicYear, user.username || String(user.id))
  ]);

  // 4. Audit Log
  await logAudit(db, {
    userId: user.id,
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'RESTORE_GRADUATED_STUDENT',
    status: 'SUCCESS',
    ipAddress: ip,
    userAgent: ua,
    details: `Admin membatalkan kelulusan ${student.name} dan mengembalikan ke ${targetClass.name} (Status: Aktif)`
  });

  return c.json({
    success: true,
    message: `Berhasil membatalkan kelulusan ${student.name} dan mengembalikannya ke status Aktif di ${targetClass.name}.`
  });
});



// ----------------------------------------------------
// Granular Document Permissions & Review Workflow
// ----------------------------------------------------

// Admin: Get Permissions for a Student
app.get('/api/admin/students/:id/permissions', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ error: 'Unauthorized' }, 403);
  const studentId = parseInt(c.req.param('id'), 10);
  const db = c.env.DB;
  const perms = await db.prepare('SELECT document_type, is_allowed FROM student_document_permissions WHERE student_id = ?').bind(studentId).all<any>();
  let allow_akte = true;
  let allow_kk = true;
  if (perms.results) {
    perms.results.forEach(p => {
      if (p.document_type === 'akte_kelahiran') allow_akte = p.is_allowed === 1;
      if (p.document_type === 'kartu_keluarga') allow_kk = p.is_allowed === 1;
    });
  }
  return c.json({ allow_akte, allow_kk });
});

// Admin: Set Permissions for a Student
app.post('/api/admin/students/:id/permissions', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ error: 'Unauthorized' }, 403);
  const studentId = parseInt(c.req.param('id'), 10);
  const body = await c.req.parseBody();
  const allowAkte = body['allow_akte'] === '1' ? 1 : 0;
  const allowKk = body['allow_kk'] === '1' ? 1 : 0;
  const db = c.env.DB;

  await db.prepare(`
    INSERT INTO student_document_permissions (student_id, document_type, is_allowed, updated_at)
    VALUES (?, 'akte_kelahiran', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(student_id, document_type) DO UPDATE SET is_allowed = excluded.is_allowed, updated_at = CURRENT_TIMESTAMP
  `).bind(studentId, allowAkte).run();

  await db.prepare(`
    INSERT INTO student_document_permissions (student_id, document_type, is_allowed, updated_at)
    VALUES (?, 'kartu_keluarga', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(student_id, document_type) DO UPDATE SET is_allowed = excluded.is_allowed, updated_at = CURRENT_TIMESTAMP
  `).bind(studentId, allowKk).run();

  await logAudit(db, {
    userId: user.id.toString(),
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'SET_PERMISSION',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    userAgent: getUserAgent(c),
    details: `Set permissions for student ${studentId}`
  });

  return c.redirect('/students?flash=Izin+dokumen+berhasil+diperbarui');
});

// Admin: Toggle Teacher Reviewer
app.post('/api/admin/teachers/:id/reviewer', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ error: 'Unauthorized' }, 403);
  const teacherId = c.req.param('id');
  const body = await c.req.parseBody();
  const isReviewer = parseInt(String(body['is_document_reviewer']), 10);
  const db = c.env.DB;

  await db.prepare('UPDATE users SET is_document_reviewer = ? WHERE id = ? AND role = ?').bind(isReviewer, teacherId, 'teacher').run();

  await logAudit(db, {
    userId: user.id.toString(),
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'SET_REVIEWER',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    userAgent: getUserAgent(c),
    details: `Set is_document_reviewer=${isReviewer} for teacher ${teacherId}`
  });

  return c.redirect('/admin/setup-accounts?flash=Status+Reviewer+berhasil+diubah');
});

// Reviewer: Get Pending / Status Documents (API or rendered view)
app.get('/document-reviews', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.role !== 'guru') {
    return c.text('Unauthorized', 403);
  }
  const db = c.env.DB;
  const restrictClass = (user.role === 'guru' && user.homeroom_class) ? user.homeroom_class : null;
  let sql = `
    SELECT 
      s.id as student_id,
      s.name as student_name,
      s.class_name,
      s.photo_url as profile_photo_url,
      MAX(CASE WHEN sd.doc_type = 'akte_kelahiran' THEN sd.id END) as akte_id,
      MAX(CASE WHEN sd.doc_type = 'akte_kelahiran' THEN sd.file_url END) as akte_url,
      MAX(CASE WHEN sd.doc_type = 'akte_kelahiran' THEN sd.status END) as akte_status,
      MAX(CASE WHEN sd.doc_type = 'akte_kelahiran' THEN sd.rejection_note END) as akte_rejection_note,
      MAX(CASE WHEN sd.doc_type = 'kartu_keluarga' THEN sd.id END) as kk_id,
      MAX(CASE WHEN sd.doc_type = 'kartu_keluarga' THEN sd.file_url END) as kk_url,
      MAX(CASE WHEN sd.doc_type = 'kartu_keluarga' THEN sd.status END) as kk_status,
      MAX(CASE WHEN sd.doc_type = 'kartu_keluarga' THEN sd.rejection_note END) as kk_rejection_note,
      MAX(CASE WHEN sd.doc_type = 'foto' THEN sd.id END) as foto_id,
      MAX(CASE WHEN sd.doc_type = 'foto' THEN sd.file_url END) as foto_url,
      MAX(CASE WHEN sd.doc_type = 'foto' THEN sd.status END) as foto_status,
      MAX(CASE WHEN sd.doc_type = 'foto' THEN sd.rejection_note END) as foto_rejection_note
    FROM students s
    JOIN student_documents sd ON s.id = sd.student_id
  `;
  const params: any[] = [];
  if (restrictClass) {
    sql += " WHERE s.class_name = ?";
    params.push(restrictClass);
  }
  sql += `
    GROUP BY s.id
    HAVING SUM(CASE WHEN sd.status = 'pending' THEN 1 ELSE 0 END) > 0
    ORDER BY MIN(sd.uploaded_at) ASC
  `;
  const pendingDocs = params.length > 0 ? await db.prepare(sql).bind(...params).all() : await db.prepare(sql).all();

  return c.html(renderDocumentReviewPage(user, pendingDocs.results || []));
});

// Reviewer: Get Stats for Badge Notification
app.get('/api/document-reviews/stats', async (c) => {
  const user = c.get('user');
  if (!user || (user.role !== 'admin' && user.role !== 'guru')) {
    return c.json({ success: false, message: 'Unauthorized' }, 403);
  }

  const db = c.env.DB;

  if (user.role === 'admin') {
    // Admin needs count of pending students (counted per-student, not per-document)
    const pending = await db.prepare(`
      SELECT COUNT(DISTINCT sd.student_id) as count 
      FROM student_documents sd
      JOIN students s ON sd.student_id = s.id
      WHERE sd.status = 'pending'
    `).first<{ count: number }>();

    return c.json({
      role: 'admin',
      pending_count: pending ? pending.count : 0
    });
  } else {
    // Guru needs approved and rejected students count in their homeroom class (counted per-student)
    const homeroomClass = user.homeroom_class;
    if (!homeroomClass) {
      return c.json({
        role: 'guru',
        homeroom_class: null,
        approved_count: 0,
        rejected_count: 0,
        pending_count: 0
      });
    }

    const stats = await db.prepare(`
      SELECT 
        COUNT(DISTINCT CASE WHEN sd.status = 'approved' THEN s.id END) as approved_count,
        COUNT(DISTINCT CASE WHEN sd.status = 'rejected' THEN s.id END) as rejected_count,
        COUNT(DISTINCT CASE WHEN sd.status = 'pending' THEN s.id END) as pending_count
      FROM student_documents sd
      JOIN students s ON sd.student_id = s.id
      WHERE s.class_name = ?
    `).bind(homeroomClass).first<{ approved_count: number; rejected_count: number; pending_count: number }>();

    return c.json({
      role: 'guru',
      homeroom_class: homeroomClass,
      approved_count: stats ? (stats.approved_count || 0) : 0,
      rejected_count: stats ? (stats.rejected_count || 0) : 0,
      pending_count: stats ? (stats.pending_count || 0) : 0
    });
  }
});

// Reviewer: Get JSON List of Reviews for Real-time Page Updates
app.get('/api/document-reviews/list', async (c) => {
  const user = c.get('user');
  if (!user || (user.role !== 'admin' && user.role !== 'guru')) {
    return c.json({ success: false, message: 'Unauthorized' }, 403);
  }
  const db = c.env.DB;
  const restrictClass = (user.role === 'guru' && user.homeroom_class) ? user.homeroom_class : null;
  let sql = `
    SELECT 
      s.id as student_id,
      s.name as student_name,
      s.class_name,
      s.photo_url as profile_photo_url,
      MAX(CASE WHEN sd.doc_type = 'akte_kelahiran' THEN sd.id END) as akte_id,
      MAX(CASE WHEN sd.doc_type = 'akte_kelahiran' THEN sd.file_url END) as akte_url,
      MAX(CASE WHEN sd.doc_type = 'akte_kelahiran' THEN sd.status END) as akte_status,
      MAX(CASE WHEN sd.doc_type = 'akte_kelahiran' THEN sd.rejection_note END) as akte_rejection_note,
      MAX(CASE WHEN sd.doc_type = 'kartu_keluarga' THEN sd.id END) as kk_id,
      MAX(CASE WHEN sd.doc_type = 'kartu_keluarga' THEN sd.file_url END) as kk_url,
      MAX(CASE WHEN sd.doc_type = 'kartu_keluarga' THEN sd.status END) as kk_status,
      MAX(CASE WHEN sd.doc_type = 'kartu_keluarga' THEN sd.rejection_note END) as kk_rejection_note,
      MAX(CASE WHEN sd.doc_type = 'foto' THEN sd.id END) as foto_id,
      MAX(CASE WHEN sd.doc_type = 'foto' THEN sd.file_url END) as foto_url,
      MAX(CASE WHEN sd.doc_type = 'foto' THEN sd.status END) as foto_status,
      MAX(CASE WHEN sd.doc_type = 'foto' THEN sd.rejection_note END) as foto_rejection_note
    FROM students s
    JOIN student_documents sd ON s.id = sd.student_id
  `;
  const params: any[] = [];
  if (restrictClass) {
    sql += " WHERE s.class_name = ?";
    params.push(restrictClass);
  }
  sql += `
    GROUP BY s.id
    HAVING SUM(CASE WHEN sd.status = 'pending' THEN 1 ELSE 0 END) > 0
    ORDER BY MIN(sd.uploaded_at) ASC
  `;
  const pendingDocs = params.length > 0 ? await db.prepare(sql).bind(...params).all() : await db.prepare(sql).all();
  return c.json({
    success: true,
    results: pendingDocs.results || []
  });
});

// Reviewer: Approve Document
app.post('/api/reviewer/documents/:id/approve', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.is_document_reviewer !== 1) {
    return c.text('Unauthorized', 403);
  }
  const docId = parseInt(c.req.param('id'), 10);
  const db = c.env.DB;

  const doc = await db.prepare('SELECT student_id, doc_type, file_url FROM student_documents WHERE id = ?').bind(docId).first<{ student_id: number; doc_type: string; file_url: string }>();

  await db.prepare(`
    UPDATE student_documents 
    SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(user.id.toString(), docId).run();

  if (doc) {
    await db.prepare(`
      UPDATE student_document_submissions 
      SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE student_id = ? AND doc_type = ? AND status = 'pending'
    `).bind(user.id.toString(), doc.student_id, doc.doc_type).run();

    if (doc.doc_type === 'foto') {
      await db.prepare('UPDATE students SET photo_url = ? WHERE id = ?')
        .bind(doc.file_url, doc.student_id)
        .run();
    }
  }

  await logAudit(db, {
    userId: user.id.toString(),
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'APPROVE_DOC',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    userAgent: getUserAgent(c),
    details: `Approved document ID ${docId}`
  });

  return c.redirect('/document-reviews?flash=Dokumen+berhasil+di-approve');
});

// Reviewer: Reject Document
app.post('/api/reviewer/documents/:id/reject', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.is_document_reviewer !== 1) {
    return c.text('Unauthorized', 403);
  }
  const docId = parseInt(c.req.param('id'), 10);
  const body = await c.req.parseBody();
  const note = String(body['rejection_note'] || '');
  const db = c.env.DB;

  const doc = await db.prepare('SELECT student_id, doc_type, file_path FROM student_documents WHERE id = ?').bind(docId).first<{ student_id: number; doc_type: string; file_path: string | null }>();
  if (doc && doc.file_path) {
    // Delete from R2
    try {
      if (c.env.PORTAL_SISWA_BUCKET) {
        await c.env.PORTAL_SISWA_BUCKET.delete(doc.file_path as string);
      }
    } catch (e) {
      console.error('Error deleting file from R2', e);
    }
  }

  await db.prepare(`
    UPDATE student_documents 
    SET status = 'rejected', file_path = NULL, file_url = NULL, rejection_note = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(note, user.id.toString(), docId).run();

  if (doc) {
    // Bersihkan file_path dan file_url di submission history agar file tidak bisa diakses lagi
    await db.prepare(`
      UPDATE student_document_submissions 
      SET status = 'rejected', file_path = NULL, file_url = NULL, rejection_note = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE student_id = ? AND doc_type = ? AND status = 'pending'
    `).bind(note, user.id.toString(), doc.student_id, doc.doc_type).run();
  }

  await logAudit(db, {
    userId: user.id.toString(),
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'REJECT_DOC',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    userAgent: getUserAgent(c),
    details: `Rejected document ID ${docId}`
  });

  return c.redirect('/document-reviews?flash=Dokumen+berhasil+di-reject');
});

// Reviewer: Mass Approve All
app.post('/api/reviewer/documents/approve-mass', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.is_document_reviewer !== 1) return c.text('Unauthorized', 403);
  const db = c.env.DB;

  // Find all pending 'foto' documents to update their student's photo_url
  const pendingFotos = await db.prepare(`
    SELECT student_id, file_url 
    FROM student_documents 
    WHERE doc_type = 'foto' AND status = 'pending'
  `).all<{ student_id: number; file_url: string }>();

  await db.prepare(`
    UPDATE student_documents 
    SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE status = 'pending'
  `).bind(user.id.toString()).run();

  await db.prepare(`
    UPDATE student_document_submissions 
    SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE status = 'pending'
  `).bind(user.id.toString()).run();

  if (pendingFotos.results) {
    for (const f of pendingFotos.results) {
      await db.prepare('UPDATE students SET photo_url = ? WHERE id = ?')
        .bind(f.file_url, f.student_id)
        .run();
    }
  }

  await logAudit(db, {
    userId: user.id.toString(),
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'APPROVE_MASS_DOC',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    userAgent: getUserAgent(c),
    details: 'Mass approved all pending documents'
  });
  return c.redirect('/document-reviews?flash=Semua+dokumen+pending+berhasil+di-approve');
});

// Reviewer: Approve Student
app.post('/api/reviewer/documents/approve-student/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.is_document_reviewer !== 1) return c.text('Unauthorized', 403);
  const studentId = parseInt(c.req.param('id'), 10);
  const db = c.env.DB;

  // Find if there is a pending 'foto' document for this student
  const pendingFoto = await db.prepare(`
    SELECT file_url 
    FROM student_documents 
    WHERE student_id = ? AND doc_type = 'foto' AND status = 'pending'
  `).bind(studentId).first<{ file_url: string }>();

  await db.prepare(`
    UPDATE student_documents 
    SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE student_id = ? AND status = 'pending'
  `).bind(user.id.toString(), studentId).run();

  await db.prepare(`
    UPDATE student_document_submissions 
    SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE student_id = ? AND status = 'pending'
  `).bind(user.id.toString(), studentId).run();

  if (pendingFoto) {
    await db.prepare('UPDATE students SET photo_url = ? WHERE id = ?')
      .bind(pendingFoto.file_url, studentId)
      .run();
  }

  await logAudit(db, {
    userId: user.id.toString(),
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'APPROVE_STUDENT_DOC',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    userAgent: getUserAgent(c),
    details: `Approved pending documents for student ID ${studentId}`
  });
  return c.redirect('/document-reviews?flash=Dokumen+siswa+berhasil+di-approve');
});

// Reviewer: Reject Student
app.post('/api/reviewer/documents/reject-student/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.is_document_reviewer !== 1) return c.text('Unauthorized', 403);
  const studentId = parseInt(c.req.param('id'), 10);
  const body = await c.req.parseBody();
  const note = String(body['rejection_note'] || '');
  const db = c.env.DB;

  const docs = await db.prepare('SELECT id, file_path FROM student_documents WHERE student_id = ? AND status = ?').bind(studentId, 'pending').all<{ id: number; file_path: string | null }>();

  if (docs.results) {
    for (const doc of docs.results) {
      if (doc.file_path) {
        try {
          if (c.env.PORTAL_SISWA_BUCKET) {
            await c.env.PORTAL_SISWA_BUCKET.delete(doc.file_path as string);
          }
        } catch (e) { }
      }
    }
  }

  await db.prepare(`
    UPDATE student_documents 
    SET status = 'rejected', file_path = NULL, file_url = NULL, rejection_note = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE student_id = ? AND status = 'pending'
  `).bind(note, user.id.toString(), studentId).run();

  // Bersihkan file_path dan file_url di submission history agar file tidak bisa diakses lagi
  await db.prepare(`
    UPDATE student_document_submissions 
    SET status = 'rejected', file_path = NULL, file_url = NULL, rejection_note = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE student_id = ? AND status = 'pending'
  `).bind(note, user.id.toString(), studentId).run();

  await logAudit(db, {
    userId: user.id.toString(),
    userName: user.full_name || user.username,
    userRole: user.role,
    action: 'REJECT_STUDENT_DOC',
    status: 'SUCCESS',
    ipAddress: getClientIp(c),
    userAgent: getUserAgent(c),
    details: `Rejected pending documents for student ID ${studentId}`
  });
  return c.redirect('/document-reviews?flash=Dokumen+siswa+berhasil+di-reject');
});

// Reviewer: Get Document Submissions History Page
app.get('/document-submissions', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.role !== 'guru') {
    return c.text('Unauthorized', 403);
  }

  const db = c.env.DB;

  // Extract query filters
  const statusFilter = c.req.query('status') || '';
  const docTypeFilter = c.req.query('doc_type') || '';

  const restrictClass = (user.role === 'guru' && user.homeroom_class) ? user.homeroom_class : null;
  let classNameFilter = c.req.query('class_name') || '';
  if (restrictClass) {
    classNameFilter = restrictClass;
  }
  const searchFilter = c.req.query('search') || '';

  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = 15;
  const offset = (page - 1) * limit;

  // Build query where clause
  let whereClause = '1 = 1';
  const params: any[] = [];

  if (classNameFilter) {
    whereClause += ' AND s.class_name = ?';
    params.push(classNameFilter);
  }
  if (searchFilter) {
    whereClause += ' AND s.name LIKE ?';
    params.push(`%${searchFilter}%`);
  }

  // Build query having clause (for submission status/type filters)
  let havingClause = '';
  const havingParams: any[] = [];
  if (statusFilter && docTypeFilter) {
    havingClause = 'HAVING SUM(CASE WHEN ds.status = ? AND ds.doc_type = ? THEN 1 ELSE 0 END) > 0';
    havingParams.push(statusFilter, docTypeFilter);
  } else if (statusFilter) {
    havingClause = 'HAVING SUM(CASE WHEN ds.status = ? THEN 1 ELSE 0 END) > 0';
    havingParams.push(statusFilter);
  } else if (docTypeFilter) {
    havingClause = 'HAVING SUM(CASE WHEN ds.doc_type = ? THEN 1 ELSE 0 END) > 0';
    havingParams.push(docTypeFilter);
  }

  // Filter latest submissions by ID to avoid aggregates getting stale data
  const baseSubmissionsQuery = `
    SELECT ds.*
    FROM student_document_submissions ds
    WHERE ds.id IN (
      SELECT MAX(id) 
      FROM student_document_submissions 
      GROUP BY student_id, doc_type
    )
  `;

  // Get total unique students count for pagination
  const totalRes = await db.prepare(`
    SELECT COUNT(*) as total FROM (
      SELECT s.id
      FROM (${baseSubmissionsQuery}) ds
      JOIN students s ON ds.student_id = s.id
      WHERE ${whereClause}
      GROUP BY s.id
      ${havingClause}
    )
  `).bind(...params, ...havingParams).first<{ total: number }>();
  const total = totalRes ? totalRes.total : 0;
  const totalPages = Math.ceil(total / limit);

  // Fetch paginated aggregated submissions list (one student per row)
  const submissionsQuery = `
    SELECT 
      s.id as student_id,
      s.name as student_name,
      s.class_name,
      s.photo_url as profile_photo_url,
      
      -- Akte Kelahiran Aggregates
      MAX(CASE WHEN ds.doc_type = 'akte_kelahiran' THEN ds.id END) as akte_id,
      MAX(CASE WHEN ds.doc_type = 'akte_kelahiran' THEN ds.file_url END) as akte_url,
      MAX(CASE WHEN ds.doc_type = 'akte_kelahiran' THEN ds.status END) as akte_status,
      MAX(CASE WHEN ds.doc_type = 'akte_kelahiran' THEN ds.rejection_note END) as akte_rejection_note,
      MAX(CASE WHEN ds.doc_type = 'akte_kelahiran' THEN ds.uploaded_at END) as akte_uploaded_at,
      MAX(CASE WHEN ds.doc_type = 'akte_kelahiran' THEN ds.submitted_by END) as akte_submitted_by,
      MAX(CASE WHEN ds.doc_type = 'akte_kelahiran' THEN tp_sub.full_name END) as akte_submitter_name,
      MAX(CASE WHEN ds.doc_type = 'akte_kelahiran' THEN u_sub.id END) as akte_submitter_username,
      MAX(CASE WHEN ds.doc_type = 'akte_kelahiran' THEN ds.reviewed_by END) as akte_reviewed_by,
      MAX(CASE WHEN ds.doc_type = 'akte_kelahiran' THEN tp_rev.full_name END) as akte_reviewer_name,
      MAX(CASE WHEN ds.doc_type = 'akte_kelahiran' THEN ds.reviewed_at END) as akte_reviewed_at,
      
      -- Kartu Keluarga Aggregates
      MAX(CASE WHEN ds.doc_type = 'kartu_keluarga' THEN ds.id END) as kk_id,
      MAX(CASE WHEN ds.doc_type = 'kartu_keluarga' THEN ds.file_url END) as kk_url,
      MAX(CASE WHEN ds.doc_type = 'kartu_keluarga' THEN ds.status END) as kk_status,
      MAX(CASE WHEN ds.doc_type = 'kartu_keluarga' THEN ds.rejection_note END) as kk_rejection_note,
      MAX(CASE WHEN ds.doc_type = 'kartu_keluarga' THEN ds.uploaded_at END) as kk_uploaded_at,
      MAX(CASE WHEN ds.doc_type = 'kartu_keluarga' THEN ds.submitted_by END) as kk_submitted_by,
      MAX(CASE WHEN ds.doc_type = 'kartu_keluarga' THEN tp_sub.full_name END) as kk_submitter_name,
      MAX(CASE WHEN ds.doc_type = 'kartu_keluarga' THEN u_sub.id END) as kk_submitter_username,
      MAX(CASE WHEN ds.doc_type = 'kartu_keluarga' THEN ds.reviewed_by END) as kk_reviewed_by,
      MAX(CASE WHEN ds.doc_type = 'kartu_keluarga' THEN tp_rev.full_name END) as kk_reviewer_name,
      MAX(CASE WHEN ds.doc_type = 'kartu_keluarga' THEN ds.reviewed_at END) as kk_reviewed_at,

      -- Foto Aggregates
      MAX(CASE WHEN ds.doc_type = 'foto' THEN ds.id END) as foto_id,
      MAX(CASE WHEN ds.doc_type = 'foto' THEN ds.file_url END) as foto_url,
      MAX(CASE WHEN ds.doc_type = 'foto' THEN ds.status END) as foto_status,
      MAX(CASE WHEN ds.doc_type = 'foto' THEN ds.rejection_note END) as foto_rejection_note,
      MAX(CASE WHEN ds.doc_type = 'foto' THEN ds.uploaded_at END) as foto_uploaded_at,
      MAX(CASE WHEN ds.doc_type = 'foto' THEN ds.submitted_by END) as foto_submitted_by,
      MAX(CASE WHEN ds.doc_type = 'foto' THEN tp_sub.full_name END) as foto_submitter_name,
      MAX(CASE WHEN ds.doc_type = 'foto' THEN u_sub.id END) as foto_submitter_username,
      MAX(CASE WHEN ds.doc_type = 'foto' THEN ds.reviewed_by END) as foto_reviewed_by,
      MAX(CASE WHEN ds.doc_type = 'foto' THEN tp_rev.full_name END) as foto_reviewer_name,
      MAX(CASE WHEN ds.doc_type = 'foto' THEN ds.reviewed_at END) as foto_reviewed_at
    FROM (${baseSubmissionsQuery}) ds
    JOIN students s ON ds.student_id = s.id
    LEFT JOIN users u_sub ON ds.submitted_by = u_sub.id
    LEFT JOIN teacher_profiles tp_sub ON u_sub.id = tp_sub.user_id
    LEFT JOIN users u_rev ON ds.reviewed_by = u_rev.id
    LEFT JOIN teacher_profiles tp_rev ON u_rev.id = tp_rev.user_id
    WHERE ${whereClause}
    GROUP BY s.id
    ${havingClause}
    ORDER BY MAX(ds.uploaded_at) DESC
    LIMIT ? OFFSET ?
  `;

  const queryParams = [...params, ...havingParams, limit, offset];
  const submissionsRes = await db.prepare(submissionsQuery).bind(...queryParams).all();
  const submissions = submissionsRes.results || [];

  // Fetch unique classes for filter dropdown
  let classes: string[] = [];
  if (restrictClass) {
    classes = [restrictClass];
  } else {
    const classesRes = await db.prepare('SELECT DISTINCT class_name FROM students WHERE class_name IS NOT NULL ORDER BY class_name ASC').all<{ class_name: string }>();
    classes = (classesRes.results || []).map(r => r.class_name);
  }

  return c.html(renderDocumentSubmissionsPage(
    user,
    submissions,
    { status: statusFilter, doc_type: docTypeFilter, class_name: classNameFilter, search: searchFilter },
    classes,
    { currentPage: page, totalPages, totalItems: total }
  ));
});

export default app;


