import codes from "../utils/codes.util.js";
import ApiErrorResponse from "../utils/apiErrorResponse.util.js";
import ApiResponse from "../utils/apiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { otp } from "../utils/OTP.util.js";
import cookieOptions from "../utils/cookieOptions.util.js";
import isEmpty from "../utils/isEmpty.util.js";
import sendMail from "../utils/sendMail.util.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import Todo from "../models/todo.model.js";
import { accessToken, tokenGeneration } from "../utils/tokenization.util.js";

////////////////////////admin otp

export const adminOtp = asyncHandler(async (req, res) => {
  let superAdmin = await User.findOne({
    userName: "todoMongo",
    role: { $in: ["superAdmin"] },
  });

  let otpCode = otp();
  superAdmin.otp.code = await bcrypt.hash(otpCode, 10);
  superAdmin.otp.expiry = Date.now() + 5 * 1000 * 60; //5min
  await superAdmin.save();
  await sendMail(superAdmin.email, userName, otpCode);
  return next();
});

//-----------------------------dashboard
export const dashboard = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          " Login required to reach  dashboard.",
          codes.unauthorized
        ).res()
      );
  }
  let user = await User.findOne({
    //or: [
    $or: [
      { userName: req.user.userName },
      { email: req.user.email },
      { _id: req.user._id },
    ],
  });
  if (!user) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          "User not found,please register or try again",
          codes.notFound
        ).res()
      );
  }

  return res.status(codes.found).json(
    new ApiResponse(`Welcome aboard ${user.userName}`, codes.found, {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      fullName: user.fullName,
      todos: user.todos,
      lastLogin: user.lastLogin,
      active: user.active,
      createdAt: user.createdAt,
      role: user.role,
    }).res()
  );
});

////////////////////////admins

export const admins = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          "Login required to get all admins.",
          codes.unauthorized
        ).res()
      );
  }

  // Optional: ensure only admins can view this route

  if (!req.user.role.includes("admin")) {
    return res
      .status(codes.forbidden)
      .json(
        new ApiErrorResponse(
          "Access denied. Admins only.",
          codes.forbidden
        ).res()
      );
  }

  const users = await User.aggregate([
    { $match: { role: "admin" } }, // not $roles
    { $project: { userName: 1, email: 1, _id: 1, firstName: 1, email: 1 } },
  ]);

  if (!users.length) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("No admins found.", codes.notFound).res());
  }

  return res.status(codes.success).json(
    new ApiResponse("Admins retrieved successfully", codes.success, {
      admins: users,
    }).res()
  );
});

///////////////////////signup
export const signup = asyncHandler(async (req, res) => {
  let { otp, userName, email, fullName, password, role } = req.body;

  let superAdmin =
    (await role) === "admin"
      ? User.findOne({
          userName: "todoMongo",
          role: "superAdmin",
        })
      : null;

  if (role === "admin" && !bcrypt.compare(otp, superAdmin.otp.code)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Opt mismatched. Please try again.",
          codes.badRequest
        ).res()
      );
  }

  let user = await User.create({ userName, email, fullName, password, role });

  if (!user) {
    return res
      .status(codes.internalServerError)
      .json(
        new ApiErrorResponse(
          "User registration failed",
          codes.internalServerError
        ).res()
      );
  }

  return res.status(codes.created).json(
    new ApiResponse("User registered successfully.", codes.created, {
      user,
    }).res()
  );
});

///////////////////////////////////logout

export const logout = asyncHandler(async (req, res) => {
  // Clear all cookies related to authentication
  for (let cookieName in req.cookies) {
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });
  }

  if (req.user) {
    let user = await User.find({
      $or: [
        { email: req.user.email },
        { userName: req.user.userName },
        { _id: req.user._id },
      ],
    });
    user.refreshToken = null;
    await user.save();
  }

  return res
    .status(codes.ok)
    .json(
      new ApiResponse(
        `${(req.user, userName ?? "You are")} logged out successfully.`,
        codes.ok
      ).res()
    );
});

////////////////////////////////change pass

export const changePassword = asyncHandler(async (req, res) => {
  let { userName, password, email } = req.body;
  if (isEmpty([password]) || !(userName || email)) {
    return res
      .status(codes.badRequest)
      .json(new ApiErrorResponse("Mandatory fields are required").res());
  }

  let client = await User.findOne({ $or: [{ userName }, { email }] });
  if (!client) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          "User with given credentials is not found",
          codes.notFound
        ).res()
      );
  }

  if (!client.otp.verified) {
    return res
      .status(codes.badRequest)
      .json(new ApiErrorResponse("OTP not verified", codes.badRequest).res());
  }

  client.password = password;
  client.otp.code = null;
  client.otp.expiry = null;
  client.otp.verified = false;
  await client.save();

  return res
    .status(codes.ok)
    .json(new ApiResponse("Password successfully changed.", codes.ok).res());
});

///////////////////////////create todo

