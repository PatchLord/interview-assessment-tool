// This script initializes the first admin user for the application
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI environment variable is not defined.");
  process.exit(1);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Define admin user defaults
const defaultAdmin = {
  name: "Admin User",
  email: "admin@example.com",
  password: "admin123",
  department: "Administration",
};

// Define user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "interviewer"], default: "interviewer" },
  department: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Connect to MongoDB
console.log("Connecting to MongoDB...");
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Create User model
    const User = mongoose.model("User", userSchema);

    // Check if admin already exists
    User.findOne({ role: "admin" })
      .then((existingAdmin) => {
        if (existingAdmin) {
          console.log("Admin user already exists:");
          console.log(`Name: ${existingAdmin.name}`);
          console.log(`Email: ${existingAdmin.email}`);
          console.log("Use this email to login (with your password)");
          mongoose.connection.close();
          process.exit(0);
        } else {
          // If admin doesn't exist, prompt for admin info
          promptForAdminInfo();
        }
      })
      .catch((err) => {
        console.error("Error checking for existing admin:", err);
        mongoose.connection.close();
        process.exit(1);
      });

    function promptForAdminInfo() {
      console.log(
        "\nCreating a new admin user. Press ENTER to use the default values shown in brackets."
      );

      rl.question(`Name [${defaultAdmin.name}]: `, (name) => {
        name = name || defaultAdmin.name;

        rl.question(`Email [${defaultAdmin.email}]: `, (email) => {
          email = email || defaultAdmin.email;

          rl.question(`Password [${defaultAdmin.password}]: `, (password) => {
            password = password || defaultAdmin.password;

            rl.question(`Department [${defaultAdmin.department}]: `, (department) => {
              department = department || defaultAdmin.department;

              // Create admin user
              createAdminUser(name, email, password, department);
            });
          });
        });
      });
    }

    function createAdminUser(name, email, password, department) {
      // Hash the password
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          // Create new admin user
          const adminUser = new User({
            name,
            email,
            password: hashedPassword,
            role: "admin",
            department,
            isActive: true,
          });

          return adminUser.save();
        })
        .then((admin) => {
          console.log("\nAdmin user created successfully!");
          console.log("You can now log in with:");
          console.log(`Email: ${admin.email}`);
          console.log(`Password: ${password} (not hashed version)`);
          mongoose.connection.close();
          rl.close();
        })
        .catch((err) => {
          console.error("Error creating admin user:", err);
          mongoose.connection.close();
          rl.close();
        });
    }
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
