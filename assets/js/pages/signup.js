/* Diaspora sign-up: details -> 6-digit code from the e-mail -> account.
   Where the person lives decides what happens: abroad = a diaspora account on
   the Diaspora Desk (signed straight in); Tanzania = a lead for Sales, no account. */
import { NotConnectedError, getCountries, signUpStart, signUpVerify } from "../api.js";
import { showFormResult } from "../ui.js";

export default async function signup() {
  const form = document.getElementById("signup-form");
  if (!form) return;
  const result = document.getElementById("signup-result");
  const submit = form.querySelector("button[type=submit]");
  const back = form.querySelector("[data-back]");
  const codeStep = form.querySelector('[data-step="code"]');
  const steps = [1, 2, 3].map((n) => form.querySelector(`[data-step="${n}"]`));
  const dots = [...form.querySelectorAll("[data-dot]")];
  // 1, 2, 3 = the three short steps (no scrolling); "code" = the e-mailed code.
  let step = 1;
  let email = "";

  // Until the wizard below is ready, Continue must not submit the form the
  // browser's own way: that reloads the page with the answers in the address
  // and the visitor is stuck on step 1 ("You") for ever.
  let ready = false;
  form.addEventListener("submit", (event) => { if (!ready) event.preventDefault(); });

  // The list is built in, so the form works even if the server is slow or
  // older; the server's list (same codes) is used when it answers quickly.
  // Never wait more than 2.5 seconds for it.
  let countries = COUNTRIES;
  try {
    const fromServer = await Promise.race([
      getCountries(),
      new Promise((resolve) => setTimeout(() => resolve(null), 2500)),
    ]);
    if (Array.isArray(fromServer) && fromServer.length) countries = fromServer;
  } catch { /* keep the built-in list */ }
  const sorted = [countries.find((c) => c.code === "TZ"), ...countries.filter((c) => c.code !== "TZ").sort((a, b) => a.name.localeCompare(b.name))].filter(Boolean);
  form.residence.insertAdjacentHTML("beforeend", sorted.map((c) => `<option value="${c.code}" data-dial="${c.dial}">${c.name}</option>`).join(""));
  form.nationality.insertAdjacentHTML("beforeend", `${sorted.map((c) => `<option value="${c.code}">${c.code === "TZ" ? "Tanzanian" : c.name}</option>`).join("")}<option value="OTHER">Other</option>`);
  searchableSelect(form.nationality, "Type to search, e.g. Tanzania or Kenya");
  searchableSelect(form.residence, "Type to search, e.g. UAE, +971 or United Kingdom");
  adaptPhoneToCountry(form, countries);

  const show = (value) => {
    step = value;
    steps.forEach((el, i) => { el.hidden = step !== i + 1; });
    codeStep.hidden = step !== "code";
    dots.forEach((dot) => {
      const n = Number(dot.dataset.dot);
      dot.classList.toggle("is-current", step === n);
      dot.classList.toggle("is-done", step === "code" || (typeof step === "number" && n < step));
    });
    back.hidden = !(typeof step === "number" && step > 1);
    submit.textContent = step === 3 ? "Create account" : step === "code" ? "Confirm" : "Continue";
    const first = (step === "code" ? codeStep : steps[step - 1]).querySelector("input, select");
    first?.focus();
  };
  back.addEventListener("click", () => { result.hidden = true; show(step - 1); });

  /** Checks the fields of one step in the browser; the server checks everything again. */
  const stepOk = (n) => {
    const box = steps[n - 1];
    for (const field of box.querySelectorAll("input, select")) {
      if (!field.checkValidity()) {
        const label = (box.querySelector(`label[for="${field.id}"]`) || box.querySelector(`label[for="${field.id}-search"]`))?.textContent || (field.type === "checkbox" ? "The agreement box" : "This field");
        showFormResult(result, "error", "Please check", `${label.replace(/\s+/g, " ").trim()}: ${field.type === "checkbox" ? "please tick it." : field.tagName === "SELECT" ? "type and choose a country from the list." : field.validationMessage}`);
        if (field.tagName !== "SELECT") field.focus();
        return false;
      }
    }
    if (n === 3 && form.password.value !== form.confirm.value) { showFormResult(result, "error", "Passwords differ", "Type the same password twice."); return false; }
    result.hidden = true;
    return true;
  };
  // A server message about a field sends the customer back to that field's step.
  const stepFor = (message) => /username|e-mail|email|full name/i.test(message) ? 1 : /phone|country|nationality/i.test(message) ? 2 : 3;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (typeof step === "number" && step < 3) { if (stepOk(step)) show(step + 1); return; }
    if (step === 3 && !stepOk(3)) return;
    submit.disabled = true;
    try {
      if (step === 3) {
        email = form.email.value.trim();
        const answer = await signUpStart({ name: form.name.value.trim(), email, username: form.username.value.trim(), phone: form.phone.value.trim(),
          residence: form.residence.value, nationality: form.nationality.value, password: form.password.value, accept: form.accept.checked });
        showFormResult(result, "info", "Check your e-mail", answer.message);
        show("code");
      } else {
        const answer = await signUpVerify(email, form.code.value.replace(/\D/g, ""));
        if (answer.route === "portal") { window.location.assign("portal.html"); return; }
        showFormResult(result, "success", "Thank you", answer.message);
        codeStep.hidden = true; submit.hidden = true;
      }
    } catch (error) {
      if (error instanceof NotConnectedError) showFormResult(result, "info", error.title, error.message);
      else if (step === "code") showFormResult(result, "error", "That code did not work", error.message || "Please try again.");
      else { show(stepFor(error.message || "")); showFormResult(result, "error", "Please check", error.message || "Please try again."); }
    } finally {
      submit.disabled = false;
    }
  });
  show(1);
  ready = true;
}

