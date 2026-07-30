/// <reference types="vite/client" />

import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// Helper to convert Blob or File object (Image or PDF) to Base64 in the browser
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Extracts structured JSON data from an image or PDF file (or public asset).
 * Gemini natively supports PNG, JPEG, WEBP, and PDF files.
 * 
 * @param documentInput Optional File object (Image/PDF) or asset URL path
 */
async function main(documentInput?: File | string) {
  try {
    console.log("Processing document with Gemini...");
    let base64Data = "";
    let mimeType = "application/pdf";

    if (documentInput instanceof File) {
      base64Data = await blobToBase64(documentInput);
      mimeType = documentInput.type || (documentInput.name.endsWith('.pdf') ? 'application/pdf' : 'image/png');
    } else {
      // Fetch public asset in browser
      const assetPath = typeof documentInput === 'string' ? documentInput : "/fakeId.pdf";
      const res = await fetch(assetPath);
      const blob = await res.blob();
      base64Data = await blobToBase64(blob);
      mimeType = blob.type || (assetPath.endsWith('.pdf') ? 'application/pdf' : 'image/png');
    }

    console.log(`Sending file [${typeof documentInput === 'string' ? documentInput : '/fakeId.pdf'}] with MIME type [${mimeType}] to Gemini...`);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: "Extract all user personal and document information (such as Full Name, Email, Phone Number, Date of Birth, Father's Name, Aadhaar/PAN/ID number, Address, Qualification/Marks) from this document (Image or PDF) and return strictly a valid JSON object.",
            },
          ],
        },
      ],
    });

    console.log("Gemini Output:", response.text);
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export default main;