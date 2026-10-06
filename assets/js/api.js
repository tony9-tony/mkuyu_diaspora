/* ==========================================================================
   MKUYU AFRICA — data layer
   --------------------------------------------------------------------------
   The ONLY place this website gets data from or sends data to. Every page
   goes through these functions, so:

     * connected  (API_BASE set)  - data comes from the internal MKUYU system
     * preview    (API_BASE empty) - data comes from the sample catalogue, and
                                     submissions are refused honestly

   The website never decides a property's status. It reads the status the
   internal system reports and applies the display rules below.
   The endpoint contract lives in docs/PUBLIC-API.md.
   ========================================================================== */

import { API_BASE, CUSTOMER_ACCOUNTS, ONLINE_ENQUIRIES, RESERVED_ON_WEBSITE, DEFAULT_CURRENCY } from "./config.js";
import * as sample from "./data.js";

export const CONNECTED = Boolean(API_BASE);
/** Customer features need the live system AND customer accounts built there. */
export const ACCOUNTS_LIVE = CONNECTED && CUSTOMER_ACCOUNTS;

export const SERVICES = ["rent", "buy"];
export const STATUS_LABELS = { available: "Available", reserved: "Reserved", rented: "Rented", sold: "Sold" };

/** Raised when an action needs the live system and the site is in preview mode. */
export class NotConnectedError extends Error {
  constructor(action) {
    super(CONNECTED
      ? `${action} is not open yet: customer accounts are still being set up. Nothing has been sent.`
      : `${action} will open once this website is connected to the MKUYU system. Nothing has been sent.`);
    this.name = "NotConnectedError";
    this.title = CONNECTED ? "Not open yet" : "Preview only";
  }
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message || `The request failed (${status}).`);
    this.name = "ApiError";
    this.status = status;
  }
}

const REQUEST_TIMEOUT_MS = 30000;

