
import { GoogleGenAI, Type } from "@google/genai";
import { Quote, VisualTheme, AppLanguage } from '../types';

export const generateCuratedContent = async (
  timeOfDay: string,
  theme: VisualTheme,
  language: AppLanguage,
  videoContext?: string,
  excludeSource?: string,
  mode?: string
): Promise<{ quote: Quote; recommendedTheme: string } | null> => {
  // Always obtain the API key exclusively from process.env.API_KEY.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found, using offline fallback.");
    return null;
  }

  // Create a new GoogleGenAI instance right before making an API call to ensure it uses the correct key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const langPrompt = language === 'tr' ? 'Turkish' : language === 'nl' ? 'Dutch' : 'English';

  const prompt = `
    You are a spiritual content curator for a dynamic wallpaper app.
    Current Time: ${timeOfDay}.
    User Theme Preference: ${theme}.
    Current Video Context: ${videoContext || 'General atmosphere'}.
    Previously Shown Quote Source: ${excludeSource || 'None'}.
    Current Audio Mode: ${mode || 'general'}.
    Target Language: ${langPrompt}.

    Task:
    1. Select a highly inspiring, short quote. **MAXIMUM 16 WORDS**. This is a strict constraint.
    2. If Audio Mode is 'dua', strictly provide a short supplication (Dua) or prayer from the Sunnah or Quranic Duas.
    3. If Audio Mode is 'quran', provide a Quran verse.
    4. Otherwise, match the quote to the Current Video Context (e.g. if video is mountains, choose verses about stability/creation; if water, about mercy/life).
    5. IMPORTANT: Do NOT repeat the quote from the source "${excludeSource}". Choose something different.
    6. Recommend a visual theme that fits the mood.
    7. Ensure the text is in ${langPrompt}.

    Output as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: {
              type: Type.OBJECT,
              properties: {
                text_ar: { type: Type.STRING, description: "Arabic text if Quran/Hadith/Dua, else empty string." },
                text_en: { type: Type.STRING, description: `The quote text in ${langPrompt}. Max 16 words.` },
                source: { type: Type.STRING, description: "Source of the quote (e.g. Surah Name 1:1 or 'Prophetic Dua')." },
                type: { type: Type.STRING, enum: ['quran', 'hadith', 'quote', 'dua'] }
              },
              required: ['text_en', 'source', 'type']
            },
            recommendedTheme: { 
                type: Type.STRING, 
                enum: ['nature', 'mountain', 'water', 'night', 'space', 'micro'] 
            }
          }
        }
      }
    });

    // Directly access the .text property from GenerateContentResponse.
    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("Gemini curation failed:", error);
    return null;
  }
};
