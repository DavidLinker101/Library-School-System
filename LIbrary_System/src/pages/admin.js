import { getCreds, setCode, setAuthed, setStep } from "../js/store.js";
function codes(el) {
  const boxes = [...el.querySelectorAll(".code")];
  boxes.forEach((b, i) => {
    b.oninput = () => { b.value = b.value.replace(/\D/g, "").slice(0, 1); if (b.value && i < 3) boxes[i + 1].focus(); };
    b.onkeydown = e => { if (e.key === "Backspace" && !b.value && i > 0) boxes[i - 1].focus(); };
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
    '<header class="topbar admin"><b>ACLC LIBRARY ADMIN</b></header>' +
    '<div class="page"><div class="center"><h1 class="title">Admin Log in</h1><p class="sub">Staff access only</p></div>' +
    '<div class="field"><label>Email</label><input class="input" id="em" placeholder="example@gmail.com"></div>' +
    '<div class="field"><label>Password</label><input type="password" class="input" id="pw" placeholder="*********"></div>' +
    errHTML() +
    '<div class="btnrow"><button class="btn ghost" id="back">Return</button><button class="btn red" id="go">Log in Admin</button></div>' +
    '<p class="hint">Demo credentials: admin@aclc.edu.ph / admin123</p></div>';
  el.querySelector("#back").onclick = () => { location.hash = "#/"; };
  el.querySelector("#go").onclick = () => {
    const c = getCreds();
    const em = el.querySelector("#em").value.trim().toLowerCase();
    const pw = el.querySelector("#pw").value;
    if (em === c.email.toLowerCase() && pw === c.pass) { setStep(true); location.hash = "#/verify"; }
    else showErr(el, "Wrong email or password. Try again.");
  };
}
export function renderVerify(el) {
  el.innerHTML =
    '<header class="topbar admin"><b>ACLC LIBRARY ADMIN</b></header>' +
    '<div class="page"><div class="center">' + shield +
    '<h1 class="title">Verify your identity</h1><p class="sub">Enter your 4-digit security code</p>' +
    '<div class="code-row"><input class="code" maxlength="1" inputmode="numeric"><input class="code" maxlength="1" inputmode="numeric"><input class="code" maxlength="1" inputmode="numeric"><input class="code" maxlength="1" inputmode="numeric"></div>' +
    errHTML() +
    '<div class="btnrow"><button class="btn ghost" id="back">Return</button><button class="btn red" id="go">Enter</button></div></div></div>';
  codes(el);
  el.querySelector("#back").onclick = () => { location.hash = "#/admin"; };
  el.querySelector("#go").onclick = () => {
    const typed = [...el.querySelectorAll(".code")].map(b => b.value).join("");
    if (typed === getCreds().code) { setStep(false); setAuthed(true); location.hash = "#/logs"; }
    else showErr(el, "Wrong security code. Try again.");
  };
}
export function renderMfa(el) {
  el.innerHTML =
    '<header class="topbar admin"><b>ACLC LIBRARY ADMIN</b></header>' +
    '<div class="page"><div class="center">' + shield +
    '<h1 class="title">Input New MFA</h1><p class="sub">Enter your new 4-digit security code</p>' +
    '<div class="code-row"><input class="code" maxlength="1" inputmode="numeric"><input class="code" maxlength="1" inputmode="numeric"><input class="code" maxlength="1" inputmode="numeric"><input class="code" maxlength="1" inputmode="numeric"></div>' +
    errHTML() +
    '<div class="btnrow"><button class="btn ghost" id="back">Cancel</button><button class="btn red" id="go">Change</button></div></div></div>';
  codes(el);
  el.querySelector("#back").onclick = () => { location.hash = "#/logs"; };
  el.querySelector("#go").onclick = () => {
    const typed = [...el.querySelectorAll(".code")].map(b => b.value).join("");
    if (!/^\d{4}$/.test(typed)) { showErr(el, "Enter all 4 digits."); return; }
    setCode(typed);
    location.hash = "#/logs";
  };
}
