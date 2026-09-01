import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
const COOKIE_NAME = 'portal_session1';
function safeBase64Encode(str) {
    try {
        return btoa(unescape(encodeURIComponent(str)));
    }
    catch {
        return btoa(str);
    }
}
function safeBase64Decode(str) {
    try {
        return decodeURIComponent(escape(atob(str)));
    }
    catch {
        return atob(str);
    }
}
export async function hashPin(pin, salt) {
    if (!salt)
        return '';
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
export function getClientIp(c) {
    return c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';
}
export function getUserAgent(c) {
    return c.req.header('user-agent') || 'Unknown Browser';
}
export async function logAudit(db, log) {
    if (!db)
        return;
    try {
        await db.prepare(`
      INSERT INTO portal_audit_logs (user_id, user_name, user_role, action, status, ip_address, user_agent, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(log.userId ? String(log.userId) : null, log.userName || null, log.userRole || null, log.action, log.status || 'SUCCESS', log.ipAddress || null, log.userAgent || null, log.details || null).run();
    }
    catch (err) {
        console.error('Failed to log audit:', err);
    }
}
export async function updateActiveSession(db, session) {
    if (!db)
        return;
    try {
        await db.prepare(`
      INSERT INTO active_sessions (user_id, user_name, user_role, avatar_url, ip_address, last_seen_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        user_name = excluded.user_name,
        user_role = excluded.user_role,
        avatar_url = excluded.avatar_url,
        ip_address = excluded.ip_address,
        last_seen_at = datetime('now')
    `).bind(String(session.userId), session.userName, session.userRole, session.avatarUrl || null, session.ipAddress || null).run();
    }
    catch (err) {
        console.error('Failed to update active session:', err);
    }
}
export async function removeActiveSession(db, userId) {
    if (!db)
        return;
    try {
        await db.prepare('DELETE FROM active_sessions WHERE user_id = ?').bind(String(userId)).run();
    }
    catch (err) {
        console.error('Failed to remove active session:', err);
    }
}
export async function loginUser(c, username, pass) {
    const db = c.env.DB;
    const ip = getClientIp(c);
    const ua = getUserAgent(c);
    if (!db) {
        console.error('D1 Database binding (DB) is undefined!');
        return null;
    }
    let rawUser = null;
    // 1. Try querying by id (Primary Key in users table)
    try {
        rawUser = await db
            .prepare('SELECT * FROM users WHERE id = ?')
            .bind(username)
            .first();
    }
    catch (err) {
        console.error('Error querying users by id:', err);
    }
    // 2. Fallback querying by username column if id query returned nothing
    if (!rawUser) {
        try {
            rawUser = await db
                .prepare('SELECT * FROM users WHERE username = ?')
                .bind(username)
                .first();
        }
        catch (err) {
            // username column might not exist on remote users table
        }
    }
    if (!rawUser) {
        await logAudit(db, {
            userId: username,
            userName: username,
            userRole: 'unknown',
            action: 'LOGIN_FAILED',
            status: 'FAILED',
            ipAddress: ip,
            userAgent: ua,
            details: 'User ID / Username tidak ditemukan'
        });
        return null;
    }
    // Check password / PIN
    let isValid = false;
    if (rawUser.pin_hash && rawUser.salt) {
        const computedHash = await hashPin(pass, rawUser.salt);
        if (computedHash === rawUser.pin_hash) {
            isValid = true;
        }
    }
    if (!isValid && rawUser.plain_pin && String(rawUser.plain_pin).trim() === pass) {
        isValid = true;
    }
    if (!isValid && rawUser.password && String(rawUser.password).trim() === pass) {
        isValid = true;
    }
    if (!isValid) {
        await logAudit(db, {
            userId: rawUser.id,
            userName: rawUser.id,
            userRole: String(rawUser.role || 'unknown'),
            action: 'LOGIN_FAILED',
            status: 'FAILED',
            ipAddress: ip,
            userAgent: ua,
            details: 'PIN / Password salah'
        });
        return null;
    }
    // Role mapping: 'teacher' / 'guru' -> 'guru', 'admin' -> 'admin', default 'guru'
    let role = 'guru';
    const rawRole = String(rawUser.role || '').toLowerCase();
    if (rawRole === 'admin')
        role = 'admin';
    else if (rawRole === 'siswa')
        role = 'siswa';
    else
        role = 'guru';
    // Fetch full_name and avatar_url from teacher_profiles or students if available
    let fullName = String(rawUser.id || rawUser.username || username);
    let avatarUrl = null;
    if (role === 'guru' || role === 'admin') {
        try {
            const tp = await db.prepare('SELECT full_name, avatar_url FROM teacher_profiles WHERE user_id = ?').bind(rawUser.id).first();
            if (tp) {
                if (tp.full_name)
                    fullName = tp.full_name;
                if (tp.avatar_url) {
                    avatarUrl = tp.avatar_url.startsWith('http') || tp.avatar_url.startsWith('/files/')
                        ? tp.avatar_url
                        : `/files/${tp.avatar_url.replace(/^\/+/, '')}`;
                }
            }
        }
        catch (e) { }
    }
    else if (role === 'siswa') {
        try {
            const st = await db.prepare('SELECT id, name, photo_url FROM students WHERE nipd = ?').bind(rawUser.id).first();
            if (st) {
                rawUser.linked_id = st.id;
                if (st.name)
                    fullName = st.name;
                if (st.photo_url) {
                    avatarUrl = st.photo_url.startsWith('http') || st.photo_url.startsWith('/files/')
                        ? st.photo_url
                        : `/files/${st.photo_url.replace(/^\/+/, '')}`;
                }
            }
        }
        catch (e) { }
    }
    const userObj = {
        id: rawUser.id,
        username: rawUser.id || rawUser.username || username,
        full_name: fullName,
        avatar_url: avatarUrl,
        role: role,
        is_active: rawUser.is_active ?? 1,
        linked_id: rawUser.linked_id ? Number(rawUser.linked_id) : null,
        homeroom_class: rawUser.homeroom_class || null,
        is_document_reviewer: rawUser.is_document_reviewer ? Number(rawUser.is_document_reviewer) : 0
    };
    // Log successful login & update active session
    await logAudit(db, {
        userId: userObj.id,
        userName: userObj.full_name || userObj.username,
        userRole: userObj.role,
        action: 'LOGIN_SUCCESS',
        status: 'SUCCESS',
        ipAddress: ip,
        userAgent: ua,
        details: `Pengguna berhasil login sebagai ${userObj.role.toUpperCase()}`
    });
    await updateActiveSession(db, {
        userId: userObj.id,
        userName: userObj.full_name || userObj.username,
        userRole: userObj.role,
        avatarUrl: userObj.avatar_url,
        ipAddress: ip
    });
    // Set session cookie (20 Menit = 1200 detik)
    const sessionUser = {
        ...userObj,
        last_active: Date.now()
    };
    setCookie(c, COOKIE_NAME, safeBase64Encode(JSON.stringify(sessionUser)), {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 1200
    });
    return userObj;
}
export async function loginUserBySso(c, ssoUser) {
    const db = c.env.DB;
    const ip = getClientIp(c);
    const ua = getUserAgent(c);
    const identifier = String(ssoUser.username || ssoUser.id || ssoUser.nip || ssoUser.email || '').trim();
    if (!identifier) {
        return null;
    }
    let rawUser = null;
    if (db) {
        // 1. Try querying by id
        try {
            rawUser = await db.prepare('SELECT * FROM users WHERE id = ?').bind(identifier).first();
        }
        catch (err) {
            console.error('Error querying users by id for SSO:', err);
        }
        // 2. Fallback querying by username
        if (!rawUser) {
            try {
                rawUser = await db.prepare('SELECT * FROM users WHERE username = ?').bind(identifier).first();
            }
            catch (err) { }
        }
        // 3. Fallback for students by nipd or nisn
        if (!rawUser) {
            try {
                const student = await db.prepare('SELECT * FROM students WHERE nipd = ? OR nisn = ?').bind(identifier, identifier).first();
                if (student) {
                    rawUser = {
                        id: student.nipd || identifier,
                        role: 'siswa',
                        is_active: 1,
                        linked_id: student.id
                    };
                }
            }
            catch (err) { }
        }
    }
    // Role mapping: 'teacher' / 'guru' -> 'guru', 'admin' -> 'admin', 'siswa' -> 'siswa'
    let role = 'guru';
    const rawRole = String(rawUser?.role || ssoUser.role || '').toLowerCase();
    if (rawRole === 'admin' || rawRole === 'administrator' || rawRole === 'ops')
        role = 'admin';
    else if (rawRole === 'siswa' || rawRole === 'student')
        role = 'siswa';
    else
        role = 'guru';
    const userId = String(rawUser?.id || ssoUser.id || identifier);
    let fullName = String(ssoUser.full_name || ssoUser.name || rawUser?.id || identifier);
    let avatarUrl = ssoUser.avatar_url || null;
    let linkedId = rawUser?.linked_id ? Number(rawUser.linked_id) : null;
    let homeroomClass = rawUser?.homeroom_class || null;
    let isDocReviewer = rawUser?.is_document_reviewer ? Number(rawUser.is_document_reviewer) : (role === 'admin' ? 1 : 0);
    if (db) {
        if (role === 'guru' || role === 'admin') {
            try {
                const tp = await db.prepare('SELECT full_name, avatar_url FROM teacher_profiles WHERE user_id = ?').bind(userId).first();
                if (tp) {
                    if (tp.full_name)
                        fullName = tp.full_name;
                    if (tp.avatar_url) {
                        avatarUrl = tp.avatar_url.startsWith('http') || tp.avatar_url.startsWith('/files/')
                            ? tp.avatar_url
                            : `/files/${tp.avatar_url.replace(/^\/+/, '')}`;
                    }
                }
            }
            catch (e) { }
        }
        else if (role === 'siswa') {
            try {
                const st = await db.prepare('SELECT id, name, photo_url FROM students WHERE nipd = ?').bind(userId).first();
                if (st) {
                    linkedId = st.id;
                    if (st.name)
                        fullName = st.name;
                    if (st.photo_url) {
                        avatarUrl = st.photo_url.startsWith('http') || st.photo_url.startsWith('/files/')
                            ? st.photo_url
                            : `/files/${st.photo_url.replace(/^\/+/, '')}`;
                    }
                }
            }
            catch (e) { }
        }
    }
    const userObj = {
        id: userId,
        username: identifier,
        full_name: fullName,
        avatar_url: avatarUrl,
        role: role,
        is_active: rawUser?.is_active ?? 1,
        linked_id: linkedId,
        homeroom_class: homeroomClass,
        is_document_reviewer: isDocReviewer
    };
    // Log successful login & update active session
    if (db) {
        await logAudit(db, {
            userId: userObj.id,
            userName: userObj.full_name || userObj.username,
            userRole: userObj.role,
            action: 'LOGIN_SSO_SUCCESS',
            status: 'SUCCESS',
            ipAddress: ip,
            userAgent: ua,
            details: `Pengguna berhasil login via SSO Terpadu sebagai ${userObj.role.toUpperCase()}`
        });
        await updateActiveSession(db, {
            userId: userObj.id,
            userName: userObj.full_name || userObj.username,
            userRole: userObj.role,
            avatarUrl: userObj.avatar_url,
            ipAddress: ip
        });
    }
    // Set session cookie (20 Menit = 1200 detik)
    const sessionUser = {
        ...userObj,
        last_active: Date.now()
    };
    setCookie(c, COOKIE_NAME, safeBase64Encode(JSON.stringify(sessionUser)), {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 1200
    });
    return userObj;
}
export function getCurrentUser(c) {
    const cookie = getCookie(c, COOKIE_NAME);
    if (!cookie)
        return null;
    try {
        const raw = safeBase64Decode(cookie);
        const data = JSON.parse(raw);
        // Cek batas waktu inaktivitas (20 Menit = 1.200.000 ms)
        const now = Date.now();
        const lastActive = data.last_active || 0;
        if (lastActive > 0 && (now - lastActive > 20 * 60 * 1000)) {
            return null; // Expired / Inactive for > 20 minutes
        }
        return {
            id: data.id,
            username: data.username,
            full_name: data.full_name || data.username,
            avatar_url: data.avatar_url || null,
            role: data.role,
            is_active: 1,
            linked_id: data.linked_id ?? null,
            homeroom_class: data.homeroom_class ?? null,
            is_document_reviewer: data.is_document_reviewer ?? 0
        };
    }
    catch {
        return null;
    }
}
export async function logoutUser(c) {
    const user = getCurrentUser(c);
    if (user && c.env.DB) {
        const ip = getClientIp(c);
        const ua = getUserAgent(c);
        await logAudit(c.env.DB, {
            userId: user.id,
            userName: user.full_name || user.username,
            userRole: user.role,
            action: 'LOGOUT',
            status: 'SUCCESS',
            ipAddress: ip,
            userAgent: ua,
            details: 'Pengguna melakukan logout dari sistem'
        });
        await removeActiveSession(c.env.DB, user.id);
    }
    deleteCookie(c, COOKIE_NAME, { path: '/' });
}
export async function authMiddleware(c, next) {
    const user = getCurrentUser(c);
    if (!user) {
        deleteCookie(c, COOKIE_NAME, { path: '/' });
        const flashMsg = encodeURIComponent('Sesi Anda telah berakhir karena tidak aktif selama 20 menit.');
        return c.redirect(`/login?flash=${flashMsg}`);
    }
    // Sliding Session: Perbarui cookie last_active & atur ulang maxAge ke 20 menit (1200 detik)
    const updatedSession = {
        ...user,
        last_active: Date.now()
    };
    setCookie(c, COOKIE_NAME, safeBase64Encode(JSON.stringify(updatedSession)), {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 1200
    });
    c.set('user', user);
    await next();
}
