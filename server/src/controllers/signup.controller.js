import User from "../models/user.model.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";
import isEmpty from "../utils/isEmpty.util.js";

// signup;/

let signup = asyncHandler(async (req, res) => {

  let { userName, email, fullName, password, role } = req.body;
  if (isEmpty([userName, email, password, role])) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Some required fields are missing",
          codes.badRequest
        ).res()
      );
  }


  let user = await User.findOne({ $or: [{ email }, { userName }] });
  if (user) {
    return res
      .status(codes.conflict)
      .json(
        new ApiErrorResponse(
          `An existing user exists with  : ${
            userName === user.userName ? userName : user.email
          },Please login`,
          codes.found
        ).res()
      );
  }
  let client = await User.create({ userName, email, fullName, role, password });
  if (!client) {
    return res
      .status(codes.internalServerError)
      .json(
        new ApiErrorResponse(
          "Failed registration, please try again",
          codes.internalServerError
        ).res()
      );
  }
  return res.status(codes.created).json(
    new ApiResponse(`User registration successfull`, codes.created, {
      userName: client.userName,
      email: client.email,
    }).res()
  );
});

export default signup;
