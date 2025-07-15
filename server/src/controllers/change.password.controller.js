import User from "../models/user.model.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";

let changePassword = asyncHandler(async (req, res) => {
  let { userName, password, email } = req.body;
  if (isEmpty([password]) || !(userName || email)) {
    return res
      .status(codes.badRequest)
      .json(new ApiErrorResponse("Mandatory fields are required").res());
  }

  let client = await User.findOne({ $or: [{ userName }, { email }] });
  if (!client) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          "User with given userName is not found",
          codes.notFound
        ).res()
      );
  }

  if (!client.otp.verified) {
    return res
      .status(codes.badRequest)
      .json(new ApiErrorResponse("OTP not verified", codes.badRequest).res());
  }

  client.password = password;
  client.otp.code = null;
  client.otp.expiry = null;
  client.otp.verified = false;
  await client.save();

  return res
    .status(codes.ok)
    .json(new ApiResponse("Password successfully changed.").res());
});

export default changePassword;
// changePassword.
