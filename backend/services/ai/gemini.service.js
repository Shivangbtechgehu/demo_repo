const { GoogleGenerativeAI } = require('@google/generative-ai');
const { env } = require('../../config/env');

// Lazily initialise so the app still boots if the key is missing
let genAI = null;

function getClient() {
  if (!genAI) {
    if (!env.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }
    genAI = new GoogleGenerativeAI(env.geminiApiKey);
  }
  return genAI;
}

/**
 * Generate a structured career roadmap using Gemini.
 *
 * @param {object} input
 * @param {string} input.goalTitle
 * @param {string} input.targetRole
 * @param {string[]} input.matchedSkills   - skills the user already has
 * @param {string[]} input.missingSkills   - skills the user needs to acquire
 * @returns {Promise<{ overview: string, steps: Array, totalEstimatedDays: number }>}
 */
async function generateRoadmapWithGemini({ goalTitle, targetRole, matchedSkills, missingSkills }) {
  const client = getClient();
  const model  = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = buildPrompt({ goalTitle, targetRole, matchedSkills, missingSkills });

  const result   = await model.generateContent(prompt);
  const response = await result.response;
  const text     = response.text();

  return parseAiResponse(text, { goalTitle, targetRole, matchedSkills, missingSkills });
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt({ goalTitle, targetRole, matchedSkills, missingSkills }) {
  return `
You are a career coaching AI. Generate a detailed, personalised learning roadmap.

## Input
- Goal: "${goalTitle}"
- Target Role: "${targetRole}"
- Skills already known: ${matchedSkills.length > 0 ? matchedSkills.join(', ') : 'none'}
- Skills to learn: ${missingSkills.length > 0 ? missingSkills.join(', ') : 'none'}

## Instructions
Return ONLY valid JSON — no markdown, no explanation, no code fences.
The JSON must match this exact schema:

{
  "overview": "A 1-2 sentence summary of the roadmap.",
  "totalEstimatedDays": <integer>,
  "steps": [
    {
      "order": <integer starting at 1>,
      "title": "<concise step title>",
      "description": "<2-3 sentence explanation of what to do and why>",
      "estimatedDays": <integer>,
      "resources": ["<resource 1>", "<resource 2>", "<resource 3>"]
    }
  ]
}

## Rules
- Include 5–10 steps maximum.
- Each step must have 2–4 resources (course names, documentation links, or practice sites).
- totalEstimatedDays must equal the sum of all step estimatedDays.
- Focus on practical, actionable steps — not vague advice.
- Leverage the user's existing skills in at least one step.
- Address every missing skill with a dedicated step.
- End with an interview/portfolio preparation step.
- Return ONLY the JSON object, nothing else.
`.trim();
}

// ── Response parser ───────────────────────────────────────────────────────────

function parseAiResponse(text, fallbackInput) {
  // Strip any accidental markdown fences Gemini sometimes adds
  const cleaned = text
    .replace(/^```(?:json)?/m, '')
    .replace(/```$/m, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('[Gemini] Failed to parse response as JSON. Raw text:', text.slice(0, 300));
    throw new Error('AI returned an invalid response. Using fallback.');
  }

  // Validate minimum required fields
  if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
    throw new Error('AI response missing steps array. Using fallback.');
  }

  // Normalise — make sure all required fields exist on each step
  const steps = parsed.steps.map((step, idx) => ({
    order:         step.order         ?? idx + 1,
    title:         String(step.title  ?? `Step ${idx + 1}`).trim(),
    description:   String(step.description ?? '').trim(),
    estimatedDays: Number(step.estimatedDays) || 3,
    resources:     Array.isArray(step.resources) ? step.resources.map(String) : [],
  }));

  const totalEstimatedDays = steps.reduce((sum, s) => sum + s.estimatedDays, 0);

  return {
    overview:          String(parsed.overview ?? `A personalised learning plan for becoming a ${fallbackInput.targetRole}.`).trim(),
    steps,
    totalEstimatedDays,
  };
}

module.exports = { generateRoadmapWithGemini };
