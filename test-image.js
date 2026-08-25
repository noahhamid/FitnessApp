import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("Missing GEMINI_API_KEY in .env.local");

const ai = new GoogleGenAI({ apiKey });

const prompt = `Cinematic editorial fitness photography, dark industrial gym setting — near-black background, charcoal gym equipment, rubber flooring. High-contrast low-key lighting with warm golden/amber rim light on skin and metal. Single frame showing two sequential positions of the same muscular athlete performing a barbell back squat: standing position on one side, bottom-of-squat position on the other, connected by a clean warm-gold directional arrow indicating the movement path. Shallow depth of field, subject-forward composition. No text except the directional arrow. 4:3 or 3:4 portrait, 1000x1200px minimum.`;

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash-image",
  contents: prompt,
});

for (const part of response.candidates[0].content.parts) {
  if (part.inlineData) {
    fs.writeFileSync("squat-test.png", Buffer.from(part.inlineData.data, "base64"));
    console.log("Saved squat-test.png");
  }
}