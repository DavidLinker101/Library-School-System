import { get, findUser, canonUser, fmtDur, isOverdue, getStudentSession, setStudentSession } from "../js/store.js";

function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }

function recordsFor(u) {
  const sid = String(u.studentId || "").toLowerCase();
  const canon = canonUser(u).toLowerCase();
  const d = get();
  const match = n => {
    const t = String(n || "").toLowerCase();
    return (sid && t.includes(sid)) || t === canon;
  };
  return {
    visits: d.visits.filter(v => match(v.name)),
    loans: d.loans.filter(l => match(l.student))
  };
}

function statusBadge(r) {
  if (r.status === "Borrowed" && isOverdue(r)) return "<span class='badge overdue'>Overdue</span>";
  if (r.status === "Borrowed") return "<span class='badge borrowed'>Borrowed</span>";
  return "<span class='badge returned'>Returned</span>";
}

function lookupHTML(err) {
  return (
    '<div class="field"><label for="pfId">Student ID or email</label>' +
    '<input id="pfId" class="input" placeholder="e.g. 22-0387" autocomplete="off"></div>' +
    (err ? '<p class="form-err" id="err">' + esc(err) + '</p>' : '<p class="form-err" id="err" hidden></p>') +
    '<div class="btnrow"><button type="button" class="btn gray" id="pfBack">Back</button>' +
    '<button type="button" class="btn navy" id="pfGo">View profile</button></div>'
  );
}

export function render(el, param) {
  const id = decodeURIComponent(String(param || "").replace(/^\//, "").trim());
  el.innerHTML =
    '<header class="topbar"><div class="brand clickable" id="brand" title="Back to library home"><img src="src/assets/logo.png" alt="ACLC"><b>ACLC LIBRARY</b></div><button type="button" class="home-link" id="homeBtn">Home</button></header>' +
    '<div class="page"><div class="logs-top"><button type="button" class="back-link" id="kiosk">← Kiosk view</button></div><div id="pfBody"></div></div>';
  el.querySelector("#brand").onclick = () => { location.hash = "#/"; };
  el.querySelector("#homeBtn").onclick = () => { location.hash = "#/"; };
  el.querySelector("#kiosk").onclick = () => { location.hash = "#/"; };
  const body = el.querySelector("#pfBody");

  function wireLookup(err) {
    body.innerHTML =
      '<div class="center"><h1 class="title">Student profile</h1>' +
      '<p class="sub">View-only record — borrowing history and visit logs</p></div>' +
      lookupHTML(err);
    const inp = body.querySelector("#pfId");
    body.querySelector("#pfBack").onclick = () => { location.hash = "#/"; };
    function go() {
      const v = inp.value.trim();
      if (!v) {
        const e = body.querySelector("#err");
        e.textContent = "Enter a Student ID or email first.";
        e.hidden = false;
        inp.focus();
        return;
      }
      location.hash = "#/profile/" + encodeURIComponent(v);
    }
    body.querySelector("#pfGo").onclick = go;
    inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); go(); } };
    inp.focus();
  }

  if (!id) { wireLookup(""); return; }
  const u = findUser(id);
  if (!u) { wireLookup('No account found for "' + id + '". Check the ID or register first.'); return; }

  const rec = recordsFor(u);
  const done = rec.visits.filter(v => v.toutTs != null && v.ts != null);
  const hoursMs = done.reduce((a, v) => a + (v.toutTs - v.ts), 0);
  const active = rec.loans.filter(l => l.status === "Borrowed").length;
  const returned = rec.loans.filter(l => l.status === "Returned").length;
  const since = u.ts ? new Date(u.ts).toLocaleDateString([], { month: "short", year: "numeric" }) : "—";
  const photo = u.photo
    ? '<img src="' + u.photo + '" alt="">'
    : '<span class="recog-initial">' + esc((u.first || "?")[0]) + '</span>';

  const loansRows = rec.loans.length
    ? rec.loans.map(r =>
        "<tr><td>" + esc(r.book) + ",<br>" + esc(r.author) + "</td><td>" + esc(r.borrowed) + "</td><td>" + esc(r.due || "—") + "</td><td>" + esc(r.returned) + "</td><td>" + statusBadge(r) + "</td></tr>"
      ).join("")
    : '<tr><td colspan="5" class="empty-row">No borrowing history yet.</td></tr>';
  const visitRows = rec.visits.length
    ? rec.visits.slice().reverse().map(v => {
        const stay = v.toutTs != null && v.ts != null ? fmtDur(v.toutTs - v.ts) : "—";
        return "<tr><td>" + esc(v.date) + "</td><td>" + esc(v.purpose || "—") + "</td><td>" + esc(v.tin) + "</td><td>" + esc(v.tout) + "</td><td>" + esc(stay) + "</td></tr>";
      }).join("")
    : '<tr><td colspan="5" class="empty-row">No visits logged yet.</td></tr>';

  body.innerHTML =
    '<div class="pf-head"><div class="recog-photo pf-avatar">' + photo + '</div>' +
    '<div><h1 class="title" style="margin:0">' + esc(u.last + ", " + u.first) + '</h1>' +
    '<p class="sub" style="margin:4px 0 0">' + esc(u.studentId) + (u.email ? " · " + esc(u.email) : "") + ' · Member since ' + esc(since) + '</p></div></div>' +
    '<div class="stats stats-4">' +
    '<div class="stat"><b>' + rec.visits.length + '</b><span>Visits</span></div>' +
    '<div class="stat"><b>' + esc(done.length ? fmtDur(Math.round(hoursMs / done.length)) + " avg" : "—") + '</b><span>Avg. stay</span></div>' +
    '<div class="stat"><b>' + active + '</b><span>Books out</span></div>' +
    '<div class="stat"><b>' + returned + '</b><span>Returned</span></div>' +
    '</div>' +
    '<h2 class="pf-sec">Borrowing history</h2>' +
    '<div class="table-scroll"><table class="logs"><tr><th>Book / Author</th><th>Borrowed</th><th>Due</th><th>Returned</th><th>Status</th></tr>' + loansRows + '</table></div>' +
    '<h2 class="pf-sec">Visit history</h2>' +
    '<div class="table-scroll"><table class="logs"><tr><th>Date</th><th>Purpose</th><th>Time in</th><th>Time out</th><th>Stay</th></tr>' + visitRows + '</table></div>' +
    '<p class="hint">Read-only record — ask library staff to correct any errors.</p>';
  const ses = getStudentSession();
  if (ses && ses.id === u.id) {
    const top = el.querySelector(".logs-top");
    top.style.display = "flex";
    top.style.justifyContent = "space-between";
    top.style.alignItems = "center";
    const out = document.createElement("button");
    out.type = "button";
    out.id = "stuOut";
    out.className = "mini-btn";
    out.textContent = "Log out (" + u.first + ")";
    out.onclick = () => { setStudentSession(null); location.hash = "#/"; };
    top.appendChild(out);
  }
}
