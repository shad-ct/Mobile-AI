const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const port = 3001; // Port for our Express server
const host = '0.0.0.0';



app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

app.post("/api/generate", async (req, res) => {
  try {
    const { ipAddress, modelName, prompt } = req.body;
    const ollamaApiUrl = `http://${ipAddress}:11434/api/generate`;

    const ollamaResponse = await fetch(ollamaApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
        stream: false, // Express will handle streaming, so we'll get the full response
      }),
    });

    const data = await ollamaResponse.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching from Ollama:", error);
    res.status(500).json({ error: "Failed to connect to Ollama server" });
  }
});

app.listen(port, host, () => {
    console.log(`Express proxy server listening at http://${host}:${port}`);
});
