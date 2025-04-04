import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { LangChainAdapter } from "ai";

// Initialize the model with API key from environment variable
const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Question generation prompt
const questionGenerationPrompt = PromptTemplate.fromTemplate(`
You are an expert technical interviewer. Generate a coding question for a candidate with the following parameters:

Skills: {skills}
Difficulty: {difficulty}
Interview Level: {level}

The question should:
1. Be specific to the selected skills
2. Match the difficulty level
3. Include a clear problem statement
4. Provide constraints
5. Include input/output examples
6. Be in a LeetCode-style format

Question:
`);

// Code evaluation prompt
const codeEvaluationPrompt = PromptTemplate.fromTemplate(`
You are an expert code reviewer. Evaluate the following code solution for a technical interview:

Problem: {question}
Candidate's Code: {code}
Skills being assessed: {skills}

Provide a detailed evaluation covering:
1. Code Quality (1-10)
2. Efficiency (1-10)
3. Correctness (1-10)
4. Logical Thinking (1-10)
5. Technical Skill (1-10)
6. Problem Understanding (1-10)

Also provide specific feedback on strengths and areas for improvement.

Evaluation:
`);

// Final assessment prompt
const finalAssessmentPrompt = PromptTemplate.fromTemplate(`
You are an expert technical interviewer. Generate a comprehensive assessment for a candidate based on their interview performance:

Candidate Name: {name}
Position: {position}
Skills Assessed: {skills}
Interview Questions and Evaluations: {questionEvaluations}

Provide a detailed assessment covering:
1. Technical Proficiency (1-10)
2. Problem-Solving Approach (1-10)
3. Code Quality and Efficiency (1-10)
4. Overall Score (1-10)
5. Areas of Strength (list 3-5)
6. Areas for Improvement (list 2-3)
7. Summary Comments

Assessment:
`);

// Function to generate a question
export async function generateQuestion(skills: string[], difficulty: string, level: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in environment variables");
    }

    const parser = new StringOutputParser();
    const chain = questionGenerationPrompt.pipe(model).pipe(parser);
    const result = await chain.invoke({
      skills: skills.join(", "),
      difficulty,
      level,
    });
    return result;
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
}

// Function to evaluate code
export async function evaluateCode(question: string, code: string, skills: string[]) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in environment variables");
    }

    const parser = new StringOutputParser();
    const chain = codeEvaluationPrompt.pipe(model).pipe(parser);
    const result = await chain.invoke({
      question,
      code,
      skills: skills.join(", "),
    });
    return result;
  } catch (error) {
    console.error("Error evaluating code:", error);
    throw error;
  }
}

// Function to generate final assessment
export async function generateFinalAssessment(
  name: string,
  position: string,
  skills: string[],
  questionEvaluations: string
) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in environment variables");
    }

    const parser = new StringOutputParser();
    const chain = finalAssessmentPrompt.pipe(model).pipe(parser);
    const result = await chain.invoke({
      name,
      position,
      skills: skills.join(", "),
      questionEvaluations,
    });
    return result;
  } catch (error) {
    console.error("Error generating final assessment:", error);
    throw error;
  }
}

// Stream version for real-time responses
export async function streamEvaluation(question: string, code: string, skills: string[]) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in environment variables");
    }

    const chain = codeEvaluationPrompt.pipe(model);
    const stream = await chain.stream({
      question,
      code,
      skills: skills.join(", "),
    });
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    console.error("Error streaming evaluation:", error);
    throw error;
  }
}
