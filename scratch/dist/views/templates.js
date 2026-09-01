/**
 * Barrel file — templates.ts
 *
 * File ini HANYA berisi re-export dari semua modul halaman yang telah dipisahkan.
 * src/index.ts tetap dapat mengimpor dari sini tanpa perubahan apapun.
 *
 * Struktur modul lengkap:
 *   src/views/helpers.ts             ← WIT helpers, DEFAULT_AVATAR
 *   src/views/layout.ts              ← renderLayout (HTML shell + sidebar)
 *   src/views/login.ts               ← renderLoginPage, renderForgotPasswordPage
 *   src/views/dashboard.ts           ← renderDashboardPage
 *   src/views/students.ts            ← renderStudentListPage, renderStudentDetailPage
 *   src/views/import.ts              ← renderImportPage
 *   src/views/audit-log.ts           ← renderAuditLogPage
 *   src/views/admin-accounts.ts      ← renderSetupAccountsPage
 *   src/views/admin-settings.ts      ← renderAdminSettingsPage
 *   src/views/print-cards.ts         ← renderPrintCardsPage
 *   src/views/priority-students.ts   ← renderPriorityStudentsPage
 *   src/views/promotion.ts           ← renderPromotionPage
 *   src/views/graduated-students.ts  ← renderGraduatedStudentsPage, renderGraduatedStudentDetailPage
 *   src/views/document-review.ts     ← renderDocumentReviewPage
 *   src/views/document-submissions.ts← renderDocumentSubmissionsPage
 *   src/views/homeroom.ts            ← renderHomeroomManagementPage
 *   src/views/guide.ts               ← renderGuidePage
 *   src/views/error.ts               ← renderErrorPage
 */
// Helpers & Layout
export { formatWIT, formatWITDate, DEFAULT_AVATAR, WIT_LOCALE, WIT_TZ } from './helpers';
export { renderLayout } from './layout';
// Auth Pages
export { renderLoginPage, renderForgotPasswordPage } from './login';
// Main Pages
export { renderDashboardPage } from './dashboard';
export { renderStudentListPage, renderStudentDetailPage } from './students';
export { renderImportPage } from './import';
export { renderAuditLogPage } from './audit-log';
export { renderSetupAccountsPage } from './admin-accounts';
export { renderAdminSettingsPage } from './admin-settings';
export { renderPrintCardsPage } from './print-cards';
export { renderPriorityStudentsPage } from './priority-students';
export { renderMutationsPage } from './mutations';
export { renderPromotionPage } from './promotion';
export { renderGraduatedStudentsPage, renderGraduatedStudentDetailPage } from './graduated-students';
export { renderDocumentReviewPage } from './document-review';
export { renderDocumentSubmissionsPage } from './document-submissions';
export { renderHomeroomManagementPage } from './homeroom';
export { renderGuidePage } from './guide';
export { renderErrorPage } from './error';
