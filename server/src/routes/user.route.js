import express from "express";
import {
  changePassword,
  createTodo,
  dashboard,
  deleteTodo,
  delUser,
  edit,
  editTodo,
  forgotPassword,
  login,
  logout,
  signup,
  tokenRotation,
  verifyOtp,
} from "../controllers/user.controller";
// import profile from "../controllers/profile.controller.js";
// import signin from "../controllers/signin.controller.js";
// import signup from "../controllers/signup.controller.js";
// import logout from "../controllers/logout.controller.js";
// import edit from "../controllers/edit.controller.js";
// import deletion from "../controllers/delete.controller.js";

// import auth from "../middlewares/auth.middleware.js";
// // import role from "../middlewares/role.middleware.js";
// import tokenRotation from "../controllers/token.rotation.controller.js";
// import role from "../middlewares/role.middleware.js";

const userRouter = express.Router();

userRouter.post("/create/todo", auth(true), role(true, ["user"]), createTodo); // public
userRouter.delete(
  "/delete/todo/:id",
  auth(true),
  role(true, ["user"]),
  deleteTodo
); // public
userRouter.patch("/edit/todo/:id", auth(true), role(true, ["user"]), editTodo); // public
userRouter.post("/signup", role(false, ["user"]), signup);
userRouter.post("/login", auth(false), role(false, ["user"]), login);
userRouter.get("/logout", auth(true), role(true, ["user"]), logout);
userRouter.patch("/edit", auth(true), role(true, ["user"]), edit);
userRouter.delete("/delete", auth(true), role(true, ["user"]), delUser);
userRouter.get(
  "/token-rotation",
  auth(true),
  role(true, ["user"]),
  tokenRotation
);

userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/verify-otp", verifyOtp);
userRouter.patch("/change-password", changePassword);

userRouter.post("/issue", issue);
userRouter.get("/help", help);
// authRouter
export default userRouter;

// userRouter;
