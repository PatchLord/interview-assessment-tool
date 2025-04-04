import mongoose, { Schema } from "mongoose";

const CandidateSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  position: { type: String, enum: ["Intern", "Full-Time"], required: true },
  skills: [{ type: String }],
  selfAnalysis: {
    beScore: { type: Number, min: 1, max: 10, required: true },
    feScore: { type: Number, min: 1, max: 10, required: true },
  },
  resumeUrl: { type: String },
  interviewLevel: { type: String, enum: ["High", "Mid", "Low"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);
