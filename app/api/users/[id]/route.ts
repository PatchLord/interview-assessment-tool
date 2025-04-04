import { authOptions } from "@/lib/auth";
import User from "@/lib/models/user";
import connectToDatabase from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Update user (activate/deactivate)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isActive } = await request.json();

    if (isActive === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const interviewId = (await params).id;

    const updatedUser = await User.findByIdAndUpdate(
      interviewId,
      { isActive, updatedAt: Date.now() },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
