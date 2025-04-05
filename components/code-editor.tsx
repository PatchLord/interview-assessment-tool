"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Question {
  skill: string;
  difficulty: string;
  question: string;
  candidateCode?: string;
  interviewerNotes?: string;
}

interface CodeEditorProps {
  questions: Question[];
  activeQuestionIndex: number;
  setActiveQuestionIndex: (index: number) => void;
  onUpdateQuestion: (
    index: number,
    data: { candidateCode?: string; interviewerNotes?: string }
  ) => void;
}

export default function CodeEditor({
  questions,
  activeQuestionIndex,
  setActiveQuestionIndex,
  onUpdateQuestion,
}: CodeEditorProps) {
  const [code, setCode] = useState<string>(
    questions[activeQuestionIndex]?.candidateCode || ""
  );
  const [notes, setNotes] = useState<string>(
    questions[activeQuestionIndex]?.interviewerNotes || ""
  );
  const { toast } = useToast();
  const [codeSaved, setCodeSaved] = useState<boolean>(false);
  const [notesSaved, setNotesSaved] = useState<boolean>(false);

  // Update local state when active question changes
  useEffect(() => {
    setCode(questions[activeQuestionIndex]?.candidateCode || "");
    setNotes(questions[activeQuestionIndex]?.interviewerNotes || "");
  }, [activeQuestionIndex, questions]);

  const handleSaveCode = () => {
    // Show visual feedback
    setCodeSaved(true);

    // Save the code
    onUpdateQuestion(activeQuestionIndex, { candidateCode: code });

    // Try to show toast
    toast({
      title: "Success",
      description: "Code saved successfully",
    });

    // Reset the visual feedback after 1.5 seconds
    setTimeout(() => {
      setCodeSaved(false);
    }, 1500);
  };

  const handleSaveNotes = () => {
    // Show visual feedback
    setNotesSaved(true);

    // Save the notes
    onUpdateQuestion(activeQuestionIndex, { interviewerNotes: notes });

    // Try to show toast
    toast({
      title: "Success",
      description: "Notes saved successfully",
    });

    // Reset the visual feedback after 1.5 seconds
    setTimeout(() => {
      setNotesSaved(false);
    }, 1500);
  };

  const handlePreviousQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle>Code Editor</CardTitle>
            <div className="flex items-center space-x-2 mt-2 md:mt-0">
              <Badge>{questions[activeQuestionIndex].skill}</Badge>
              <Badge variant="outline">
                {questions[activeQuestionIndex].difficulty}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length > 1 && (
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousQuestion}
                disabled={activeQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Question
              </Button>
              <span className="text-sm text-gray-500">
                Question {activeQuestionIndex + 1} of {questions.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextQuestion}
                disabled={activeQuestionIndex === questions.length - 1}
              >
                Next Question
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          <Tabs defaultValue="question">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="question">Question</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="question" className="space-y-4">
              <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900 overflow-y-auto">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => (
                      <p className="mb-4" {...props} />
                    ),
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-bold mb-4" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-xl font-bold mb-3" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-lg font-bold mb-2" {...props} />
                    ),
                    pre: ({ node, ...props }) => (
                      <pre
                        className="bg-gray-800 text-white p-4 rounded-md my-4 overflow-auto"
                        {...props}
                      />
                    ),
                    code: ({
                      node,
                      inline,
                      ...props
                    }: {
                      node?: any;
                      inline?: boolean;
                      [key: string]: any;
                    }) =>
                      inline ? (
                        <code
                          className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded"
                          {...props}
                        />
                      ) : (
                        <code {...props} />
                      ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-6 mb-4" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-6 mb-4" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-1" {...props} />
                    ),
                  }}
                >
                  {questions[activeQuestionIndex].question}
                </ReactMarkdown>
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[300px] font-mono"
                placeholder="Write or paste candidate's code here..."
              />
              <Button
                onClick={handleSaveCode}
                className={`w-full ${
                  codeSaved ? "bg-green-600 hover:bg-green-700" : ""
                }`}
                disabled={codeSaved}
              >
                {codeSaved ? "Saved!" : "Save Code"}
              </Button>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[200px]"
                placeholder="Add your notes about the candidate's approach and communication..."
              />
              <Button
                onClick={handleSaveNotes}
                className={`w-full ${
                  notesSaved ? "bg-green-600 hover:bg-green-700" : ""
                }`}
                disabled={notesSaved}
              >
                {notesSaved ? "Saved!" : "Save Notes"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
