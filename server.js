import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";

const app = express();
app.set("trust proxy", 1);
const port = process.env.PORT || 10000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || false
}));

app.use(express.json({ limit: "20kb" }));

app.use("/api/", rateLimit({
  windowMs: 60 * 1000,
  limit: 15
}));

app.get("/", (req, res) => {
  res.send("JARVIS AI backend is online.");
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please send a message."
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: "Message is too long."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "AI service is not configured yet."
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions:
        "You are JARVIS, a helpful, friendly AI assistant. " +
        "Answer clearly and concisely. Never claim to have performed " +
        "actions on the user's device. Ask for confirmation before " +
        "any consequential action. Do not provide unsafe instructions.",
      input: message
    });

    res.json({
      reply: response.output_text || "I couldn't generate a reply."
    });
  } catch (error) {
    console.error("JARVIS error:", error.message);
    res.status(500).json({
      error: "JARVIS had a problem. Please try again."
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`JARVIS backend running on port ${port}`);
});
