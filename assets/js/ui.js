/* ==========================================================================
   MKUYU AFRICA — shared UI building blocks
   --------------------------------------------------------------------------
   Every dynamic value is passed through escapeHtml() before it reaches
   innerHTML, so catalogue text can never inject markup.
   ========================================================================== */

import { STATUS_LABELS, currentCustomer, stateFor } from "./api.js";

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

/* ---------------- Money ---------------- */

/** Compact for cards ("TZS 185 m"), exact for statements ("TZS 2,800,000"). */
export function formatMoney(value, currency = "TZS", { exact = false } = {}) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return exact ? `${currency} 0` : "Price on request";
  if (!exact && n >= 1_000_000_000) return `${currency} ${trim(n / 1_000_000_000, 2)} bn`;
  if (!exact && n >= 1_000_000) return `${currency} ${trim(n / 1_000_000, 1)} m`;
  return `${currency} ${Math.round(n).toLocaleString("en-US")}`;
}
const trim = (n, digits) => Number(n.toFixed(digits)).toString();

/** "per month" from the period the internal system sends; nothing invented. */
export function periodLabel(period) {
  if (!period) return "";
  const known = { month: "per month", year: "per year", week: "per week" };
  return known[period] || `per ${period}`;
}

/** The price to show for a property in a given service context. */
export function priceFor(property, service) {
  const rent = property.price.rent;
  if (service === "rent" || (!service && !property.services.includes("buy"))) {
    return rent?.amount
      ? { amount: formatMoney(rent.amount, property.currency), note: periodLabel(rent.period) || "Rent" }
      : { amount: "Price on request", note: "Rent" };
  }
  const also = !service && property.services.includes("rent") && rent?.amount
    ? `or ${formatMoney(rent.amount, property.currency)} ${periodLabel(rent.period)}`.trim()
    : "Sale price";
  return { amount: formatMoney(property.price.sale, property.currency), note: also };
}

/* ---------------- Icons (inline, inherit colour) ---------------- */

const PATHS = {
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  bed: '<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14h18M3 18v2M21 18v2M7 9V6h4v3"/>',
  bath: '<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/>',
  area: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
  handshake: '<path d="M3 11l4-4 5 2 5-2 4 4-8 8zM8 13l3 3M11 11l3 3"/>',
  card: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  prev: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  play: '<path d="M7 5l12 7-12 7z"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5M9 9l-5-5M15 9l5-5M9 15l-5 5M15 15l5 5"/>',
  images: '<rect x="3" y="5" width="15" height="13" rx="1.5"/><path d="M21 8v12H7M3 15l4-4 4 4 3-3 4 4"/>',
};

export function icon(name, className = "icon") {
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || ""}</svg>`;
}

/* ---------------- Photos and placeholders ----------------
   Real photographs come from the internal system (the Sales Officer uploads
   them). Nothing is invented: until a photo exists, the frame shows a clearly
   labelled placeholder rather than a stock image or an illustration. */

/** variant: "card" | "large" | "thumb" */
export function photoPlaceholder(label = "Photo coming soon", variant = "card") {
  return `<div class="ph ph--${variant}" role="img" aria-label="${escapeHtml(label)}">
    <div class="ph-inner">${icon("camera")}<strong>${escapeHtml(label)}</strong></div>
  </div>`;
}

export function propertyMedia(property, variant = "card") {
  const photo = property.photos[0];
  if (!photo) return photoPlaceholder("Photo coming soon", variant);
  const img = `<img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.alt || property.title)}" loading="lazy" decoding="async">`;
  return photo.illustration ? img + illustrationTag() : img;
}

/** A small "Illustration" label on a picture that is not a photo of the listing. */
export function illustrationTag() {
  return '<span class="illus-tag" style="position:absolute;right:.7rem;bottom:.7rem;z-index:2;background:rgba(22,19,15,.72);color:#fff;font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:.25rem .55rem;border-radius:999px;pointer-events:none">Illustration</span>';
}

/* ---------------- Badges ---------------- */

export function serviceBadges(property) {
  return property.services.map((service) => service === "rent"
    ? '<span class="badge badge--rent">For rent</span>'
    : '<span class="badge badge--buy">For sale</span>').join("");
}

/**
 * The state of each category: nothing while open, otherwise SOLD / RENTED /
 * RESERVED. On the Buy or Rent page only that page's category is shown;
 * elsewhere every category that is not open (e.g. "Sold" and "Rented").
 */
export function statusBadge(property, service) {
  const services = service ? [service] : property.services;
  return services.map((s) => {
    const state = stateFor(property, s);
    if (state === "available") return "";
    const label = state === "reserved" && !service && property.services.length > 1 ? `Reserved for ${s === "rent" ? "rent" : "sale"}` : STATUS_LABELS[state];
    return `<span class="badge badge--status badge--${escapeHtml(state)}">${escapeHtml(label)}</span>`;
  }).join("");
}

