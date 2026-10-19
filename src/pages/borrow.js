import { get, addLoan, returnLoanById, isOverdue, getUsers, canonUser, resolveBorrower } from "../js/store.js";
export function render(el, tab) {
  let mode = tab === "return" ? "return" : "borrow";
  el.innerHTML =
    '<header class="topbar"><div class="brand clickable" id="brand" title="Back to library home"><img src="src/assets/logo.png" alt="ACLC"><b>ACLC LIBRARY</b></div><button type="button" class="home-link" id="homeBtn">Home</button></header>' +
    '<div class="page"><div class="tabs"><button class="tab" id="tB">Borrow</button><button class="tab" id="tR">Return</button></div><div id="body"></div></div>';
  const body = el.querySelector("#body");
  const tB = el.querySelector("#tB"), tR = el.querySelector("#tR");
  el.querySelector("#brand").onclick = () => { location.hash = "#/"; };
  el.querySelector("#homeBtn").onclick = () => { location.hash = "#/"; };
  function borrowedFor(s) {
    s = (s || "").trim().toLowerCase();
    return get().loans.filter(x => x.status === "Borrowed" && (!s || x.student.toLowerCase().includes(s)));
  }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  function syncHash() {
    const want = mode === "return" ? "#/return" : "#/borrow";
    try {
      if ((location.hash || "#/") !== want) history.replaceState(null, "", want);
    } catch (e) {}
  }
  function showErr(text) {
    const err = body.querySelector("#err");
    if (!err) return;
    err.textContent = text;
    err.hidden = false;
    clearTimeout(showErr._t);
    showErr._t = setTimeout(() => { if (err.isConnected) err.hidden = true; }, 3000);
  }
  function showOk(text) {
    const ok = body.querySelector("#ok");
    const err = body.querySelector("#err");
    if (err) err.hidden = true;
    if (!ok) return;
    ok.textContent = text;
    ok.hidden = false;
    clearTimeout(showOk._t);
    showOk._t = setTimeout(() => { if (ok.isConnected) ok.hidden = true; }, 4000);
  }
  function userOptions() {
    try {
      return getUsers().slice(0, 80).map(u => '<option value="' + esc(canonUser(u)) + '">').join("");
    } catch (e) { return ""; }
  }
  function paint() {
    tB.classList.toggle("on", mode === "borrow");
    tR.classList.toggle("on", mode === "return");
    if (mode === "borrow") {
      body.innerHTML =
        '<div class="field"><label>Student name or ID</label><input id="s" class="input" placeholder="e.g. 22-0387 or Juan Dela Cruz" autocomplete="off" list="uList"><datalist id="uList">' + userOptions() + '</datalist><div class="acct-hint" id="uHint" hidden></div></div>' +
        '<div class="field"><label>Book title</label><input id="b" class="input" placeholder="e.g. The Great Gatsby" autocomplete="off"></div>' +
        '<div class="field"><label>Author</label><input id="a" class="input" placeholder="e.g. F. Scott Fitzgerald" autocomplete="off"></div>' +
        '<p class="form-err" id="err" hidden></p>' +
        '<p class="form-ok" id="ok" hidden></p>' +
        '<div class="btnrow"><button class="btn gray" id="c">Cancel</button><button class="btn red" id="go">Borrow</button></div>' +
        '<p class="hint">Loans are due in 7 days. Check your due date on the confirmation. Not registered yet? <a href="#/register" style="color:var(--navy);font-weight:800">Create account</a>.</p>';
      const sIn = body.querySelector("#s"), bIn = body.querySelector("#b"), aIn = body.querySelector("#a");
      const uHint = body.querySelector("#uHint");
      sIn.addEventListener("input", () => {
        const r = resolveBorrower(sIn.value);
        if (r.user) { uHint.innerHTML = "Registered: <b>" + esc(canonUser(r.user)) + "</b>"; uHint.hidden = false; }
        else uHint.hidden = true;
      });
      body.querySelector("#c").onclick = () => { location.hash = "#/"; };
      function submit() {
        const raw = sIn.value.trim();
        const b = bIn.value.trim();
        const a = aIn.value.trim();
        if (!raw && !b) { showErr("Enter your name/ID and the book title first."); sIn.focus(); return; }
        if (!raw) { showErr("Enter your name or school ID first."); sIn.focus(); return; }
        if (!b) { showErr("Enter the book title first."); bIn.focus(); return; }
        const r = resolveBorrower(raw);
        const loan = addLoan(r.display, b, a || "-");
        showOk("Borrow recorded! " + b + " — due " + (loan ? loan.due : "") + ".");
        bIn.value = "";
        aIn.value = "";
        bIn.focus();
      }
      body.querySelector("#go").onclick = submit;
      [sIn, bIn, aIn].forEach(inp => {
        inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); submit(); } };
        inp.oninput = () => { const err = body.querySelector("#err"); if (err) err.hidden = true; };
      });
      sIn.focus();
    } else {
      body.innerHTML =
        '<div class="field"><label>Student name or ID</label><input id="s" class="input" placeholder="e.g. 22-0387 or Juan Dela Cruz" autocomplete="off"></div>' +
        '<div class="field"><label style="visibility:hidden">x</label><div class="borrow-select" id="selBox"></div><div class="borrow-panel" id="panel" hidden><div id="panelList"></div></div></div>' +
        '<p class="form-err" id="err" hidden></p>' +
        '<p class="form-ok" id="ok" hidden></p>' +
        '<div class="btnrow" style="margin-top:22px"><button class="btn gray" id="c">Cancel</button><button class="btn navy" id="go">Return</button></div>';
      const sIn = body.querySelector("#s");
      const selBox = body.querySelector("#selBox");
      const panel = body.querySelector("#panel");
      const panelList = body.querySelector("#panelList");
      let rows = [];
      let selId = null;
      let open = false;
      function cardHTML(r) {
        const od = isOverdue(r) ? ' <span class="badge overdue">Overdue</span>' : "";
        const due = r.due ? " · Due " + esc(r.due) : "";
        return "<small>Book currently borrowed</small><h3>" + esc(r.book) + "</h3><p>" + esc(r.author) + " · Borrowed " + esc(r.borrowed) + due + "</p>" + od;
      }
      function setOpen(v) {
        open = v;
        panel.hidden = !open;
        selBox.classList.toggle("open", open);
      }
      function draw() {
        rows = borrowedFor(sIn.value);
        if (!rows.length) {
          selId = null;
          const q = sIn.value.trim();
          selBox.innerHTML = q
            ? "<small>No books currently borrowed for “" + esc(q) + "”</small>"
            : "<small>No books currently borrowed — enter a name or ID above</small>";
          selBox.classList.add("empty");
          setOpen(false);
          return;
        }
        selBox.classList.remove("empty");
        let sel = rows.findIndex(r => r.id === selId);
        if (sel < 0) { sel = 0; selId = rows[0].id; }
        selBox.innerHTML = cardHTML(rows[sel]);
        selBox.classList.toggle("open", open);
        panelList.innerHTML = rows.map((r) =>
          '<div class="borrow-item' + (r.id === selId ? " picked" : "") + '" data-id="' + esc(r.id) + '">' + cardHTML(r) + "</div>"
        ).join("");
        panelList.querySelectorAll(".borrow-item").forEach(n => {
          n.onclick = (e) => {
            e.stopPropagation();
            selId = n.dataset.id;
            setOpen(false);
            draw();
          };
        });
      }
      selBox.onclick = (e) => {
        e.stopPropagation();
        if (!rows.length) return;
        setOpen(!open);
      };
      document.addEventListener("click", function h(e) {
        if (!body.isConnected) { document.removeEventListener("click", h); return; }
        if (!panel.hidden && !panel.contains(e.target) && e.target !== selBox && !selBox.contains(e.target)) {
          setOpen(false);
        }
      });
      sIn.oninput = () => {
        const err = body.querySelector("#err");
        if (err) err.hidden = true;
        selId = null; setOpen(false); draw();
      };
      sIn.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); body.querySelector("#go").click(); } };
      draw();
      body.querySelector("#c").onclick = () => { location.hash = "#/"; };
      body.querySelector("#go").onclick = () => {
        if (!sIn.value.trim()) { showErr("Enter your name or school ID first."); sIn.focus(); return; }
        if (!rows.length) { showErr("No books currently borrowed for that name."); return; }
        if (!selId) { showErr("Select a book to return first."); return; }
        const title = (rows.find(r => r.id === selId) || {}).book || "Book";
        returnLoanById(selId);
        selId = null;
        setOpen(false);
        draw();
        showOk("Return recorded! " + title + " — thank you.");
      };
      sIn.focus();
    }
  }
  tB.onclick = () => { if (mode !== "borrow") { mode = "borrow"; syncHash(); paint(); } };
  tR.onclick = () => { if (mode !== "return") { mode = "return"; syncHash(); paint(); } };
  paint();
}
