import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = req.cookies?.accessToken || authHeader?.split(" ")[1];

    if (!token) {
      throw new apiError(403, "Unauthorized Request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new apiError(404, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new apiError(404, error?.message || "Invalid Access Token");
  }
});
