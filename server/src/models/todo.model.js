import mongoose from "mongoose";
import required from "../utils/required.util.js";

let status = ["pending", "in-progress", "completed", "canceled"];
let priority = ["low", "medium", "high"];
const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true, 
      required: [true, required("title")],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: status,
      default: "pending",
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: priority,
      default: "low",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [String],
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

let Todo = mongoose.model("Todo", todoSchema);
export default Todo;
