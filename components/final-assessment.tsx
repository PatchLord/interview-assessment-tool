"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Interview {
  _id: string;
  candidate: {
    name: string;
    position: string;
    skills: string[];
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

interface FinalAssessmentProps {
  interview: Interview;
  onCompleteInterview: (assessment: any) => void;
}

export default function FinalAssessment({ interview, onCompleteInterview }: FinalAssessmentProps) {
  const [technicalProficiency, setTechnicalProficiency] = useState<number>(
    interview.finalAssessment?.technicalProficiency || 0
  );
  const [problemSolving, setProblemSolving] = useState<number>(
    interview.finalAssessment?.problemSolving || 0
  );
  const [codeQuality, setCodeQuality] = useState<number>(
    interview.finalAssessment?.codeQuality || 0
  );
  const [overallScore, setOverallScore] = useState<number>(
    interview.finalAssessment?.overallScore || 0
  );
  const [strengths, setStrengths] = useState<string>(
    interview.finalAssessment?.strengths?.join("\n") || ""
  );
  const [areasForImprovement, setAreasForImprovement] = useState<string>(
    interview.finalAssessment?.areasForImprovement?.join("\n") || ""
  );
  const [comments, setComments] = useState<string>(interview.finalAssessment?.comments || "");

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [assessmentGenerated, setAssessmentGenerated] = useState<boolean>(
    !!interview.finalAssessment
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  // Calculate average scores from questions with AI evaluations
  useEffect(() => {
    if (interview.questions.length > 0 && interview.status === "in-progress") {
      const questionsWithEval = interview.questions.filter((q) => q.aiEvaluation);

      if (questionsWithEval.length > 0) {
        const avgCodeQuality = Math.round(
          questionsWithEval.reduce((sum, q) => sum + (q.aiEvaluation?.codeQuality || 0), 0) /
            questionsWithEval.length
        );

        const avgTechnicalSkill = Math.round(
          questionsWithEval.reduce((sum, q) => sum + (q.aiEvaluation?.technicalSkill || 0), 0) /
            questionsWithEval.length
        );

        const avgProblemUnderstanding = Math.round(
          questionsWithEval.reduce(
            (sum, q) => sum + (q.aiEvaluation?.problemUnderstanding || 0),
            0
          ) / questionsWithEval.length
        );

        setCodeQuality(avgCodeQuality || 0);
        setTechnicalProficiency(avgTechnicalSkill || 0);
        setProblemSolving(avgProblemUnderstanding || 0);
        setOverallScore(
          Math.round((avgCodeQuality + avgTechnicalSkill + avgProblemUnderstanding) / 3) || 0
        );
      }
    }
  }, [interview.questions, interview.status]);

  const handleGenerateAssessment = async () => {
    if (interview.questions.length === 0) {
      toast({
        title: "Error",
        description: "No questions to evaluate",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare question evaluations as a string for the AI
      const questionEvaluations = interview.questions
        .map((q, index) => {
          return `Question ${index + 1} (${q.skill}, ${q.difficulty}): 
${q.question}

${
  q.aiEvaluation
    ? `AI Evaluation:
Code Quality: ${q.aiEvaluation.codeQuality}/10
Efficiency: ${q.aiEvaluation.efficiency}/10
Correctness: ${q.aiEvaluation.correctness}/10
Logical Thinking: ${q.aiEvaluation.logicalThinking}/10
Technical Skill: ${q.aiEvaluation.technicalSkill}/10
Problem Understanding: ${q.aiEvaluation.problemUnderstanding}/10

Feedback: ${q.aiEvaluation.feedback}`
    : "No AI evaluation available"
}

${q.interviewerNotes ? `Interviewer Notes: ${q.interviewerNotes}` : "No interviewer notes"}
`;
        })
        .join("\n\n");

      const response = await fetch("/api/ai/generate-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: interview.candidate.name,
          position: interview.candidate.position,
          skills: interview.candidate.skills,
          questionEvaluations,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate assessment");
      }

      const data = await response.json();

      // Parse the assessment to extract information
      const assessmentText = data.assessment;

      try {
        // Extract JSON from markdown code block if present
        const jsonMatch = assessmentText.match(/```json\s*([\s\S]*?)\s*```/);
        let parsedAssessment;

        if (jsonMatch?.[1]) {
          parsedAssessment = JSON.parse(jsonMatch[1]);
        } else {
          // Try parsing the entire response as JSON
          try {
            parsedAssessment = JSON.parse(assessmentText);
          } catch (e) {
            console.error("Failed to parse assessment as JSON:", e);
          }
        }

        if (parsedAssessment?.finalAssessment) {
          const finalAssessment = parsedAssessment.finalAssessment;

          // Update state with the parsed data
          setTechnicalProficiency(finalAssessment.technicalProficiency || 0);
          setProblemSolving(finalAssessment.problemSolvingApproach || 0);
          setCodeQuality(finalAssessment.codeQualityAndEfficiency || 0);
          setOverallScore(finalAssessment.overallScore || 0);

          if (finalAssessment.areasOfStrength && Array.isArray(finalAssessment.areasOfStrength)) {
            setStrengths(finalAssessment.areasOfStrength.join("\n"));
          }

          if (
            finalAssessment.areasForImprovement &&
            Array.isArray(finalAssessment.areasForImprovement)
          ) {
            setAreasForImprovement(finalAssessment.areasForImprovement.join("\n"));
          }

          if (finalAssessment.summaryComments) {
            setComments(finalAssessment.summaryComments);
          }

          toast({
            title: "Success",
            description: "Assessment generated successfully",
          });
          return;
        }
      } catch (parseError) {
        console.error("Error parsing JSON assessment:", parseError);
      }

      // Fallback to regex parsing if JSON parsing fails
      // Extract strengths and areas for improvement
      const strengthsMatch = assessmentText.match(
        /Areas of Strength[:\s]+([\s\S]*?)(?=Areas for Improvement|$)/i
      );
      const areasForImprovementMatch = assessmentText.match(
        /Areas for Improvement[:\s]+([\s\S]*?)(?=Summary Comments|$)/i
      );
      const commentsMatch = assessmentText.match(/Summary Comments[:\s]+([\s\S]*?)$/i);

      // Extract scores
      const technicalProficiencyMatch = assessmentText.match(/Technical Proficiency[:\s]+(\d+)/i);
      const problemSolvingMatch = assessmentText.match(/Problem-Solving Approach[:\s]+(\d+)/i);
      const codeQualityMatch = assessmentText.match(/Code Quality and Efficiency[:\s]+(\d+)/i);
      const overallScoreMatch = assessmentText.match(/Overall Score[:\s]+(\d+)/i);

      // Update state with extracted information
      if (strengthsMatch?.[1]) {
        const strengthsList = strengthsMatch[1]
          .trim()
          .split(/\n|-/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        setStrengths(strengthsList.join("\n"));
      }

      if (areasForImprovementMatch?.[1]) {
        const areasList = areasForImprovementMatch[1]
          .trim()
          .split(/\n|-/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        setAreasForImprovement(areasList.join("\n"));
      }

      if (commentsMatch?.[1]) {
        setComments(commentsMatch[1].trim());
      }

      if (technicalProficiencyMatch?.[1]) {
        setTechnicalProficiency(Number.parseInt(technicalProficiencyMatch[1], 10));
      }

      if (problemSolvingMatch?.[1]) {
        setProblemSolving(Number.parseInt(problemSolvingMatch[1], 10));
      }

      if (codeQualityMatch?.[1]) {
        setCodeQuality(Number.parseInt(codeQualityMatch[1], 10));
      }

      if (overallScoreMatch?.[1]) {
        setOverallScore(Number.parseInt(overallScoreMatch[1], 10));
      }

      toast({
        title: "Success",
        description: "Assessment generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate assessment",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setAssessmentGenerated(true); // Mark as generated regardless of success or failure
    }
  };

  // Run once when component mounts to generate initial assessment
  useEffect(() => {
    // Generate assessment automatically on first load if conditions are met
    if (
      interview.status === "in-progress" &&
      !interview.finalAssessment &&
      interview.questions.length > 0 &&
      interview.questions.some((q) => q.aiEvaluation)
    ) {
      handleGenerateAssessment();
    }
  }, [interview._id]); // Only depend on interview ID to ensure it runs once per interview

  const handleCompleteInterview = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const assessment = {
        technicalProficiency,
        problemSolving,
        codeQuality,
        overallScore,
        strengths: strengths.split("\n").filter((s) => s.trim().length > 0),
        areasForImprovement: areasForImprovement.split("\n").filter((s) => s.trim().length > 0),
        comments,
      };

      // Call the onCompleteInterview function to store the assessment
      await onCompleteInterview(assessment);

      toast({
        title: "Success",
        description: "Final assessment submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting final assessment:", error);
      toast({
        title: "Error",
        description: "Failed to submit final assessment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Final Assessment</CardTitle>
            {interview.status === "in-progress" && (
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateAssessment}
                  variant="outline"
                  disabled={isGenerating || interview.questions.length === 0}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Regenerate Assessment"
                  )}
                </Button>
                <Button
                  onClick={handleCompleteInterview}
                  disabled={isSubmitting}>
                  Submit Final Assessment
                </Button>
              </div>
            )}
          </div>
          {interview.status === "in-progress" && (
            <p className="text-sm text-muted-foreground mt-2">
              Review and edit the AI-generated assessment before submitting. All fields are
              editable.
            </p>
          )}
          {interview.status === "completed" && (
            <p className="text-sm text-muted-foreground mt-2">
              This interview has been completed and the assessment is finalized.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="technicalProficiency">Technical Proficiency (1-10)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="technicalProficiency"
                    type="number"
                    min="1"
                    max="10"
                    value={technicalProficiency}
                    onChange={(e) => setTechnicalProficiency(Number.parseInt(e.target.value, 10))}
                    disabled={interview.status === "completed"}
                  />
                  <span className="text-[22px] font-semibold">{technicalProficiency}/10</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemSolving">Problem-Solving Approach (1-10)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="problemSolving"
                    type="number"
                    min="1"
                    max="10"
                    value={problemSolving}
                    onChange={(e) => setProblemSolving(Number.parseInt(e.target.value, 10))}
                    disabled={interview.status === "completed"}
                  />
                  <span className="text-[22px] font-semibold">{problemSolving}/10</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codeQuality">Code Quality and Efficiency (1-10)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="codeQuality"
                    type="number"
                    min="1"
                    max="10"
                    value={codeQuality}
                    onChange={(e) => setCodeQuality(Number.parseInt(e.target.value, 10))}
                    disabled={interview.status === "completed"}
                  />
                  <span className="text-[22px] font-semibold">{codeQuality}/10</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="overallScore">Overall Score (1-10)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="overallScore"
                    type="number"
                    min="1"
                    max="10"
                    value={overallScore}
                    onChange={(e) => setOverallScore(Number.parseInt(e.target.value, 10))}
                    disabled={interview.status === "completed"}
                  />
                  <span className="text-[22px] font-semibold">{overallScore}/10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strengths">Areas of Strength (one per line)</Label>
            <Textarea
              id="strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              className="min-h-[100px]"
              placeholder="List candidate's strengths..."
              disabled={interview.status === "completed"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="areasForImprovement">Areas for Improvement (one per line)</Label>
            <Textarea
              id="areasForImprovement"
              value={areasForImprovement}
              onChange={(e) => setAreasForImprovement(e.target.value)}
              className="min-h-[100px]"
              placeholder="List areas where the candidate can improve..."
              disabled={interview.status === "completed"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Summary Comments</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[150px]"
              placeholder="Provide overall assessment and recommendations..."
              disabled={interview.status === "completed"}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
