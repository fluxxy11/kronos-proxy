// kronos.js - Full Backend Code

const express = require('express');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Enable JSON parsing
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    console.log("CORS Headers Set");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Rate limiting (to prevent abuse)
app.use('/api/kronos', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per 15 minutes
}));

// Main API route
app.post('/api/kronos', async (req, res) => {
    const { prompt, model } = req.body;
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

    console.log(`Incoming request: prompt="${prompt}", model="${model}"`);
    console.log(`Ollama URL: ${ollamaUrl}`);

    try {
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    max_tokens: 2000
                }
            })
        });

        const data = await response.json();
        console.log("Response from Ollama:", data);
        res.json(data);
    } catch (error) {
        console.error("Error connecting to Ollama:", error);
        res.status(500).json({ error: "Failed to connect to Ollama API" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Kronos Proxy running on port ${PORT}`);
});

// Export the app for testing (optional)
module.exports = app;
