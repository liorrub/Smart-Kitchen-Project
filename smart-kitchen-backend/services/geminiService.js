"use strict";

// Gemini AI service — all Google AI calls go through this file.
// The API key is loaded from .env and never exposed to the frontend.

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// gemini-1.5-flash: fast, free-tier compatible
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Sends a text prompt to Gemini and returns the response as a plain string.
// Throws on API error so the calling controller can pass it to next(error).
async function callGemini(prompt) {
    const result = await model.generateContent(prompt);
    return result.response.text();
}

module.exports = { callGemini };
