import express from "express";
import dashboard from "../controllers/adminDashboard.controller.js";
import admins from "../controllers/admins.controller.js";
import signin from "../controllers/signin.controller.js";
import edit from "../controllers/edit.controller.js";
import adminSignup from "../controllers/admin.signup.controller.js";
import completeSignup from "../controllers/complete.signup.controller.js";
import logout from "../controllers/logout.controller.js";
import tokenRotation from "../controllers/token.rotation.controller.js";
import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

const adminRouter = express.Router();


adminRouter.get("/admin/dashboard", auth(true),role(true,["admin"]), dashboard);
adminRouter.get("/admins/dashboard", auth(true),role(true,["admin"]), admins);
adminRouter.post("/admin/signin", auth(false), role(false,["admin"]),signin);
adminRouter.post("/admin/signup", adminSignup,completeSignup);
adminRouter.patch("/admin/:id/edit", auth(true),role(true,["admin"]), edit);
adminRouter.post("/admin/logout", auth(true),role(true,["admin"]), logout);
adminRouter.post("/admin/token-rotation", auth(true),role(true,["admin"]), tokenRotation); 

export default adminRouter;
// adminRouter
