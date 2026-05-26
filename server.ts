import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// REST API for AI Budget Suggestions & Spending Analysis
app.post("/api/ai-suggestions", async (req, res) => {
  try {
    const {
      wifeBalance,
      husbandBalance,
      sharedBalance,
      transactions,
      savingsGoals,
      budgets,
    } = req.body;

    // Check if Gemini is configured, otherwise fallback to a lovely smart engine
    const ai = getGeminiClient();

    if (!ai) {
      // Elegant soft luxury themed fallback advisor calculations
      const totalSpend = (transactions || [])
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

      const categorySpends: { [key: string]: number } = {};
      (transactions || []).forEach((t: any) => {
        if (t.type === "expense") {
          categorySpends[t.category] = (categorySpends[t.category] || 0) + Number(t.amount || 0);
        }
      });

      let highestCat = "Other";
      let maxSpend = 0;
      Object.entries(categorySpends).forEach(([cat, s]) => {
        if (s > maxSpend) {
          maxSpend = s;
          highestCat = cat;
        }
      });

      const fallbackResponse = {
        analysis: `We've analyzed your joint money spaces as a couple! Right now, you are maintaining a lovely joint "Our Money" space balance of ${sharedBalance || 0} Birr with individual "My Money" spaces of ${wifeBalance || 0} Birr (Wife) and ${husbandBalance || 0} Birr (Husband). Your total Money Out is sitting at ${totalSpend} Birr. You are working together beautifully, though optimizing your highest spending zone (${highestCat}) can help you reach your Dream Goals faster!`,
        recommendations: [
          `Save an extra 10% next month by setting a collaborative spending plan limit on "${highestCat}".`,
          "Consider moving 5% of your individual Money Spaces to the Shared Balance on payday to cover romantic date nights.",
          "Check progress of your active Dream Goals! Contributing even 150 Birr weekly will trigger celebrations soon.",
        ],
        highestSpendingCategory: highestCat,
        tips: [
          "Traditional Buna Date: Set aside one evening a week to make traditional coffee at home, enjoy popcorn, and talk about your shared Dream Goals beautifully with YeEgna.",
          "The 'We Check-in' Rule: For any personal purchase over 1000 Birr, do a sweet quick check-in with your partner first.",
          "Celebrate Milestones: When you hit 50% of any Dream Goal, have a small cupcake-and-tea toast to your combined efforts!",
        ],
        isFallback: true,
      };

      return res.json(fallbackResponse);
    }

    // Build couples-oriented, soft/cute romantic budget analysis prompt
    const prompt = `
      You are the friendly, cute luxury couples money advisor integrated inside the "YeEgna" couple finance app.
      Analyze the Ethiopian couple's current state:
      - Wife's Money Space: ${wifeBalance} Birr
      - Husband's Money Space: ${husbandBalance} Birr
      - Joint (Our Money) Space: ${sharedBalance} Birr
      - Money Activities: ${JSON.stringify(transactions || [])}
      - Dream Goals: ${JSON.stringify(savingsGoals || [])}
      - Spending Plans: ${JSON.stringify(budgets || [])}

      Provide your analysis inside a JSON response. Use Ethiopian Birr (Birr) as the currency. Ensure the tone is very encouraging, elegant, warm, romantic, cute, and clear, with a luxury touch. Simplify term descriptions using:
      - 'Money Activities' instead of 'transactions' or 'ledger'
      - 'Money In' instead of 'income'
      - 'Money Out' instead of 'expenses'
      - 'Spending Plan' instead of 'budget'
      - 'Our Money' and 'My Money' spaces instead of 'wallets'
      - 'Dream Goals' instead of 'savings goals'
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an encouraging, highly polished, cute couple financial planner bot. Always use Birr currency. Return actionable spending plan advice and sweet money tips. Use exact JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.STRING,
              description: "A cute, warm, and romantic summary paragraph analyzing their couples' financial safety, teamwork, offline harmony, and goals progress using 'Birr'.",
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly actionable recommendations specifically customized in Birr, advising on category spending or their active spending plans.",
            },
            highestSpendingCategory: {
              type: Type.STRING,
              description: "The name of the category with the highest money out (e.g. Food, Transport, Shopping).",
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 adorable romantic money tips for the couple using simple concepts (e.g., coffee dates, sharing targets, sweet check-ins).",
            },
          },
          required: ["analysis", "recommendations", "highestSpendingCategory", "tips"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text from Gemini API.");
    }
    const resultObj = JSON.parse(resultText.trim());
    return res.json({ ...resultObj, isFallback: false });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Could not generate AI insights at this time.",
      details: error.message,
    });
  }
});

// Setup Vite Dev server middleware or static directory serve
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve index.html and static files built in /dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
