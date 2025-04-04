"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Interview {
  _id: string
  candidate: {
    name: string
    position: string
    skills: string[]
  }
  questions: Array<{
    skill: string
    difficulty: string
    question: string
    candidateCode?: string
    aiEvaluation?: {
      codeQuality: number
      efficiency: number
      correctness: number
      logicalThinking: number
      technicalSkill: number
      problemUnderstanding: number
      feedback: string
    }
    interviewerNotes?: string
  }>
  status: "in-progress" | "completed"
  finalAssessment?: {
    technicalProficiency: number
    problemSolving: number
    codeQuality: number
    overallScore: number
    strengths: string[]
    areasForImprovement: string[]
    comments: string
  }
}

interface FinalAssessmentProps {
  interview: Interview
  onCompleteInterview: (assessment: any) => void
}

export default function FinalAssessment({ interview, onCompleteInterview }: FinalAssessmentProps) {
  const [technicalProficiency, setTechnicalProficiency] = useState<number>(
    interview.finalAssessment?.technicalProficiency || 5,
  )
  const [problemSolving, setProblemSolving] = useState<number>(interview.finalAssessment?.problemSolving || 5)
  const [codeQuality, setCodeQuality] = useState<number>(interview.finalAssessment?.codeQuality || 5)
  const [overallScore, setOverallScore] = useState<number>(interview.finalAssessment?.overallScore || 5)
  const [strengths, setStrengths] = useState<string>(interview.finalAssessment?.strengths?.join("\n") || "")
  const [areasForImprovement, setAreasForImprovement] = useState<string>(
    interview.finalAssessment?.areasForImprovement?.join("\n") || "",
  )
  const [comments, setComments] = useState<string>(interview.finalAssessment?.comments || "")

  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const { toast } = useToast()

  // Calculate average scores from questions with AI evaluations
  useEffect(() => {
    if (interview.questions.length > 0 && interview.status === "in-progress") {
      const questionsWithEval = interview.questions.filter((q) => q.aiEvaluation)

      if (questionsWithEval.length > 0) {
        const avgCodeQuality = Math.round(
          questionsWithEval.reduce((sum, q) => sum + (q.aiEvaluation?.codeQuality || 0), 0) / questionsWithEval.length,
        )

        const avgTechnicalSkill = Math.round(
          questionsWithEval.reduce((sum, q) => sum + (q.aiEvaluation?.technicalSkill || 0), 0) /
            questionsWithEval.length,
        )

        const avgProblemUnderstanding = Math.round(
          questionsWithEval.reduce((sum, q) => sum + (q.aiEvaluation?.problemUnderstanding || 0), 0) /
            questionsWithEval.length,
        )

        setCodeQuality(avgCodeQuality || 5)
        setTechnicalProficiency(avgTechnicalSkill || 5)
        setProblemSolving(avgProblemUnderstanding || 5)
        setOverallScore(Math.round((avgCodeQuality + avgTechnicalSkill + avgProblemUnderstanding) / 3) || 5)
      }
    }
  }, [interview.questions, interview.status])

  const handleGenerateAssessment = async () => {
    if (interview.questions.length === 0) {
      toast({
        title: "Error",
        description: "No questions to evaluate",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

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
`
        })
        .join("\n\n")

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
      })

      if (!response.ok) {
        throw new Error("Failed to generate assessment")
      }

      const data = await response.json()

      // Parse the assessment to extract information
      const assessmentText = data.assessment

      // Extract strengths and areas for improvement
      const strengthsMatch = assessmentText.match(/Areas of Strength[:\s]+([\s\S]*?)(?=Areas for Improvement|$)/i)
      const areasForImprovementMatch = assessmentText.match(
        /Areas for Improvement[:\s]+([\s\S]*?)(?=Summary Comments|$)/i,
      )
      const commentsMatch = assessmentText.match(/Summary Comments[:\s]+([\s\S]*?)$/i)

      // Extract scores
      const technicalProficiencyMatch = assessmentText.match(/Technical Proficiency[:\s]+(\d+)/i)
      const problemSolvingMatch = assessmentText.match(/Problem-Solving Approach[:\s]+(\d+)/i)
      const codeQualityMatch = assessmentText.match(/Code Quality and Efficiency[:\s]+(\d+)/i)
      const overallScoreMatch = assessmentText.match(/Overall Score[:\s]+(\d+)/i)

      // Update state with extracted information
      if (strengthsMatch && strengthsMatch[1]) {
        const strengthsList = strengthsMatch[1]
          .trim()
          .split(/\n|-/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
        setStrengths(strengthsList.join("\n"))
      }

      if (areasForImprovementMatch && areasForImprovementMatch[1]) {
        const areasList = areasForImprovementMatch[1]
          .trim()
          .split(/\n|-/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
        setAreasForImprovement(areasList.join("\n"))
      }

      if (commentsMatch && commentsMatch[1]) {
        setComments(commentsMatch[1].trim())
      }

      if (technicalProficiencyMatch && technicalProficiencyMatch[1]) {
        setTechnicalProficiency(Number.parseInt(technicalProficiencyMatch[1], 10))
      }

      if (problemSolvingMatch && problemSolvingMatch[1]) {
        setProblemSolving(Number.parseInt(problemSolvingMatch[1], 10))
      }

      if (codeQualityMatch && codeQualityMatch[1]) {
        setCodeQuality(Number.parseInt(codeQualityMatch[1], 10))
      }

      if (overallScoreMatch && overallScoreMatch[1]) {
        setOverallScore(Number.parseInt(overallScoreMatch[1], 10))
      }

      toast({
        title: "Success",
        description: "Assessment generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate assessment",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCompleteInterview = () => {
    const assessment = {
      technicalProficiency,
      problemSolving,
      codeQuality,
      overallScore,
      strengths: strengths.split("\n").filter((s) => s.trim().length > 0),
      areasForImprovement: areasForImprovement.split("\n").filter((s) => s.trim().length > 0),
      comments,
    }

    onCompleteInterview(assessment)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Final Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {interview.status === "in-progress" && (
            <Button
              onClick={handleGenerateAssessment}
              disabled={isGenerating || interview.questions.length === 0}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Assessment...
                </>
              ) : (
                "Generate AI Assessment"
              )}
            </Button>
          )}

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
                  <span className="text-2xl font-bold">{technicalProficiency}/10</span>
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
                  <span className="text-2xl font-bold">{problemSolving}/10</span>
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
                  <span className="text-2xl font-bold">{codeQuality}/10</span>
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
                  <span className="text-2xl font-bold">{overallScore}/10</span>
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

          {interview.status === "in-progress" && (
            <Button onClick={handleCompleteInterview} className="w-full">
              Complete Interview
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

