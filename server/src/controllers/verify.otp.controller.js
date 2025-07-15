import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";

let verifyOpt = asyncHandler(async (req, res) => {
  let { email, otp } = req.body;

  if (isEmpty([email, otp])) {
    return res
      .status(codes.badRequest)
      .json(new ApiErrorResponse("Mandatory fields are required").res());
  }

  let client = await User.findOne({ email });
  if (!client) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          `User with email : ${email} not found`,
          codes.notFound
        )
      );
  }
  if (!bcrypt.compare(otp, client.otp.code) || client.otp.expiry < Date.now()) {
    return res
      .status(codes.badRequest)
      .json(new ApiErrorResponse(`invalid or wrong otp`).res());
  }

  client.otp.verified = true;
  await client.save();

  return res
    .status(codes.ok)
    .json(new ApiResponse("Otp verified successfull", codes.ok).res());
});

export default verifyOpt;

// verifyOpt
