import { Request, Response } from 'express';
import { ephemeralQueueManager } from '../services/ephemeralQueue.js';
import { extractDocumentWithAI } from '../services/ai.service.js';
import { sessionManager } from '../websocket/sessionManager.js';

/**
 * Renders the public mobile upload web page for customers scanning the fixed operator QR code.
 */
export const renderMobileUploadPage = (req: Request, res: Response) => {
  const operatorId = req.params.operatorId || 'default';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Cafe Customer Document Upload</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col justify-between p-4">
  <div class="max-w-md w-full mx-auto space-y-6 pt-4">
    <!-- Header -->
    <div class="text-center space-y-2">
      <div class="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
      </div>
      <h1 class="text-xl font-bold text-white tracking-tight">Cyber Cafe Document Upload</h1>
      <p class="text-xs text-slate-400">Upload your documents directly to the Cyber Cafe operator's computer securely.</p>
    </div>

    <!-- Upload Form Card -->
    <div id="uploadCard" class="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      <!-- Customer Info -->
      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Your Full Name *</label>
          <input type="text" id="customerName" required placeholder="e.g. Rahul Kumar" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Mobile Number (Optional)</label>
          <input type="tel" id="customerPhone" placeholder="e.g. 9876543210" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
        </div>
      </div>

      <!-- File Drop Area -->
      <div>
        <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Attach Document (Aadhaar / Marksheet / Photo) *</label>
        <div id="dropZone" class="border-2 border-dashed border-slate-700 hover:border-orange-500/50 bg-slate-900/50 rounded-xl p-6 text-center cursor-pointer transition-colors space-y-2">
          <input type="file" id="fileInput" accept="image/*,application/pdf" class="hidden" />
          <svg class="w-8 h-8 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <p id="fileLabel" class="text-xs text-slate-300 font-medium">Tap to select or take photo of document</p>
          <p class="text-[10px] text-slate-500">Supports PDF, JPG, PNG up to 10MB</p>
        </div>
      </div>

      <!-- Error Box -->
      <div id="errorBox" class="hidden bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400"></div>

      <!-- Submit Button -->
      <button id="submitBtn" class="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl py-3 text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer">
        <span>Send Documents to Operator</span>
      </button>
    </div>

    <!-- Processing Screen -->
    <div id="processingCard" class="hidden bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 shadow-xl text-center space-y-4">
      <div class="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <h3 class="text-base font-bold text-white">Analyzing Document with AI...</h3>
      <p class="text-xs text-slate-400">Please keep this window open while AI extracts details for your operator.</p>
    </div>

    <!-- Success Screen -->
    <div id="successCard" class="hidden bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 shadow-xl text-center space-y-4">
      <div class="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center border border-emerald-500/30">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h3 class="text-lg font-bold text-white">Document Sent Successfully!</h3>
      <p class="text-xs text-slate-300">Your operator can now load your profile on their computer. Zero files are stored on server disk.</p>
      <button onclick="window.location.reload()" class="mt-2 text-xs text-orange-400 hover:text-orange-300 font-medium underline cursor-pointer">Upload Another Document</button>
    </div>
  </div>

  <!-- Footer Privacy Notice -->
  <div class="text-center text-[10px] text-slate-500 pt-6 pb-2">
    🔒 Zero Storage Ephemeral Transfer &bull; Document auto-deletes from RAM upon processing.
  </div>

  <script>
    const operatorId = "${operatorId}";
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileLabel = document.getElementById('fileLabel');
    const submitBtn = document.getElementById('submitBtn');
    const errorBox = document.getElementById('errorBox');
    let selectedFile = null;

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        selectedFile = e.target.files[0];
        fileLabel.innerText = "Selected: " + selectedFile.name;
      }
    });

    submitBtn.addEventListener('click', async () => {
      errorBox.classList.add('hidden');
      const customerName = document.getElementById('customerName').value.trim();
      const customerPhone = document.getElementById('customerPhone').value.trim();

      if (!customerName) {
        showError('Please enter your full name.');
        return;
      }
      if (!selectedFile) {
        showError('Please select a document to upload.');
        return;
      }

      document.getElementById('uploadCard').classList.add('hidden');
      document.getElementById('processingCard').classList.remove('hidden');

      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result.split(',')[1];
          const mimeType = selectedFile.type || 'application/pdf';

          const res = await fetch('/api/v1/public/queue/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              operatorId,
              customerName,
              customerPhone,
              fileBase64: base64,
              mimeType
            })
          });

          const data = await res.json();
          if (data.success) {
            document.getElementById('processingCard').classList.add('hidden');
            document.getElementById('successCard').classList.remove('hidden');
          } else {
            document.getElementById('processingCard').classList.add('hidden');
            document.getElementById('uploadCard').classList.remove('hidden');
            showError(data.error || 'Failed to upload document.');
          }
        };
        reader.readAsDataURL(selectedFile);
      } catch (err) {
        document.getElementById('processingCard').classList.add('hidden');
        document.getElementById('uploadCard').classList.remove('hidden');
        showError('Network error. Please try again.');
      }
    });

    function showError(msg) {
      errorBox.innerText = msg;
      errorBox.classList.remove('hidden');
    }
  </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};

/**
 * Handle mobile customer upload submission.
 */
export const handleCustomerUpload = async (req: Request, res: Response) => {
  try {
    const { operatorId, customerName, customerPhone, fileBase64, mimeType } = req.body;

    if (!operatorId || !customerName || !fileBase64) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: operatorId, customerName, or fileBase64.'
      });
    }

    // 1. Perform AI Extraction in RAM
    const aiResult = await extractDocumentWithAI(fileBase64, mimeType || 'application/pdf');

    // 2. Add item to Ephemeral RAM Queue
    const queueItem = ephemeralQueueManager.addItem({
      operatorId,
      customerName,
      customerPhone,
      extractedProfile: aiResult.extractedProfile,
      extractedFields: aiResult.extractedFields,
      rawText: aiResult.rawText
    });

    // 3. Notify connected operator extensions via WebSocket (if online)
    sessionManager.notifyOperatorQueueUpdate(operatorId, {
      type: 'NEW_CUSTOMER_QUEUE',
      item: {
        id: queueItem.id,
        operatorId: queueItem.operatorId,
        customerName: queueItem.customerName,
        customerPhone: queueItem.customerPhone,
        createdAt: queueItem.createdAt
      }
    });

    return res.status(200).json({
      success: true,
      queueId: queueItem.id,
      message: 'Document extracted and stored in temporary RAM queue successfully.'
    });
  } catch (err: any) {
    console.error('[Customer Upload Error]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to process document upload'
    });
  }
};

/**
 * Get pending ephemeral queue items for an operator.
 */
export const handleGetPendingQueue = async (req: Request, res: Response) => {
  const operatorId = (req.query.operatorId as string) || 'default';
  const items = ephemeralQueueManager.getPendingForOperator(operatorId);
  return res.status(200).json({
    success: true,
    items
  });
};

/**
 * Consume and auto-delete a queue item upon operator click.
 */
export const handleConsumeQueueItem = async (req: Request, res: Response) => {
  const { id, operatorId } = req.body;

  if (!id || !operatorId) {
    return res.status(400).json({
      success: false,
      error: 'Missing id or operatorId parameter.'
    });
  }

  const consumedItem = ephemeralQueueManager.consumeItem(id, operatorId);

  if (!consumedItem) {
    return res.status(440).json({
      success: false,
      error: 'Queue item expired or already consumed.'
    });
  }

  return res.status(200).json({
    success: true,
    item: consumedItem
  });
};
