"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Question {
  skill: string;
  difficulty: string;
  question: string;
  candidateCode?: string;
  aiEvaluation?: {
    summary?: {
      overall_assessment: string;
      correctness: number;
      code_quality: number;
      efficiency: string;
      edge_case_handling: number;
      overall_rating: number;
    };
    feedback?: string;
  };
}

interface AIEvaluationProps {
  question: Question;
  candidateSkills: string[];
  questionIndex: number;
  onUpdateQuestion: (index: number, data: any) => void;
}

export default function AIEvaluation({
  question,
  candidateSkills,
  questionIndex,
  onUpdateQuestion,
}: AIEvaluationProps) {
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const { toast } = useToast();

  // Function to parse JSON from feedback string with markdown code blocks
  const parseJsonFromFeedback = (feedback: string) => {
    try {
      // Look for JSON content within markdown code blocks
      const jsonMatch = feedback.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        // Parse the extracted JSON string
        return JSON.parse(jsonMatch[1]);
      }
      return null;
    } catch (error) {
      console.error("Error parsing JSON from feedback:", error);
      return null;
    }
  };

  const handleGenerateEvaluation = async () => {
    if (!question.candidateCode) {
      toast({
        title: "Error",
        description: "No code to evaluate",
        variant: "destructive",
      });
      return;
    }

    setIsEvaluating(true);

    try {
      const response = await fetch("/api/ai/evaluate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.question,
          code: question.candidateCode,
          skills: [question.skill],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate code");
      }

      const data = await response.json();

      // Check if we have parsed data from the API
      if (data.parsedData && data.parsedData.summary) {
        console.log("data", data);

        // Update the question with the evaluation
        onUpdateQuestion(questionIndex, {
          aiEvaluation: {
            summary: data.parsedData.summary,
            feedback: data.evaluation,
          },
        });

        toast({
          title: "Success",
          description: "Code evaluation completed",
        });
      } else {
        // Try to parse the JSON evaluation from the raw response
        try {
          // If it's a string, try to parse it as JSON
          if (typeof data.evaluation === "string") {
            // Find the JSON object in the response
            const jsonMatch = data.evaluation.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const evaluationData = JSON.parse(jsonMatch[0]);

              // Update the question with the evaluation
              onUpdateQuestion(questionIndex, {
                aiEvaluation: {
                  summary: evaluationData.summary,
                  feedback: data.evaluation,
                },
              });

              toast({
                title: "Success",
                description: "Code evaluation completed",
              });
              return;
            }
          }

          // If we reach here, we couldn't parse the JSON
          console.warn("Could not parse JSON from evaluation response");
          toast({
            title: "Warning",
            description: "Evaluation completed but format was unexpected",
          });

          // Still save the raw evaluation as feedback
          onUpdateQuestion(questionIndex, {
            aiEvaluation: {
              summary: data.parsedData.summary,
              feedback: data.evaluation,
            },
          });
        } catch (parseError) {
          console.error("Error parsing evaluation:", parseError);
          toast({
            title: "Warning",
            description: "Evaluation completed but format was unexpected",
          });

          // Still save the raw evaluation as feedback
          onUpdateQuestion(questionIndex, {
            aiEvaluation: {
              summary: data.parsedData.summary,
              feedback: data.evaluation,
            },
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate code",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveCode = () => {
    toast({
      title: "Success",
      description: "Code saved successfully",
    });
  };

  const parsedData = parseJsonFromFeedback(question?.aiEvaluation?.feedback);

  console.log("question.aiEvaluation.summary.overall_rating", question);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Code Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={handleGenerateEvaluation}
              disabled={isEvaluating || !question.candidateCode}
              className="flex-1"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                "Generate AI Evaluation"
              )}
            </Button>
          </div>

          {/* {question.aiEvaluation?.feedback &&
            !question.aiEvaluation?.summary && (
              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Process Feedback</h3>
                  <Button
                    onClick={handleProcessFeedback}
                    className="flex items-center space-x-2"
                  >
                    <span>Extract JSON Data</span>
                  </Button>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">
                    {question.aiEvaluation.feedback}
                  </pre>
                </div>
              </div>
            )} */}

          {parsedData?.summary && (
            <div className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Overall Assessment</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {parsedData?.summary.overall_assessment}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Correctness</h3>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={parsedData?.summary.correctness}
                      className="h-2"
                    />
                    <span className="font-bold">
                      {parsedData?.summary.correctness}%
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-medium">Code Quality</h3>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={parsedData?.summary.code_quality}
                      className="h-2"
                    />
                    <span className="font-bold">
                      {parsedData?.summary.code_quality}%
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-medium">Edge Case Handling</h3>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={parsedData?.summary.edge_case_handling}
                      className="h-2"
                    />
                    <span className="font-bold">
                      {parsedData?.summary.edge_case_handling}%
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-medium">Overall Rating</h3>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={parsedData?.summary.overall_rating}
                      className="h-2"
                    />
                    <span className="font-bold">
                      {parsedData?.summary.overall_rating}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-md font-medium">Efficiency</h3>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-gray-700 dark:text-gray-300">
                    {parsedData?.summary.efficiency}
                  </p>
                </div>
              </div>

              {/* <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Final Score</h3>
                <div className="flex items-center">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    <span className="font-bold mr-1">
                      {parsedData?.summary.overall_rating}
                    </span>
                    <span className="text-gray-500">/100</span>
                  </Badge>
                </div>
              </div> */}
            </div>
          )}

          {/* {!question.aiEvaluation?.summary && !isEvaluating && (
            <div className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Overall Assessment</h3>
                <p className="text-gray-400 dark:text-gray-500 italic">
                  Generate an evaluation to see the assessment
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Correctness</h3>
                  <div className="flex items-center space-x-2">
                    <Progress value={0} className="h-2" />
                    <span className="font-bold text-gray-400">0%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-medium">Code Quality</h3>
                  <div className="flex items-center space-x-2">
                    <Progress value={0} className="h-2" />
                    <span className="font-bold text-gray-400">0%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-medium">Edge Case Handling</h3>
                  <div className="flex items-center space-x-2">
                    <Progress value={0} className="h-2" />
                    <span className="font-bold text-gray-400">0%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-medium">Overall Rating</h3>
                  <div className="flex items-center space-x-2">
                    <Progress value={0} className="h-2" />
                    <span className="font-bold text-gray-400">0%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-md font-medium">Efficiency</h3>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-gray-400 dark:text-gray-500 italic">
                    Generate an evaluation to see efficiency analysis
                  </p>
                </div>
              </div>
            </div>
          )} */}

          {isEvaluating && (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center text-gray-500">
                Analyzing code and generating evaluation...
              </p>
              <p className="text-center text-gray-500 text-sm">
                This may take a minute or two
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
