import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "public");

const app = express();
const PORT = process.env.PORT || 5000;

/* --------------------------------------------------
   Middleware
-------------------------------------------------- */

app.use(cors());
app.use(express.json());

// Serve static assets from public folder at root and at /public
app.use(express.static(publicPath));
app.use("/public", express.static(publicPath));

/* --------------------------------------------------
   Environment-variable validation
-------------------------------------------------- */

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "GEMINI_API_KEY is missing from the environment variables."
  );
}

/* --------------------------------------------------
   Gemini client
-------------------------------------------------- */

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* --------------------------------------------------
   Role prompts
-------------------------------------------------- */

const ROLE_PROMPTS = {
  student: `
You are EduAssist, a friendly educational assistant for college students.

Rules:
1. Explain topics using simple language.
2. Use examples when necessary.
3. Give structured notes, viva questions and study plans.
4. Keep answers accurate, clear and reasonably concise.
5. Use headings and bullet points for longer answers.
6. Encourage the student without using overly complicated language.
`,

  teacher: `
You are an experienced college teacher.

Rules:
1. Explain every concept step by step.
2. Use simple classroom examples.
3. Ask short checking questions when useful.
4. Organize answers using headings and bullet points.
5. Clearly highlight definitions, advantages and examples.
6. Maintain a patient and professional teaching style.
`,

  programmer: `
You are a senior software developer and programming mentor.

Rules:
1. Provide correct and readable code.
2. Explain the logic in simple steps.
3. Mention the programming language being used.
4. Place all code inside code blocks.
5. Identify possible errors and suggest fixes.
6. Follow good coding practices.
7. Do not invent functions, libraries or syntax.
`,

  interviewer: `
You are a professional HR and technical interviewer.

Rules:
1. Conduct realistic interview practice.
2. Ask one question at a time during a mock interview.
3. Evaluate the user's response constructively.
4. Provide sample answers when requested.
5. Include behavioural, communication and role-related questions.
6. Maintain a formal but encouraging tone.
`,

  cloud: `
You are a senior cloud engineer specializing in AWS, Azure and cloud fundamentals.

Rules:
1. Explain cloud concepts using practical examples.
2. Compare services using tables when appropriate.
3. Mention security, scalability and cost considerations.
4. Provide step-by-step guidance for cloud tasks.
5. Clearly distinguish AWS, Azure and Google Cloud services.
6. Avoid claiming that cloud configurations are risk-free.
`,

  assignment: `
You are an academic assignment assistant.

Rules:
1. Write in simple, natural and student-friendly language.
2. Organize answers with proper headings and key points.
3. Follow any word limit or marks specified by the user.
4. Avoid unnecessary repetition.
5. Provide original explanations rather than copying text.
6. Do not present unverified information as factual.
`,
};

const DEFAULT_ROLE_PROMPT = ROLE_PROMPTS.student;

/* --------------------------------------------------
   Prompt-engineering technique prompts
-------------------------------------------------- */

const TECHNIQUE_PROMPTS = {
  "zero-shot": `
Use zero-shot prompting.

Answer the user's request directly without relying on any examples.
Use only the role instructions and the user's current request.
`,

  "one-shot": `
Use one-shot prompting.

Follow the response style shown in this example:

Example question:
What is artificial intelligence?

Example answer:
Artificial intelligence is the ability of a computer system to
perform tasks that normally require human intelligence, such as
learning, decision-making and understanding language.

Answer the user's actual request using a similarly simple,
clear and structured style.
`,

  "few-shot": `
Use few-shot prompting.

Follow the response style shown in these examples:

Example 1:
Question: What is IoT?
Answer: IoT is a network of physical devices that collect and
exchange data through the internet. A smart fitness watch is an
example.

Example 2:
Question: What is cloud computing?
Answer: Cloud computing provides servers, storage and software
through the internet instead of requiring users to maintain all
hardware locally.

Example 3:
Question: What is machine learning?
Answer: Machine learning allows computers to learn patterns from
data and improve predictions without being explicitly programmed
for every situation.

Answer the user's request using the same clear, direct and
example-based style.
`,

  "role-based": `
Use role-based prompting.

Follow the selected role strictly, including its responsibilities,
subject knowledge, response style and tone.
`,

  "structured-reasoning": `
Analyse the task carefully and provide a structured explanation.

Do not reveal hidden internal reasoning. Present only useful,
clear and verifiable steps.

When appropriate, organize the response as:

1. Given information
2. Relevant concept or method
3. Important steps
4. Final answer or conclusion
`,
};

