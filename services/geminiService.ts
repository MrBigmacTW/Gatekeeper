import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const SYSTEM_PROMPT = `
You are the "Viral Gatekeeper," a merciless AI engine trained on millions of viral short videos (TikTok, Reels, Shorts). Your job is to predict the performance of a video before it is posted.
Analyze the uploaded video frame-by-frame and audio-wave-by-wave.

Analysis Protocol:
1. **The 3-Second Hook**: Check for immediate movement, clear subject, and audio hooks.
2. **Retention & Pacing**: Check for dragging moments, silence, or static frames.
3. **The Traffic Light System**: Evaluate Visual Hook, Audio/Music, Information Density, Subtitle/Text, and Emotional Trigger.
4. **Qualitative Insights**: Identify the "X-Factor" (viral potential) and the "Killer" (why people scroll away).

**CRITICAL INSTRUCTION ON RETENTION GRAPH**:
You must be BRUTAL and REALISTIC. The average user has zero patience.
- **The "Scroll-Away" Drop**: 60% of videos lose 50% of viewers in the first 3 seconds. Unless the start is explosive, show a steep drop immediately.
- **The Mid-Video Dip**: If the pacing slows down even for 1 second, drop the retention by 10-20%.
- **Do not** generate optimistic, flat lines or gentle slopes. Real retention graphs look like jagged cliffs.
- Only give high retention (>60% at end) if the video is truly exceptional (top 1% quality).

Return the result purely in the specified JSON format.
Language: Provide all text analysis in Traditional Chinese (繁體中文).
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    totalScore: { type: Type.NUMBER, description: "A score from 0-100 predicting viral potential." },
    verdict: { type: Type.STRING, enum: ["PASS", "FAIL"], description: "Overall pass/fail based on viral potential." },
    scrollAwayRate: { type: Type.STRING, enum: ["High", "Medium", "Low"], description: "Predicted scroll-away rate." },
    threeSecondVerdict: { type: Type.STRING, description: "Short punchy verdict on the first 3 seconds." },
    metrics: {
      type: Type.OBJECT,
      properties: {
        visualHook: { type: Type.STRING, enum: ["GREEN", "YELLOW", "RED"] },
        visualHookReason: { type: Type.STRING },
        audio: { type: Type.STRING, enum: ["GREEN", "YELLOW", "RED"] },
        audioReason: { type: Type.STRING },
        infoDensity: { type: Type.STRING, enum: ["GREEN", "YELLOW", "RED"] },
        infoDensityReason: { type: Type.STRING },
        subtitle: { type: Type.STRING, enum: ["GREEN", "YELLOW", "RED"] },
        subtitleReason: { type: Type.STRING },
        emotionalTrigger: { type: Type.STRING, enum: ["GREEN", "YELLOW", "RED"] },
        emotionalTriggerReason: { type: Type.STRING }
      },
      required: ["visualHook", "visualHookReason", "audio", "audioReason", "infoDensity", "infoDensityReason", "subtitle", "subtitleReason", "emotionalTrigger", "emotionalTriggerReason"]
    },
    retentionGraph: {
      type: Type.ARRAY,
      description: "Estimated retention percentage at key moments (e.g., 0s, 3s, 5s, 10s, End). Be pessimistic.",
      items: {
        type: Type.OBJECT,
        properties: {
          second: { type: Type.STRING, description: "Time label, e.g., '0s', '3s'" },
          percentage: { type: Type.NUMBER, description: "Retention percentage 0-100" }
        }
      }
    },
    qualitative: {
      type: Type.OBJECT,
      properties: {
        xFactor: { type: Type.STRING, description: "The unique highlight of the video." },
        killer: { type: Type.STRING, description: "The specific mistake killing reach." },
        actionableAdvice: { type: Type.STRING, description: "Specific advice to fix the video." }
      },
      required: ["xFactor", "killer", "actionableAdvice"]
    }
  },
  required: ["totalScore", "verdict", "scrollAwayRate", "threeSecondVerdict", "metrics", "retentionGraph", "qualitative"]
};

// Approximate pricing for Gemini 1.5 Flash (per 1M tokens)
// Input: $0.075
// Output: $0.30
const PRICING = {
  inputPerMillion: 0.075,
  outputPerMillion: 0.30
};

export const analyzeVideo = async (file: File): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Convert file to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:video/mp4;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: "Analyze this video for viral potential on TikTok/Reels."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const result = JSON.parse(text) as AnalysisResult;

    // Calculate usage and cost
    if (response.usageMetadata) {
      const promptTokens = response.usageMetadata.promptTokenCount || 0;
      const candidatesTokens = response.usageMetadata.candidatesTokenCount || 0;
      const totalTokens = response.usageMetadata.totalTokenCount || 0;

      const inputCost = (promptTokens / 1000000) * PRICING.inputPerMillion;
      const outputCost = (candidatesTokens / 1000000) * PRICING.outputPerMillion;
      const totalCost = inputCost + outputCost;

      result.tokenUsage = {
        promptTokens,
        candidatesTokens,
        totalTokens,
        estimatedCost: totalCost.toFixed(6) // Display with high precision as it's very low
      };
    }

    return result;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};