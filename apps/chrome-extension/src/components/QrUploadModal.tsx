import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-qr-code';
import { QrCode, Smartphone, X, Copy, Check, RefreshCw, UserCheck, Inbox, Clock, ShieldCheck } from 'lucide-react';
import type { StoredDocument } from '../types';
import { saveTempExtractedFieldsSync, getTempExtractedFieldsAsync } from '../services/storage';

interface PendingQueueItem {
  id: string;
  operatorId: string;
  customerName: string;
  customerPhone?: string;
  createdAt: number;
}

interface QrUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocsReceived?: (newDocs: StoredDocument[]) => void;
  onNotify?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const QrUploadModal: React.FC<QrUploadModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [operatorId] = useState<string>('operator_01');
  const [localIpHost, setLocalIpHost] = useState<string>('localhost:4000');
  const [copied, setCopied] = useState<boolean>(false);
  const [pendingQueue, setPendingQueue] = useState<PendingQueueItem[]>([]);
  const [isConsuming, setIsConsuming] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_API_URL || `http://${localIpHost}`;
  const fixedMobileQrUrl = `${backendUrl}/upload/${operatorId}`;

  // Fetch pending customer queue items from ephemeral RAM queue
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/queue/pending?operatorId=${operatorId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setPendingQueue(data.items);
        }
      }
    } catch (err) {
      console.warn('[Queue fetch error]', err);
    }
  }, [backendUrl, operatorId]);

  useEffect(() => {
    if (!isOpen) return;

    fetchQueue();
    const interval = setInterval(fetchQueue, 3000); // 3s polling fallback

    // WebSocket real-time notification setup
    const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = backendUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${wsHost}?sessionId=${operatorId}&role=extension`;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NEW_CUSTOMER_QUEUE') {
            onNotify?.('info', 'New Customer Upload! 📱', `Received document from ${payload.item.customerName}`);
            fetchQueue();
          }
        } catch (e) {}
      };
    } catch (err) {}

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [isOpen, fetchQueue, backendUrl, operatorId, onNotify]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fixedMobileQrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify?.('info', 'Link Copied', 'Fixed Operator QR URL copied to clipboard.');
  };

  const handleConsumeItem = async (itemId: string, customerName: string) => {
    setIsConsuming(itemId);
    try {
      const res = await fetch(`${backendUrl}/api/v1/queue/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, operatorId })
      });

      const data = await res.json();
      if (data.success && data.item && data.item.extractedProfile) {
        // Save extracted profile to temp extracted fields storage
        const currentProfile = await getTempExtractedFieldsAsync();
        const updatedProfile = {
          ...currentProfile,
          ...data.item.extractedProfile
        };
        saveTempExtractedFieldsSync(updatedProfile);

        // Remove consumed item from state list immediately
        setPendingQueue((prev) => prev.filter((q) => q.id !== itemId));

        onNotify?.('success', `Loaded ${customerName}! 📄`, 'Customer profile loaded into Master Vault. Ready to auto-fill form!');
      } else {
        onNotify?.('error', 'Failed to load profile', data.error || 'Queue item expired.');
      }
    } catch (err: any) {
      onNotify?.('error', 'Network Error', err.message || 'Could not connect to backend.');
    } finally {
      setIsConsuming(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative space-y-5">
        
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
            Fixed Operator Desk QR Code
          </h3>
          <p className="text-xs text-slate-500">
            Print or display this QR code at your desk. Customers scan it with their phone camera to send documents directly to your computer queue.
          </p>
        </div>

        {/* Fixed QR Code & Queue Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          
          {/* Permanent Fixed QR Code */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
            <div className="bg-white p-3 rounded-xl inline-block border border-slate-200 shadow-xs">
              <QRCode value={fixedMobileQrUrl} size={140} />
            </div>
            <div className="text-[11px] font-medium text-slate-600">
              Desk QR Code &bull; <span className="font-mono text-orange-600">{operatorId}</span>
            </div>
          </div>

          {/* Incoming Customer Live Queue */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3 min-h-[190px] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <Inbox className="w-4 h-4 text-orange-400" />
                <span>Customer Queue</span>
              </div>
              <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/30">
                {pendingQueue.length} Pending
              </span>
            </div>

            {/* Queue List */}
            <div className="space-y-2 overflow-y-auto max-h-[130px] pr-1">
              {pendingQueue.length === 0 ? (
                <div className="text-center py-6 space-y-1 text-slate-500">
                  <Smartphone className="w-6 h-6 mx-auto text-slate-600" />
                  <p className="text-xs font-medium">Waiting for customers to scan QR...</p>
                </div>
              ) : (
                pendingQueue.map((item) => (
                  <div key={item.id} className="bg-slate-800 border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between">
                    <div className="space-y-0.5 text-left">
                      <div className="text-xs font-bold text-white flex items-center space-x-1">
                        <span>{item.customerName}</span>
                      </div>
                      {item.customerPhone && (
                        <div className="text-[10px] text-slate-400 font-mono">📱 {item.customerPhone}</div>
                      )}
                      <div className="text-[9px] text-slate-500 flex items-center space-x-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{Math.round((Date.now() - item.createdAt) / 1000)}s ago</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleConsumeItem(item.id, item.customerName)}
                      disabled={isConsuming === item.id}
                      className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-[11px] transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1 shrink-0"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>{isConsuming === item.id ? 'Loading...' : 'Load & Fill'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Zero DB Storage (RAM Only)</span>
              </span>
              <button onClick={fetchQueue} className="text-orange-400 hover:text-orange-300">
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Upload Link & Copy */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            Public Upload Link
          </label>
          <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-xl p-2 text-xs">
            <input
              type="text"
              value={localIpHost}
              onChange={(e) => setLocalIpHost(e.target.value)}
              placeholder="e.g. 10.228.67.37:4000"
              className="bg-white border border-slate-300 rounded px-2 py-0.5 text-slate-800 outline-none font-mono text-[11px] w-36"
            />
            <input
              type="text"
              readOnly
              value={fixedMobileQrUrl}
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

      </div>
    </div>
  );
};
