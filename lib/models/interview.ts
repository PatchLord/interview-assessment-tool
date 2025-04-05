import mongoose, { Schema } from "mongoose";

const QuestionSchema = new Schema({
  skill: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  question: { type: String, required: true },
  candidateCode: { type: String },
  aiEvaluation: {
    codeQuality: { type: Number },
    efficiency: { type: Number },
    correctness: { type: Number },
    logicalThinking: { type: Number },
    technicalSkill: { type: Number },
    problemUnderstanding: { type: Number },
    feedback: { type: String },
  },
  interviewerNotes: { type: String },
});

const InterviewSchema = new Schema({
  candidate: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
  interviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  questions: [QuestionSchema],
  finalAssessment: {
    technicalProficiency: { type: Number },
    problemSolving: { type: Number },
    codeQuality: { type: Number },
    overallScore: { type: Number },
    strengths: [{ type: String }],
    areasForImprovement: [{ type: String }],
    comments: { type: String },
  },
  status: {
    type: String,
    enum: ["in-progress", "completed"],
    default: "in-progress",
  },
});

export default mongoose.models.Interview ||
  mongoose.model("Interview", InterviewSchema);
