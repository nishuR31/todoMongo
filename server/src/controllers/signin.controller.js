import User from "../models/user.model.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";
import isEmpty from "../utils/isEmpty.util.js";
import { tokenGeneration } from "../utils/tokenization.util.js";

let signin = asyncHandler(async (req, res) => {
  let { password, userName, email } = req.body;

  if (req.user && req.user.userName === userName) {
    return res
      .status(codes.found)
      .json(new ApiErrorResponse("User already logged in", codes.found).res());
  }

  if (isEmpty([password, userName, email])) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse("Some fields are missing", codes.badRequest).res()
      );
  }

  let client = await User.findOne({ $or: [{ userName }, { email }] });
  if (!client) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          "No user with credentials found, please register",
          codes.notFound
        ).res()
      );
  }

  if ( client.role !== req.user.role) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          "Unauthorized access detected",
          codes.unauthorized
        ).res()
      );
  }

  if (!client.comparePassword(password)) {
    return res
      .status(codes.conflict)
      .json(
        new ApiErrorResponse(
          "Wrong credentials,please try again",
          codes.conflict
        ).res()
      );
  }

  let payload = {
    _id: client._id,
    userName: client.userName,
    email: client.userName,
    role: client.role,
  };

  let { accessToken, refreshToken } = tokenGeneration(payload);
  res.cookie("accessToken", accessToken, cookieOptions("access"));
  res.cookie("refreshToken", refreshToken, cookieOptions("refresh"));
  client.token.refreshToken = refreshToken;
  await client.save();

  return res.status(codes.found).json(
    new ApiResponse(`Welcome ${client.userName}`, codes.found, {
      userName: client.userName,
      accessToken: accessToken,
    }).res()
  );
});

export default signin;

// signin;
