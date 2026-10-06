# MKUYU Diaspora Portal

Separate website for MKUYU customers living abroad: home, sign up, sign in and the customer portal
(messages, video calls, requests, legal status, ownership transfer, project progress).
It is independent of the Tanzania public website (`mkuyu_ui`) and talks to the same MKUYU system API.

Run: `node serve.mjs` then open http://localhost:5600 (the system must run on port 3003; use `API_TARGET` to change it).

Online: set `PUBLIC_SITE_ORIGINS` (this site's address) and `DIASPORA_SITE_URL` in the system's `.env`, so e-mails link here.
