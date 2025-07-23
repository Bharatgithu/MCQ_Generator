const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://mcqgenerater.netlify.app'
}));

app.use(express.json());

app.post("/generate-mcqs", async (req, res) => {
  const { text } = req.body;

  const prompt = `Generate 5 multiple choice questions (MCQs) from the following text. Each question must include 1 correct and 3 incorrect options. Return the result as a JSON array of objects with fields: question, options[], answer.\n\nText:\n${text}`;

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-large", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HF_API_KEY}`, // HuggingFace key
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const data = await response.json();

    // Model may return plain text
    const generatedText = data[0]?.generated_text || "";
    res.json({ mcqs: generatedText });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Failed to generate MCQs" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
