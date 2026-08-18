import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User model — the single authentication identity for BOTH Admin and Worker
 * roles. Worker-specific business data (area, commission %, assigned shops)
 * will live in a separate `Worker` profile document (Phase 3) that references
 * this User by `userId`, keeping auth concerns and business-profile concerns
 * decoupled — a common pattern so login/permissions logic never has to know
 * about commission rates, and worker profile edits never touch credentials.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned by default on find()/findOne()
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "worker"],
        message: "Role must be either 'admin' or 'worker'",
      },
      default: "worker",
    },
    phone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true, // admin can deactivate a worker's login without deleting history
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash the password whenever it's set/changed — never store plain text
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method used by the login controller to verify a candidate password
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Belt-and-suspenders: even if `password` was ever selected back in, strip it
// from any JSON response (e.g. res.json(user)) so it can never leak.
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;
