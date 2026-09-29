export function renderRecorded(el, kind) {
  const isIn = kind === "in";
  const message = isIn ? "Time in Recorded! Welcome." : "Time out Recorded! Goodbye.";
  const action = isIn ? "Time in" : "Time out";
  el.innerHTML =
    '<header class="topbar"><div class="brand"><img src="src/assets/logo.png" alt="ACLC"><b>ACLC LIBRARY</b></div><div class="campus">Mandaue Campus</div></header>' +
    '<div class="page"><div class="center"><h1 class="title">Welcome to the library</h1>' +
    '<p class="sub">Enter your school ID or full name to log your visit</p>' +
    '<div class="toast"><b>' + message + '</b></div>' +
    '<div class="btnrow"><button class="btn navy" disabled>Time in</button><button class="btn red" disabled>Time out</button></div>' +
    '<div class="dashed" id="goBorrow">Borrow Book</div>' +
    '<p class="hint">Staff dashboard access - bottom right corner</p></div></div>' +
    '<div class="corner"><button class="pill-btn" id="staff">Staff Login</button></div>';
  el.querySelector("#goBorrow").onclick = () => { location.hash = "#/borrow"; };
  el.querySelector("#staff").onclick = () => { location.hash = "#/admin/login"; };
}