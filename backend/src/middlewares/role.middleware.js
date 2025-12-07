import { apiError } from "../utils/apiError.js";

export const authorizeRoles = (...allowedRoles) => {
  return (req, _, next) => {
    if (!req.user) {
      throw new apiError(401, "Unauthorized");
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new apiError(403, "Fobidden: Access Denied");
    }
    next();
  };
};
