import { registerUser } from "../js/store.js";

export function render(el) {
  el.innerHTML =
    '<header class="topbar"><div class="brand clickable" id="brand" title="Back to library home"><img src="src/assets/logo.png" alt="ACLC"><b>ACLC LIBRARY</b></div><button type="button" class="home-link" id="homeBtn">Home</button></header>' +
    '<div class="reg-wrap"><div class="reg-card">' +
    '<h1 class="reg-title">Register Secure User Account</h1>' +
    '<div class="reg-grid">' +
    '<div class="reg-form">' +
    '<div class="reg-field"><label for="fFirst">First Name</label><input id="fFirst" class="reg-input" placeholder="e.g. Juan" autocomplete="given-name"><p class="reg-ferr" id="eFirst" hidden></p></div>' +
    '<div class="reg-field"><label for="fLast">Last Name</label><input id="fLast" class="reg-input" placeholder="e.g. Dela Cruz" autocomplete="family-name"><p class="reg-ferr" id="eLast" hidden></p></div>' +
    '<div class="reg-field"><label for="fSid">Student ID</label><input id="fSid" class="reg-input" placeholder="e.g. 22-0387" autocomplete="off" inputmode="numeric"><p class="reg-ferr" id="eSid" hidden></p></div>' +
    '<div class="reg-field"><label for="fEmail">Email</label><input id="fEmail" class="reg-input" placeholder="e.g. juan.delacruz@aclc.edu.ph" autocomplete="email" inputmode="email"><p class="reg-ferr" id="eEmail" hidden></p></div>' +
    '<div class="reg-field"><label for="fPass">Password</label><input id="fPass" type="password" class="reg-input" placeholder="Min. 6 characters" autocomplete="new-password"><p class="reg-ferr" id="ePass" hidden></p></div>' +
    '<div class="reg-field"><label for="fPass2">Confirm password</label><input id="fPass2" type="password" class="reg-input" placeholder="Retype your password" autocomplete="new-password"><p class="reg-ferr" id="ePass2" hidden></p></div>' +
    '</div>' +
    '<div class="reg-photo">' +
    '<div class="avatar" id="avatar"><svg viewBox="0 0 64 64" width="64" height="64" fill="#9aa5b8" aria-hidden="true"><circle cx="32" cy="22" r="11"/><path d="M12 52c0-11 9-18 20-18s20 7 20 18v2H12v-2z"/></svg></div>' +
    '<input type="file" id="fPhoto" accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif" hidden>' +
    '<button type="button" class="upload-btn" id="upBtn"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 18a4 4 0 1 1 .6-7.96A5.5 5.5 0 0 1 18.3 12H18a3 3 0 0 1 0 6H7z"/><path d="M12 12v9"/><path d="m8 16 4-4 4 4"/></svg>Upload photo</button>' +
    '<p class="photo-hint">JPG, PNG or GIF (Max 5MB)</p>' +
    '<p class="reg-ferr center" id="ePhoto" hidden></p>' +
    '</div>' +
    '</div>' +
    '<p class="form-err" id="err" hidden></p>' +
    '<p class="form-ok" id="ok" hidden></p>' +
    '<div class="reg-actions"><button type="button" class="reg-btn cancel" id="cancelBtn">Cancel</button><button type="button" class="reg-btn create" id="createBtn"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9zm3 4a2 2 0 0 1 1 3.73V20h-2v-2.27A2 2 0 0 1 12 14z"/></svg>Create Account</button></div>' +
    '<p class="hint">Already have an account? <a href="#/login" style="color:var(--navy);font-weight:800">Log in</a></p>' +
    '<p class="secure-note"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9z"/></svg>Your account is secure and your information is protected.</p>' +
    '</div></div>';

  el.querySelector("#brand").onclick = () => { location.hash = "#/"; };
  el.querySelector("#homeBtn").onclick = () => { location.hash = "#/"; };
  el.querySelector("#cancelBtn").onclick = () => { location.hash = "#/"; };

  const fFirst = el.querySelector("#fFirst");
  const fLast = el.querySelector("#fLast");
  const fSid = el.querySelector("#fSid");
  const fEmail = el.querySelector("#fEmail");
  const fPass = el.querySelector("#fPass");
  const fPass2 = el.querySelector("#fPass2");
  const fPhoto = el.querySelector("#fPhoto");
  const avatar = el.querySelector("#avatar");
  const err = el.querySelector("#err");
  const ok = el.querySelector("#ok");
  let photoData = "";
  let busy = false;

  function clearFieldErrs() {
    ["eFirst", "eLast", "eSid", "eEmail", "ePass", "ePass2", "ePhoto"].forEach(id => { el.querySelector("#" + id).hidden = true; });
    [fFirst, fLast, fSid, fEmail, fPass, fPass2].forEach(i => i.classList.remove("bad"));
    err.hidden = true;
  }
  function fieldError(input, labelId, msg) {
    const p = el.querySelector("#" + labelId);
    p.textContent = msg;
    p.hidden = false;
    if (input) input.classList.add("bad");
  }
  [fFirst, fLast, fSid, fEmail, fPass, fPass2].forEach(inp => {
    inp.addEventListener("input", () => {
      inp.classList.remove("bad");
      err.hidden = true;
      if (ok) ok.hidden = true;
    });
  });

  el.querySelector("#upBtn").onclick = () => fPhoto.click();

  // Downscale photos so dozens of accounts still fit in localStorage.
  function fileToThumb(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const S = 160;
          const c = document.createElement("canvas");
          c.width = S; c.height = S;
          const ctx = c.getContext("2d");
          const scale = Math.max(S / img.width, S / img.height);
          const w = img.width * scale, h = img.height * scale;
          ctx.fillStyle = "#e6e9f0";
          ctx.fillRect(0, 0, S, S);
          ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
          URL.revokeObjectURL(url);
          resolve(c.toDataURL("image/jpeg", 0.85));
        } catch (e) { URL.revokeObjectURL(url); reject(e); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("unreadable")); };
      img.src = url;
    });
  }

  fPhoto.onchange = async () => {
    const f = fPhoto.files && fPhoto.files[0];
    const eP = el.querySelector("#ePhoto");
    eP.hidden = true;
    if (!f) return;
    const okType = /^(image\/jpeg|image\/png|image\/gif)$/.test(f.type) || /\.(jpe?g|png|gif)$/i.test(f.name);
    if (!okType) {
      eP.textContent = "Only JPG, PNG or GIF photos.";
      eP.hidden = false;
      fPhoto.value = "";
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      eP.textContent = "Photo must be 5MB or less.";
      eP.hidden = false;
      fPhoto.value = "";
      return;
    }
    try {
      el.querySelector("#upBtn").disabled = true;
      photoData = await fileToThumb(f);
      avatar.innerHTML = '<img alt="Student photo preview">';
      const img = avatar.querySelector("img");
      img.src = photoData;
    } catch (e) {
      eP.textContent = "Could not read that photo. Try another file.";
      eP.hidden = false;
      photoData = "";
    } finally {
      el.querySelector("#upBtn").disabled = false;
    }
  };

  // Auto-format 220387 -> 22-0387 while typing.
  fSid.addEventListener("input", () => {
    const digits = fSid.value.replace(/\D/g, "").slice(0, 6);
    if (digits.length > 2) fSid.value = digits.slice(0, 2) + "-" + digits.slice(2);
    else fSid.value = digits;
  });

  function setBusy(v) {
    busy = v;
    const btn = el.querySelector("#createBtn");
    btn.disabled = v;
    btn.style.opacity = v ? ".7" : "";
    btn.style.cursor = v ? "wait" : "";
  }

  async function submit() {
    if (busy) return;
    clearFieldErrs();
    if (ok) ok.hidden = true;
    setBusy(true);
    // let the disabled button paint before the (fast) localStorage write
    await new Promise(r => setTimeout(r, 30));
    if (fPass.value !== fPass2.value) {
      fieldError(fPass2, "ePass2", "Passwords do not match.");
      fPass2.focus();
      return;
    }
    const r = registerUser({
      first: fFirst.value,
      last: fLast.value,
      studentId: fSid.value,
      email: fEmail.value,
      photo: photoData,
      password: fPass.value
    });
    setBusy(false);
    if (!r.ok) {
      const map = { first: [fFirst, "eFirst"], last: [fLast, "eLast"], studentId: [fSid, "eSid"], email: [fEmail, "eEmail"], password: [fPass, "ePass"] };
      const m = map[r.field];
      if (m) fieldError(m[0], m[1], r.error);
      else { err.textContent = r.error; err.hidden = false; }
      (m ? m[0] : fFirst).focus();
      return;
    }
    ok.textContent = "Account created: " + r.display + ". Log in with your Student ID + password.";
    ok.hidden = false;
    fFirst.value = ""; fLast.value = ""; fSid.value = ""; fEmail.value = ""; fPass.value = ""; fPass2.value = ""; fPhoto.value = "";
    photoData = "";
    avatar.innerHTML = '<svg viewBox="0 0 64 64" width="64" height="64" fill="#9aa5b8" aria-hidden="true"><circle cx="32" cy="22" r="11"/><path d="M12 52c0-11 9-18 20-18s20 7 20 18v2H12v-2z"/></svg>';
    fFirst.focus();
  }

  el.querySelector("#createBtn").onclick = submit;
  [fFirst, fLast, fSid, fEmail, fPass, fPass2].forEach(inp => {
    inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); submit(); } };
  });
  fFirst.focus();
}
