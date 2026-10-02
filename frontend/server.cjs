const express = require("express");
const path = require("path");
const httpProxy = require("http-proxy");

const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

const FRONTEND_DIR = path.join(__dirname, "dist");

// API proxy to backend
const apiProxy = httpProxy.createProxyServer({
  target: BACKEND_URL,
  changeOrigin: true,
});

app.use("/api", (req, res) => {
  req.url = "/api" + req.url;
  apiProxy.web(req, res);
});

// Public portal and unified admin SPA
app.use(express.static(FRONTEND_DIR));
app.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`REDES server running on http://0.0.0.0:${PORT}`);
  console.log(`  Public:  http://localhost:${PORT}/`);
  console.log(`  Admin:   http://localhost:${PORT}/admin/login`);
  console.log(`  API:     http://localhost:${PORT}/api (→ ${BACKEND_URL})`);
});
