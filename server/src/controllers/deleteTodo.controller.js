import mongoose from "mongoose";
import Todo from "../models/todo.model.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";

let deleteTodo = asyncHandler(async (req, res) => {
  let { id } = req.query; //todo?id=id
  let { _id, email, userName } = req.user;
  if (!id || mongoose.Object.Types.isValid(id)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse("Id is invalid or missing", codes.badRequest).res()
      );
  }

  if (!req.user) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          "Cannot delete without login",
          codes.unauthorized
        ).res()
      );
  }

  let client = await User.findOne({ $or: [{ _id }, { email }, { userName }] });
  if (!client) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          "Client not found, try again or register",
          codes.notFound
        ).res()
      );
  }

  let todo_id = client.todos.filter((_id) => _id === id)[0];
  if (!todo_id) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          "Todo id cannot be found or dont exists",
          codes.notFound
        ).res()
      );
  }

  let todo = await Todo.findByIdAndDelete({ _id: todo_id });

  if (!todo) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          "Cannot found and delete todo",
          codes.notFound
        ).res()
      );
  }

  return res.status(codes.accepted).json(
    new ApiResponse("Todo data successfully deleted", codes.accepted, {
      todo: todo,
    }).res()
  );
});
// deleteTodo
export default deleteTodo;
