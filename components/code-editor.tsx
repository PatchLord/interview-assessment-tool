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
import Editor from "@monaco-editor/react";
import { Save, CheckCircle2 } from "lucide-react";

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
  readOnly?: boolean;
}

export default function CodeEditor({
  questions,
  activeQuestionIndex,
  setActiveQuestionIndex,
  onUpdateQuestion,
  readOnly = false,
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
    setCodeSaved(false);
    setNotesSaved(false);
  }, [activeQuestionIndex, questions]);

  // Function to determine the language for syntax highlighting
  const detectLanguage = (code: string): string => {
    // Simple detection based on keywords or syntax patterns
    if (
      code.includes("def ") ||
      (code.includes("import ") && code.includes(":"))
    ) {
      return "python";
    } else if (
      code.includes("function") ||
      code.includes("=>") ||
      code.includes("const ")
    ) {
      return "javascript";
    } else if (
      code.includes("public class") ||
      code.includes("System.out.println")
    ) {
      return "java";
    } else if (code.includes("#include") || code.includes("int main()")) {
      return "cpp";
    }

    // Default to JavaScript if we can't detect
    return "javascript";
  };

  const handleSaveCode = () => {
    onUpdateQuestion(activeQuestionIndex, { candidateCode: code });
    setCodeSaved(true);

    toast({
      title: "Success",
      description: "Code saved successfully",
    });

    // Reset the saved state after 2 seconds
    setTimeout(() => {
      setCodeSaved(false);
    }, 2000);
  };

  const handleSaveNotes = () => {
    onUpdateQuestion(activeQuestionIndex, { interviewerNotes: notes });
    setNotesSaved(true);

    toast({
      title: "Success",
      description: "Notes saved successfully",
    });

    // Reset the saved state after 2 seconds
    setTimeout(() => {
      setNotesSaved(false);
    }, 2000);
  };

  const activeQuestion = questions[activeQuestionIndex];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-medium">
                    {activeQuestion?.skill} ({activeQuestion?.difficulty})
                  </h3>
                  <p className="text-sm text-gray-500">
                    Question {activeQuestionIndex + 1} of {questions.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  {activeQuestionIndex > 0 && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setActiveQuestionIndex(activeQuestionIndex - 1)
                      }
                    >
                      Previous
                    </Button>
                  )}
                  {activeQuestionIndex < questions.length - 1 && (
                    <Button
                      onClick={() =>
                        setActiveQuestionIndex(activeQuestionIndex + 1)
                      }
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
              <p className="whitespace-pre-wrap">{activeQuestion?.question}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="code" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="code">Candidate Code</TabsTrigger>
          <TabsTrigger value="notes">Interviewer Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="code" className="space-y-4">
          <div className="relative border rounded-md">
            <div className="h-[500px] w-full">
              <Editor
                height="500px"
                defaultLanguage={detectLanguage(code)}
                language={detectLanguage(code)}
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                }}
              />
            </div>
            <div className="flex justify-end p-2">
              <Button
                onClick={handleSaveCode}
                className="flex items-center gap-2"
                variant={codeSaved ? "outline" : "default"}
              >
                {codeSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="notes" className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Add your notes about the candidate's performance, approach, and communication..."
              className="min-h-[300px] resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSaveNotes}
                className="flex items-center gap-2"
                variant={notesSaved ? "outline" : "default"}
              >
                {notesSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Notes
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
