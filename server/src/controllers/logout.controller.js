import User from "../models/user.model.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";

const logout = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          "Can't logout without login.",
          codes.unauthorized
        ).res()
      );
  }

  // Find the user by ID, email, or username
  const client = await User.findOne({
    $or: [
      { _id: req.user._id },
      { email: req.user.email },
      { userName: req.user.userName },
    ],
  });

  if (!client) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("User not found.", codes.notFound).res());
  }

  // Remove stored refresh token (if using one)
  client.token.refreshToken = null;
  await client.save();

  // Clear all cookies related to authentication
  for (let cookieName in req.cookies) {
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
  }

  return res
    .status(codes.ok)
    .json(new ApiResponse("Logged out successfully.", codes.ok).res());
});

export default logout;

// logout
