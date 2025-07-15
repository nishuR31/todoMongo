import bcrypt from "bcrypt";
import mongoose from "mongoose";
import required from "../utils/required.util.js";
import { expiry } from "../utils/otp.util.js";
import "../utils/config.env.util.js";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, required("username")],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, required("email")],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, required("password")],
      select: false,
    },
    todos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Todo",
      },
    ],
    otp: {
      code: { type: String },
      expiry: { type: Date, default: expiry },
      verified: { type: Boolean, default: false },
    },
    refreshToken: { type: String },
    token: {
      token: { type: String },
      verified: { type: Boolean, default: false },
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 🔒 Hash password before saving (CREATE)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, process.env.SALT);
    return next();
  } catch (error) {
    return next(error);
  }
});

// 🔄 Hash password on updateOne or findOneAndUpdate
async function hashPasswordHook(next) {
  const update = this.getUpdate();

  if (!update || !update.password) return next();

  try {
    update.password = await bcrypt.hash(update.password, process.env.SALT);
    this.setUpdate(update);
    return next();
  } catch (error) {
    return next(error);
  }
}

userSchema.pre("updateOne", hashPasswordHook);
userSchema.pre("findOneAndUpdate", hashPasswordHook);

// ✅ Method for password comparison
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
