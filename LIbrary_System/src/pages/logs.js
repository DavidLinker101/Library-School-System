import { get, setAuthed } from "../js/store.js";
export function render(el, initialTab) {
  let tab = initialTab === "bor" ? "bor" : "att", filter = "All", q = "", dt = "";
  el.innerHTML =
    '<header class="topbar logs"><b>ACLC Library — visit logs</b><span><button class="logout" id="out">Log out</button> <button class="export" id="exp">Export</button></span></header>' +
    '<div class="page"><div class="tabs"><button class="tab" id="tA">Library Attendance</button><button class="tab" id="tB">Book Borrowing and Returning</button></div><div id="body"></div></div>' +
    '<div class="corner"><button class="pill-btn" id="mfa">Change MFA?</button></div>';
  const body = el.querySelector("#body");
  el.querySelector("#exp").onclick = () => {
    const d = get();
    const rows = tab === "att" ? d.visits : d.loans;
    const csv = rows.map(r => Object.values(r).map(v => '"' + String(v).replace(/"/g, '""') + '"').join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "aclc-logs.csv";
    a.click();
  };
  el.querySelector("#mfa").onclick = () => { location.hash = "#/mfa"; };
  el.querySelector("#out").onclick = () => { setAuthed(false); location.hash = "#/"; };
  function esc(s) { return String(s).replace(/</g, "&lt;"); }
  function paint() {
    el.querySelector("#tA").classList.toggle("on", tab === "att");
    el.querySelector("#tB").classList.toggle("on", tab !== "att");
    const d = get();
    if (tab === "att") {
      const rows = d.visits.filter(v => (!q || v.name.toLowerCase().includes(q.toLowerCase())) && (!dt || v.day === dt));
      body.innerHTML =
        '<div class="log-filters"><input class="search" id="q" placeholder="" value="' + esc(q) + '"><input type="date" class="input grow" id="dt" value="' + esc(dt) + '"></div>' +
        '<div class="table-scroll"><table class="logs"><tr><th>Name/ID</th><th>Time in</th><th>Time out</th><th>Date</th></tr>' +
        rows.map(v => "<tr><td>" + esc(v.name) + "</td><td>" + esc(v.tin) + "</td><td>" + esc(v.tout) + "</td><td>" + esc(v.date) + "</td></tr>").join("") + "</table></div>";
      body.querySelector("#q").onchange = e => { q = e.target.value; paint(); };
      body.querySelector("#dt").onchange = e => { dt = e.target.value; paint(); };
    } else {
      const rows = d.loans.filter(r =>
        (filter === "All" || (filter === "Returned" ? r.status === "Returned" : r.status === "Borrowed")) &&
        (!q || (r.student + r.book + r.author).toLowerCase().includes(q.toLowerCase()))
      );
      body.innerHTML =
        '<div class="log-filters"><input class="search" id="q" value="' + esc(q) + '"><select class="input grow" id="f">' +
        "<option" + (filter === "All" ? " selected" : "") + ">All</option>" +
        "<option" + (filter === "Currently borrowed" ? " selected" : "") + ">Currently borrowed</option>" +
        "<option" + (filter === "Returned" ? " selected" : "") + ">Returned</option></select></div>" +
        '<div class="table-scroll"><table class="logs"><tr><th>Student</th><th>Book / Author</th><th>Borrowed</th><th>Returned</th><th>Status</th></tr>' +
        rows.map(r => "<tr><td>" + esc(r.student) + "</td><td>" + esc(r.book) + ",<br>" + esc(r.author) + "</td><td>" + esc(r.borrowed) + "</td><td>" + esc(r.returned) + "</td><td><span class='badge " + (r.status === "Borrowed" ? "borrowed" : "returned") + "'>" + r.status + "</span></td></tr>").join("") + "</table></div>";
      body.querySelector("#f").onchange = e => { filter = e.target.value; paint(); };
      body.querySelector("#q").onchange = e => { q = e.target.value; paint(); };
    }
  }
  el.querySelector("#tA").onclick = () => { tab = "att"; paint(); };
  el.querySelector("#tB").onclick = () => { tab = "bor"; paint(); };
  paint();
}
