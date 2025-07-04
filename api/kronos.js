// This was created by fluxxy do whatever idc

const express = require('express');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use((req, res, next) => {
    console.log("CORS Headers Set");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// rate limiting 
app.use('/api/kronos', rateLimit({
    windowMs: 15 * 60 * 1000, // basic math 15 times 60 so fifteen mins
    max: 100 // each ip can only send 100 requests
}));




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
                    temperature: 0.7, //change this to change the ai mood ig the higher the more less reliable or crazy it becomes
                    max_tokens: 2000 // u can change this
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



//start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Kronos Proxy running on port ${PORT}`); // console msg to let u know if it ran 

});
module.exports = app;
