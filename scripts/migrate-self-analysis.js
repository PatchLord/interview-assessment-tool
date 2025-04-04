// Script to add default selfAnalysis field to existing candidates
import { MongoClient } from "mongodb";

// Replace with your MongoDB connection string from .env
const MONGODB_URI = process.env.MONGODB_URI || "";

async function migrateSelfAnalysis() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in your environment variables");
    process.exit(1);
  }

  try {
    // Connect to the MongoDB database
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();
    const candidatesCollection = db.collection("candidates");

    // Find all candidates without selfAnalysis field
    const candidatesWithoutSelfAnalysis = await candidatesCollection
      .find({
        selfAnalysis: { $exists: false },
      })
      .toArray();

    console.log(`Found ${candidatesWithoutSelfAnalysis.length} candidates without selfAnalysis`);

    if (candidatesWithoutSelfAnalysis.length > 0) {
      // Update each candidate to add a default selfAnalysis field
      const updatePromises = candidatesWithoutSelfAnalysis.map((candidate) => {
        return candidatesCollection.updateOne(
          { _id: candidate._id },
          {
            $set: {
              selfAnalysis: {
                beScore: 5, // Default middle value
                feScore: 5, // Default middle value
              },
            },
          }
        );
      });

      const results = await Promise.all(updatePromises);
      console.log(`Updated ${results.length} candidates with default selfAnalysis values`);
    }

    await client.close();
    console.log("MongoDB connection closed");
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("An error occurred during migration:", error);
  }
}

// Run the migration
migrateSelfAnalysis();
