import User from "../models/user.model.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";
import { expiry, OTP } from "../utils/otp.util.js";
import sendMail from "../utils/sendMail.util.js";

let forgotPassword = asyncHandler(async (req, res) => {
  let { userName, email } = req.body;
  if (!(email || userName)) {
    return res
      .status(codes.badRequest)
      .json(new ApiErrorResponse("Either email or username is required").res());
  }
  let client = userName
    ? await User.findOne({ userName })
    : await User.findOne({ email });

  if (!client) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          `Account with ${userName ? userName : email} cannot be found.`,
          codes.notFound
        )
      );
  }

  let otp = OTP();
  client.otp.code = await bcrypt.hash(otp, 10);
  client.otp.expiry = expiry();
  await sendMail(client.email, client.userName, otp);
  return res
    .status(codes.accepted)
    .json(
      new ApiResponse(
        `OTP send in your mail : ${client.email}`,
        codes.accepted
      ).res()
    );
});

export default forgotPassword;
// forgotPassword
