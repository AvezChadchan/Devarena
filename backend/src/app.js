import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
app.use("/api/v1/auth", userRouter);

import problemRouter from "./routes/problem.routes.js";
app.use("/api/v1/problem", problemRouter);

import submissionRouter from "./routes/submission.routes.js";
app.use("/api/v1/submission", submissionRouter);

import leaderboardRouter from "./routes/leaderboard.routes.js";
app.use("/api/v1/leaderboard", leaderboardRouter);

import contestRouter from "./routes/contest.routes.js";
app.use("/api/v1/contest", contestRouter);

export { app };
