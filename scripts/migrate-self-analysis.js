// Convert self analysis from string format to numerical scores
// Run with: node scripts/migrate-self-analysis.js

const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

// Define the Candidate schema for migration purposes
const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  position: { type: String, enum: ["Intern", "Full-Time"], required: true },
  skills: [{ type: String }],
  selfAnalysis: mongoose.Schema.Types.Mixed,
  resumeUrl: { type: String },
  interviewLevel: { type: String, enum: ["High", "Mid", "Low"], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Candidate = mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);

// Map old string values to numeric scores
const selfAnalysisMap = {
  "BE high, FE high": { beScore: 9, feScore: 9 },
  "BE high, FE mid": { beScore: 9, feScore: 6 },
  "BE high, FE low": { beScore: 9, feScore: 3 },
  "BE mid, FE high": { beScore: 6, feScore: 9 },
  "BE mid, FE mid": { beScore: 6, feScore: 6 },
  "BE mid, FE low": { beScore: 6, feScore: 3 },
  "BE low, FE high": { beScore: 3, feScore: 9 },
  "BE low, FE mid": { beScore: 3, feScore: 6 },
  "BE low, FE low": { beScore: 3, feScore: 3 },
};

async function migrateSelfAnalysis() {
  try {
    // Find all candidates with string selfAnalysis
    const candidates = await Candidate.find({
      selfAnalysis: { $type: "string" },
    });

    console.log(`Found ${candidates.length} candidates with string selfAnalysis`);

    for (const candidate of candidates) {
      const oldValue = candidate.selfAnalysis;

      if (selfAnalysisMap[oldValue]) {
        // Update with the numeric scores
        candidate.selfAnalysis = selfAnalysisMap[oldValue];
        await candidate.save();
        console.log(
          `Updated candidate ${candidate.name} (${candidate.email}): ${oldValue} -> BE: ${candidate.selfAnalysis.beScore}, FE: ${candidate.selfAnalysis.feScore}`
        );
      } else {
        console.log(`Warning: Unknown selfAnalysis value for ${candidate.name}: ${oldValue}`);
      }
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  }
}

// Run the migration
connectToDatabase().then(migrateSelfAnalysis).catch(console.error);
