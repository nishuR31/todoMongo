import asyncHandler from "../utils/asyncHandler.util.js";
import User from "../models/user.model.js";
import { verifyAccess, verifyRefresh } from "../utils/tokenization.util.js"; // use correct methods
import codes from "../utils/codes.util.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";

const auth = (need = true) =>
  asyncHandler(async (req, res, next) => {
    req.user = null;
    let accessToken =
      req.headers?.authorization?.split(" ")[1] ||
      req.cookies?.accessToken;
    let refreshToken = req.cookies?.refreshToken;

    if (!accessToken || !refreshToken) {
      return need
        ? res
            .status(codes.unauthorized)
            .json(
              new ApiErrorResponse(
                "Missing authentication tokens",
                codes.unauthorized
              ).res()
            )
        : next();
    }

    let decodedAccess, decodedRefresh;

    try {
      decodedAccess = verifyAccess(accessToken);
    } catch (err) {
      return need
        ? res
            .status(codes.unauthorized)
            .json(
              new ApiErrorResponse(
                "Access token invalid or expired",
                codes.unauthorized,
                {},
                err
              ).res()
            )
        : next();
    }

    try {
      decodedRefresh = verifyRefresh(refreshToken);
    } catch (err) {
      return need
        ? res
            .status(codes.unauthorized)
            .json(
              new ApiErrorResponse(
                "Refresh token invalid or expired",
                codes.unauthorized,
                {},
                err
              ).res()
            )
        : next();
    }

    if (decodedAccess._id !== decodedRefresh._id) {
      return need
        ? res
            .status(codes.unauthorized)
            .json(
              new ApiErrorResponse(
                "Token identity mismatch",
                codes.unauthorized
              ).res()
            )
        : next();
    }

    const client = await User.findById(decodedRefresh._id);
    if (!client) {
      return need
        ? res
            .status(codes.notFound)
            .json(new ApiErrorResponse("User not found", codes.notFound).res())
        : next();
    }

    req.user = decodedRefresh;
    return next();
  });

export default auth;