const DEFAULT_TECHNIQUE_PROMPT =
  TECHNIQUE_PROMPTS["zero-shot"];

/* --------------------------------------------------
   Homepage route — fixes "Cannot GET /" on Vercel
-------------------------------------------------- */

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

/* --------------------------------------------------
   Favicon handler
-------------------------------------------------- */

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

/* --------------------------------------------------
   Health-check route
-------------------------------------------------- */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduAssist Gemini server is running.",
  });
});

/* --------------------------------------------------
   Chat API route
-------------------------------------------------- */

app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      role = "student",
      technique = "zero-shot",
    } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid question.",
      });
    }

    const cleanedMessage = message.trim();

    if (cleanedMessage.length > 4000) {
      return res.status(400).json({
        success: false,
        message:
          "Your question is too long. Please shorten it.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message:
          "The Gemini API key is not configured on the server.",
      });
    }

    const rolePrompt =
      ROLE_PROMPTS[role] ||
      DEFAULT_ROLE_PROMPT;

    const techniquePrompt =
      TECHNIQUE_PROMPTS[technique] ||
      DEFAULT_TECHNIQUE_PROMPT;

    const finalPrompt = `
CHATBOT ROLE INSTRUCTIONS:

${rolePrompt}

PROMPT ENGINEERING TECHNIQUE:

${techniquePrompt}

GENERAL RESPONSE RULES:

1. Answer the user's actual request.
2. Keep the response accurate and relevant.
3. Use Markdown headings, lists and tables when helpful.
4. Use simple language unless the user requests technical detail.
5. Clearly acknowledge uncertainty instead of inventing facts.

USER REQUEST:

${cleanedMessage}
`.trim();

    const client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";

    let response;
    try {
      response = await client.models.generateContent({
        model: modelName,
        contents: finalPrompt,
      });
    } catch (primaryErr) {
      console.warn(`Primary model (${modelName}) error: ${primaryErr?.message}. Falling back to gemini-3.5-flash.`);
      response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: finalPrompt,
      });
    }

    const reply = response.text?.trim();

    if (!reply) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    const rawError =
      error?.message ||
      "Unknown Gemini API error.";

    let userMessage =
      "EduAssist could not generate a response. Please try again.";

    if (
      rawError.includes("401") ||
      rawError.toLowerCase().includes("unauthenticated")
    ) {
      userMessage =
        "Gemini authentication failed. Check the GEMINI_API_KEY environment variable.";
    } else if (
      rawError.includes("429") ||
      rawError.toLowerCase().includes("quota")
    ) {
      userMessage =
        "The Gemini free API limit has been reached. Please wait and try again.";
    } else if (
      rawError.includes("404") ||
      rawError.toLowerCase().includes("not found") ||
      rawError.toLowerCase().includes("model")
    ) {
      userMessage =
        "The selected Gemini model is unavailable or not found. Check the model name.";
    }

    return res.status(500).json({
      success: false,
      message: userMessage,
    });
  }
});

/* --------------------------------------------------
   Catch-all fallback middleware (Express 5 compatible)
-------------------------------------------------- */

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      message: `API endpoint ${req.originalUrl} not found.`,
    });
  }
  res.sendFile(path.join(publicPath, "index.html"));
});

/* --------------------------------------------------
   Local server
-------------------------------------------------- */

app.listen(PORT, () => {
  console.log(
    `EduAssist is running at http://localhost:${PORT}`
  );
});

export default app;