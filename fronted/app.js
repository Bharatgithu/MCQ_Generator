const fileInput = document.getElementById("fileInput");
const extractedTextDiv = document.getElementById("extractedText");
const loadingText = document.getElementById("loadingText");

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  extractedTextDiv.textContent = "";
  loadingText.style.display = "block";
  loadingText.textContent = "Extracting text...";

  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = async function () {
      const image = reader.result;
      const result = await Tesseract.recognize(image, 'eng');
      const text = result.data.text;

      loadingText.textContent = "Generating questions from AI...";

      // Send to OpenAI
      const mcqs = await generateMCQsFromText(text);

      loadingText.style.display = "none";
      extractedTextDiv.textContent = "Generated MCQs:\n\n" + JSON.stringify(mcqs, null, 2);
    };
    reader.readAsDataURL(file);
  } else {
    loadingText.textContent = "PDF support coming soon. Use an image.";
  }
});

async function generateMCQsFromText(text) {
  const apiKey = "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"; // Replace with your API key

  const prompt = `Generate 5 multiple choice questions (MCQs) from the following text. Each question must include 1 correct and 3 incorrect options. Return the result as a JSON array of objects with fields: question, options[], answer.\n\nText:\n${text}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
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
    return output;
  } catch (err) {
    return ["Error parsing response: " + data.choices[0].message.content];
  }
}
