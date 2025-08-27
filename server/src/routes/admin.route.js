import express from "express";
// import dashboard from "../controllers/adminDashboard.controller.js";
// import admins from "../controllers/admins.controller.js";
// import signin from "../controllers/signin.controller.js";
// import edit from "../controllers/edit.controller.js";
import {
  admins,
  createTodo,
  dashboard,
  deleteTodo,
  delUser,
  edit,
  editTodo,
  login,
  logout,
  tokenRotation,
} from "../controllers/user.controller.js";
// import logout from "../controllers/logout.controller.js";
// import tokenRotation from "../controllers/token.rotation.controller.js";
import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

const adminRouter = express.Router();

adminRouter.get("/dashboard", auth(true), role(true, ["admin"]), dashboard);
adminRouter.get(
  "/admins",
  auth(true),
  role(true, ["admin", "superAdmin"]),
  admins
);
adminRouter.post("/create/todo", auth(true), role(true, ["admin"]), createTodo);
adminRouter.delete(
  "/delete/todo/:id",
  auth(true),
  role(true, ["admin"]),
  deleteTodo
);
adminRouter.patch(
  "/edit/todo/:id",
  auth(true),
  role(true, ["admin"]),
  editTodo
);
adminRouter.get("/delete", auth(true), role(true, ["admin"]), delUser);
adminRouter.post("/login", auth(false), role(false, ["admin"]), login);
adminRouter.post("/signup", adminOtp, signup);
adminRouter.patch("/edit", auth(true), role(true, ["admin"]), edit);
adminRouter.get("/logout", auth(false), role(true, ["admin"]), logout);
adminRouter.get(
  "/token-rotation",
  auth(true),
  role(true, ["admin"]),
  tokenRotation
);
adminRouter.post("/issue", issue);
adminRouter.get("/help", help);

export default adminRouter;
// adminRouter
