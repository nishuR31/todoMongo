import ApiErrorResponse from "./ApiErrorResponse.util.js";
import codes from "./codes.util.js";

let asyncHandler = (func) => async (req, res, next) => {
  try {
    return await func(req, res, next);
  } catch (err) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse (
          `Error occured : ${err.message || err}`,
          codes.badRequest,
          {},
          err
        ).res()
      ); 
  }
};

export default asyncHandler;