/**
 * The form adapts itself:
 *  - choosing where you live puts that country's code in the phone (+1, +254…);
 *  - typing a phone with a code first picks the country you live in;
 *  - a non-Tanzanian nationality suggests the same country of residence.
 * The phone follows where you LIVE, not your nationality: a Tanzanian in the
 * USA has a +1 number. Nationality is never guessed from the phone, because it
 * decides what MKUYU may legally offer; the customer chooses it.
 */
function adaptPhoneToCountry(form, countries) {
  const byCode = new Map(countries.map((c) => [c.code, c]));
  const byDial = [...countries].sort((a, b) => b.dial.length - a.dial.length);
  const hint = form.querySelector("[data-phone-hint]");
  let autoPrefix = "";
  const setPrefix = (country) => {
    if (!country) return;
    const prefix = `+${country.dial} `;
    const current = form.phone.value.trim();
    // Replace the code only when the field is empty or still holds a code we put there.
    if (!current || current === autoPrefix.trim() || /^\+\d{1,4}$/.test(current)) {
      form.phone.value = prefix;
      autoPrefix = prefix;
    } else if (current.startsWith("+") && !current.replace(/\s/g, "").startsWith(`+${country.dial}`)) {
      hint.textContent = `Numbers in ${country.name} start with +${country.dial}. Check the number if you live there.`;
      return;
    }
    hint.textContent = `Numbers in ${country.name} start with +${country.dial}.`;
    form.phone.placeholder = `+${country.dial} …`;
  };
  form.residence.addEventListener("change", () => setPrefix(byCode.get(form.residence.value)));
  form.nationality.addEventListener("change", () => {
    const code = form.nationality.value;
    if (!form.residence.value && code && code !== "TZ" && byCode.has(code)) {
      form.residence.value = code;
      form.residence.dispatchEvent(new Event("sync"));
      setPrefix(byCode.get(code));
    }
  });
  form.phone.addEventListener("input", () => {
    const digits = form.phone.value.replace(/[^\d+]/g, "");
    if (!digits.startsWith("+") || form.residence.value) return;
    const hit = byDial.find((c) => digits.slice(1).startsWith(c.dial));
    if (!hit) return;
    // +1 is shared by the USA and Canada; the USA is chosen and can be changed.
    const country = hit.dial === "1" ? byCode.get("US") : hit;
    form.residence.value = country.code;
    form.residence.dispatchEvent(new Event("sync"));
    hint.textContent = `Looks like ${country.name}. Change "Country where you live" if that is wrong.`;
  });
}

