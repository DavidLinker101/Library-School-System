import { getCreds, setCode, setAuthed, setStep } from "../js/store.js";
function codes(el) {
  const boxes = [...el.querySelectorAll(".code")];
  boxes.forEach((b, i) => {
    b.oninput = () => { b.value = b.value.replace(/\D/g, "").slice(0, 1); if (b.value && i < 3) boxes[i + 1].focus(); };
    b.onkeydown = e => { if (e.key === "Backspace" && !b.value && i > 0) boxes[i - 1].focus(); };
    b.onpaste = e => {
      e.preventDefault();
      const t = ((e.clipboardData || window.clipboardData || {}).getData("text") || "").replace(/\D/g, "").slice(0, 4);
      t.split("").forEach((ch, k) => { if (boxes[i + k]) boxes[i + k].value = ch; });
      const next = boxes[Math.min(i + t.length, 3)];
      if (next) next.focus();
    };
  });
  if (boxes[0]) boxes[0].focus();
}
const shield = '<svg class="shield" viewBox="0 0 64 64" fill="none" stroke="black" stroke-width="2"><path d="M32 4 54 11v18c0 14-9 22-22 29C19 51 10 43 10 29V11z"/></svg>';
function errHTML() { return '<p class="form-err" id="err" hidden></p>'; }
function showErr(el, t) {
  const e = el.querySelector("#err");
  if (!e) return;
  e.textContent = t;
  e.hidden = false;
}
export function renderLogin(el) {
  el.innerHTML =
    '<header class="topbar admin"><div class="brand clickable" id="brand" title="Back to library home"><b>ACLC LIBRARY ADMIN</b></div></header>' +
    '<div class="page"><div class="center"><h1 class="title">Admin Log in</h1><p class="sub">Staff access only</p></div>' +
    '<div class="field"><label>Email</label><input class="input" id="em" placeholder="example@gmail.com" autocomplete="username"></div>' +
    '<div class="field"><label>Password</label><div class="pw-wrap"><input type="password" class="input" id="pw" placeholder="*********" autocomplete="current-password"><button type="button" class="pw-toggle" id="pwT">Show</button></div></div>' +
    errHTML() +
    '<div class="btnrow"><button type="button" class="btn ghost" id="back">Back</button><button type="button" class="btn red" id="go">Log in Admin</button></div>' +
    '<p class="hint">Demo credentials: admin@aclc.edu.ph / admin123</p></div>';
  el.querySelector("#brand").onclick = () => { location.hash = "#/"; };
  el.querySelector("#back").onclick = () => { location.hash = "#/"; };
  const pw = el.querySelector("#pw");
  const pwT = el.querySelector("#pwT");
  pwT.onclick = () => {
    const show = pw.type === "password";
    pw.type = show ? "text" : "password";
    pwT.textContent = show ? "Hide" : "Show";
    pw.focus();
  };
  function doLogin() {
    const c = getCreds();
    const em = el.querySelector("#em").value.trim().toLowerCase();
    const pwd = pw.value;
    if (em === c.email.toLowerCase() && pwd === c.pass) { setStep(true); location.hash = "#/verify"; }
    else showErr(el, "Wrong email or password. Try again.");
  }
  el.querySelector("#go").onclick = doLogin;
  el.querySelector("#em").onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); doLogin(); } };
  pw.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); doLogin(); } };
  el.querySelector("#em").focus();
}
export function renderVerify(el) {
  el.innerHTML =
    '<header class="topbar admin"><div class="brand clickable" id="brand" title="Back to library home"><b>ACLC LIBRARY ADMIN</b></div></header>' +
    '<div class="page"><div class="center">' + shield +
    '<h1 class="title">Verify your identity</h1><p class="sub">Enter your 4-digit security code</p>' +
    '<div class="code-row"><input class="code" maxlength="1" inputmode="numeric" autocomplete="one-time-code"><input class="code" maxlength="1" inputmode="numeric"><input class="code" maxlength="1" inputmode="numeric"><input class="code" maxlength="1" inputmode="numeric"></div>' +
    errHTML() +
    '<div class="btnrow"><button type="button" class="btn ghost" id="back">Back</button><button type="button" class="btn red" id="go">Enter</button></div>' +
    '<div class="btnrow"><button type="button" class="btn gray" id="clear">Clear code</button></div></div></div>';
  codes(el);
  el.querySelector("#brand").onclick = () => { location.hash = "#/"; };
  el.querySelector("#back").onclick = () => { location.hash = "#/admin"; };
  el.querySelector("#clear").onclick = () => {
    [...el.querySelectorAll(".code")].forEach(b => { b.value = ""; });
    el.querySelector("#err").hidden = true;
    el.querySelectorAll(".code")[0].focus();
  };
  function submit() {
    const typed = [...el.querySelectorAll(".code")].map(b => b.value).join("");
    if (typed === getCreds().code) { setStep(false); setAuthed(true); location.hash = "#/logs"; }
    else showErr(el, "Wrong security code. Try again.");
  }
  el.querySelector("#go").onclick = submit;
  [...el.querySelectorAll(".code")].forEach(b => {
    b.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); submit(); } });
  });
}
export function renderMfa(el) {
  el.innerHTML =
    '<header class="topbar admin"><div class="brand clickable" id="brand" title="Back to logs"><b>ACLC LIBRARY ADMIN</b></div></header>' +
    '<div class="page"><div class="center">' + shield +
    '<h1 class="title">Input New MFA</h1><p class="sub">Enter your new 4-digit security code</p>' +
    '<div class="code-row"><input class="code" maxlength="1" inputmode="numeric"><input class="code" maxlength="1" inputmode="numeric"><input class="code" maxlength="1" inputmode="numeric"><input class="code" maxlength="1" inputmode="numeric"></div>' +
    '<p class="sub">Confirm new code</p>' +
    '<div class="code-row"><input class="code second" maxlength="1" inputmode="numeric"><input class="code second" maxlength="1" inputmode="numeric"><input class="code second" maxlength="1" inputmode="numeric"><input class="code second" maxlength="1" inputmode="numeric"></div>' +
    errHTML() +
    '<div class="btnrow"><button type="button" class="btn ghost" id="back">Cancel</button><button type="button" class="btn red" id="go">Change</button></div>' +
    '<div class="btnrow"><button type="button" class="btn gray" id="out">Log out</button></div></div></div>';
  codes(el);
  el.querySelector("#brand").onclick = () => { location.hash = "#/logs"; };
  el.querySelector("#back").onclick = () => { location.hash = "#/logs"; };
  el.querySelector("#out").onclick = () => { setAuthed(false); location.hash = "#/"; };
  el.querySelector("#go").onclick = () => {
    const first = [...el.querySelectorAll(".code:not(.second)")].map(b => b.value).join("");
    const second = [...el.querySelectorAll(".code.second")].map(b => b.value).join("");
    if (!/^\d{4}$/.test(first) || !/^\d{4}$/.test(second)) { showErr(el, "Enter all 4 digits in both rows."); return; }
    if (first !== second) { showErr(el, "Codes do not match. Retype both rows."); return; }
    setCode(first);
    location.hash = "#/logs";
  };
}
