// Local preview server for the public website: `node serve.mjs` then open
// http://localhost:5600. Browsers refuse JavaScript modules on pages opened
// straight from disk (file://), so the site needs to be served over HTTP.
// No dependencies; serves only files inside this folder.
//
// Requests to /api/... are passed on to the MKUYU staff server (port 3003,
// API_TARGET to change it), so the whole site works through ONE address -
// for example an ngrok tunnel to this port, to open the site on a phone.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 5600;
const apiTarget = new URL(process.env.API_TARGET || "http://localhost:3003");
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".md": "text/plain; charset=utf-8",
};

/** Passes an /api/ request to the staff server, as if made on that server. */
function proxy(req, res) {
  const headers = { ...req.headers, host: apiTarget.host };
  delete headers.origin; // same site, not a cross-origin call
  delete headers.referer;
  const upstream = http.request({ hostname: apiTarget.hostname, port: apiTarget.port, path: req.url, method: req.method, headers }, (answer) => {
    res.writeHead(answer.statusCode || 502, answer.headers);
    answer.pipe(res);
  });
  upstream.on("error", () => { if (!res.headersSent) res.writeHead(502, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "The MKUYU system is not running. Start it with start-mkuyu.bat." })); });
  req.pipe(upstream);
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) { proxy(req, res); return; }
  let file;
  try { file = path.normalize(path.join(root, decodeURIComponent(url.pathname))); } catch { res.writeHead(400).end("Bad request"); return; }
  // Stay inside this folder (the trailing separator stops a sibling like "mkuyu_ui2"), and
  // never hand out dot-files, the server itself, scripts for Windows, or working folders.
  const relative = path.relative(root, file);
  const hidden = relative.split(path.sep).some((part) => part.startsWith(".") || ["node_modules", "design-source", "docs"].includes(part));
  if (relative.startsWith("..") || path.isAbsolute(relative) || hidden || /\.(mjs|bat|cmd|md|jfif)$/i.test(relative) && !/^assets[\\/]/.test(relative)) { res.writeHead(403, { "Content-Type": "text/plain" }).end("Forbidden"); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  fs.readFile(file, (error, body) => {
    if (error) { res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found"); return; }
    res.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin", "X-Frame-Options": "SAMEORIGIN" }).end(body);
  });
}).listen(port, () => console.log(`MKUYU public site: http://localhost:${port}`));
