const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/generate-mcqs", async (req, res) => {
  const { text } = req.body;

  const prompt = `Generate 5 multiple choice questions (MCQs) from the following text. Each question must include 1 correct and 3 incorrect options. Return the result as a JSON array of objects with fields: question, options[], answer.\n\nText:\n${text}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that generates MCQs." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    try {
  const output = JSON.parse(data.choices[0].message.content);
  res.json(output);
} catch (parseErr) {
  console.error("Failed to parse OpenAI response:", data.choices[0].message.content);
  res.status(500).json({ error: "Invalid JSON from OpenAI", raw: data.choices[0].message.content });
}
    if (!response.ok) {
        throw new Error(`OpenAI API error: ${data.error.message}`);
        }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to generate MCQs" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
