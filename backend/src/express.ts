import express from "express";
import cors from "cors";

import GameManager from "./core/GameManager";

const app = express();

app.use(cors());
// for getting game list initially
app.get("/list", (_, res) => {
  res.json({ gameIds: Object.keys(GameManager.games) });
});
app.get("/", (_, res) => {
  res.status(200).setHeader("Content-Type", "text/plain").send("OK");
});

export default app;
