const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'https://mcqgenerater.netlify.app' }));
app.use(express.json());

app.post("/generate-mcqs", async (req, res) => {
  const { text } = req.body;

  console.log("📩 Received text:", text);
  console.log("🔑 HuggingFace Key present:", !!process.env.HF_API_KEY);

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/mrm8488/t5-base-finetuned-question-generation-ap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
      },
      body: JSON.stringify({ inputs: text }),
    });

    const data = await response.json();
    console.log("📦 HuggingFace raw response:", data);

    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    res.json(data);
  } catch (err) {
    console.error("🔥 Server Error:", err);
    res.status(500).json({ error: "Failed to generate MCQs" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
