import { Router } from "express";
import { getGlobalLeaderboard } from "../controllers/leaderboard.controller.js";

const router = Router();

router.route("/global-leaderboard").get(getGlobalLeaderboard);

export default router;
