/* ==========================================================================
   MKUYU AFRICA — public site configuration
   --------------------------------------------------------------------------
   The internal MKUYU system is the single source of truth. The Sales Officer
   manages properties, prices and availability there; this website only
   displays what it is given.

       Sales Officer → Internal MKUYU System → Public API → this website

   API_BASE
     Where the internal system's API is served. Locally that is the staff
     server on port 3003; online it becomes e.g. "https://mkuyu.co.tz/api/v1".
     Set to "" to run in PREVIEW MODE on the clearly labelled sample catalogue
     in data.js, with nothing a visitor submits sent anywhere.

     The endpoints the site expects are documented in docs/PUBLIC-API.md.
   ========================================================================== */

// On this computer the site talks to the staff server directly. Opened from
// anywhere else (a phone through ngrok, or the live domain) it uses the same
// address it was loaded from: serve.mjs passes /api/ on to the staff server.
const LOCAL = ["localhost", "127.0.0.1"].includes(window.location.hostname);
export const API_BASE = devOverride() ?? (LOCAL ? "http://localhost:3003/api/v1" : `${window.location.origin}/api/v1`);

/* Developers only: on a localhost page, localStorage "mkuyu-api-base" points
   the site at another server (for example a test server). Ignored everywhere
   else, so visitors can never be redirected. */
function devOverride() {
  try {
    if (!["localhost", "127.0.0.1"].includes(window.location.hostname)) return null;
    const value = window.localStorage.getItem("mkuyu-api-base");
    return value && /^http:\/\/(localhost|127\.0\.0\.1):\d+\/api\/v1$/.test(value) ? value : null;
  } catch { return null; }
}

/* Customer accounts are for DIASPORA customers only (Miliki Ardhi Diaspora).
   Sales marks a client as diaspora in the internal system and invites them;
   they sign in on login.html with a one-time code sent to their e-mail, no
   password. Everyone else still rents, buys and sells without an account.
   There is no self sign-up. The sample portal (portal.html?demo=...) remains. */
export const CUSTOMER_ACCOUNTS = true;

/* Rent/Buy requests and Contact enquiries: live, as Leads for Sales. */
export const ONLINE_ENQUIRIES = true;

/* --------------------------------------------------------------------------
   UNDECIDED business rules. Each is kept as a single switch so the final
   decision is a one-line change, not a rewrite.
   -------------------------------------------------------------------------- */

/* A property that is temporarily held while a transaction is processed.
   Whether "reserved" is used at all, and whether the public may see it, is
   still being decided.
     "hide"  - reserved properties are not listed (current default)
     "show"  - listed, marked Reserved, with the request action disabled   */
export const RESERVED_ON_WEBSITE = "hide";

/* Currency used when a property record does not state its own. Whether MKUYU
   also prices in USD is undecided; a record carrying `currency` overrides it. */
export const DEFAULT_CURRENCY = "TZS";
