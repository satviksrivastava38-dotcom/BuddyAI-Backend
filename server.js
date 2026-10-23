import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "https://satviksrivastava38-dotcom.github.io")
  .split(",").map(v => v.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  }
}));
app.use(express.json({ limit: "32kb" }));
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_MODEL || "gpt-6-astra";

app.get("/health", (_req, res) => res.json({ ok: true, service: "Buddy.AI OpenAI backend" }));
app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "Server is missing OPENAI_API_KEY." });
    const messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: "Send at least one message." });
    const safeMessages = messages.slice(-16).map(m => {
      const role = m?.role === "assistant" ? "assistant" : "user";
      const content = typeof m?.content === "string" ? m.content.trim().slice(0, 6000) : "";
      return { role, content };
    }).filter(m => m.content);
    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return res.status(400).json({ error: "The last message must be a user message." });
    }
    const response = await openai.responses.create({
      model,
      instructions: "You are Buddy, a helpful assistant inside Buddy.AI, a productivity workspace. Be accurate, friendly, clear, and useful. Ask a brief clarifying question when needed. For schoolwork, teach the reasoning and encourage learning. Never claim to have changed the user's app data unless a tool actually did so.",
      input: safeMessages.map(m => ({ role: m.role, content: m.content }))
    });
    const reply = String(response.output_text || "").trim();
    if (!reply) return res.status(502).json({ error: "The AI returned no text. Please try again." });
    return res.json({ reply });
  } catch (error) {
    console.error("OpenAI request error:", error?.status || "", error?.message || error);
    const status = error?.status === 429 ? 429 : 502;
    return res.status(status).json({ error: status === 429 ? "AI usage limit reached. Please wait and try again." : "The AI request failed. Check backend logs and API billing/model access." });
  }
});
app.listen(port, () => console.log(`Buddy.AI AI backend listening on ${port}`));
