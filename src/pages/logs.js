import { get, setAuthed, isOverdue, getStats, returnLoanById, deleteVisitById, deleteLoanById, extendLoanById, getUsers, deleteUserById, importUsers, userActivity, canonUser, PURPOSES, fmtDur, exportDatabase, importDatabase } from "../js/store.js";
export function render(el) {
  let tab = "att", filter = "All", q = "", dt = "", pur = "All";
  let currentRows = [], currentKind = "att";
  el.innerHTML =
    '<header class="topbar logs"><b>ACLC Library — visit logs</b><span><button type="button" class="logout" id="out">Log out</button> <button type="button" class="export" id="backup">Backup</button> <button type="button" class="export" id="exp">Export</button></span></header>' +
    '<div class="page"><div class="logs-top" style="display:flex;justify-content:space-between;align-items:center"><button type="button" class="back-link" id="kiosk">← Kiosk view</button><span><button type="button" class="mini-btn" id="restore">Restore backup</button><input type="file" id="restoreFile" accept=".json,application/json" hidden></span></div><div id="stats"></div><div class="tabs"><button type="button" class="tab" id="tA">Library Attendance</button><button type="button" class="tab" id="tB">Book Borrowing and Returning</button><button type="button" class="tab" id="tU">Students</button></div><div id="body"></div><div class="exp-toast" id="toast" hidden></div></div>' +
    '<div class="corner"><button type="button" class="pill-btn" id="mfa">Change code</button></div>';
  const body = el.querySelector("#body");
  const statsEl = el.querySelector("#stats");
  const toast = el.querySelector("#toast");
  function showToast(text) {
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { if (toast.isConnected) toast.hidden = true; }, 3500);
  }
  function csvCell(v) {
    return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  }
  function downloadCSV(filename, headers, rows) {
    const lines = [headers.map(csvCell).join(",")].concat(rows.map(r => r.map(csvCell).join(",")));
    const csv = "﻿" + lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  el.querySelector("#exp").onclick = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    if (!currentRows.length) { showToast("Nothing to export — no rows match the current filters."); return; }
    if (currentKind === "att") {
      downloadCSV("aclc-attendance-" + stamp + ".csv",
        ["Name/ID", "Purpose", "Time In", "Time Out", "Stay", "Date", "Day (YYYY-MM-DD)", "Timestamp ISO"],
        currentRows.map(v => [v.name, v.purpose || "", v.tin, v.tout, v.toutTs != null && v.ts != null ? fmtDur(v.toutTs - v.ts) : "", v.date, v.day || "", v.iso || ""]));
      showToast("Exported " + currentRows.length + " attendance row" + (currentRows.length === 1 ? "" : "s") + ".");
    } else if (currentKind === "users") {
      downloadCSV("aclc-students-" + stamp + ".csv",
        ["First", "Last", "StudentID", "Email", "Registered ISO"],
        currentRows.map(u => [u.first, u.last, u.studentId, u.email || "", u.iso || ""]));
      showToast("Exported " + currentRows.length + " student" + (currentRows.length === 1 ? "" : "s") + ".");
    } else {
      downloadCSV("aclc-borrowing-" + stamp + ".csv",
        ["ID", "Student", "Book", "Author", "Borrowed", "Due", "Returned", "Status", "Borrow Day", "Borrow ISO", "Return Day"],
        currentRows.map(r => {
          const st = r.status === "Borrowed" && isOverdue(r) ? "Overdue" : r.status;
          return [r.id, r.student, r.book, r.author, r.borrowed, r.due || "", r.returned, st, r.day || "", r.iso || "", r.returnedDay || ""];
        }));
      showToast("Exported " + currentRows.length + " borrowing row" + (currentRows.length === 1 ? "" : "s") + ".");
    }
  };
  function downloadJSON(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  el.querySelector("#backup").onclick = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const full = exportDatabase();
    downloadJSON("aclc-library-backup-" + stamp + ".json", full);
    const n = full.data;
    showToast("Backup downloaded: " + n.visits.length + " visits, " + n.loans.length + " loans, " + (n.users || []).length + " students.");
  };
  const restoreFile = el.querySelector("#restoreFile");
  el.querySelector("#restore").onclick = () => restoreFile.click();
  restoreFile.onchange = () => {
    const f = restoreFile.files && restoreFile.files[0];
    if (!f) return;
    if (!window.confirm("Replace ALL current data with this backup? This cannot be undone.")) { restoreFile.value = ""; return; }
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const r = importDatabase(JSON.parse(rd.result));
        if (!r.ok) { showToast(r.error); return; }
        paint(false);
        showToast("Restored: " + r.visits + " visits, " + r.loans + " loans, " + r.users + " students.");
      } catch (e) {
        showToast("That file is not a valid backup.");
      }
      restoreFile.value = "";
    };
    rd.onerror = () => { showToast("Could not read that file."); restoreFile.value = ""; };
    rd.readAsText(f);
  };
  el.querySelector("#kiosk").onclick = () => { location.hash = "#/"; };
  el.querySelector("#mfa").onclick = () => { location.hash = "#/mfa"; };
  el.querySelector("#out").onclick = () => { setAuthed(false); location.hash = "#/"; };
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  function paintStats() {
    const s = getStats();
    statsEl.innerHTML =
      '<div class="stats stats-6">' +
      '<div class="stat"><b>' + s.todayVisits + '</b><span>Visits today</span></div>' +
      '<div class="stat"><b>' + s.inside + '</b><span>Currently inside</span></div>' +
      '<div class="stat"><b>' + s.active + '</b><span>Active borrows</span></div>' +
      '<div class="stat' + (s.overdue ? " warn" : "") + '"><b>' + s.overdue + '</b><span>Overdue</span></div>' +
      '<div class="stat"><b>' + (s.users || 0) + '</b><span>Registered</span></div>' +
      '<div class="stat"><b>' + esc(s.avgStay || "—") + '</b><span>Avg. stay today</span></div>' +
      "</div>";
  }
  function statusBadge(r) {
    if (r.status === "Borrowed" && isOverdue(r)) return "<span class='badge overdue'>Overdue</span>";
    if (r.status === "Borrowed") return "<span class='badge borrowed'>Borrowed</span>";
    return "<span class='badge returned'>Returned</span>";
  }
  function clearFilters() { q = ""; dt = ""; filter = "All"; pur = "All"; paint(false); }
  function parseImportCSV(text) {
    const lines = String(text || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return [];
    function splitRow(line) {
      const out = [];
      let cur = "", inQ = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
          else inQ = !inQ;
        } else if (c === "," && !inQ) { out.push(cur.trim()); cur = ""; }
        else cur += c;
      }
      out.push(cur.trim());
      return out.map(v => v.replace(/^"|"$/g, "").trim());
    }
    const head = splitRow(lines[0]).map(h => h.toLowerCase().replace(/[\s_]+/g, ""));
    const idx = n => head.indexOf(n);
    // accept header aliases
    const fi = idx("first") >= 0 ? idx("first") : idx("firstname");
    let li = idx("last") >= 0 ? idx("last") : idx("lastname");
    let si = idx("studentid") >= 0 ? idx("studentid") : (idx("student") >= 0 ? idx("student") : idx("id"));
    let ei = idx("email") >= 0 ? idx("email") : idx("e-mail");
    let start = 0;
    if (fi < 0 || si < 0) {
      // no header row — assume first,last,studentId,email order
      start = 0;
      return lines.map(l => {
        const c = splitRow(l);
        return { first: c[0] || "", last: c[1] || "", studentId: c[2] || "", email: c[3] || "" };
      });
    }
    start = 1;
    if (li < 0) li = 1;
    if (ei < 0) ei = 3;
    return lines.slice(start).map(l => {
      const c = splitRow(l);
      return { first: c[fi] || "", last: c[li] || "", studentId: c[si] || "", email: c[ei] || "" };
    });
  }
  function paint(focusQ) {
    el.querySelector("#tA").classList.toggle("on", tab === "att");
    el.querySelector("#tB").classList.toggle("on", tab === "bor");
    el.querySelector("#tU").classList.toggle("on", tab === "users");
    paintStats();
    const d = get();
    if (tab === "att") {
      const rows = d.visits.filter(v => (!q || v.name.toLowerCase().includes(q.toLowerCase())) && (!dt || v.day === dt) && (pur === "All" || (v.purpose || "") === pur));
      currentRows = rows;
      currentKind = "att";
      const countLine = "Showing " + rows.length + " of " + d.visits.length + (dt ? " · " + esc(dt) : "") + (pur !== "All" ? " · " + esc(pur) : "");
      const purOpts = ["All"].concat(PURPOSES).map(p => "<option" + (pur === p ? " selected" : "") + ">" + esc(p) + "</option>").join("");
      body.innerHTML =
        '<div class="log-filters"><input class="search" id="q" placeholder="Search name or ID…" value="' + esc(q) + '" autocomplete="off"><button type="button" class="clear-btn" id="clear">Clear</button></div>' +
        '<div class="log-filters"><input type="date" class="input grow" id="dt" value="' + esc(dt) + '" aria-label="Filter by date"><select class="input grow" id="pur" aria-label="Filter by purpose">' + purOpts + '</select></div>' +
        '<p class="count-line">' + countLine + (q ? ' · “' + esc(q) + '”' : "") + "</p>" +
        '<div class="table-scroll"><table class="logs"><tr><th>Name/ID</th><th>Purpose</th><th>Time in</th><th>Time out</th><th>Stay</th><th>Date</th><th>Action</th></tr>' +
        (rows.length
          ? rows.map(v => {
              const stay = v.toutTs != null && v.ts != null ? fmtDur(v.toutTs - v.ts) : "—";
              return "<tr><td>" + esc(v.name) + "</td><td>" + esc(v.purpose || "—") + "</td><td>" + esc(v.tin) + "</td><td>" + esc(v.tout) + '</td><td><span style="white-space:nowrap">' + esc(stay) + "</span></td><td>" + esc(v.date) + "</td>" + '<td><div class="row-actions"><button type="button" class="mini-btn danger" data-del-visit="' + esc(v.id) + '">Delete</button></div></td></tr>';
            }).join("")
          : '<tr><td colspan="7" class="empty-row">No records found. Try clearing the search or date.</td></tr>') +
        "</table></div>";
      const qIn = body.querySelector("#q");
      qIn.oninput = e => {
        q = e.target.value;
        const pos = e.target.selectionStart;
        paint(true);
        const nq = body.querySelector("#q");
        nq.focus();
        try { nq.setSelectionRange(pos, pos); } catch (err) {}
      };
      body.querySelector("#dt").onchange = e => { dt = e.target.value; paint(false); };
      body.querySelector("#pur").onchange = e => { pur = e.target.value; paint(false); };
      body.querySelector("#clear").onclick = clearFilters;
      body.querySelectorAll("[data-del-visit]").forEach(btn => {
        btn.onclick = () => {
          if (!window.confirm("Delete this visit record? This cannot be undone.")) return;
          deleteVisitById(btn.getAttribute("data-del-visit"));
          paint(false);
          showToast("Visit record deleted.");
        };
      });
    } else if (tab === "users") {
      const all = getUsers();
      const rows = all.filter(u => !q || (u.first + " " + u.last + " " + u.studentId + " " + (u.email || "")).toLowerCase().includes(q.toLowerCase()));
      currentRows = rows;
      currentKind = "users";
      body.innerHTML =
        '<div class="log-filters"><input class="search" id="q" placeholder="Search students, IDs, emails…" value="' + esc(q) + '" autocomplete="off"><button type="button" class="clear-btn" id="clear">Clear</button></div>' +
        '<div class="log-filters"><button type="button" class="mini-btn navy" id="impBtn" style="padding:10px 14px">Import CSV</button><button type="button" class="mini-btn" id="tplBtn" style="padding:10px 14px">Template</button><a href="#/register" class="mini-btn" style="padding:10px 14px;text-decoration:none;text-align:center">+ New account</a><input type="file" id="impFile" accept=".csv,text/csv" hidden></div>' +
        '<p class="count-line">Showing ' + rows.length + " of " + all.length + " registered" + (q ? ' · “' + esc(q) + "”" : "") + ' · Tip: Import CSV handles the whole class at once — no need to type every account.</p>' +
        '<div class="table-scroll"><table class="logs"><tr><th>Photo</th><th>Name</th><th>ID / Email</th><th>Visits</th><th>Active</th><th>Action</th></tr>' +
        (rows.length
          ? rows.map(u => {
              let act = { visits: 0, active: 0, total: 0 };
              try { act = userActivity(u.studentId); } catch (e) {}
              const photo = u.photo ? '<img src="' + u.photo + '" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover">' : '<span style="display:inline-flex;width:40px;height:40px;border-radius:50%;background:#e6e9f0;align-items:center;justify-content:center;color:#8a93a6;font-weight:800">' + esc((u.first || "?")[0]) + "</span>";
              return "<tr><td>" + photo + "</td><td>" + esc(u.last + ", " + u.first) + "</td><td>" + esc(u.studentId) + "<br><small style='color:#666'>" + esc(u.email || "—") + "</small></td><td>" + act.visits + "</td><td>" + act.active + "</td><td>" + '<div class="row-actions"><a class="mini-btn" style="text-decoration:none;text-align:center" href="#/profile/' + esc(u.studentId) + '">View</a><button type="button" class="mini-btn danger" data-del-user="' + esc(u.id) + '">Delete</button></div></td></tr>';
            }).join("")
          : '<tr><td colspan="6" class="empty-row">No students yet. Click + New account or Import CSV.</td></tr>') +
        "</table></div>";
      const qIn = body.querySelector("#q");
      qIn.oninput = e => {
        q = e.target.value;
        const pos = e.target.selectionStart;
        paint(true);
        const nq = body.querySelector("#q");
        nq.focus();
        try { nq.setSelectionRange(pos, pos); } catch (err) {}
      };
      body.querySelector("#clear").onclick = clearFilters;
      body.querySelector("#tplBtn").onclick = () => {
        downloadText("aclc-student-import-template.csv", "first,last,studentId,email\nJuan,Dela Cruz,22-0387,juan.delacruz@aclc.edu.ph\nMaria,Santos,20-0951,maria.santos@aclc.edu.ph\n");
        showToast("Template downloaded. Fill it and Import CSV.");
      };
      const impFile = body.querySelector("#impFile");
      body.querySelector("#impBtn").onclick = () => impFile.click();
      impFile.onchange = () => {
        const f = impFile.files && impFile.files[0];
        if (!f) return;
        const rd = new FileReader();
        rd.onload = () => {
          try {
            const rowsIn = parseImportCSV(rd.result);
            if (!rowsIn.length) { showToast("CSV is empty."); return; }
            const r = importUsers(rowsIn);
            paint(false);
            if (r.added && !r.skipped) showToast("Imported " + r.added + " student" + (r.added === 1 ? "" : "s") + ".");
            else if (r.added) showToast("Imported " + r.added + ", skipped " + r.skipped + (r.errs[0] ? " — " + r.errs[0] : "") + ".");
            else showToast("Nothing imported" + (r.errs[0] ? " — " + r.errs[0] : ". Check the template.") + ".");
          } catch (e) { showToast("Could not read that CSV."); }
          impFile.value = "";
        };
        rd.readAsText(f);
      };
      body.querySelectorAll("[data-del-user]").forEach(btn => {
        btn.onclick = () => {
          const u = (getUsers().find(x => x.id === btn.getAttribute("data-del-user")));
          const label = u ? canonUser(u) : "this student";
          if (!window.confirm("Remove " + label + "? Their visits/loans stay, but the account is deleted.")) return;
          deleteUserById(btn.getAttribute("data-del-user"));
          paint(false);
          showToast("Student account removed.");
        };
      });
    } else {
      const rows = d.loans.filter(r => {
        const matchF = filter === "All" ? true
          : filter === "Returned" ? r.status === "Returned"
          : filter === "Overdue" ? (r.status === "Borrowed" && isOverdue(r))
          : r.status === "Borrowed";
        return matchF && (!q || (r.student + " " + r.book + " " + r.author).toLowerCase().includes(q.toLowerCase()));
      });
      currentRows = rows;
      currentKind = "bor";
      body.innerHTML =
        '<div class="log-filters"><input class="search" id="q" placeholder="Search student, book…" value="' + esc(q) + '" autocomplete="off"><button type="button" class="clear-btn" id="clear">Clear</button></div>' +
        '<div class="log-filters"><select class="input grow" id="f" aria-label="Filter by status">' +
        "<option" + (filter === "All" ? " selected" : "") + ">All</option>" +
        "<option" + (filter === "Currently borrowed" ? " selected" : "") + ">Currently borrowed</option>" +
        "<option" + (filter === "Overdue" ? " selected" : "") + ">Overdue</option>" +
        "<option" + (filter === "Returned" ? " selected" : "") + ">Returned</option></select></div>" +
        '<p class="count-line">Showing ' + rows.length + " of " + d.loans.length + " · " + esc(filter) + (q ? ' · “' + esc(q) + "”" : "") + "</p>" +
        '<div class="table-scroll"><table class="logs"><tr><th>Student</th><th>Book / Author</th><th>Borrowed</th><th>Due</th><th>Returned</th><th>Status</th><th>Action</th></tr>' +
        (rows.length
          ? rows.map(r => {
              let acts;
              if (r.status === "Borrowed") {
                acts = '<div class="row-actions"><button type="button" class="mini-btn navy" data-ret="' + esc(r.id) + '">Return</button><button type="button" class="mini-btn" data-ext="' + esc(r.id) + '">+7 days</button><button type="button" class="mini-btn danger" data-del-loan="' + esc(r.id) + '">Delete</button></div>';
              } else {
                acts = '<div class="row-actions"><button type="button" class="mini-btn danger" data-del-loan="' + esc(r.id) + '">Delete</button></div>';
              }
              return "<tr><td>" + esc(r.student) + "</td><td>" + esc(r.book) + ",<br>" + esc(r.author) + "</td><td>" + esc(r.borrowed) + "</td><td>" + esc(r.due || "—") + "</td><td>" + esc(r.returned) + "</td><td>" + statusBadge(r) + "</td><td>" + acts + "</td></tr>";
            }).join("")
          : '<tr><td colspan="7" class="empty-row">No records found. Try a different search or filter.</td></tr>') +
        "</table></div>";
      const qIn = body.querySelector("#q");
      qIn.oninput = e => {
        q = e.target.value;
        const pos = e.target.selectionStart;
        paint(true);
        const nq = body.querySelector("#q");
        nq.focus();
        try { nq.setSelectionRange(pos, pos); } catch (err) {}
      };
      body.querySelector("#f").onchange = e => { filter = e.target.value; paint(false); };
      body.querySelector("#clear").onclick = clearFilters;
      body.querySelectorAll("[data-ret]").forEach(btn => {
        btn.onclick = () => {
          returnLoanById(btn.getAttribute("data-ret"));
          paint(false);
          showToast("Book marked as returned.");
        };
      });
      body.querySelectorAll("[data-ext]").forEach(btn => {
        btn.onclick = () => {
          const r = extendLoanById(btn.getAttribute("data-ext"), 7);
          paint(false);
          showToast(r ? "Due extended to " + r.due + "." : "Could not extend.");
        };
      });
      body.querySelectorAll("[data-del-loan]").forEach(btn => {
        btn.onclick = () => {
          if (!window.confirm("Delete this loan record? This cannot be undone.")) return;
          deleteLoanById(btn.getAttribute("data-del-loan"));
          paint(false);
          showToast("Loan record deleted.");
        };
      });
    }
  }
  el.querySelector("#tA").onclick = () => { tab = "att"; paint(false); };
  el.querySelector("#tB").onclick = () => { tab = "bor"; paint(false); };
  el.querySelector("#tU").onclick = () => { tab = "users"; paint(false); };
  paint(false);
}
