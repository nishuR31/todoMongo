import Todo from "../models/todo.model.js";
import User from "../models/user.model.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";

let deletion = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          "Login required to delete account",
          codes.unauthorized
        ).res()
      );
  }

  // Find and delete user
  const deletedUser = await User.findOneAndDelete({
    $or: [
      { _id: req.user._id },
      { email: req.user.email },
      { userName: req.user.userName },
    ],
  });

  if (!deletedUser) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          "User cannot be deleted, account not found",
          codes.notFound
        ).res()
      );
  }

  // Bulk delete all todos associated with the user
  if (Array.isArray(deletedUser.todos) && deletedUser.todos.length > 0) {
    await Todo.deleteMany({ _id: { $in: deletedUser.todos } });
  }

  return res.status(codes.ok).json(
    new ApiResponse("Account deleted successfully", codes.ok, {
      userName: deletedUser.userName,
    }).res()
  );
});

export default deletion;
