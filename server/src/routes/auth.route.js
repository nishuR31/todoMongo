import express from "express";

import forgotPassword from "../controllers/forgot.password.controller.js";
import verifyOtp from "../controllers/verify.otp.controller.js";
import changePassword from "../controllers/change.password.controller.js";
import issue from "../controllers/issue.controller.js";
import help from "../controllers/help.controller.js";

const authRouter = express.Router();
//["user", "admin"]

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-otp", verifyOtp);
authRouter.patch("/change-password", changePassword);
authRouter.post("/issue", issue);
authRouter.get("/help", help);
// authRouter
export default authRouter;
