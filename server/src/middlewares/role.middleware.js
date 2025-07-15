import asyncHandler from "../utils/asyncHandler.util.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import codes from "../utils/codes.util.js";

const role = (need = true, allowedRoles = []) =>
  asyncHandler(async (req, res, next) => {
    // If auth was optional and user is not logged in — skip role checks
    if (!req.user) {
      return need
        ? res
            .status(codes.unauthorized)
            .json(
              new ApiErrorResponse(
                "unauthorized access detected",
                codes.un
              ).res()
            )
        : next(); // Public access route
    }

    // Support both single string role or array of roles
    const roles = Array.isArray(req.user.role)
      ? req.user.role
      : [req.user.role];

    const userHasAccess = roles.some((role) => allowedRoles.includes(role));

    if (!userHasAccess) {
      return res
        .status(codes.forbidden)
        .json(
          new ApiErrorResponse(
            "Role access denied. Insufficient permissions.",
            codes.forbidden
          ).res()
        );
    }

    next();
  });

export default role;
