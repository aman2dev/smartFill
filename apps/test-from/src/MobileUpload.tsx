import React, { useState, useEffect } from 'react';
import {
  Upload,
  CheckCircle2,
  FileText,
  Camera,
  ShieldCheck,
  Zap,
  AlertCircle
} from 'lucide-react';

interface MobileUploadProps {
  sessionIdFromUrl?: string;
}

export const MobileUpload: React.FC<MobileUploadProps> = ({ sessionIdFromUrl }) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; type: string; status: 'uploading' | 'sent' }>>([]);

  useEffect(() => {
    // Extract sessionId from URL query params or prop
    const params = new URLSearchParams(window.location.search);
    const id = sessionIdFromUrl || params.get('sessionId') || '';
    setSessionId(id);

    if (!id) {
      setConnectionState('error');
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4000';
    const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = backendUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${wsHost}?sessionId=${id}&role=mobile`;

    console.log('[Mobile WebSocket Connecting]', wsUrl);
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setConnectionState('connected');
        console.log('[Mobile WebSocket Connected] Session:', id);
      };

      socket.onmessage = (event) => {
        console.log('[Mobile WS Message]', event.data);
      };

      socket.onerror = (err) => {
        console.error('[Mobile WS Error]', err);
        setConnectionState('error');
      };

      socket.onclose = () => {
        console.log('[Mobile WS Disconnected]');
        setConnectionState('disconnected');
      };

      setWs(socket);
    } catch (err) {
      console.error('[Mobile WS Init Error]', err);
      setConnectionState('error');
    }

    return () => {
      if (socket) socket.close();
    };
  }, [sessionIdFromUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docCategory: string) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !ws || ws.readyState !== WebSocket.OPEN) {
      alert('Not connected to Cyber Cafe PC. Please scan QR code again.');
      return;
    }

    Array.from(files).forEach((file) => {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      
      setUploadedFiles((prev) => [
        ...prev,
        { id: fileId, name: file.name, type: docCategory, status: 'uploading' }
      ]);

      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64Data = evt.target?.result as string;

        // Construct WebSocket message payload
        const payload = JSON.stringify({
          type: 'DOC_UPLOAD',
          sessionId,
          docType: docCategory,
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          size: file.size,
          dataUrl: base64Data
        });

        // Send binary / base64 document directly over WebSocket to PC!
        ws.send(payload);

        setUploadedFiles((prev) =>
          prev.map((item) => (item.id === fileId ? { ...item, status: 'sent' } : item))
        );
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '16px' }}>
      
      {/* Mobile Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', borderRadius: '16px', padding: '20px', marginBottom: '16px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={24} color="#fff" />
            <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>smartFill Mobile</span>
          </div>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
            Cyber Cafe Direct Sync
          </span>
        </div>

        <p style={{ fontSize: '0.85rem', opacity: 0.95, margin: 0, lineHeight: 1.4 }}>
          Upload your documents directly to the Cyber Cafe operator's PC for instant form filling.
        </p>

        {/* Connection Status Badge */}
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: connectionState === 'connected' ? '#22c55e' : connectionState === 'connecting' ? '#eab308' : '#ef4444' }} />
          <span>
            {connectionState === 'connected'
              ? `Connected to PC (${sessionId})`
              : connectionState === 'connecting'
              ? 'Connecting to Cyber Cafe PC...'
              : 'Disconnected. Scan QR again.'}
          </span>
        </div>
      </div>

      {!sessionId ? (
        <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px solid #334155' }}>
          <AlertCircle size={40} color="#f97316" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Invalid or Missing Session</h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Please scan the QR code displayed on the Cyber Cafe PC screen to connect your phone.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Upload Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Slot 1: Passport Photo */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Camera size={20} color="#f97316" />
                  <div>
                    <strong style={{ fontSize: '0.95rem', display: 'block' }}>Passport Size Photo</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Recent color photo (.jpg / .png)</span>
                  </div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#f97316', color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}>
                <Camera size={16} /> Take Photo / Select File
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileUpload(e, 'Passport Photo')} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Slot 2: Signature */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={20} color="#f97316" />
                  <div>
                    <strong style={{ fontSize: '0.95rem', display: 'block' }}>Candidate Signature</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Black/Blue ink signature photo</span>
                  </div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#3b82f6', color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}>
                <Upload size={16} /> Upload Signature
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'Signature')} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Slot 3: Marksheet / Certificates */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={20} color="#f97316" />
                  <div>
                    <strong style={{ fontSize: '0.95rem', display: 'block' }}>Marksheets & Certificates</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>10th, 12th, Graduation (PDF/Image)</span>
                  </div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#10b981', color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}>
                <Upload size={16} /> Select Marksheets (Multiple)
                <input type="file" accept="image/*,.pdf" multiple onChange={(e) => handleFileUpload(e, 'Marksheet')} style={{ display: 'none' }} />
              </label>
            </div>

          </div>

          {/* Uploaded Items List */}
          {uploadedFiles.length > 0 && (
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#10b981" /> Sent to Cyber Cafe PC ({uploadedFiles.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {uploadedFiles.map((file) => (
                  <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <FileText size={14} color="#f97316" />
                      <span style={{ fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name}
                      </span>
                    </div>
                    {file.status === 'sent' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 700, fontSize: '0.75rem' }}>
                        <CheckCircle2 size={14} /> Sent
                      </span>
                    ) : (
                      <span style={{ color: '#eab308', fontSize: '0.75rem' }}>Sending...</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', padding: '12px', fontSize: '0.75rem', color: '#64748b' }}>
            🔒 End-to-end WebSocket stream. Direct transfer to operator's browser.
          </div>

        </div>
      )}

    </div>
  );
};