/** True when the category shown (or every category) is sold or rented. */
function isClosed(property, service) {
  const services = service ? [service] : property.services;
  return services.length > 0 && services.every((s) => ["sold", "rented"].includes(stateFor(property, s)));
}

/* ---------------- Property card ---------------- */

export function detailsHref(property, service) {
  return `property.html?p=${encodeURIComponent(property.slug)}${service ? `&service=${service}` : ""}`;
}

/** The public property card. The whole card is one link (a stretched title link). */
export function propertyCard(property, { service } = {}) {
  const price = priceFor(property, service);
  const facts = [
    property.bedrooms ? `<li>${icon("bed")}<span>${property.bedrooms} <span class="sr-label">bedrooms</span><abbr title="bedrooms" aria-hidden="true">bd</abbr></span></li>` : "",
    property.bathrooms ? `<li>${icon("bath")}<span>${property.bathrooms} <span class="sr-label">bathrooms</span><abbr title="bathrooms" aria-hidden="true">ba</abbr></span></li>` : "",
    property.area ? `<li>${icon("area")}<span>${property.area.toLocaleString("en-US")} m²</span></li>` : "",
  ].join("");
  return `<article class="pcard${isClosed(property, service) ? " pcard--closed" : ""}" data-reveal>
    <div class="pcard-media">
      ${propertyMedia(property)}
      <div class="pcard-badges">${serviceBadges(property)}${statusBadge(property, service)}</div>
      ${property.sample ? '<span class="pcard-sample">Sample</span>' : ""}
    </div>
    <div class="pcard-body">
      <p class="pcard-type">${escapeHtml(property.type)}</p>
      <h3 class="pcard-title"><a class="pcard-link" href="${detailsHref(property, service)}">${escapeHtml(property.title)}</a></h3>
      <p class="pcard-loc">${icon("pin")}<span>${escapeHtml(property.location)}</span></p>
      ${property.summary ? `<p class="pcard-summary">${escapeHtml(property.summary)}</p>` : ""}
      ${facts ? `<ul class="pcard-facts">${facts}</ul>` : ""}
      <div class="pcard-foot">
        <p class="pcard-price">${escapeHtml(price.amount)}<small>${escapeHtml(price.note)}</small></p>
        <span class="pcard-cta" aria-hidden="true">View details ${icon("arrow")}</span>
      </div>
    </div>
  </article>`;
}

/** Placeholder cards shown while listings load. */
export function skeletonCards(count = 3) {
  return Array.from({ length: count }, () => `<div class="pcard skeleton" aria-hidden="true">
    <div class="pcard-media"></div>
    <div class="pcard-body">
      <span class="sk-line" style="width:30%"></span><span class="sk-line" style="width:75%;height:16px"></span>
      <span class="sk-line" style="width:55%"></span><span class="sk-line" style="width:90%;margin-top:.6rem"></span>
      <div class="pcard-foot"><span class="sk-line" style="width:40%;height:18px"></span></div>
    </div>
  </div>`).join("");
}

/* ---------------- Lightbox (modal gallery) ---------------- */

