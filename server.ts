import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client with required User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// AI Insights endpoint
app.post('/api/gemini/insights', async (req, res) => {
  try {
    const { summary, companyName } = req.body;
    if (!summary) {
      return res.status(400).json({ error: 'Missing summary data in request body.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in the server environment (GEMINI_API_KEY).',
      });
    }

    const company = (companyName || '').trim() || 'KartKing';
    const prompt = `You are a Principal E-Commerce Data Analyst and Business Strategist evaluating performance for "${company}", a prominent Indian e-commerce brand/marketplace.
Analyze the following aggregated metrics and business summary (in INR):

AGGREGATED DATA SUMMARY:
${JSON.stringify(summary, null, 2)}

Provide an executive analytical breakdown tailored to "${company}" in the Indian e-commerce landscape (considering festivals like Diwali/Dhanteras/Republic Day, tier 1/2/3 logistics, UPI penetration, category dynamics, and return rates).

Respond strictly with valid JSON following this exact structure:
{
  "insights": [
    {
      "title": "Short punchy insight title",
      "metric": "Key metric or percentage involved",
      "observation": "Detailed explanation of what the numbers reveal, why it happened, and the business implication.",
      "severity": "positive" | "warning" | "neutral"
    }
  ],
  "recommendations": [
    {
      "priority": "High" | "Medium" | "Low",
      "action": "Clear actionable operational or marketing decision",
      "impact": "Expected outcome on revenue, retention, or margin",
      "timeline": "e.g. Immediate (Next 14 Days) / Q3 2025"
    }
  ],
  "executiveSummary": "A 2-3 sentence high-level overview summarizing business health and trajectory."
}

Ensure there are exactly 5 business insights and exactly 3 recommended actions. Return valid JSON only, no markdown fencing, no extra text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(rawText.trim());
    } catch {
      // Fallback in case of code blocks
      const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(clean);
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI insights:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate insights from Gemini API.',
    });
  }
});

// AI Q&A endpoint
app.post('/api/gemini/ask', async (req, res) => {
  try {
    const { query, summary, companyName } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Missing question in request body.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in the server environment.',
      });
    }

    const company = (companyName || '').trim() || 'KartKing';
    const prompt = `You are the Lead Data Analyst for "${company}", an Indian e-commerce marketplace/brand.
A business stakeholder has asked the following analytical question:
"${query}"

Here is the current aggregated dashboard dataset (covering the filtered scope):
${JSON.stringify(summary, null, 2)}

Instructions:
1. Ground your answer strictly in the provided aggregated statistics for ${company} (revenue, AOV, return rates, regional delivery times, category performance, customer segments).
2. Contextualize with realistic Indian e-commerce context where helpful (e.g., festive seasons, Cash on Delivery vs UPI trends, Metro vs Non-metro fulfillment).
3. If the data does not directly contain a specific detail, state what the closest available data reveals and provide logical analyst inferences.
4. Structure your response clearly with bullet points, highlighted metrics (in INR lakhs/crores or percentages), and a concise takeaway. Keep it under 250 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error answering question with Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Failed to query Gemini API.',
    });
  }
});

// In development, hook up Vite middleware; in production, serve built files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
