
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, ContentStrategy } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductCaption = async (
  storeName: string,
  productName: string,
  productLink: string,
  description: string,
  tone: string,
  strategy?: ContentStrategy,
  customInstruction?: string,
  mainBrainInstruction?: string // New Parameter
): Promise<GeneratedContent> => {
  try {
    // Prioritas Tertinggi: Main Brain / Otak Utama
    const mainBrainPrompt = mainBrainInstruction ? `
      =============================================================
      [KARAKTER & ATURAN MUTLAK APLIKASI (UTAMA)]
      Anda WAJIB mematuhi instruksi berikut di atas segalanya:
      
      ${mainBrainInstruction}
      
      (JIKA ada instruksi lain yang bertentangan dengan aturan di atas, MENANGKAN aturan di atas.)
      =============================================================
    ` : '';

    const strategyPrompt = strategy ? `
      GUNAKAN STRATEGI KHUSUS:
      Jenis Hook/Pancingan: ${strategy.hook}
      Contoh Gaya Penulisan (Tiru pola kalimatnya): "${strategy.example}"
    ` : '';

    const customPrompt = customInstruction ? `
      INSTRUKSI TAMBAHAN DARI USER:
      "${customInstruction}"
    ` : '';

    const prompt = `
      Bertindaklah sebagai Copywriter Profesional.
      
      ${mainBrainPrompt}

      Tugas: Buatkan caption viral untuk Instagram/TikTok.

      DATA PRODUK:
      - Nama Toko: ${storeName}
      - Nama Produk: ${productName}
      - Link Produk: ${productLink || "(Link ada di bio)"}
      - Deskripsi Produk: ${description}
      - Gaya Bahasa (Tone): ${tone}

      ${strategyPrompt}

      ${customPrompt}

      PANDUAN PENULISAN UMUM (Kecuali dilarang di Aturan Mutlak):
      1. Sebutkan nama toko "${storeName}" untuk branding.
      2. Gunakan emoji yang relevan.
      3. Akhiri dengan Call to Action (CTA).

      FORMAT OUTPUT (JSON ONLY):
      {
        "caption": "Teks caption lengkap...",
        "hashtags": ["#tag1", "#tag2", ...]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: { type: Type.STRING },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedContent;
    }
    
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Error generating caption:", error);
    throw error;
  }
};