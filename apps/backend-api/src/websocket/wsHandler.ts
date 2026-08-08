import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { sessionManager, ClientRole } from './sessionManager.js';

export function setupWebSocketHandler(wss: WebSocketServer): void {
    wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
        // Parse sessionId & role from URL: ws://localhost:4000?sessionId=xyz&role=mobile
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const sessionId = url.searchParams.get('sessionId');
        const role = url.searchParams.get('role') as ClientRole;

        if (!sessionId || (role !== 'extension' && role !== 'mobile')) {
            console.warn('[WebSocket] Rejected connection: missing sessionId or invalid role');
            ws.close(1008, 'Invalid params. Required: ?sessionId=...&role=extension|mobile');
            return;
        }

        // Register connection in session manager
        sessionManager.registerSocket(sessionId, role, ws);

        // Handle incoming messages
        ws.on('message', (message: Buffer | string) => {
            try {
                if (role === 'mobile') {
                    // Relay document payload from Mobile Phone directly to Chrome Extension
                    const success = sessionManager.relayToExtension(sessionId, message);

                    if (!success) {
                        ws.send(JSON.stringify({
                            type: 'ERROR',
                            message: 'Extension not connected. Please open Cyber Cafe extension on PC.'
                        }));
                    }
                }
            } catch (err) {
                console.error('[WebSocket] Error processing message:', err);
            }
        });

        // Handle disconnection
        ws.on('close', () => {
            sessionManager.unregisterSocket(sessionId, role);
        });

        // Handle socket errors
        ws.on('error', (err) => {
            console.error(`[WebSocket] Error on ${role} socket (${sessionId}):`, err);
            sessionManager.unregisterSocket(sessionId, role);
        });
    });

    console.log('⚡ [WebSocket] Real-time relay handler initialized.');
}