async function request(path, { method = "GET", body } = {}) {
  // Public data is read without cookies; only customer calls carry the session.
  const customer = path.startsWith("/customer/");
  const init = { method, credentials: customer ? "include" : "omit", headers: { Accept: "application/json" } };
  // The customer API refuses a state-changing call without this header (CSRF).
  if (customer) init.headers["X-MKUYU-Customer"] = "1";
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  // Never leave a button spinning for ever: if the MKUYU system has not
  // answered within REQUEST_TIMEOUT_MS, stop and say so.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  init.signal = controller.signal;
  let response;
  let payload;
  try {
    response = await fetch(`${API_BASE}${path}`, init);
    payload = await response.json().catch(() => ({}));
  } catch (error) {
    if (error?.name === "AbortError") throw new ApiError(0, "The MKUYU system is taking too long to answer. Please try again in a moment.");
    throw new ApiError(0, "The MKUYU system could not be reached. Please check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) throw new ApiError(response.status, payload.error);
  return payload;
}

/* ---------------------------------------------------------------------------
   Property display rules
   --------------------------------------------------------------------------- */

/* A listing without photos of its own shows a picture of its kind (a room,
   a house, a villa, a penthouse, a shop or a plot), marked as an illustration,
   followed by any photos of its building. */
const TYPE_PICTURES = { apartment: "apartment", penthouse: "penthouse", villa: "villa", house: "house", commercial: "commercial", land: "land" };
export function typePicture(type) {
  const key = TYPE_PICTURES[String(type || "").toLowerCase()] || "house";
  return { url: `assets/images/types/${key}.svg`, alt: `Illustration of ${key === "commercial" ? "a shop or office space" : key === "land" ? "a plot of land" : `a ${key}`}`, illustration: true };
}
function photosFor(raw) {
  const all = Array.isArray(raw.photos) ? raw.photos.filter((p) => p && p.url) : [];
  const own = all.filter((p) => !p.shared);
  if (own.length) return own;
  return [typePicture(raw.type), ...all];
}

/** One consistent shape, whatever the source sends. */
export function normalizeProperty(raw) {
  const services = (Array.isArray(raw.services) ? raw.services : []).filter((s) => SERVICES.includes(s));
  const status = STATUS_LABELS[raw.status] ? raw.status : "available";
  // State per category: the Buy page and the Rent page each show their own.
  // A source without per-category states (the sample catalogue) derives them.
  const given = raw.availability || {};
  const availability = {
    buy: services.includes("buy") ? (["available", "reserved", "sold"].includes(given.buy) ? given.buy : status === "sold" ? "sold" : status === "reserved" ? "reserved" : "available") : null,
    rent: services.includes("rent") ? (["available", "reserved", "rented"].includes(given.rent) ? given.rent : status === "rented" ? "rented" : status === "reserved" ? "reserved" : "available") : null,
  };
  return {
    id: raw.id,
    slug: String(raw.slug || raw.id),
    title: raw.title || "Untitled property",
    type: raw.type || "Property",
    services,
    status,
    availability,
    currency: raw.currency || DEFAULT_CURRENCY,
    price: { sale: Number(raw.price?.sale) || 0, rent: raw.price?.rent ? { amount: Number(raw.price.rent.amount) || 0, period: raw.price.rent.period || "" } : null },
    location: raw.location || "",
    project: raw.project || null,
    // A unit in a building: floor (0 = ground) and unit number, when given.
    floor: raw.floor === null || raw.floor === undefined || raw.floor === "" ? null : Number(raw.floor),
    unit: raw.unit ? String(raw.unit) : "",
    bedrooms: Number(raw.bedrooms) || 0,
    bathrooms: Number(raw.bathrooms) || 0,
    area: Number(raw.area) || 0,
    featured: Boolean(raw.featured),
    photos: photosFor(raw),
    summary: raw.summary || "",
    description: raw.description || "",
    features: Array.isArray(raw.features) ? raw.features : [],
    sample: Boolean(raw.sample),
  };
}

/** A property's state for one service: available, reserved, sold or rented. */
export function stateFor(property, service) {
  return property.availability?.[service] || "available";
}

/**
 * Whether a property belongs in the public listing for `service`. Sold and
 * rented properties stay listed, marked SOLD / RENTED for that category, so
 * visitors see what MKUYU has sold and rented. Without a service (the home
 * page), only properties still open in some category are shown.
 */
export function isListed(property, service) {
  const visible = (state) => state !== "reserved" || RESERVED_ON_WEBSITE === "show";
  if (service) return property.services.includes(service) && visible(stateFor(property, service));
  return property.services.some((s) => stateFor(property, s) === "available" || (stateFor(property, s) === "reserved" && RESERVED_ON_WEBSITE === "show"));
}

/** Whether a visitor may start a request for `service` on this property. */
export function canRequest(property, service) {
  return property.services.includes(service) && stateFor(property, service) === "available";
}

/* ---------------------------------------------------------------------------
   Catalogue (public, no login)
   --------------------------------------------------------------------------- */

export async function listProperties({ service } = {}) {
  const rows = CONNECTED
    ? await request(`/public/properties${service ? `?service=${encodeURIComponent(service)}` : ""}`)
    : sample.PROPERTIES;
  return rows.map(normalizeProperty).filter((property) => isListed(property, service));
}

/** A single property, whatever its status, so an old link can explain it is gone. */
export async function getProperty(slug) {
  if (CONNECTED) {
    try { return normalizeProperty(await request(`/public/properties/${encodeURIComponent(slug)}`)); }
    catch (error) { if (error.status === 404) return null; throw error; }
  }
  const raw = sample.PROPERTIES.find((p) => p.slug === slug);
  return raw ? normalizeProperty(raw) : null;
}

/** A project is an estate (separate homes or plots) or a building (floors and
    numbered units). Its units can be offered to rent, to buy, or both, so a
    project appears on whichever side its open units are offered for. */
export function normalizeProject(raw) {
  return {
    slug: String(raw.slug || raw.id),
    name: raw.name || "Untitled project",
    kind: raw.kind === "building" ? "building" : "estate",
    location: raw.location || "",
    summary: raw.summary || "",
    status: raw.status || "",
    services: (Array.isArray(raw.services) ? raw.services : []).filter((s) => SERVICES.includes(s)),
    units: Number(raw.units) || 0,
    floors: Number(raw.floors) || 0,
    photos: Array.isArray(raw.photos) ? raw.photos.filter((p) => p && p.url) : [],
    sample: Boolean(raw.sample),
  };
}

export async function listProjects({ service } = {}) {
  const rows = CONNECTED
    ? await request(`/public/projects${service ? `?service=${encodeURIComponent(service)}` : ""}`)
    : sample.PROJECTS;
  return rows.map(normalizeProject).filter((project) => !service || project.services.includes(service));
}

/** One project with all its published units (sold and rented ones included). */
export async function getProject(slug) {
  if (CONNECTED) {
    try {
      const raw = await request(`/public/projects/${encodeURIComponent(slug)}`);
      return { ...normalizeProject(raw), properties: (raw.properties || []).map(normalizeProperty) };
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }
  const raw = sample.PROJECTS.find((project) => project.slug === slug);
  if (!raw) return null;
  return { ...normalizeProject(raw), properties: sample.PROPERTIES.filter((p) => p.project?.slug === slug).map(normalizeProperty) };
}

/* ---------------------------------------------------------------------------
   Customer actions (need the live system and, where noted, a login)
   --------------------------------------------------------------------------- */

/** Rent or Buy request for one property. No account: the visitor's details
    go straight to Sales as a Lead. Returns { reference }. */
export async function submitRequest({ propertySlug, service, name, phone, email, budget, preferredContact, message, website }) {
  if (!CONNECTED || !ONLINE_ENQUIRIES) throw new NotConnectedError("Sending a request");
  return request("/public/requests", { method: "POST", body: { property: propertySlug, service, name, phone, email, budget, preferred_contact: preferredContact, message, website } });
}

/** Sell submission: the customer's own property, for Sales to review. */
export async function submitSellRequest({ name, phone, email, preferredContact, propertyType, location, area, bedrooms, askingPrice, titleDeed, message, website }) {
  if (!CONNECTED || !ONLINE_ENQUIRIES) throw new NotConnectedError("Sending your property");
  return request("/public/sell", { method: "POST", body: {
    name, phone, email, preferred_contact: preferredContact, property_type: propertyType, location,
    area: area || null, bedrooms: bedrooms === "" ? null : bedrooms, asking_price: askingPrice || null,
    title_deed: titleDeed || null, message, website,
  } });
}

/** Countries for the sign-up form (code, name, dialling code). */
export async function getCountries() {
  return request("/customer/countries");
}
/** Sign-up step 1: details; a 6-digit code goes to the e-mail. */
export async function signUpStart(details) {
  if (!ACCOUNTS_LIVE) throw new NotConnectedError("Signing up");
  return request("/customer/auth/signup", { method: "POST", body: details });
}
/** Sign-up step 2: the code. Abroad -> signed in to the portal; Tanzania -> Sales will call. */
export async function signUpVerify(email, code) {
  return request("/customer/auth/signup/verify", { method: "POST", body: { email, code } });
}
export const signUp = signUpStart;
/** Sign in with e-mail and password. */
export async function passwordLogin(identifier, password) {
  if (!ACCOUNTS_LIVE) throw new NotConnectedError("Signing in");
  return request("/customer/auth/login", { method: "POST", body: { identifier, password } });
}
/** Forgot password: the code from requestCode() plus a new password. */
export async function resetPassword(email, code, password) {
  return request("/customer/auth/reset-password", { method: "POST", body: { email, code, password } });
}
/** A diaspora agreement to read (text + fingerprint), and its electronic signature. */
export async function getAgreement(contractId) {
  return request(`/customer/contracts/${encodeURIComponent(contractId)}/agreement`);
}
export async function signAgreement(contractId, { fullName, password, confirmations, fingerprint }) {
  return request(`/customer/contracts/${encodeURIComponent(contractId)}/sign`, { method: "POST", body: { full_name: fullName, password, confirmations, fingerprint } });
}

/** Identity check status and uploaded documents. */
export async function getMessages() {
  return request("/customer/messages");
}
export async function pollMessages(after = 0, peek = false) {
  return request(`/customer/messages/poll?after=${Number(after) || 0}${peek ? "&peek=1" : ""}`);
}
export async function sendMessage(body, replyTo = null) {
  return request("/customer/messages", { method: "POST", body: { body, reply_to: replyTo || undefined } });
}
export async function sendTyping() {
  return request("/customer/messages/typing", { method: "POST", body: {} });
}
export async function reactToMessage(messageId, emoji) {
  return request("/customer/messages/react", { method: "POST", body: { message_id: messageId, emoji: emoji || null } });
}
export async function startCall() {
  return request("/customer/calls", { method: "POST", body: {} });
}
export async function answerCall(id) {
  return request(`/customer/calls/${Number(id)}/answer`, { method: "POST", body: {} });
}
export async function endCall(id, decline = false) {
  return request(`/customer/calls/${Number(id)}/end`, { method: "POST", body: { decline } });
}
export async function setNotifyEmail(on) {
  return request("/customer/preferences", { method: "POST", body: { notify_email: Boolean(on) } });
}
export async function editMessage(id, body) {
  return request(`/customer/messages/${Number(id)}/edit`, { method: "POST", body: { body } });
}
export async function deleteMessage(id, scope = "me") {
  return request(`/customer/messages/${Number(id)}/delete`, { method: "POST", body: { scope } });
}
export async function getVerification() {
  return request("/customer/verification");
}
export async function uploadVerificationDocument(kind, file, expiresOn = "") {
  const form = new FormData();
  form.append("kind", kind);
  if (expiresOn) form.append("expires_on", expiresOn);
  form.append("file", file);
  return request("/customer/verification/documents", { method: "POST", body: form });
}

/** Step 1 of sign-in: e-mails a 6-digit code (the answer is the same for any address). */
export async function requestCode(email) {
  if (!ACCOUNTS_LIVE) throw new NotConnectedError("Signing in");
  return request("/customer/auth/request-code", { method: "POST", body: { email } });
}

/** Step 2 of sign-in: the code from the e-mail opens a session (an HttpOnly cookie). */
export async function verifyCode(email, code) {
  if (!ACCOUNTS_LIVE) throw new NotConnectedError("Signing in");
  return request("/customer/auth/verify", { method: "POST", body: { email, code } });
}
export const logIn = ({ email, code }) => verifyCode(email, code);

/** A signed-in diaspora customer asks to buy or rent, without re-entering their details. */
export async function submitPortalRequest({ propertyId, service, budget, preferredContact, message }) {
  if (!ACCOUNTS_LIVE) throw new NotConnectedError("Sending a request");
  return request("/customer/requests", { method: "POST", body: { property_id: propertyId, service, budget: budget || null, preferred_contact: preferredContact, message } });
}

/** The signed-in customer's own requests and where each one stands. */
export async function getPortalRequests() {
  if (!ACCOUNTS_LIVE) return [];
  return request("/customer/requests");
}

/** Full address of a portal file (receipt, signed agreement, construction photo). */
export function customerFileUrl(path) {
  return path && path.startsWith("/customer/") ? `${API_BASE}${path}` : null;
}

export async function logOut() {
  if (ACCOUNTS_LIVE) await request("/customer/auth/logout", { method: "POST" }).catch(() => {});
}

/** The signed-in customer, or null. Never throws for a visitor who is not logged in. */
export async function currentCustomer() {
  if (!ACCOUNTS_LIVE) return null;
  try { return await request("/customer/me"); }
  catch (error) { if (error.status === 401) return null; throw error; }
}

/** The adaptive portal: one account, sections for the services this customer uses. */
export async function getPortal() {
  if (!ACCOUNTS_LIVE) throw new NotConnectedError("The customer portal");
  return request("/customer/portal");
}

export function demoPortal(key) {
  return sample.DEMO_PORTALS[key] || null;
}
export const DEMO_PORTAL_KEYS = Object.keys(sample.DEMO_PORTALS);

/** General enquiry from the Contact page. No login needed. */
export async function submitEnquiry(details) {
  if (!CONNECTED || !ONLINE_ENQUIRIES) {
    const error = new NotConnectedError("Sending an enquiry online");
    if (CONNECTED) error.message = "Online enquiries are not open yet. Nothing has been sent; please contact MKUYU directly for now.";
    throw error;
  }
  return request("/public/enquiries", { method: "POST", body: details });
}

/**
 * Asks the AI assistant (a local model on the MKUYU server). The server gives
 * the model public information only. Throws when the assistant is off or
 * unavailable; the chatbot then answers with its own built-in replies.
 */
export async function askAssistant(message, history, lang) {
  if (!CONNECTED) throw new NotConnectedError("The AI assistant");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`${API_BASE}/public/chat`, {
      method: "POST",
      credentials: "omit",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, lang }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || typeof payload.reply !== "string") throw new ApiError(response.status, payload.error);
    return payload.reply;
  } finally {
    clearTimeout(timer);
  }
}
