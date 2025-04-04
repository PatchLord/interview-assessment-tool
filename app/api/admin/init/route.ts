import User from "@/lib/models/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, password, department } = await request.json();
    if (!name || !email || !password || !department) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Connection is already established at application startup
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return NextResponse.json(
        {
          error: "Admin user already exists",
          user: {
            name: existingAdmin.name,
            email: existingAdmin.email,
          },
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      department,
      isActive: true,
    });
    await adminUser.save();

    return NextResponse.json({
      success: true,
      user: {
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create admin user",
      },
      { status: 500 }
    );
  }
}
