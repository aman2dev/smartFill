/// <reference types="vite/client" />

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
 * Sends an image or PDF file (or asset URL) to the backend API endpoint (/api/v1/extract-document)
 * for secure Gemini AI document parsing.
 * 
 * @param documentInput Optional File object (Image/PDF) or asset URL path
 */
async function main(documentInput?: File | string) {
  try {
    console.log("Preparing document for backend AI processing...");
    let base64Data = "";
    let mimeType = "application/pdf";
    let fileName = "document.pdf";

    if (documentInput instanceof File) {
      base64Data = await blobToBase64(documentInput);
      mimeType = documentInput.type || (documentInput.name.endsWith('.pdf') ? 'application/pdf' : 'image/png');
      fileName = documentInput.name;
    } else {
      const assetPath = typeof documentInput === 'string' ? documentInput : "/fakeId.pdf";
      const res = await fetch(assetPath);
      const blob = await res.blob();
      base64Data = await blobToBase64(blob);
      mimeType = blob.type || (assetPath.endsWith('.pdf') ? 'application/pdf' : 'image/png');
      fileName = assetPath.split('/').pop() || "fakeId.pdf";
    }

    console.log(`Sending file [${fileName}] (${mimeType}) to Backend API...`);

    const apiUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/api/v1/extract-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileBase64: base64Data,
        mimeType,
        fileName
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Backend Document Extraction Output:", data);
    return JSON.stringify(data.extractedProfile || data);
  } catch (error) {
    console.error("Backend Document Extraction Error:", error);
    throw error;
  }
}

export default main;