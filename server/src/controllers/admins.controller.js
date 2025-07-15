import User from "../models/user.model.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";

const admins = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse("Admin login required", codes.unauthorized).res()
      );
  }

  // Optional: ensure only admins can view this route
  const userRoles = Array.isArray(req.user.role)
    ? req.user.role
    : [req.user.role];
  if (!userRoles.includes("admin")) {
    return res
      .status(codes.forbidden)
      .json(
        new ApiErrorResponse(
          "Access denied. Admins only.",
          codes.forbidden
        ).res()
      );
  }

  const users = await User.aggregate([
    { $match: { roles: "admin" } }, // not $roles
    { $project: { userName: 1, email: 1, _id: 1 } },
  ]);

  if (!users.length) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("No admins found.", codes.notFound).res());
  }

  return res.status(codes.success).json(
    new ApiResponse("Admins retrieved successfully", codes.success, {
      admins: users,
    }).res()
  );
});

export default admins;
// admins
