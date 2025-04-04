import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

async function testConnection() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined")
    }

    console.log("Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB successfully!")

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log("Collections in database:")
    collections.forEach((collection) => {
      console.log(`- ${collection.name}`)
    })

    process.exit(0)
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
    process.exit(1)
  }
}

testConnection()

