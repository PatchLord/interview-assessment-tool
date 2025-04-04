import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
    isConnecting: false,
  };
}

// Track if we've logged the connection message
let hasLoggedConnected = false;

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Only log once when we're actually connecting
    if (!hasLoggedConnected && !cached.isConnecting) {
      console.log("Connecting to MongoDB...");
      cached.isConnecting = true;
    }

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        // Only log the success message once
        if (!hasLoggedConnected) {
          console.log("Connected to MongoDB");
          hasLoggedConnected = true;
          cached.isConnecting = false;
        }
        return mongoose;
      })
      .catch((error) => {
        console.error("Failed to connect to MongoDB:", error);
        cached.isConnecting = false;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

// Initialize connection on startup only in production
// In development, we'll connect on-demand to prevent multiple logs during hot reloads
if (process.env.NODE_ENV === "production" && process.env.NODE_ENV !== "test") {
  connectToDatabase()
    .then(() => {
      if (!hasLoggedConnected) {
        console.log("MongoDB initialized on startup");
        hasLoggedConnected = true;
      }
    })
    .catch((err) => console.error("Failed to initialize MongoDB on startup:", err));
}

// Handle connection events without duplicate logging
const setupConnectionHandlers = () => {
  if (!mongoose.connection.listenerCount("error")) {
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
  }

  if (!mongoose.connection.listenerCount("disconnected")) {
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });
  }

  if (!mongoose.connection.listenerCount("reconnected")) {
    mongoose.connection.on("reconnected", () => {
      console.info("MongoDB reconnected successfully");
    });
  }
};

// Setup event handlers when a connection is established
if (mongoose.connection.readyState) {
  setupConnectionHandlers();
}

// Export both the connection function and mongoose instance
export default connectToDatabase;
export { mongoose };
