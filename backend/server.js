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

  console.log("📩 Received text:", text);
  console.log("🔑 OPENAI_API_KEY loaded:", process.env.OPENAI_API_KEY ? "✅ YES" : "❌ NO");

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
          {
            role: "system",
            content: "You are a helpful assistant that generates MCQs.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    // Log the full OpenAI API response
    console.log("📤 OpenAI API response:", JSON.stringify(data, null, 2));

    // If OpenAI returns an error field
    if (data.error) {
      console.error("❌ OpenAI API Error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const output = JSON.parse(data.choices[0].message.content);
    res.json(output);
  } catch (err) {
    console.error("❗ Server Error:", err.message || err);
    res.status(500).json({ error: "Failed to generate MCQs" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
module.exports = app; // Export the app for testing purposes
// This allows the server to be imported in test files
// and helps in setting up tests without starting the server. 
// It is a common practice in Node.js applications to export the app instance.