import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey:"AIzaSyC3onP8p6_mXkRJTJWiRc1dN1vfuDEDg_0"});

async function callGemini() {
    console.log("function called")
  const interaction = await ai.interactions.create({
  model: "gemini-3.6-flash",
  input: "let me about you shelf",
});
console.log(interaction.output_text);
}

export default callGemini;

// export async function extractTextFromImage(image: File): Promise<string> {
//   const ai = new GoogleGenAI({apiKey:"AIzaSyC3onP8p6_mXkRJTJWiRc1dN1vfuDEDg_0"});

//   const interaction = await ai.interactions.create({
//     model: "gemini-3.6-flash",
//     input: "Extract the text from this image",
//     parts: [
//       {
//         inlineData: {
//           mimeType: image.type,
//           data: image,
//         },
//       },
//     ],
//   });

//   return interaction.output_text;
// }