import { authOptions } from "@/lib/auth";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Get all users (interviewers)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connection is already established at application startup
    const users = await User.find({ role: "interviewer" }).select("-password");
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// Create a new user (interviewer)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, role, department } = await request.json();
    if (!name || !email || !department) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Connection is already established at application startup

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Generate a random password
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "interviewer",
      department,
    });
    await newUser.save();

    // Return user without password and include the generated password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      {
        user: userResponse,
        generatedPassword: password,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
