import { render as home } from "../pages/home.js";
import { render as borrow } from "../pages/borrow.js";
import { render as register } from "../pages/register.js";
import { render as profile } from "../pages/profile.js";
import { render as studentLogin } from "../pages/login.js";
import { renderLogin, renderVerify, renderMfa } from "../pages/admin.js";
import { render as logs } from "../pages/logs.js";
import { isAuthed, hasStep, setAuthed, setStudentSession } from "./store.js";
const IDLE_PUBLIC = 90000;
const IDLE_ADMIN = 180000;
export function boot() {
  const app = document.getElementById("app");
  let idleT = null;
  function armIdle(ms) {
    clearTimeout(idleT);
    idleT = setTimeout(() => {
      setAuthed(false);
      setStudentSession(null);
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
    if (h.startsWith("#/borrow")) borrow(app, "borrow");
    else if (h.startsWith("#/return")) borrow(app, "return");
    else if (h.startsWith("#/register")) register(app);
    else if (h.startsWith("#/login")) studentLogin(app);
    else if (h.startsWith("#/profile")) profile(app, h.slice(9));
    else if (h.startsWith("#/admin")) renderLogin(app);
    else if (h.startsWith("#/verify")) { if (!hasStep() && !isAuthed()) { location.hash = "#/admin"; return; } renderVerify(app); }
    else if (h.startsWith("#/mfa")) { if (!isAuthed()) { location.hash = "#/admin"; return; } renderMfa(app); }
    else if (h.startsWith("#/logs")) { if (!isAuthed()) { location.hash = "#/admin"; return; } logs(app); }
    else home(app);
    const admin = h.startsWith("#/admin") || h.startsWith("#/verify") || h.startsWith("#/mfa") || h.startsWith("#/logs");
    armIdle(admin ? IDLE_ADMIN : IDLE_PUBLIC);
  }
  window.addEventListener("hashchange", route);
  route();
}
