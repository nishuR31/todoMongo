import ApiResponse from "../utils/ApiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import codes from "../utils/codes.util.js";

let helperPaths = `
Public Routes
GET    /api/v1/synergy/profile/:username
POST   /api/v1/synergy/signup {userName, email, fullName, password, role}
POST   /api/v1/synergy/signin {userName|email, password, role}
GET     /api/v1/synergy/logout
PATCH   /api/v1/synergy/edit {newEmail, newUserName, newFullName, newPassword}
DELETE  /api/v1/synergy/delete
POST    /api/v1/synergy/token-rotation

Admin Routes
GET     /api/v1/synergy/admin/dashboard
GET     /api/v1/synergy/admins/dashboard 
PATCH   /api/v1/synergy/admin/edit {newEmail, newUserName, newFullName, newPassword}
POST    /api/v1/synergy/admin/logout
POST    /api/v1/synergy/admin/token-rotation
POST   /api/v1/synergy/admin/signup {userName, email, fullName, password, role}
POST   /api/v1/synergy/admin/signin {userName|email, password, role}

Todo Routes
POST    /api/v1/synergy/todo/add
PATCH   /api/v1/synergy/todo/edit/:todoId
DELETE  /api/v1/synergy/todo/delete/:todoId

Utility Routes
POST    /api/v1/synergy/forgot-password {email}
POST    /api/v1/synergy/verify-otp {email,otp}
PATCH   /api/v1/synergy/change-password {email|userName, password}
POST    /api/v1/synergy/issue {email,detail}
`;

let help = asyncHandler(async (req, res) => {
  return res.status(codes.ok).json(new ApiResponse(helperPaths,codes.ok).res());
});

export default help;
