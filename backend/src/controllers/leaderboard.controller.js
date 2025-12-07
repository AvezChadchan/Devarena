import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" })
    .select("username score")
    .sort({ score: -1 });
  if (!users) {
    throw new apiError(405, "Users not found");
  }
  const leaderboard = users.map((user, index) => ({
    rank: index + 1,
    username: user.username,
    score: user.score || 0,
  }));

  return res
    .status(200)
    .json(new apiResponse(200, leaderboard, "Leaderboard Fetched"));
});

export { getGlobalLeaderboard };
