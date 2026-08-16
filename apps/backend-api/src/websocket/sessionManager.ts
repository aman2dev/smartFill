import { WebSocket } from 'ws';

export type ClientRole = 'extension' | 'mobile';

export interface SessionSockets {
    extension?: WebSocket;
    mobile?: WebSocket;
    createdAt: number;
}

class SessionManager {
    // In-memory map to store sockets by sessionId
    private sessions = new Map<string, SessionSockets>();

    constructor() {
        // Periodically clean up stale sessions every 10 minutes
        setInterval(() => this.cleanupStaleSessions(), 10 * 60 * 1000);
    }

    /**
     * Registers a socket connection (extension or mobile) for a given sessionId.
     */
    public registerSocket(sessionId: string, role: ClientRole, ws: WebSocket): void {
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, { createdAt: Date.now() });
        }

        const session = this.sessions.get(sessionId)!;
        session[role] = ws;

        console.log(`[SessionManager] Registered ${role} for session: ${sessionId}`);

        // If both extension and mobile are connected, inform both
        if (session.extension && session.mobile) {
            this.notifySessionStatus(sessionId, 'PAIR_CONNECTED');
        }
    }

    /**
     * Unregisters a socket on disconnect.
     */
    public unregisterSocket(sessionId: string, role: ClientRole): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        if (session[role]) {
            delete session[role];
            console.log(`[SessionManager] Unregistered ${role} for session: ${sessionId}`);
        }

        // Clean up empty sessions
        if (!session.extension && !session.mobile) {
            this.sessions.delete(sessionId);
        }
    }

    /**
     * Relays a message from the mobile phone directly to the Chrome extension socket.
     */
    public relayToExtension(sessionId: string, data: string | Buffer): boolean {
        const session = this.sessions.get(sessionId);
        if (!session || !session.extension) {
            console.warn(`[SessionManager] No extension connected for session: ${sessionId}`);
            return false;
        }

        if (session.extension.readyState === WebSocket.OPEN) {
            session.extension.send(data);
            console.log(`[SessionManager] Relayed document data to extension for session: ${sessionId}`);
            return true;
        }

        return false;
    }

    /**
     * Sends status notifications (e.g., PAIR_CONNECTED, DISCONNECTED) to clients.
     */
    private notifySessionStatus(sessionId: string, event: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        const payload = JSON.stringify({ type: 'SYSTEM_EVENT', event, sessionId });

        if (session.extension?.readyState === WebSocket.OPEN) {
            session.extension.send(payload);
        }
        if (session.mobile?.readyState === WebSocket.OPEN) {
            session.mobile.send(payload);
        }
    }

    /**
     * Notifies all extension sockets associated with an operatorId about a new customer upload.
     */
    public notifyOperatorQueueUpdate(operatorId: string, payload: any): void {
        const messageStr = JSON.stringify(payload);
        for (const [sessionId, session] of this.sessions.entries()) {
            if (sessionId === operatorId || sessionId.includes(operatorId)) {
                if (session.extension?.readyState === WebSocket.OPEN) {
                    session.extension.send(messageStr);
                }
            }
        }
    }

    /**
     * Removes sessions older than 30 minutes to prevent memory leaks.
     */
    private cleanupStaleSessions(): void {
        const NOW = Date.now();
        const MAX_AGE = 30 * 60 * 1000; // 30 minutes

        for (const [sessionId, session] of this.sessions.entries()) {
            if (NOW - session.createdAt > MAX_AGE) {
                session.extension?.close();
                session.mobile?.close();
                this.sessions.delete(sessionId);
                console.log(`[SessionManager] Cleaned up expired session: ${sessionId}`);
            }
        }
    }
}

export const sessionManager = new SessionManager();
