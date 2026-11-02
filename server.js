import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();

app.set("trust proxy", 1);
const port = process.env.PORT || 10000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || false
}));

app.use(express.json({ limit: "20kb" }));

app.use("/api/", rateLimit({
  windowMs: 60 * 1000,
  limit: 30
}));

app.get("/", (req, res) => {
  res.send("JARVIS free command engine is online.");
});

function jarvisCommand(message) {
  const command = message.toLowerCase().trim();

  if (/^(hi|hello|hey)( jarvis)?$/.test(command)) {
    return "Hello! I am JARVIS. How can I help you?";
  }

  if (command.includes("who are you")) {
    return "I am JARVIS, your personal command-based assistant.";
  }

  if (command.includes("your name")) {
    return "My name is JARVIS.";
  }

  if (command.includes("time")) {
    return "The current time is " +
      new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata"
      });
  }

  if (command.includes("date") || command.includes("today")) {
    return "Today's date is " +
      new Date().toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata"
      });
  }

  if (command.includes("open youtube")) {
    return "Open YouTube: https://www.youtube.com";
  }

  if (command.includes("open google")) {
    return "Open Google: https://www.google.com";
  }

  if (command.includes("help") || command.includes("commands")) {
    return "I can greet you, tell the time and date, open YouTube and Google, and perform simple calculations.";
  }

  const math = command.match(
    /^calculate\s+(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/
  );

  if (math) {
    const a = Number(math[1]);
    const operator = math[2];
    const b = Number(math[3]);

    if (operator === "/" && b === 0) {
      return "Division by zero is not allowed.";
    }

    let result;

    switch (operator) {
      case "+": result = a + b; break;
      case "-": result = a - b; break;
      case "*": result = a * b; break;
      case "/": result = a / b; break;
    }

    return "The answer is " + result;
  }

  return "Sorry, I don't know that command yet. Say HELP to see my commands.";
}

app.post("/api/chat", (req, res) => {
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

  res.json({
    reply: jarvisCommand(message)
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`JARVIS backend running on port ${port}`);
});
