import mongoose, { Schema, models } from "mongoose"

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "interviewer"], default: "interviewer" },
  department: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// This pattern prevents model recompilation errors in development
const User = models.User || mongoose.model("User", UserSchema)

export default User

