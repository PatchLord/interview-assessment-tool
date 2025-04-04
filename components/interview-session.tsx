"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AIEvaluation from "./ai-evaluation";
import CodeEditor from "./code-editor";
import FinalAssessment from "./final-assessment";
import QuestionGenerator from "./question-generator";

interface Interview {
  _id: string;
  date: string | Date;
  candidate: {
    _id: string;
    name: string;
    email: string;
    position: string;
    skills: string[];
    selfAnalysis?: {
      beScore: number;
      feScore: number;
    };
    interviewLevel: string;
  };
  interviewer: {
    _id: string;
    name: string;
  };
  questions: Array<{
    skill: string;
    difficulty: string;
    question: string;
    candidateCode?: string;
    aiEvaluation?: {
      codeQuality: number;
      efficiency: number;
      correctness: number;
      logicalThinking: number;
      technicalSkill: number;
      problemUnderstanding: number;
      feedback: string;
    };
    interviewerNotes?: string;
  }>;
  status: "in-progress" | "completed";
  finalAssessment?: {
    technicalProficiency: number;
    problemSolving: number;
    codeQuality: number;
    overallScore: number;
    strengths: string[];
    areasForImprovement: string[];
    comments: string;
  };
}

export default function InterviewSession({
  interview: initialInterview,
}: {
  interview: Interview;
}) {
  const [interview, setInterview] = useState<Interview>(initialInterview);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("question-generator");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If interview is completed, show the final assessment tab
    if (interview.status === "completed") {
      setActiveTab("final-assessment");
    }
  }, [interview.status]);

  const handleAddQuestion = async (question: {
    skill: string;
    difficulty: string;
    question: string;
  }) => {
    try {
      const response = await fetch(`/api/interviews/${interview._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addQuestion",
          data: question,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add question");
      }

      const updatedInterview = await response.json();
      setInterview(updatedInterview);
      setActiveQuestionIndex(updatedInterview.questions.length - 1);
      setActiveTab("code-editor");

      toast({
        title: "Success",
        description: "Question added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuestion = async (questionIndex: number, data: any) => {
    try {
      const response = await fetch(`/api/interviews/${interview._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateQuestion",
          data: {
            questionIndex,
            ...data,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      const updatedInterview = await response.json();
      setInterview(updatedInterview);

      toast({
        title: "Success",
        description: "Question updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const handleCompleteInterview = async (assessment: any) => {
    try {
      const response = await fetch(`/api/interviews/${interview._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "completeInterview",
          data: assessment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete interview");
      }

      const updatedInterview = await response.json();
      setInterview(updatedInterview);

      toast({
        title: "Success",
        description: "Interview completed successfully",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete interview",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interview Session</h1>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={interview.status === "completed" ? "success" : "secondary"}>
              {interview.status === "completed" ? "Completed" : "In Progress"}
            </Badge>
            <span className="text-gray-500">{new Date(interview.date).toLocaleDateString()}</span>
          </div>
        </div>

        {interview.status === "in-progress" && (
          <Button
            onClick={() => setActiveTab("final-assessment")}
            className="mt-4 md:mt-0">
            Complete Interview
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p>{interview.candidate.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p>{interview.candidate.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Position</p>
              <p>{interview.candidate.position}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Interview Level</p>
              <p>{interview.candidate.interviewLevel}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Self Analysis</p>
              <p>
                {interview.candidate.selfAnalysis
                  ? `BE Score: ${interview.candidate.selfAnalysis.beScore}, FE Score: ${interview.candidate.selfAnalysis.feScore}`
                  : "No self analysis provided"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Skills</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {interview.candidate.skills?.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline">
                    {skill}
                  </Badge>
                )) || <span className="text-gray-500">No skills specified</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger
            value="question-generator"
            disabled={interview.status === "completed"}>
            Question Generator
          </TabsTrigger>
          <TabsTrigger
            value="code-editor"
            disabled={interview.questions.length === 0 || interview.status === "completed"}>
            Code Editor
          </TabsTrigger>
          <TabsTrigger
            value="ai-evaluation"
            disabled={
              interview.questions.length === 0 ||
              !interview.questions[activeQuestionIndex]?.candidateCode ||
              interview.status === "completed"
            }>
            AI Evaluation
          </TabsTrigger>
          <TabsTrigger value="final-assessment">Final Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="question-generator">
          <QuestionGenerator
            candidateSkills={interview.candidate.skills}
            interviewLevel={interview.candidate.interviewLevel}
            onAddQuestion={handleAddQuestion}
          />
        </TabsContent>

        <TabsContent value="code-editor">
          {interview.questions.length > 0 ? (
            <CodeEditor
              questions={interview.questions}
              activeQuestionIndex={activeQuestionIndex}
              setActiveQuestionIndex={setActiveQuestionIndex}
              onUpdateQuestion={handleUpdateQuestion}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">
                  No questions added yet. Generate a question first.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai-evaluation">
          {interview.questions.length > 0 &&
          interview.questions[activeQuestionIndex]?.candidateCode ? (
            <AIEvaluation
              question={interview.questions[activeQuestionIndex]}
              candidateSkills={interview.candidate.skills}
              questionIndex={activeQuestionIndex}
              onUpdateQuestion={handleUpdateQuestion}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">
                  No code to evaluate yet. Add code in the Code Editor first.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="final-assessment">
          <FinalAssessment
            interview={interview}
            onCompleteInterview={handleCompleteInterview}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
