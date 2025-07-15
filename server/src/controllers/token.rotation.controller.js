import User from "../models/user.model.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";
import { accessToken, verifyRefresh } from "../utils/tokenization.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";

let tokenRotation = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res 
      .status(codes.unauthorized)
      .json(new ApiErrorResponse("Login required for token rotation.", codes.unauthorized).res());
  }
  let user = await User.findOne({
    $or: [
      { _id: req.user._id },
      { userName: req.user.userName },
      { email: req.user.email },
    ],
  });
  if (!user) {
  }
  let decoded;
  try {
    decoded = verifyRefresh(user.refreshToken);
  } catch (err) {
    return res
      .status(codes.internalServerError)
      .json(
        new ApiErrorResponse(
          "Verification of token failed",
          codes.internalServerError
        ).res()
      );
  }

  let payload = decoded;
  let _accessToken = accessToken(payload);
  return res.status(codes.ok).json(
    new ApiResponse("Token rotation executed successfully", codes.ok, {
      accessToken: _accessToken,
    }).res()
  );
});

export default tokenRotation;
// tokenRotation
