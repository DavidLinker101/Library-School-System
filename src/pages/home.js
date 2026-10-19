import { addVisit, getUsers, findUser, canonUser, userActivity, fmtDur, PURPOSES } from "../js/store.js";
export function render(el) {
  el.innerHTML =
    '<header class="topbar"><div class="brand clickable" id="brand" title="ACLC Library home"><img src="src/assets/logo.png" alt="ACLC"><b>ACLC LIBRARY</b></div><div class="campus">Mandaue Campus</div></header>' +
    '<div class="page"><div class="center"><h1 class="title">Welcome to the library</h1>' +
    '<p class="sub">Enter your school ID or full name to log your visit</p>' +
    '<div class="form-zone" id="formZone">' +
    '<div class="field"><input id="who" class="input center-t" placeholder="School ID or Full Name" autocomplete="off" list="acctList"><datalist id="acctList"></datalist><div class="recog" id="recog" hidden></div></div>' +
    '<div class="field"><label for="purpose">Purpose of visit</label><select id="purpose" class="input">' +
    PURPOSES.map(p => '<option value="' + p + '">' + p + '</option>').join("") +
    '</select></div>' +
    '<div class="btnrow"><button type="button" class="btn navy" id="tin">→ Time In</button><button type="button" class="btn red" id="tout">→ Time out</button></div>' +
    '<div class="notify" id="msg" hidden><b id="msgText"></b></div>' +
    '</div>' +
    '<button type="button" class="dashed as-btn" id="goBorrow">Borrow / Return Book</button>' +
    '<p class="hint">New student? <a href="#/register" id="goReg" style="color:var(--navy);font-weight:800">Register your account</a> — it takes 30 seconds.<br>Have an account? <a href="#/login" style="color:var(--navy);font-weight:800">Student log in</a> to view your profile.<br>Staff dashboard access - bottom right corner</p></div></div>' +
    '<div class="corner"><button type="button" class="pill-btn" id="staff">Staff Login</button></div>';
  const who = el.querySelector("#who");
  const list = el.querySelector("#acctList");
  const recog = el.querySelector("#recog");
  const purposeSel = el.querySelector("#purpose");
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  try {
    list.innerHTML = getUsers().slice(0, 60).map(u => {
      const c = canonUser(u).replace(/"/g, "&quot;");
      return '<option value="' + c + '">';
    }).join("");
  } catch (e) {}
  function refreshRecog() {
    const v = who.value.trim();
    if (!v) { recog.hidden = true; recog.innerHTML = ""; return; }
    const hit = findUser(v);
    if (!hit) { recog.hidden = true; recog.innerHTML = ""; return; }
    let act = { visits: 0, active: 0, total: 0 };
    try { act = userActivity(hit.studentId); } catch (e) {}
    const photo = hit.photo
      ? '<img src="' + hit.photo + '" alt="">'
      : '<span class="recog-initial">' + esc((hit.first || "?")[0]) + '</span>';
    const books = act.active === 1 ? "1 book out" : act.active + " books out";
    recog.innerHTML =
      '<div class="recog-photo">' + photo + '</div>' +
      '<div class="recog-text"><b>Welcome back, ' + esc(hit.first) + '!</b>' +
      '<span>Visit #' + (act.visits + 1) + ' · ' + books + ' · ' + esc(canonUser(hit)) + '</span>' +
      '<a class="recog-link" href="#/profile/' + encodeURIComponent(hit.studentId) + '">View full profile ›</a></div>';
    recog.hidden = false;
  }
  who.addEventListener("input", refreshRecog);
  function flash(t) {
    const m = el.querySelector("#msg");
    el.querySelector("#msgText").textContent = t;
    m.hidden = false;
    clearTimeout(flash._t);
    flash._t = setTimeout(() => { m.hidden = true; }, 2500);
  }
  el.querySelector("#brand").onclick = () => { if ((location.hash || "#/") !== "#/") location.hash = "#/"; else window.scrollTo(0, 0); };
  function displayFirst(u) { return String(u && u.first || "").replace(/\.$/, ""); }
  function doIn() {
    const v = who.value.trim();
    if (!v) { flash("Please enter your School ID or Full Name first."); who.focus(); return; }
    const hit = findUser(v);
    const r = addVisit(v, "in", purposeSel.value);
    if (r && r.ok) {
      flash(hit ? "Time in recorded! Welcome back, " + displayFirst(hit) + "." : "Time in Recorded! Welcome.");
      who.value = "";
      recog.hidden = true;
      recog.innerHTML = "";
    } else if (r && r.reason === "already-in") {
      flash(hit ? displayFirst(hit) + " is already timed in. Please time out first." : "You are already timed in. Please time out first.");
    } else {
      flash("Could not record time in. Please try again.");
    }
    who.focus();
  }
  function doOut() {
    const v = who.value.trim();
    if (!v) { flash("Please enter your School ID or Full Name first."); who.focus(); return; }
    const hit = findUser(v);
    const r = addVisit(v, "out");
    if (r && r.ok) {
      const stay = r.durationMs != null ? " You stayed " + fmtDur(r.durationMs) + "." : "";
      flash(hit ? "Time out recorded! Goodbye, " + displayFirst(hit) + "." + stay : "Time out Recorded! Goodbye." + stay);
      who.value = "";
      recog.hidden = true;
      recog.innerHTML = "";
    } else if (r && r.reason === "no-open") {
      flash("No open time-in found for that name. Please time in first.");
    } else {
      flash("Could not record time out. Please try again.");
    }
    who.focus();
  }
  el.querySelector("#tin").onclick = doIn;
  el.querySelector("#tout").onclick = doOut;
  who.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); doIn(); } };
  el.querySelector("#goBorrow").onclick = () => { location.hash = "#/borrow"; };
  el.querySelector("#staff").onclick = () => { location.hash = "#/admin"; };
}
