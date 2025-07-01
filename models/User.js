import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define the schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6, // Optional: basic password validation
    },
    profilePic: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 🔐 Hash password before saving to DB
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is changed
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔐 Add password comparison method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model
const User = mongoose.model("User", UserSchema);
export default User;
