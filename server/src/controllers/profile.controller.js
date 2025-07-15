import asyncHandler from "../utils/asyncHandler.util.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import codes from "../utils/codes.util.js";
import User from "../models/user.model.js";

// profile

let profile = asyncHandler(async (req, res) => {
  let { username } = req.params;
  let user = await User.findOne({ userName: username });
  if (!user) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          `No user found with username : ${username}`,
          codes.notFound
        ).res()
      );
  }

  return req.user
    ? req.user.userName === username
      ? res.status(codes.found).json(
          new ApiResponse(`Welcome  ${username}`, codes.found, {
            userName: user.userName,
            fullname: user.fullName,
            email: user.email,
            _id: user._id,
          }).res()
        )
      : res.status(codes.found).json(
          new ApiResponse(`User found : ${username}`, codes.found, {
            userName: user.userName,
            fullname: user.fullName,
            email: hideEmail(user.email),
          }).res()
        )
    : res.status(codes.found).json(
        new ApiResponse(`User on sight: ${username}`, codes.found, {
          userName: user.userName,
          fullname: user.fullName,
        }).res()
      );
});

export default profile;
