const K = "aclc_lib_demo_v3";
const CK = "aclc_admin_creds";
export const SES_KEY = "aclc_admin";
export const STEP_KEY = "aclc_admin_step";
export const LOAN_DAYS = 7;
const DAY_MS = 86400000;
function dayKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function dispTime(d) { return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
function dispDate(d) { return d.toLocaleDateString([], { month: "short", day: "numeric" }); }
function newId() { return "L" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
function newVid() { return "V" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
function newUid() { return "U" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
export function canonUser(u) {
  if (!u) return "";
  return String(u.last + ", " + u.first + " — " + u.studentId);
}
export const PURPOSES = ["Study", "Research", "Borrow", "Return", "Computer use", "Group work", "Others"];
// ---- Student passwords: SHA-256 with per-user salt (sync, so every path hashes identically) ----
const SHA256_K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
export function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const total = data.length + 1 + ((64 - ((data.length + 1 + 8) % 64)) % 64) + 8;
  const msg = new Uint8Array(total);
  msg.set(data);
  msg[data.length] = 0x80;
  const view = new DataView(msg.buffer);
  view.setUint32(total - 4, data.length * 8);
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const w = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA256_K[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map(x => (x >>> 0).toString(16).padStart(8, "0")).join("");
}
export function hashPass(studentId, password) {
  return sha256Hex("aclc-lib$" + String(studentId || "").trim().toLowerCase() + "$" + String(password || ""));
}
// Initial password for seeded / imported / migrated accounts is the Student ID itself.
export function defaultPassHash(studentId) { return hashPass(studentId, studentId); }
export function fmtDur(ms) {
  if (ms == null || ms < 0) return "—";
  const m = Math.floor(ms / 60000);
  if (m < 1) return "<1m";
  if (m < 60) return m + "m";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h " + (m % 60) + "m";
  const d = Math.floor(h / 24);
  return d + "d " + (h % 24) + "h";
}
function defaultUsers() {
  const now = Date.now();
  return [
    { id: "U1", first: "A.", last: "Reyes", studentId: "22-0387", email: "a.reyes@aclc.edu.ph", photo: "", ts: now, iso: new Date(now).toISOString() },
    { id: "U2", first: "J.", last: "Mendoza", studentId: "21-0142", email: "j.mendoza@aclc.edu.ph", photo: "", ts: now, iso: new Date(now).toISOString() },
    { id: "U3", first: "L.", last: "Santos", studentId: "20-0951", email: "l.santos@aclc.edu.ph", photo: "", ts: now, iso: new Date(now).toISOString() }
  ];
}
// Try to recover user-like rows from old free-text "Last, First — ID" visits/loans
// so pre-existing records keep working after the registration upgrade.
function inferUsersFromRecords(d, base) {
  const seen = new Set(base.map(u => String(u.studentId || "").trim().toLowerCase()));
  const out = base.slice();
  const names = [];
  (d.visits || []).forEach(v => { if (v && v.name) names.push(v.name); });
  (d.loans || []).forEach(l => { if (l && l.student) names.push(l.student); });
  for (const raw of names) {
    const m = String(raw).split("—");
    if (m.length < 2) continue;
    const sid = m[1].trim();
    if (!sid || seen.has(sid.toLowerCase())) continue;
    const left = m[0].trim();
    const parts = left.split(",");
    let last = "", first = "";
    if (parts.length >= 2) { last = parts[0].trim(); first = parts.slice(1).join(",").trim(); }
    else { first = left; }
    if (!last && !first) continue;
    seen.add(sid.toLowerCase());
    const now = Date.now();
    out.push({ id: newUid(), first: first || "—", last: last || "—", studentId: sid, email: "", photo: "", ts: now, iso: new Date(now).toISOString(), inferred: true });
  }
  return out;
}
function at(y, mo, d, h, mi) { const x = new Date(y, mo, d, h, mi); return { ts: x.getTime(), iso: x.toISOString(), day: dayKey(x) }; }
function dueFor(ts) {
  const due = new Date(ts + LOAN_DAYS * DAY_MS);
  return { due: dispDate(due), dueTs: due.getTime(), dueDay: dayKey(due) };
}
export function seed() {
  try {
    const raw = localStorage.getItem(K);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const d = {
    visits: [
      Object.assign({ id: "V1", name: "Mendoza, J. — 21-0142", purpose: "Study", tin: "9:04 AM", tout: "10:15 AM", date: "Aug 11" }, at(2026, 7, 11, 9, 4), { toutTs: new Date(2026, 7, 11, 10, 15).getTime() }),
      Object.assign({ id: "V2", name: "Reyes, A. — 22-0387", purpose: "Research", tin: "9:20 AM", tout: "—", date: "Aug 11" }, at(2026, 7, 11, 9, 20), { toutTs: null }),
      Object.assign({ id: "V3", name: "Santos, L. — 20-0951", purpose: "Borrow", tin: "9:31 AM", tout: "11:02 AM", date: "Aug 11" }, at(2026, 7, 11, 9, 31), { toutTs: new Date(2026, 7, 11, 11, 2).getTime() })
    ],
    loans: [
      Object.assign({ id: "L1", student: "Reyes, A. — 22-0387", book: "The Great Gatsby", author: "F.S. Fitzgerald", borrowed: "Aug 20", returned: "-", status: "Borrowed" }, at(2026, 7, 20, 9, 0), dueFor(new Date(2026, 7, 20, 9, 0).getTime()), { returnedTs: null, returnedDay: null }),
      Object.assign({ id: "L3", student: "Reyes, A. — 22-0387", book: "To Kill a Mockingbird", author: "Harper Lee", borrowed: "Aug 21", returned: "-", status: "Borrowed" }, at(2026, 7, 21, 10, 0), dueFor(new Date(2026, 7, 21, 10, 0).getTime()), { returnedTs: null, returnedDay: null }),
      Object.assign({ id: "L4", student: "Reyes, A. — 22-0387", book: "1984", author: "George Orwell", borrowed: "Aug 21", returned: "-", status: "Borrowed" }, at(2026, 7, 21, 11, 0), dueFor(new Date(2026, 7, 21, 11, 0).getTime()), { returnedTs: null, returnedDay: null }),
      Object.assign({ id: "L5", student: "Reyes, A. — 22-0387", book: "Pride and Prejudice", author: "Jane Austen", borrowed: "Aug 22", returned: "-", status: "Borrowed" }, at(2026, 7, 22, 9, 30), dueFor(new Date(2026, 7, 22, 9, 30).getTime()), { returnedTs: null, returnedDay: null }),
      Object.assign({ id: "L6", student: "Reyes, A. — 22-0387", book: "Moby Dick", author: "Herman Melville", borrowed: "Aug 23", returned: "-", status: "Borrowed" }, at(2026, 7, 23, 10, 15), dueFor(new Date(2026, 7, 23, 10, 15).getTime()), { returnedTs: null, returnedDay: null }),
      Object.assign({ id: "L2", student: "Santos, L. — 20-0951", book: "1984", author: "George Orwell", borrowed: "Aug 18", returned: "Aug 24", status: "Returned" }, at(2026, 7, 18, 9, 0), dueFor(new Date(2026, 7, 18, 9, 0).getTime()), { returnedTs: new Date(2026, 7, 24, 15, 0).getTime(), returnedDay: "2026-08-24" })
    ]
    ,
    users: defaultUsers()
  };
  try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {}
  return d;
}
export function get() {
  const d = seed();
  let fixed = false;
  if (!Array.isArray(d.users)) {
    d.users = inferUsersFromRecords(d, defaultUsers());
    fixed = true;
  }
  for (const u of d.users) {
    if (!u.id) { u.id = newUid(); fixed = true; }
    if (u.ts == null) { u.ts = Date.now(); u.iso = new Date(u.ts).toISOString(); fixed = true; }
    u.first = String(u.first || "").trim();
    u.last = String(u.last || "").trim();
    u.studentId = String(u.studentId || "").trim();
    u.email = String(u.email || "").trim();
    if (u.photo == null) { u.photo = ""; fixed = true; }
    if (!u.passHash) { u.passHash = defaultPassHash(u.studentId); fixed = true; }
  }
  for (const l of d.loans) {
    if (!l.id) { l.id = newId(); fixed = true; }
    if (l.ts == null) { l.ts = Date.now(); l.iso = new Date(l.ts).toISOString(); l.day = dayKey(new Date(l.ts)); fixed = true; }
    if (l.dueTs == null || !l.due || !l.dueDay) {
      const due = dueFor(l.ts);
      l.due = l.due || due.due;
      l.dueTs = l.dueTs != null ? l.dueTs : due.dueTs;
      l.dueDay = l.dueDay || due.dueDay;
      fixed = true;
    }
  }
  for (const v of d.visits) {
    if (!v.id) { v.id = newVid(); fixed = true; }
    if (v.ts == null) { v.ts = Date.now(); v.iso = new Date(v.ts).toISOString(); v.day = dayKey(new Date(v.ts)); v.toutTs = v.toutTs || null; fixed = true; }
    if (v.purpose == null) { v.purpose = ""; fixed = true; }
  }
  if (fixed) { try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {} }
  return d;
}
function save(d) { try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {} }
export function addVisit(name, kind, purpose) {
  const d = get();
  const now = new Date();
  const key = String(name || "").trim().toLowerCase();
  const row = [...d.visits].reverse().find(v => String(v.name || "").trim().toLowerCase() === key && v.tout === "—");
  if (kind === "in") {
    if (row) return { ok: false, reason: "already-in", row };
    const clean = String(name || "").trim();
    d.visits.push({ id: newVid(), name: clean, purpose: String(purpose || ""), tin: dispTime(now), tout: "—", date: dispDate(now), ts: now.getTime(), iso: now.toISOString(), day: dayKey(now), toutTs: null });
    save(d);
    return { ok: true, action: "in" };
  } else if (row) {
    row.tout = dispTime(now);
    row.toutTs = now.getTime();
    save(d);
    const durationMs = row.toutTs - (row.ts != null ? row.ts : row.toutTs);
    return { ok: true, action: "out", durationMs };
  } else {
    return { ok: false, reason: "no-open" };
  }
}
export function addLoan(s, b, a) {
  const d = get();
  const now = new Date();
  const due = dueFor(now.getTime());
  const loan = { id: newId(), student: s, book: b, author: a, borrowed: dispDate(now), returned: "-", status: "Borrowed", ts: now.getTime(), iso: now.toISOString(), day: dayKey(now), returnedTs: null, returnedDay: null, due: due.due, dueTs: due.dueTs, dueDay: due.dueDay };
  d.loans.unshift(loan);
  save(d);
  return loan;
}
export function returnLoanById(id) {
  const d = get();
  const r = d.loans.find(x => x.id === id && x.status === "Borrowed");
  if (r) { const now = new Date(); r.status = "Returned"; r.returned = dispDate(now); r.returnedTs = now.getTime(); r.returnedDay = dayKey(now); }
  save(d);
  return !!r;
}
export function deleteVisitById(id) {
  const d = get();
  const n = d.visits.length;
  d.visits = d.visits.filter(v => v.id !== id);
  if (d.visits.length !== n) save(d);
  return d.visits.length !== n;
}
export function deleteLoanById(id) {
  const d = get();
  const n = d.loans.length;
  d.loans = d.loans.filter(l => l.id !== id);
  if (d.loans.length !== n) save(d);
  return d.loans.length !== n;
}
export function extendLoanById(id, days) {
  const d = get();
  const r = d.loans.find(x => x.id === id && x.status === "Borrowed");
  if (!r) return null;
  const add = (days != null ? days : LOAN_DAYS) * DAY_MS;
  const base = Math.max(r.dueTs || Date.now(), Date.now());
  const due = new Date(base + add);
  r.due = dispDate(due);
  r.dueTs = due.getTime();
  r.dueDay = dayKey(due);
  save(d);
  return r;
}
export function isOverdue(l, nowTs) {
  if (!l || l.status !== "Borrowed" || l.dueTs == null) return false;
  return l.dueTs < (nowTs != null ? nowTs : Date.now());
}
export function getStats(nowTs) {
  const d = get();
  const now = nowTs != null ? new Date(nowTs) : new Date();
  const today = dayKey(now);
  const t = nowTs != null ? nowTs : Date.now();
  const doneToday = d.visits.filter(v => v.day === today && v.toutTs != null && v.ts != null);
  const avgStayMs = doneToday.length
    ? Math.round(doneToday.reduce((a, v) => a + (v.toutTs - v.ts), 0) / doneToday.length)
    : null;
  return {
    todayVisits: d.visits.filter(v => v.day === today).length,
    inside: d.visits.filter(v => v.tout === "—").length,
    active: d.loans.filter(l => l.status === "Borrowed").length,
    overdue: d.loans.filter(l => isOverdue(l, t)).length,
    users: (d.users || []).length,
    avgStayMs,
    avgStay: avgStayMs != null ? fmtDur(avgStayMs) : "—",
    today
  };
}
// ---- Student accounts ----
export function getUsers() {
  return (get().users || []).slice().sort((a, b) => String(a.last).localeCompare(String(b.last)) || String(a.first).localeCompare(String(b.first)));
}
export function findUser(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return null;
  const users = get().users || [];
  let hit = users.find(u => String(u.studentId || "").trim().toLowerCase() === q);
  if (hit) return hit;
  hit = users.find(u => String(u.email || "").trim().toLowerCase() === q);
  if (hit) return hit;
  hit = users.find(u => canonUser(u).toLowerCase() === q);
  if (hit) return hit;
  return null;
}
// Resolve free-text input (ID, email, or "Last, First — ID") to a canonical display name.
// Returns { display, user }. Never blocks walk-ins: unknown names pass through.
export function resolveBorrower(input) {
  const clean = String(input || "").trim();
  if (!clean) return { display: "", user: null };
  const exact = findUser(clean);
  if (exact) return { display: canonUser(exact), user: exact };
  const users = get().users || [];
  const q = clean.toLowerCase();
  const partial = users.find(u =>
    String(u.studentId || "").toLowerCase().includes(q) ||
    canonUser(u).toLowerCase().includes(q) ||
    (String(u.email || "").toLowerCase() && String(u.email || "").toLowerCase().includes(q))
  );
  if (partial) {
    // Only auto-canonicalize when the typed text is clearly an ID fragment or full-name fragment;
    // single common first names stay as typed to avoid surprising the kiosk.
    if (/^\d{2}-?\d{0,4}$/.test(clean) || clean.includes("—") || clean.includes(",") || clean.includes("@") || clean.length >= 6) {
      return { display: canonUser(partial), user: partial };
    }
  }
  return { display: clean, user: partial || null };
}
const NAME_RE = /^[A-Za-zÀ-ÿ'’.\-ñÑ ]{2,60}$/;
const SID_RE = /^\d{2}-\d{4}$/;
export function validateNewUser({ first, last, studentId, email }) {
  first = String(first || "").trim();
  last = String(last || "").trim();
  studentId = String(studentId || "").trim();
  email = String(email || "").trim();
  if (!first || !NAME_RE.test(first)) return { ok: false, field: "first", error: "Enter a valid first name (letters only, min 2)." };
  if (!last || !NAME_RE.test(last)) return { ok: false, field: "last", error: "Enter a valid last name (letters only, min 2)." };
  if (!SID_RE.test(studentId)) return { ok: false, field: "studentId", error: "Student ID must look like 22-0387." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, field: "email", error: "Enter a valid email address." };
  return { ok: true, first, last, studentId, email };
}
export function registerUser({ first, last, studentId, email, photo, password }) {
  const v = validateNewUser({ first, last, studentId, email });
  if (!v.ok) return v;
  if (String(password || "").length < 6) return { ok: false, field: "password", error: "Password must be at least 6 characters." };
  const d = get();
  const sidKey = v.studentId.toLowerCase();
  const emKey = v.email.toLowerCase();
  if ((d.users || []).some(u => String(u.studentId || "").trim().toLowerCase() === sidKey)) {
    return { ok: false, field: "studentId", error: "That Student ID is already registered." };
  }
  if ((d.users || []).some(u => String(u.email || "").trim().toLowerCase() === emKey && emKey)) {
    return { ok: false, field: "email", error: "That email is already registered." };
  }
  const now = Date.now();
  const u = { id: newUid(), first: v.first, last: v.last, studentId: v.studentId, email: v.email, photo: photo || "", passHash: hashPass(v.studentId, password), ts: now, iso: new Date(now).toISOString() };
  d.users.push(u);
  save(d);
  return { ok: true, user: u, display: canonUser(u) };
}
export function deleteUserById(id) {
  const d = get();
  const n = (d.users || []).length;
  d.users = (d.users || []).filter(u => u.id !== id);
  if (d.users.length !== n) save(d);
  return d.users.length !== n;
}
// Bulk import for teachers: rows are {first,last,studentId,email}. Skips bad + duplicate rows.
export function importUsers(rows) {
  const d = get();
  let added = 0, skipped = 0;
  const errs = [];
  const sidSeen = new Set((d.users || []).map(u => String(u.studentId || "").trim().toLowerCase()));
  const emSeen = new Set((d.users || []).map(u => String(u.email || "").trim().toLowerCase()));
  (rows || []).forEach((r, i) => {
    const v = validateNewUser(r);
    if (!v.ok) { skipped++; errs.push("Row " + (i + 1) + ": " + v.error); return; }
    if (sidSeen.has(v.studentId.toLowerCase())) { skipped++; errs.push("Row " + (i + 1) + ": duplicate ID " + v.studentId); return; }
    if (emSeen.has(v.email.toLowerCase())) { skipped++; errs.push("Row " + (i + 1) + ": duplicate email " + v.email); return; }
    const now = Date.now();
    d.users.push({ id: newUid(), first: v.first, last: v.last, studentId: v.studentId, email: v.email, photo: "", ts: now, iso: new Date(now).toISOString(), imported: true });
    sidSeen.add(v.studentId.toLowerCase());
    emSeen.add(v.email.toLowerCase());
    added++;
  });
  if (added) save(d);
  return { added, skipped, errs: errs.slice(0, 8) };
}
export function userActivity(studentId) {
  const d = get();
  const key = String(studentId || "").trim().toLowerCase();
  return {
    visits: d.visits.filter(v => String(v.name || "").toLowerCase().includes(key)).length,
    active: d.loans.filter(l => l.status === "Borrowed" && String(l.student || "").toLowerCase().includes(key)).length,
    total: d.loans.filter(l => String(l.student || "").toLowerCase().includes(key)).length
  };
}
// ---- Full-database backup / restore (move data between devices, survive browser wipes) ----
export function exportDatabase() {
  return { app: "aclc-library", version: 1, exportedAt: new Date().toISOString(), data: get() };
}
export function importDatabase(obj) {
  if (!obj || typeof obj !== "object") return { ok: false, error: "That file is not a library backup." };
  const raw = obj.data && typeof obj.data === "object" ? obj.data : obj;
  if (!Array.isArray(raw.visits) || !Array.isArray(raw.loans) || !Array.isArray(raw.users)) {
    return { ok: false, error: "Backup is invalid — visits, loans, or users are missing." };
  }
  if (raw.visits.length > 5000 || raw.loans.length > 5000 || raw.users.length > 2000) {
    return { ok: false, error: "Backup is too large to import safely." };
  }
  const clean = {
    visits: raw.visits.filter(v => v && typeof v === "object").slice(0, 5000),
    loans: raw.loans.filter(l => l && typeof l === "object").slice(0, 5000),
    users: raw.users.filter(u => u && typeof u === "object").slice(0, 2000)
  };
  try {
    localStorage.setItem(K, JSON.stringify(clean));
  } catch (e) {
    return { ok: false, error: "Not enough storage space for that backup." };
  }
  const n = get(); // normalize + run migrations
  return { ok: true, visits: n.visits.length, loans: n.loans.length, users: (n.users || []).length };
}
// ---- Student login session (separate from staff admin session) ----
const STU_SES = "aclc_student";
export function verifyStudent(login, password) {
  const u = findUser(login);
  if (!u) return { ok: false, error: "Wrong ID/email or password. Try again." };
  if (u.passHash !== hashPass(u.studentId, String(password || ""))) {
    return { ok: false, error: "Wrong ID/email or password. Try again." };
  }
  return { ok: true, user: u };
}
export function setStudentSession(id) {
  try {
    if (id) sessionStorage.setItem(STU_SES, id);
    else sessionStorage.removeItem(STU_SES);
  } catch (e) {}
}
export function getStudentSession() {
  try {
    const id = sessionStorage.getItem(STU_SES);
    if (!id) return null;
    return (get().users || []).find(u => u.id === id) || null;
  } catch (e) { return null; }
}
export function getCreds() {
  try {
    const raw = localStorage.getItem(CK);
    if (raw) { const c = JSON.parse(raw); if (c.email && c.pass && c.code) return c; }
  } catch (e) {}
  return { email: "admin@aclc.edu.ph", pass: "admin123", code: "1234" };
}
export function setCode(code) {
  const c = getCreds();
  c.code = code;
  try { localStorage.setItem(CK, JSON.stringify(c)); } catch (e) {}
}
export function isAuthed() {
  try { return sessionStorage.getItem(SES_KEY) === "1"; } catch (e) { return false; }
}
export function setAuthed(v) {
  try {
    if (v) sessionStorage.setItem(SES_KEY, "1");
    else sessionStorage.removeItem(SES_KEY);
    sessionStorage.removeItem(STEP_KEY);
  } catch (e) {}
}
export function setStep(v) {
  try {
    if (v) sessionStorage.setItem(STEP_KEY, "1");
    else sessionStorage.removeItem(STEP_KEY);
  } catch (e) {}
}
export function hasStep() {
  try { return sessionStorage.getItem(STEP_KEY) === "1"; } catch (e) { return false; }
}
