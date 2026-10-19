import { verifyStudent, setStudentSession } from "../js/store.js";

export function render(el) {
  el.innerHTML =
    '<header class="topbar"><div class="brand clickable" id="brand" title="Back to library home"><img src="src/assets/logo.png" alt="ACLC"><b>ACLC LIBRARY</b></div><button type="button" class="home-link" id="homeBtn">Home</button></header>' +
    '<div class="page"><div class="center"><h1 class="title">Student Log in</h1>' +
    '<p class="sub">View your borrowing history and visit logs</p></div>' +
    '<div class="field"><label for="liId">Student ID or email</label><input id="liId" class="input" placeholder="e.g. 22-0387" autocomplete="username"></div>' +
    '<div class="field"><label for="liPw">Password</label><div class="pw-wrap"><input id="liPw" type="password" class="input" placeholder="Your password" autocomplete="current-password"><button type="button" class="pw-toggle" id="liT">Show</button></div></div>' +
    '<p class="form-err" id="err" hidden></p>' +
    '<div class="btnrow"><button type="button" class="btn gray" id="back">Back</button><button type="button" class="btn navy" id="go">Log in</button></div>' +
    '<p class="hint">No account yet? <a href="#/register" style="color:var(--navy);font-weight:800">Register</a> — it takes 30 seconds.<br>Demo: seeded/imported accounts use their Student ID as the initial password.</p></div>';
  el.querySelector("#brand").onclick = () => { location.hash = "#/"; };
  el.querySelector("#homeBtn").onclick = () => { location.hash = "#/"; };
  el.querySelector("#back").onclick = () => { location.hash = "#/"; };
  const idIn = el.querySelector("#liId");
  const pw = el.querySelector("#liPw");
  const err = el.querySelector("#err");
  el.querySelector("#liT").onclick = () => {
    const show = pw.type === "password";
    pw.type = show ? "text" : "password";
    el.querySelector("#liT").textContent = show ? "Hide" : "Show";
    pw.focus();
  };
  function fail(t) {
    err.textContent = t;
    err.hidden = false;
  }
  [idIn, pw].forEach(i => i.addEventListener("input", () => { err.hidden = true; }));
  function doLogin() {
    const r = verifyStudent(idIn.value, pw.value);
    if (!r.ok) { fail(r.error); pw.focus(); return; }
    setStudentSession(r.user.id);
    location.hash = "#/profile/" + encodeURIComponent(r.user.studentId);
  }
  el.querySelector("#go").onclick = doLogin;
  idIn.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); doLogin(); } };
  pw.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); doLogin(); } };
  idIn.focus();
}
