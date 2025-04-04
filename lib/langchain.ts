/**
 * LangChain Integration Module
 *
 * This module provides AI-powered functionality for the interview assessment tool:
 * - Question generation
 * - Code evaluation
 * - Final candidate assessment
 */
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { LangChainAdapter } from "ai";

// =========================================================================
// Configuration
// =========================================================================

/**
 * Validates that required environment variables are set
 */
const validateEnvVars = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined in environment variables");
  }
};

/**
 * Model configuration
 */
const createModel = () => {
  return new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
};

// =========================================================================
// Prompt Templates
// =========================================================================

/**
 * Template for generating interview coding questions
 */
const QUESTION_TEMPLATE = `
You are an expert technical interviewer. Generate a coding question for a candidate with the following parameters:

Skills: {skills}
Difficulty: {difficulty}
Interview Level: {level}
Output Format: {format}

The question should:
1. Be specific to the selected skills
2. Match the difficulty level
3. Include a clear problem statement
4. Provide constraints
5. Include input/output examples
6. Be in a LeetCode-style format

If the output format is markdown, use markdown formatting with proper headings, code blocks, and formatting.
Use ## for section headings like "Problem Statement", "Examples", "Constraints", etc.
Use \`\`\` code blocks for sample code and examples.

Question:
`;

/**
 * Template for evaluating code solutions
 */
const CODE_EVALUATION_TEMPLATE = `
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
`;

/**
 * Template for generating a final candidate assessment
 */
const FINAL_ASSESSMENT_TEMPLATE = `
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
`;

// Create prompt templates
const questionGenerationPrompt = PromptTemplate.fromTemplate(QUESTION_TEMPLATE);
const codeEvaluationPrompt = PromptTemplate.fromTemplate(CODE_EVALUATION_TEMPLATE);
const finalAssessmentPrompt = PromptTemplate.fromTemplate(FINAL_ASSESSMENT_TEMPLATE);

// =========================================================================
// Service Functions
// =========================================================================

/**
 * Generates a coding question based on skills, difficulty, and level
 *
 * @param skills - List of technical skills to focus the question on
 * @param difficulty - Difficulty level (Easy, Medium, Hard)
 * @param level - Interview level (Junior, Mid, Senior)
 * @param format - Output format (text, markdown)
 * @returns The generated question
 */
export async function generateQuestion(
  skills: string[],
  difficulty: string,
  level: string,
  format: string = "markdown"
) {
  try {
    validateEnvVars();

    const model = createModel();
    const parser = new StringOutputParser();
    const chain = questionGenerationPrompt.pipe(model).pipe(parser);

    const result = await chain.invoke({
      skills: skills.join(", "),
      difficulty,
      level,
      format,
    });

    return result;
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
}

/**
 * Evaluates candidate's code solution
 *
 * @param question - The coding question
 * @param code - Candidate's code solution
 * @param skills - Skills being assessed
 * @returns Detailed evaluation of the code
 */
export async function evaluateCode(question: string, code: string, skills: string[]) {
  try {
    validateEnvVars();

    const model = createModel();
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

/**
 * Generates a final assessment for a candidate
 *
 * @param name - Candidate's name
 * @param position - Position being applied for
 * @param skills - Skills assessed
 * @param questionEvaluations - Previous question evaluations
 * @returns Comprehensive assessment of the candidate
 */
export async function generateFinalAssessment(
  name: string,
  position: string,
  skills: string[],
  questionEvaluations: string
) {
  try {
    validateEnvVars();

    const model = createModel();
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

/**
 * Streams the code evaluation in real-time
 *
 * @param question - The coding question
 * @param code - Candidate's code solution
 * @param skills - Skills being assessed
 * @returns Streaming response of the evaluation
 */
export async function streamEvaluation(question: string, code: string, skills: string[]) {
  try {
    validateEnvVars();

    const model = createModel();
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