/** Opens photos full-screen in a <dialog>: arrow keys, Esc, swipe, focus kept inside. */
export function openLightbox(photos, start = 0, title = "") {
  if (!photos.length) return;
  let index = start;
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", `${title} photos`);
  dialog.innerHTML = `
    <div class="lightbox-top"><span data-counter aria-live="polite"></span>
      <button class="icon-btn" type="button" data-close aria-label="Close gallery">${icon("close")}</button></div>
    <div class="lightbox-stage">
      <img alt="">
      ${photos.length > 1 ? `<button class="icon-btn lightbox-prev" type="button" data-step="-1" aria-label="Previous photo">${icon("prev")}</button>
      <button class="icon-btn lightbox-next" type="button" data-step="1" aria-label="Next photo">${icon("next")}</button>` : ""}
    </div>
    <p class="lightbox-caption"></p>`;
  const img = dialog.querySelector("img");
  const show = (i) => {
    index = (i + photos.length) % photos.length;
    const photo = photos[index];
    img.src = photo.url;
    img.alt = photo.alt || `${title} — photo ${index + 1}`;
    img.style.animation = "none"; void img.offsetWidth; img.style.animation = "";
    dialog.querySelector("[data-counter]").textContent = `${index + 1} / ${photos.length}`;
    dialog.querySelector(".lightbox-caption").textContent = photo.alt || title;
  };
  dialog.addEventListener("click", (event) => {
    const step = event.target.closest("[data-step]");
    if (step) show(index + Number(step.dataset.step));
    else if (event.target.closest("[data-close]") || event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") show(index + 1);
    if (event.key === "ArrowLeft") show(index - 1);
  });
  let startX = null;
  dialog.addEventListener("pointerdown", (event) => { startX = event.clientX; });
  dialog.addEventListener("pointerup", (event) => {
    if (startX !== null && Math.abs(event.clientX - startX) > 50) show(index + (event.clientX < startX ? 1 : -1));
    startX = null;
  });
  const opener = document.activeElement;
  dialog.addEventListener("close", () => { dialog.remove(); opener?.focus?.(); });
  document.body.appendChild(dialog);
  show(start);
  dialog.showModal();
  dialog.querySelector("[data-close]").focus();
}

/* ---------------- Forms ---------------- */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Inline validation. Returns true when the form may be submitted. */
export function validateForm(form, extraChecks = () => []) {
  for (const node of form.querySelectorAll(".field-error")) node.remove();
  form.querySelectorAll("[aria-invalid]").forEach((el) => { el.removeAttribute("aria-invalid"); el.removeAttribute("aria-describedby"); });

  const problems = [];
  for (const field of form.querySelectorAll("input, select, textarea")) {
    if (field.type === "file" || field.type === "checkbox") {
      if (field.required && field.type === "checkbox" && !field.checked) problems.push([field, "Please confirm to continue."]);
      continue;
    }
    const value = String(field.value || "").trim();
    if (field.required && !value) problems.push([field, "This field is required."]);
    else if (value && field.type === "email" && !EMAIL.test(value)) problems.push([field, "Enter a valid email address."]);
    else if (value && field.minLength > 0 && value.length < field.minLength) problems.push([field, `Use at least ${field.minLength} characters.`]);
    else if (value && field.type === "number" && field.min !== "" && Number(value) < Number(field.min)) problems.push([field, `Enter ${field.min} or more.`]);
  }
  problems.push(...extraChecks());

  for (const [field, message] of problems) {
    const note = document.createElement("p");
    note.className = "field-error";
    note.id = `${field.id || field.name}-error`;
    note.textContent = message;
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", note.id);
    (field.closest(".field") || field.parentElement).appendChild(note);
  }
  if (problems.length) problems[0][0].focus();
  return problems.length === 0;
}

/** A status panel under a form: kind is "info", "success" or "error". */
export function showFormResult(host, kind, title, message) {
  host.hidden = false;
  host.className = `form-result form-result--${kind}`;
  host.innerHTML = `${icon(kind === "success" ? "check" : "info")}<div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p></div>`;
  host.setAttribute("tabindex", "-1");
  host.focus({ preventScroll: true });
  host.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

/* ---------------- Page chrome ---------------- */

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;
  const mobile = window.matchMedia("(max-width: 960px)");
  const setOpen = (open) => {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    toggle.innerHTML = icon(open ? "close" : "menu");
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (event) => { if (event.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
  });
  mobile.addEventListener("change", () => setOpen(false));
  setOpen(false);
}

function initHeaderShadow() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  // <body data-header="overlay"> (Home): the header floats over the showcase
  // and turns solid once the visitor scrolls past the top.
  header.classList.toggle("is-overlay", document.body.dataset.header === "overlay");
  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/** Fades sections and cards in as they scroll into view. Content is never
    hidden without JavaScript: the hidden state only exists under html.js. */
export function initReveal(root = document) {
  const targets = [...root.querySelectorAll("[data-reveal]:not(.is-visible)")];
  if (!("IntersectionObserver" in window)) { targets.forEach((el) => el.classList.add("is-visible")); return; }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -40px 0px", threshold: 0.08 });
  targets.forEach((el, index) => {
    el.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 60}ms`);
    observer.observe(el);
  });
}

/** Header account link: "Log in" for visitors, "My portal" once signed in. */
async function initAccountLink() {
  const link = document.querySelector("[data-account-link]");
  if (!link) return;
  try {
    const customer = await currentCustomer();
    if (customer) {
      link.href = "portal.html";
      link.innerHTML = `${icon("user")}<span>My portal</span>`;
    }
  } catch { /* the visitor simply stays on "Log in" */ }
}

function initYear() {
  for (const node of document.querySelectorAll("[data-year]")) node.textContent = String(new Date().getFullYear());
}

export function initChrome() {
  initNav();
  initHeaderShadow();
  initAccountLink();
  initYear();
  initReveal();
}

/** The `next` page to return to after login, restricted to this site. */
export function safeNext(fallback = "portal.html") {
  const next = new URLSearchParams(window.location.search).get("next") || "";
  return /^[a-z-]+\.html(\?[^#]*)?$/i.test(next) ? next : fallback;
}
