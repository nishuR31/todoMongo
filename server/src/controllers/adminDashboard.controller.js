import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";

let adminDashboard = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse("Admin login required to reach dashboard.", codes.unauthorized).res()
      );
  }
  let admin = await User.findOne({
    $: [
      { userName: req.user.userName },
      { email: req.user.email },
      { _id: req.user._id },
    ],
  });
  if (!admin) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          "Admin not found,please register or try again",
          codes.notFound
        ).res()
      );
  }
  return res.status(codes.found).json(
    new ApiResponse(`Welcome aboard ${admin.userName} dashboard`, codes.found, {
      _id: admin._id,
      userName: admin.userName,
      email: admin.email,
      fullName: admin.fullName,
      todos: admin.todos,
      lastLogin: admin.lastLogin,
      active: admin.active,
      createdAt: admin.createdAt,
      role: admin.role,
    }).res()
  );
});

export default adminDashboard;

// adminDashboard
