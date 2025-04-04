import AddInterviewerForm from "@/components/add-interviewer-form";
import InterviewersList from "@/components/interviewers-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import User from "@/lib/models/user";
import connectToDatabase from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

async function getInterviewers() {
  await connectToDatabase();
  const interviewers = await User.find({ role: "interviewer" }).select("-password").lean();

  // Properly serialize MongoDB objects to plain JavaScript objects
  return JSON.parse(JSON.stringify(interviewers));
}

export default async function InterviewersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const interviewers = await getInterviewers();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Interviewers Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Interviewers</CardTitle>
            </CardHeader>
            <CardContent>
              <InterviewersList interviewers={interviewers} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add New Interviewer</CardTitle>
            </CardHeader>
            <CardContent>
              <AddInterviewerForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