/** Built-in countries (code, name, dialling code); the same list the server uses. */
const COUNTRIES = [
  ["TZ", "Tanzania", "255"], ["AE", "United Arab Emirates", "971"], ["OM", "Oman", "968"], ["QA", "Qatar", "974"],
  ["SA", "Saudi Arabia", "966"], ["KW", "Kuwait", "965"], ["BH", "Bahrain", "973"], ["GB", "United Kingdom", "44"],
  ["IE", "Ireland", "353"], ["DE", "Germany", "49"], ["NL", "Netherlands", "31"], ["BE", "Belgium", "32"], ["FR", "France", "33"],
  ["IT", "Italy", "39"], ["ES", "Spain", "34"], ["SE", "Sweden", "46"], ["NO", "Norway", "47"], ["DK", "Denmark", "45"],
  ["FI", "Finland", "358"], ["CH", "Switzerland", "41"], ["AT", "Austria", "43"], ["PL", "Poland", "48"], ["TR", "Turkey", "90"],
  ["US", "United States", "1"], ["CA", "Canada", "1"], ["AU", "Australia", "61"], ["NZ", "New Zealand", "64"],
  ["CN", "China", "86"], ["IN", "India", "91"], ["MY", "Malaysia", "60"], ["JP", "Japan", "81"], ["KR", "South Korea", "82"],
  ["KE", "Kenya", "254"], ["UG", "Uganda", "256"], ["RW", "Rwanda", "250"], ["BI", "Burundi", "257"], ["CD", "DR Congo", "243"],
  ["ZM", "Zambia", "260"], ["MW", "Malawi", "265"], ["MZ", "Mozambique", "258"], ["ZA", "South Africa", "27"], ["BW", "Botswana", "267"],
  ["ZW", "Zimbabwe", "263"], ["NA", "Namibia", "264"], ["ET", "Ethiopia", "251"], ["SS", "South Sudan", "211"], ["SD", "Sudan", "249"],
  ["EG", "Egypt", "20"], ["NG", "Nigeria", "234"], ["GH", "Ghana", "233"], ["CM", "Cameroon", "237"], ["MA", "Morocco", "212"],
  ["SC", "Seychelles", "248"], ["MU", "Mauritius", "230"], ["KM", "Comoros", "269"], ["IL", "Israel", "972"], ["LB", "Lebanon", "961"],
  ["JO", "Jordan", "962"], ["IQ", "Iraq", "964"], ["PK", "Pakistan", "92"], ["BR", "Brazil", "55"],
].map(([code, name, dial]) => ({ code, name, dial }));

/** Short names people type for the long ones. */
const ALIASES = {
  TZ: "tanzania tanzanian tz zanzibar mtanzania", AE: "uae emirates emirati dubai abu dhabi sharjah", OM: "omani muscat", QA: "qatari doha",
  SA: "saudi ksa riyadh jeddah", KW: "kuwaiti", BH: "bahraini", GB: "uk england english britain british london scotland scottish wales welsh",
  IE: "irish", DE: "german deutschland", NL: "dutch holland", BE: "belgian", FR: "french", IT: "italian", ES: "spanish", SE: "swedish swede",
  NO: "norwegian", DK: "danish dane", FI: "finnish finn", CH: "swiss", AT: "austrian", PL: "polish", TR: "turkish", US: "usa us america american",
  CA: "canadian", AU: "australian aussie", NZ: "kiwi", CN: "chinese", IN: "indian", MY: "malaysian", JP: "japanese", KR: "korea korean",
  KE: "kenyan nairobi", UG: "ugandan kampala", RW: "rwandan kigali", BI: "burundian", CD: "congo congolese drc kinshasa", ZM: "zambian lusaka",
  MW: "malawian", MZ: "mozambican", ZA: "rsa south african johannesburg", BW: "motswana batswana", ZW: "zimbabwean", NA: "namibian",
  ET: "ethiopian", SS: "south sudanese", SD: "sudanese", EG: "egyptian", NG: "nigerian", GH: "ghanaian", CM: "cameroonian", MA: "moroccan",
  SC: "seychellois", MU: "mauritian", KM: "comorian", IL: "israeli", LB: "lebanese", JO: "jordanian", IQ: "iraqi", PK: "pakistani", BR: "brazilian",
};

/**
 * Turns a <select> into a search box with a filtered list. The <select> stays
 * the real field (hidden), so the form reads and validates it as before.
 * Search by name, a common short name (UAE, UK, USA) or the dialling code (+254).
 */