export const createTodo = asyncHandler(async (req, res) => {
  const { title, description, dueDate, priority } = req.body;

  if (!req.user) {
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

  // let todoArray = [];

  // let todoData = {
  //   title: title,
  //   description: description,
  //   dueDate: dueDate,
  //   priority: priority,
  // };

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

  return res.status(codes.created).json(
    new ApiResponse(`Todo creation was successful.`, codes.created, {
      todo,
    }).res()
  );
});

///////////////////////////////delete
export const delUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          "Login required to delete account",
          codes.unauthorized
        ).res()
      );
  }

  // Find and delete user
  const deletedUser = await User.findOneAndDelete({
    $or: [
      { _id: req.user._id },
      { email: req.user.email },
      { userName: req.user.userName },
    ],
  });

  if (!deletedUser) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          "User cannot be deleted, account not found or already deleted.",
          codes.notFound
        ).res()
      );
  }

  // Bulk delete all todos associated with the user
  if (Array.isArray(deletedUser.todos) && deletedUser.todos.length > 0) {
    await Todo.deleteMany({ _id: { $in: deletedUser.todos } });
  }

  return res.status(codes.ok).json(
    new ApiResponse("Account deleted successfully with todos.", codes.ok, {
      userName: deletedUser.userName,
    }).res()
  );
});

//////////////////////////////////////////delete todo

export const deleteTodo = asyncHandler(async (req, res) => {
  let { id } = req.params; //todo?id=id
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
          "Cannot delete todo without login",
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
      .json(new ApiErrorResponse("Todo not found", codes.notFound).res());
  }

  return res.status(codes.accepted).json(
    new ApiResponse("Todo successfully deleted", codes.accepted, {
      todo,
    }).res()
  );
});

////////////////////////////////////edit

export const edit = asyncHandler(async (req, res) => {
  let { newEmail, newUserName, newFirstName, newLastName, newPassword } =
    req.body;
  let { email, _id, role, userName } = req.user;

  if (!req.user) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          "User not logged in, cannot edit",
          codes.unauthorized
        ).res()
      );
  }

  let client = await User.findOne({ $or: [{ _id }, { userName }, { email }] });
  if (!client) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("User dont exists.", codes.notFound).res());
  }

  let sameEmail = newEmail === client.email;
  let samePassword = bcrypt.compare(newPassword, client.password);
  let sameFirstName = newFirstName === client.firstName;
  let sameLastName = newLastName === client.lastName;
  let sameUserName = newUserName === client.userName;

  if (!/\w/.text(newPassword)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must have characters.",
          codes.badRequest
        ).res()
      );
  }
  if (!/[a-z]/.text(newPassword)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must have lowercase characters.",
          codes.badRequest
        ).res()
      );
  }
  if (!/[A-Z]/.text(newPassword)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must have uppercase characters.",
          codes.badRequest
        ).res()
      );
  }
  if (!/\d/.text(newPassword)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must have digits.",
          codes.badRequest
        ).res()
      );
  }
  if (!/\W/.text(newPassword)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Password must have speacial characters.",
          codes.badRequest
        ).res()
      );
  }

  if (
    sameEmail &&
    sameFirstName &&
    sameLastName &&
    samePassword &&
    sameUserName
  ) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "No data has been altered,please provide new data.",
          codes.badRequest
        ).res()
      );
  }

  if (!sameUserName) {
    let user = await User.findOne({ userName: newUserName });
    if (user) {
      return res
        .status(codes.conflict)
        .json(
          new ApiErrorResponse(
            "This username is already in use",
            codes.conflict
          ).res()
        );
    }
    client.userName = newUserName;
  }

  if (!sameEmail) {
    let user = await User.findOne({ email: newEmail });
    if (user) {
      return res
        .status(codes.conflict)
        .json(
          new ApiErrorResponse(
            "This email is already in use",
            codes.conflict
          ).res()
        );
    }
    client.email = newEmail;
  }

  if (!sameFirstName) {
    let user = await User.findOne({ fullName: newFirstName });
    if (user) {
      return res
        .status(codes.conflict)
        .json(new ApiErrorResponse("This fullName is already in use").res());
    }
    client.userName = newFullName;
  }

  if (samePassword) {
    return res
      .status(codes.conflict)
      .json(
        new ApiErrorResponse(
          "New password must be different from previous one",
          codes.conflict
        ).res()
      );
  }

  client.password = newPassword;
  client.refreshToken = null;
  await client.save();

  // Clear all cookies related to authentication
  for (let cookieName in req.cookies) {
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });
  }

  return res
    .status(codes.accepted)
    .json(
      new ApiResponse(
        "Credentials successfully updated, please login.",
        codes.accepted
      ).res()
    );
});

/////////////////////edit todo

