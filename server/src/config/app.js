import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import logger from "../utils/logger.util.js";
import codes from "../utils/codes.util.js";
import ApiErrorResponse from "../utils/ApiErrorResponse.util.js";
import ApiResponse from "../utils/ApiResponse.util.js";
import authRouter from "../routes/auth.route.js";
import userRouter from "../routes/user.route.js";
import adminRouter from "../routes/admin.route.js";
import todoRouter from "../routes/todo.route.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(logger);

// Base API path
const baseRoute = "/api/v1/todoMongo";

// Health check endpoint
app.get(baseRoute, (req, res) => {
  res.status(codes.ok).json(
    new ApiResponse(
      `Server fired up from route : ${req.hostname}${req.originalUrl}`,
      codes.ok
    ).res()
  );
});

// Register routers
app.use(baseRoute, authRouter);
app.use(baseRoute, userRouter);
app.use(baseRoute, adminRouter);
app.use(baseRoute, todoRouter);

// Catch-all for unmatched routes (Express 5 syntax)
app.all(`${baseRoute}/{*splat}`, (req, res) => {
  res
    .status(codes.notFound)
    .json(new ApiErrorResponse("Route not found or using wrong method", codes.notFound,{path:`${req.host}${req.url}`,method:req.method}).res());
});

// Root route
app.get("/", (req, res) => {
  res.status(codes.ok).json(new ApiResponse("Server fired up", codes.ok).res());
});

app.all(`/{*splat}`, (req, res) => {
  res
    .status(codes.notFound)
    .json(new ApiErrorResponse("Route not found or using wrong method", codes.notFound,{path:`${req.host}${req.url}`,method:req.method}).res());
});
// Global error handler
app.use((err, req, res, next) => {
  res.status(codes.internalServerError).json(
    new ApiErrorResponse(
      `Error occurred: ${err.message}`,
      codes.internalServerError,
      { Error: err },
      err
    ).res()
  );
});

export default app;
