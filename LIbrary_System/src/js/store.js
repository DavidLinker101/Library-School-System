const K = "aclc_lib_demo_v3";
const CK = "aclc_admin_creds";
export const SES_KEY = "aclc_admin";
export const STEP_KEY = "aclc_admin_step";
function dayKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function dispTime(d) { return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
function dispDate(d) { return d.toLocaleDateString([], { month: "short", day: "numeric" }); }
function newId() { return "L" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
function at(y, mo, d, h, mi) { const x = new Date(y, mo, d, h, mi); return { ts: x.getTime(), iso: x.toISOString(), day: dayKey(x) }; }
export function seed() {
  try {
    const raw = localStorage.getItem(K);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const d = {
    visits: [
      Object.assign({ name: "Mendoza, J. — 21-0142", tin: "9:04 AM", tout: "10:15 AM", date: "Aug 11" }, at(2026, 7, 11, 9, 4), { toutTs: new Date(2026, 7, 11, 10, 15).getTime() }),
      Object.assign({ name: "Reyes, A. — 22-0387", tin: "9:20 AM", tout: "—", date: "Aug 11" }, at(2026, 7, 11, 9, 20), { toutTs: null }),
      Object.assign({ name: "Santos, L. — 20-0951", tin: "9:31 AM", tout: "11:02 AM", date: "Aug 11" }, at(2026, 7, 11, 9, 31), { toutTs: new Date(2026, 7, 11, 11, 2).getTime() })
    ],
    loans: [
      Object.assign({ id: "L1", student: "Reyes, A. — 22-0387", book: "The Great Gatsby", author: "F.S. Fitzgerald", borrowed: "Aug 20", returned: "-", status: "Borrowed" }, at(2026, 7, 20, 9, 0), { returnedTs: null, returnedDay: null }),
      Object.assign({ id: "L3", student: "Reyes, A. — 22-0387", book: "To Kill a Mockingbird", author: "Harper Lee", borrowed: "Aug 21", returned: "-", status: "Borrowed" }, at(2026, 7, 21, 10, 0), { returnedTs: null, returnedDay: null }),
      Object.assign({ id: "L4", student: "Reyes, A. — 22-0387", book: "1984", author: "George Orwell", borrowed: "Aug 21", returned: "-", status: "Borrowed" }, at(2026, 7, 21, 11, 0), { returnedTs: null, returnedDay: null }),
      Object.assign({ id: "L5", student: "Reyes, A. — 22-0387", book: "Pride and Prejudice", author: "Jane Austen", borrowed: "Aug 22", returned: "-", status: "Borrowed" }, at(2026, 7, 22, 9, 30), { returnedTs: null, returnedDay: null }),
      Object.assign({ id: "L6", student: "Reyes, A. — 22-0387", book: "Moby Dick", author: "Herman Melville", borrowed: "Aug 23", returned: "-", status: "Borrowed" }, at(2026, 7, 23, 10, 15), { returnedTs: null, returnedDay: null }),
      Object.assign({ id: "L2", student: "Santos, L. — 20-0951", book: "1984", author: "George Orwell", borrowed: "Aug 18", returned: "Aug 24", status: "Returned" }, at(2026, 7, 18, 9, 0), { returnedTs: new Date(2026, 7, 24, 15, 0).getTime(), returnedDay: "2026-08-24" })
    ]
  };
  try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {}
  return d;
}
export function get() {
  const d = seed();
  let fixed = false;
  for (const l of d.loans) {
    if (!l.id) { l.id = newId(); fixed = true; }
    if (l.ts == null) { l.ts = Date.now(); l.iso = new Date(l.ts).toISOString(); l.day = dayKey(new Date(l.ts)); fixed = true; }
  }
  for (const v of d.visits) {
    if (v.ts == null) { v.ts = Date.now(); v.iso = new Date(v.ts).toISOString(); v.day = dayKey(new Date(v.ts)); v.toutTs = v.toutTs || null; fixed = true; }
  }
  if (fixed) { try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {} }
  return d;
}
function save(d) { try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {} }
export function addVisit(name, kind) {
  const d = get();
  const now = new Date();
  const row = [...d.visits].reverse().find(v => v.name === name && v.tout === "—");
  if (kind === "in") {
    d.visits.push({ name, tin: dispTime(now), tout: "—", date: dispDate(now), ts: now.getTime(), iso: now.toISOString(), day: dayKey(now), toutTs: null });
  } else if (row) {
    row.tout = dispTime(now);
    row.toutTs = now.getTime();
  } else {
    d.visits.push({ name, tin: "—", tout: dispTime(now), date: dispDate(now), ts: now.getTime(), iso: now.toISOString(), day: dayKey(now), toutTs: now.getTime() });
  }
  save(d);
}
export function addLoan(s, b, a) {
  const d = get();
  const now = new Date();
  d.loans.unshift({ id: newId(), student: s, book: b, author: a, borrowed: dispDate(now), returned: "-", status: "Borrowed", ts: now.getTime(), iso: now.toISOString(), day: dayKey(now), returnedTs: null, returnedDay: null });
  save(d);
}
export function returnLoanById(id) {
  const d = get();
  const r = d.loans.find(x => x.id === id && x.status === "Borrowed");
  if (r) { const now = new Date(); r.status = "Returned"; r.returned = dispDate(now); r.returnedTs = now.getTime(); r.returnedDay = dayKey(now); }
  save(d);
}
export function returnLoan(s, b) {
  const d = get();
  const r = d.loans.find(x => x.book === b && x.status === "Borrowed" && (!s || x.student.includes(s)));
  if (r) { const now = new Date(); r.status = "Returned"; r.returned = dispDate(now); r.returnedTs = now.getTime(); r.returnedDay = dayKey(now); }
  save(d);
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
