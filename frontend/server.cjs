const express = require("express");
const path = require("path");
const httpProxy = require("http-proxy");

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

const FRONTEND_DIR = path.join(__dirname, "dist");
const ADMIN_DIR = path.join(__dirname, "admin-dist");

// API proxy to backend
const apiProxy = httpProxy.createProxyServer({
  target: BACKEND_URL,
  changeOrigin: true,
});

app.use("/api", (req, res) => {
  req.url = "/api" + req.url;
  apiProxy.web(req, res);
});

// Admin panel at /admin
app.use("/admin", express.static(ADMIN_DIR));
app.get("/admin", (_req, res) => {
  res.sendFile(path.join(ADMIN_DIR, "index.html"));
});
app.get("/admin/*", (_req, res) => {
  res.sendFile(path.join(ADMIN_DIR, "index.html"));
});

// Public frontend (catches everything else)
app.use(express.static(FRONTEND_DIR));
app.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`REDES server running on http://0.0.0.0:${PORT}`);
  console.log(`  Public:  http://localhost:${PORT}/`);
  console.log(`  Admin:   http://localhost:${PORT}/admin`);
  console.log(`  API:     http://localhost:${PORT}/api (→ ${BACKEND_URL})`);
});
