const cors = require("cors");
const express = require("express");
const path = require("path");

const apiRoutes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json({ limit: "8mb" }));
app.use("/static", express.static(path.join(__dirname, "..", "public")));

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "API funcionando correctamente"
  });
});

app.use("/api", apiRoutes);
app.use(errorHandler);

module.exports = app;
