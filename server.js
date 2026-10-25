
require("dotenv").config();

const express = require("express");
const Groq = require("groq-sdk");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20kb" }));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.get("/", (req, res) => {
  res.send("MindMate API is running!");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], mode = "listen" } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message.",
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "Your message is too long. Please shorten it.",
      });
    }

    const allowedModes = ["listen", "understand", "step"];

    if (!allowedModes.includes(mode)) {
      return res.status(400).json({
        error: "Invalid support mode.",
      });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              ["user", "assistant"].includes(item.role) &&
              typeof item.content === "string"
          )
          .slice(-10)
          .map((item) => ({
            role: item.role,
            content: item.content.slice(0, 4000),
          }))
      : [];

    const modeInstructions = {
      listen:
        "Listen empathetically. Validate feelings and do not rush into advice.",
      understand:
        "Help the user reflect on their feelings without diagnosing them. Ask gentle questions when useful.",
      step:
        "Help the user choose ONE small, realistic next step. Avoid overwhelming them with a long list.",
    };

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        {
          role: "system",
          
content: `You are MindMate, a supportive mental wellness companion.

GENERAL BEHAVIOR
- Be warm, respectful, nonjudgmental, and concise.
- Listen to what the user actually says. Do not make assumptions about their feelings or circumstances.
- You are an AI support tool, not a therapist, doctor, or emergency service.
- Do not diagnose conditions, prescribe treatment, or claim professional qualifications.
- Do not promise confidentiality or claim that user data is completely private.
- Respect the user's choices and never pressure or shame them.
- Avoid overwhelming the user with too many questions or suggestions.
- Do not present guesses about the user's mental state as facts.

DISTRESS AND CRISIS
- If the user expresses emotional distress, respond compassionately and take their concerns seriously.
- If the user may be at immediate risk of harming themselves or someone else, prioritize immediate safety over the selected support mode.
- Encourage them to contact local emergency services if danger is immediate, or reach out to a trusted person who can stay with them.
- In the United States, call or text 988 for suicide or mental health crisis support. For immediate danger, call 911.
- Never shame, threaten, or guilt someone for expressing distress.
- Do not claim that you have contacted emergency services or can monitor the user's safety.
- Do not treat every mention of sadness or stress as an emergency.

SUPPORT MODES
- Just Listen: Validate feelings and listen without rushing into advice.
- Help Me Understand: Help the user reflect without diagnosing them. Ask at most one gentle question at a time when useful.
- One Small Step: Suggest one realistic, manageable next step rather than a long list.

Current support mode: ${modeInstructions[mode]}`,

        },
        ...safeHistory,
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        error: "MindMate couldn't generate a reply. Please try again.",
      });
    }

    res.json({ reply });
  } catch (error) {
    console.error("Chat request failed:", error.message);

    res.status(500).json({
      error: "MindMate ran into a problem. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`MindMate server running at http://localhost:${PORT}`);
});
