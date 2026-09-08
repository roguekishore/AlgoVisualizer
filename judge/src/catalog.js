const express = require("express");
const cors = require("cors");
const problemsRouter = require("./routes/problems");

const app = express();

const ALLOWED_ORIGIN = process.env.CATALOG_ALLOWED_ORIGIN || "*";
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "catalog" });
});

app.use("/api", problemsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Catalog service listening on port ${PORT}`);
});
