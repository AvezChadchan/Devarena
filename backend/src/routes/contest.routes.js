import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createContest,
  getContestDetail,
  getContestLeaderboard,
  getContestParticipants,
  getContests,
  getUserContests,
  joinContest,
} from "../controllers/contest.controller.js";
const router = Router();
router.route("/create").post(verifyJWT, authorizeRoles("admin"), createContest);
router.route("/get-contests").get(getContests);
router.route("/get-contest-details/:id").get(getContestDetail);

router.route("/:id/join-contest").post(verifyJWT, joinContest);

router
  .route("/:id/get-contest-participants")
  .get(verifyJWT, authorizeRoles("admin"), getContestParticipants);

router.route("/my/contests").get(verifyJWT, getUserContests);

router.route("/get-contest-leaderboard/:id").get(getContestLeaderboard);

export default router;
