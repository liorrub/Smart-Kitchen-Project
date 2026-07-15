"use strict";

// Gemini AI service — all Google AI calls go through this file.
// The API key is loaded from .env.example and never exposed to the frontend.

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelName = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const model = genAI.getGenerativeModel({ model: modelName });

console.log(`[gemini] API key loaded: ${process.env.GEMINI_API_KEY ? "yes" : "NO — GEMINI_API_KEY is missing"}`);
console.log(`[gemini] Using model: ${modelName}`);

// Sends a text prompt to Gemini and returns the raw response as a plain string.
// Throws on API error so the calling controller can pass it to next(error).
async function callGemini(prompt) {
    const result = await model.generateContent(prompt);
    return result.response.text();
}

// Sends a prompt and parses the response as JSON.
// Gemini sometimes wraps JSON in markdown code blocks — this strips them before parsing.
async function callGeminiJSON(prompt) {
    const raw = await callGemini(prompt);
    const cleaned = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/, "")
        .trim();
    return JSON.parse(cleaned);
}

module.exports = { callGemini, callGeminiJSON };