function searchableSelect(select, placeholder) {
  const wrap = document.createElement("div");
  wrap.className = "combo";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "combo-input";
  input.placeholder = placeholder;
  input.autocomplete = "off";
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-autocomplete", "list");
  const list = document.createElement("ul");
  list.className = "combo-list";
  list.setAttribute("role", "listbox");
  list.hidden = true;
  const listId = `${select.id}-list`;
  list.id = listId;
  input.setAttribute("aria-controls", listId);
  // The label now points at the search box.
  const label = document.querySelector(`label[for="${select.id}"]`);
  input.id = `${select.id}-search`;
  if (label) label.htmlFor = input.id;
  select.hidden = true;
  select.tabIndex = -1;
  select.parentNode.insertBefore(wrap, select);
  wrap.append(input, list, select);

  const options = [...select.options].filter((o) => o.value);
  let shown = [];
  let active = -1;
  const textOf = (o) => `${o.textContent} ${o.dataset.dial ? `+${o.dataset.dial}` : ""}`.trim();
  const render = (all = false) => {
    const q = all ? "" : input.value.trim().toLowerCase();
    // Name, short name (UAE, UK), nationality word (Kenyan, British) or +code.
    // A word matches when the text contains it, or when it starts with one of
    // the text's words ("kenyan" finds Kenya, "tanzanian" finds Tanzania).
    shown = options.filter((o) => {
      if (!q) return true;
      const hay = `${o.textContent} ${ALIASES[o.value] || ""} ${o.dataset.dial ? `+${o.dataset.dial} ${o.dataset.dial}` : ""}`.toLowerCase();
      const words = hay.split(/[\s,()-]+/).filter(Boolean);
      // Each typed word must START one of the words (so "usa" finds the USA, not
      // Lusaka in Zambia), or be a longer form of one ("kenyan" -> Kenya).
      return q.split(/\s+/).every((word) => words.some((w) => w.startsWith(word) || (w.length >= 4 && word.startsWith(w))));
    });
    // Best first: names that start with what was typed.
    shown.sort((a, b) => Number(!a.textContent.toLowerCase().startsWith(q)) - Number(!b.textContent.toLowerCase().startsWith(q)));
    active = shown.length ? 0 : -1;
    list.innerHTML = shown.length
      ? shown.map((o, i) => `<li role="option" id="${listId}-${i}" data-value="${o.value}" class="${i === active ? "is-active" : ""}" aria-selected="${o.value === select.value}">${o.textContent}${o.dataset.dial ? ` <small>+${o.dataset.dial}</small>` : ""}</li>`).join("")
      : `<li class="combo-empty">No country found. Try another spelling or the code, e.g. +254.</li>`;
    input.setAttribute("aria-activedescendant", active >= 0 ? `${listId}-${active}` : "");
  };
  const open = () => { render(); list.hidden = false; input.setAttribute("aria-expanded", "true"); };
  const close = () => { list.hidden = true; input.setAttribute("aria-expanded", "false"); };
  const choose = (value) => {
    select.value = value;
    input.value = select.selectedOptions[0]?.textContent || "";
    close();
    select.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const highlight = (i) => {
    active = Math.max(0, Math.min(shown.length - 1, i));
    [...list.children].forEach((li, n) => li.classList.toggle("is-active", n === active));
    list.children[active]?.scrollIntoView({ block: "nearest" });
    input.setAttribute("aria-activedescendant", `${listId}-${active}`);
  };
  // On focus the whole list shows (not just the current choice); typing filters it.
  input.addEventListener("focus", () => { input.select(); render(true); list.hidden = false; input.setAttribute("aria-expanded", "true"); });
  input.addEventListener("input", () => { select.value = ""; open(); });
  // Clicking the box again (it may still have focus) shows the whole list again.
  input.addEventListener("click", () => { if (list.hidden) { input.select(); render(true); list.hidden = false; input.setAttribute("aria-expanded", "true"); } });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") { event.preventDefault(); if (list.hidden) open(); else highlight(active + 1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); highlight(active - 1); }
    else if (event.key === "Enter" && !list.hidden) { event.preventDefault(); if (shown[active]) choose(shown[active].value); }
    else if (event.key === "Escape") close();
    else if (event.key === "Tab" && !list.hidden && shown.length === 1) choose(shown[0].value);
  });
  // mousedown (not click) so the choice lands before the box loses focus
  list.addEventListener("mousedown", (event) => {
    const li = event.target.closest("li[data-value]");
    if (li) { event.preventDefault(); choose(li.dataset.value); }
  });
  input.addEventListener("blur", () => {
    setTimeout(close, 120);
    // Typed a full name without picking: take it if it matches exactly one.
    if (!select.value && input.value.trim()) {
      const q = input.value.trim().toLowerCase();
      const exact = options.find((o) => o.textContent.toLowerCase() === q) || (shown.length === 1 ? shown[0] : null);
      if (exact) choose(exact.value);
    }
  });
  // Another part of the form set the value (e.g. from the phone): show it.
  select.addEventListener("sync", () => { input.value = select.selectedOptions[0]?.textContent || ""; });
  // The form's own validation reads the hidden select; point errors at the box.
  select.addEventListener("invalid", () => input.focus());
  void textOf;
}
