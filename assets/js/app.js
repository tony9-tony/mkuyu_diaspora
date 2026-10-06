/* MKUYU Diaspora Portal — entry point. Sets up the page chrome, then loads the
   module for the current page (named by <body data-page="...">). */
import { ACCOUNTS_LIVE, currentCustomer } from "./api.js";
import { initChrome } from "./ui.js";

document.addEventListener("DOMContentLoaded", async () => {
  initChrome();
  markSignedIn();
  const page = document.body.dataset.page;
  if (!page) return;
  try {
    const module = await import(`./pages/${page}.js`);
    await module.default?.();
  } catch (error) {
    console.error(`[mkuyu] the "${page}" page failed to start`, error);
  }
});

/* A signed-in customer sees "My portal" instead of "Sign in". */
async function markSignedIn() {
  if (!ACCOUNTS_LIVE) return;
  try {
    const customer = await currentCustomer();
    if (!customer) return;
    document.querySelectorAll("a.nav-diaspora").forEach((link) => { link.textContent = "My portal"; link.href = "portal.html"; link.classList.add("is-signed-in"); });
  } catch { /* not signed in */ }
}
