import { get, addLoan, returnLoanById } from "../js/store.js";
export function render(el, tab) {
  let mode = tab === "return" ? "return" : "borrow";
  el.innerHTML =
    '<header class="topbar"><div class="brand"><img src="src/assets/logo.png" alt="ACLC"><b>ACLC LIBRARY</b></div><div></div></header>' +
    '<div class="page"><div class="tabs"><button class="tab" id="tB">Borrow</button><button class="tab" id="tR">Return</button></div><div id="body"></div></div>';
  const body = el.querySelector("#body");
  const tB = el.querySelector("#tB"), tR = el.querySelector("#tR");
  function borrowedFor(s) {
    s = (s || "").trim().toLowerCase();
    return get().loans.filter(x => x.status === "Borrowed" && (!s || x.student.toLowerCase().includes(s)));
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function paint() {
    tB.classList.toggle("on", mode === "borrow");
    tR.classList.toggle("on", mode === "return");
    if (mode === "borrow") {
      body.innerHTML =
        '<div class="field"><label>Student name or ID</label><input id="s" class="input" placeholder="e.g.22-0387 or Juan Dela Cruz"></div>' +
        '<div class="field"><label>Book title</label><input id="b" class="input" placeholder="e.g. The Great Gatsby"></div>' +
        '<div class="field"><label>Author</label><input id="a" class="input" placeholder="e.g.F.Scott Fitzgerald"></div>' +
        '<p class="form-ok" id="ok" hidden></p>' +
        '<div class="btnrow"><button class="btn gray" id="c">Cancel</button><button class="btn red" id="go">Borrow</button></div>';
      body.querySelector("#c").onclick = () => { location.hash = "#/"; };
      body.querySelector("#go").onclick = () => {
        const s = body.querySelector("#s").value.trim();
        const b = body.querySelector("#b").value.trim();
        const a = body.querySelector("#a").value.trim();
        if (!s || !b) return;
        addLoan(s, b, a || "-");
        const ok = body.querySelector("#ok");
        ok.textContent = "Borrow recorded! " + b;
        ok.hidden = false;
        body.querySelector("#b").value = "";
        body.querySelector("#a").value = "";
        clearTimeout(ok._t);
        ok._t = setTimeout(() => { ok.hidden = true; }, 2500);
      };
    } else {
      body.innerHTML =
        '<div class="field"><label>Student name or ID</label><input id="s" class="input" value="22-0387"></div>' +
        '<div class="field"><label style="visibility:hidden">x</label><div class="borrow-select" id="selBox"></div><div class="borrow-panel" id="panel" hidden><div id="panelList"></div></div></div>' +
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
        return "<small>Book currently borrowed</small><h3>" + esc(r.book) + "</h3><p>" + esc(r.author) + " \u00B7 Borrowed " + esc(r.borrowed) + "</p>";
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
          selBox.innerHTML = "<small>No books currently borrowed</small>";
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
      sIn.oninput = () => { selId = null; setOpen(false); draw(); };
      draw();
      body.querySelector("#c").onclick = () => { location.hash = "#/"; };
      body.querySelector("#go").onclick = () => {
        if (!selId) return;
        const title = (rows.find(r => r.id === selId) || {}).book || "Book";
        returnLoanById(selId);
        selId = null;
        setOpen(false);
        draw();
        const ok = body.querySelector("#ok");
        ok.textContent = "Return recorded! " + title + " — thank you.";
        ok.hidden = false;
        clearTimeout(ok._t);
        ok._t = setTimeout(() => { ok.hidden = true; }, 2500);
      };
    }
  }
  tB.onclick = () => { mode = "borrow"; paint(); };
  tR.onclick = () => { mode = "return"; paint(); };
  paint();
}
