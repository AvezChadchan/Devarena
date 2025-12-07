import { Router } from "express";
import {
  addProblem,
  getAllProblems,
  updateProblem,
  deleteProblem,
  getProblemById,
} from "../controllers/problem.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router
  .route("/add-problem")
  .post(verifyJWT, authorizeRoles("admin"), addProblem);

router.route("/get-problem").get(getAllProblems);

router.route("/get-problem/:id").get(verifyJWT, getProblemById);
router
  .route("/update-problem/:id")
  .put(verifyJWT, authorizeRoles("admin"), updateProblem);
router
  .route("/delete-problem/:id")
  .delete(verifyJWT, authorizeRoles("admin"), deleteProblem);
export default router;
