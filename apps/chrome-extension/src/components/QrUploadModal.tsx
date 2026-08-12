import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { QrCode, Smartphone, X, Copy, Check, RefreshCw } from 'lucide-react';
import type { StoredDocument } from '../types';
import { saveTempCustomerDocs, getTempCustomerDocsAsync } from '../services/storage';

interface QrUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocsReceived?: (newDocs: StoredDocument[]) => void;
  onNotify?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const QrUploadModal: React.FC<QrUploadModalProps> = ({
  isOpen,
  onClose,
  onDocsReceived,
  onNotify,
}) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'received'>('disconnected');
  const [receivedCount, setReceivedCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  

  const generateNewSession = () => {
    const newId = 'sess_' + Math.random().toString(36).substring(2, 9);
    setSessionId(newId);
    setReceivedCount(0);
    setWsStatus('connecting');
    return newId;
  };

  useEffect(() => {
    if (!isOpen) return;

    const currentSessionId = generateNewSession();
    const backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4000';
    
  

    const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = backendUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${wsHost}?sessionId=${currentSessionId}&role=extension`;

    console.log('[WebSocket Connecting]', wsUrl);
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsStatus('connected');
        console.log('[WebSocket Connected] Extension listening for session:', currentSessionId);
      };

      ws.onmessage = async (event) => {
        try {
          if (typeof event.data !== 'string') return;
          const payload = JSON.parse(event.data);

          if (payload.type === 'SYSTEM_EVENT' && payload.event === 'PAIR_CONNECTED') {
            onNotify?.('info', 'Customer Phone Connected 📱', 'Customer scanned the QR code!');
            return;
          }

          if (payload.type === 'DOC_UPLOAD' || payload.docName || payload.dataUrl) {
            const docName = payload.fileName || payload.docName || 'Customer_Document.jpg';
            const fileType = payload.mimeType?.includes('pdf') || docName.endsWith('.pdf') ? 'pdf' : 'image/jpeg';
            const base64Data = payload.dataUrl || payload.data || '';

            const newDoc: StoredDocument = {
              id: `qr-doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: docName,
              type: payload.docType || 'Customer Upload',
              fileType: fileType as any,
              sizeBytes: payload.size || base64Data.length || 1024,
              dataUrl: base64Data.startsWith('data:') ? base64Data : `data:${fileType};base64,${base64Data}`,
              uploadDate: new Date().toISOString(),
              status: 'processed',
              confidenceScore: 99,
              extractedFields: [],
            };

            const existingDocs = await getTempCustomerDocsAsync();
            const updatedDocs = [...existingDocs, newDoc];
            await saveTempCustomerDocs(updatedDocs);

            setReceivedCount((prev) => prev + 1);
            setWsStatus('received');
            onDocsReceived?.(updatedDocs);
            onNotify?.('success', 'Document Received! 📄', `Received "${docName}" from customer's phone.`);
          }
        } catch (err) {
          console.error('[WebSocket Payload Error]', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('[WebSocket Error]', err);
        setWsStatus('disconnected');
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
      };
    } catch (err) {
      console.error('[WebSocket Init Failed]', err);
      setWsStatus('disconnected');
    }

    return () => {
      if (ws) ws.close();
    };
  }, [isOpen]);

  const [localIpHost, setLocalIpHost] = useState<string>('10.228.67.37:5173');

  if (!isOpen) return null;

  // Direct Mobile Web Upload URL
  const mobileUploadUrl = `http://${localIpHost}/upload?sessionId=${sessionId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mobileUploadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify?.('info', 'Link Copied', 'Mobile upload URL copied to clipboard.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Customer Mobile QR Upload
          </h3>
          <p className="text-xs text-slate-500">
            Ask customer to scan this QR code with their phone camera to upload documents directly to your PC.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3">
          <div className="bg-white p-4 rounded-xl inline-block border border-slate-200 shadow-xs">
            {sessionId ? (
              <QRCode value={mobileUploadUrl} size={180} />
            ) : (
              <div className="w-[180px] h-[180px] flex items-center justify-center text-slate-400">
                Generating QR...
              </div>
            )}
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center justify-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                wsStatus === 'connected' || wsStatus === 'received'
                  ? 'bg-emerald-500 animate-pulse'
                  : wsStatus === 'connecting'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-xs font-semibold text-slate-700">
              {wsStatus === 'connected'
                ? 'Ready! Waiting for customer scan...'
                : wsStatus === 'received'
                ? `Received ${receivedCount} file(s) from phone!`
                : wsStatus === 'connecting'
                ? 'Connecting to WebSocket...'
                : 'WebSocket Disconnected'}
            </span>
          </div>
        </div>

        {/* Mobile Upload Link & Copy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              PC Local IP & Port
            </label>
            <div className="flex items-center space-x-1 text-[10px]">
              <button
                onClick={() => setLocalIpHost('10.228.67.37:5173')}
                className={`px-1.5 py-0.5 rounded ${localIpHost.endsWith(':5173') ? 'bg-orange-500 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}
              >
                :5173 (App)
              </button>
              <button
                onClick={() => setLocalIpHost('10.228.67.37:4000')}
                className={`px-1.5 py-0.5 rounded ${localIpHost.endsWith(':4000') ? 'bg-orange-500 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}
              >
                :4000 (API)
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-xl p-2 text-xs">
            <input
              type="text"
              value={localIpHost}
              onChange={(e) => setLocalIpHost(e.target.value)}
              placeholder="e.g. 10.228.67.37:5173"
              className="bg-white border border-slate-300 rounded px-2 py-0.5 text-slate-800 outline-none font-mono text-[11px] w-36"
            />
            <input
              type="text"
              readOnly
              value={mobileUploadUrl}
              className="bg-transparent flex-1 text-slate-600 truncate outline-none font-mono text-[10px]"
            />
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-semibold border border-slate-300 transition-colors flex items-center space-x-1 cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Refresh Session Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <Smartphone className="w-4 h-4 text-orange-500" />
            <span>Session: <strong className="font-mono text-slate-800">{sessionId}</strong></span>
          </div>
          <button
            onClick={() => generateNewSession()}
            className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New QR</span>
          </button>
        </div>

      </div>
    </div>
  );
};
