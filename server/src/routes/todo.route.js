import express from "express";
import createTodo from "../controllers/editTodo.controller.js";
import editTodo from "../controllers/createTodo.controller.js";
import deleteTodo from "../controllers/deleteTodo.controller.js";

import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

const todoRouter = express.Router();
// todoRouter.use();
todoRouter.post("/add",auth(true), role(["admin", "client"]), createTodo);
todoRouter.patch("/edit/:todoId", auth(true), role(["admin", "client"]),editTodo);
todoRouter.delete("/delete/:todoId",auth(true), role(["admin", "client"]), deleteTodo);

export default todoRouter;

// todoRouter
