const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;
const BUILD_DIR = path.join(__dirname, "dist");

app.use(express.static(BUILD_DIR));

app.get("*", (req, res) => {
  res.sendFile(path.join(BUILD_DIR, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Admin server running on http://0.0.0.0:${PORT}`);
});
