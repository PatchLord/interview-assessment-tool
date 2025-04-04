import mongoose, { Schema } from "mongoose"

const CandidateSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  position: { type: String, enum: ["Intern", "Full-Time"], required: true },
  skills: [{ type: String }],
  selfAnalysis: {
    type: String,
    enum: [
      "BE high, FE high",
      "BE high, FE mid",
      "BE high, FE low",
      "BE mid, FE high",
      "BE mid, FE mid",
      "BE mid, FE low",
      "BE low, FE high",
      "BE low, FE mid",
      "BE low, FE low",
    ],
  },
  resumeUrl: { type: String },
  interviewLevel: { type: String, enum: ["High", "Mid", "Low"], required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema)

