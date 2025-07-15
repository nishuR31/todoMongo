import express from "express";
import profile from "../controllers/profile.controller.js";
import signin from "../controllers/signin.controller.js";
import signup from "../controllers/signup.controller.js";
import logout from "../controllers/logout.controller.js";
import edit from "../controllers/edit.controller.js";
import deletion from "../controllers/delete.controller.js";

import auth from "../middlewares/auth.middleware.js";
// import role from "../middlewares/role.middleware.js";
import tokenRotation from "../controllers/token.rotation.controller.js";
import role from "../middlewares/role.middleware.js";

const userRouter = express.Router();



userRouter.get(
  "/profile/:username",
  auth(false),
  role(false, ["user"]),
  profile
); // public
userRouter.post("/signup",role(false,["user"]), signup);
userRouter.post("/signin", auth(false), role(false, ["user"]), signin);
userRouter.get("/logout", auth(true), role(true, ["user"]), logout);
userRouter.patch("/edit", auth(true), role(true, ["user"]), edit);
userRouter.delete("/delete", auth(true), role(true, ["user"]), deletion);
userRouter.get(
  "/token-rotation",
  auth(true),
  role(true, ["user"]),
  tokenRotation
);
export default userRouter;

// userRouter;
