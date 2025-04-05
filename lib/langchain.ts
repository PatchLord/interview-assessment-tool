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

Generate the output in proper markdown format:
- Use ## for section headings like "Problem Statement", "Examples", "Constraints", etc.
- Use \`\`\` for code blocks, specifying the language (e.g. \`\`\`javascript)
- Use regular markdown syntax for text formatting (* for italics, ** for bold)
- Use proper markdown lists (- or * for bullet points, 1. for numbered lists)
- Maintain a clean, structured format with proper spacing between sections
- Include informative examples with proper code formatting

Format the question in a structured way with sections for Problem Statement, Examples, Constraints, and Expected Solution.

Question:
`;

/**
 * Template for evaluating code solutions
 */
const CODE_EVALUATION_TEMPLATE = `
You are an ultra-precise AI code evaluator. Your task is to analyze the given code against the interview question below and ALWAYS return a properly formatted JSON report that strictly follows the required structure.

QUESTION: {question}
CODE: {code}
SKILLS: {skills}

now use the below prompt to evaluate the code against the interview question and return a structured JSON report with full accuracy.
**Objectives:**
  1. **Correctness (0–100%)**
    - Does the code meet all functional requirements?
    - Report percentage score and document any errors or missing parts.
    - Include key test cases (input, expected, actual output).
  2. **Efficiency**
    - Determine time and space complexity (Big O).
    - Estimate performance vs. optimal solution as a percentage.
    - Provide runtime estimation for realistic input sizes.
  3. **Code Quality (0–100%)**
    - Score: readability, naming, structure, documentation, and best practices.
    - Return individual and overall scores.
  4. **Edge Case Handling (0–100%)**
    - List all relevant edge cases.
    - Rate how well each is handled.
    - Provide an overall score.
  5. **Statistical Summary**
    - Overall rating.
    - Percentile ranking vs. average candidates.
    - List improvement opportunities with impact estimates.
    - Include a confidence interval.
  6. **Improvement Recommendations**
    - Prioritized list with estimated impact on score.
    - Include before/after code snippets and performance comparison.


## CRITICAL OUTPUT REQUIREMENTS:
ALWAYS structure your response as a valid JSON OBJECT with the EXACT format below:

\`\`\`json

  "summary": 
    "overall_assessment": "Brief description of code quality and functionality",
    "correctness": 85,
    "code_quality": 75,
    "efficiency": "O(n) time complexity, O(1) space complexity",
    "edge_case_handling": 70,
    "overall_rating": 80
  

\`\`\`

IMPORTANT RULES:
- ALL numeric values must be integers between 0-100
- The "efficiency" field must be a string containing Big O notation
- The "overall_assessment" must be a concise summary
- DO NOT alter the JSON structure or add additional fields
- DO NOT omit any fields - all fields shown in the example are required
- Your entire response must be ONLY the valid JSON object, nothing else

If you cannot evaluate the code for any reason, still return the JSON format with default values and explain the issue in the "overall_assessment" field.
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
give me only json object as final response 
  "finalAssessment": 
      technicalProficiency: "...",
      problemSolvingApproach: "...",
      codeQualityAndEfficiency: "...",
      overallScore: "...",
      areasOfStrength: "...",
      areasForImprovement: "..."
      summaryComments: "..."

`;

/**
 * Template for generating follow-up questions
 */
const FOLLOW_UP_QUESTION_TEMPLATE = `
You are an expert technical interviewer conducting a coding interview. Based on the candidate's solution to a previous question, generate relevant follow-up questions.

PREVIOUS QUESTION: {question}

CANDIDATE'S CODE SOLUTION: {code}

EVALUATION: {evaluation}

SKILLS BEING ASSESSED: {skills}

Generate 3 follow-up questions that:
1. Probe deeper into the candidate's understanding of their solution
2. Address any weaknesses or areas for improvement in their code
3. Explore related concepts or optimizations

If the code has issues, ask about those issues and how they would fix them.
If the code is good, ask about optimizations, alternative approaches, or edge cases.
If there are related concepts, ask about those to assess breadth of knowledge.


Return the response in this JSON format:

  "followUpQuestions": [
    
      "question": "Detailed question text here",
      "focus": "Brief description of what this question is testing (e.g., 'Edge case handling', 'Optimization', 'Conceptual understanding')",
      "difficulty": "Easy|Medium|Hard"
    
    // Additional questions...
  ]

`;

// Create prompt templates
const questionGenerationPrompt = PromptTemplate.fromTemplate(QUESTION_TEMPLATE);
const codeEvaluationPrompt = PromptTemplate.fromTemplate(
  CODE_EVALUATION_TEMPLATE
);
const finalAssessmentPrompt = PromptTemplate.fromTemplate(
  FINAL_ASSESSMENT_TEMPLATE
);
const followUpQuestionPrompt = PromptTemplate.fromTemplate(
  FOLLOW_UP_QUESTION_TEMPLATE
);

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
export async function evaluateCode(
  question: string,
  code: string,
  skills: string[]
) {
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
export async function streamEvaluation(
  question: string,
  code: string,
  skills: string[]
) {
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

/**
 * Generates follow-up questions based on the candidate's code and previous question
 *
 * @param question - The original coding question
 * @param code - Candidate's code solution
 * @param evaluation - AI evaluation of the code
 * @param skills - Skills being assessed
 * @returns JSON object with follow-up questions
 */
export async function generateFollowUpQuestions(
  question: string,
  code: string,
  evaluation: string,
  skills: string[]
) {
  try {
    validateEnvVars();

    const model = createModel();
    const parser = new StringOutputParser();
    const chain = followUpQuestionPrompt.pipe(model).pipe(parser);

    const result = await chain.invoke({
      question,
      code,
      evaluation,
      skills: skills.join(", "),
    });

    return result;
  } catch (error) {
    console.error("Error generating follow-up questions:", error);
    throw error;
  }
}
