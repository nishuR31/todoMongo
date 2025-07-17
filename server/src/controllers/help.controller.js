import ApiResponse from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";

let helperPaths = `
Public Routes
GET    /api/v1/todo/profile/:username
POST   /api/v1/todo/signup {userName, email, fullName, password, role}
POST   /api/v1/todo/signin {userName|email, password, role}
GET     /api/v1/todo/logout
PATCH   /api/v1/todo/edit {newEmail, newUserName, newFullName, newPassword}
DELETE  /api/v1/todo/delete
POST    /api/v1/todo/token-rotation

Admin Routes
GET     /api/v1/todo/admin/dashboard
GET     /api/v1/todo/admins/dashboard 
PATCH   /api/v1/todo/admin/edit {newEmail, newUserName, newFullName, newPassword}
POST    /api/v1/todo/admin/logout
POST    /api/v1/todo/admin/token-rotation
POST   /api/v1/todo/admin/signup {userName, email, fullName, password, role}
POST   /api/v1/todo/admin/signin {userName|email, password, role}

Todo Routes
POST    /api/v1/todo/add
PATCH   /api/v1/todo/edit/:todoId
DELETE  /api/v1/todo/delete/:todoId

Utility Routes
POST    /api/v1/forgot-password {email}
POST    /api/v1/verify-otp {email,otp}
PATCH   /api/v1/change-password {email|userName, password}
POST    /api/v1/issue {email,detail}
`;

let help = asyncHandler(async (req, res) => {
  return res.status(codes.ok).json(new ApiResponse(helperPaths,codes.ok).res());
});

export default help;
