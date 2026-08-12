/**
 * AI provider router.
 *
 * Current providers:
 *   'fallback' (default) — template-based rule engine, no external calls
 *
 * To plug in Gemini or OpenAI later:
 *   1. Create services/ai/gemini.service.js
 *   2. Add a case below for AI_PROVIDER=gemini
 *   3. No other files need to change
 *
 * This function ALWAYS resolves and NEVER throws.
 * The caller always receives the same output contract:
 * {
 *   roadmapTitle:       string,
 *   estimatedDuration:  string,
 *   milestones:         object[],
 *   overview:           string,
 *   steps:              object[],
 *   totalEstimatedDays: number,
 *   aiProvider:         string,
 *   usedFallback:       boolean,
 * }
 */

const { buildFallbackRoadmap } = require('./fallback.service');

async function generateRoadmap(input) {
  // Only the fallback provider is active — no external calls, no keys needed
  const result = buildFallbackRoadmap(input);

  return {
    ...result,
    aiProvider:   'fallback',
    usedFallback: true,
  };
}

module.exports = { generateRoadmap };
