ACLC Library — Mandaue Campus (front-end only)

Structure (one folder per concern, multiple files per page set):
- src/assets/logo.png — your ACLC logo
- src/css/base.css, header.css, forms.css, tables.css
- src/js/store.js (demo localStorage data), router.js, app.js (boot)
- src/pages/home.js (welcome + time in/out toast)
- src/pages/borrow.js (borrow tab + return tab with borrowed-card select)
- src/pages/admin.js (admin login, verify 4-digit, input new MFA)
- src/pages/logs.js (visit logs: attendance table + borrowing table, export CSV)
- src/pages/register.js (student self-registration matching groupmate mockup)
- src/pages/profile.js (read-only student profile: stats + borrowing/visit history, lookup by ID)
- src/pages/login.js (student login: ID/email + password → own read-only profile)

Routes: #/ #/borrow #/return #/register #/login #/profile/<id> #/admin #/verify #/mfa #/logs

Auth: demo staff login admin@aclc.edu.ph / admin123 + 4-digit code (default 1234, changeable via Change code). Session lives in sessionStorage; #/logs and #/mfa redirect to #/admin when logged out; Log out clears it. Idle reset: 90s on student screens, 3min on admin screens.
Students: registerUser({first,last,studentId,email,photo,password}) with XX-XXXX ID + email validation, duplicate ID/email blocked, password min 6 + confirm match, photo downscaled to 160px JPEG to fit localStorage. Seeded U1-U3 match old visits/loans; old free-text names auto-migrate via inferUsersFromRecords. resolveBorrower() canonicalizes to "Last, First — ID" on kiosk/borrow, walk-ins still allowed. Logs has Students tab: search, visits/active counts, delete (records kept), CSV export + bulk Import CSV with template. Stats header adds Registered count.
Visits: each time-in records a purpose (PURPOSES: Study/Research/Borrow/Return/Computer use/Group work/Others); old visits migrate with purpose "". Time-out returns durationMs; Stay column shows fmtDur (45m, 1h 5m), stats header shows Avg. stay today. Kiosk recognizes registered IDs with photo + "Welcome back, {first}!" + visit # + books out, and personalizes time-in/out messages.
Student auth: passwords stored as salted SHA-256 (sha256Hex, per-user salt "aclc-lib$<id>$"), never plaintext. verifyStudent(login,password) with generic error (no user enumeration). Seeded/imported/migrated accounts default to initial password = Student ID. Student session (sessionStorage aclc_student, separate from staff) set on login, shown as owner pill + Log out on own profile, cleared on idle timeout.
Backup: exportDatabase() downloads one JSON (visits+loans+users, versioned); importDatabase() validates shape/size, replaces data, re-runs migrations. Staff code (aclc_admin_creds) is intentionally NOT in the backup — it stays per-device.
Data: visits/loans carry ts (epoch ms), iso, day (YYYY-MM-DD) for backend use; display strings unchanged. Attendance table date picker filters by day. Visits have id (V...); loans have id (L...).
Loans: 7-day due dates (due, dueTs, dueDay). Overdue = Borrowed && dueTs < now. Stats header shows visits today / currently inside / active borrows / overdue. extendLoanById(id, 7) extends from max(dueTs, now).
Guards: double Time-In blocked ("already timed in"), Time-Out without open Time-In warns instead of creating a tin="—" row. Name match is trimmed + case-insensitive.
Home: single Borrow / Return Book button (#/borrow, tabs cover both). Brand logo clickable to #/. Enter in name field submits Time In.
Borrow/Return: inline validation errors (no silent fails), Enter submits, tabs sync URL via replaceState, Return has no prefilled ID. Header has Home button + clickable brand.
Admin: Show/Hide password toggle, Enter submits login, Back labels. Verify has Clear code + paste support; login requires clicking Enter or pressing Enter (no auto-submit on 4th digit). MFA change requires typing new code twice + has Log out.
Logs: header back to Log out + Export only; Kiosk view is a quiet ← link above stats (keeps auth). Live oninput search (focus kept), placeholders, Clear button (resets search/date/filter), "Showing X of Y" counts, empty states, Due column + Overdue badge/filter. Row actions: attendance Delete; borrowing Return / +7 days / Delete (confirm first). Toast feedback for export + actions. Export downloads only the filtered rows with headers + BOM (aclc-attendance/borrowing-YYYY-MM-DD.csv), warns when 0 rows.
