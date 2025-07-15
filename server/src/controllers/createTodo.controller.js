// createTodo

import Todo from "../models/todo.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import codes from "../utils/codes.util.js";
import isEmpty from "../utils/isEmpty.util.js";

let createTodo = asyncHandler(async (req, res) => {
  const { title, description, dueDate, priority } = req.body;
  const uid = req.user?._id; // From token or middleware

  if (!uid) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          "Please login to start adding todos",
          codes.unauthorized
        ).res()
      );
  }

  if (isEmpty([title, description, dueDate, priority])) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse("Missing required fields", codes.badRequest).res()
      );
  }

  // let todoArray=[];

  // let todo={title:title,description:description,dueDate:dueDate,priority:priority};

  // todoArray.push(todo);}

  // 1. Create todo
  const todo = await Todo.create({
    title,
    description,
    dueDate,
    priority,
    createdBy: uid,
  });

  if (!todo) {
    return res
      .status(codes.internalServerError)
      .json(
        new ApiErrorResponse(
          "Todo creation failed",
          codes.internalServerError
        ).res()
      );
  }

  // 2. Link todo to user's todos list
  await User.findByIdAndUpdate(uid, {
    $push: { todos: todo._id },
  });

  return res
    .status(codes.created)
    .json(new ApiResponse("Todo added", codes.created, { todo }).res());
});

export default createTodo;
