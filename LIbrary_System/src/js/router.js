import { render as home } from "../pages/home.js";
import { render as borrow } from "../pages/borrow.js";
import { renderLogin, renderVerify, renderMfa } from "../pages/admin.js";
import { render as logs } from "../pages/logs.js";
import { renderRecorded } from "../pages/feedback.js";
import { isAuthed, hasStep, setAuthed } from "./store.js";
const IDLE_PUBLIC = 90000;
const IDLE_ADMIN = 180000;
export function boot() {
  const app = document.getElementById("app");
  let idleT = null;
  function armIdle(ms) {
    clearTimeout(idleT);
    idleT = setTimeout(() => {
      setAuthed(false);
      if ((location.hash || "#/") !== "#/") location.hash = "#/";
      else route();
    }, ms);
  }
  ["click", "keydown", "input", "touchstart"].forEach(ev =>
    window.addEventListener(ev, () => {
      const h = location.hash || "#/";
      const admin = h.startsWith("#/admin") || h.startsWith("#/verify") || h.startsWith("#/mfa") || h.startsWith("#/logs");
      armIdle(admin ? IDLE_ADMIN : IDLE_PUBLIC);
    }, { passive: true })
  );
  function route() {
    const h = location.hash || "#/";
    window.scrollTo(0, 0);
    if (h.startsWith("#/time-in-recorded")) renderRecorded(app, "in");
    else if (h.startsWith("#/time-out-recorded")) renderRecorded(app, "out");
    else if (h.startsWith("#/borrow/return")) borrow(app, "return");
    else if (h.startsWith("#/borrow")) borrow(app, "borrow");
    else if (h.startsWith("#/return")) borrow(app, "return");
    else if (h.startsWith("#/admin/verify") || h.startsWith("#/verify")) { if (!hasStep() && !isAuthed()) { location.hash = "#/admin/login"; return; } renderVerify(app); }
    else if (h.startsWith("#/admin/mfa") || h.startsWith("#/mfa")) { if (!isAuthed()) { location.hash = "#/admin/login"; return; } renderMfa(app); }
    else if (h.startsWith("#/admin")) renderLogin(app);
    else if (h.startsWith("#/logs/books")) { if (!isAuthed()) { location.hash = "#/admin/login"; return; } logs(app, "bor"); }
    else if (h.startsWith("#/logs")) { if (!isAuthed()) { location.hash = "#/admin/login"; return; } logs(app, "att"); }
    else home(app);
    const admin = h.startsWith("#/admin") || h.startsWith("#/verify") || h.startsWith("#/mfa") || h.startsWith("#/logs");
    armIdle(admin ? IDLE_ADMIN : IDLE_PUBLIC);
  }
  window.addEventListener("hashchange", route);
  route();
}
