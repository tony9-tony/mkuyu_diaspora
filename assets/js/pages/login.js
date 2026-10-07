/* Diaspora login: username or e-mail + password. No code at sign-in.
   The e-mailed code is used only by "Forgot password or first time here?"
   (a customer MKUYU invited sets their password that way). The session is an
   HttpOnly cookie this script never sees. */
import { NotConnectedError, currentCustomer, passwordLogin, requestCode, resetPassword, verifyLoginCode } from "../api.js";
import { safeNext, showFormResult } from "../ui.js";

export default async function login() {
  const form = document.getElementById("login-form");
  if (!form) return;
  const next = safeNext();
  const result = document.getElementById("login-result");
  const submit = form.querySelector("button[type=submit]");
  const field = (mode) => form.querySelector(`[data-mode="${mode}"]`);
  const idLabel = form.querySelector("[data-id-label]");
  let mode = "password"; // password | forgot-ask | forgot | twofactor

  if (await currentCustomer().catch(() => null)) { window.location.replace(next); return; }

  const setMode = (value) => {
    mode = value;
    field("password").hidden = mode !== "password";
    field("code").hidden = mode !== "forgot" && mode !== "twofactor";
    field("newpass").hidden = mode !== "forgot";
    idLabel.textContent = mode === "password" ? "Username or e-mail" : "Your e-mail";
    form.email.readOnly = mode === "forgot" || mode === "twofactor";
    submit.textContent = { password: "Sign in", "forgot-ask": "Send me a code", forgot: "Save password and sign in", twofactor: "Verify and sign in" }[mode];
    form.querySelector('[data-switch="password"]').hidden = mode === "password";
    form.querySelector('[data-switch="forgot"]').hidden = mode !== "password";
  };
  form.querySelectorAll("[data-switch]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    result.hidden = true;
    setMode(link.dataset.switch === "forgot" ? "forgot-ask" : "password");
  }));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const identifier = form.email.value.trim();
    if (!identifier) { showFormResult(result, "error", "Missing", mode === "password" ? "Enter your username or e-mail." : "Enter your e-mail."); return; }
    if (mode !== "password" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identifier)) { showFormResult(result, "error", "Enter your e-mail", "The code is sent to the e-mail of your account."); return; }
    submit.disabled = true;
    try {
      if (mode === "password") {
        const answer = await passwordLogin(identifier, form.password.value);
        if (answer?.needs_code) {
          showFormResult(result, "info", "Check your e-mail", answer.message || "Enter the code we e-mailed you.");
          setMode("twofactor");
          form.code.value = "";
          form.code.focus();
        } else window.location.assign(next);
      } else if (mode === "twofactor") {
        await verifyLoginCode(identifier, form.code.value.replace(/\D/g, ""));
        window.location.assign(next);
      } else if (mode === "forgot-ask") {
        const answer = await requestCode(identifier);
        showFormResult(result, "info", "Check your e-mail", answer.message || "If this address is registered, a code is on its way.");
        setMode("forgot");
        form.code.focus();
      } else {
        await resetPassword(identifier, form.code.value.replace(/\D/g, ""), form.newpass.value);
        window.location.assign(next);
      }
    } catch (error) {
      if (error instanceof NotConnectedError) showFormResult(result, "info", error.title, error.message);
      else if (error.status === 401) showFormResult(result, "error", mode === "password" ? "Could not sign in" : "That code did not work", error.message);
      else showFormResult(result, "error", "Please try again", error.message || "Something went wrong.");
    } finally {
      submit.disabled = false;
    }
  });
}