export const editTodo = asyncHandler(async (req, res) => {
  const { title, description, status, dueDate } = req.body;
  const { id } = req.params; // expected as ?id=todoId
  const userId = req.user?._id;

  // Check if todoId is valid
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(
          "Invalid or missing todo ID",
          codes.badRequest
        ).res()
      );
  }

  // Find the user and ensure the todo belongs to them
  const user = await User.findById(userId);
  if (!user || !user.todos.includes(id)) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          "Todo does not belong to the user or user not found",
          codes.unauthorized
        ).res()
      );
  }

  // Update the todo
  const updatedTodo = await Todo.findByIdAndUpdate(
    id,
    { title, description, status, dueDate },
    { new: true, validateBeforeSave: false }
  );

  if (!updatedTodo) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("Todo not found", codes.notFound).res());
  }

  return res.status(codes.accepted).json(
    new ApiResponse("Todo updated successfully", codes.accepted, {
      todo: updatedTodo,
    }).res()
  );
});

////////////////////////forgotpass

export const forgotPassword = asyncHandler(async (req, res) => {
  let { userName, email } = req.body;
  if (!(email || userName)) {
    return res
      .status(codes.badRequest)
      .json(new ApiErrorResponse("Either email or username is required").res());
  }
  let client = await User.findOne({ $or: [{ userName }, { email }] });

  if (!client) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          `Account with ${userName ? userName : email} cannot be found.`,
          codes.notFound
        )
      );
  }

  let otpCode = otp();
  client.otp.code = await bcrypt.hash(otpCode, 10);
  client.otp.expiry = expiry();
  await sendMail(client.email, client.userName, otpCode);
  return res
    .status(codes.accepted)
    .json(
      new ApiResponse(
        `OTP send in your mail : ${client.email}`,
        codes.accepted
      ).res()
    );
});

//////////////////////////////////////token rotaions

export const tokenRotation = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(codes.unauthorized)
      .json(
        new ApiErrorResponse(
          "Login required for token rotation.",
          codes.unauthorized
        ).res()
      );
  }
  let user = await User.findOne({
    $or: [
      { _id: req.user._id },
      { userName: req.user.userName },
      { email: req.user.email },
    ],
  });
  if (!user) {
    return res
      .status(codes.notFound)
      .json(new ApiErrorResponse("User not found", codes.notFound).res());
  }
  let decoded;
  try {
    decoded = user.refreshToken && verifyRefresh(user.refreshToken);
  } catch (err) {
    return res
      .status(codes.internalServerError)
      .json(
        new ApiErrorResponse(
          "Verification of token failed",
          codes.internalServerError
        ).res()
      );
  }

  let payload = decoded;
  let _accessToken = accessToken(payload);
  return res.status(codes.ok).json(
    new ApiResponse("Token rotation executed successfully", codes.ok, {
      accessToken: _accessToken,
    }).res()
  );
});

/////////////////////////verify otp

export const verifyOtp = asyncHandler(async (req, res) => {
  let { email, otp } = req.body;

  if (isEmpty([email, otp])) {
    return res
      .status(codes.badRequest)
      .json(new ApiErrorResponse("Mandatory fields are required").res());
  }

  let client = await User.findOne({ email });
  if (!client) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          `User with email : ${email} not found`,
          codes.notFound
        )
      );
  }
  if (!bcrypt.compare(otp, client.otp.code) || client.otp.expiry < Date.now()) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse(`invalid or wrong otp`, codes.badRequest).res()
      );
  }

  client.otp.verified = true;
  await client.save();

  return res
    .status(codes.ok)
    .json(new ApiResponse("Otp verified successfull", codes.ok).res());
});

///////////////////////login

export const login = asyncHandler(async (req, res) => {
  let { password, userName, email } = req.body;

  if (req.user && req.user.userName === userName) {
    return res
      .status(codes.found)
      .json(new ApiErrorResponse("User already logged in", codes.found).res());
  }

  if (isEmpty([password, userName, email])) {
    return res
      .status(codes.badRequest)
      .json(
        new ApiErrorResponse("Some fields are missing", codes.badRequest).res()
      );
  }

  let client = await User.findOne({ $or: [{ userName }, { email }] });
  if (!client) {
    return res
      .status(codes.notFound)
      .json(
        new ApiErrorResponse(
          "No user with credentials found, please register",
          codes.notFound
        ).res()
      );
  }

  // if (client.role !== req.user.role) {
  //   return res
  //     .status(codes.unauthorized)
  //     .json(
  //       new ApiErrorResponse(
  //         "Unauthorized access detected",
  //         codes.unauthorized
  //       ).res()
  //     );
  // }

  if (!client.comparePassword(password)) {
    return res
      .status(codes.conflict)
      .json(
        new ApiErrorResponse(
          "Wrong credentials,please try again",
          codes.conflict
        ).res()
      );
  }

  let payload = {
    _id: client._id,
    userName: client.userName,
    email: client.userName,
    role: client.role,
  };

  let { accessToken, refreshToken } = tokenGeneration(payload);
  res.cookie("accessToken", accessToken, cookieOptions("access"));
  res.cookie("refreshToken", refreshToken, cookieOptions("refresh"));
  client.refreshToken = refreshToken;
  client.lastLogin = Date.now();
  await client.save();

  return res.status(codes.found).json(
    new ApiResponse(`Welcome ${client.userName}`, codes.found, {
      user: client,
      accessToken: accessToken,
    }).res()
  );
});
