const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HF_API_URL = "https://api-inference.huggingface.co/models/valhalla/t5-small-qg-prepend";

app.use(cors());
app.use(express.json());

app.post("/generate-mcqs", async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Text input is required" });
  }

  console.log("📩 Received text:", text);
  console.log("🔑 HuggingFace Key present:", !!process.env.HF_API_KEY);

  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
      },
      body: JSON.stringify({ inputs: text }),
    });

    const raw = await response.text();

    // Check if response is JSON
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("❌ Invalid JSON from HuggingFace:", raw);
      return res.status(500).json({ error: "Invalid response from model (not JSON)" });
    }

    // If there's an error from HuggingFace
    if (data.error) {
      console.error("❌ HuggingFace Error:", data.error);
      return res.status(500).json({ error: data.error });
    }

    console.log("✅ HuggingFace Response:", data);

    res.json({
      mcqs: data,
      raw: raw
    });
  } catch (err) {
    console.error("🔥 Server Error:", err);
    res.status(500).json({ error: "Failed to generate MCQs" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
