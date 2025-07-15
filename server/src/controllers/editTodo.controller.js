import mongoose from "mongoose";
import Todo from "../models/todo.model.js";
import User from "../models/user.model.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";

let editTodo = asyncHandler(async (req, res) => {
  const { title, description, status, dueDate } = req.body;
  const { id } = req.query; // expected as ?id=todoId
  const userId = req.user?._id;

  // Check if todoId is valid
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse("Invalid or missing todo ID", codes.badRequest).res()
      );
  }

  // Find the user and ensure the todo belongs to them
  const user = await User.findById(userId);
  if (!user || !user.todos.includes(id)) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          "Todo does not belong to the user or user not found",
          codes.unauthorized
        ).res()
      );
  }

  // Update the todo
  const updatedTodo = await Todo.findByIdAndUpdate(
    id,
    { title, description, status, dueDate },
    { new: true, validateBeforeSave: false }
  );

  if (!updatedTodo) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("Todo not found", codes.notFound).res());
  }

  return res
    .status(codes.accepted)
    .json(
      new ApiResponse("Todo updated successfully", codes.accepted, {
        todo: updatedTodo,
      }).res()
    );
});

export default editTodo;
