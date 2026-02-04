import express from "express";
import cors from "cors";
import gameRoutes from "../backend/routes/game.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/game", gameRoutes);

export default app;
