ACLC Library — Mandaue Campus (front-end only)

Structure (one folder per concern, multiple files per page set):
- src/assets/logo.png — your ACLC logo
- src/css/base.css, header.css, forms.css, tables.css
- src/js/store.js (demo localStorage data), router.js, app.js (boot)
- src/pages/home.js (welcome + time in/out toast)
- src/pages/borrow.js (borrow tab + return tab with borrowed-card select)
- src/pages/admin.js (admin login, verify 4-digit, input new MFA)
- src/pages/logs.js (visit logs: attendance table + borrowing table, export CSV)

Routes: #/ #/borrow #/return #/admin #/verify #/mfa #/logs

Auth: demo staff login admin@aclc.edu.ph / admin123 + 4-digit code (default 1234, changeable via Change MFA). Session lives in sessionStorage; #/logs and #/mfa redirect to #/admin when logged out; Log out clears it. Idle reset: 90s on student screens, 3min on admin screens.
Data: visits/loans carry ts (epoch ms), iso, day (YYYY-MM-DD) for backend use; display strings unchanged. Attendance table date picker filters by day.
