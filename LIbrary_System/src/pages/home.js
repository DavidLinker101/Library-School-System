import { addVisit } from "../js/store.js";
export function render(el) {
  el.innerHTML =
    '<header class="topbar"><div class="brand"><img src="src/assets/logo.png" alt="ACLC"><b>ACLC LIBRARY</b></div><div class="campus">Mandaue Campus</div></header>' +
    '<div class="page"><div class="center"><h1 class="title">Welcome to the library</h1>' +
    '<p class="sub">Enter your school ID or full name to log your visit</p>' +
    '<div class="form-zone" id="formZone">' +
    '<div class="field"><input id="who" class="input center-t" placeholder="School ID or Full Name"></div>' +
    '<div class="btnrow"><button class="btn navy" id="tin">Time In</button><button class="btn red" id="tout">Time out</button></div>' +
    '<div class="notify" id="msg" hidden><b id="msgText"></b></div>' +
    '</div>' +
    '<div class="dashed" id="goBorrow">Borrow Book</div>' +
    '<p class="hint">Staff dashboard access - bottom right corner</p></div></div>' +
    '<div class="corner"><button class="pill-btn" id="staff">Staff Login</button></div>';
  const who = el.querySelector("#who");
  function flash(t) {
    const m = el.querySelector("#msg");
    el.querySelector("#msgText").textContent = t;
    m.hidden = false;
    clearTimeout(flash._t);
    flash._t = setTimeout(() => { m.hidden = true; }, 2000);
  }
  el.querySelector("#tin").onclick = () => {
    const v = who.value.trim();
    if (!v) { flash("Please enter your School ID or Full Name first."); who.focus(); return; }
    addVisit(v, "in");
    location.hash = "#/time-in-recorded";
    who.value = "";
    who.focus();
  };
  el.querySelector("#tout").onclick = () => {
    const v = who.value.trim();
    if (!v) { flash("Please enter your School ID or Full Name first."); who.focus(); return; }
    addVisit(v, "out");
    location.hash = "#/time-out-recorded";
    who.value = "";
    who.focus();
  };
  el.querySelector("#goBorrow").onclick = () => { location.hash = "#/borrow"; };
  el.querySelector("#staff").onclick = () => { location.hash = "#/admin"; };
}
